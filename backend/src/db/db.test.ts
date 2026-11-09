import { beforeAll, describe, expect, it } from "bun:test";
import { eq } from "drizzle-orm";
import { db, resetDatabaseConnection } from "@/db/index";
import { runMigrations } from "@/db/migrate";
import { products, suppliers, users, warehouses } from "@/db/schema";
import { seedDatabase } from "@/db/seed";
import { verifyPassword } from "@/utils/crypto";

/**
 * Unit and integration tests for the PostgreSQL Drizzle ORM schema (`src/db/schema.ts`),
 * migration runner (`src/db/migrate.ts`), idempotent master data seeder (`src/db/seed.ts`),
 * and atomic database transactions.
 */
describe("PostgreSQL Drizzle Schema, Migrations & Seeder", () => {
  beforeAll(async () => {
    resetDatabaseConnection("pglite");
    await runMigrations();
  });

  describe("Database Seeder & RBAC Accounts", () => {
    it("seeds initial USER, APPROVER, warehouses, suppliers, and products idempotently", async () => {
      const firstRun = await seedDatabase();
      expect(firstRun.usersCount).toBe(2);
      expect(firstRun.warehousesCount).toBe(2);
      expect(firstRun.suppliersCount).toBe(3);
      expect(firstRun.productsCount).toBe(5);

      const secondRun = await seedDatabase();
      expect(secondRun.usersCount).toBe(2);
      expect(secondRun.warehousesCount).toBe(2);
      expect(secondRun.suppliersCount).toBe(3);
      expect(secondRun.productsCount).toBe(5);
    });

    it("stores hashed passwords that verify against USER and APPROVER credentials", async () => {
      const [staff] = await db
        .select()
        .from(users)
        .where(eq(users.email, "staff@cafestock.com"));
      expect(staff).toBeDefined();
      expect(staff?.role).toBe("USER");
      expect(verifyPassword("User123!", staff?.passwordHash ?? "")).toBe(true);
      expect(verifyPassword("WrongPass", staff?.passwordHash ?? "")).toBe(
        false,
      );

      const [approver] = await db
        .select()
        .from(users)
        .where(eq(users.email, "approver@cafestock.com"));
      expect(approver).toBeDefined();
      expect(approver?.role).toBe("APPROVER");
      expect(verifyPassword("Approver123!", approver?.passwordHash ?? "")).toBe(
        true,
      );
    });
  });

  describe("Atomic Drizzle Transactions", () => {
    it("rolls back all changes when an error occurs inside a transaction", async () => {
      const beforeWarehouses = await db.select().from(warehouses);

      let caughtError: Error | null = null;
      try {
        await db.transaction(async (tx) => {
          await tx.insert(warehouses).values({
            code: "WH-ROLLBACK-99",
            name: "Temporary Rollback Warehouse",
            address: "Test Street",
          });
          throw new Error("Simulated transaction failure");
        });
      } catch (err) {
        caughtError = err instanceof Error ? err : new Error(String(err));
      }

      expect(caughtError).not.toBeNull();
      const afterWarehouses = await db.select().from(warehouses);
      expect(afterWarehouses.length).toBe(beforeWarehouses.length);

      const rolledBack = await db
        .select()
        .from(warehouses)
        .where(eq(warehouses.code, "WH-ROLLBACK-99"));
      expect(rolledBack.length).toBe(0);
    });

    it("enforces unique constraints on product SKU and supplier code", async () => {
      let duplicateSkuFailed = false;
      try {
        await db.insert(products).values({
          sku: "SKU-ESP-001",
          name: "Duplicate Espresso SKU",
          unit: "bag",
        });
      } catch {
        duplicateSkuFailed = true;
      }
      expect(duplicateSkuFailed).toBe(true);

      let duplicateSupplierFailed = false;
      try {
        await db.insert(suppliers).values({
          code: "SUP-ARB-01",
          name: "Duplicate Supplier Code",
        });
      } catch {
        duplicateSupplierFailed = true;
      }
      expect(duplicateSupplierFailed).toBe(true);
    });
  });
});
