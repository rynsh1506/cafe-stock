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
} from "@/lib/types";

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
  ]);

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
  };
};
