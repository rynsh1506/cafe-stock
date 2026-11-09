import { t } from "elysia";
import type { GoodsReceiptStatus } from "@/db/schema";

export interface GoodsReceiptItemInput {
  purchaseOrderItemId?: string;
  productId?: string;
  quantityReceived: number;
}

export interface CreateGoodsReceiptInput {
  purchaseOrderId: string;
  notes?: string;
  items: GoodsReceiptItemInput[];
}

export interface ListGoodsReceiptsQuery {
  page?: string;
  limit?: string;
  purchaseOrderId?: string;
  warehouseId?: string;
  search?: string;
}

export interface GoodsReceiptItemDetail {
  id: string;
  purchaseOrderItemId: string;
  productId: string;
  productSku: string;
  productName: string;
  productUnit: string;
  quantityReceived: number;
}

export interface GoodsReceiptDetail {
  id: string;
  receiptNumber: string;
  purchaseOrderId: string;
  purchaseOrderNumber: string;
  warehouseId: string;
  warehouseName: string;
  receivedBy: string;
  receiverName: string;
  status: GoodsReceiptStatus;
  notes: string | null;
  receivedAt: Date;
  createdAt: Date;
  items: GoodsReceiptItemDetail[];
}

export const goodsReceiptItemSchema = t.Object({
  purchaseOrderItemId: t.Optional(t.String({ minLength: 1 })),
  productId: t.Optional(t.String({ minLength: 1 })),
  quantityReceived: t.Number({ minimum: 1 }),
});

export const createGoodsReceiptBodySchema = t.Object({
  purchaseOrderId: t.String({ minLength: 1 }),
  notes: t.Optional(t.String()),
  items: t.Array(goodsReceiptItemSchema, { minItems: 1 }),
});
