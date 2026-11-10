import { existsSync, mkdirSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";
import {
  drizzle as drizzlePglite,
  type PgliteDatabase,
} from "drizzle-orm/pglite";
import {
  drizzle as drizzlePostgres,
  type PostgresJsDatabase,
} from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@/db/schema";

export type AppDatabase = PostgresJsDatabase<typeof schema>;

export interface DatabaseConnection {
  db: AppDatabase;
  mode: "postgres" | "pglite";
  dataDir?: string;
  pgliteInstance?: PGlite;
  sqlClient?: ReturnType<typeof postgres>;
}

export function createDatabaseConnection(
  databaseUrl?: string,
): DatabaseConnection {
  const resolvedUrl = (databaseUrl ?? process.env.DATABASE_URL ?? "").trim();
  const usePostgres =
    resolvedUrl.length > 0 &&
    resolvedUrl !== "pglite" &&
    resolvedUrl !== "embedded" &&
    !resolvedUrl.startsWith("pglite://");

  if (usePostgres) {
    const sqlClient = postgres(resolvedUrl, {
      max: 10,
      idle_timeout: 20,
      connect_timeout: 10,
    });
    const db = drizzlePostgres(sqlClient, { schema });
    return {
      db,
      mode: "postgres",
      sqlClient,
    };
  }

  let dataDir: string | undefined;
  const isTest =
    process.env.NODE_ENV === "test" ||
    Boolean(process.env.BUN_TEST) ||
    typeof (globalThis as Record<string, unknown>).describe === "function";

  if (resolvedUrl.startsWith("pglite://")) {
    dataDir = resolvedUrl.slice("pglite://".length);
  } else if (
    resolvedUrl === "pglite" ||
    resolvedUrl === "embedded" ||
    resolvedUrl === ""
  ) {
    if (!isTest) {
      dataDir =
        process.env.DATA_DIR ||
        (existsSync("/app") ? "/app/data/pgdata" : "./data/pgdata");
    }
  }

  if (dataDir) {
    mkdirSync(dataDir, { recursive: true });
  }

  const pgliteInstance = new PGlite(dataDir);
  const pgliteDb: PgliteDatabase<typeof schema> = drizzlePglite(
    pgliteInstance,
    { schema },
  );

  return {
    db: pgliteDb as unknown as AppDatabase,
    mode: "pglite",
    dataDir,
    pgliteInstance,
  };
}
