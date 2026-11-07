import path from "node:path";
import fs from "node:fs";
import process from "node:process";
import { Elysia } from "elysia";
import { swagger } from "@elysiajs/swagger";
import { cors } from "@elysiajs/cors";
import { staticPlugin } from "@elysiajs/static";
import {
  fetchDatabaseSnapshot,
  getDatabaseConfiguration,
  initDatabase,
  saveDatabaseSnapshot,
  saveUsers,
  wipeDatabaseData,
} from "@/utils/db";
import { DatabaseSnapshot, SqliteUserRow } from "@/utils/sqliteDatabase";

const distDir = path.resolve(process.cwd(), "dist");
const indexPath = path.resolve(distDir, "index.html");

// Auto-build frontend if dist is missing
if (!fs.existsSync(indexPath)) {
  try {
    console.log(
      "[CafeStock] dist/index.html not found. Building frontend bundle...",
    );
    Bun.spawnSync(["bun", "run", "build"]);
  } catch {
    // fallback will be served if build fails
  }
}

// Initialize database schema at startup
await initDatabase();

export const app = new Elysia()
  .use(cors())
  .use(
    swagger({
      path: "/swagger",
      documentation: {
        info: {
          title: "CafeStock Procurement API",
          version: "0.1.0",
          description:
            "Automated Inventory & Procurement Management System for Cafe & Roastery Logistics",
        },
        tags: [
          { name: "System", description: "Health & System Status" },
          { name: "Snapshot", description: "Relational Database Snapshot" },
          { name: "Procurement", description: "Inventory, PR, PO & GR Data" },
        ],
      },
    }),
  )
  .use(
    staticPlugin({
      assets: "dist",
      prefix: "",
      ignorePatterns: [/index\.html$/],
    }),
  )
  .onError(({ code, request, set }) => {
    const url = new URL(request.url);
    if (url.pathname.startsWith("/api/")) {
      set.status = code === "NOT_FOUND" ? 404 : 500;
      return {
        ok: false,
        error: {
          code,
          message: `Endpoint ${request.method} ${url.pathname} not found.`,
        },
      };
    }

    // SPA client-side fallback for frontend routes
    if (code === "NOT_FOUND" && fs.existsSync(indexPath)) {
      set.status = 200;
      set.headers["content-type"] = "text/html; charset=utf-8";
      set.headers["cache-control"] = "no-cache";
      return Bun.file(indexPath);
    }
  })
  .get("/", () => {
    if (fs.existsSync(indexPath)) {
      return new Response(Bun.file(indexPath), {
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "Cache-Control": "no-cache",
        },
      });
    }
    return new Response("Frontend build required. Run: bun run build", {
      status: 200,
    });
  })
  .get("/login", () => {
    if (fs.existsSync(indexPath)) {
      return new Response(Bun.file(indexPath), {
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "Cache-Control": "no-cache",
        },
      });
    }
    return new Response("Frontend build required. Run: bun run build", {
      status: 200,
    });
  })
  .group("/api", (group) =>
    group
      .get(
        "/health",
        () => {
          const config = getDatabaseConfiguration();
          return {
            ok: true,
            status: "healthy",
            engine: config.engineType,
            uptimeSeconds: Math.floor(process.uptime()),
            timestamp: new Date().toISOString(),
          };
        },
        {
          detail: {
            tags: ["System"],
            summary: "Health Check",
            description:
              "Returns system health status and active database engine info",
          },
        },
      )
      .get(
        "/snapshot",
        async () => {
          const config = getDatabaseConfiguration();
          const snapshot = await fetchDatabaseSnapshot();
          return {
            ok: true,
            engine: config.engineType,
            snapshot,
          };
        },
        {
          detail: {
            tags: ["Snapshot"],
            summary: "Get Full Snapshot",
          },
        },
      )
      // Backwards-compatible route for frontend state sync
      .get(
        "/sqlite/snapshot",
        async () => {
          const config = getDatabaseConfiguration();
          const snapshot = await fetchDatabaseSnapshot();
          return {
            ok: true,
            engine: config.engineType,
            snapshot,
          };
        },
        {
          detail: {
            tags: ["Snapshot"],
            summary: "Frontend Snapshot Sync",
          },
        },
      )
      .post(
        "/sqlite/users",
        async ({ body, set }) => {
          const payload = body as { users?: SqliteUserRow[] };
          if (!payload || !Array.isArray(payload.users)) {
            set.status = 400;
            return {
              ok: false,
              error: {
                code: "INVALID_REQUEST_BODY",
                message: "Expected 'users' array in request body.",
              },
            };
          }
          await saveUsers(payload.users);
          return {
            ok: true,
            count: payload.users.length,
          };
        },
        {
          detail: {
            tags: ["Snapshot"],
            summary: "Sync User Accounts",
          },
        },
      )
      .post(
        "/sqlite/save",
        async ({ body }) => {
          await saveDatabaseSnapshot(body as Partial<DatabaseSnapshot>);
          return {
            ok: true,
          };
        },
        {
          detail: {
            tags: ["Snapshot"],
            summary: "Save Procurement Transaction Snapshot",
          },
        },
      )
      .post(
        "/sqlite/wipe",
        async ({ body }) => {
          const payload = (body || {}) as { includeUsers?: boolean };
          await wipeDatabaseData(Boolean(payload.includeUsers));
          return {
            ok: true,
          };
        },
        {
          detail: {
            tags: ["Snapshot"],
            summary: "Wipe Relational Data",
          },
        },
      )
      .get(
        "/products",
        async () => {
          const snap = await fetchDatabaseSnapshot();
          return { ok: true, data: snap.products };
        },
        {
          detail: {
            tags: ["Procurement"],
            summary: "List Products",
          },
        },
      )
      .get(
        "/warehouses",
        async () => {
          const snap = await fetchDatabaseSnapshot();
          return { ok: true, data: snap.warehouses };
        },
        {
          detail: {
            tags: ["Procurement"],
            summary: "List Warehouses",
          },
        },
      )
      .get(
        "/suppliers",
        async () => {
          const snap = await fetchDatabaseSnapshot();
          return { ok: true, data: snap.suppliers };
        },
        {
          detail: {
            tags: ["Procurement"],
            summary: "List Suppliers",
          },
        },
      )
      .get(
        "/purchase-requests",
        async () => {
          const snap = await fetchDatabaseSnapshot();
          return { ok: true, data: snap.purchaseRequests };
        },
        {
          detail: {
            tags: ["Procurement"],
            summary: "List Purchase Requests",
          },
        },
      )
      .get(
        "/purchase-orders",
        async () => {
          const snap = await fetchDatabaseSnapshot();
          return { ok: true, data: snap.purchaseOrders };
        },
        {
          detail: {
            tags: ["Procurement"],
            summary: "List Purchase Orders",
          },
        },
      )
      .get(
        "/goods-receipts",
        async () => {
          const snap = await fetchDatabaseSnapshot();
          return { ok: true, data: snap.goodsReceipts };
        },
        {
          detail: {
            tags: ["Procurement"],
            summary: "List Goods Receipts",
          },
        },
      )
      .get(
        "/inventory/balances",
        async () => {
          const snap = await fetchDatabaseSnapshot();
          return { ok: true, data: snap.inventoryBalances };
        },
        {
          detail: {
            tags: ["Procurement"],
            summary: "List Inventory Balances",
          },
        },
      )
      .get(
        "/inventory/movements",
        async () => {
          const snap = await fetchDatabaseSnapshot();
          return { ok: true, data: snap.inventoryMovements };
        },
        {
          detail: {
            tags: ["Procurement"],
            summary: "List Inventory Movements",
          },
        },
      )
      .get(
        "/audit-logs",
        async () => {
          const snap = await fetchDatabaseSnapshot();
          return { ok: true, data: snap.auditLogs };
        },
        {
          detail: {
            tags: ["Procurement"],
            summary: "List Audit Logs",
          },
        },
      ),
  );
