import { and, count, desc, eq, ilike, inArray, type SQL } from "drizzle-orm";
import { db } from "@/db/index";
import {
  goodsReceiptItems,
  goodsReceipts,
  inventoryBalances,
  inventoryMovements,
  products,
  purchaseOrderItems,
  purchaseOrders,
  users,
  warehouses,
  type PurchaseOrderStatus,
} from "@/db/schema";
import type { AuthenticatedUser } from "@/modules/auth/model";
import type {
  CreateGoodsReceiptInput,
  GoodsReceiptDetail,
  GoodsReceiptItemDetail,
  ListGoodsReceiptsQuery,
} from "@/modules/goods-receipts/model";
import { recordAuditLog } from "@/utils/audit";
import { AppError } from "@/utils/errors";
import { logger } from "@/utils/logger";
import {
  buildPaginatedResponse,
  parsePagination,
  type PaginatedResponse,
} from "@/utils/pagination";

function generateReceiptNumber(): string {
  const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `GR-${datePart}-${randomSuffix}`;
}

export async function getGoodsReceiptById(
  id: string,
): Promise<GoodsReceiptDetail> {
  const [gr] = await db
    .select()
    .from(goodsReceipts)
    .where(eq(goodsReceipts.id, id));

  if (!gr) {
    throw AppError.notFound(
      "GOODS_RECEIPT_NOT_FOUND",
      `Goods Receipt ${id} was not found`,
    );
  }

  const [po] = await db
    .select()
    .from(purchaseOrders)
    .where(eq(purchaseOrders.id, gr.purchaseOrderId));

  const [warehouse] = await db
    .select()
    .from(warehouses)
    .where(eq(warehouses.id, gr.warehouseId));

  const [receiver] = await db
    .select()
    .from(users)
    .where(eq(users.id, gr.receivedBy));

  const itemRows = await db
    .select({
      id: goodsReceiptItems.id,
      purchaseOrderItemId: goodsReceiptItems.purchaseOrderItemId,
      productId: goodsReceiptItems.productId,
      productSku: products.sku,
      productName: products.name,
      productUnit: products.unit,
      quantityReceived: goodsReceiptItems.quantityReceived,
    })
    .from(goodsReceiptItems)
    .innerJoin(products, eq(goodsReceiptItems.productId, products.id))
    .where(eq(goodsReceiptItems.goodsReceiptId, gr.id));

  return {
    id: gr.id,
    receiptNumber: gr.receiptNumber,
    purchaseOrderId: gr.purchaseOrderId,
    purchaseOrderNumber: po?.orderNumber ?? "Unknown PO",
    warehouseId: gr.warehouseId,
    warehouseName: warehouse?.name ?? "Unknown Warehouse",
    receivedBy: gr.receivedBy,
    receiverName: receiver?.name ?? "Unknown User",
    status: gr.status,
    notes: gr.notes,
    receivedAt: gr.receivedAt,
    createdAt: gr.createdAt,
    items: itemRows,
  };
}

