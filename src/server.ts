import process from "node:process";
import { app } from "@/app";

export interface ServerConfig {
  port: number;
  host: string;
}

export function createServer(config?: Partial<ServerConfig>) {
  const port = config?.port ?? Number(process.env.PORT || 3000);
  const host = config?.host ?? process.env.HOST ?? "0.0.0.0";
  app.listen({ port, hostname: host });
  return { app, port, host };
}

export function startServer(config?: Partial<ServerConfig>) {
  const port = config?.port ?? Number(process.env.PORT || 3000);
  const host = config?.host ?? process.env.HOST ?? "0.0.0.0";
  return app.listen({ port, hostname: host }, (server) => {
    console.log(`\n========================================================`);
    console.log(`  ☕ CAFE STOCK - Elysia Backend & Inventory Server`);
    console.log(`========================================================`);
    console.log(`  Server Running:  http://${server.hostname}:${server.port}/`);
    console.log(
      "  Endpoint '/':    Serving built React frontend (dist/index.html)",
    );
    console.log("  Endpoint '/api': Serving REST API endpoints");
    console.log(`========================================================\n`);
  });
}

if (import.meta.main) {
  startServer();
}
