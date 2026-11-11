import { Elysia } from "elysia";
import { requireAuthenticatedUser } from "@/modules/auth/service";
import {
  createProductBodySchema,
  updateProductBodySchema,
} from "@/modules/products/model";
import {
  createProduct,
  deleteProduct,
  getProductById,
  listProducts,
  updateProduct,
} from "@/modules/products/service";

export const productsModule = new Elysia({ prefix: "/api/products" })
  .get("/", async ({ request, query }) => {
    await requireAuthenticatedUser(request);
    return listProducts({
      page: typeof query.page === "string" ? query.page : undefined,
      limit: typeof query.limit === "string" ? query.limit : undefined,
      search: typeof query.search === "string" ? query.search : undefined,
      category: typeof query.category === "string" ? query.category : undefined,
      isActive: typeof query.isActive === "string" ? query.isActive : undefined,
    });
  })
  .get("/:id", async ({ request, params }) => {
    await requireAuthenticatedUser(request);
    const product = await getProductById(params.id);
    return { data: product };
  })
  .post(
    "/",
    async ({ request, body, set }) => {
      const actor = await requireAuthenticatedUser(request);
      const created = await createProduct(body, actor);
      set.status = 201;
      return { data: created };
    },
    {
      body: createProductBodySchema,
    },
  )
  .patch(
    "/:id",
    async ({ request, params, body }) => {
      const actor = await requireAuthenticatedUser(request);
      const updated = await updateProduct(params.id, body, actor);
      return { data: updated };
    },
    {
      body: updateProductBodySchema,
    },
  )
  .delete("/:id", async ({ request, params }) => {
    const actor = await requireAuthenticatedUser(request);
    const result = await deleteProduct(params.id, actor);
    return { data: result };
  });
