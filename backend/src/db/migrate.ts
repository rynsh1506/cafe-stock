import { resolve } from "node:path";
import { migrate as migratePostgres } from "drizzle-orm/postgres-js/migrator";
import { migrate as migratePglite } from "drizzle-orm/pglite/migrator";
import type { PgliteDatabase } from "drizzle-orm/pglite";
import { getDatabaseConnection } from "@/db/index";
import type * as schema from "@/db/schema";
import { logger } from "@/utils/logger";

const MIGRATIONS_FOLDER = resolve(import.meta.dirname, "../../drizzle");

export async function runMigrations(): Promise<void> {
  const conn = getDatabaseConnection();
  logger.info("Running PostgreSQL database migrations", {
    mode: conn.mode,
    migrationsFolder: MIGRATIONS_FOLDER,
  });

  if (conn.mode === "postgres") {
    await migratePostgres(conn.db, { migrationsFolder: MIGRATIONS_FOLDER });
  } else {
    const pgliteDb = conn.db as unknown as PgliteDatabase<typeof schema>;
    await migratePglite(pgliteDb, { migrationsFolder: MIGRATIONS_FOLDER });
  }

  logger.info("Database migrations completed successfully", {
    mode: conn.mode,
  });
}

if (import.meta.main) {
  runMigrations()
    .then(async () => {
      const conn = getDatabaseConnection();
      if (conn.sqlClient) {
        await conn.sqlClient.end();
      }
      process.exit(0);
    })
    .catch((err) => {
      logger.error("Database migration failed", {
        error: err instanceof Error ? err.message : String(err),
      });
      process.exit(1);
    });
}
