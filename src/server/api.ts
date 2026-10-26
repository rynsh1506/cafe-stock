import process from "node:process";
import {
  fetchDatabaseSnapshot,
  getDatabasePath,
  initSqliteDatabase,
  saveDatabaseSnapshot,
  saveUsers,
  SqliteDatabaseHandle,
  wipeDatabaseData,
} from "@/server/database";
import { DatabaseSnapshot, SqliteUserRow } from "@/utils/sqliteDatabase";

export interface ApiResponse<T = unknown> {
  ok: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
  snapshot?: DatabaseSnapshot;
  dbPath?: string;
  count?: number;
}

export async function handleApiRoute(
  req: Request,
  url: URL,
  dbHandle?: SqliteDatabaseHandle,
): Promise<Response> {
  const db = dbHandle ?? initSqliteDatabase();
  const dbPath = getDatabasePath();

  // Health check endpoint
  if (url.pathname === "/api/health" && req.method === "GET") {
    return Response.json(
      {
        ok: true,
        status: "healthy",
        uptimeSeconds: Math.floor(process.uptime()),
        timestamp: new Date().toISOString(),
      },
      { status: 200 },
    );
  }

  // Get full database snapshot
  if (url.pathname === "/api/sqlite/snapshot" && req.method === "GET") {
    try {
      const snapshot = fetchDatabaseSnapshot(db);
      return Response.json(
        {
          ok: true,
          dbPath,
          snapshot,
        },
        { status: 200 },
      );
    } catch (err) {
      return Response.json(
        {
          ok: false,
          error: {
            code: "SNAPSHOT_FETCH_FAILED",
            message: err instanceof Error ? err.message : String(err),
          },
        },
        { status: 500 },
      );
    }
  }

  // Sync users
  if (url.pathname === "/api/sqlite/users" && req.method === "POST") {
    try {
      const body = (await req.json()) as { users?: SqliteUserRow[] };
      if (!body.users || !Array.isArray(body.users)) {
        return Response.json(
          {
            ok: false,
            error: {
              code: "INVALID_REQUEST_BODY",
              message: "Expected 'users' array in request body.",
            },
          },
          { status: 400 },
        );
      }
      saveUsers(db, body.users);
      return Response.json(
        {
          ok: true,
          count: body.users.length,
          dbPath,
        },
        { status: 200 },
      );
    } catch (err) {
      return Response.json(
        {
          ok: false,
          error: {
            code: "USERS_PERSISTENCE_FAILED",
            message: err instanceof Error ? err.message : String(err),
          },
        },
        { status: 500 },
      );
    }
  }

  // Save database snapshot
  if (url.pathname === "/api/sqlite/save" && req.method === "POST") {
    try {
      const body = (await req.json()) as Partial<DatabaseSnapshot>;
      saveDatabaseSnapshot(db, body);
      return Response.json(
        {
          ok: true,
          dbPath,
        },
        { status: 200 },
      );
    } catch (err) {
      return Response.json(
        {
          ok: false,
          error: {
            code: "SNAPSHOT_SAVE_FAILED",
            message: err instanceof Error ? err.message : String(err),
          },
        },
        { status: 500 },
      );
    }
  }

  // Wipe database tables
  if (url.pathname === "/api/sqlite/wipe" && req.method === "POST") {
    try {
      const body = (await req.json().catch(() => ({}))) as {
        includeUsers?: boolean;
      };
      wipeDatabaseData(db, Boolean(body.includeUsers));
      return Response.json(
        {
          ok: true,
          dbPath,
        },
        { status: 200 },
      );
    } catch (err) {
      return Response.json(
        {
          ok: false,
          error: {
            code: "WIPE_FAILED",
            message: err instanceof Error ? err.message : String(err),
          },
        },
        { status: 500 },
      );
    }
  }

  return Response.json(
    {
      ok: false,
      error: {
        code: "NOT_FOUND",
        message: `Endpoint ${req.method} ${url.pathname} not found.`,
      },
    },
    { status: 404 },
  );
}
