import { Elysia } from "elysia";
import { requireAuthenticatedUser } from "@/modules/auth/service";
import {
  createSupplierBodySchema,
  updateSupplierBodySchema,
} from "@/modules/suppliers/model";
import {
  createSupplier,
  deleteSupplier,
  getSupplierById,
  listSuppliers,
  updateSupplier,
} from "@/modules/suppliers/service";

export const suppliersModule = new Elysia({ prefix: "/api/suppliers" })
  .get("/", async ({ request, query }) => {
    await requireAuthenticatedUser(request);
    return listSuppliers({
      page: typeof query.page === "string" ? query.page : undefined,
      limit: typeof query.limit === "string" ? query.limit : undefined,
      search: typeof query.search === "string" ? query.search : undefined,
      isActive: typeof query.isActive === "string" ? query.isActive : undefined,
    });
  })
  .get("/:id", async ({ request, params }) => {
    await requireAuthenticatedUser(request);
    const supplier = await getSupplierById(params.id);
    return { data: supplier };
  })
  .post(
    "/",
    async ({ request, body, set }) => {
      const actor = await requireAuthenticatedUser(request);
      const created = await createSupplier(body, actor);
      set.status = 201;
      return { data: created };
    },
    {
      body: createSupplierBodySchema,
    },
  )
  .patch(
    "/:id",
    async ({ request, params, body }) => {
      const actor = await requireAuthenticatedUser(request);
      const updated = await updateSupplier(params.id, body, actor);
      return { data: updated };
    },
    {
      body: updateSupplierBodySchema,
    },
  )
  .delete("/:id", async ({ request, params }) => {
    const actor = await requireAuthenticatedUser(request);
    const result = await deleteSupplier(params.id, actor);
    return { data: result };
  });
