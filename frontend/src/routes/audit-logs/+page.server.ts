import { redirect, type ServerLoad } from "@sveltejs/kit";
import { callBackendApi } from "@/lib/server/api";
import type { AppLanguage, AuditLog, PaginatedResponse } from "@/lib/types";

export interface AuditLogsPageData {
  lang: AppLanguage;
  entityType: string;
  search: string;
  logs: AuditLog[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const load: ServerLoad = async ({
  locals,
  url,
}): Promise<AuditLogsPageData> => {
  if (!locals.user || !locals.token) {
    throw redirect(303, "/login");
  }

  const entityType = url.searchParams.get("entityType")?.trim() ?? "";
  const search = url.searchParams.get("search")?.trim() ?? "";
  const page = Math.max(1, Number(url.searchParams.get("page") ?? 1));
  const limit = Math.max(1, Number(url.searchParams.get("limit") ?? 20));

  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  if (entityType) params.set("entityType", entityType);
  if (search) params.set("search", search);

  const res = await callBackendApi<PaginatedResponse<AuditLog>>(
    `/api/audit-logs?${params.toString()}`,
    { token: locals.token },
  );

  return {
    lang: locals.lang,
    entityType,
    search,
    logs: res.data?.data ?? [],
    pagination: res.data?.meta ?? {
      page,
      limit,
      total: res.data?.data?.length ?? 0,
      totalPages: 1,
    },
  };
};
