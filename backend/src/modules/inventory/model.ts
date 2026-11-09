export interface ListInventoryBalancesQuery {
  page?: string;
  limit?: string;
  warehouseId?: string;
  productId?: string;
  search?: string;
  lowStock?: string;
}

export interface ListInventoryMovementsQuery {
  page?: string;
  limit?: string;
  warehouseId?: string;
  productId?: string;
  referenceId?: string;
}

export interface InventoryBalanceView {
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
  updatedAt: Date;
}

export interface InventoryMovementView {
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
  createdAt: Date;
}
