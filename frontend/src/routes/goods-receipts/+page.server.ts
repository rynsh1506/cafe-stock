import { randomUUID } from "node:crypto";
import { fail, redirect, type Actions, type ServerLoad } from "@sveltejs/kit";
import { callBackendApi } from "@/lib/server/api";
import type {
  AppLanguage,
  GoodsReceipt,
  PaginatedResponse,
  PurchaseOrder,
} from "@/lib/types";

export interface GoodsReceiptsPageData {
  lang: AppLanguage;
  selectedPoId: string;
  receivableOrders: PurchaseOrder[];
  goodsReceipts: GoodsReceipt[];
}

export interface GoodsReceiptsActionData {
  error?: string;
  success?: string;
}

export const load: ServerLoad = async ({
  locals,
  url,
}): Promise<GoodsReceiptsPageData> => {
  if (!locals.user || !locals.token) {
    throw redirect(303, "/login");
  }

  const selectedPoId = url.searchParams.get("poId")?.trim() ?? "";

  const [grRes, orderedPosRes, partialPosRes] = await Promise.all([
    callBackendApi<PaginatedResponse<GoodsReceipt>>(
      "/api/goods-receipts?limit=50",
      { token: locals.token },
    ),
    callBackendApi<PaginatedResponse<PurchaseOrder>>(
      "/api/purchase-orders?status=ORDERED&limit=50",
      { token: locals.token },
    ),
    callBackendApi<PaginatedResponse<PurchaseOrder>>(
      "/api/purchase-orders?status=PARTIALLY_RECEIVED&limit=50",
      { token: locals.token },
    ),
  ]);

  const receivableOrders = [
    ...(orderedPosRes.data?.data ?? []),
    ...(partialPosRes.data?.data ?? []),
  ];

  return {
    lang: locals.lang,
    selectedPoId: selectedPoId || (receivableOrders[0]?.id ?? ""),
    receivableOrders,
    goodsReceipts: grRes.data?.data ?? [],
  };
};

export const actions: Actions = {
  postReceipt: async ({ request, locals }) => {
    if (!locals.token) throw redirect(303, "/login");
    const formData = await request.formData();
    const purchaseOrderId = String(formData.get("purchaseOrderId") ?? "");
    const purchaseOrderItemId = String(
      formData.get("purchaseOrderItemId") ?? "",
    );
    const quantityReceived = Number(formData.get("quantityReceived") ?? 0);
    const notes = String(formData.get("notes") ?? "");

    const res = await callBackendApi("/api/goods-receipts", {
      method: "POST",
      token: locals.token,
      idempotencyKey: randomUUID(),
      body: {
        purchaseOrderId,
        notes,
        items: [
          {
            purchaseOrderItemId,
            quantityReceived,
          },
        ],
      },
    });

    if (!res.ok) {
      return fail(res.status, { error: res.errorMessage });
    }
    return {
      success:
        "Goods Receipt posted atomically — inventory balances and movements updated!",
    };
  },
};
