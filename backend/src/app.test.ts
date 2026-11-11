import { beforeAll, describe, expect, it } from "bun:test";
import { eq } from "drizzle-orm";
import { app, APP_VERSION } from "@/app";
import { db, resetDatabaseConnection } from "@/db/index";
import { runMigrations } from "@/db/migrate";
import { auditLogs, sessions, users } from "@/db/schema";
import { recordAuditLog } from "@/utils/audit";
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
  let enrolledTotpSecret = "";

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

    it("dynamically resolves Google redirect URI from reverse proxy / Cloudflare headers", async () => {
      const response = await app.handle(
        new Request("http://127.0.0.1:3000/api/auth/google?json=true", {
          headers: {
            "x-forwarded-proto": "https",
            "x-forwarded-host": "stock.mycafe.com",
          },
        }),
      );
      expect(response.status).toBe(200);

      const payload = (await response.json()) as {
        data: { url: string };
      };
      expect(payload.data.url).toContain(
        "redirect_uri=https%3A%2F%2Fstock.mycafe.com%2Fapi%2Fauth%2Fgoogle%2Fcallback",
      );
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
        data: { isInitialized: boolean; googleConfigured: boolean };
      };
      expect(typeof payload.data.isInitialized).toBe("boolean");
      expect(typeof payload.data.googleConfigured).toBe("boolean");
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

    it("successfully completes initial setup, initializes root admin, and locks setup", async () => {
      const response = await app.handle(
        new Request("http://localhost:3000/api/setup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            adminName: "Owner Admin",
            adminEmail: "owner@cafestock.com",
            adminPassword: "Password123!",
            cafeName: "CafeStock Roastery",
          }),
        }),
      );
      expect(response.status).toBe(201);

      const payload = (await response.json()) as {
        data: {
          success: boolean;
          token: string;
          user: { id: string; email: string; role: string; isActive: boolean };
        };
      };
      expect(payload.data.success).toBe(true);
      expect(payload.data.token.length).toBeGreaterThan(20);
      expect(payload.data.user.role).toBe("APPROVER");
      expect(payload.data.user.isActive).toBe(true);

      const secondAttempt = await app.handle(
        new Request("http://localhost:3000/api/setup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            adminName: "Hacker",
            adminEmail: "hacker@cafestock.com",
            adminPassword: "Password123!",
          }),
        }),
      );
      expect(secondAttempt.status).toBe(400);
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

    it("generates QR code data URL and Base32 secrets at GET /api/auth/2fa/setup", async () => {
      const loginRes = await app.handle(
        new Request("http://localhost:3000/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: "owner@cafestock.com",
            password: "Password123!",
          }),
        }),
      );
      expect(loginRes.status).toBe(200);
      const loginPayload = (await loginRes.json()) as {
        data: { token: string };
      };

      const setupRes = await app.handle(
        new Request("http://localhost:3000/api/auth/2fa/setup", {
          headers: {
            Authorization: `Bearer ${loginPayload.data.token}`,
          },
        }),
      );
      expect(setupRes.status).toBe(200);
      const setupPayload = (await setupRes.json()) as {
        data: {
          secret: string;
          uri: string;
          qrCodeDataUrl: string;
          backupCodes: string[];
          hashedCodes: string[];
        };
      };
      enrolledTotpSecret = setupPayload.data.secret;
      expect(setupPayload.data.qrCodeDataUrl).toMatch(
        /^data:image\/png;base64,/,
      );
      expect(setupPayload.data.secret.length).toBeGreaterThanOrEqual(16);
      expect(setupPayload.data.backupCodes.length).toBe(8);
      expect(setupPayload.data.hashedCodes.length).toBe(8);

      const validCode = generateTotpCode(setupPayload.data.secret);
      const enableRes = await app.handle(
        new Request("http://localhost:3000/api/auth/2fa/enable", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${loginPayload.data.token}`,
          },
          body: JSON.stringify({
            code: validCode,
            secret: setupPayload.data.secret,
            hashedBackupCodes: setupPayload.data.hashedCodes,
          }),
        }),
      );
      expect(enableRes.status).toBe(200);
      const enablePayload = (await enableRes.json()) as {
        data: { success: boolean; message: string };
      };
      expect(enablePayload.data.success).toBe(true);
    });
  });

  describe("User Management and System Integration Settings", () => {
    let adminToken = "";
    let adminUserId = "";

    it("logs in as the newly initialized owner admin", async () => {
      const loginRes = await app.handle(
        new Request("http://localhost:3000/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: "owner@cafestock.com",
            password: "Password123!",
          }),
        }),
      );
      expect(loginRes.status).toBe(200);
      const loginPayload = (await loginRes.json()) as {
        data: { requires2Fa: boolean };
      };
      expect(loginPayload.data.requires2Fa).toBe(true);

      const verifyRes = await app.handle(
        new Request("http://localhost:3000/api/auth/2fa/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: "owner@cafestock.com",
            code: generateTotpCode(enrolledTotpSecret),
          }),
        }),
      );
      expect(verifyRes.status).toBe(200);
      const verifyPayload = (await verifyRes.json()) as {
        data: { token: string; user: { id: string } };
      };
      adminToken = verifyPayload.data.token;
      adminUserId = verifyPayload.data.user.id;
      expect(adminToken.length).toBeGreaterThan(20);
    });

    it("fetches system configuration settings at GET /api/setup/settings", async () => {
      const response = await app.handle(
        new Request("http://localhost:3000/api/setup/settings", {
          headers: {
            Authorization: `Bearer ${adminToken}`,
          },
        }),
      );
      expect(response.status).toBe(200);
      const payload = (await response.json()) as {
        data: {
          cafeName: string;
          appUrl: string;
          isSmtpConfigured: boolean;
          isGoogleOAuthConfigured: boolean;
        };
      };
      expect(payload.data.cafeName).toBeDefined();
      expect(payload.data.appUrl).toBeDefined();
    });

    it("updates system configuration settings at PUT /api/setup/settings", async () => {
      const response = await app.handle(
        new Request("http://localhost:3000/api/setup/settings", {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${adminToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            cafeName: "CafeStock Roastery Artisanal",
            smtpHost: "smtp.example.com",
            smtpPort: 465,
            smtpUser: "notifications@example.com",
            googleClientId: "test-google-id.apps.googleusercontent.com",
          }),
        }),
      );
      expect(response.status).toBe(200);
      const payload = (await response.json()) as {
        data: {
          cafeName: string;
          smtpHost: string;
          smtpPort: number;
          googleClientId: string;
          isSmtpConfigured: boolean;
        };
      };
      expect(payload.data.cafeName).toBe("CafeStock Roastery Artisanal");
      expect(payload.data.smtpHost).toBe("smtp.example.com");
      expect(payload.data.smtpPort).toBe(465);
      expect(payload.data.googleClientId).toBe(
        "test-google-id.apps.googleusercontent.com",
      );
    });

    it("lists all user accounts at GET /api/auth/users", async () => {
      const response = await app.handle(
        new Request("http://localhost:3000/api/auth/users", {
          headers: {
            Authorization: `Bearer ${adminToken}`,
          },
        }),
      );
      expect(response.status).toBe(200);
      const payload = (await response.json()) as {
        data: Array<{
          id: string;
          email: string;
          role: string;
          isActive: boolean;
        }>;
      };
      expect(Array.isArray(payload.data)).toBe(true);
      expect(payload.data.length).toBeGreaterThanOrEqual(1);
    });

    it("prevents an approver from demoting or deleting their own account when sole active approver", async () => {
      const demoteResponse = await app.handle(
        new Request(
          `http://localhost:3000/api/auth/users/${adminUserId}/role`,
          {
            method: "PATCH",
            headers: {
              Authorization: `Bearer ${adminToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              role: "USER",
            }),
          },
        ),
      );
      expect(demoteResponse.status).toBe(400);

      const deleteResponse = await app.handle(
        new Request(`http://localhost:3000/api/auth/users/${adminUserId}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${adminToken}`,
          },
        }),
      );
      expect(deleteResponse.status).toBe(400);
    });

    it("successfully rejects a pending registration without foreign key errors when audit logs reference the user", async () => {
      const [pendingUser] = await db
        .insert(users)
        .values({
          email: "pending-candidate@cafestock.com",
          name: "Pending Candidate",
          passwordHash: "dummy-hash",
          role: "USER",
          isActive: false,
        })
        .returning();

      await db.insert(sessions).values({
        token: "candidate-session-test-token",
        userId: pendingUser.id,
        expiresAt: new Date(Date.now() + 60000),
      });

      await recordAuditLog({
        actor: {
          id: pendingUser.id,
          name: pendingUser.name,
          role: pendingUser.role,
        },
        action: "USER_OAUTH_REGISTER_OTP_REQUIRED",
        entityType: "USER",
        entityId: pendingUser.id,
        summary: "Pending registration audit log entry",
      });

      const rejectResponse = await app.handle(
        new Request(
          `http://localhost:3000/api/auth/users/${pendingUser.id}/reject`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${adminToken}`,
            },
          },
        ),
      );
      expect(rejectResponse.status).toBe(200);

      const [deletedUser] = await db
        .select()
        .from(users)
        .where(eq(users.id, pendingUser.id));
      expect(deletedUser).toBeUndefined();

      const candidateAuditLogs = await db
        .select()
        .from(auditLogs)
        .where(eq(auditLogs.action, "USER_OAUTH_REGISTER_OTP_REQUIRED"));
      expect(candidateAuditLogs.length).toBeGreaterThanOrEqual(1);
      expect(candidateAuditLogs[0].actorId).toBeNull();
    });
  });
});
