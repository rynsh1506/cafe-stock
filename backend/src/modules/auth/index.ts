import { Elysia, t } from "elysia";
import {
  approveUserBodySchema,
  loginBodySchema,
  verifyOtpBodySchema,
} from "@/modules/auth/model";
import {
  approvePendingUser,
  extractTokenFromRequest,
  getGoogleAuthUrl,
  handleGoogleCallback,
  listPendingUsers,
  loginUser,
  logoutSession,
  rejectPendingUser,
  requireApproverUser,
  requireAuthenticatedUser,
  SESSION_COOKIE_NAME,
  verifyUserOtp,
} from "@/modules/auth/service";

export const authModule = new Elysia({ prefix: "/api/auth" })
  .get("/google", ({ query, redirect }) => {
    const url = getGoogleAuthUrl();
    if (query?.json === "true") {
      return { data: { url } };
    }
    return redirect(url);
  })
  .get(
    "/google/callback",
    async ({ query, redirect, set }) => {
      const code = query?.code;
      const error = query?.error;

      if (error || !code) {
        return redirect(
          `/login?error=${encodeURIComponent(error || "Google authentication was cancelled or failed")}`,
        );
      }

      try {
        const result = await handleGoogleCallback(code);
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
      set.headers["Set-Cookie"] =
        `${SESSION_COOKIE_NAME}=${encodeURIComponent(result.token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800`;
      return {
        data: result,
      };
    },
    {
      body: loginBodySchema,
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
