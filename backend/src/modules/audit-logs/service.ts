import { and, count, desc, eq, ilike, or, type SQL } from "drizzle-orm";
import { db } from "@/db/index";
import { auditLogs } from "@/db/schema";
import type { ListAuditLogsQuery } from "@/modules/audit-logs/model";
import {
  buildPaginatedResponse,
  parsePagination,
  type PaginatedResponse,
} from "@/utils/pagination";

export type AuditLogRecord = typeof auditLogs.$inferSelect;

export async function listAuditLogs(
  query: ListAuditLogsQuery,
): Promise<PaginatedResponse<AuditLogRecord>> {
  const pagination = parsePagination(query);
  const conditions: SQL[] = [];

  if (query.entityType && query.entityType.trim().length > 0) {
    conditions.push(eq(auditLogs.entityType, query.entityType.trim()));
  }

  if (query.action && query.action.trim().length > 0) {
    conditions.push(eq(auditLogs.action, query.action.trim()));
  }

  if (query.search && query.search.trim().length > 0) {
    const pattern = `%${query.search.trim()}%`;
    const searchCondition = or(
      ilike(auditLogs.summary, pattern),
      ilike(auditLogs.actorName, pattern),
      ilike(auditLogs.action, pattern),
    );
    if (searchCondition) {
      conditions.push(searchCondition);
    }
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const [totalRow] = await db
    .select({ value: count() })
    .from(auditLogs)
    .where(whereClause);

  const rows = await db
    .select()
    .from(auditLogs)
    .where(whereClause)
    .orderBy(desc(auditLogs.createdAt))
    .limit(pagination.limit)
    .offset(pagination.offset);

  return buildPaginatedResponse(rows, Number(totalRow?.value ?? 0), pagination);
}