export async function listGoodsReceipts(
  query: ListGoodsReceiptsQuery,
): Promise<PaginatedResponse<GoodsReceiptDetail>> {
  const pagination = parsePagination(query);
  const conditions: SQL[] = [];

  if (query.purchaseOrderId && query.purchaseOrderId.trim().length > 0) {
    conditions.push(
      eq(goodsReceipts.purchaseOrderId, query.purchaseOrderId.trim()),
    );
  }

  if (query.warehouseId && query.warehouseId.trim().length > 0) {
    conditions.push(eq(goodsReceipts.warehouseId, query.warehouseId.trim()));
  }

  if (query.search && query.search.trim().length > 0) {
    conditions.push(
      ilike(goodsReceipts.receiptNumber, `%${query.search.trim()}%`),
    );
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const [totalRow] = await db
    .select({ value: count() })
    .from(goodsReceipts)
    .where(whereClause);

  const grRows = await db
    .select()
    .from(goodsReceipts)
    .where(whereClause)
    .orderBy(desc(goodsReceipts.createdAt))
    .limit(pagination.limit)
    .offset(pagination.offset);

  if (grRows.length === 0) {
    return buildPaginatedResponse([], Number(totalRow?.value ?? 0), pagination);
  }

  const grIds = grRows.map((r) => r.id);
  const allPos = await db.select().from(purchaseOrders);
  const allWarehouses = await db.select().from(warehouses);
  const allUsers = await db.select().from(users);

  const poMap = new Map(allPos.map((po) => [po.id, po.orderNumber]));
  const warehouseMap = new Map(allWarehouses.map((w) => [w.id, w.name]));
  const userMap = new Map(allUsers.map((u) => [u.id, u.name]));

  const allItemRows = await db
    .select({
      id: goodsReceiptItems.id,
      goodsReceiptId: goodsReceiptItems.goodsReceiptId,
      purchaseOrderItemId: goodsReceiptItems.purchaseOrderItemId,
      productId: goodsReceiptItems.productId,
      productSku: products.sku,
      productName: products.name,
      productUnit: products.unit,
      quantityReceived: goodsReceiptItems.quantityReceived,
    })
    .from(goodsReceiptItems)
    .innerJoin(products, eq(goodsReceiptItems.productId, products.id))
    .where(inArray(goodsReceiptItems.goodsReceiptId, grIds));

  const itemsByGrId = new Map<string, GoodsReceiptItemDetail[]>();
  for (const row of allItemRows) {
    const list = itemsByGrId.get(row.goodsReceiptId) ?? [];
    list.push({
      id: row.id,
      purchaseOrderItemId: row.purchaseOrderItemId,
      productId: row.productId,
      productSku: row.productSku,
      productName: row.productName,
      productUnit: row.productUnit,
      quantityReceived: row.quantityReceived,
    });
    itemsByGrId.set(row.goodsReceiptId, list);
  }

  const detailedRows: GoodsReceiptDetail[] = grRows.map((gr) => ({
    id: gr.id,
    receiptNumber: gr.receiptNumber,
    purchaseOrderId: gr.purchaseOrderId,
    purchaseOrderNumber: poMap.get(gr.purchaseOrderId) ?? "Unknown PO",
    warehouseId: gr.warehouseId,
    warehouseName: warehouseMap.get(gr.warehouseId) ?? "Unknown Warehouse",
    receivedBy: gr.receivedBy,
    receiverName: userMap.get(gr.receivedBy) ?? "Unknown User",
    status: gr.status,
    notes: gr.notes,
    receivedAt: gr.receivedAt,
    createdAt: gr.createdAt,
    items: itemsByGrId.get(gr.id) ?? [],
  }));

  return buildPaginatedResponse(
    detailedRows,
    Number(totalRow?.value ?? 0),
    pagination,
  );
}

export async function createGoodsReceipt(
  input: CreateGoodsReceiptInput,
  actor: AuthenticatedUser,
): Promise<GoodsReceiptDetail> {
  if (!input.items || input.items.length === 0) {
    throw AppError.unprocessable(
      "EMPTY_GOODS_RECEIPT_ITEMS",
      "A Goods Receipt must contain at least one item",
    );
  }

  const createdReceiptId = await db.transaction(async (tx) => {
    const [po] = await tx
      .select()
      .from(purchaseOrders)
      .where(eq(purchaseOrders.id, input.purchaseOrderId));

    if (!po) {
      throw AppError.notFound(
        "PURCHASE_ORDER_NOT_FOUND",
        `Purchase Order ${input.purchaseOrderId} was not found`,
      );
    }

    if (po.status !== "ORDERED" && po.status !== "PARTIALLY_RECEIVED") {
      throw AppError.unprocessable(
        "INVALID_PO_STATUS_FOR_RECEIPT",
        `Cannot receive goods for Purchase Order ${po.orderNumber} with status ${po.status}. Status must be ORDERED or PARTIALLY_RECEIVED.`,
      );
    }

    const poItems = await tx
      .select()
      .from(purchaseOrderItems)
      .where(eq(purchaseOrderItems.purchaseOrderId, po.id));

    const resolvedReceiptItems: Array<{
      poItem: typeof purchaseOrderItems.$inferSelect;
      quantityReceived: number;
    }> = [];

    const cumulativeByPoItemId = new Map<string, number>();

    for (const reqItem of input.items) {
      if (
        !Number.isInteger(reqItem.quantityReceived) ||
        reqItem.quantityReceived <= 0
      ) {
        throw AppError.unprocessable(
          "INVALID_QUANTITY_RECEIVED",
          "Quantity received must be a positive integer",
        );
      }

      const matchedPoItem = poItems.find((candidate) => {
        if (reqItem.purchaseOrderItemId && reqItem.productId) {
          return (
            candidate.id === reqItem.purchaseOrderItemId &&
            candidate.productId === reqItem.productId
          );
        }
        if (reqItem.purchaseOrderItemId) {
          return candidate.id === reqItem.purchaseOrderItemId;
        }
        if (reqItem.productId) {
          return candidate.productId === reqItem.productId;
        }
        return false;
      });

      if (!matchedPoItem) {
        throw AppError.unprocessable(
          "PO_ITEM_MISMATCH",
          "One or more received items do not belong to the specified Purchase Order",
        );
      }

      const alreadyInPayload = cumulativeByPoItemId.get(matchedPoItem.id) ?? 0;
      const nextTotalReceived =
        matchedPoItem.receivedQuantity +
        alreadyInPayload +
        reqItem.quantityReceived;

      if (nextTotalReceived > matchedPoItem.orderedQuantity) {
        const remaining =
          matchedPoItem.orderedQuantity - matchedPoItem.receivedQuantity;
        throw AppError.unprocessable(
          "OVER_RECEIVING_NOT_ALLOWED",
          `Cannot receive ${reqItem.quantityReceived} units for item ${matchedPoItem.id}; only ${remaining} units remain on Purchase Order ${po.orderNumber}`,
        );
      }

      cumulativeByPoItemId.set(
        matchedPoItem.id,
        alreadyInPayload + reqItem.quantityReceived,
      );

      resolvedReceiptItems.push({
        poItem: matchedPoItem,
        quantityReceived: reqItem.quantityReceived,
      });
    }

    const [createdReceipt] = await tx
      .insert(goodsReceipts)
      .values({
        receiptNumber: generateReceiptNumber(),
        purchaseOrderId: po.id,
        warehouseId: po.warehouseId,
        receivedBy: actor.id,
        status: "POSTED",
        notes: input.notes?.trim() || null,
      })
      .returning();

    if (!createdReceipt) {
      throw new AppError(
        500,
        "GOODS_RECEIPT_CREATE_FAILED",
        "Failed to create Goods Receipt header",
      );
    }

    for (const entry of resolvedReceiptItems) {
      await tx.insert(goodsReceiptItems).values({
        goodsReceiptId: createdReceipt.id,
        purchaseOrderItemId: entry.poItem.id,
        productId: entry.poItem.productId,
        quantityReceived: entry.quantityReceived,
      });

      const updatedPoItemReceived =
        entry.poItem.receivedQuantity + entry.quantityReceived;
      entry.poItem.receivedQuantity = updatedPoItemReceived;

      await tx
        .update(purchaseOrderItems)
        .set({
          receivedQuantity: updatedPoItemReceived,
        })
        .where(eq(purchaseOrderItems.id, entry.poItem.id));

      const [existingBalance] = await tx
        .select()
        .from(inventoryBalances)
        .where(
          and(
            eq(inventoryBalances.warehouseId, po.warehouseId),
            eq(inventoryBalances.productId, entry.poItem.productId),
          ),
        );

      let newBalance = entry.quantityReceived;
      if (existingBalance) {
        newBalance = existingBalance.quantity + entry.quantityReceived;
        await tx
          .update(inventoryBalances)
          .set({
            quantity: newBalance,
            updatedAt: new Date(),
          })
          .where(eq(inventoryBalances.id, existingBalance.id));
      } else {
        await tx.insert(inventoryBalances).values({
          warehouseId: po.warehouseId,
          productId: entry.poItem.productId,
          quantity: newBalance,
        });
      }

      await tx.insert(inventoryMovements).values({
        warehouseId: po.warehouseId,
        productId: entry.poItem.productId,
        movementType: "PURCHASE_RECEIPT",
        referenceType: "GOODS_RECEIPT",
        referenceId: createdReceipt.id,
        quantityChange: entry.quantityReceived,
        balanceAfter: newBalance,
      });
    }

    const updatedPoItems = await tx
      .select()
      .from(purchaseOrderItems)
      .where(eq(purchaseOrderItems.purchaseOrderId, po.id));

    const allFulfilled = updatedPoItems.every(
      (item) => item.receivedQuantity >= item.orderedQuantity,
    );
    const nextPoStatus: PurchaseOrderStatus = allFulfilled
      ? "RECEIVED"
      : "PARTIALLY_RECEIVED";

    await tx
      .update(purchaseOrders)
      .set({
        status: nextPoStatus,
        updatedAt: new Date(),
      })
      .where(eq(purchaseOrders.id, po.id));

    await recordAuditLog(
      {
        actor,
        action: "GOODS_RECEIPT_POSTED",
        entityType: "GOODS_RECEIPT",
        entityId: createdReceipt.id,
        summary: `Posted Goods Receipt ${createdReceipt.receiptNumber} for PO ${po.orderNumber} (PO status -> ${nextPoStatus})`,
        metadata: {
          purchaseOrderId: po.id,
          purchaseOrderStatus: nextPoStatus,
          itemsCount: resolvedReceiptItems.length,
        },
      },
      tx,
    );

    logger.info("Goods Receipt transaction committed atomically", {
      receiptNumber: createdReceipt.receiptNumber,
      purchaseOrderNumber: po.orderNumber,
      nextPoStatus,
    });

    return createdReceipt.id;
  });

  return getGoodsReceiptById(createdReceiptId);
}
