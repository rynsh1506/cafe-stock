import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import {
  fetchDatabaseSnapshot,
  initSqliteDatabase,
  saveDatabaseSnapshot,
  saveUsers,
  SqliteDatabaseHandle,
  wipeDatabaseData,
} from "@/server/database";
import { handleApiRoute } from "@/server/api";
import { SqliteUserRow } from "@/utils/sqliteDatabase";

/**
 * Unit test suite validating the standalone SQLite database persistence engine
 * and API router handlers for CafeStock.
 */
describe("Database & API Server Engine", () => {
  const testDbFile = path.resolve(
    process.cwd(),
    "database",
    "test_cafe_stock.sqlite",
  );
  let db: SqliteDatabaseHandle;

  beforeAll(() => {
    if (fs.existsSync(testDbFile)) {
      fs.unlinkSync(testDbFile);
    }
    db = initSqliteDatabase(testDbFile);
  });

  afterAll(() => {
    try {
      if (fs.existsSync(testDbFile)) {
        fs.unlinkSync(testDbFile);
      }
      const shm = `${testDbFile}-shm`;
      const wal = `${testDbFile}-wal`;
      if (fs.existsSync(shm)) fs.unlinkSync(shm);
      if (fs.existsSync(wal)) fs.unlinkSync(wal);
    } catch {
      // ignore cleanup errors
    }
  });

  describe("User Persistence Operations", () => {
    it("should save and retrieve user records accurately", () => {
      const mockUsers: SqliteUserRow[] = [
        {
          id: "usr-admin-1",
          name: "Test Admin",
          username: "admin_test",
          email: "admin@test.local",
          role: "APPROVER",
          passwordHash: "hash123",
          status: "ACTIVE",
          createdAt: "2026-10-26T00:00:00.000Z",
        },
        {
          id: "usr-staff-1",
          name: "Test Staff",
          username: "staff_test",
          email: "staff@test.local",
          role: "USER",
          passwordHash: "hash456",
          status: "ACTIVE",
          createdAt: "2026-10-26T00:00:00.000Z",
        },
      ];

      saveUsers(db, mockUsers);
      const snapshot = fetchDatabaseSnapshot(db);

      expect(snapshot.users?.length).toBe(2);
      expect(snapshot.users?.[0].username).toBe("admin_test");
      expect(snapshot.users?.[0].role).toBe("APPROVER");
      expect(snapshot.users?.[1].username).toBe("staff_test");
      expect(snapshot.users?.[1].role).toBe("USER");
    });
  });

  describe("Procurement Snapshot Operations", () => {
    it("should atomically save and load products, warehouses, and balances", () => {
      saveDatabaseSnapshot(db, {
        warehouses: [
          {
            id: "wh-test-1",
            code: "WH-T1",
            name: "Central Hub",
            location: "Jakarta",
            isActive: true,
          },
        ],
        suppliers: [
          {
            id: "sup-test-1",
            name: "Coffee Supply Co",
            email: "supply@coffee.test",
            phone: "08123456789",
            isActive: true,
          },
        ],
        products: [
          {
            id: "prd-test-1",
            sku: "SKU-BEANS-01",
            name: "Arabica Roast",
            unit: "KG",
            minStock: 10,
            category: "COFFEE",
            isActive: true,
          },
        ],
        inventoryBalances: [
          {
            warehouseId: "wh-test-1",
            productId: "prd-test-1",
            stock: 45,
          },
        ],
        purchaseRequests: [
          {
            id: "pr-test-1",
            requestNumber: "PR-2026-0001",
            warehouseId: "wh-test-1",
            status: "SUBMITTED",
            createdBy: "staff_test",
            createdAt: "2026-10-26T01:00:00.000Z",
            notes: "Initial test request",
            items: [{ id: "pri-1", productId: "prd-test-1", quantity: 20 }],
          },
        ],
        purchaseOrders: [],
        goodsReceipts: [],
        inventoryMovements: [],
        auditLogs: [],
      });

      const snapshot = fetchDatabaseSnapshot(db);

      expect(snapshot.warehouses.length).toBe(1);
      expect(snapshot.warehouses[0].code).toBe("WH-T1");
      expect(snapshot.products.length).toBe(1);
      expect(snapshot.products[0].sku).toBe("SKU-BEANS-01");
      expect(snapshot.inventoryBalances.length).toBe(1);
      expect(snapshot.inventoryBalances[0].stock).toBe(45);
      expect(snapshot.purchaseRequests.length).toBe(1);
      expect(snapshot.purchaseRequests[0].items.length).toBe(1);
    });

    it("should wipe data while preserving users when requested", () => {
      wipeDatabaseData(db, false);
      const snapshot = fetchDatabaseSnapshot(db);

      expect(snapshot.warehouses.length).toBe(0);
      expect(snapshot.products.length).toBe(0);
      expect(snapshot.purchaseRequests.length).toBe(0);
      expect(snapshot.users?.length).toBe(2);
    });

    it("should wipe data and users when includeUsers is true", () => {
      wipeDatabaseData(db, true);
      const snapshot = fetchDatabaseSnapshot(db);

      expect(snapshot.users?.length).toBe(0);
      expect(snapshot.warehouses.length).toBe(0);
    });
  });

  describe("API Route Handlers", () => {
    it("should respond with health status on GET /api/health", async () => {
      const req = new Request("http://localhost:3000/api/health", {
        method: "GET",
      });
      const url = new URL(req.url);
      const res = await handleApiRoute(req, url, db);

      expect(res.status).toBe(200);
      const body = (await res.json()) as { ok: boolean; status: string };
      expect(body.ok).toBe(true);
      expect(body.status).toBe("healthy");
    });

    it("should persist users through POST /api/sqlite/users", async () => {
      const payload = {
        users: [
          {
            id: "u-api-1",
            name: "API User",
            username: "api_user",
            email: "api@test.com",
            role: "USER" as const,
            passwordHash: "secret",
            status: "ACTIVE" as const,
            createdAt: "2026-10-26T02:00:00.000Z",
          },
        ],
      };
      const req = new Request("http://localhost:3000/api/sqlite/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const url = new URL(req.url);
      const res = await handleApiRoute(req, url, db);

      expect(res.status).toBe(200);
      const body = (await res.json()) as { ok: boolean; count: number };
      expect(body.ok).toBe(true);
      expect(body.count).toBe(1);

      const snapshot = fetchDatabaseSnapshot(db);
      expect(snapshot.users?.length).toBe(1);
      expect(snapshot.users?.[0].username).toBe("api_user");
    });

    it("should return snapshot through GET /api/sqlite/snapshot", async () => {
      const req = new Request("http://localhost:3000/api/sqlite/snapshot", {
        method: "GET",
      });
      const url = new URL(req.url);
      const res = await handleApiRoute(req, url, db);

      expect(res.status).toBe(200);
      const body = (await res.json()) as {
        ok: boolean;
        snapshot: { users: unknown[] };
      };
      expect(body.ok).toBe(true);
      expect(body.snapshot.users.length).toBe(1);
    });

    it("should return 400 for invalid user payload", async () => {
      const req = new Request("http://localhost:3000/api/sqlite/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invalid: true }),
      });
      const url = new URL(req.url);
      const res = await handleApiRoute(req, url, db);

      expect(res.status).toBe(400);
      const body = (await res.json()) as {
        ok: boolean;
        error: { code: string };
      };
      expect(body.ok).toBe(false);
      expect(body.error.code).toBe("INVALID_REQUEST_BODY");
    });

    it("should return 404 for unknown API endpoints", async () => {
      const req = new Request("http://localhost:3000/api/unknown-endpoint", {
        method: "GET",
      });
      const url = new URL(req.url);
      const res = await handleApiRoute(req, url, db);

      expect(res.status).toBe(404);
      const body = (await res.json()) as {
        ok: boolean;
        error: { code: string };
      };
      expect(body.ok).toBe(false);
      expect(body.error.code).toBe("NOT_FOUND");
    });
  });
});
