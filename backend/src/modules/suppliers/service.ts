import { and, count, desc, eq, ilike, or, sql, type SQL } from "drizzle-orm";
import { db } from "@/db/index";
import { purchaseOrders, suppliers } from "@/db/schema";
import type { AuthenticatedUser } from "@/modules/auth/model";
import type {
  CreateSupplierInput,
  ListSuppliersQuery,
  UpdateSupplierInput,
} from "@/modules/suppliers/model";
import { recordAuditLog } from "@/utils/audit";
import { AppError } from "@/utils/errors";
import {
  buildPaginatedResponse,
  parsePagination,
  type PaginatedResponse,
} from "@/utils/pagination";

export type SupplierRecord = typeof suppliers.$inferSelect;

export async function listSuppliers(
  query: ListSuppliersQuery,
): Promise<PaginatedResponse<SupplierRecord>> {
  const pagination = parsePagination(query);
  const conditions: SQL[] = [];

  if (query.search && query.search.trim().length > 0) {
    const pattern = `%${query.search.trim()}%`;
    const searchCondition = or(
      ilike(suppliers.name, pattern),
      ilike(suppliers.code, pattern),
    );
    if (searchCondition) {
      conditions.push(searchCondition);
    }
  }

  if (query.isActive === "true" || query.isActive === "false") {
    conditions.push(eq(suppliers.isActive, query.isActive === "true"));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const [totalRow] = await db
    .select({ value: count() })
    .from(suppliers)
    .where(whereClause);

  const rows = await db
    .select()
    .from(suppliers)
    .where(whereClause)
    .orderBy(desc(suppliers.createdAt))
    .limit(pagination.limit)
    .offset(pagination.offset);

  return buildPaginatedResponse(rows, Number(totalRow?.value ?? 0), pagination);
}

export async function getSupplierById(id: string): Promise<SupplierRecord> {
  const [supplier] = await db
    .select()
    .from(suppliers)
    .where(eq(suppliers.id, id));
  if (!supplier) {
    throw AppError.notFound(
      "SUPPLIER_NOT_FOUND",
      `Supplier ${id} was not found`,
    );
  }
  return supplier;
}

export async function createSupplier(
  input: CreateSupplierInput,
  actor: AuthenticatedUser,
): Promise<SupplierRecord> {
  const code = input.code.trim().toUpperCase();
  const name = input.name.trim();

  if (!code || !name) {
    throw AppError.badRequest(
      "INVALID_SUPPLIER_INPUT",
      "Supplier code and name are required",
    );
  }

  const [existing] = await db
    .select()
    .from(suppliers)
    .where(eq(suppliers.code, code));
  if (existing) {
    throw AppError.unprocessable(
      "DUPLICATE_SUPPLIER_CODE",
      `A supplier with code '${code}' already exists`,
    );
  }

  const [created] = await db
    .insert(suppliers)
    .values({
      code,
      name,
      contactEmail: input.contactEmail?.trim() ?? "",
      phone: input.phone?.trim() ?? "",
      address: input.address?.trim() ?? "",
      isActive: input.isActive ?? true,
    })
    .returning();

  if (!created) {
    throw new AppError(
      500,
      "SUPPLIER_CREATE_FAILED",
      "Failed to create supplier",
    );
  }

  await recordAuditLog({
    actor,
    action: "SUPPLIER_CREATED",
    entityType: "SUPPLIER",
    entityId: created.id,
    summary: `Created supplier ${created.code} (${created.name})`,
  });

  return created;
}

export async function updateSupplier(
  id: string,
  input: UpdateSupplierInput,
  actor: AuthenticatedUser,
): Promise<SupplierRecord> {
  const current = await getSupplierById(id);

  let nextCode = current.code;
  if (input.code !== undefined) {
    nextCode = input.code.trim().toUpperCase();
    if (!nextCode) {
      throw AppError.badRequest(
        "INVALID_SUPPLIER_CODE",
        "Supplier code cannot be empty",
      );
    }
    if (nextCode !== current.code) {
      const [dup] = await db
        .select()
        .from(suppliers)
        .where(eq(suppliers.code, nextCode));
      if (dup) {
        throw AppError.unprocessable(
          "DUPLICATE_SUPPLIER_CODE",
          `A supplier with code '${nextCode}' already exists`,
        );
      }
    }
  }

  const [updated] = await db
    .update(suppliers)
    .set({
      code: nextCode,
      name: input.name !== undefined ? input.name.trim() : current.name,
      contactEmail:
        input.contactEmail !== undefined
          ? input.contactEmail.trim()
          : current.contactEmail,
      phone: input.phone !== undefined ? input.phone.trim() : current.phone,
      address:
        input.address !== undefined ? input.address.trim() : current.address,
      isActive:
        input.isActive !== undefined ? input.isActive : current.isActive,
      updatedAt: new Date(),
    })
    .where(eq(suppliers.id, id))
    .returning();

  if (!updated) {
    throw AppError.notFound(
      "SUPPLIER_NOT_FOUND",
      `Supplier ${id} was not found`,
    );
  }

  await recordAuditLog({
    actor,
    action: "SUPPLIER_UPDATED",
    entityType: "SUPPLIER",
    entityId: updated.id,
    summary: `Updated supplier ${updated.code} (active=${updated.isActive})`,
  });

  return updated;
}

export async function deleteSupplier(
  id: string,
  actor: AuthenticatedUser,
): Promise<{ success: boolean; id: string }> {
  if (actor.role !== "APPROVER") {
    throw AppError.forbidden(
      "FORBIDDEN",
      "Only approvers can delete suppliers",
    );
  }

  const current = await getSupplierById(id);

  const [po] = await db
    .select({ total: count() })
    .from(purchaseOrders)
    .where(eq(purchaseOrders.supplierId, id));

  if (po && po.total > 0) {
    throw AppError.badRequest(
      "SUPPLIER_IN_USE",
      `Cannot delete supplier '${current.name}' because it has ${po.total} associated purchase orders`,
    );
  }

  await db.delete(suppliers).where(eq(suppliers.id, id));

  await recordAuditLog({
    actor,
    action: "SUPPLIER_DELETED",
    entityType: "SUPPLIER",
    entityId: id,
    summary: `Deleted supplier ${current.code} - ${current.name}`,
  });

  return { success: true, id };
}
