import { fail, redirect, type Actions, type ServerLoad } from "@sveltejs/kit";
import { SESSION_COOKIE_NAME } from "@/hooks.server";
import { callBackendApi } from "@/lib/server/api";
import type { AppLanguage, AuthUser } from "@/lib/types";

export interface SetupPageServerData {
  lang: AppLanguage;
  suggestedAppUrl: string;
}

export interface SetupActionData {
  error?: string;
  adminName?: string;
  adminEmail?: string;
  cafeName?: string;
  appUrl?: string;
  smtpHost?: string;
  smtpPort?: string;
  smtpUser?: string;
  smtpFrom?: string;
  googleClientId?: string;
}

export const load: ServerLoad = async ({
  locals,
  url,
}): Promise<SetupPageServerData> => {
  return {
    lang: locals.lang,
    suggestedAppUrl: url.origin,
  };
};

export const actions: Actions = {
  default: async ({ request, cookies, url }) => {
    const formData = await request.formData();
    const adminName = String(formData.get("adminName") ?? "").trim();
    const adminEmail = String(formData.get("adminEmail") ?? "").trim();
    const adminPassword = String(formData.get("adminPassword") ?? "");
    const adminPasswordConfirm = String(
      formData.get("adminPasswordConfirm") ?? "",
    );
    const cafeName = String(formData.get("cafeName") ?? "").trim();
    const appUrl = String(formData.get("appUrl") ?? "").trim();

    const smtpHost = String(formData.get("smtpHost") ?? "").trim();
    const smtpPortRaw = String(formData.get("smtpPort") ?? "").trim();
    const smtpUser = String(formData.get("smtpUser") ?? "").trim();
    const smtpPassword = String(formData.get("smtpPassword") ?? "");
    const smtpFrom = String(formData.get("smtpFrom") ?? "").trim();

    const googleClientId = String(formData.get("googleClientId") ?? "").trim();
    const googleClientSecret = String(
      formData.get("googleClientSecret") ?? "",
    ).trim();

    if (!adminName || !adminEmail || !adminPassword) {
      return fail(400, {
        error: "Nama Administrator, Email, dan Password wajib diisi.",
        adminName,
        adminEmail,
        cafeName,
        appUrl,
        smtpHost,
        smtpPort: smtpPortRaw,
        smtpUser,
        smtpFrom,
        googleClientId,
      });
    }

    if (adminPassword.length < 8) {
      return fail(400, {
        error: "Password minimal 8 karakter.",
        adminName,
        adminEmail,
        cafeName,
        appUrl,
        smtpHost,
        smtpPort: smtpPortRaw,
        smtpUser,
        smtpFrom,
        googleClientId,
      });
    }

    if (adminPassword !== adminPasswordConfirm) {
      return fail(400, {
        error: "Konfirmasi password tidak cocok.",
        adminName,
        adminEmail,
        cafeName,
        appUrl,
        smtpHost,
        smtpPort: smtpPortRaw,
        smtpUser,
        smtpFrom,
        googleClientId,
      });
    }

    const payload: Record<string, unknown> = {
      adminName,
      adminEmail,
      adminPassword,
      cafeName: cafeName || "CafeStock Roastery",
      appUrl: appUrl || url.origin || "http://localhost:3000",
    };

    if (smtpHost) payload.smtpHost = smtpHost;
    if (smtpPortRaw) payload.smtpPort = Number(smtpPortRaw);
    if (smtpUser) payload.smtpUser = smtpUser;
    if (smtpPassword) payload.smtpPassword = smtpPassword;
    if (smtpFrom) payload.smtpFrom = smtpFrom;
    if (googleClientId) payload.googleClientId = googleClientId;
    if (googleClientSecret) payload.googleClientSecret = googleClientSecret;

    const res = await callBackendApi<{
      data: { token: string; user: AuthUser };
    }>("/api/setup", {
      method: "POST",
      body: payload,
    });

    if (!res.ok || !res.data?.data) {
      return fail(res.status || 400, {
        error: res.errorMessage ?? "Gagal menjalankan setup awal.",
        adminName,
        adminEmail,
        cafeName,
        appUrl,
        smtpHost,
        smtpPort: smtpPortRaw,
        smtpUser,
        smtpFrom,
        googleClientId,
      });
    }

    cookies.set(SESSION_COOKIE_NAME, res.data.data.token, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 30 * 24 * 60 * 60,
    });

    throw redirect(303, "/inventory");
  },
};
