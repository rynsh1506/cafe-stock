import path from "node:path";
import process from "node:process";
import os from "node:os";
import { handleApiRoute } from "@/server/api";
import { getDatabasePath, initSqliteDatabase } from "@/server/database";

export interface ServerConfig {
  port: number;
  host: string;
  distDir: string;
}

export function getLocalIpAddress(): string {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    const netList = interfaces[name];
    if (!netList) continue;
    for (const net of netList) {
      if (net.family === "IPv4" && !net.internal) {
        return net.address;
      }
    }
  }
  return "localhost";
}

export function createServer(config?: Partial<ServerConfig>) {
  const port = config?.port ?? Number(process.env.PORT || 3000);
  const host = config?.host ?? process.env.HOST ?? "0.0.0.0";
  const distDir = config?.distDir ?? path.resolve(process.cwd(), "dist");

  // Ensure database is initialized at startup
  const db = initSqliteDatabase();
  const dbPath = getDatabasePath();

  const server = Bun.serve({
    port,
    hostname: host,
    async fetch(req: Request) {
      const url = new URL(req.url);

      // 1. API routes (/api/*)
      if (url.pathname.startsWith("/api/")) {
        return handleApiRoute(req, url, db);
      }

      // 2. Static assets directly located in dist (e.g. /assets/*, /vite.svg)
      if (url.pathname !== "/") {
        const potentialAssetPath = path.resolve(distDir, "." + url.pathname);
        // Ensure path traversal is prevented
        if (potentialAssetPath.startsWith(distDir)) {
          const assetFile = Bun.file(potentialAssetPath);
          if (await assetFile.exists()) {
            return new Response(assetFile);
          }
        }
      }

      // 3. Root endpoint "/" & SPA fallback: Serve dist/index.html
      const indexPath = path.resolve(distDir, "index.html");
      const indexFile = Bun.file(indexPath);
      if (await indexFile.exists()) {
        return new Response(indexFile, {
          headers: {
            "Content-Type": "text/html; charset=utf-8",
            "Cache-Control": "no-cache",
          },
        });
      }

      // 4. Fallback if dist has not been built yet
      return new Response(
        `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CafeStock - Standalone Procurement Server</title>
  <style>
    body { font-family: system-ui, sans-serif; background: #0c0d0e; color: #f3f4f6; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; }
    .card { background: #18191b; border: 1px solid #2d3139; padding: 2.5rem; border-radius: 12px; max-width: 520px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.5); }
    h1 { margin-top: 0; font-size: 1.5rem; color: #f59e0b; }
    p { color: #9ca3af; line-height: 1.5; font-size: 0.95rem; }
    code { background: #27272a; padding: 0.2rem 0.5rem; border-radius: 4px; font-size: 0.85rem; color: #e4e4e7; }
    .status { display: inline-flex; align-items: center; gap: 0.5rem; font-size: 0.8rem; font-family: monospace; background: #064e3b; color: #34d399; padding: 0.35rem 0.75rem; border-radius: 9999px; margin-bottom: 1rem; }
  </style>
</head>
<body>
  <div class="card">
    <div class="status">● SERVER ONLINE & HEALTHY</div>
    <h1>Frontend Build Required</h1>
    <p>The CafeStock backend server is running and ready. To serve the user interface on <code>/</code>, please run the build command:</p>
    <p><code>bun run build</code></p>
    <p>Once built, refresh this page to access the application.</p>
  </div>
</body>
</html>`,
        {
          status: 200,
          headers: {
            "Content-Type": "text/html; charset=utf-8",
          },
        },
      );
    },
  });

  return { server, port: server.port, host, dbPath };
}

// Auto-run if executed as main process
if (import.meta.main) {
  const port = Number(process.env.PORT || 3000);
  const host = process.env.HOST ?? "0.0.0.0";
  const { dbPath } = createServer({ port, host });
  const localIp = getLocalIpAddress();

  console.log("\n========================================================");
  console.log("  ☕ CAFE STOCK - Self-Hosted Inventory Server");
  console.log("========================================================");
  console.log(`  Local Access:    http://localhost:${port}/`);
  console.log(`  Network Access:  http://${localIp}:${port}/`);
  console.log(`  Database File:   ${dbPath}`);
  console.log(
    "  Endpoint '/':    Serving built React frontend (dist/index.html)",
  );
  console.log("  Endpoint '/api': Serving SQLite JSON REST API");
  console.log("========================================================\n");
}
