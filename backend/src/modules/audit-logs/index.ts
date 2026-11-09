import { Elysia } from "elysia";
import { listAuditLogs } from "@/modules/audit-logs/service";
import { requireAuthenticatedUser } from "@/modules/auth/service";

export const auditLogsModule = new Elysia({ prefix: "/api/audit-logs" }).get(
  "/",
  async ({ request, query }) => {
    await requireAuthenticatedUser(request);
    return listAuditLogs({
      page: typeof query.page === "string" ? query.page : undefined,
      limit: typeof query.limit === "string" ? query.limit : undefined,
      entityType:
        typeof query.entityType === "string" ? query.entityType : undefined,
      action: typeof query.action === "string" ? query.action : undefined,
      search: typeof query.search === "string" ? query.search : undefined,
    });
  },
);
