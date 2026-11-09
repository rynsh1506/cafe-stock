import { Elysia } from "elysia";
import { requireAuthenticatedUser } from "@/modules/auth/service";
import { createGoodsReceiptBodySchema } from "@/modules/goods-receipts/model";
import {
  createGoodsReceipt,
  getGoodsReceiptById,
  listGoodsReceipts,
} from "@/modules/goods-receipts/service";
import { executeWithIdempotency } from "@/utils/idempotency";

export const goodsReceiptsModule = new Elysia({ prefix: "/api/goods-receipts" })
  .get("/", async ({ request, query }) => {
    await requireAuthenticatedUser(request);
    return listGoodsReceipts({
      page: typeof query.page === "string" ? query.page : undefined,
      limit: typeof query.limit === "string" ? query.limit : undefined,
      purchaseOrderId:
        typeof query.purchaseOrderId === "string"
          ? query.purchaseOrderId
          : undefined,
      warehouseId:
        typeof query.warehouseId === "string" ? query.warehouseId : undefined,
      search: typeof query.search === "string" ? query.search : undefined,
    });
  })
  .get("/:id", async ({ request, params }) => {
    await requireAuthenticatedUser(request);
    const gr = await getGoodsReceiptById(params.id);
    return { data: gr };
  })
  .post(
    "/",
    async ({ request, body, set }) => {
      const actor = await requireAuthenticatedUser(request);
      const result = await executeWithIdempotency(
        {
          idempotencyKey: request.headers.get("idempotency-key"),
          endpoint: "POST /api/goods-receipts",
          userId: actor.id,
          defaultStatusCode: 201,
        },
        async () => {
          const created = await createGoodsReceipt(body, actor);
          return { data: created };
        },
      );
      set.status = result.statusCode;
      return result.body;
    },
    {
      body: createGoodsReceiptBodySchema,
    },
  );
