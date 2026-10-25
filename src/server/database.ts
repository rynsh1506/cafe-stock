import path from "node:path";
import fs from "node:fs";
import process from "node:process";
import {
  AuditLog,
  GoodsReceipt,
  InventoryBalance,
  InventoryMovement,
  Product,
  PurchaseOrder,
  PurchaseRequest,
  Supplier,
  Warehouse,
} from "@/types";
import { DatabaseSnapshot, SqliteUserRow } from "@/utils/sqliteDatabase";

export interface SqliteRowRecord {
  [key: string]: unknown;
}

export interface SqliteStatement {
  run: (...params: unknown[]) => void;
  all: (...params: unknown[]) => SqliteRowRecord[];
}

export interface SqliteDatabaseHandle {
  exec: (sql: string) => void;
  query: (sql: string) => SqliteStatement;
}

let cachedDatabaseHandle: SqliteDatabaseHandle | null = null;

export function getDatabasePath(): string {
  const customPath = process.env.SQLITE_DB_PATH;
  if (customPath) {
    return path.resolve(customPath);
  }
  return path.resolve(process.cwd(), "database", "cafe_stock.sqlite");
}

export function initSqliteDatabase(customPath?: string): SqliteDatabaseHandle {
  if (cachedDatabaseHandle && !customPath) {
    return cachedDatabaseHandle;
  }

  const dbFilePath = customPath ? path.resolve(customPath) : getDatabasePath();
  const dbDir = path.dirname(dbFilePath);

  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { Database } = require("bun:sqlite") as {
    Database: new (filename: string) => SqliteDatabaseHandle;
  };

  const handle = new Database(dbFilePath);

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
      purchase_request_id TEXT NOT NULL UNIQUE,
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
      reference_type TEXT NOT NULL DEFAULT 'GOODS_RECEIPT',
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

  if (!customPath) {
    cachedDatabaseHandle = handle;
  }

  return handle;
}

export function fetchDatabaseSnapshot(
  handle: SqliteDatabaseHandle,
): DatabaseSnapshot {
  const users: SqliteUserRow[] = handle
    .query("SELECT * FROM users ORDER BY created_at ASC")
    .all()
    .map((r) => ({
      id: String(r.id),
      name: String(r.name),
      username: String(r.username),
      email: String(r.email),
      role: String(r.role) as "USER" | "APPROVER",
      passwordHash: String(r.password_hash),
      status: String(r.status ?? "ACTIVE") as "ACTIVE" | "PENDING" | "REJECTED",
      createdAt: String(r.created_at),
    }));

  const warehouses: Warehouse[] = handle
    .query("SELECT * FROM warehouses")
    .all()
    .map((r) => ({
      id: String(r.id),
      code: String(r.code),
      name: String(r.name),
      location: String(r.location),
      isActive: Number(r.is_active) === 1,
    }));

  const suppliers: Supplier[] = handle
    .query("SELECT * FROM suppliers")
    .all()
    .map((r) => ({
      id: String(r.id),
      name: String(r.name),
      email: String(r.email),
      phone: String(r.phone),
      isActive: Number(r.is_active) === 1,
    }));

  const products: Product[] = handle
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

  const purchaseRequests: PurchaseRequest[] = handle
    .query("SELECT * FROM purchase_requests ORDER BY created_at DESC")
    .all()
    .map((r) => ({
      id: String(r.id),
      requestNumber: String(r.request_number),
      warehouseId: String(r.warehouse_id),
      status: String(r.status) as PurchaseRequest["status"],
      createdBy: String(r.created_by),
      createdAt: String(r.created_at),
      notes: r.notes ? String(r.notes) : undefined,
      items: JSON.parse(
        String(r.items_json || "[]"),
      ) as PurchaseRequest["items"],
    }));

  const purchaseOrders: PurchaseOrder[] = handle
    .query("SELECT * FROM purchase_orders ORDER BY created_at DESC")
    .all()
    .map((r) => ({
      id: String(r.id),
      poNumber: String(r.po_number),
      purchaseRequestId: String(r.purchase_request_id),
      supplierId: String(r.supplier_id),
      warehouseId: String(r.warehouse_id),
      status: String(r.status) as PurchaseOrder["status"],
      createdBy: String(r.created_by),
      createdAt: String(r.created_at),
      items: JSON.parse(String(r.items_json || "[]")) as PurchaseOrder["items"],
    }));

  const goodsReceipts: GoodsReceipt[] = handle
    .query("SELECT * FROM goods_receipts ORDER BY received_at DESC")
    .all()
    .map((r) => ({
      id: String(r.id),
      grNumber: String(r.gr_number),
      purchaseOrderId: String(r.purchase_order_id),
      receivedBy: String(r.received_by),
      receivedAt: String(r.received_at),
      items: JSON.parse(String(r.items_json || "[]")) as GoodsReceipt["items"],
    }));

  const inventoryBalances: InventoryBalance[] = handle
    .query("SELECT * FROM inventory_balances")
    .all()
    .map((r) => ({
      warehouseId: String(r.warehouse_id),
      productId: String(r.product_id),
      stock: Number(r.stock),
    }));

  const inventoryMovements: InventoryMovement[] = handle
    .query("SELECT * FROM inventory_movements ORDER BY created_at DESC")
    .all()
    .map((r) => ({
      id: String(r.id),
      warehouseId: String(r.warehouse_id),
      productId: String(r.product_id),
      movementType: String(
        r.movement_type,
      ) as InventoryMovement["movementType"],
      referenceType: String(r.reference_type ?? "GOODS_RECEIPT"),
      referenceId: String(r.reference_id),
      quantity: Number(r.quantity),
      createdAt: String(r.created_at),
    }));

  const auditLogs: AuditLog[] = handle
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

  return {
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
  };
}

export function saveUsers(
  handle: SqliteDatabaseHandle,
  users: SqliteUserRow[],
): void {
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
  } catch (error) {
    handle.exec("ROLLBACK;");
    throw error;
  }
}

export function saveDatabaseSnapshot(
  handle: SqliteDatabaseHandle,
  snap: Partial<DatabaseSnapshot>,
): void {
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
      "INSERT INTO inventory_movements (id, warehouse_id, product_id, movement_type, reference_type, reference_id, quantity, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    );
    for (const m of snap.inventoryMovements ?? []) {
      insMov.run(
        m.id,
        m.warehouseId,
        m.productId,
        m.movementType,
        m.referenceType ?? "GOODS_RECEIPT",
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
  } catch (error) {
    handle.exec("ROLLBACK;");
    throw error;
  }
}

export function wipeDatabaseData(
  handle: SqliteDatabaseHandle,
  includeUsers = false,
): void {
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
    if (includeUsers) {
      handle.exec("DELETE FROM users;");
    }
    handle.exec("COMMIT;");
  } catch (error) {
    handle.exec("ROLLBACK;");
    throw error;
  }
}
