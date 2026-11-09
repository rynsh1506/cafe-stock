import { and, count, desc, eq, ilike, inArray, type SQL } from "drizzle-orm";
import { db } from "@/db/index";
import {
  products,
  purchaseOrderItems,
  purchaseOrders,
  purchaseRequestItems,
  purchaseRequests,
  suppliers,
  users,
  warehouses,
  type PurchaseOrderStatus,
} from "@/db/schema";
import type { AuthenticatedUser } from "@/modules/auth/model";
import type {
  CreatePurchaseOrderInput,
  ListPurchaseOrdersQuery,
  PurchaseOrderDetail,
  PurchaseOrderItemDetail,
  PurchaseOrderItemInput,
  UpdatePurchaseOrderInput,
} from "@/modules/purchase-orders/model";
import { recordAuditLog } from "@/utils/audit";
import { AppError } from "@/utils/errors";
import {
  buildPaginatedResponse,
  parsePagination,
  type PaginatedResponse,
} from "@/utils/pagination";

function generateOrderNumber(): string {
  const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `PO-${datePart}-${randomSuffix}`;
}

export async function getPurchaseOrderById(
  id: string,
): Promise<PurchaseOrderDetail> {
  const [po] = await db
    .select()
    .from(purchaseOrders)
    .where(eq(purchaseOrders.id, id));

  if (!po) {
    throw AppError.notFound(
      "PURCHASE_ORDER_NOT_FOUND",
      `Purchase Order ${id} was not found`,
    );
  }

  const [supplier] = await db
    .select()
    .from(suppliers)
    .where(eq(suppliers.id, po.supplierId));

  const [warehouse] = await db
    .select()
    .from(warehouses)
    .where(eq(warehouses.id, po.warehouseId));

  const [creator] = await db
    .select()
    .from(users)
    .where(eq(users.id, po.createdBy));

  let prNumber: string | null = null;
  if (po.purchaseRequestId) {
    const [pr] = await db
      .select()
      .from(purchaseRequests)
      .where(eq(purchaseRequests.id, po.purchaseRequestId));
    prNumber = pr?.requestNumber ?? null;
  }

  const itemRows = await db
    .select({
      id: purchaseOrderItems.id,
      productId: purchaseOrderItems.productId,
      productSku: products.sku,
      productName: products.name,
      productUnit: products.unit,
      orderedQuantity: purchaseOrderItems.orderedQuantity,
      receivedQuantity: purchaseOrderItems.receivedQuantity,
      unitPrice: purchaseOrderItems.unitPrice,
    })
    .from(purchaseOrderItems)
    .innerJoin(products, eq(purchaseOrderItems.productId, products.id))
    .where(eq(purchaseOrderItems.purchaseOrderId, po.id));

  return {
    id: po.id,
    orderNumber: po.orderNumber,
    purchaseRequestId: po.purchaseRequestId,
    purchaseRequestNumber: prNumber,
    supplierId: po.supplierId,
    supplierName: supplier?.name ?? "Unknown Supplier",
    warehouseId: po.warehouseId,
    warehouseName: warehouse?.name ?? "Unknown Warehouse",
    createdBy: po.createdBy,
    creatorName: creator?.name ?? "Unknown User",
    status: po.status,
    expectedDate: po.expectedDate,
    notes: po.notes,
    orderedAt: po.orderedAt,
    cancelledAt: po.cancelledAt,
    createdAt: po.createdAt,
    updatedAt: po.updatedAt,
    items: itemRows.map((item) => ({
      ...item,
      remainingQuantity: Math.max(
        0,
        item.orderedQuantity - item.receivedQuantity,
      ),
    })),
  };
}

