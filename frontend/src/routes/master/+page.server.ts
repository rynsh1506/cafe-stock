import { fail, redirect, type Actions, type ServerLoad } from "@sveltejs/kit";
import { callBackendApi } from "@/lib/server/api";
import type {
  AppLanguage,
  PaginatedResponse,
  Product,
  Supplier,
  Warehouse,
} from "@/lib/types";

export interface PendingUser {
  id: string;
  email: string;
  name: string;
  role: string;
  avatarUrl: string | null;
  createdAt: string;
}

export interface UserAccountItem {
  id: string;
  email: string;
  name: string;
  role: string;
  isActive: boolean;
  avatarUrl: string | null;
  totpEnabled: boolean | null;
  createdAt: string;
  updatedAt: string | null;
}

export interface SystemSettingsData {
  cafeName: string;
  appUrl: string;
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpFrom: string;
  hasSmtpPassword: boolean;
  googleClientId: string;
  hasGoogleClientSecret: boolean;
  isSmtpConfigured: boolean;
  isGoogleOAuthConfigured: boolean;
  initializedAt?: string;
}

export interface MasterPageData {
  lang: AppLanguage;
  search: string;
  products: Product[];
  suppliers: Supplier[];
  warehouses: Warehouse[];
  pendingUsers: PendingUser[];
  allUsers: UserAccountItem[];
  systemSettings: SystemSettingsData | null;
  currentUserId: string;
  isApprover: boolean;
  productsPagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  suppliersPagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  warehousesPagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
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
  const page = Math.max(1, Number(url.searchParams.get("page") ?? 1));
  const limit = Math.max(1, Number(url.searchParams.get("limit") ?? 10));

  const queryParams = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  if (search) queryParams.set("search", search);
  const querySuffix = `?${queryParams.toString()}`;

  const isApprover = locals.user.role === "APPROVER";

  const [
    productsRes,
    suppliersRes,
    warehousesRes,
    pendingRes,
    allUsersRes,
    settingsRes,
  ] = await Promise.all([
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
    isApprover
      ? callBackendApi<{ data: PendingUser[] }>("/api/auth/pending-users", {
          token: locals.token,
        })
      : Promise.resolve({ ok: true, data: { data: [] as PendingUser[] } }),
    isApprover
      ? callBackendApi<{ data: UserAccountItem[] }>("/api/auth/users", {
          token: locals.token,
        })
      : Promise.resolve({ ok: true, data: { data: [] as UserAccountItem[] } }),
    isApprover
      ? callBackendApi<{ data: SystemSettingsData }>("/api/setup/settings", {
          token: locals.token,
        })
      : Promise.resolve({
          ok: true,
          data: { data: null as SystemSettingsData | null },
        }),
  ]);

