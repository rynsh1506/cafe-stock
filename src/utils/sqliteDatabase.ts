import { invoke } from "@tauri-apps/api/core";
import {
  AuditLog,
  GoodsReceipt,
  InventoryBalance,
  InventoryMovement,
  Product,
  PurchaseOrder,
  PurchaseRequest,
  Supplier,
  UserRole,
  Warehouse,
} from "@/types";

export interface SqliteUserRow {
  id: string;
  name: string;
  username: string;
  email: string;
  role: UserRole;
  passwordHash: string;
  status?: "ACTIVE" | "PENDING" | "REJECTED";
  createdAt: string;
}

export interface DatabaseSnapshot {
  version: number;
  updatedAt: string;
  users?: SqliteUserRow[];
  products: Product[];
  suppliers: Supplier[];
  warehouses: Warehouse[];
  purchaseRequests: PurchaseRequest[];
  purchaseOrders: PurchaseOrder[];
  goodsReceipts: GoodsReceipt[];
  inventoryBalances: InventoryBalance[];
  inventoryMovements: InventoryMovement[];
  auditLogs: AuditLog[];
}

const LEGACY_MOCK_KEYS = [
  "kr_store_products_v1",
  "kr_store_suppliers_v1",
  "kr_store_warehouses_v1",
  "kr_store_prs_v1",
  "kr_store_pos_v1",
  "kr_store_grs_v1",
  "kr_store_balances_v1",
  "kr_store_movements_v1",
  "kr_store_audits_v1",
  "kr_db_products_v2",
  "kr_db_suppliers_v2",
  "kr_db_warehouses_v2",
  "kr_db_purchase_requests_v2",
  "kr_db_purchase_orders_v2",
  "kr_db_goods_receipts_v2",
  "kr_db_inventory_balances_v2",
  "kr_db_inventory_movements_v2",
  "kr_db_audit_logs_v2",
];

export const DB_TABLE_KEYS = {
  USERS: "users",
  PRODUCTS: "products",
  SUPPLIERS: "suppliers",
  WAREHOUSES: "warehouses",
  PRS: "purchase_requests",
  POS: "purchase_orders",
  GRS: "goods_receipts",
  BALANCES: "inventory_balances",
  MOVEMENTS: "inventory_movements",
  AUDITS: "audit_logs",
} as const;

const IDB_NAME = "cafe_stock_db";
const IDB_STORE = "tables";

/**
 * Purges legacy v1/v2 mock keys so old pre-populated dummy data is removed.
 */
export function purgeLegacyMockStorage(): void {
  try {
    for (const key of LEGACY_MOCK_KEYS) {
      window.localStorage.removeItem(key);
    }
  } catch {
    // ignore storage errors
  }
}

export function readTableSync<T>(tableKey: string, emptyFallback: T): T {
  try {
    const raw = window.localStorage.getItem(tableKey);
    if (!raw) {
      return emptyFallback;
    }
    return JSON.parse(raw) as T;
  } catch {
    return emptyFallback;
  }
}

function writeIndexedDbSnapshot(snapshot: DatabaseSnapshot): void {
  try {
    if (typeof window === "undefined" || !("indexedDB" in window)) {
      return;
    }
    const req = window.indexedDB.open(IDB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(IDB_STORE)) {
        db.createObjectStore(IDB_STORE);
      }
    };
    req.onsuccess = () => {
      const db = req.result;
      const tx = db.transaction(IDB_STORE, "readwrite");
      tx.objectStore(IDB_STORE).put(snapshot, "latest_snapshot");
    };
  } catch {
    // ignore IndexedDB errors in restricted environments
  }
}

export function writeTableSync<T>(tableKey: string, rows: T): void {
  try {
    window.localStorage.setItem(tableKey, JSON.stringify(rows));
  } catch {
    // ignore quota errors
  }
}

/**
 * Persists user accounts directly into the `users` table of `database/cafe_stock.sqlite`.
 */
export async function syncUsersToSqliteDatabase(
  users: SqliteUserRow[],
): Promise<void> {
  writeTableSync(DB_TABLE_KEYS.USERS, users);
  try {
    await fetch("/api/sqlite/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ users }),
    });
  } catch {
    // Fallback when running as standalone packaged Tauri binary without Vite dev server
  }
}

/**
 * Loads user accounts from the `users` table in `database/cafe_stock.sqlite`.
 */
export async function loadUsersFromSqliteDatabase(): Promise<
  SqliteUserRow[] | null
> {
  try {
    const res = await fetch("/api/sqlite/snapshot");
    if (res.ok) {
      const data = (await res.json()) as {
        ok: boolean;
        snapshot?: DatabaseSnapshot;
      };
      if (data.ok && data.snapshot && Array.isArray(data.snapshot.users)) {
        return data.snapshot.users;
      }
    }
  } catch {
    // ignore fetch error in standalone packaged binary
  }
  return null;
}

