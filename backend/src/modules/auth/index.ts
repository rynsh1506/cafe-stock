import { Elysia } from "elysia";
import { loginBodySchema } from "@/modules/auth/model";
import {
  extractTokenFromRequest,
  loginUser,
  logoutSession,
  requireAuthenticatedUser,
  SESSION_COOKIE_NAME,
} from "@/modules/auth/service";

export const authModule = new Elysia({ prefix: "/api/auth" })
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
