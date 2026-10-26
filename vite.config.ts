import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
// @ts-expect-error type error without @types/node package
import path from "node:path";

function sqliteApiPlugin(): Plugin {
  return {
    name: "cafe-stock-sqlite-engine",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const urlStr = req.url ?? "";
        if (!urlStr.startsWith("/api/")) {
          next();
          return;
        }

        try {
          const apiPath = "./src/server/api.ts";
          const { handleApiRoute } = await import(/* @vite-ignore */ apiPath);
          const protocol = req.headers["x-forwarded-proto"] || "http";
          const host = req.headers.host || "localhost";
          const fullUrl = new URL(urlStr, `${protocol}://${host}`);

          let bodyBuffer: Buffer | undefined = undefined;
          if (req.method !== "GET" && req.method !== "HEAD") {
            const chunks: Buffer[] = [];
            for await (const chunk of req) {
              chunks.push(
                typeof chunk === "string"
                  ? Buffer.from(chunk)
                  : (chunk as Buffer),
              );
            }
            bodyBuffer = Buffer.concat(chunks);
          }

          const webReq = new Request(fullUrl.toString(), {
            method: req.method,
            headers: req.headers as HeadersInit,
            body: bodyBuffer,
          });

          const webRes = await handleApiRoute(webReq, fullUrl);
          res.statusCode = webRes.status;
          webRes.headers.forEach((val, key) => {
            res.setHeader(key, val);
          });
          const arrayBuf = await webRes.arrayBuffer();
          res.end(Buffer.from(arrayBuf));
        } catch (err) {
          res.statusCode = 500;
          res.setHeader("Content-Type", "application/json");
          res.end(
            JSON.stringify({
              ok: false,
              error: {
                code: "INTERNAL_SERVER_ERROR",
                message: err instanceof Error ? err.message : String(err),
              },
            }),
          );
        }
      });
    },
  };
}

// https://vite.dev/config/
export default defineConfig(() => ({
  plugins: [react(), tailwindcss(), sqliteApiPlugin()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
  server: {
    port: 5173,
    host: true,
    watch: {
      ignored: ["**/database/**"],
    },
  },
}));
