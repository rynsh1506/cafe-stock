import { and, count, desc, eq, ilike, or, type SQL } from "drizzle-orm";
import { db } from "@/db/index";
import { products } from "@/db/schema";
import type { AuthenticatedUser } from "@/modules/auth/model";
import type {
  CreateProductInput,
  ListProductsQuery,
  UpdateProductInput,
} from "@/modules/products/model";
import { recordAuditLog } from "@/utils/audit";
import { AppError } from "@/utils/errors";
import {
  buildPaginatedResponse,
  parsePagination,
  type PaginatedResponse,
} from "@/utils/pagination";

export type ProductRecord = typeof products.$inferSelect;

export async function listProducts(
  query: ListProductsQuery,
): Promise<PaginatedResponse<ProductRecord>> {
  const pagination = parsePagination(query);
  const conditions: SQL[] = [];

  if (query.search && query.search.trim().length > 0) {
    const pattern = `%${query.search.trim()}%`;
    const searchCondition = or(
      ilike(products.name, pattern),
      ilike(products.sku, pattern),
    );
    if (searchCondition) {
      conditions.push(searchCondition);
    }
  }

  if (query.category && query.category.trim().length > 0) {
    conditions.push(eq(products.category, query.category.trim()));
  }

  if (query.isActive === "true" || query.isActive === "false") {
    conditions.push(eq(products.isActive, query.isActive === "true"));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const [totalRow] = await db
    .select({ value: count() })
    .from(products)
    .where(whereClause);

  const rows = await db
    .select()
    .from(products)
    .where(whereClause)
    .orderBy(desc(products.createdAt))
    .limit(pagination.limit)
    .offset(pagination.offset);

  return buildPaginatedResponse(rows, Number(totalRow?.value ?? 0), pagination);
}

export async function getProductById(id: string): Promise<ProductRecord> {
  const [product] = await db.select().from(products).where(eq(products.id, id));
  if (!product) {
    throw AppError.notFound("PRODUCT_NOT_FOUND", `Product ${id} was not found`);
  }
  return product;
}

export async function createProduct(
  input: CreateProductInput,
  actor: AuthenticatedUser,
): Promise<ProductRecord> {
  const sku = input.sku.trim().toUpperCase();
  const name = input.name.trim();
  const unit = input.unit.trim();

  if (!sku || !name || !unit) {
    throw AppError.badRequest(
      "INVALID_PRODUCT_INPUT",
      "SKU, name, and unit are required",
    );
  }

  const [existing] = await db
    .select()
    .from(products)
    .where(eq(products.sku, sku));

  if (existing) {
    throw AppError.unprocessable(
      "DUPLICATE_PRODUCT_SKU",
      `A product with SKU '${sku}' already exists`,
    );
  }

  const [created] = await db
    .insert(products)
    .values({
      sku,
      name,
      category: input.category?.trim() || "General",
      unit,
      unitPrice: Math.max(0, Math.floor(input.unitPrice ?? 0)),
      minStock: Math.max(0, Math.floor(input.minStock ?? 10)),
      isActive: input.isActive ?? true,
    })
    .returning();

  if (!created) {
    throw new AppError(
      500,
      "PRODUCT_CREATE_FAILED",
      "Failed to create product",
    );
  }

  await recordAuditLog({
    actor,
    action: "PRODUCT_CREATED",
    entityType: "PRODUCT",
    entityId: created.id,
    summary: `Created product ${created.sku} (${created.name})`,
  });

  return created;
}

export async function updateProduct(
  id: string,
  input: UpdateProductInput,
  actor: AuthenticatedUser,
): Promise<ProductRecord> {
  const current = await getProductById(id);

  let nextSku = current.sku;
  if (input.sku !== undefined) {
    nextSku = input.sku.trim().toUpperCase();
    if (!nextSku) {
      throw AppError.badRequest("INVALID_PRODUCT_SKU", "SKU cannot be empty");
    }
    if (nextSku !== current.sku) {
      const [dup] = await db
        .select()
        .from(products)
        .where(eq(products.sku, nextSku));
      if (dup) {
        throw AppError.unprocessable(
          "DUPLICATE_PRODUCT_SKU",
          `A product with SKU '${nextSku}' already exists`,
        );
      }
    }
  }

  const [updated] = await db
    .update(products)
    .set({
      sku: nextSku,
      name: input.name !== undefined ? input.name.trim() : current.name,
      category:
        input.category !== undefined ? input.category.trim() : current.category,
      unit: input.unit !== undefined ? input.unit.trim() : current.unit,
      unitPrice:
        input.unitPrice !== undefined
          ? Math.max(0, Math.floor(input.unitPrice))
          : current.unitPrice,
      minStock:
        input.minStock !== undefined
          ? Math.max(0, Math.floor(input.minStock))
          : current.minStock,
      isActive:
        input.isActive !== undefined ? input.isActive : current.isActive,
      updatedAt: new Date(),
    })
    .where(eq(products.id, id))
    .returning();

  if (!updated) {
    throw AppError.notFound("PRODUCT_NOT_FOUND", `Product ${id} was not found`);
  }

  await recordAuditLog({
    actor,
    action: "PRODUCT_UPDATED",
    entityType: "PRODUCT",
    entityId: updated.id,
    summary: `Updated product ${updated.sku} (active=${updated.isActive})`,
  });

  return updated;
}
