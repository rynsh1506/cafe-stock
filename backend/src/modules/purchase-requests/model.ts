import { t } from "elysia";
import type { PurchaseRequestStatus } from "@/db/schema";

export interface PurchaseRequestItemInput {
  productId: string;
  quantity: number;
  notes?: string;
}

export interface CreatePurchaseRequestInput {
  warehouseId: string;
  notes?: string;
  items: PurchaseRequestItemInput[];
}

export interface UpdatePurchaseRequestInput {
  warehouseId?: string;
  notes?: string;
  items?: PurchaseRequestItemInput[];
}

export interface RejectPurchaseRequestInput {
  reason?: string;
}

export interface ListPurchaseRequestsQuery {
  page?: string;
  limit?: string;
  status?: string;
  warehouseId?: string;
  search?: string;
}

export interface PurchaseRequestItemDetail {
  id: string;
  productId: string;
  productSku: string;
  productName: string;
  productUnit: string;
  quantity: number;
  notes: string | null;
}

export interface PurchaseRequestDetail {
  id: string;
  requestNumber: string;
  warehouseId: string;
  warehouseName: string;
  requestedBy: string;
  requesterName: string;
  status: PurchaseRequestStatus;
  notes: string | null;
  rejectionReason: string | null;
  submittedAt: Date | null;
  approvedAt: Date | null;
  approvedBy: string | null;
  rejectedAt: Date | null;
  rejectedBy: string | null;
  createdAt: Date;
  updatedAt: Date;
  items: PurchaseRequestItemDetail[];
}

export const purchaseRequestItemSchema = t.Object({
  productId: t.String({ minLength: 1 }),
  quantity: t.Number({ minimum: 1 }),
  notes: t.Optional(t.String()),
});

export const createPurchaseRequestBodySchema = t.Object({
  warehouseId: t.String({ minLength: 1 }),
  notes: t.Optional(t.String()),
  items: t.Array(purchaseRequestItemSchema, { minItems: 1 }),
});

export const updatePurchaseRequestBodySchema = t.Object({
  warehouseId: t.Optional(t.String({ minLength: 1 })),
  notes: t.Optional(t.String()),
  items: t.Optional(t.Array(purchaseRequestItemSchema, { minItems: 1 })),
});

export const rejectPurchaseRequestBodySchema = t.Object({
  reason: t.Optional(t.String()),
});
