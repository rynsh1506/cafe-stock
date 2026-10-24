export type UserRole = "USER" | "APPROVER";

export type NavigationTab =
  | "dashboard"
  | "products"
  | "purchase-requests"
  | "purchase-orders"
  | "goods-receipts"
  | "inventory"
  | "audit-logs";

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
