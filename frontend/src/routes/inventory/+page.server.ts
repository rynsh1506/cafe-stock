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

  const params = new URLSearchParams({ limit: "50" });
  if (warehouseFilter) params.set("warehouseId", warehouseFilter);
  if (lowStockOnly) params.set("lowStock", "true");

  const movParams = new URLSearchParams({ limit: "50" });
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
  };
};
