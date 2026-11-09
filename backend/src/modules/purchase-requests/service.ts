import { and, count, desc, eq, ilike, inArray, type SQL } from "drizzle-orm";
import { db } from "@/db/index";
import {
  products,
  purchaseRequestItems,
  purchaseRequests,
  users,
  warehouses,
  type PurchaseRequestStatus,
} from "@/db/schema";
import type { AuthenticatedUser } from "@/modules/auth/model";
import type {
  CreatePurchaseRequestInput,
  ListPurchaseRequestsQuery,
  PurchaseRequestDetail,
  PurchaseRequestItemDetail,
  PurchaseRequestItemInput,
  RejectPurchaseRequestInput,
  UpdatePurchaseRequestInput,
} from "@/modules/purchase-requests/model";
import { recordAuditLog } from "@/utils/audit";
import { AppError } from "@/utils/errors";
import {
  buildPaginatedResponse,
  parsePagination,
  type PaginatedResponse,
} from "@/utils/pagination";

function generateRequestNumber(): string {
  const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `PR-${datePart}-${randomSuffix}`;
}

async function validateWarehouseAndItems(
  warehouseId: string,
  items: PurchaseRequestItemInput[],
): Promise<void> {
  if (!items || items.length === 0) {
    throw AppError.unprocessable(
      "EMPTY_PURCHASE_REQUEST_ITEMS",
      "A Purchase Request must contain at least one item",
    );
  }

  const [warehouse] = await db
    .select()
    .from(warehouses)
    .where(eq(warehouses.id, warehouseId));

  if (!warehouse || !warehouse.isActive) {
    throw AppError.unprocessable(
      "INVALID_WAREHOUSE",
      "Target warehouse does not exist or is inactive",
    );
  }

  for (const item of items) {
    if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
      throw AppError.unprocessable(
        "INVALID_ITEM_QUANTITY",
        "All Purchase Request item quantities must be positive integers",
      );
    }
    const [product] = await db
      .select()
      .from(products)
      .where(eq(products.id, item.productId));

    if (!product || !product.isActive) {
      throw AppError.unprocessable(
        "INVALID_PRODUCT",
        `Product ${item.productId} does not exist or is inactive`,
      );
    }
  }
}

export async function getPurchaseRequestById(
  id: string,
): Promise<PurchaseRequestDetail> {
  const [pr] = await db
    .select()
    .from(purchaseRequests)
    .where(eq(purchaseRequests.id, id));

  if (!pr) {
    throw AppError.notFound(
      "PURCHASE_REQUEST_NOT_FOUND",
      `Purchase Request ${id} was not found`,
    );
  }

  const [warehouse] = await db
    .select()
    .from(warehouses)
    .where(eq(warehouses.id, pr.warehouseId));

  const [requester] = await db
    .select()
    .from(users)
    .where(eq(users.id, pr.requestedBy));

  const itemRows = await db
    .select({
      id: purchaseRequestItems.id,
      productId: purchaseRequestItems.productId,
      productSku: products.sku,
      productName: products.name,
      productUnit: products.unit,
      quantity: purchaseRequestItems.quantity,
      notes: purchaseRequestItems.notes,
    })
    .from(purchaseRequestItems)
    .innerJoin(products, eq(purchaseRequestItems.productId, products.id))
    .where(eq(purchaseRequestItems.purchaseRequestId, pr.id));

  return {
    id: pr.id,
    requestNumber: pr.requestNumber,
    warehouseId: pr.warehouseId,
    warehouseName: warehouse?.name ?? "Unknown Warehouse",
    requestedBy: pr.requestedBy,
    requesterName: requester?.name ?? "Unknown User",
    status: pr.status,
    notes: pr.notes,
    rejectionReason: pr.rejectionReason,
    submittedAt: pr.submittedAt,
    approvedAt: pr.approvedAt,
    approvedBy: pr.approvedBy,
    rejectedAt: pr.rejectedAt,
    rejectedBy: pr.rejectedBy,
    createdAt: pr.createdAt,
    updatedAt: pr.updatedAt,
    items: itemRows,
  };
}

