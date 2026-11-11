import { Elysia } from "elysia";
import { requireAuthenticatedUser } from "@/modules/auth/service";
import {
  createWarehouseBodySchema,
  updateWarehouseBodySchema,
} from "@/modules/warehouses/model";
import {
  createWarehouse,
  deleteWarehouse,
  getWarehouseById,
  listWarehouses,
  updateWarehouse,
} from "@/modules/warehouses/service";

export const warehousesModule = new Elysia({ prefix: "/api/warehouses" })
  .get("/", async ({ request, query }) => {
    await requireAuthenticatedUser(request);
    return listWarehouses({
      page: typeof query.page === "string" ? query.page : undefined,
      limit: typeof query.limit === "string" ? query.limit : undefined,
      search: typeof query.search === "string" ? query.search : undefined,
      isActive: typeof query.isActive === "string" ? query.isActive : undefined,
    });
  })
  .get("/:id", async ({ request, params }) => {
    await requireAuthenticatedUser(request);
    const warehouse = await getWarehouseById(params.id);
    return { data: warehouse };
  })
  .post(
    "/",
    async ({ request, body, set }) => {
      const actor = await requireAuthenticatedUser(request);
      const created = await createWarehouse(body, actor);
      set.status = 201;
      return { data: created };
    },
    {
      body: createWarehouseBodySchema,
    },
  )
  .patch(
    "/:id",
    async ({ request, params, body }) => {
      const actor = await requireAuthenticatedUser(request);
      const updated = await updateWarehouse(params.id, body, actor);
      return { data: updated };
    },
    {
      body: updateWarehouseBodySchema,
    },
  )
  .delete("/:id", async ({ request, params }) => {
    const actor = await requireAuthenticatedUser(request);
    const result = await deleteWarehouse(params.id, actor);
    return { data: result };
  });
