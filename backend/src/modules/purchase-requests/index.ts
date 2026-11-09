import { Elysia } from "elysia";
import {
  requireApproverUser,
  requireAuthenticatedUser,
} from "@/modules/auth/service";
import {
  createPurchaseRequestBodySchema,
  rejectPurchaseRequestBodySchema,
  updatePurchaseRequestBodySchema,
} from "@/modules/purchase-requests/model";
import {
  approvePurchaseRequest,
  createPurchaseRequest,
  getPurchaseRequestById,
  listPurchaseRequests,
  rejectPurchaseRequest,
  submitPurchaseRequest,
  updatePurchaseRequest,
} from "@/modules/purchase-requests/service";
import { executeWithIdempotency } from "@/utils/idempotency";

export const purchaseRequestsModule = new Elysia({
  prefix: "/api/purchase-requests",
})
  .get("/", async ({ request, query }) => {
    await requireAuthenticatedUser(request);
    return listPurchaseRequests({
      page: typeof query.page === "string" ? query.page : undefined,
      limit: typeof query.limit === "string" ? query.limit : undefined,
      status: typeof query.status === "string" ? query.status : undefined,
      warehouseId:
        typeof query.warehouseId === "string" ? query.warehouseId : undefined,
      search: typeof query.search === "string" ? query.search : undefined,
    });
  })
  .get("/:id", async ({ request, params }) => {
    await requireAuthenticatedUser(request);
    const pr = await getPurchaseRequestById(params.id);
    return { data: pr };
  })
  .post(
    "/",
    async ({ request, body, set }) => {
      const actor = await requireAuthenticatedUser(request);
      const created = await createPurchaseRequest(body, actor);
      set.status = 201;
      return { data: created };
    },
    {
      body: createPurchaseRequestBodySchema,
    },
  )
  .patch(
    "/:id",
    async ({ request, params, body }) => {
      const actor = await requireAuthenticatedUser(request);
      const updated = await updatePurchaseRequest(params.id, body, actor);
      return { data: updated };
    },
    {
      body: updatePurchaseRequestBodySchema,
    },
  )
  .post("/:id/submit", async ({ request, params }) => {
    const actor = await requireAuthenticatedUser(request);
    const result = await executeWithIdempotency(
      {
        idempotencyKey: request.headers.get("idempotency-key"),
        endpoint: `POST /api/purchase-requests/${params.id}/submit`,
        userId: actor.id,
      },
      async () => {
        const pr = await submitPurchaseRequest(params.id, actor);
        return { data: pr };
      },
    );
    return result.body;
  })
  .post("/:id/approve", async ({ request, params }) => {
    const actor = await requireApproverUser(request);
    const result = await executeWithIdempotency(
      {
        idempotencyKey: request.headers.get("idempotency-key"),
        endpoint: `POST /api/purchase-requests/${params.id}/approve`,
        userId: actor.id,
      },
      async () => {
        const pr = await approvePurchaseRequest(params.id, actor);
        return { data: pr };
      },
    );
    return result.body;
  })
  .post(
    "/:id/reject",
    async ({ request, params, body }) => {
      const actor = await requireApproverUser(request);
      const result = await executeWithIdempotency(
        {
          idempotencyKey: request.headers.get("idempotency-key"),
          endpoint: `POST /api/purchase-requests/${params.id}/reject`,
          userId: actor.id,
        },
        async () => {
          const pr = await rejectPurchaseRequest(params.id, body ?? {}, actor);
          return { data: pr };
        },
      );
      return result.body;
    },
    {
      body: rejectPurchaseRequestBodySchema,
    },
  );
