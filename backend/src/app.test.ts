import { beforeAll, describe, expect, it } from "bun:test";
import { app, APP_VERSION } from "@/app";
import { resetDatabaseConnection } from "@/db/index";
import { runMigrations } from "@/db/migrate";

/**
 * Unit and integration tests for the core Elysia application instance (`src/app.ts`),
 * verifying API health checks, structured 404 API error responses, and SSR delegation.
 */
describe("Core Elysia Application", () => {
  beforeAll(async () => {
    resetDatabaseConnection("pglite");
    await runMigrations();
  });
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

  describe("Google OAuth & OTP Verification Endpoints", () => {
    it("returns the Google authorization URL at GET /api/auth/google?json=true", async () => {
      const response = await app.handle(
        new Request("http://localhost:3000/api/auth/google?json=true"),
      );
      expect(response.status).toBe(200);

      const payload = (await response.json()) as {
        data: { url: string };
      };
      expect(payload.data.url).toContain("accounts.google.com");
      expect(payload.data.url).toContain("client_id=");
    });

    it("rejects invalid or expired OTP code with 400 Bad Request", async () => {
      const response = await app.handle(
        new Request("http://localhost:3000/api/auth/otp/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: "unknown@cafestock.com",
            code: "999999",
          }),
        }),
      );
      expect(response.status).toBe(400);

      const payload = (await response.json()) as {
        error: { code: string; message: string };
      };
      expect(payload.error.code).toBe("INVALID_OTP");
    });
  });

  describe("Gitea-Style Initial Setup Wizard", () => {
    it("returns setup initialization status at GET /api/setup/status", async () => {
      const response = await app.handle(
        new Request("http://localhost:3000/api/setup/status"),
      );
      expect(response.status).toBe(200);

      const payload = (await response.json()) as {
        data: { isInitialized: boolean };
      };
      expect(typeof payload.data.isInitialized).toBe("boolean");
    });

    it("rejects invalid setup payload with validation error", async () => {
      const response = await app.handle(
        new Request("http://localhost:3000/api/setup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            adminName: "A",
            adminEmail: "invalid-email",
            adminPassword: "123",
          }),
        }),
      );
      expect(response.status).toBe(422);
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