  return {
    lang: locals.lang,
    search,
    products: productsRes.data?.data ?? [],
    suppliers: suppliersRes.data?.data ?? [],
    warehouses: warehousesRes.data?.data ?? [],
    pendingUsers: pendingRes.data?.data ?? [],
    allUsers: allUsersRes.data?.data ?? [],
    systemSettings: settingsRes.data?.data ?? null,
    currentUserId: locals.user.id,
    isApprover,
    productsPagination: productsRes.data?.meta ?? {
      page,
      limit,
      total: productsRes.data?.data?.length ?? 0,
      totalPages: 1,
    },
    suppliersPagination: suppliersRes.data?.meta ?? {
      page,
      limit,
      total: suppliersRes.data?.data?.length ?? 0,
      totalPages: 1,
    },
    warehousesPagination: warehousesRes.data?.meta ?? {
      page,
      limit,
      total: warehousesRes.data?.data?.length ?? 0,
      totalPages: 1,
    },
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

  approveUser: async ({ request, locals }) => {
    if (!locals.token) throw redirect(303, "/login");
    const formData = await request.formData();
    const id = String(formData.get("id") ?? "");
    const role = String(formData.get("role") ?? "USER");
    const res = await callBackendApi(`/api/auth/users/${id}/approve`, {
      method: "POST",
      token: locals.token,
      body: { role },
    });
    if (!res.ok) {
      return fail(res.status, { error: res.errorMessage });
    }
    return { success: "Akun pengguna berhasil dikonfirmasi dan diaktifkan" };
  },

  rejectUser: async ({ request, locals }) => {
    if (!locals.token) throw redirect(303, "/login");
    const formData = await request.formData();
    const id = String(formData.get("id") ?? "");
    const res = await callBackendApi(`/api/auth/users/${id}/reject`, {
      method: "POST",
      token: locals.token,
    });
    if (!res.ok) {
      return fail(res.status, { error: res.errorMessage });
    }
    return { success: "Pengajuan akun pengguna berhasil ditolak" };
  },

  updateUserRole: async ({ request, locals }) => {
    if (!locals.token) throw redirect(303, "/login");
    const formData = await request.formData();
    const id = String(formData.get("id") ?? "");
    const role = String(formData.get("role") ?? "USER");
    const res = await callBackendApi(`/api/auth/users/${id}/role`, {
      method: "PATCH",
      token: locals.token,
      body: { role },
    });
    if (!res.ok) {
      return fail(res.status, { error: res.errorMessage });
    }
    return { success: `Peran pengguna berhasil diubah menjadi ${role}` };
  },

  toggleUserStatus: async ({ request, locals }) => {
    if (!locals.token) throw redirect(303, "/login");
    const formData = await request.formData();
    const id = String(formData.get("id") ?? "");
    const isActive = formData.get("isActive") === "true";
    const res = await callBackendApi(`/api/auth/users/${id}/status`, {
      method: "PATCH",
      token: locals.token,
      body: { isActive },
    });
    if (!res.ok) {
      return fail(res.status, { error: res.errorMessage });
    }
    return {
      success: isActive
        ? "Akun pengguna berhasil diaktifkan kembali"
        : "Akun pengguna berhasil dinonaktifkan / disuspend",
    };
  },

  deleteUser: async ({ request, locals }) => {
    if (!locals.token) throw redirect(303, "/login");
    const formData = await request.formData();
    const id = String(formData.get("id") ?? "");
    const res = await callBackendApi(`/api/auth/users/${id}`, {
      method: "DELETE",
      token: locals.token,
    });
    if (!res.ok) {
      return fail(res.status, { error: res.errorMessage });
    }
    return { success: "Akun pengguna berhasil dihapus secara permanen" };
  },

  deleteProduct: async ({ request, locals }) => {
    if (!locals.token) throw redirect(303, "/login");
    const formData = await request.formData();
    const id = String(formData.get("id") ?? "");
    const res = await callBackendApi(`/api/products/${id}`, {
      method: "DELETE",
      token: locals.token,
    });
    if (!res.ok) {
      return fail(res.status, { error: res.errorMessage });
    }
    return { success: "Produk berhasil dihapus dari master data" };
  },

  deleteSupplier: async ({ request, locals }) => {
    if (!locals.token) throw redirect(303, "/login");
    const formData = await request.formData();
    const id = String(formData.get("id") ?? "");
    const res = await callBackendApi(`/api/suppliers/${id}`, {
      method: "DELETE",
      token: locals.token,
    });
    if (!res.ok) {
      return fail(res.status, { error: res.errorMessage });
    }
    return { success: "Pemasok berhasil dihapus dari master data" };
  },

  deleteWarehouse: async ({ request, locals }) => {
    if (!locals.token) throw redirect(303, "/login");
    const formData = await request.formData();
    const id = String(formData.get("id") ?? "");
    const res = await callBackendApi(`/api/warehouses/${id}`, {
      method: "DELETE",
      token: locals.token,
    });
    if (!res.ok) {
      return fail(res.status, { error: res.errorMessage });
    }
    return { success: "Gudang fasilitas berhasil dihapus dari master data" };
  },

  resetMasterData: async ({ locals }) => {
    if (!locals.token) throw redirect(303, "/login");
    const res = await callBackendApi("/api/setup/reset-master-data", {
      method: "POST",
      token: locals.token,
    });
    if (!res.ok) {
      return fail(res.status, { error: res.errorMessage });
    }
    return { success: "Seluruh master data berhasil dikosongkan dan di-reset" };
  },

  updateSettings: async ({ request, locals }) => {
    if (!locals.token) throw redirect(303, "/login");
    const formData = await request.formData();
    const cafeName = String(formData.get("cafeName") ?? "").trim();
    const appUrl = String(formData.get("appUrl") ?? "").trim();
    const smtpHost = String(formData.get("smtpHost") ?? "").trim();
    const smtpPortRaw = String(formData.get("smtpPort") ?? "").trim();
    const smtpUser = String(formData.get("smtpUser") ?? "").trim();
    const smtpPassword = String(formData.get("smtpPassword") ?? "").trim();
    const smtpFrom = String(formData.get("smtpFrom") ?? "").trim();
    const googleClientId = String(formData.get("googleClientId") ?? "").trim();
    const googleClientSecret = String(
      formData.get("googleClientSecret") ?? "",
    ).trim();

    const payload: Record<string, unknown> = {};
    if (cafeName) payload.cafeName = cafeName;
    if (appUrl) payload.appUrl = appUrl;
    if (smtpHost !== undefined) payload.smtpHost = smtpHost;
    if (smtpPortRaw) payload.smtpPort = Number(smtpPortRaw);
    if (smtpUser !== undefined) payload.smtpUser = smtpUser;
    if (smtpPassword) payload.smtpPassword = smtpPassword;
    if (smtpFrom !== undefined) payload.smtpFrom = smtpFrom;
    if (googleClientId !== undefined) payload.googleClientId = googleClientId;
    if (googleClientSecret) payload.googleClientSecret = googleClientSecret;

    const res = await callBackendApi("/api/setup/settings", {
      method: "PUT",
      token: locals.token,
      body: payload,
    });
    if (!res.ok) {
      return fail(res.status, { error: res.errorMessage });
    }
    return { success: "Konfigurasi sistem & integrasi berhasil disimpan" };
  },
};
