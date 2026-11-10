import { eq } from "drizzle-orm";
import { db, getDatabaseConnection } from "@/db/index";
import {
  inventoryBalances,
  products,
  suppliers,
  users,
  warehouses,
} from "@/db/schema";
import { hashPassword } from "@/utils/crypto";
import { logger } from "@/utils/logger";

export interface SeedResult {
  usersCount: number;
  warehousesCount: number;
  suppliersCount: number;
  productsCount: number;
}

export async function seedDatabase(options?: {
  seedUsers?: boolean;
}): Promise<SeedResult> {
  logger.info("Starting database master data seeding");

  const isTest =
    process.env.NODE_ENV === "test" ||
    Boolean(process.env.BUN_TEST) ||
    typeof (globalThis as Record<string, unknown>).describe === "function";

  const shouldSeedUsers =
    options?.seedUsers ??
    (isTest || process.env.SEED_DEFAULT_USERS !== "false");

  if (shouldSeedUsers) {
    const defaultUserEmail =
      process.env.SEED_USER_EMAIL || "staff@cafestock.com";
    const defaultUserPassword = process.env.SEED_USER_PASSWORD || "User123!";
    const defaultApproverEmail =
      process.env.SEED_APPROVER_EMAIL || "approver@cafestock.com";
    const defaultApproverPassword =
      process.env.SEED_APPROVER_PASSWORD || "Approver123!";

    const existingStaff = await db
      .select()
      .from(users)
      .where(eq(users.email, defaultUserEmail));

    if (existingStaff.length === 0) {
      await db.insert(users).values({
        email: defaultUserEmail,
        name: "Budi Santoso (Barista & Inventory Staff)",
        passwordHash: hashPassword(defaultUserPassword),
        role: "USER",
        isActive: true,
      });
    }

    const existingApprover = await db
      .select()
      .from(users)
      .where(eq(users.email, defaultApproverEmail));

    if (existingApprover.length === 0) {
      await db.insert(users).values({
        email: defaultApproverEmail,
        name: "Siti Rahma (Procurement Approver)",
        passwordHash: hashPassword(defaultApproverPassword),
        role: "APPROVER",
        isActive: true,
      });
    }
  }

  const seedWarehouses = [
    {
      code: "WH-JKT-01",
      name: "Main Roastery & Central Warehouse",
      address: "Jl. Senopati No. 42, Jakarta Selatan",
    },
    {
      code: "WH-BDG-02",
      name: "Bandung Flagship Store Warehouse",
      address: "Jl. Braga No. 88, Bandung",
    },
  ];

  for (const wh of seedWarehouses) {
    const existing = await db
      .select()
      .from(warehouses)
      .where(eq(warehouses.code, wh.code));
    if (existing.length === 0) {
      await db.insert(warehouses).values(wh);
    }
  }

  const seedSuppliers = [
    {
      code: "SUP-ARB-01",
      name: "Nusantara Arabica Direct",
      contactEmail: "orders@nusantara-arabica.co.id",
      phone: "+62-21-5550191",
      address: "Jl. Gayo Raya No. 12, Aceh Tengah",
    },
    {
      code: "SUP-DRY-02",
      name: "GreenFields Dairy Partner",
      contactEmail: "supply@greenfields-partner.id",
      phone: "+62-21-5550282",
      address: "Kawasan Industri Jababeka Blok C4, Cikarang",
    },
    {
      code: "SUP-PKG-03",
      name: "EcoCup Packaging Indonesia",
      contactEmail: "sales@ecocup.co.id",
      phone: "+62-22-7201122",
      address: "Jl. Soekarno Hatta No. 310, Bandung",
    },
  ];

  for (const sup of seedSuppliers) {
    const existing = await db
      .select()
      .from(suppliers)
      .where(eq(suppliers.code, sup.code));
    if (existing.length === 0) {
      await db.insert(suppliers).values(sup);
    }
  }

  const seedProducts = [
    {
      sku: "SKU-ESP-001",
      name: "House Blend Espresso Beans 1kg",
      category: "Coffee Beans",
      unit: "bag",
      unitPrice: 215000,
      minStock: 15,
    },
    {
      sku: "SKU-MLK-002",
      name: "Barista Fresh Milk 1L",
      category: "Dairy & Plant Milk",
      unit: "carton",
      unitPrice: 29000,
      minStock: 40,
    },
    {
      sku: "SKU-SYR-003",
      name: "Madagascar Vanilla Syrup 750ml",
      category: "Syrups & Sauces",
      unit: "bottle",
      unitPrice: 135000,
      minStock: 10,
    },
    {
      sku: "SKU-CUP-004",
      name: "Hot Paper Cup 12oz (Pack of 50)",
      category: "Packaging",
      unit: "pack",
      unitPrice: 48000,
      minStock: 25,
    },
    {
      sku: "SKU-MAT-005",
      name: "Uji Ceremonial Matcha Powder 500g",
      category: "Tea & Powder",
      unit: "tin",
      unitPrice: 340000,
      minStock: 8,
    },
  ];

  for (const prod of seedProducts) {
    const existing = await db
      .select()
      .from(products)
      .where(eq(products.sku, prod.sku));
    if (existing.length === 0) {
      await db.insert(products).values(prod);
    }
  }

  const allWarehouses = await db.select().from(warehouses);
  const allProducts = await db.select().from(products);
  const mainWarehouse = allWarehouses.find((w) => w.code === "WH-JKT-01");

  if (mainWarehouse) {
    for (const product of allProducts) {
      const existingBalances = await db
        .select()
        .from(inventoryBalances)
        .where(eq(inventoryBalances.productId, product.id));

      if (existingBalances.length === 0) {
        await db.insert(inventoryBalances).values({
          warehouseId: mainWarehouse.id,
          productId: product.id,
          quantity: product.minStock + 10,
        });
      }
    }
  }

  const allUsers = await db.select().from(users);
  const allSuppliers = await db.select().from(suppliers);

  const summary: SeedResult = {
    usersCount: allUsers.length,
    warehousesCount: allWarehouses.length,
    suppliersCount: allSuppliers.length,
    productsCount: allProducts.length,
  };

  logger.info("Database master data seeding completed", { ...summary });
  return summary;
}

if (import.meta.main) {
  seedDatabase()
    .then(async () => {
      const conn = getDatabaseConnection();
      if (conn.sqlClient) {
        await conn.sqlClient.end();
      }
      process.exit(0);
    })
    .catch((err) => {
      logger.error("Database seeding failed", {
        error: err instanceof Error ? err.message : String(err),
      });
      process.exit(1);
    });
}
