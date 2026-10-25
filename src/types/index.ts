export type UserRole = "USER" | "APPROVER";

export type NavigationTab =
  | "dashboard"
  | "products"
  | "purchase-requests"
  | "purchase-orders"
  | "goods-receipts"
  | "inventory"
  | "audit-logs"
  | "control-panel";

export interface UserProfile {
  id: string;
  name: string;
  username: string;
  role: UserRole;
  email: string;
}

export type PRStatus = "DRAFT" | "SUBMITTED" | "APPROVED" | "REJECTED";

export type POStatus =
  "DRAFT" | "ORDERED" | "PARTIALLY_RECEIVED" | "RECEIVED" | "CANCELLED";

export type MovementType = "PURCHASE_RECEIPT";

export interface Product {
  id: string;
  sku: string;
  name: string;
  unit: string;
  minStock: number;
  category: string;
  isActive: boolean;
}

export interface Supplier {
  id: string;
  name: string;
  email: string;
  phone: string;
  isActive: boolean;
}

export interface Warehouse {
  id: string;
  code: string;
  name: string;
  location: string;
  isActive: boolean;
}

export interface PRItem {
  id: string;
  productId: string;
  quantity: number;
}

export interface PurchaseRequest {
  id: string;
  requestNumber: string;
  warehouseId: string;
  status: PRStatus;
  createdBy: string;
  createdAt: string;
  items: PRItem[];
  notes?: string;
}

export interface POItem {
  id: string;
  productId: string;
  quantity: number;
  receivedQuantity: number;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  purchaseRequestId: string;
  supplierId: string;
  warehouseId: string;
  status: POStatus;
  createdBy: string;
  createdAt: string;
  items: POItem[];
}

export interface GRItem {
  id: string;
  productId: string;
  quantity: number;
}

export interface GoodsReceipt {
  id: string;
  grNumber: string;
  purchaseOrderId: string;
  receivedBy: string;
  receivedAt: string;
  items: GRItem[];
}

export interface InventoryBalance {
  warehouseId: string;
  productId: string;
  stock: number;
}

export interface InventoryMovement {
  id: string;
  warehouseId: string;
  productId: string;
  movementType: MovementType;
  quantity: number;
  referenceType: string;
  referenceId: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  entity: string;
  entityId: string;
  action: string;
  performedBy: string;
  timestamp: string;
  details?: string;
}
