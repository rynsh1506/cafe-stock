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
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
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
  const page = Math.max(1, Number(url.searchParams.get("page") ?? 1));
  const limit = Math.max(1, Number(url.searchParams.get("limit") ?? 15));

  const [grRes, orderedPosRes, partialPosRes] = await Promise.all([
    callBackendApi<PaginatedResponse<GoodsReceipt>>(
      `/api/goods-receipts?page=${page}&limit=${limit}`,
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
    pagination: grRes.data?.meta ?? {
      page,
      limit,
      total: grRes.data?.data?.length ?? 0,
      totalPages: 1,
    },
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
      idempotencyKey: crypto.randomUUID(),
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
