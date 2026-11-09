import { randomUUID } from "node:crypto";
import { fail, redirect, type Actions, type ServerLoad } from "@sveltejs/kit";
import { callBackendApi } from "@/lib/server/api";
import type {
  AppLanguage,
  AuthUser,
  PaginatedResponse,
  Product,
  PurchaseRequest,
  Warehouse,
} from "@/lib/types";

export interface PurchaseRequestsPageData {
  user: AuthUser;
  lang: AppLanguage;
  statusFilter: string;
  purchaseRequests: PurchaseRequest[];
  warehouses: Warehouse[];
  products: Product[];
}

export interface PurchaseRequestsActionData {
  error?: string;
  success?: string;
}

export const load: ServerLoad = async ({
  locals,
  url,
}): Promise<PurchaseRequestsPageData> => {
  if (!locals.user || !locals.token) {
    throw redirect(303, "/login");
  }

  const statusFilter = url.searchParams.get("status")?.trim() ?? "";
  const prUrl = statusFilter
    ? `/api/purchase-requests?limit=50&status=${encodeURIComponent(statusFilter)}`
    : "/api/purchase-requests?limit=50";

  const [prsRes, warehousesRes, productsRes] = await Promise.all([
    callBackendApi<PaginatedResponse<PurchaseRequest>>(prUrl, {
      token: locals.token,
    }),
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
    user: locals.user,
    lang: locals.lang,
    statusFilter,
    purchaseRequests: prsRes.data?.data ?? [],
    warehouses: warehousesRes.data?.data ?? [],
    products: productsRes.data?.data ?? [],
  };
};

export const actions: Actions = {
  create: async ({ request, locals }) => {
    if (!locals.token) throw redirect(303, "/login");
    const formData = await request.formData();
    const warehouseId = String(formData.get("warehouseId") ?? "");
    const productId = String(formData.get("productId") ?? "");
    const quantity = Number(formData.get("quantity") ?? 0);
    const notes = String(formData.get("notes") ?? "");

    const res = await callBackendApi("/api/purchase-requests", {
      method: "POST",
      token: locals.token,
      body: {
        warehouseId,
        notes,
        items: [{ productId, quantity }],
      },
    });

    if (!res.ok) {
      return fail(res.status, { error: res.errorMessage });
    }
    return { success: "Draft Purchase Request created" };
  },

  submit: async ({ request, locals }) => {
    if (!locals.token) throw redirect(303, "/login");
    const formData = await request.formData();
    const id = String(formData.get("id") ?? "");

    const res = await callBackendApi(`/api/purchase-requests/${id}/submit`, {
      method: "POST",
      token: locals.token,
      idempotencyKey: randomUUID(),
    });
    if (!res.ok) {
      return fail(res.status, { error: res.errorMessage });
    }
    return { success: "Purchase Request submitted for approval" };
  },

  approve: async ({ request, locals }) => {
    if (!locals.token) throw redirect(303, "/login");
    const formData = await request.formData();
    const id = String(formData.get("id") ?? "");

    const res = await callBackendApi(`/api/purchase-requests/${id}/approve`, {
      method: "POST",
      token: locals.token,
      idempotencyKey: randomUUID(),
    });
    if (!res.ok) {
      return fail(res.status, { error: res.errorMessage });
    }
    return { success: "Purchase Request APPROVED" };
  },

  reject: async ({ request, locals }) => {
    if (!locals.token) throw redirect(303, "/login");
    const formData = await request.formData();
    const id = String(formData.get("id") ?? "");
    const reason =
      String(formData.get("reason") ?? "").trim() || "Rejected via SSR portal";

    const res = await callBackendApi(`/api/purchase-requests/${id}/reject`, {
      method: "POST",
      token: locals.token,
      idempotencyKey: randomUUID(),
      body: { reason },
    });
    if (!res.ok) {
      return fail(res.status, { error: res.errorMessage });
    }
    return { success: "Purchase Request REJECTED" };
  },
};
