import { and, count, desc, eq, ilike, or, type SQL } from "drizzle-orm";
import { db } from "@/db/index";
import { warehouses } from "@/db/schema";
import type { AuthenticatedUser } from "@/modules/auth/model";
import type {
  CreateWarehouseInput,
  ListWarehousesQuery,
  UpdateWarehouseInput,
} from "@/modules/warehouses/model";
import { recordAuditLog } from "@/utils/audit";
import { AppError } from "@/utils/errors";
import {
  buildPaginatedResponse,
  parsePagination,
  type PaginatedResponse,
} from "@/utils/pagination";

export type WarehouseRecord = typeof warehouses.$inferSelect;

export async function listWarehouses(
  query: ListWarehousesQuery,
): Promise<PaginatedResponse<WarehouseRecord>> {
  const pagination = parsePagination(query);
  const conditions: SQL[] = [];

  if (query.search && query.search.trim().length > 0) {
    const pattern = `%${query.search.trim()}%`;
    const searchCondition = or(
      ilike(warehouses.name, pattern),
      ilike(warehouses.code, pattern),
    );
    if (searchCondition) {
      conditions.push(searchCondition);
    }
  }

  if (query.isActive === "true" || query.isActive === "false") {
    conditions.push(eq(warehouses.isActive, query.isActive === "true"));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const [totalRow] = await db
    .select({ value: count() })
    .from(warehouses)
    .where(whereClause);

  const rows = await db
    .select()
    .from(warehouses)
    .where(whereClause)
    .orderBy(desc(warehouses.createdAt))
    .limit(pagination.limit)
    .offset(pagination.offset);

  return buildPaginatedResponse(rows, Number(totalRow?.value ?? 0), pagination);
}

export async function getWarehouseById(id: string): Promise<WarehouseRecord> {
  const [warehouse] = await db
    .select()
    .from(warehouses)
    .where(eq(warehouses.id, id));
  if (!warehouse) {
    throw AppError.notFound(
      "WAREHOUSE_NOT_FOUND",
      `Warehouse ${id} was not found`,
    );
  }
  return warehouse;
}

export async function createWarehouse(
  input: CreateWarehouseInput,
  actor: AuthenticatedUser,
): Promise<WarehouseRecord> {
  const code = input.code.trim().toUpperCase();
  const name = input.name.trim();

  if (!code || !name) {
    throw AppError.badRequest(
      "INVALID_WAREHOUSE_INPUT",
      "Warehouse code and name are required",
    );
  }

  const [existing] = await db
    .select()
    .from(warehouses)
    .where(eq(warehouses.code, code));
  if (existing) {
    throw AppError.unprocessable(
      "DUPLICATE_WAREHOUSE_CODE",
      `A warehouse with code '${code}' already exists`,
    );
  }

  const [created] = await db
    .insert(warehouses)
    .values({
      code,
      name,
      address: input.address?.trim() ?? "",
      isActive: input.isActive ?? true,
    })
    .returning();

  if (!created) {
    throw new AppError(
      500,
      "WAREHOUSE_CREATE_FAILED",
      "Failed to create warehouse",
    );
  }

  await recordAuditLog({
    actor,
    action: "WAREHOUSE_CREATED",
    entityType: "WAREHOUSE",
    entityId: created.id,
    summary: `Created warehouse ${created.code} (${created.name})`,
  });

  return created;
}

export async function updateWarehouse(
  id: string,
  input: UpdateWarehouseInput,
  actor: AuthenticatedUser,
): Promise<WarehouseRecord> {
  const current = await getWarehouseById(id);

  let nextCode = current.code;
  if (input.code !== undefined) {
    nextCode = input.code.trim().toUpperCase();
    if (!nextCode) {
      throw AppError.badRequest(
        "INVALID_WAREHOUSE_CODE",
        "Warehouse code cannot be empty",
      );
    }
    if (nextCode !== current.code) {
      const [dup] = await db
        .select()
        .from(warehouses)
        .where(eq(warehouses.code, nextCode));
      if (dup) {
        throw AppError.unprocessable(
          "DUPLICATE_WAREHOUSE_CODE",
          `A warehouse with code '${nextCode}' already exists`,
        );
      }
    }
  }

  const [updated] = await db
    .update(warehouses)
    .set({
      code: nextCode,
      name: input.name !== undefined ? input.name.trim() : current.name,
      address:
        input.address !== undefined ? input.address.trim() : current.address,
      isActive:
        input.isActive !== undefined ? input.isActive : current.isActive,
      updatedAt: new Date(),
    })
    .where(eq(warehouses.id, id))
    .returning();

  if (!updated) {
    throw AppError.notFound(
      "WAREHOUSE_NOT_FOUND",
      `Warehouse ${id} was not found`,
    );
  }

  await recordAuditLog({
    actor,
    action: "WAREHOUSE_UPDATED",
    entityType: "WAREHOUSE",
    entityId: updated.id,
    summary: `Updated warehouse ${updated.code} (active=${updated.isActive})`,
  });

  return updated;
}
