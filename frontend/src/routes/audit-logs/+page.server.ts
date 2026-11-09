import { redirect, type ServerLoad } from "@sveltejs/kit";
import { callBackendApi } from "@/lib/server/api";
import type { AppLanguage, AuditLog, PaginatedResponse } from "@/lib/types";

export interface AuditLogsPageData {
  lang: AppLanguage;
  entityType: string;
  search: string;
  logs: AuditLog[];
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

  const params = new URLSearchParams({ limit: "50" });
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
  };
};
