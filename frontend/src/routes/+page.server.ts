import { redirect, type ServerLoad } from "@sveltejs/kit";
import { callBackendApi } from "@/lib/server/api";
import type {
  AppLanguage,
  AuditLog,
  AuthUser,
  InventoryBalance,
  InventoryMovement,
  PaginatedResponse,
  Product,
  PurchaseOrder,
  PurchaseRequest,
  Warehouse,
} from "@/lib/types";

export interface WarehouseMetric {
  id: string;
  code: string;
  name: string;
  itemCount: number;
  totalQuantity: number;
  lowStockCount: number;
  capacityUtilization: number;
}

export interface ProcurementPipelineCounts {
  draftPr: number;
  submittedPr: number;
  approvedPr: number;
  orderedPo: number;
  partialPo: number;
  receivedPo: number;
}

export interface DashboardPageData {
  user: AuthUser;
  lang: AppLanguage;
  totalActiveProducts: number;
  lowStockCount: number;
  pendingPrCount: number;
  activePoCount: number;
  lowStockBalances: InventoryBalance[];
  recentMovements: InventoryMovement[];
  recentAudits: AuditLog[];
  warehousesMetrics: WarehouseMetric[];
  pipelineCounts: ProcurementPipelineCounts;
  totalInventoryUnits: number;
}

export const load: ServerLoad = async ({
  locals,
}): Promise<DashboardPageData> => {
  if (!locals.user || !locals.token) {
    throw redirect(303, "/login");
  }

  const token = locals.token;

  const [
    productsRes,
    lowStockRes,
    pendingPrRes,
    orderedPoRes,
    partialPoRes,
    movementsRes,
    auditsRes,
    warehousesRes,
    allBalancesRes,
    draftPrRes,
    approvedPrRes,
    receivedPoRes,
  ] = await Promise.all([
    callBackendApi<PaginatedResponse<Product>>(
      "/api/products?isActive=true&limit=1",
      { token },
    ),
    callBackendApi<PaginatedResponse<InventoryBalance>>(
      "/api/inventory?lowStock=true&limit=6",
      { token },
    ),
    callBackendApi<PaginatedResponse<PurchaseRequest>>(
      "/api/purchase-requests?status=SUBMITTED&limit=1",
      { token },
    ),
    callBackendApi<PaginatedResponse<PurchaseOrder>>(
      "/api/purchase-orders?status=ORDERED&limit=1",
      { token },
    ),
    callBackendApi<PaginatedResponse<PurchaseOrder>>(
      "/api/purchase-orders?status=PARTIALLY_RECEIVED&limit=1",
      { token },
    ),
    callBackendApi<PaginatedResponse<InventoryMovement>>(
      "/api/inventory/movements?limit=6",
      { token },
    ),
    callBackendApi<PaginatedResponse<AuditLog>>("/api/audit-logs?limit=6", {
      token,
    }),
    callBackendApi<PaginatedResponse<Warehouse>>("/api/warehouses?limit=20", {
      token,
    }),
    callBackendApi<PaginatedResponse<InventoryBalance>>(
      "/api/inventory?limit=100",
      { token },
    ),
    callBackendApi<PaginatedResponse<PurchaseRequest>>(
      "/api/purchase-requests?status=DRAFT&limit=1",
      { token },
    ),
    callBackendApi<PaginatedResponse<PurchaseRequest>>(
      "/api/purchase-requests?status=APPROVED&limit=1",
      { token },
    ),
    callBackendApi<PaginatedResponse<PurchaseOrder>>(
      "/api/purchase-orders?status=RECEIVED&limit=1",
      { token },
    ),
  ]);

  const balances = allBalancesRes.data?.data ?? [];
  const warehouses = warehousesRes.data?.data ?? [];
  let totalInventoryUnits = 0;

  const warehousesMetrics: WarehouseMetric[] = warehouses.map((wh, idx) => {
    const whBalances = balances.filter((b) => b.warehouseId === wh.id);
    const whTotal = whBalances.reduce(
      (sum, b) => sum + (Number(b.quantity) || 0),
      0,
    );
    const lowCount = whBalances.filter((b) => b.isLowStock).length;
    totalInventoryUnits += whTotal;

    // Nominal base capacities for roasting hubs and distribution sites
    const nominalBase = idx === 0 ? 600 : idx === 1 ? 400 : 300;
    const utilization = Math.min(
      95,
      Math.max(18, Math.round((whTotal / nominalBase) * 100)),
    );

    return {
      id: wh.id,
      code: wh.code,
      name: wh.name,
      itemCount: whBalances.length,
      totalQuantity: whTotal,
      lowStockCount: lowCount,
      capacityUtilization: utilization,
    };
  });

  return {
    user: locals.user,
    lang: locals.lang,
    totalActiveProducts: productsRes.data?.meta.total ?? 0,
    lowStockCount: lowStockRes.data?.meta.total ?? 0,
    pendingPrCount: pendingPrRes.data?.meta.total ?? 0,
    activePoCount:
      (orderedPoRes.data?.meta.total ?? 0) +
      (partialPoRes.data?.meta.total ?? 0),
    lowStockBalances: lowStockRes.data?.data ?? [],
    recentMovements: movementsRes.data?.data ?? [],
    recentAudits: auditsRes.data?.data ?? [],
    warehousesMetrics,
    pipelineCounts: {
      draftPr: draftPrRes.data?.meta.total ?? 0,
      submittedPr: pendingPrRes.data?.meta.total ?? 0,
      approvedPr: approvedPrRes.data?.meta.total ?? 0,
      orderedPo: orderedPoRes.data?.meta.total ?? 0,
      partialPo: partialPoRes.data?.meta.total ?? 0,
      receivedPo: receivedPoRes.data?.meta.total ?? 0,
    },
    totalInventoryUnits,
  };
};
