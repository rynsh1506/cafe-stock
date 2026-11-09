import { and, eq } from "drizzle-orm";
import { db } from "@/db/index";
import { idempotencyKeys } from "@/db/schema";

export interface IdempotentResult<T> {
  statusCode: number;
  body: T;
  replayed: boolean;
}

export async function executeWithIdempotency<T extends Record<string, unknown>>(
  options: {
    idempotencyKey: string | null | undefined;
    endpoint: string;
    userId: string;
    defaultStatusCode?: number;
  },
  operation: () => Promise<T>,
): Promise<IdempotentResult<T>> {
  const key = options.idempotencyKey?.trim();
  const statusCode = options.defaultStatusCode ?? 200;

  if (!key) {
    const body = await operation();
    return { statusCode, body, replayed: false };
  }

  const [existing] = await db
    .select()
    .from(idempotencyKeys)
    .where(
      and(
        eq(idempotencyKeys.key, key),
        eq(idempotencyKeys.endpoint, options.endpoint),
        eq(idempotencyKeys.userId, options.userId),
      ),
    );

  if (existing) {
    return {
      statusCode: existing.statusCode,
      body: existing.responseBody as T,
      replayed: true,
    };
  }

  const body = await operation();

  await db
    .insert(idempotencyKeys)
    .values({
      key,
      endpoint: options.endpoint,
      userId: options.userId,
      statusCode,
      responseBody: body,
    })
    .onConflictDoNothing();

  return { statusCode, body, replayed: false };
}
