import { resolve, join, normalize } from "node:path";
import { existsSync } from "node:fs";
import { logger } from "@/utils/logger";

interface SvelteKitServer {
  init: (options: {
    env: Record<string, string>;
    read?: (file: string) => ReadableStream<Uint8Array> | null;
  }) => Promise<void>;
  respond: (
    request: Request,
    options: { getClientAddress: () => string },
  ) => Promise<Response>;
}

interface SvelteKitServerModule {
  server: SvelteKitServer;
}

const FRONTEND_BUILD_DIR = resolve(
  import.meta.dirname,
  "../../../frontend/build",
);
const FRONTEND_CLIENT_DIR = join(FRONTEND_BUILD_DIR, "client");
const FRONTEND_SERVER_ENTRY = join(FRONTEND_BUILD_DIR, "server/server.js");

let initializedServer: SvelteKitServer | null = null;
let initPromise: Promise<SvelteKitServer | null> | null = null;

async function getSvelteKitServer(): Promise<SvelteKitServer | null> {
  if (initializedServer) {
    return initializedServer;
  }
  if (initPromise) {
    return initPromise;
  }
  if (!existsSync(FRONTEND_SERVER_ENTRY)) {
    return null;
  }

  initPromise = (async () => {
    try {
      const mod = (await import(
        FRONTEND_SERVER_ENTRY
      )) as SvelteKitServerModule;
      const envRecord: Record<string, string> = {};
      for (const [key, value] of Object.entries(process.env)) {
        if (typeof value === "string") {
          envRecord[key] = value;
        }
      }
      await mod.server.init({
        env: envRecord,
        read: (file: string) => {
          const filePath = join(FRONTEND_CLIENT_DIR, file);
          const bunFile = Bun.file(filePath);
          return bunFile.stream();
        },
      });
      initializedServer = mod.server;
      logger.info("Initialized SvelteKit SSR server handler", {
        buildDir: FRONTEND_BUILD_DIR,
      });
      return initializedServer;
    } catch (err) {
      logger.error("Failed to initialize SvelteKit SSR server", {
        error: err instanceof Error ? err.message : String(err),
      });
      initPromise = null;
      return null;
    }
  })();

  return initPromise;
}

export async function handleFrontendRequest(
  request: Request,
): Promise<Response> {
  const url = new URL(request.url);
  const pathname = url.pathname;

  if (pathname !== "/" && existsSync(FRONTEND_CLIENT_DIR)) {
    const safeRelativePath = normalize(pathname).replace(
      /^(\.\.(\/|\\|$))+/,
      "",
    );
    const candidatePath = join(FRONTEND_CLIENT_DIR, safeRelativePath);

    if (candidatePath.startsWith(FRONTEND_CLIENT_DIR)) {
      const staticFile = Bun.file(candidatePath);
      if (await staticFile.exists()) {
        const headers = new Headers();
        if (staticFile.type) {
          headers.set("Content-Type", staticFile.type);
        }
        if (pathname.startsWith("/_app/immutable/")) {
          headers.set("Cache-Control", "public, max-age=31536000, immutable");
        }
        return new Response(staticFile, {
          status: 200,
          headers,
        });
      }
    }
  }

  const ssrServer = await getSvelteKitServer();
  if (!ssrServer) {
    return new Response(
      JSON.stringify({
        error: {
          code: "FRONTEND_BUILD_NOT_FOUND",
          message:
            "Frontend SSR build not found. Run 'bun run build' inside frontend/ first.",
        },
      }),
      {
        status: 503,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  return ssrServer.respond(request, {
    getClientAddress: () =>
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      "127.0.0.1",
  });
}