export async function listPurchaseRequests(
  query: ListPurchaseRequestsQuery,
): Promise<PaginatedResponse<PurchaseRequestDetail>> {
  const pagination = parsePagination(query);
  const conditions: SQL[] = [];

  if (query.status && query.status.trim().length > 0) {
    conditions.push(
      eq(purchaseRequests.status, query.status.trim() as PurchaseRequestStatus),
    );
  }

  if (query.warehouseId && query.warehouseId.trim().length > 0) {
    conditions.push(eq(purchaseRequests.warehouseId, query.warehouseId.trim()));
  }

  if (query.search && query.search.trim().length > 0) {
    conditions.push(
      ilike(purchaseRequests.requestNumber, `%${query.search.trim()}%`),
    );
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const [totalRow] = await db
    .select({ value: count() })
    .from(purchaseRequests)
    .where(whereClause);

  const prRows = await db
    .select()
    .from(purchaseRequests)
    .where(whereClause)
    .orderBy(desc(purchaseRequests.createdAt))
    .limit(pagination.limit)
    .offset(pagination.offset);

  if (prRows.length === 0) {
    return buildPaginatedResponse([], Number(totalRow?.value ?? 0), pagination);
  }

  const prIds = prRows.map((r) => r.id);
  const allWarehouses = await db.select().from(warehouses);
  const allUsers = await db.select().from(users);
  const warehouseMap = new Map(allWarehouses.map((w) => [w.id, w.name]));
  const userMap = new Map(allUsers.map((u) => [u.id, u.name]));

  const allItemRows = await db
    .select({
      id: purchaseRequestItems.id,
      purchaseRequestId: purchaseRequestItems.purchaseRequestId,
      productId: purchaseRequestItems.productId,
      productSku: products.sku,
      productName: products.name,
      productUnit: products.unit,
      quantity: purchaseRequestItems.quantity,
      notes: purchaseRequestItems.notes,
    })
    .from(purchaseRequestItems)
    .innerJoin(products, eq(purchaseRequestItems.productId, products.id))
    .where(inArray(purchaseRequestItems.purchaseRequestId, prIds));

  const itemsByPrId = new Map<string, PurchaseRequestItemDetail[]>();
  for (const row of allItemRows) {
    const list = itemsByPrId.get(row.purchaseRequestId) ?? [];
    list.push({
      id: row.id,
      productId: row.productId,
      productSku: row.productSku,
      productName: row.productName,
      productUnit: row.productUnit,
      quantity: row.quantity,
      notes: row.notes,
    });
    itemsByPrId.set(row.purchaseRequestId, list);
  }

  const detailedRows: PurchaseRequestDetail[] = prRows.map((pr) => ({
    id: pr.id,
    requestNumber: pr.requestNumber,
    warehouseId: pr.warehouseId,
    warehouseName: warehouseMap.get(pr.warehouseId) ?? "Unknown Warehouse",
    requestedBy: pr.requestedBy,
    requesterName: userMap.get(pr.requestedBy) ?? "Unknown User",
    status: pr.status,
    notes: pr.notes,
    rejectionReason: pr.rejectionReason,
    submittedAt: pr.submittedAt,
    approvedAt: pr.approvedAt,
    approvedBy: pr.approvedBy,
    rejectedAt: pr.rejectedAt,
    rejectedBy: pr.rejectedBy,
    createdAt: pr.createdAt,
    updatedAt: pr.updatedAt,
    items: itemsByPrId.get(pr.id) ?? [],
  }));

  return buildPaginatedResponse(
    detailedRows,
    Number(totalRow?.value ?? 0),
    pagination,
  );
}

export async function createPurchaseRequest(
  input: CreatePurchaseRequestInput,
  actor: AuthenticatedUser,
): Promise<PurchaseRequestDetail> {
  await validateWarehouseAndItems(input.warehouseId, input.items);

  const createdPrId = await db.transaction(async (tx) => {
    const [createdPr] = await tx
      .insert(purchaseRequests)
      .values({
        requestNumber: generateRequestNumber(),
        warehouseId: input.warehouseId,
        requestedBy: actor.id,
        status: "DRAFT",
        notes: input.notes?.trim() ?? null,
      })
      .returning();

    if (!createdPr) {
      throw new AppError(
        500,
        "PR_CREATE_FAILED",
        "Failed to create Purchase Request",
      );
    }

    for (const item of input.items) {
      await tx.insert(purchaseRequestItems).values({
        purchaseRequestId: createdPr.id,
        productId: item.productId,
        quantity: item.quantity,
        notes: item.notes?.trim() ?? null,
      });
    }

    await recordAuditLog(
      {
        actor,
        action: "PR_CREATED",
        entityType: "PURCHASE_REQUEST",
        entityId: createdPr.id,
        summary: `Created Purchase Request ${createdPr.requestNumber} in DRAFT status`,
      },
      tx,
    );

    return createdPr.id;
  });

  return getPurchaseRequestById(createdPrId);
}

export async function updatePurchaseRequest(
  id: string,
  input: UpdatePurchaseRequestInput,
  actor: AuthenticatedUser,
): Promise<PurchaseRequestDetail> {
  const existing = await getPurchaseRequestById(id);

  if (existing.status !== "DRAFT") {
    throw AppError.unprocessable(
      "PR_IMMUTABLE_STATUS",
      `Cannot modify Purchase Request ${existing.requestNumber} because its status is ${existing.status}. Only DRAFT requests can be edited.`,
    );
  }

  const nextWarehouseId = input.warehouseId ?? existing.warehouseId;
  const nextItems: PurchaseRequestItemInput[] =
    input.items ??
    existing.items.map((i) => ({
      productId: i.productId,
      quantity: i.quantity,
      notes: i.notes ?? undefined,
    }));

  await validateWarehouseAndItems(nextWarehouseId, nextItems);

  await db.transaction(async (tx) => {
    await tx
      .update(purchaseRequests)
      .set({
        warehouseId: nextWarehouseId,
        notes:
          input.notes !== undefined
            ? input.notes.trim() || null
            : existing.notes,
        updatedAt: new Date(),
      })
      .where(eq(purchaseRequests.id, id));

    if (input.items !== undefined) {
      await tx
        .delete(purchaseRequestItems)
        .where(eq(purchaseRequestItems.purchaseRequestId, id));

      for (const item of input.items) {
        await tx.insert(purchaseRequestItems).values({
          purchaseRequestId: id,
          productId: item.productId,
          quantity: item.quantity,
          notes: item.notes?.trim() ?? null,
        });
      }
    }

    await recordAuditLog(
      {
        actor,
        action: "PR_UPDATED",
        entityType: "PURCHASE_REQUEST",
        entityId: id,
        summary: `Updated DRAFT Purchase Request ${existing.requestNumber}`,
      },
      tx,
    );
  });

  return getPurchaseRequestById(id);
}

export async function submitPurchaseRequest(
  id: string,
  actor: AuthenticatedUser,
): Promise<PurchaseRequestDetail> {
  const existing = await getPurchaseRequestById(id);

  if (existing.status !== "DRAFT") {
    throw AppError.unprocessable(
      "INVALID_PR_TRANSITION",
      `Cannot submit Purchase Request ${existing.requestNumber} from status ${existing.status}. Must be DRAFT.`,
    );
  }

  if (existing.items.length === 0) {
    throw AppError.unprocessable(
      "EMPTY_PURCHASE_REQUEST_ITEMS",
      "Cannot submit a Purchase Request without items",
    );
  }

  await db.transaction(async (tx) => {
    await tx
      .update(purchaseRequests)
      .set({
        status: "SUBMITTED",
        submittedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(purchaseRequests.id, id));

    await recordAuditLog(
      {
        actor,
        action: "PR_SUBMITTED",
        entityType: "PURCHASE_REQUEST",
        entityId: id,
        summary: `Submitted Purchase Request ${existing.requestNumber} for approval`,
      },
      tx,
    );
  });

  return getPurchaseRequestById(id);
}

export async function approvePurchaseRequest(
  id: string,
  actor: AuthenticatedUser,
): Promise<PurchaseRequestDetail> {
  if (actor.role !== "APPROVER") {
    throw AppError.forbidden(
      "Only users with the APPROVER role can approve Purchase Requests",
    );
  }

  const existing = await getPurchaseRequestById(id);

  if (existing.status !== "SUBMITTED") {
    throw AppError.unprocessable(
      "INVALID_PR_TRANSITION",
      `Cannot approve Purchase Request ${existing.requestNumber} from status ${existing.status}. Must be SUBMITTED.`,
    );
  }

  await db.transaction(async (tx) => {
    await tx
      .update(purchaseRequests)
      .set({
        status: "APPROVED",
        approvedAt: new Date(),
        approvedBy: actor.id,
        updatedAt: new Date(),
      })
      .where(eq(purchaseRequests.id, id));

    await recordAuditLog(
      {
        actor,
        action: "PR_APPROVED",
        entityType: "PURCHASE_REQUEST",
        entityId: id,
        summary: `Approved Purchase Request ${existing.requestNumber}`,
      },
      tx,
    );
  });

  return getPurchaseRequestById(id);
}

export async function rejectPurchaseRequest(
  id: string,
  input: RejectPurchaseRequestInput,
  actor: AuthenticatedUser,
): Promise<PurchaseRequestDetail> {
  if (actor.role !== "APPROVER") {
    throw AppError.forbidden(
      "Only users with the APPROVER role can reject Purchase Requests",
    );
  }

  const existing = await getPurchaseRequestById(id);

  if (existing.status !== "SUBMITTED") {
    throw AppError.unprocessable(
      "INVALID_PR_TRANSITION",
      `Cannot reject Purchase Request ${existing.requestNumber} from status ${existing.status}. Must be SUBMITTED.`,
    );
  }

  const reason = input.reason?.trim() || "Rejected by approver";

  await db.transaction(async (tx) => {
    await tx
      .update(purchaseRequests)
      .set({
        status: "REJECTED",
        rejectionReason: reason,
        rejectedAt: new Date(),
        rejectedBy: actor.id,
        updatedAt: new Date(),
      })
      .where(eq(purchaseRequests.id, id));

    await recordAuditLog(
      {
        actor,
        action: "PR_REJECTED",
        entityType: "PURCHASE_REQUEST",
        entityId: id,
        summary: `Rejected Purchase Request ${existing.requestNumber}: ${reason}`,
      },
      tx,
    );
  });

  return getPurchaseRequestById(id);
}
