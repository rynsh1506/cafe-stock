import { Elysia } from "elysia";
import { requireApproverUser } from "@/modules/auth/service";
import { InitialSetupRequestSchema, UpdateSystemSettingsSchema } from "./model";
import {
  checkSetupStatus,
  executeInitialSetup,
  getSystemSettings,
  resetAllMasterData,
  updateSystemSettings,
} from "./service";

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
  .get(
    "/settings",
    async ({ request }) => {
      const user = await requireApproverUser(request);
      const settings = await getSystemSettings(user);
      return { data: settings };
    },
    {
      detail: {
        summary: "Get System Configuration and Integration Settings",
        tags: ["Setup"],
      },
    },
  )
  .put(
    "/settings",
    async ({ request, body }) => {
      const user = await requireApproverUser(request);
      const settings = await updateSystemSettings(user, body);
      return { data: settings };
    },
    {
      body: UpdateSystemSettingsSchema,
      detail: {
        summary: "Update System Configuration and Integrations (SMTP & OAuth)",
        tags: ["Setup"],
      },
    },
  )
  .post(
    "/reset-master-data",
    async ({ request }) => {
      const user = await requireApproverUser(request);
      const result = await resetAllMasterData(user);
      return { data: result };
    },
    {
      detail: {
        summary: "Reset and Wipe All Master Data & Related Records",
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
