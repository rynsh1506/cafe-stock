import process from "node:process";
import path from "node:path";
import fs from "node:fs";
import mysql, { Pool, PoolConnection } from "mysql2/promise";
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

export interface DatabaseConfiguration {
  engineType: "mysql" | "sqlite";
  mysql?: {
    host: string;
    port: number;
    user: string;
    password?: string;
    database: string;
  };
  sqlite?: {
    filePath: string;
  };
}

export function getDatabaseConfiguration(): DatabaseConfiguration {
  const envType = (process.env.DB_TYPE || "").toLowerCase();
  const hasMysqlEnv = Boolean(
    process.env.DB_HOST || process.env.DB_USER || envType === "mysql",
  );

  if (hasMysqlEnv && envType !== "sqlite") {
    return {
      engineType: "mysql",
      mysql: {
        host: process.env.DB_HOST || "localhost",
        port: Number(process.env.DB_PORT || 3306),
        user: process.env.DB_USER || "root",
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME || "cafe_stock",
      },
    };
  }

  const customSqlitePath = process.env.SQLITE_DB_PATH;
  const filePath = customSqlitePath
    ? path.resolve(customSqlitePath)
    : path.resolve(process.cwd(), "database", "cafe_stock.sqlite");

  return {
    engineType: "sqlite",
    sqlite: {
      filePath,
    },
  };
}

let mysqlPool: Pool | null = null;
let sqliteHandle: unknown = null;

interface SqliteStatement {
  run: (...params: unknown[]) => void;
  all: (...params: unknown[]) => Record<string, unknown>[];
}

interface SqliteDatabase {
  exec: (sql: string) => void;
  query: (sql: string) => SqliteStatement;
}

