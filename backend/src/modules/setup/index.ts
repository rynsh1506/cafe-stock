import { Elysia } from "elysia";
import { InitialSetupRequestSchema } from "./model";
import { checkSetupStatus, executeInitialSetup } from "./service";

export const setupModule = new Elysia({ prefix: "/api/setup" })
  .get(
    "/status",
    async () => {
      const status = await checkSetupStatus();
      return { data: status };
    },
    {
      detail: {
        summary: "Check System Initialization Status",
        tags: ["Setup"],
      },
    },
  )
  .post(
    "",
    async ({ body, cookie, set }) => {
      const result = await executeInitialSetup(body);
      if (cookie.cafestock_session) {
        cookie.cafestock_session.set({
          value: result.token,
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
          maxAge: 30 * 24 * 60 * 60,
        });
      }
      set.status = 201;
      return {
        data: result,
      };
    },
    {
      body: InitialSetupRequestSchema,
      detail: {
        summary: "Execute Gitea-Style Initial System Setup",
        tags: ["Setup"],
      },
    },
  );
