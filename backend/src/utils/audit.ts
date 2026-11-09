import { db } from "@/db/index";
import { auditLogs, type UserRole } from "@/db/schema";
import type { AppDatabase } from "@/utils/drizzle";

export interface AuditActor {
  id: string;
  name: string;
  role: UserRole;
}

export interface AuditLogInput {
  actor: AuditActor;
  action: string;
  entityType: string;
  entityId: string;
  summary: string;
  metadata?: Record<string, unknown>;
}

type DatabaseOrTransaction =
  AppDatabase | Parameters<Parameters<AppDatabase["transaction"]>[0]>[0];

export async function recordAuditLog(
  input: AuditLogInput,
  executor: DatabaseOrTransaction = db,
): Promise<void> {
  await executor.insert(auditLogs).values({
    actorId: input.actor.id,
    actorName: input.actor.name,
    actorRole: input.actor.role,
    action: input.action,
    entityType: input.entityType,
    entityId: input.entityId,
    summary: input.summary,
    metadata: input.metadata ?? {},
  });
}
