import { t } from "elysia";
import type { PurchaseOrderStatus } from "@/db/schema";

export interface PurchaseOrderItemInput {
  productId: string;
  orderedQuantity: number;
  unitPrice?: number;
}

export interface CreatePurchaseOrderInput {
  purchaseRequestId?: string;
  supplierId: string;
  warehouseId?: string;
  expectedDate?: string;
  notes?: string;
  items?: PurchaseOrderItemInput[];
}

export interface UpdatePurchaseOrderInput {
  supplierId?: string;
  warehouseId?: string;
  expectedDate?: string;
  notes?: string;
  items?: PurchaseOrderItemInput[];
}

export interface ListPurchaseOrdersQuery {
  page?: string;
  limit?: string;
  status?: string;
  supplierId?: string;
  warehouseId?: string;
  search?: string;
}

export interface PurchaseOrderItemDetail {
  id: string;
  productId: string;
  productSku: string;
  productName: string;
  productUnit: string;
  orderedQuantity: number;
  receivedQuantity: number;
  remainingQuantity: number;
  unitPrice: number;
}

export interface PurchaseOrderDetail {
  id: string;
  orderNumber: string;
  purchaseRequestId: string | null;
  purchaseRequestNumber: string | null;
  supplierId: string;
  supplierName: string;
  warehouseId: string;
  warehouseName: string;
  createdBy: string;
  creatorName: string;
  status: PurchaseOrderStatus;
  expectedDate: string | null;
  notes: string | null;
  orderedAt: Date | null;
  cancelledAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  items: PurchaseOrderItemDetail[];
}

export const purchaseOrderItemSchema = t.Object({
  productId: t.String({ minLength: 1 }),
  orderedQuantity: t.Number({ minimum: 1 }),
  unitPrice: t.Optional(t.Number({ minimum: 0 })),
});

export const createPurchaseOrderBodySchema = t.Object({
  purchaseRequestId: t.Optional(t.String({ minLength: 1 })),
  supplierId: t.String({ minLength: 1 }),
  warehouseId: t.Optional(t.String({ minLength: 1 })),
  expectedDate: t.Optional(t.String()),
  notes: t.Optional(t.String()),
  items: t.Optional(t.Array(purchaseOrderItemSchema, { minItems: 1 })),
});

export const updatePurchaseOrderBodySchema = t.Object({
  supplierId: t.Optional(t.String({ minLength: 1 })),
  warehouseId: t.Optional(t.String({ minLength: 1 })),
  expectedDate: t.Optional(t.String()),
  notes: t.Optional(t.String()),
  items: t.Optional(t.Array(purchaseOrderItemSchema, { minItems: 1 })),
});
