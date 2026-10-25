import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
// @ts-expect-error type error without @types/node package
import process from "node:process";
// @ts-expect-error type error without @types/node package
import path from "node:path";
// @ts-expect-error type error without @types/node package
import fs from "node:fs";

const host = process.env.TAURI_DEV_HOST;

interface SqliteRowRecord {
  [key: string]: unknown;
}

interface SqliteStatement {
  run: (...params: unknown[]) => void;
  all: (...params: unknown[]) => SqliteRowRecord[];
}

interface SqliteDatabaseHandle {
  exec: (sql: string) => void;
  query: (sql: string) => SqliteStatement;
}

/**
 * Embedded SQLite3 Relational Database Engine Plugin for Vite + Bun.
 * Persists all tables (including `users`, `warehouses`, `suppliers`, `products`,
 * `purchase_requests`, `purchase_orders`, `goods_receipts`, `inventory_balances`,
 * `inventory_movements`, and `audit_logs`) into a real SQLite3 file on disk:
 * `database/cafe_stock.sqlite`.
 */
function sqliteDatabasePlugin(): Plugin {
  let db: SqliteDatabaseHandle | null = null;
  const dbDir = path.resolve(import.meta.dirname, "./database");
  const dbFilePath = path.resolve(dbDir, "cafe_stock.sqlite");

  const initDatabase = async (): Promise<SqliteDatabaseHandle | null> => {
    if (db) {
      return db;
    }
    try {
      if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
      }
      const bunSqliteModuleName = "bun:sqlite";
      const mod = (await import(/* @vite-ignore */ bunSqliteModuleName)) as {
        Database: new (filename: string) => SqliteDatabaseHandle;
      };
      const handle = new mod.Database(dbFilePath);
      handle.exec(`
        PRAGMA journal_mode = WAL;
        PRAGMA foreign_keys = ON;

        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          username TEXT NOT NULL UNIQUE,
          email TEXT NOT NULL UNIQUE,
          role TEXT NOT NULL,
          password_hash TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'ACTIVE',
          created_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS warehouses (
          id TEXT PRIMARY KEY,
          code TEXT NOT NULL UNIQUE,
          name TEXT NOT NULL,
          location TEXT NOT NULL,
          is_active INTEGER NOT NULL DEFAULT 1
        );

        CREATE TABLE IF NOT EXISTS suppliers (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          email TEXT NOT NULL,
          phone TEXT NOT NULL,
          is_active INTEGER NOT NULL DEFAULT 1
        );

        CREATE TABLE IF NOT EXISTS products (
          id TEXT PRIMARY KEY,
          sku TEXT NOT NULL UNIQUE,
          name TEXT NOT NULL,
          unit TEXT NOT NULL,
          min_stock INTEGER NOT NULL DEFAULT 0,
          category TEXT NOT NULL,
          is_active INTEGER NOT NULL DEFAULT 1
        );

        CREATE TABLE IF NOT EXISTS purchase_requests (
          id TEXT PRIMARY KEY,
          request_number TEXT NOT NULL UNIQUE,
          warehouse_id TEXT NOT NULL,
          status TEXT NOT NULL,
          created_by TEXT NOT NULL,
          created_at TEXT NOT NULL,
          notes TEXT,
          items_json TEXT NOT NULL DEFAULT '[]'
        );

        CREATE TABLE IF NOT EXISTS purchase_orders (
          id TEXT PRIMARY KEY,
          po_number TEXT NOT NULL UNIQUE,
          purchase_request_id TEXT NOT NULL,
          supplier_id TEXT NOT NULL,
          warehouse_id TEXT NOT NULL,
          status TEXT NOT NULL,
          created_by TEXT NOT NULL,
          created_at TEXT NOT NULL,
          items_json TEXT NOT NULL DEFAULT '[]'
        );

        CREATE TABLE IF NOT EXISTS goods_receipts (
          id TEXT PRIMARY KEY,
          gr_number TEXT NOT NULL UNIQUE,
          purchase_order_id TEXT NOT NULL,
          received_by TEXT NOT NULL,
          received_at TEXT NOT NULL,
          items_json TEXT NOT NULL DEFAULT '[]'
        );

        CREATE TABLE IF NOT EXISTS inventory_balances (
          warehouse_id TEXT NOT NULL,
          product_id TEXT NOT NULL,
          stock INTEGER NOT NULL DEFAULT 0,
          PRIMARY KEY (warehouse_id, product_id)
        );

        CREATE TABLE IF NOT EXISTS inventory_movements (
          id TEXT PRIMARY KEY,
          warehouse_id TEXT NOT NULL,
          product_id TEXT NOT NULL,
          movement_type TEXT NOT NULL,
          reference_id TEXT NOT NULL,
          quantity INTEGER NOT NULL,
          created_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS audit_logs (
          id TEXT PRIMARY KEY,
          entity TEXT NOT NULL,
          entity_id TEXT NOT NULL,
          action TEXT NOT NULL,
          performed_by TEXT NOT NULL,
          timestamp TEXT NOT NULL,
          details TEXT
        );
      `);
      db = handle;
      return db;
    } catch {
      return null;
    }
  };

  return {
    name: "cafe-stock-sqlite3-engine",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url ?? "";
        if (!url.startsWith("/api/sqlite/")) {
          next();
          return;
        }

        const handle = await initDatabase();
        res.setHeader("Content-Type", "application/json");

        if (!handle) {
          res.statusCode = 503;
          res.end(
            JSON.stringify({ ok: false, error: "SQLite engine unavailable" }),
          );
          return;
        }

        const readBody = (): Promise<string> =>
          new Promise((resolve) => {
            let body = "";
            req.on("data", (chunk: unknown) => {
              body += String(chunk);
            });
            req.on("end", () => resolve(body));
          });

        if (req.method === "GET" && url.startsWith("/api/sqlite/snapshot")) {
          const users = handle
            .query("SELECT * FROM users ORDER BY created_at ASC")
            .all()
            .map((r) => ({
              id: String(r.id),
              name: String(r.name),
              username: String(r.username),
              email: String(r.email),
              role: String(r.role),
              passwordHash: String(r.password_hash),
              status: String(r.status ?? "ACTIVE"),
              createdAt: String(r.created_at),
            }));

          const warehouses = handle
            .query("SELECT * FROM warehouses")
            .all()
            .map((r) => ({
              id: String(r.id),
              code: String(r.code),
              name: String(r.name),
              location: String(r.location),
              isActive: Number(r.is_active) === 1,
            }));

          const suppliers = handle
            .query("SELECT * FROM suppliers")
            .all()
            .map((r) => ({
              id: String(r.id),
              name: String(r.name),
              email: String(r.email),
              phone: String(r.phone),
              isActive: Number(r.is_active) === 1,
            }));

          const products = handle
            .query("SELECT * FROM products")
            .all()
            .map((r) => ({
              id: String(r.id),
              sku: String(r.sku),
              name: String(r.name),
              unit: String(r.unit),
              minStock: Number(r.min_stock),
              category: String(r.category),
              isActive: Number(r.is_active) === 1,
            }));

          const purchaseRequests = handle
            .query("SELECT * FROM purchase_requests ORDER BY created_at DESC")
            .all()
            .map((r) => ({
              id: String(r.id),
              requestNumber: String(r.request_number),
              warehouseId: String(r.warehouse_id),
              status: String(r.status),
              createdBy: String(r.created_by),
              createdAt: String(r.created_at),
              notes: r.notes ? String(r.notes) : undefined,
              items: JSON.parse(String(r.items_json || "[]")) as unknown[],
            }));

          const purchaseOrders = handle
            .query("SELECT * FROM purchase_orders ORDER BY created_at DESC")
            .all()
            .map((r) => ({
              id: String(r.id),
              poNumber: String(r.po_number),
              purchaseRequestId: String(r.purchase_request_id),
              supplierId: String(r.supplier_id),
              warehouseId: String(r.warehouse_id),
              status: String(r.status),
              createdBy: String(r.created_by),
              createdAt: String(r.created_at),
              items: JSON.parse(String(r.items_json || "[]")) as unknown[],
            }));

          const goodsReceipts = handle
            .query("SELECT * FROM goods_receipts ORDER BY received_at DESC")
            .all()
            .map((r) => ({
              id: String(r.id),
              grNumber: String(r.gr_number),
              purchaseOrderId: String(r.purchase_order_id),
              receivedBy: String(r.received_by),
              receivedAt: String(r.received_at),
              items: JSON.parse(String(r.items_json || "[]")) as unknown[],
            }));

          const inventoryBalances = handle
            .query("SELECT * FROM inventory_balances")
            .all()
            .map((r) => ({
              warehouseId: String(r.warehouse_id),
              productId: String(r.product_id),
              stock: Number(r.stock),
            }));

          const inventoryMovements = handle
            .query("SELECT * FROM inventory_movements ORDER BY created_at DESC")
            .all()
            .map((r) => ({
              id: String(r.id),
              warehouseId: String(r.warehouse_id),
              productId: String(r.product_id),
              movementType: String(r.movement_type),
              referenceId: String(r.reference_id),
              quantity: Number(r.quantity),
              createdAt: String(r.created_at),
            }));

          const auditLogs = handle
            .query("SELECT * FROM audit_logs ORDER BY timestamp DESC")
            .all()
            .map((r) => ({
              id: String(r.id),
              entity: String(r.entity),
              entityId: String(r.entity_id),
              action: String(r.action),
              performedBy: String(r.performed_by),
              timestamp: String(r.timestamp),
              details: r.details ? String(r.details) : undefined,
            }));

          res.statusCode = 200;
          res.end(
            JSON.stringify({
              ok: true,
              dbPath: dbFilePath,
              snapshot: {
                version: 3,
                updatedAt: new Date().toISOString(),
                users,
                warehouses,
                suppliers,
                products,
                purchaseRequests,
                purchaseOrders,
                goodsReceipts,
                inventoryBalances,
                inventoryMovements,
                auditLogs,
              },
            }),
          );
          return;
        }

        if (req.method === "POST" && url.startsWith("/api/sqlite/users")) {
          const raw = await readBody();
          const parsed = JSON.parse(raw || "{}") as {
            users?: {
              id: string;
              name: string;
              username: string;
              email: string;
              role: string;
              passwordHash: string;
              status?: string;
              createdAt: string;
            }[];
          };
          const users = parsed.users ?? [];
          handle.exec("BEGIN TRANSACTION;");
          try {
            handle.exec("DELETE FROM users;");
            const stmt = handle.query(
              "INSERT INTO users (id, name, username, email, role, password_hash, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            );
            for (const u of users) {
              stmt.run(
                u.id,
                u.name,
                u.username,
                u.email,
                u.role,
                u.passwordHash,
                u.status ?? "ACTIVE",
                u.createdAt,
              );
            }
            handle.exec("COMMIT;");
            res.statusCode = 200;
            res.end(
              JSON.stringify({
                ok: true,
                count: users.length,
                dbPath: dbFilePath,
              }),
            );
          } catch (err) {
            handle.exec("ROLLBACK;");
            res.statusCode = 500;
            res.end(JSON.stringify({ ok: false, error: String(err) }));
          }
          return;
        }

        if (req.method === "POST" && url.startsWith("/api/sqlite/save")) {
          const raw = await readBody();
          const snap = JSON.parse(raw || "{}") as {
            warehouses?: {
              id: string;
              code: string;
              name: string;
              location: string;
              isActive: boolean;
            }[];
            suppliers?: {
              id: string;
              name: string;
              email: string;
              phone: string;
              isActive: boolean;
            }[];
            products?: {
              id: string;
              sku: string;
              name: string;
              unit: string;
              minStock: number;
              category: string;
              isActive: boolean;
            }[];
            purchaseRequests?: {
              id: string;
              requestNumber: string;
              warehouseId: string;
              status: string;
              createdBy: string;
              createdAt: string;
              notes?: string;
              items: unknown[];
            }[];
            purchaseOrders?: {
              id: string;
              poNumber: string;
              purchaseRequestId: string;
              supplierId: string;
              warehouseId: string;
              status: string;
              createdBy: string;
              createdAt: string;
              items: unknown[];
            }[];
            goodsReceipts?: {
              id: string;
              grNumber: string;
              purchaseOrderId: string;
              receivedBy: string;
              receivedAt: string;
              items: unknown[];
            }[];
            inventoryBalances?: {
              warehouseId: string;
              productId: string;
              stock: number;
            }[];
            inventoryMovements?: {
              id: string;
              warehouseId: string;
              productId: string;
              movementType: string;
              referenceId: string;
              quantity: number;
              createdAt: string;
            }[];
            auditLogs?: {
              id: string;
              entity: string;
              entityId: string;
              action: string;
              performedBy: string;
              timestamp: string;
              details?: string;
            }[];
          };

          handle.exec("BEGIN TRANSACTION;");
          try {
            handle.exec(`
              DELETE FROM warehouses;
              DELETE FROM suppliers;
              DELETE FROM products;
              DELETE FROM purchase_requests;
              DELETE FROM purchase_orders;
              DELETE FROM goods_receipts;
              DELETE FROM inventory_balances;
              DELETE FROM inventory_movements;
              DELETE FROM audit_logs;
            `);

            const insWh = handle.query(
              "INSERT INTO warehouses (id, code, name, location, is_active) VALUES (?, ?, ?, ?, ?)",
            );
            for (const w of snap.warehouses ?? []) {
              insWh.run(w.id, w.code, w.name, w.location, w.isActive ? 1 : 0);
            }

            const insSup = handle.query(
              "INSERT INTO suppliers (id, name, email, phone, is_active) VALUES (?, ?, ?, ?, ?)",
            );
            for (const s of snap.suppliers ?? []) {
              insSup.run(s.id, s.name, s.email, s.phone, s.isActive ? 1 : 0);
            }

            const insPrd = handle.query(
              "INSERT INTO products (id, sku, name, unit, min_stock, category, is_active) VALUES (?, ?, ?, ?, ?, ?, ?)",
            );
            for (const p of snap.products ?? []) {
              insPrd.run(
                p.id,
                p.sku,
                p.name,
                p.unit,
                p.minStock,
                p.category,
                p.isActive ? 1 : 0,
              );
            }

            const insPr = handle.query(
              "INSERT INTO purchase_requests (id, request_number, warehouse_id, status, created_by, created_at, notes, items_json) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            );
            for (const pr of snap.purchaseRequests ?? []) {
              insPr.run(
                pr.id,
                pr.requestNumber,
                pr.warehouseId,
                pr.status,
                pr.createdBy,
                pr.createdAt,
                pr.notes ?? null,
                JSON.stringify(pr.items ?? []),
              );
            }

            const insPo = handle.query(
              "INSERT INTO purchase_orders (id, po_number, purchase_request_id, supplier_id, warehouse_id, status, created_by, created_at, items_json) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
            );
            for (const po of snap.purchaseOrders ?? []) {
              insPo.run(
                po.id,
                po.poNumber,
                po.purchaseRequestId,
                po.supplierId,
                po.warehouseId,
                po.status,
                po.createdBy,
                po.createdAt,
                JSON.stringify(po.items ?? []),
              );
            }

            const insGr = handle.query(
              "INSERT INTO goods_receipts (id, gr_number, purchase_order_id, received_by, received_at, items_json) VALUES (?, ?, ?, ?, ?, ?)",
            );
            for (const gr of snap.goodsReceipts ?? []) {
              insGr.run(
                gr.id,
                gr.grNumber,
                gr.purchaseOrderId,
                gr.receivedBy,
                gr.receivedAt,
                JSON.stringify(gr.items ?? []),
              );
            }

            const insBal = handle.query(
              "INSERT INTO inventory_balances (warehouse_id, product_id, stock) VALUES (?, ?, ?)",
            );
            for (const b of snap.inventoryBalances ?? []) {
              insBal.run(b.warehouseId, b.productId, b.stock);
            }

            const insMov = handle.query(
              "INSERT INTO inventory_movements (id, warehouse_id, product_id, movement_type, reference_id, quantity, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
            );
            for (const m of snap.inventoryMovements ?? []) {
              insMov.run(
                m.id,
                m.warehouseId,
                m.productId,
                m.movementType,
                m.referenceId,
                m.quantity,
                m.createdAt,
              );
            }

            const insAud = handle.query(
              "INSERT INTO audit_logs (id, entity, entity_id, action, performed_by, timestamp, details) VALUES (?, ?, ?, ?, ?, ?, ?)",
            );
            for (const a of snap.auditLogs ?? []) {
              insAud.run(
                a.id,
                a.entity,
                a.entityId,
                a.action,
                a.performedBy,
                a.timestamp,
                a.details ?? null,
              );
            }

            handle.exec("COMMIT;");
            res.statusCode = 200;
            res.end(JSON.stringify({ ok: true, dbPath: dbFilePath }));
          } catch (err) {
            handle.exec("ROLLBACK;");
            res.statusCode = 500;
            res.end(JSON.stringify({ ok: false, error: String(err) }));
          }
          return;
        }

        if (req.method === "POST" && url.startsWith("/api/sqlite/wipe")) {
          const raw = await readBody();
          const parsed = JSON.parse(raw || "{}") as { includeUsers?: boolean };
          handle.exec("BEGIN TRANSACTION;");
          try {
            handle.exec(`
              DELETE FROM warehouses;
              DELETE FROM suppliers;
              DELETE FROM products;
              DELETE FROM purchase_requests;
              DELETE FROM purchase_orders;
              DELETE FROM goods_receipts;
              DELETE FROM inventory_balances;
              DELETE FROM inventory_movements;
              DELETE FROM audit_logs;
            `);
            if (parsed.includeUsers) {
              handle.exec("DELETE FROM users;");
            }
            handle.exec("COMMIT;");
            res.statusCode = 200;
            res.end(JSON.stringify({ ok: true, dbPath: dbFilePath }));
          } catch (err) {
            handle.exec("ROLLBACK;");
            res.statusCode = 500;
            res.end(JSON.stringify({ ok: false, error: String(err) }));
          }
          return;
        }

        next();
      });
    },
  };
}