export async function initDatabase(): Promise<{
  engine: "mysql" | "sqlite";
  info: string;
}> {
  const config = getDatabaseConfiguration();

  if (config.engineType === "mysql" && config.mysql) {
    try {
      if (!mysqlPool) {
        mysqlPool = mysql.createPool({
          host: config.mysql.host,
          port: config.mysql.port,
          user: config.mysql.user,
          password: config.mysql.password,
          database: config.mysql.database,
          waitForConnections: true,
          connectionLimit: 10,
          queueLimit: 0,
        });
      }

      const conn = await mysqlPool.getConnection();
      try {
        await conn.query(`
          CREATE TABLE IF NOT EXISTS users (
            id VARCHAR(64) PRIMARY KEY,
            name VARCHAR(120) NOT NULL,
            username VARCHAR(64) NOT NULL UNIQUE,
            email VARCHAR(120) NOT NULL UNIQUE,
            role VARCHAR(32) NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE',
            created_at VARCHAR(64) NOT NULL
          );
        `);
        await conn.query(`
          CREATE TABLE IF NOT EXISTS warehouses (
            id VARCHAR(64) PRIMARY KEY,
            code VARCHAR(32) NOT NULL UNIQUE,
            name VARCHAR(120) NOT NULL,
            location VARCHAR(255) NOT NULL,
            is_active TINYINT(1) NOT NULL DEFAULT 1
          );
        `);
        await conn.query(`
          CREATE TABLE IF NOT EXISTS suppliers (
            id VARCHAR(64) PRIMARY KEY,
            name VARCHAR(120) NOT NULL,
            email VARCHAR(120) NOT NULL,
            phone VARCHAR(64) NOT NULL,
            is_active TINYINT(1) NOT NULL DEFAULT 1
          );
        `);
        await conn.query(`
          CREATE TABLE IF NOT EXISTS products (
            id VARCHAR(64) PRIMARY KEY,
            sku VARCHAR(64) NOT NULL UNIQUE,
            name VARCHAR(160) NOT NULL,
            unit VARCHAR(32) NOT NULL,
            min_stock INT NOT NULL DEFAULT 0,
            category VARCHAR(80) NOT NULL,
            is_active TINYINT(1) NOT NULL DEFAULT 1
          );
        `);
        await conn.query(`
          CREATE TABLE IF NOT EXISTS purchase_requests (
            id VARCHAR(64) PRIMARY KEY,
            request_number VARCHAR(64) NOT NULL UNIQUE,
            warehouse_id VARCHAR(64) NOT NULL,
            status VARCHAR(32) NOT NULL,
            created_by VARCHAR(80) NOT NULL,
            created_at VARCHAR(64) NOT NULL,
            notes TEXT,
            items_json LONGTEXT NOT NULL
          );
        `);
        await conn.query(`
          CREATE TABLE IF NOT EXISTS purchase_orders (
            id VARCHAR(64) PRIMARY KEY,
            po_number VARCHAR(64) NOT NULL UNIQUE,
            purchase_request_id VARCHAR(64) NOT NULL UNIQUE,
            supplier_id VARCHAR(64) NOT NULL,
            warehouse_id VARCHAR(64) NOT NULL,
            status VARCHAR(32) NOT NULL,
            created_by VARCHAR(80) NOT NULL,
            created_at VARCHAR(64) NOT NULL,
            items_json LONGTEXT NOT NULL
          );
        `);
        await conn.query(`
          CREATE TABLE IF NOT EXISTS goods_receipts (
            id VARCHAR(64) PRIMARY KEY,
            gr_number VARCHAR(64) NOT NULL UNIQUE,
            purchase_order_id VARCHAR(64) NOT NULL,
            received_by VARCHAR(80) NOT NULL,
            received_at VARCHAR(64) NOT NULL,
            items_json LONGTEXT NOT NULL
          );
        `);
        await conn.query(`
          CREATE TABLE IF NOT EXISTS inventory_balances (
            warehouse_id VARCHAR(64) NOT NULL,
            product_id VARCHAR(64) NOT NULL,
            stock INT NOT NULL DEFAULT 0,
            PRIMARY KEY (warehouse_id, product_id)
          );
        `);
        await conn.query(`
          CREATE TABLE IF NOT EXISTS inventory_movements (
            id VARCHAR(64) PRIMARY KEY,
            warehouse_id VARCHAR(64) NOT NULL,
            product_id VARCHAR(64) NOT NULL,
            movement_type VARCHAR(64) NOT NULL,
            reference_type VARCHAR(64) NOT NULL DEFAULT 'GOODS_RECEIPT',
            reference_id VARCHAR(64) NOT NULL,
            quantity INT NOT NULL,
            created_at VARCHAR(64) NOT NULL
          );
        `);
        await conn.query(`
          CREATE TABLE IF NOT EXISTS audit_logs (
            id VARCHAR(64) PRIMARY KEY,
            entity VARCHAR(64) NOT NULL,
            entity_id VARCHAR(64) NOT NULL,
            action VARCHAR(64) NOT NULL,
            performed_by VARCHAR(80) NOT NULL,
            timestamp VARCHAR(64) NOT NULL,
            details TEXT
          );
        `);
      } finally {
        conn.release();
      }

      return {
        engine: "mysql",
        info: `${config.mysql.host}:${config.mysql.port}/${config.mysql.database}`,
      };
    } catch (mysqlError) {
      console.warn(
        `[CafeStock] MySQL connection to ${config.mysql.host}:${config.mysql.port} failed. Falling back to SQLite. Error:`,
        mysqlError instanceof Error ? mysqlError.message : String(mysqlError),
      );
    }
  }

  // SQLite Initialization
  const sqliteConfig = config.sqlite ?? {
    filePath: path.resolve(process.cwd(), "database", "cafe_stock.sqlite"),
  };
  const dbDir = path.dirname(sqliteConfig.filePath);
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { Database } = require("bun:sqlite") as {
    Database: new (filename: string) => SqliteDatabase;
  };
  const handle = new Database(sqliteConfig.filePath);
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

  sqliteHandle = handle;
  return { engine: "sqlite", info: sqliteConfig.filePath };
}