export async function syncSnapshotToNativeDatabase(
  snapshot: DatabaseSnapshot,
): Promise<string | null> {
  writeIndexedDbSnapshot(snapshot);
  try {
    const res = await fetch("/api/sqlite/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(snapshot),
    });
    if (res.ok) {
      const data = (await res.json()) as { ok: boolean; dbPath?: string };
      if (data.ok && data.dbPath) {
        return data.dbPath;
      }
    }
  } catch {
    // Fallback to Tauri native invoke below
  }

  try {
    const filePath = await invoke<string>("db_save_snapshot", {
      payload: JSON.stringify(snapshot, null, 2),
    });
    return filePath;
  } catch {
    return null;
  }
}

export async function loadSnapshotFromNativeDatabase(): Promise<DatabaseSnapshot | null> {
  try {
    const res = await fetch("/api/sqlite/snapshot");
    if (res.ok) {
      const data = (await res.json()) as {
        ok: boolean;
        snapshot?: DatabaseSnapshot;
      };
      if (data.ok && data.snapshot) {
        return data.snapshot;
      }
    }
  } catch {
    // Fallback to Tauri native invoke below
  }

  try {
    const raw = await invoke<string | null>("db_load_snapshot");
    if (!raw) {
      return null;
    }
    return JSON.parse(raw) as DatabaseSnapshot;
  } catch {
    return null;
  }
}

export async function clearNativeDatabase(includeUsers = false): Promise<void> {
  try {
    await fetch("/api/sqlite/wipe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ includeUsers }),
    });
  } catch {
    // ignore when offline
  }

  try {
    await invoke("db_clear_snapshot");
  } catch {
    // ignore when running in browser dev mode
  }
}

function escSql(val: string | undefined | null): string {
  if (val === undefined || val === null) {
    return "NULL";
  }
  return `'${String(val).replace(/'/g, "''")}'`;
}

/**
 * Generates portable SQL DDL + INSERT statements compatible with SQLite3, PostgreSQL, and MariaDB.
 */
