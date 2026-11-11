import { redirect, type ServerLoad } from "@sveltejs/kit";
import { callBackendApi } from "@/lib/server/api";
import type {
  AppLanguage,
  InventoryBalance,
  InventoryMovement,
  PaginatedResponse,
  Warehouse,
} from "@/lib/types";

export interface InventoryPageData {
  lang: AppLanguage;
  warehouseFilter: string;
  lowStockOnly: boolean;
  warehouses: Warehouse[];
  balances: InventoryBalance[];
  movements: InventoryMovement[];
  balancesPagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  movementsPagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const load: ServerLoad = async ({
  locals,
  url,
}): Promise<InventoryPageData> => {
  if (!locals.user || !locals.token) {
    throw redirect(303, "/login");
  }

  const warehouseFilter = url.searchParams.get("warehouseId")?.trim() ?? "";
  const lowStockOnly = url.searchParams.get("lowStock") === "true";
  const page = Math.max(1, Number(url.searchParams.get("page") ?? 1));
  const limit = Math.max(1, Number(url.searchParams.get("limit") ?? 20));

  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  if (warehouseFilter) params.set("warehouseId", warehouseFilter);
  if (lowStockOnly) params.set("lowStock", "true");

  const movParams = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  if (warehouseFilter) movParams.set("warehouseId", warehouseFilter);

  const [warehousesRes, balancesRes, movementsRes] = await Promise.all([
    callBackendApi<PaginatedResponse<Warehouse>>("/api/warehouses?limit=50", {
      token: locals.token,
    }),
    callBackendApi<PaginatedResponse<InventoryBalance>>(
      `/api/inventory?${params.toString()}`,
      { token: locals.token },
    ),
    callBackendApi<PaginatedResponse<InventoryMovement>>(
      `/api/inventory/movements?${movParams.toString()}`,
      { token: locals.token },
    ),
  ]);

  return {
    lang: locals.lang,
    warehouseFilter,
    lowStockOnly,
    warehouses: warehousesRes.data?.data ?? [],
    balances: balancesRes.data?.data ?? [],
    movements: movementsRes.data?.data ?? [],
    balancesPagination: balancesRes.data?.meta ?? {
      page,
      limit,
      total: balancesRes.data?.data?.length ?? 0,
      totalPages: 1,
    },
    movementsPagination: movementsRes.data?.meta ?? {
      page,
      limit,
      total: movementsRes.data?.data?.length ?? 0,
      totalPages: 1,
    },
  };
};