export async function fetchDatabaseSnapshot(): Promise<DatabaseSnapshot> {
  if (mysqlPool) {
    const conn: PoolConnection = await mysqlPool.getConnection();
    try {
      const [uRows] = (await conn.query(
        "SELECT * FROM users ORDER BY created_at ASC",
      )) as unknown as [Record<string, unknown>[]];
      const users: SqliteUserRow[] = uRows.map((r) => ({
        id: String(r.id),
        name: String(r.name),
        username: String(r.username),
        email: String(r.email),
        role: String(r.role) as "USER" | "APPROVER",
        passwordHash: String(r.password_hash),
        status: String(r.status ?? "ACTIVE") as
          "ACTIVE" | "PENDING" | "REJECTED",
        createdAt: String(r.created_at),
      }));

      const [wRows] = (await conn.query(
        "SELECT * FROM warehouses",
      )) as unknown as [Record<string, unknown>[]];
      const warehouses: Warehouse[] = wRows.map((r) => ({
        id: String(r.id),
        code: String(r.code),
        name: String(r.name),
        location: String(r.location),
        isActive: Number(r.is_active) === 1,
      }));

      const [sRows] = (await conn.query(
        "SELECT * FROM suppliers",
      )) as unknown as [Record<string, unknown>[]];
      const suppliers: Supplier[] = sRows.map((r) => ({
        id: String(r.id),
        name: String(r.name),
        email: String(r.email),
        phone: String(r.phone),
        isActive: Number(r.is_active) === 1,
      }));

      const [pRows] = (await conn.query(
        "SELECT * FROM products",
      )) as unknown as [Record<string, unknown>[]];
      const products: Product[] = pRows.map((r) => ({
        id: String(r.id),
        sku: String(r.sku),
        name: String(r.name),
        unit: String(r.unit),
        minStock: Number(r.min_stock),
        category: String(r.category),
        isActive: Number(r.is_active) === 1,
      }));

      const [prRows] = (await conn.query(
        "SELECT * FROM purchase_requests ORDER BY created_at DESC",
      )) as unknown as [Record<string, unknown>[]];
      const purchaseRequests: PurchaseRequest[] = prRows.map((r) => ({
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

      const [poRows] = (await conn.query(
        "SELECT * FROM purchase_orders ORDER BY created_at DESC",
      )) as unknown as [Record<string, unknown>[]];
      const purchaseOrders: PurchaseOrder[] = poRows.map((r) => ({
        id: String(r.id),
        poNumber: String(r.po_number),
        purchaseRequestId: String(r.purchase_request_id),
        supplierId: String(r.supplier_id),
        warehouseId: String(r.warehouse_id),
        status: String(r.status) as PurchaseOrder["status"],
        createdBy: String(r.created_by),
        createdAt: String(r.created_at),
        items: JSON.parse(
          String(r.items_json || "[]"),
        ) as PurchaseOrder["items"],
      }));

      const [grRows] = (await conn.query(
        "SELECT * FROM goods_receipts ORDER BY received_at DESC",
      )) as unknown as [Record<string, unknown>[]];
      const goodsReceipts: GoodsReceipt[] = grRows.map((r) => ({
        id: String(r.id),
        grNumber: String(r.gr_number),
        purchaseOrderId: String(r.purchase_order_id),
        receivedBy: String(r.received_by),
        receivedAt: String(r.received_at),
        items: JSON.parse(
          String(r.items_json || "[]"),
        ) as GoodsReceipt["items"],
      }));

      const [bRows] = (await conn.query(
        "SELECT * FROM inventory_balances",
      )) as unknown as [Record<string, unknown>[]];
      const inventoryBalances: InventoryBalance[] = bRows.map((r) => ({
        warehouseId: String(r.warehouse_id),
        productId: String(r.product_id),
        stock: Number(r.stock),
      }));

      const [mRows] = (await conn.query(
        "SELECT * FROM inventory_movements ORDER BY created_at DESC",
      )) as unknown as [Record<string, unknown>[]];
      const inventoryMovements: InventoryMovement[] = mRows.map((r) => ({
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

      const [aRows] = (await conn.query(
        "SELECT * FROM audit_logs ORDER BY timestamp DESC",
      )) as unknown as [Record<string, unknown>[]];
      const auditLogs: AuditLog[] = aRows.map((r) => ({
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
    } finally {
      conn.release();
    }
  }

  // Fallback to SQLite
  if (!sqliteHandle) {
    await initDatabase();
  }
  const db = sqliteHandle as SqliteDatabase;
  const users = db
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

  const warehouses = db
    .query("SELECT * FROM warehouses")
    .all()
    .map((r) => ({
      id: String(r.id),
      code: String(r.code),
      name: String(r.name),
      location: String(r.location),
      isActive: Number(r.is_active) === 1,
    }));

  const suppliers = db
    .query("SELECT * FROM suppliers")
    .all()
    .map((r) => ({
      id: String(r.id),
      name: String(r.name),
      email: String(r.email),
      phone: String(r.phone),
      isActive: Number(r.is_active) === 1,
    }));

  const products = db
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

  const purchaseRequests = db
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

  const purchaseOrders = db
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

  const goodsReceipts = db
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

  const inventoryBalances = db
    .query("SELECT * FROM inventory_balances")
    .all()
    .map((r) => ({
      warehouseId: String(r.warehouse_id),
      productId: String(r.product_id),
      stock: Number(r.stock),
    }));

  const inventoryMovements = db
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

  const auditLogs = db
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

export async function saveUsers(users: SqliteUserRow[]): Promise<void> {
  if (mysqlPool) {
    const conn = await mysqlPool.getConnection();
    await conn.beginTransaction();
    try {
      await conn.query("DELETE FROM users;");
      for (const u of users) {
        await conn.query(
          "INSERT INTO users (id, name, username, email, role, password_hash, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
          [
            u.id,
            u.name,
            u.username,
            u.email,
            u.role,
            u.passwordHash,
            u.status ?? "ACTIVE",
            u.createdAt,
          ],
        );
      }
      await conn.commit();
      return;
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  }

  if (!sqliteHandle) {
    await initDatabase();
  }
  const db = sqliteHandle as SqliteDatabase;
  db.exec("BEGIN TRANSACTION;");
  try {
    db.exec("DELETE FROM users;");
    const stmt = db.query(
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
    db.exec("COMMIT;");
  } catch (err) {
    db.exec("ROLLBACK;");
    throw err;
  }
}

export async function saveDatabaseSnapshot(
  snap: Partial<DatabaseSnapshot>,
): Promise<void> {
  if (mysqlPool) {
    const conn = await mysqlPool.getConnection();
    await conn.beginTransaction();
    try {
      await conn.query("DELETE FROM warehouses;");
      await conn.query("DELETE FROM suppliers;");
      await conn.query("DELETE FROM products;");
      await conn.query("DELETE FROM purchase_requests;");
      await conn.query("DELETE FROM purchase_orders;");
      await conn.query("DELETE FROM goods_receipts;");
      await conn.query("DELETE FROM inventory_balances;");
      await conn.query("DELETE FROM inventory_movements;");
      await conn.query("DELETE FROM audit_logs;");

      for (const w of snap.warehouses ?? []) {
        await conn.query(
          "INSERT INTO warehouses (id, code, name, location, is_active) VALUES (?, ?, ?, ?, ?)",
          [w.id, w.code, w.name, w.location, w.isActive ? 1 : 0],
        );
      }
      for (const s of snap.suppliers ?? []) {
        await conn.query(
          "INSERT INTO suppliers (id, name, email, phone, is_active) VALUES (?, ?, ?, ?, ?)",
          [s.id, s.name, s.email, s.phone, s.isActive ? 1 : 0],
        );
      }
      for (const p of snap.products ?? []) {
        await conn.query(
          "INSERT INTO products (id, sku, name, unit, min_stock, category, is_active) VALUES (?, ?, ?, ?, ?, ?, ?)",
          [
            p.id,
            p.sku,
            p.name,
            p.unit,
            p.minStock,
            p.category,
            p.isActive ? 1 : 0,
          ],
        );
      }
      for (const pr of snap.purchaseRequests ?? []) {
        await conn.query(
          "INSERT INTO purchase_requests (id, request_number, warehouse_id, status, created_by, created_at, notes, items_json) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
          [
            pr.id,
            pr.requestNumber,
            pr.warehouseId,
            pr.status,
            pr.createdBy,
            pr.createdAt,
            pr.notes ?? null,
            JSON.stringify(pr.items ?? []),
          ],
        );
      }
      for (const po of snap.purchaseOrders ?? []) {
        await conn.query(
          "INSERT INTO purchase_orders (id, po_number, purchase_request_id, supplier_id, warehouse_id, status, created_by, created_at, items_json) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
          [
            po.id,
            po.poNumber,
            po.purchaseRequestId,
            po.supplierId,
            po.warehouseId,
            po.status,
            po.createdBy,
            po.createdAt,
            JSON.stringify(po.items ?? []),
          ],
        );
      }
      for (const gr of snap.goodsReceipts ?? []) {
        await conn.query(
          "INSERT INTO goods_receipts (id, gr_number, purchase_order_id, received_by, received_at, items_json) VALUES (?, ?, ?, ?, ?, ?)",
          [
            gr.id,
            gr.grNumber,
            gr.purchaseOrderId,
            gr.receivedBy,
            gr.receivedAt,
            JSON.stringify(gr.items ?? []),
          ],
        );
      }
      for (const b of snap.inventoryBalances ?? []) {
        await conn.query(
          "INSERT INTO inventory_balances (warehouse_id, product_id, stock) VALUES (?, ?, ?)",
          [b.warehouseId, b.productId, b.stock],
        );
      }
      for (const m of snap.inventoryMovements ?? []) {
        await conn.query(
          "INSERT INTO inventory_movements (id, warehouse_id, product_id, movement_type, reference_type, reference_id, quantity, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
          [
            m.id,
            m.warehouseId,
            m.productId,
            m.movementType,
            m.referenceType ?? "GOODS_RECEIPT",
            m.referenceId,
            m.quantity,
            m.createdAt,
          ],
        );
      }
      for (const a of snap.auditLogs ?? []) {
        await conn.query(
          "INSERT INTO audit_logs (id, entity, entity_id, action, performed_by, timestamp, details) VALUES (?, ?, ?, ?, ?, ?, ?)",
          [
            a.id,
            a.entity,
            a.entityId,
            a.action,
            a.performedBy,
            a.timestamp,
            a.details ?? null,
          ],
        );
      }
      await conn.commit();
      return;
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  }

  if (!sqliteHandle) {
    await initDatabase();
  }
  const db = sqliteHandle as SqliteDatabase;
  db.exec("BEGIN TRANSACTION;");
  try {
    db.exec(`
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

    const insWh = db.query(
      "INSERT INTO warehouses (id, code, name, location, is_active) VALUES (?, ?, ?, ?, ?)",
    );
    for (const w of snap.warehouses ?? []) {
      insWh.run(w.id, w.code, w.name, w.location, w.isActive ? 1 : 0);
    }
    const insSup = db.query(
      "INSERT INTO suppliers (id, name, email, phone, is_active) VALUES (?, ?, ?, ?, ?)",
    );
    for (const s of snap.suppliers ?? []) {
      insSup.run(s.id, s.name, s.email, s.phone, s.isActive ? 1 : 0);
    }
    const insPrd = db.query(
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
    const insPr = db.query(
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
    const insPo = db.query(
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
    const insGr = db.query(
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
    const insBal = db.query(
      "INSERT INTO inventory_balances (warehouse_id, product_id, stock) VALUES (?, ?, ?)",
    );
    for (const b of snap.inventoryBalances ?? []) {
      insBal.run(b.warehouseId, b.productId, b.stock);
    }
    const insMov = db.query(
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
    const insAud = db.query(
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
    db.exec("COMMIT;");
  } catch (err) {
    db.exec("ROLLBACK;");
    throw err;
  }
}

export async function wipeDatabaseData(includeUsers = false): Promise<void> {
  if (mysqlPool) {
    const conn = await mysqlPool.getConnection();
    await conn.beginTransaction();
    try {
      await conn.query("DELETE FROM warehouses;");
      await conn.query("DELETE FROM suppliers;");
      await conn.query("DELETE FROM products;");
      await conn.query("DELETE FROM purchase_requests;");
      await conn.query("DELETE FROM purchase_orders;");
      await conn.query("DELETE FROM goods_receipts;");
      await conn.query("DELETE FROM inventory_balances;");
      await conn.query("DELETE FROM inventory_movements;");
      await conn.query("DELETE FROM audit_logs;");
      if (includeUsers) {
        await conn.query("DELETE FROM users;");
      }
      await conn.commit();
      return;
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  }

  if (!sqliteHandle) {
    await initDatabase();
  }
  const db = sqliteHandle as SqliteDatabase;
  db.exec("BEGIN TRANSACTION;");
  try {
    db.exec(`
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
      db.exec("DELETE FROM users;");
    }
    db.exec("COMMIT;");
  } catch (err) {
    db.exec("ROLLBACK;");
    throw err;
  }
}

export async function closeDatabase(): Promise<void> {
  if (mysqlPool) {
    await mysqlPool.end();
    mysqlPool = null;
  }
}
