import { Elysia } from "elysia";
import { requireAuthenticatedUser } from "@/modules/auth/service";
import {
  listInventoryBalances,
  listInventoryMovements,
} from "@/modules/inventory/service";

export const inventoryModule = new Elysia({ prefix: "/api/inventory" })
  .get("/", async ({ request, query }) => {
    await requireAuthenticatedUser(request);
    return listInventoryBalances({
      page: typeof query.page === "string" ? query.page : undefined,
      limit: typeof query.limit === "string" ? query.limit : undefined,
      warehouseId:
        typeof query.warehouseId === "string" ? query.warehouseId : undefined,
      productId:
        typeof query.productId === "string" ? query.productId : undefined,
      search: typeof query.search === "string" ? query.search : undefined,
      lowStock: typeof query.lowStock === "string" ? query.lowStock : undefined,
    });
  })
  .get("/movements", async ({ request, query }) => {
    await requireAuthenticatedUser(request);
    return listInventoryMovements({
      page: typeof query.page === "string" ? query.page : undefined,
      limit: typeof query.limit === "string" ? query.limit : undefined,
      warehouseId:
        typeof query.warehouseId === "string" ? query.warehouseId : undefined,
      productId:
        typeof query.productId === "string" ? query.productId : undefined,
      referenceId:
        typeof query.referenceId === "string" ? query.referenceId : undefined,
    });
  });