interface SqliteRowRecord {
  [key: string]: unknown;
}

interface SqliteStatement {
  run: (...params: unknown[]) => void;
  all: (...params: unknown[]) => SqliteRowRecord[];
}

interface SqliteDatabaseHandle {
  exec: (sql: string) => void;
  query: (sql: string) => SqliteStatement;
}

/**
 * Embedded SQLite3 Relational Database Engine Plugin for Vite + Bun.
 * Persists all tables (including `users`, `warehouses`, `suppliers`, `products`,
 * `purchase_requests`, `purchase_orders`, `goods_receipts`, `inventory_balances`,
 * `inventory_movements`, and `audit_logs`) into a real SQLite3 file on disk:
 * `database/cafe_stock.sqlite`.
 */
function sqliteDatabasePlugin(): Plugin {
  let db: SqliteDatabaseHandle | null = null;
  const dbDir = path.resolve(import.meta.dirname, "./database");
  const dbFilePath = path.resolve(dbDir, "cafe_stock.sqlite");

  const initDatabase = async (): Promise<SqliteDatabaseHandle | null> => {
    if (db) {
      return db;
    }
    try {
      if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
      }
      const bunSqliteModuleName = "bun:sqlite";
      const mod = (await import(
        /* @vite-ignore */ bunSqliteModuleName
      )) as {
        Database: new (filename: string) => SqliteDatabaseHandle;
      };
      const handle = new mod.Database(dbFilePath);
      handle.exec(`
        PRAGMA journal_mode = WAL;
        PRAGMA foreign_keys = ON;

        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          username TEXT NOT NULL UNIQUE,
          email TEXT NOT NULL UNIQUE,
          role TEXT NOT NULL,
          password_hash TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'ACTIVE',
          created_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS warehouses (
          id TEXT PRIMARY KEY,
          code TEXT NOT NULL UNIQUE,
          name TEXT NOT NULL,
          location TEXT NOT NULL,
          is_active INTEGER NOT NULL DEFAULT 1
        );

        CREATE TABLE IF NOT EXISTS suppliers (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          email TEXT NOT NULL,
          phone TEXT NOT NULL,
          is_active INTEGER NOT NULL DEFAULT 1
        );

        CREATE TABLE IF NOT EXISTS products (
          id TEXT PRIMARY KEY,
          sku TEXT NOT NULL UNIQUE,
          name TEXT NOT NULL,
          unit TEXT NOT NULL,
          min_stock INTEGER NOT NULL DEFAULT 0,
          category TEXT NOT NULL,
          is_active INTEGER NOT NULL DEFAULT 1
        );

        CREATE TABLE IF NOT EXISTS purchase_requests (
          id TEXT PRIMARY KEY,
          request_number TEXT NOT NULL UNIQUE,
          warehouse_id TEXT NOT NULL,
          status TEXT NOT NULL,
          created_by TEXT NOT NULL,
          created_at TEXT NOT NULL,
          notes TEXT,
          items_json TEXT NOT NULL DEFAULT '[]'
        );

        CREATE TABLE IF NOT EXISTS purchase_orders (
          id TEXT PRIMARY KEY,
          po_number TEXT NOT NULL UNIQUE,
          purchase_request_id TEXT NOT NULL,
          supplier_id TEXT NOT NULL,
          warehouse_id TEXT NOT NULL,
          status TEXT NOT NULL,
          created_by TEXT NOT NULL,
          created_at TEXT NOT NULL,
          items_json TEXT NOT NULL DEFAULT '[]'
        );

        CREATE TABLE IF NOT EXISTS goods_receipts (
          id TEXT PRIMARY KEY,
          gr_number TEXT NOT NULL UNIQUE,
          purchase_order_id TEXT NOT NULL,
          received_by TEXT NOT NULL,
          received_at TEXT NOT NULL,
          items_json TEXT NOT NULL DEFAULT '[]'
        );

        CREATE TABLE IF NOT EXISTS inventory_balances (
          warehouse_id TEXT NOT NULL,
          product_id TEXT NOT NULL,
          stock INTEGER NOT NULL DEFAULT 0,
          PRIMARY KEY (warehouse_id, product_id)
        );

        CREATE TABLE IF NOT EXISTS inventory_movements (
          id TEXT PRIMARY KEY,
          warehouse_id TEXT NOT NULL,
          product_id TEXT NOT NULL,
          movement_type TEXT NOT NULL,
          reference_id TEXT NOT NULL,
          quantity INTEGER NOT NULL,
          created_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS audit_logs (
          id TEXT PRIMARY KEY,
          entity TEXT NOT NULL,
          entity_id TEXT NOT NULL,
          action TEXT NOT NULL,
          performed_by TEXT NOT NULL,
          timestamp TEXT NOT NULL,
          details TEXT
        );
      `);
      db = handle;
      return db;
    } catch {
      return null;
    }
  };

  return {
    name: "cafe-stock-sqlite3-engine",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url ?? "";
        if (!url.startsWith("/api/sqlite/")) {
          next();
          return;
        }

        const handle = await initDatabase();
        res.setHeader("Content-Type", "application/json");

        if (!handle) {
          res.statusCode = 503;
          res.end(JSON.stringify({ ok: false, error: "SQLite engine unavailable" }));
          return;
        }

        const readBody = (): Promise<string> =>
          new Promise((resolve) => {
            let body = "";
            req.on("data", (chunk: unknown) => {
              body += String(chunk);
            });
            req.on("end", () => resolve(body));
          });

        if (req.method === "GET" && url.startsWith("/api/sqlite/snapshot")) {
          const users = handle
            .query("SELECT * FROM users ORDER BY created_at ASC")
            .all()
            .map((r) => ({
              id: String(r.id),
              name: String(r.name),
              username: String(r.username),
              email: String(r.email),
              role: String(r.role),
              passwordHash: String(r.password_hash),
              status: String(r.status ?? "ACTIVE"),
              createdAt: String(r.created_at),
            }));

          const warehouses = handle
            .query("SELECT * FROM warehouses")
            .all()
            .map((r) => ({
              id: String(r.id),
              code: String(r.code),
              name: String(r.name),
              location: String(r.location),
              isActive: Number(r.is_active) === 1,
            }));

          const suppliers = handle
            .query("SELECT * FROM suppliers")
            .all()
            .map((r) => ({
              id: String(r.id),
              name: String(r.name),
              email: String(r.email),
              phone: String(r.phone),
              isActive: Number(r.is_active) === 1,
            }));

          const products = handle
            .query("SELECT * FROM products")
            .all()
            .map((r) => ({
              id: String(r.id),
              sku: String(r.sku),
              name: String(r.name),
              unit: String(r.unit),
              minStock: Number(r.min_stock),
              category: String(r.category),
              isActive: Number(r.is_active) === 1,
            }));

          const purchaseRequests = handle
            .query("SELECT * FROM purchase_requests ORDER BY created_at DESC")
            .all()
            .map((r) => ({
              id: String(r.id),
              requestNumber: String(r.request_number),
              warehouseId: String(r.warehouse_id),
              status: String(r.status),
              createdBy: String(r.created_by),
              createdAt: String(r.created_at),
              notes: r.notes ? String(r.notes) : undefined,
              items: JSON.parse(String(r.items_json || "[]")) as unknown[],
            }));

          const purchaseOrders = handle
            .query("SELECT * FROM purchase_orders ORDER BY created_at DESC")
            .all()
            .map((r) => ({
              id: String(r.id),
              poNumber: String(r.po_number),
              purchaseRequestId: String(r.purchase_request_id),
              supplierId: String(r.supplier_id),
              warehouseId: String(r.warehouse_id),
              status: String(r.status),
              createdBy: String(r.created_by),
              createdAt: String(r.created_at),
              items: JSON.parse(String(r.items_json || "[]")) as unknown[],
            }));

          const goodsReceipts = handle
            .query("SELECT * FROM goods_receipts ORDER BY received_at DESC")
            .all()
            .map((r) => ({
              id: String(r.id),
              grNumber: String(r.gr_number),
              purchaseOrderId: String(r.purchase_order_id),
              receivedBy: String(r.received_by),
              receivedAt: String(r.received_at),
              items: JSON.parse(String(r.items_json || "[]")) as unknown[],
            }));

          const inventoryBalances = handle
            .query("SELECT * FROM inventory_balances")
            .all()
            .map((r) => ({
              warehouseId: String(r.warehouse_id),
              productId: String(r.product_id),
              stock: Number(r.stock),
            }));

          const inventoryMovements = handle
            .query("SELECT * FROM inventory_movements ORDER BY created_at DESC")
            .all()
            .map((r) => ({
              id: String(r.id),
              warehouseId: String(r.warehouse_id),
              productId: String(r.product_id),
              movementType: String(r.movement_type),
              referenceId: String(r.reference_id),
              quantity: Number(r.quantity),
              createdAt: String(r.created_at),
            }));

          const auditLogs = handle
            .query("SELECT * FROM audit_logs ORDER BY timestamp DESC")
            .all()
            .map((r) => ({
              id: String(r.id),
              entity: String(r.entity),
              entityId: String(r.entity_id),
              action: String(r.action),
              performedBy: String(r.performed_by),
              timestamp: String(r.timestamp),
              details: r.details ? String(r.details) : undefined,
            }));

          res.statusCode = 200;
          res.end(
            JSON.stringify({
              ok: true,
              dbPath: dbFilePath,
              snapshot: {
                version: 3,
                updatedAt: new Date().toISOString(),
                users,
                warehouses,
                suppliers,
                products,
                purchaseRequests,
                purchaseOrders,
                goodsReceipts,
                inventoryBalances,
                inventoryMovements,
                auditLogs,
              },
            }),
          );
          return;
        }

        if (req.method === "POST" && url.startsWith("/api/sqlite/users")) {
          const raw = await readBody();
          const parsed = JSON.parse(raw || "{}") as {
            users?: {
              id: string;
              name: string;
              username: string;
              email: string;
              role: string;
              passwordHash: string;
              status?: string;
              createdAt: string;
            }[];
          };
          const users = parsed.users ?? [];
          handle.exec("BEGIN TRANSACTION;");
          try {
            handle.exec("DELETE FROM users;");
            const stmt = handle.query(
              "INSERT INTO users (id, name, username, email, role, password_hash, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            );
            for (const u of users) {
              stmt.run(
                u.id,
                u.name,
                u.username,
                u.email,
                u.role,
                u.passwordHash,
                u.status ?? "ACTIVE",
                u.createdAt,
              );
            }
            handle.exec("COMMIT;");
            res.statusCode = 200;
            res.end(JSON.stringify({ ok: true, count: users.length, dbPath: dbFilePath }));
          } catch (err) {
            handle.exec("ROLLBACK;");
            res.statusCode = 500;
            res.end(JSON.stringify({ ok: false, error: String(err) }));
          }
          return;
        }

        if (req.method === "POST" && url.startsWith("/api/sqlite/save")) {
          const raw = await readBody();
          const snap = JSON.parse(raw || "{}") as {
            warehouses?: {
              id: string;
              code: string;
              name: string;
              location: string;
              isActive: boolean;
            }[];
            suppliers?: {
              id: string;
              name: string;
              email: string;
              phone: string;
              isActive: boolean;
            }[];
            products?: {
              id: string;
              sku: string;
              name: string;
              unit: string;
              minStock: number;
              category: string;
              isActive: boolean;
            }[];
            purchaseRequests?: {
              id: string;
              requestNumber: string;
              warehouseId: string;
              status: string;
              createdBy: string;
              createdAt: string;
              notes?: string;
              items: unknown[];
            }[];
            purchaseOrders?: {
              id: string;
              poNumber: string;
              purchaseRequestId: string;
              supplierId: string;
              warehouseId: string;
              status: string;
              createdBy: string;
              createdAt: string;
              items: unknown[];
            }[];
            goodsReceipts?: {
              id: string;
              grNumber: string;
              purchaseOrderId: string;
              receivedBy: string;
              receivedAt: string;
              items: unknown[];
            }[];
            inventoryBalances?: {
              warehouseId: string;
              productId: string;
              stock: number;
            }[];
            inventoryMovements?: {
              id: string;
              warehouseId: string;
              productId: string;
              movementType: string;
              referenceId: string;
              quantity: number;
              createdAt: string;
            }[];
            auditLogs?: {
              id: string;
              entity: string;
              entityId: string;
              action: string;
              performedBy: string;
              timestamp: string;
              details?: string;
            }[];
          };

          handle.exec("BEGIN TRANSACTION;");
          try {
            handle.exec(`
              DELETE FROM warehouses;
              DELETE FROM suppliers;
              DELETE FROM products;
              DELETE FROM purchase_requests;
              DELETE FROM purchase_orders;
              DELETE FROM goods_receipts;
              DELETE FROM inventory_balances;
              DELETE FROM inventory_movements;
              DELETE FROM audit_logs;
            `);

            const insWh = handle.query(
              "INSERT INTO warehouses (id, code, name, location, is_active) VALUES (?, ?, ?, ?, ?)",
            );
            for (const w of snap.warehouses ?? []) {
              insWh.run(w.id, w.code, w.name, w.location, w.isActive ? 1 : 0);
            }

            const insSup = handle.query(
              "INSERT INTO suppliers (id, name, email, phone, is_active) VALUES (?, ?, ?, ?, ?)",
            );
            for (const s of snap.suppliers ?? []) {
              insSup.run(s.id, s.name, s.email, s.phone, s.isActive ? 1 : 0);
            }

            const insPrd = handle.query(
              "INSERT INTO products (id, sku, name, unit, min_stock, category, is_active) VALUES (?, ?, ?, ?, ?, ?, ?)",
            );
            for (const p of snap.products ?? []) {
              insPrd.run(
                p.id,
                p.sku,
                p.name,
                p.unit,
                p.minStock,
                p.category,
                p.isActive ? 1 : 0,
              );
            }

            const insPr = handle.query(
              "INSERT INTO purchase_requests (id, request_number, warehouse_id, status, created_by, created_at, notes, items_json) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            );
            for (const pr of snap.purchaseRequests ?? []) {
              insPr.run(
                pr.id,
                pr.requestNumber,
                pr.warehouseId,
                pr.status,
                pr.createdBy,
                pr.createdAt,
                pr.notes ?? null,
                JSON.stringify(pr.items ?? []),
              );
            }

            const insPo = handle.query(
              "INSERT INTO purchase_orders (id, po_number, purchase_request_id, supplier_id, warehouse_id, status, created_by, created_at, items_json) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
            );
            for (const po of snap.purchaseOrders ?? []) {
              insPo.run(
                po.id,
                po.poNumber,
                po.purchaseRequestId,
                po.supplierId,
                po.warehouseId,
                po.status,
                po.createdBy,
                po.createdAt,
                JSON.stringify(po.items ?? []),
              );
            }

            const insGr = handle.query(
              "INSERT INTO goods_receipts (id, gr_number, purchase_order_id, received_by, received_at, items_json) VALUES (?, ?, ?, ?, ?, ?)",
            );
            for (const gr of snap.goodsReceipts ?? []) {
              insGr.run(
                gr.id,
                gr.grNumber,
                gr.purchaseOrderId,
                gr.receivedBy,
                gr.receivedAt,
                JSON.stringify(gr.items ?? []),
              );
            }

            const insBal = handle.query(
              "INSERT INTO inventory_balances (warehouse_id, product_id, stock) VALUES (?, ?, ?)",
            );
            for (const b of snap.inventoryBalances ?? []) {
              insBal.run(b.warehouseId, b.productId, b.stock);
            }

            const insMov = handle.query(
              "INSERT INTO inventory_movements (id, warehouse_id, product_id, movement_type, reference_id, quantity, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
            );
            for (const m of snap.inventoryMovements ?? []) {
              insMov.run(
                m.id,
                m.warehouseId,
                m.productId,
                m.movementType,
                m.referenceId,
                m.quantity,
                m.createdAt,
              );
            }

            const insAud = handle.query(
              "INSERT INTO audit_logs (id, entity, entity_id, action, performed_by, timestamp, details) VALUES (?, ?, ?, ?, ?, ?, ?)",
            );
            for (const a of snap.auditLogs ?? []) {
              insAud.run(
                a.id,
                a.entity,
                a.entityId,
                a.action,
                a.performedBy,
                a.timestamp,
                a.details ?? null,
              );
            }

            handle.exec("COMMIT;");
            res.statusCode = 200;
            res.end(JSON.stringify({ ok: true, dbPath: dbFilePath }));
          } catch (err) {
            handle.exec("ROLLBACK;");
            res.statusCode = 500;
            res.end(JSON.stringify({ ok: false, error: String(err) }));
          }
          return;
        }

        if (req.method === "POST" && url.startsWith("/api/sqlite/wipe")) {
          const raw = await readBody();
          const parsed = JSON.parse(raw || "{}") as { includeUsers?: boolean };
          handle.exec("BEGIN TRANSACTION;");
          try {
            handle.exec(`
              DELETE FROM warehouses;
              DELETE FROM suppliers;
              DELETE FROM products;
              DELETE FROM purchase_requests;
              DELETE FROM purchase_orders;
              DELETE FROM goods_receipts;
              DELETE FROM inventory_balances;
              DELETE FROM inventory_movements;
              DELETE FROM audit_logs;
            `);
            if (parsed.includeUsers) {
              handle.exec("DELETE FROM users;");
            }
            handle.exec("COMMIT;");
            res.statusCode = 200;
            res.end(JSON.stringify({ ok: true, dbPath: dbFilePath }));
          } catch (err) {
            handle.exec("ROLLBACK;");
            res.statusCode = 500;
            res.end(JSON.stringify({ ok: false, error: String(err) }));
          }
          return;
        }

        next();
      });
    },
  };
}

// https://vite.dev/config/
export default defineConfig(() => ({
  plugins: [react(), tailwindcss(), sqliteDatabasePlugin()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
  clearScreen: false,
  server: {
    port: 1420,
    strictPort: true,
    host: host || false,
    hmr: host
      ? {
          protocol: "ws",
          host,
          port: 1421,
        }
      : undefined,
    watch: {
      ignored: ["**/src-tauri/**", "**/database/**"],
    },
  },
}));

