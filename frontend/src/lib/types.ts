export type UserRole = "USER" | "APPROVER";
export type AppLanguage = "ID" | "EN" | "JP";

export type PurchaseRequestStatus =
  "DRAFT" | "SUBMITTED" | "APPROVED" | "REJECTED";
export type PurchaseOrderStatus =
  "DRAFT" | "ORDERED" | "PARTIALLY_RECEIVED" | "RECEIVED" | "CANCELLED";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  isActive: boolean;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  unit: string;
  unitPrice: number;
  minStock: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Supplier {
  id: string;
  code: string;
  name: string;
  contactEmail: string;
  phone: string;
  address: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Warehouse {
  id: string;
  code: string;
  name: string;
  address: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PurchaseRequestItem {
  id: string;
  productId: string;
  productSku: string;
  productName: string;
  productUnit: string;
  quantity: number;
  notes: string | null;
}

export interface PurchaseRequest {
  id: string;
  requestNumber: string;
  warehouseId: string;
  warehouseName: string;
  requestedBy: string;
  requesterName: string;
  status: PurchaseRequestStatus;
  notes: string | null;
  rejectionReason: string | null;
  submittedAt: string | null;
  approvedAt: string | null;
  approvedBy: string | null;
  rejectedAt: string | null;
  rejectedBy: string | null;
  createdAt: string;
  updatedAt: string;
  items: PurchaseRequestItem[];
}

export interface PurchaseOrderItem {
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

export interface PurchaseOrder {
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
  orderedAt: string | null;
  cancelledAt: string | null;
  createdAt: string;
  updatedAt: string;
  items: PurchaseOrderItem[];
}

export interface GoodsReceiptItem {
  id: string;
  purchaseOrderItemId: string;
  productId: string;
  productSku: string;
  productName: string;
  productUnit: string;
  quantityReceived: number;
}

export interface GoodsReceipt {
  id: string;
  receiptNumber: string;
  purchaseOrderId: string;
  purchaseOrderNumber: string;
  warehouseId: string;
  warehouseName: string;
  receivedBy: string;
  receiverName: string;
  status: "POSTED";
  notes: string | null;
  receivedAt: string;
  createdAt: string;
  items: GoodsReceiptItem[];
}

export interface InventoryBalance {
  id: string;
  warehouseId: string;
  warehouseCode: string;
  warehouseName: string;
  productId: string;
  productSku: string;
  productName: string;
  productCategory: string;
  productUnit: string;
  minStock: number;
  quantity: number;
  isLowStock: boolean;
  updatedAt: string;
}

export interface InventoryMovement {
  id: string;
  warehouseId: string;
  warehouseCode: string;
  warehouseName: string;
  productId: string;
  productSku: string;
  productName: string;
  productUnit: string;
  movementType: string;
  referenceType: string;
  referenceId: string;
  quantityChange: number;
  balanceAfter: number;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  actorId: string | null;
  actorName: string;
  actorRole: string;
  action: string;
  entityType: string;
  entityId: string;
  summary: string;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}
