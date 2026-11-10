import { beforeAll, describe, expect, it } from "bun:test";
import { app, APP_VERSION } from "@/app";
import { resetDatabaseConnection } from "@/db/index";
import { runMigrations } from "@/db/migrate";
import {
  generateBackupCodes,
  generateTotpCode,
  generateTotpSecret,
  generateTotpUri,
  hashBackupCode,
  verifyTotpCode,
} from "@/utils/totp";

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
    it("renders the SvelteKit SSR setup wizard page at GET /setup when uninitialized", async () => {
      const response = await app.handle(
        new Request("http://localhost:3000/setup"),
      );
      expect(response.status).toBe(200);

      const html = await response.text();
      expect(html).toContain("CafeStock");
    });

    it("redirects unauthenticated routes to /setup when uninitialized", async () => {
      const response = await app.handle(
        new Request("http://localhost:3000/login"),
      );
      expect(response.status).toBe(303);
      expect(response.headers.get("Location")).toBe("/setup");
    });
  });

  describe("RFC 6238 TOTP Authenticator Engine", () => {
    // RFC 6238 Appendix B test secret: ASCII "12345678901234567890" in Base32
    const rfcSecret = "GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ";

    it("matches official RFC 6238 test vectors across timestamps", () => {
      expect(generateTotpCode(rfcSecret, 59 * 1000)).toBe("287082");
      expect(generateTotpCode(rfcSecret, 1111111109 * 1000)).toBe("081804");
      expect(generateTotpCode(rfcSecret, 1111111111 * 1000)).toBe("050471");
      expect(generateTotpCode(rfcSecret, 1234567890 * 1000)).toBe("005924");
      expect(generateTotpCode(rfcSecret, 2000000000 * 1000)).toBe("279037");
    });

    it("verifies valid tokens and supports clock drift tolerance window", () => {
      const now = 1234567890 * 1000;
      const validCode = "005924";

      // Exact time
      expect(verifyTotpCode(validCode, rfcSecret, 1, now)).toBe(true);

      // +25s drift (same window)
      expect(verifyTotpCode(validCode, rfcSecret, 1, now + 25000)).toBe(true);

      // -25s drift
      expect(verifyTotpCode(validCode, rfcSecret, 1, now - 25000)).toBe(true);

      // Outside window (e.g. +70s)
      expect(verifyTotpCode(validCode, rfcSecret, 1, now + 70000)).toBe(false);

      // Invalid format rejected
      expect(verifyTotpCode("abc", rfcSecret, 1, now)).toBe(false);
      expect(verifyTotpCode("12345", rfcSecret, 1, now)).toBe(false);
    });

    it("generates standard otpauth URI and Base32 secrets", () => {
      const secret = generateTotpSecret(20);
      expect(secret.length).toBeGreaterThanOrEqual(16);

      const uri = generateTotpUri("barista@cafestock.com", secret);
      expect(uri).toContain("otpauth://totp/CafeStock");
      expect(uri).toContain("barista%40cafestock.com");
      expect(uri).toContain(`secret=${secret}`);
    });

    it("generates and hashes recovery backup codes", () => {
      const { plainCodes, hashedCodes } = generateBackupCodes(8);
      expect(plainCodes.length).toBe(8);
      expect(hashedCodes.length).toBe(8);

      for (let i = 0; i < plainCodes.length; i++) {
        expect(plainCodes[i]).toMatch(/^[A-F0-9]{4}-[A-F0-9]{4}$/);
        expect(hashBackupCode(plainCodes[i])).toBe(hashedCodes[i]);
      }
    });
  });

  describe("Two-Factor Authentication (2FA) API Endpoints", () => {
    it("rejects 2FA verification for non-existent or un-enrolled accounts with 400 Bad Request", async () => {
      const response = await app.handle(
        new Request("http://localhost:3000/api/auth/2fa/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: "unknown-account@cafestock.com",
            code: "123456",
          }),
        }),
      );
      expect(response.status).toBe(400);

      const payload = (await response.json()) as {
        error: { code: string; message: string };
      };
      expect(payload.error.code).toBe("INVALID_2FA_REQUEST");
    });
  });
});
