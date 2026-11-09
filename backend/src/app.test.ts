import { describe, expect, it } from "bun:test";
import { app, APP_VERSION } from "@/app";

/**
 * Unit and integration tests for the core Elysia application instance (`src/app.ts`),
 * verifying API health checks, structured 404 API error responses, and SSR delegation.
 */
describe("Core Elysia Application", () => {
  describe("GET /api/health", () => {
    it("returns a 200 OK status with the current application version", async () => {
      const response = await app.handle(
        new Request("http://localhost:3000/api/health"),
      );
      expect(response.status).toBe(200);

      const payload = (await response.json()) as {
        status: string;
        version: string;
        timestamp: string;
      };
      expect(payload.status).toBe("ok");
      expect(payload.version).toBe(APP_VERSION);
      expect(typeof payload.timestamp).toBe("string");
    });
  });

  describe("Unmatched API Endpoints", () => {
    it("returns a structured 404 JSON error for unknown /api/* routes", async () => {
      const response = await app.handle(
        new Request("http://localhost:3000/api/non-existent-route"),
      );
      expect(response.status).toBe(404);

      const payload = (await response.json()) as {
        error: { code: string; message: string };
      };
      expect(payload.error.code).toBe("API_ROUTE_NOT_FOUND");
    });
  });

  describe("SvelteKit SSR Integration", () => {
    it("renders the SvelteKit SSR login page at GET /login when frontend build is present", async () => {
      const response = await app.handle(
        new Request("http://localhost:3000/login"),
      );
      expect(response.status).toBe(200);

      const html = await response.text();
      expect(html).toContain("CafeStock");
    });
  });
});
