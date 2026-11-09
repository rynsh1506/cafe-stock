import { fail, redirect, type Actions, type ServerLoad } from "@sveltejs/kit";
import { callBackendApi } from "@/lib/server/api";
import type {
  AppLanguage,
  PaginatedResponse,
  Product,
  PurchaseOrder,
  PurchaseRequest,
  Supplier,
  Warehouse,
} from "@/lib/types";

export interface PurchaseOrdersPageData {
  lang: AppLanguage;
  statusFilter: string;
  purchaseOrders: PurchaseOrder[];
  approvedPrs: PurchaseRequest[];
  suppliers: Supplier[];
  warehouses: Warehouse[];
  products: Product[];
}

export interface PurchaseOrdersActionData {
  error?: string;
  success?: string;
}

export const load: ServerLoad = async ({
  locals,
  url,
}): Promise<PurchaseOrdersPageData> => {
  if (!locals.user || !locals.token) {
    throw redirect(303, "/login");
  }

  const statusFilter = url.searchParams.get("status")?.trim() ?? "";
  const poUrl = statusFilter
    ? `/api/purchase-orders?limit=50&status=${encodeURIComponent(statusFilter)}`
    : "/api/purchase-orders?limit=50";

  const [posRes, approvedPrsRes, suppliersRes, warehousesRes, productsRes] =
    await Promise.all([
      callBackendApi<PaginatedResponse<PurchaseOrder>>(poUrl, {
        token: locals.token,
      }),
      callBackendApi<PaginatedResponse<PurchaseRequest>>(
        "/api/purchase-requests?status=APPROVED&limit=50",
        { token: locals.token },
      ),
      callBackendApi<PaginatedResponse<Supplier>>(
        "/api/suppliers?isActive=true&limit=50",
        { token: locals.token },
      ),
      callBackendApi<PaginatedResponse<Warehouse>>(
        "/api/warehouses?isActive=true&limit=50",
        { token: locals.token },
      ),
      callBackendApi<PaginatedResponse<Product>>(
        "/api/products?isActive=true&limit=50",
        { token: locals.token },
      ),
    ]);

  return {
    lang: locals.lang,
    statusFilter,
    purchaseOrders: posRes.data?.data ?? [],
    approvedPrs: approvedPrsRes.data?.data ?? [],
    suppliers: suppliersRes.data?.data ?? [],
    warehouses: warehousesRes.data?.data ?? [],
    products: productsRes.data?.data ?? [],
  };
};

export const actions: Actions = {
  createFromPr: async ({ request, locals }) => {
    if (!locals.token) throw redirect(303, "/login");
    const formData = await request.formData();
    const purchaseRequestId = String(formData.get("purchaseRequestId") ?? "");
    const supplierId = String(formData.get("supplierId") ?? "");
    const expectedDate = String(formData.get("expectedDate") ?? "");

    const res = await callBackendApi("/api/purchase-orders", {
      method: "POST",
      token: locals.token,
      idempotencyKey: crypto.randomUUID(),
      body: {
        purchaseRequestId,
        supplierId,
        expectedDate: expectedDate || undefined,
      },
    });
    if (!res.ok) {
      return fail(res.status, { error: res.errorMessage });
    }
    return {
      success: "Purchase Order created from APPROVED Purchase Request",
    };
  },

  createStandalone: async ({ request, locals }) => {
    if (!locals.token) throw redirect(303, "/login");
    const formData = await request.formData();
    const supplierId = String(formData.get("supplierId") ?? "");
    const warehouseId = String(formData.get("warehouseId") ?? "");
    const productId = String(formData.get("productId") ?? "");
    const orderedQuantity = Number(formData.get("orderedQuantity") ?? 0);

    const res = await callBackendApi("/api/purchase-orders", {
      method: "POST",
      token: locals.token,
      idempotencyKey: crypto.randomUUID(),
      body: {
        supplierId,
        warehouseId,
        items: [{ productId, orderedQuantity }],
      },
    });
    if (!res.ok) {
      return fail(res.status, { error: res.errorMessage });
    }
    return { success: "Standalone Purchase Order created" };
  },

  markOrdered: async ({ request, locals }) => {
    if (!locals.token) throw redirect(303, "/login");
    const formData = await request.formData();
    const id = String(formData.get("id") ?? "");
    const res = await callBackendApi(`/api/purchase-orders/${id}/order`, {
      method: "POST",
      token: locals.token,
      idempotencyKey: crypto.randomUUID(),
    });
    if (!res.ok) {
      return fail(res.status, { error: res.errorMessage });
    }
    return { success: "Purchase Order marked as ORDERED" };
  },

  cancel: async ({ request, locals }) => {
    if (!locals.token) throw redirect(303, "/login");
    const formData = await request.formData();
    const id = String(formData.get("id") ?? "");
    const res = await callBackendApi(`/api/purchase-orders/${id}/cancel`, {
      method: "POST",
      token: locals.token,
      idempotencyKey: crypto.randomUUID(),
    });
    if (!res.ok) {
      return fail(res.status, { error: res.errorMessage });
    }
    return { success: "Purchase Order CANCELLED" };
  },
};