export async function listPurchaseOrders(
  query: ListPurchaseOrdersQuery,
): Promise<PaginatedResponse<PurchaseOrderDetail>> {
  const pagination = parsePagination(query);
  const conditions: SQL[] = [];

  if (query.status && query.status.trim().length > 0) {
    conditions.push(
      eq(purchaseOrders.status, query.status.trim() as PurchaseOrderStatus),
    );
  }

  if (query.supplierId && query.supplierId.trim().length > 0) {
    conditions.push(eq(purchaseOrders.supplierId, query.supplierId.trim()));
  }

  if (query.warehouseId && query.warehouseId.trim().length > 0) {
    conditions.push(eq(purchaseOrders.warehouseId, query.warehouseId.trim()));
  }

  if (query.search && query.search.trim().length > 0) {
    conditions.push(
      ilike(purchaseOrders.orderNumber, `%${query.search.trim()}%`),
    );
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const [totalRow] = await db
    .select({ value: count() })
    .from(purchaseOrders)
    .where(whereClause);

  const poRows = await db
    .select()
    .from(purchaseOrders)
    .where(whereClause)
    .orderBy(desc(purchaseOrders.createdAt))
    .limit(pagination.limit)
    .offset(pagination.offset);

  if (poRows.length === 0) {
    return buildPaginatedResponse([], Number(totalRow?.value ?? 0), pagination);
  }

  const poIds = poRows.map((r) => r.id);
  const allSuppliers = await db.select().from(suppliers);
  const allWarehouses = await db.select().from(warehouses);
  const allUsers = await db.select().from(users);
  const allPrs = await db.select().from(purchaseRequests);

  const supplierMap = new Map(allSuppliers.map((s) => [s.id, s.name]));
  const warehouseMap = new Map(allWarehouses.map((w) => [w.id, w.name]));
  const userMap = new Map(allUsers.map((u) => [u.id, u.name]));
  const prMap = new Map(allPrs.map((pr) => [pr.id, pr.requestNumber]));

  const allItemRows = await db
    .select({
      id: purchaseOrderItems.id,
      purchaseOrderId: purchaseOrderItems.purchaseOrderId,
      productId: purchaseOrderItems.productId,
      productSku: products.sku,
      productName: products.name,
      productUnit: products.unit,
      orderedQuantity: purchaseOrderItems.orderedQuantity,
      receivedQuantity: purchaseOrderItems.receivedQuantity,
      unitPrice: purchaseOrderItems.unitPrice,
    })
    .from(purchaseOrderItems)
    .innerJoin(products, eq(purchaseOrderItems.productId, products.id))
    .where(inArray(purchaseOrderItems.purchaseOrderId, poIds));

  const itemsByPoId = new Map<string, PurchaseOrderItemDetail[]>();
  for (const row of allItemRows) {
    const list = itemsByPoId.get(row.purchaseOrderId) ?? [];
    list.push({
      id: row.id,
      productId: row.productId,
      productSku: row.productSku,
      productName: row.productName,
      productUnit: row.productUnit,
      orderedQuantity: row.orderedQuantity,
      receivedQuantity: row.receivedQuantity,
      remainingQuantity: Math.max(
        0,
        row.orderedQuantity - row.receivedQuantity,
      ),
      unitPrice: row.unitPrice,
    });
    itemsByPoId.set(row.purchaseOrderId, list);
  }

  const detailedRows: PurchaseOrderDetail[] = poRows.map((po) => ({
    id: po.id,
    orderNumber: po.orderNumber,
    purchaseRequestId: po.purchaseRequestId,
    purchaseRequestNumber: po.purchaseRequestId
      ? (prMap.get(po.purchaseRequestId) ?? null)
      : null,
    supplierId: po.supplierId,
    supplierName: supplierMap.get(po.supplierId) ?? "Unknown Supplier",
    warehouseId: po.warehouseId,
    warehouseName: warehouseMap.get(po.warehouseId) ?? "Unknown Warehouse",
    createdBy: po.createdBy,
    creatorName: userMap.get(po.createdBy) ?? "Unknown User",
    status: po.status,
    expectedDate: po.expectedDate,
    notes: po.notes,
    orderedAt: po.orderedAt,
    cancelledAt: po.cancelledAt,
    createdAt: po.createdAt,
    updatedAt: po.updatedAt,
    items: itemsByPoId.get(po.id) ?? [],
  }));

  return buildPaginatedResponse(
    detailedRows,
    Number(totalRow?.value ?? 0),
    pagination,
  );
}

export async function createPurchaseOrder(
  input: CreatePurchaseOrderInput,
  actor: AuthenticatedUser,
): Promise<PurchaseOrderDetail> {
  const [supplier] = await db
    .select()
    .from(suppliers)
    .where(eq(suppliers.id, input.supplierId));

  if (!supplier || !supplier.isActive) {
    throw AppError.unprocessable(
      "INVALID_SUPPLIER",
      "Supplier does not exist or is inactive",
    );
  }

  let resolvedWarehouseId = input.warehouseId ?? "";
  let resolvedItems: PurchaseOrderItemInput[] = input.items ?? [];

  if (input.purchaseRequestId) {
    const [sourcePr] = await db
      .select()
      .from(purchaseRequests)
      .where(eq(purchaseRequests.id, input.purchaseRequestId));

    if (!sourcePr) {
      throw AppError.notFound(
        "PURCHASE_REQUEST_NOT_FOUND",
        `Source Purchase Request ${input.purchaseRequestId} was not found`,
      );
    }

    if (sourcePr.status !== "APPROVED") {
      throw AppError.unprocessable(
        "PR_NOT_APPROVED",
        `Purchase Order can only be created from an APPROVED Purchase Request (current status: ${sourcePr.status})`,
      );
    }

    if (!resolvedWarehouseId) {
      resolvedWarehouseId = sourcePr.warehouseId;
    }

    if (resolvedItems.length === 0) {
      const prItems = await db
        .select()
        .from(purchaseRequestItems)
        .where(eq(purchaseRequestItems.purchaseRequestId, sourcePr.id));

      resolvedItems = prItems.map((i) => ({
        productId: i.productId,
        orderedQuantity: i.quantity,
      }));
    }
  }

  if (!resolvedWarehouseId) {
    throw AppError.unprocessable(
      "MISSING_WAREHOUSE_ID",
      "Warehouse is required when creating a Purchase Order",
    );
  }

  const [warehouse] = await db
    .select()
    .from(warehouses)
    .where(eq(warehouses.id, resolvedWarehouseId));

  if (!warehouse || !warehouse.isActive) {
    throw AppError.unprocessable(
      "INVALID_WAREHOUSE",
      "Target warehouse does not exist or is inactive",
    );
  }

  if (resolvedItems.length === 0) {
    throw AppError.unprocessable(
      "EMPTY_PURCHASE_ORDER_ITEMS",
      "A Purchase Order must contain at least one item",
    );
  }

  const productPrices = new Map<string, number>();
  for (const item of resolvedItems) {
    if (!Number.isInteger(item.orderedQuantity) || item.orderedQuantity <= 0) {
      throw AppError.unprocessable(
        "INVALID_ITEM_QUANTITY",
        "All Purchase Order item quantities must be positive integers",
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
    productPrices.set(product.id, product.unitPrice);
  }

  const createdPoId = await db.transaction(async (tx) => {
    const [createdPo] = await tx
      .insert(purchaseOrders)
      .values({
        orderNumber: generateOrderNumber(),
        purchaseRequestId: input.purchaseRequestId ?? null,
        supplierId: input.supplierId,
        warehouseId: resolvedWarehouseId,
        createdBy: actor.id,
        status: "DRAFT",
        expectedDate: input.expectedDate?.trim() || null,
        notes: input.notes?.trim() || null,
      })
      .returning();

    if (!createdPo) {
      throw new AppError(
        500,
        "PO_CREATE_FAILED",
        "Failed to create Purchase Order",
      );
    }

    for (const item of resolvedItems) {
      const fallbackPrice = productPrices.get(item.productId) ?? 0;
      await tx.insert(purchaseOrderItems).values({
        purchaseOrderId: createdPo.id,
        productId: item.productId,
        orderedQuantity: item.orderedQuantity,
        receivedQuantity: 0,
        unitPrice:
          item.unitPrice !== undefined
            ? Math.max(0, Math.floor(item.unitPrice))
            : fallbackPrice,
      });
    }

    await recordAuditLog(
      {
        actor,
        action: "PO_CREATED",
        entityType: "PURCHASE_ORDER",
        entityId: createdPo.id,
        summary: `Created Purchase Order ${createdPo.orderNumber} in DRAFT status`,
      },
      tx,
    );

    return createdPo.id;
  });

  return getPurchaseOrderById(createdPoId);
}

export async function updatePurchaseOrder(
  id: string,
  input: UpdatePurchaseOrderInput,
  actor: AuthenticatedUser,
): Promise<PurchaseOrderDetail> {
  const existing = await getPurchaseOrderById(id);

  if (existing.status !== "DRAFT") {
    throw AppError.unprocessable(
      "PO_IMMUTABLE_STATUS",
      `Cannot edit Purchase Order ${existing.orderNumber} because its status is ${existing.status}. Only DRAFT Purchase Orders can be modified.`,
    );
  }

  const nextSupplierId = input.supplierId ?? existing.supplierId;
  const nextWarehouseId = input.warehouseId ?? existing.warehouseId;

  const [supplier] = await db
    .select()
    .from(suppliers)
    .where(eq(suppliers.id, nextSupplierId));
  if (!supplier || !supplier.isActive) {
    throw AppError.unprocessable(
      "INVALID_SUPPLIER",
      "Supplier does not exist or is inactive",
    );
  }

  const [warehouse] = await db
    .select()
    .from(warehouses)
    .where(eq(warehouses.id, nextWarehouseId));
  if (!warehouse || !warehouse.isActive) {
    throw AppError.unprocessable(
      "INVALID_WAREHOUSE",
      "Warehouse does not exist or is inactive",
    );
  }

  await db.transaction(async (tx) => {
    await tx
      .update(purchaseOrders)
      .set({
        supplierId: nextSupplierId,
        warehouseId: nextWarehouseId,
        expectedDate:
          input.expectedDate !== undefined
            ? input.expectedDate.trim() || null
            : existing.expectedDate,
        notes:
          input.notes !== undefined
            ? input.notes.trim() || null
            : existing.notes,
        updatedAt: new Date(),
      })
      .where(eq(purchaseOrders.id, id));

    if (input.items !== undefined) {
      if (input.items.length === 0) {
        throw AppError.unprocessable(
          "EMPTY_PURCHASE_ORDER_ITEMS",
          "A Purchase Order must contain at least one item",
        );
      }
      await tx
        .delete(purchaseOrderItems)
        .where(eq(purchaseOrderItems.purchaseOrderId, id));

      for (const item of input.items) {
        const [product] = await tx
          .select()
          .from(products)
          .where(eq(products.id, item.productId));
        if (!product || !product.isActive) {
          throw AppError.unprocessable(
            "INVALID_PRODUCT",
            `Product ${item.productId} does not exist or is inactive`,
          );
        }
        await tx.insert(purchaseOrderItems).values({
          purchaseOrderId: id,
          productId: item.productId,
          orderedQuantity: item.orderedQuantity,
          receivedQuantity: 0,
          unitPrice:
            item.unitPrice !== undefined
              ? Math.max(0, Math.floor(item.unitPrice))
              : product.unitPrice,
        });
      }
    }

    await recordAuditLog(
      {
        actor,
        action: "PO_UPDATED",
        entityType: "PURCHASE_ORDER",
        entityId: id,
        summary: `Updated DRAFT Purchase Order ${existing.orderNumber}`,
      },
      tx,
    );
  });

  return getPurchaseOrderById(id);
}

export async function markPurchaseOrderOrdered(
  id: string,
  actor: AuthenticatedUser,
): Promise<PurchaseOrderDetail> {
  const existing = await getPurchaseOrderById(id);

  if (existing.status !== "DRAFT") {
    throw AppError.unprocessable(
      "INVALID_PO_TRANSITION",
      `Cannot mark Purchase Order ${existing.orderNumber} as ORDERED from status ${existing.status}. Must be DRAFT.`,
    );
  }

  if (existing.items.length === 0) {
    throw AppError.unprocessable(
      "EMPTY_PURCHASE_ORDER_ITEMS",
      "Cannot order a Purchase Order without items",
    );
  }

  await db.transaction(async (tx) => {
    await tx
      .update(purchaseOrders)
      .set({
        status: "ORDERED",
        orderedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(purchaseOrders.id, id));

    await recordAuditLog(
      {
        actor,
        action: "PO_ORDERED",
        entityType: "PURCHASE_ORDER",
        entityId: id,
        summary: `Placed Purchase Order ${existing.orderNumber} with supplier ${existing.supplierName}`,
      },
      tx,
    );
  });

  return getPurchaseOrderById(id);
}

export async function cancelPurchaseOrder(
  id: string,
  actor: AuthenticatedUser,
): Promise<PurchaseOrderDetail> {
  const existing = await getPurchaseOrderById(id);

  if (existing.status !== "DRAFT" && existing.status !== "ORDERED") {
    throw AppError.unprocessable(
      "INVALID_PO_CANCELLATION",
      `Cannot cancel Purchase Order ${existing.orderNumber} when status is ${existing.status}. Only DRAFT or ORDERED Purchase Orders can be cancelled.`,
    );
  }

  await db.transaction(async (tx) => {
    await tx
      .update(purchaseOrders)
      .set({
        status: "CANCELLED",
        cancelledAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(purchaseOrders.id, id));

    await recordAuditLog(
      {
        actor,
        action: "PO_CANCELLED",
        entityType: "PURCHASE_ORDER",
        entityId: id,
        summary: `Cancelled Purchase Order ${existing.orderNumber}`,
      },
      tx,
    );
  });

  return getPurchaseOrderById(id);
}
