import { fail, redirect, type Actions, type ServerLoad } from "@sveltejs/kit";
import { callBackendApi } from "@/lib/server/api";
import type {
  AppLanguage,
  PaginatedResponse,
  Product,
  Supplier,
  Warehouse,
} from "@/lib/types";

export interface MasterPageData {
  lang: AppLanguage;
  search: string;
  products: Product[];
  suppliers: Supplier[];
  warehouses: Warehouse[];
}

export interface MasterActionData {
  error?: string;
  success?: string;
}

export const load: ServerLoad = async ({
  locals,
  url,
}): Promise<MasterPageData> => {
  if (!locals.user || !locals.token) {
    throw redirect(303, "/login");
  }

  const search = url.searchParams.get("search")?.trim() ?? "";
  const querySuffix = search
    ? `?limit=50&search=${encodeURIComponent(search)}`
    : "?limit=50";

  const [productsRes, suppliersRes, warehousesRes] = await Promise.all([
    callBackendApi<PaginatedResponse<Product>>(`/api/products${querySuffix}`, {
      token: locals.token,
    }),
    callBackendApi<PaginatedResponse<Supplier>>(
      `/api/suppliers${querySuffix}`,
      {
        token: locals.token,
      },
    ),
    callBackendApi<PaginatedResponse<Warehouse>>(
      `/api/warehouses${querySuffix}`,
      {
        token: locals.token,
      },
    ),
  ]);

  return {
    lang: locals.lang,
    search,
    products: productsRes.data?.data ?? [],
    suppliers: suppliersRes.data?.data ?? [],
    warehouses: warehousesRes.data?.data ?? [],
  };
};

export const actions: Actions = {
  createProduct: async ({ request, locals }) => {
    if (!locals.token) throw redirect(303, "/login");
    const formData = await request.formData();
    const res = await callBackendApi("/api/products", {
      method: "POST",
      token: locals.token,
      body: {
        sku: String(formData.get("sku") ?? ""),
        name: String(formData.get("name") ?? ""),
        category: String(formData.get("category") ?? "General"),
        unit: String(formData.get("unit") ?? "unit"),
        unitPrice: Number(formData.get("unitPrice") ?? 0),
        minStock: Number(formData.get("minStock") ?? 10),
      },
    });
    if (!res.ok) {
      return fail(res.status, { error: res.errorMessage });
    }
    return { success: "Product created successfully" };
  },

  toggleProduct: async ({ request, locals }) => {
    if (!locals.token) throw redirect(303, "/login");
    const formData = await request.formData();
    const id = String(formData.get("id") ?? "");
    const isActive = formData.get("isActive") === "true";
    const res = await callBackendApi(`/api/products/${id}`, {
      method: "PATCH",
      token: locals.token,
      body: { isActive: !isActive },
    });
    if (!res.ok) {
      return fail(res.status, { error: res.errorMessage });
    }
    return { success: "Product status updated" };
  },

  createSupplier: async ({ request, locals }) => {
    if (!locals.token) throw redirect(303, "/login");
    const formData = await request.formData();
    const res = await callBackendApi("/api/suppliers", {
      method: "POST",
      token: locals.token,
      body: {
        code: String(formData.get("code") ?? ""),
        name: String(formData.get("name") ?? ""),
        contactEmail: String(formData.get("contactEmail") ?? ""),
        phone: String(formData.get("phone") ?? ""),
        address: String(formData.get("address") ?? ""),
      },
    });
    if (!res.ok) {
      return fail(res.status, { error: res.errorMessage });
    }
    return { success: "Supplier created successfully" };
  },

  toggleSupplier: async ({ request, locals }) => {
    if (!locals.token) throw redirect(303, "/login");
    const formData = await request.formData();
    const id = String(formData.get("id") ?? "");
    const isActive = formData.get("isActive") === "true";
    const res = await callBackendApi(`/api/suppliers/${id}`, {
      method: "PATCH",
      token: locals.token,
      body: { isActive: !isActive },
    });
    if (!res.ok) {
      return fail(res.status, { error: res.errorMessage });
    }
    return { success: "Supplier status updated" };
  },

  createWarehouse: async ({ request, locals }) => {
    if (!locals.token) throw redirect(303, "/login");
    const formData = await request.formData();
    const res = await callBackendApi("/api/warehouses", {
      method: "POST",
      token: locals.token,
      body: {
        code: String(formData.get("code") ?? ""),
        name: String(formData.get("name") ?? ""),
        address: String(formData.get("address") ?? ""),
      },
    });
    if (!res.ok) {
      return fail(res.status, { error: res.errorMessage });
    }
    return { success: "Warehouse created successfully" };
  },

  toggleWarehouse: async ({ request, locals }) => {
    if (!locals.token) throw redirect(303, "/login");
    const formData = await request.formData();
    const id = String(formData.get("id") ?? "");
    const isActive = formData.get("isActive") === "true";
    const res = await callBackendApi(`/api/warehouses/${id}`, {
      method: "PATCH",
      token: locals.token,
      body: { isActive: !isActive },
    });
    if (!res.ok) {
      return fail(res.status, { error: res.errorMessage });
    }
    return { success: "Warehouse status updated" };
  },
};
