import { Elysia, t } from "elysia";
import {
  approveUserBodySchema,
  disable2FaBodySchema,
  enable2FaBodySchema,
  loginBodySchema,
  toggleUserStatusBodySchema,
  updateUserRoleBodySchema,
  verify2FaBodySchema,
  verifyOtpBodySchema,
} from "@/modules/auth/model";
import {
  approvePendingUser,
  deleteUser,
  disable2Fa,
  enable2Fa,
  extractTokenFromRequest,
  getGoogleAuthUrl,
  handleGoogleCallback,
  listAllUsers,
  listPendingUsers,
  loginUser,
  logoutSession,
  rejectPendingUser,
  requireApproverUser,
  requireAuthenticatedUser,
  SESSION_COOKIE_NAME,
  setup2Fa,
  toggleUserStatus,
  updateUserRole,
  verify2FaLogin,
  verifyUserOtp,
} from "@/modules/auth/service";

export const authModule = new Elysia({ prefix: "/api/auth" })
  .get("/google", async ({ request, query, redirect }) => {
    const proto =
      request.headers.get("x-forwarded-proto") ||
      (request.url.startsWith("https:") ? "https" : "http");
    const host =
      request.headers.get("x-forwarded-host") || request.headers.get("host");
    const requestOrigin = host ? `${proto}://${host}` : undefined;

    const url = await getGoogleAuthUrl(requestOrigin);
    if (query?.json === "true") {
      return { data: { url } };
    }
    return redirect(url);
  })
  .get(
    "/google/callback",
    async ({ request, query, redirect, set }) => {
      const code = query?.code;
      const error = query?.error;

      if (error || !code) {
        return redirect(
          `/login?error=${encodeURIComponent(error || "Google authentication was cancelled or failed")}`,
        );
      }

      try {
        const proto =
          request.headers.get("x-forwarded-proto") ||
          (request.url.startsWith("https:") ? "https" : "http");
        const host =
          request.headers.get("x-forwarded-host") ||
          request.headers.get("host");
        const requestOrigin = host ? `${proto}://${host}` : undefined;

        const result = await handleGoogleCallback(code, requestOrigin);
        if (result.type === "LOGGED_IN") {
          set.headers["Set-Cookie"] =
            `${SESSION_COOKIE_NAME}=${encodeURIComponent(result.token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800`;
          return redirect("/");
        }

        if (result.type === "OTP_REQUIRED") {
          return redirect(
            `/login?status=otp_required&email=${encodeURIComponent(result.email)}&hint=${encodeURIComponent(result.otpCode)}`,
          );
        }

        if (result.type === "PENDING_APPROVAL") {
          return redirect(
            `/login?status=pending_approval&email=${encodeURIComponent(result.email)}`,
          );
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        return redirect(`/login?error=${encodeURIComponent(msg)}`);
      }
    },
    {
      query: t.Object({
        code: t.Optional(t.String()),
        error: t.Optional(t.String()),
      }),
    },
  )
  .post(
    "/otp/verify",
    async ({ body }) => {
      const result = await verifyUserOtp(body.email, body.code);
      return {
        data: result,
      };
    },
    {
      body: verifyOtpBodySchema,
    },
  )
  .get("/pending-users", async ({ request }) => {
    const admin = await requireApproverUser(request);
    const pending = await listPendingUsers(admin);
    return {
      data: pending,
    };
  })
  .get("/users", async ({ request }) => {
    const admin = await requireApproverUser(request);
    const usersList = await listAllUsers(admin);
    return {
      data: usersList,
    };
  })
  .patch(
    "/users/:id/role",
    async ({ request, params, body }) => {
      const admin = await requireApproverUser(request);
      const updated = await updateUserRole(admin, params.id, body.role);
      return {
        data: updated,
      };
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      body: updateUserRoleBodySchema,
    },
  )
  .patch(
    "/users/:id/status",
    async ({ request, params, body }) => {
      const admin = await requireApproverUser(request);
      const updated = await toggleUserStatus(admin, params.id, body.isActive);
      return {
        data: updated,
      };
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      body: toggleUserStatusBodySchema,
    },
  )
  .delete(
    "/users/:id",
    async ({ request, params }) => {
      const admin = await requireApproverUser(request);
      const res = await deleteUser(admin, params.id);
      return {
        data: res,
      };
    },
    {
      params: t.Object({
        id: t.String(),
      }),
    },
  )
  .post(
    "/users/:id/approve",
    async ({ request, params, body }) => {
      const admin = await requireApproverUser(request);
      const approved = await approvePendingUser(admin, params.id, body.role);
      return {
        data: approved,
      };
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      body: approveUserBodySchema,
    },
  )
  .post(
    "/users/:id/reject",
    async ({ request, params }) => {
      const admin = await requireApproverUser(request);
      await rejectPendingUser(admin, params.id);
      return {
        data: {
          success: true,
        },
      };
    },
    {
      params: t.Object({
        id: t.String(),
      }),
    },
  )
  .post(
    "/login",
    async ({ body, set }) => {
      const result = await loginUser(body);
      if (!result.requires2Fa && result.token) {
        set.headers["Set-Cookie"] =
          `${SESSION_COOKIE_NAME}=${encodeURIComponent(result.token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800`;
      }
      return {
        data: result,
      };
    },
    {
      body: loginBodySchema,
    },
  )
  .get("/2fa/setup", async ({ request }) => {
    const user = await requireAuthenticatedUser(request);
    const data = await setup2Fa(user);
    return { data };
  })
  .post(
    "/2fa/enable",
    async ({ request, body }) => {
      const user = await requireAuthenticatedUser(request);
      const data = await enable2Fa(
        user,
        body.code,
        body.secret,
        body.hashedBackupCodes,
      );
      return { data };
    },
    {
      body: enable2FaBodySchema,
    },
  )
  .post(
    "/2fa/verify",
    async ({ body, set }) => {
      const result = await verify2FaLogin(body.email, body.code);
      set.headers["Set-Cookie"] =
        `${SESSION_COOKIE_NAME}=${encodeURIComponent(result.token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800`;
      return { data: result };
    },
    {
      body: verify2FaBodySchema,
    },
  )
  .post(
    "/2fa/disable",
    async ({ request, body }) => {
      const user = await requireAuthenticatedUser(request);
      const data = await disable2Fa(user, body.password);
      return { data };
    },
    {
      body: disable2FaBodySchema,
    },
  )
  .post("/logout", async ({ request, set }) => {
    const token = extractTokenFromRequest(request);
    await logoutSession(token);
    set.headers["Set-Cookie"] =
      `${SESSION_COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
    return {
      data: {
        success: true,
      },
    };
  })
  .get("/me", async ({ request }) => {
    const user = await requireAuthenticatedUser(request);
    return {
      data: user,
    };
  });
