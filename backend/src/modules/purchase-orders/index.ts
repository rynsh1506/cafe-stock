import { Elysia } from "elysia";
import { requireAuthenticatedUser } from "@/modules/auth/service";
import {
  createPurchaseOrderBodySchema,
  updatePurchaseOrderBodySchema,
} from "@/modules/purchase-orders/model";
import {
  cancelPurchaseOrder,
  createPurchaseOrder,
  getPurchaseOrderById,
  listPurchaseOrders,
  markPurchaseOrderOrdered,
  updatePurchaseOrder,
} from "@/modules/purchase-orders/service";
import { executeWithIdempotency } from "@/utils/idempotency";

export const purchaseOrdersModule = new Elysia({
  prefix: "/api/purchase-orders",
})
  .get("/", async ({ request, query }) => {
    await requireAuthenticatedUser(request);
    return listPurchaseOrders({
      page: typeof query.page === "string" ? query.page : undefined,
      limit: typeof query.limit === "string" ? query.limit : undefined,
      status: typeof query.status === "string" ? query.status : undefined,
      supplierId:
        typeof query.supplierId === "string" ? query.supplierId : undefined,
      warehouseId:
        typeof query.warehouseId === "string" ? query.warehouseId : undefined,
      search: typeof query.search === "string" ? query.search : undefined,
    });
  })
  .get("/:id", async ({ request, params }) => {
    await requireAuthenticatedUser(request);
    const po = await getPurchaseOrderById(params.id);
    return { data: po };
  })
  .post(
    "/",
    async ({ request, body, set }) => {
      const actor = await requireAuthenticatedUser(request);
      const result = await executeWithIdempotency(
        {
          idempotencyKey: request.headers.get("idempotency-key"),
          endpoint: "POST /api/purchase-orders",
          userId: actor.id,
          defaultStatusCode: 201,
        },
        async () => {
          const created = await createPurchaseOrder(body, actor);
          return { data: created };
        },
      );
      set.status = result.statusCode;
      return result.body;
    },
    {
      body: createPurchaseOrderBodySchema,
    },
  )
  .patch(
    "/:id",
    async ({ request, params, body }) => {
      const actor = await requireAuthenticatedUser(request);
      const updated = await updatePurchaseOrder(params.id, body, actor);
      return { data: updated };
    },
    {
      body: updatePurchaseOrderBodySchema,
    },
  )
  .post("/:id/order", async ({ request, params }) => {
    const actor = await requireAuthenticatedUser(request);
    const result = await executeWithIdempotency(
      {
        idempotencyKey: request.headers.get("idempotency-key"),
        endpoint: `POST /api/purchase-orders/${params.id}/order`,
        userId: actor.id,
      },
      async () => {
        const po = await markPurchaseOrderOrdered(params.id, actor);
        return { data: po };
      },
    );
    return result.body;
  })
  .post("/:id/cancel", async ({ request, params }) => {
    const actor = await requireAuthenticatedUser(request);
    const result = await executeWithIdempotency(
      {
        idempotencyKey: request.headers.get("idempotency-key"),
        endpoint: `POST /api/purchase-orders/${params.id}/cancel`,
        userId: actor.id,
      },
      async () => {
        const po = await cancelPurchaseOrder(params.id, actor);
        return { data: po };
      },
    );
    return result.body;
  });
