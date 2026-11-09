import { and, count, desc, eq, ilike, lte, or, type SQL } from "drizzle-orm";
import { db } from "@/db/index";
import {
  inventoryBalances,
  inventoryMovements,
  products,
  warehouses,
} from "@/db/schema";
import type {
  InventoryBalanceView,
  InventoryMovementView,
  ListInventoryBalancesQuery,
  ListInventoryMovementsQuery,
} from "@/modules/inventory/model";
import {
  buildPaginatedResponse,
  parsePagination,
  type PaginatedResponse,
} from "@/utils/pagination";

export async function listInventoryBalances(
  query: ListInventoryBalancesQuery,
): Promise<PaginatedResponse<InventoryBalanceView>> {
  const pagination = parsePagination(query);
  const conditions: SQL[] = [];

  if (query.warehouseId && query.warehouseId.trim().length > 0) {
    conditions.push(
      eq(inventoryBalances.warehouseId, query.warehouseId.trim()),
    );
  }

  if (query.productId && query.productId.trim().length > 0) {
    conditions.push(eq(inventoryBalances.productId, query.productId.trim()));
  }

  if (query.search && query.search.trim().length > 0) {
    const pattern = `%${query.search.trim()}%`;
    const searchCondition = or(
      ilike(products.name, pattern),
      ilike(products.sku, pattern),
      ilike(warehouses.name, pattern),
    );
    if (searchCondition) {
      conditions.push(searchCondition);
    }
  }

  if (query.lowStock === "true") {
    conditions.push(lte(inventoryBalances.quantity, products.minStock));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const [totalRow] = await db
    .select({ value: count() })
    .from(inventoryBalances)
    .innerJoin(warehouses, eq(inventoryBalances.warehouseId, warehouses.id))
    .innerJoin(products, eq(inventoryBalances.productId, products.id))
    .where(whereClause);

  const rows = await db
    .select({
      id: inventoryBalances.id,
      warehouseId: inventoryBalances.warehouseId,
      warehouseCode: warehouses.code,
      warehouseName: warehouses.name,
      productId: inventoryBalances.productId,
      productSku: products.sku,
      productName: products.name,
      productCategory: products.category,
      productUnit: products.unit,
      minStock: products.minStock,
      quantity: inventoryBalances.quantity,
      updatedAt: inventoryBalances.updatedAt,
    })
    .from(inventoryBalances)
    .innerJoin(warehouses, eq(inventoryBalances.warehouseId, warehouses.id))
    .innerJoin(products, eq(inventoryBalances.productId, products.id))
    .where(whereClause)
    .orderBy(desc(inventoryBalances.updatedAt))
    .limit(pagination.limit)
    .offset(pagination.offset);

  const views: InventoryBalanceView[] = rows.map((row) => ({
    ...row,
    isLowStock: row.quantity <= row.minStock,
  }));

  return buildPaginatedResponse(
    views,
    Number(totalRow?.value ?? 0),
    pagination,
  );
}

export async function listInventoryMovements(
  query: ListInventoryMovementsQuery,
): Promise<PaginatedResponse<InventoryMovementView>> {
  const pagination = parsePagination(query);
  const conditions: SQL[] = [];

  if (query.warehouseId && query.warehouseId.trim().length > 0) {
    conditions.push(
      eq(inventoryMovements.warehouseId, query.warehouseId.trim()),
    );
  }

  if (query.productId && query.productId.trim().length > 0) {
    conditions.push(eq(inventoryMovements.productId, query.productId.trim()));
  }

  if (query.referenceId && query.referenceId.trim().length > 0) {
    conditions.push(
      eq(inventoryMovements.referenceId, query.referenceId.trim()),
    );
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const [totalRow] = await db
    .select({ value: count() })
    .from(inventoryMovements)
    .innerJoin(warehouses, eq(inventoryMovements.warehouseId, warehouses.id))
    .innerJoin(products, eq(inventoryMovements.productId, products.id))
    .where(whereClause);

  const rows = await db
    .select({
      id: inventoryMovements.id,
      warehouseId: inventoryMovements.warehouseId,
      warehouseCode: warehouses.code,
      warehouseName: warehouses.name,
      productId: inventoryMovements.productId,
      productSku: products.sku,
      productName: products.name,
      productUnit: products.unit,
      movementType: inventoryMovements.movementType,
      referenceType: inventoryMovements.referenceType,
      referenceId: inventoryMovements.referenceId,
      quantityChange: inventoryMovements.quantityChange,
      balanceAfter: inventoryMovements.balanceAfter,
      createdAt: inventoryMovements.createdAt,
    })
    .from(inventoryMovements)
    .innerJoin(warehouses, eq(inventoryMovements.warehouseId, warehouses.id))
    .innerJoin(products, eq(inventoryMovements.productId, products.id))
    .where(whereClause)
    .orderBy(desc(inventoryMovements.createdAt))
    .limit(pagination.limit)
    .offset(pagination.offset);

  return buildPaginatedResponse(rows, Number(totalRow?.value ?? 0), pagination);
}