export function generatePortableSqlDump(snapshot: DatabaseSnapshot): string {
  const users = readTableSync<SqliteUserRow[]>(DB_TABLE_KEYS.USERS, []);
  const lines: string[] = [
    "-- ============================================================================",
    "-- PORTABLE SQL DATABASE DUMP (SQLite3 / PostgreSQL / MariaDB Compatible)",
    `-- Generated At: ${snapshot.updatedAt}`,
    "-- ============================================================================",
    "",
    "BEGIN TRANSACTION;",
    "",
    "CREATE TABLE IF NOT EXISTS users (",
    "  id VARCHAR(64) PRIMARY KEY,",
    "  name VARCHAR(120) NOT NULL,",
    "  username VARCHAR(64) NOT NULL UNIQUE,",
    "  email VARCHAR(120) NOT NULL UNIQUE,",
    "  role VARCHAR(32) NOT NULL,",
    "  password_hash VARCHAR(255) NOT NULL,",
    "  status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE',",
    "  created_at VARCHAR(64) NOT NULL",
    ");",
    "",
    "CREATE TABLE IF NOT EXISTS warehouses (",
    "  id VARCHAR(64) PRIMARY KEY,",
    "  code VARCHAR(32) NOT NULL UNIQUE,",
    "  name VARCHAR(120) NOT NULL,",
    "  location VARCHAR(255) NOT NULL,",
    "  is_active BOOLEAN NOT NULL DEFAULT TRUE",
    ");",
    "",
    "CREATE TABLE IF NOT EXISTS suppliers (",
    "  id VARCHAR(64) PRIMARY KEY,",
    "  name VARCHAR(120) NOT NULL,",
    "  email VARCHAR(120) NOT NULL,",
    "  phone VARCHAR(64) NOT NULL,",
    "  is_active BOOLEAN NOT NULL DEFAULT TRUE",
    ");",
    "",
    "CREATE TABLE IF NOT EXISTS products (",
    "  id VARCHAR(64) PRIMARY KEY,",
    "  sku VARCHAR(64) NOT NULL UNIQUE,",
    "  name VARCHAR(160) NOT NULL,",
    "  unit VARCHAR(32) NOT NULL,",
    "  min_stock INT NOT NULL DEFAULT 0,",
    "  category VARCHAR(80) NOT NULL,",
    "  is_active BOOLEAN NOT NULL DEFAULT TRUE",
    ");",
    "",
    "CREATE TABLE IF NOT EXISTS purchase_requests (",
    "  id VARCHAR(64) PRIMARY KEY,",
    "  request_number VARCHAR(64) NOT NULL UNIQUE,",
    "  warehouse_id VARCHAR(64) NOT NULL,",
    "  status VARCHAR(32) NOT NULL,",
    "  created_by VARCHAR(80) NOT NULL,",
    "  created_at VARCHAR(64) NOT NULL,",
    "  notes TEXT",
    ");",
    "",
    "CREATE TABLE IF NOT EXISTS purchase_orders (",
    "  id VARCHAR(64) PRIMARY KEY,",
    "  po_number VARCHAR(64) NOT NULL UNIQUE,",
    "  purchase_request_id VARCHAR(64) NOT NULL UNIQUE,",
    "  supplier_id VARCHAR(64) NOT NULL,",
    "  warehouse_id VARCHAR(64) NOT NULL,",
    "  status VARCHAR(32) NOT NULL,",
    "  created_by VARCHAR(80) NOT NULL,",
    "  created_at VARCHAR(64) NOT NULL",
    ");",
    "",
    "CREATE TABLE IF NOT EXISTS goods_receipts (",
    "  id VARCHAR(64) PRIMARY KEY,",
    "  gr_number VARCHAR(64) NOT NULL UNIQUE,",
    "  purchase_order_id VARCHAR(64) NOT NULL,",
    "  received_by VARCHAR(80) NOT NULL,",
    "  received_at VARCHAR(64) NOT NULL",
    ");",
    "",
    "CREATE TABLE IF NOT EXISTS inventory_balances (",
    "  warehouse_id VARCHAR(64) NOT NULL,",
    "  product_id VARCHAR(64) NOT NULL,",
    "  stock INT NOT NULL DEFAULT 0,",
    "  PRIMARY KEY (warehouse_id, product_id)",
    ");",
    "",
  ];

  for (const u of users) {
    lines.push(
      `INSERT INTO users (id, name, username, email, role, password_hash, status, created_at) VALUES (${escSql(u.id)}, ${escSql(u.name)}, ${escSql(u.username)}, ${escSql(u.email)}, ${escSql(u.role)}, ${escSql(u.passwordHash)}, ${escSql(u.status ?? "ACTIVE")}, ${escSql(u.createdAt)});`,
    );
  }
  for (const w of snapshot.warehouses) {
    lines.push(
      `INSERT INTO warehouses (id, code, name, location, is_active) VALUES (${escSql(w.id)}, ${escSql(w.code)}, ${escSql(w.name)}, ${escSql(w.location)}, ${w.isActive ? "TRUE" : "FALSE"});`,
    );
  }
  for (const s of snapshot.suppliers) {
    lines.push(
      `INSERT INTO suppliers (id, name, email, phone, is_active) VALUES (${escSql(s.id)}, ${escSql(s.name)}, ${escSql(s.email)}, ${escSql(s.phone)}, ${s.isActive ? "TRUE" : "FALSE"});`,
    );
  }
  for (const p of snapshot.products) {
    lines.push(
      `INSERT INTO products (id, sku, name, unit, min_stock, category, is_active) VALUES (${escSql(p.id)}, ${escSql(p.sku)}, ${escSql(p.name)}, ${escSql(p.unit)}, ${p.minStock}, ${escSql(p.category)}, ${p.isActive ? "TRUE" : "FALSE"});`,
    );
  }
  for (const pr of snapshot.purchaseRequests) {
    lines.push(
      `INSERT INTO purchase_requests (id, request_number, warehouse_id, status, created_by, created_at, notes) VALUES (${escSql(pr.id)}, ${escSql(pr.requestNumber)}, ${escSql(pr.warehouseId)}, ${escSql(pr.status)}, ${escSql(pr.createdBy)}, ${escSql(pr.createdAt)}, ${escSql(pr.notes)});`,
    );
  }
  for (const po of snapshot.purchaseOrders) {
    lines.push(
      `INSERT INTO purchase_orders (id, po_number, purchase_request_id, supplier_id, warehouse_id, status, created_by, created_at) VALUES (${escSql(po.id)}, ${escSql(po.poNumber)}, ${escSql(po.purchaseRequestId)}, ${escSql(po.supplierId)}, ${escSql(po.warehouseId)}, ${escSql(po.status)}, ${escSql(po.createdBy)}, ${escSql(po.createdAt)});`,
    );
  }
  for (const gr of snapshot.goodsReceipts) {
    lines.push(
      `INSERT INTO goods_receipts (id, gr_number, purchase_order_id, received_by, received_at) VALUES (${escSql(gr.id)}, ${escSql(gr.grNumber)}, ${escSql(gr.purchaseOrderId)}, ${escSql(gr.receivedBy)}, ${escSql(gr.receivedAt)});`,
    );
  }
  for (const bal of snapshot.inventoryBalances) {
    lines.push(
      `INSERT INTO inventory_balances (warehouse_id, product_id, stock) VALUES (${escSql(bal.warehouseId)}, ${escSql(bal.productId)}, ${bal.stock});`,
    );
  }

  lines.push("", "COMMIT;");
  return lines.join("\n");
}
