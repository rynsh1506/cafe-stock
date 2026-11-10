import { fail, redirect, type Actions, type ServerLoad } from "@sveltejs/kit";
import { callBackendApi } from "@/lib/server/api";
import type { AppLanguage, AuthUser } from "@/lib/types";

export interface Setup2FaPageData {
  user: AuthUser;
  lang: AppLanguage;
  isAlreadyEnabled: boolean;
  secret: string;
  uri: string;
  qrCodeDataUrl: string;
  backupCodes: string[];
  hashedCodes: string[];
}

export const load: ServerLoad = async ({ locals }) => {
  if (!locals.user || !locals.token) {
    throw redirect(303, "/login");
  }

  if (locals.user.totpEnabled) {
    return {
      user: locals.user,
      lang: locals.lang,
      isAlreadyEnabled: true,
      secret: "",
      uri: "",
      qrCodeDataUrl: "",
      backupCodes: [],
      hashedCodes: [],
    };
  }

  const res = await callBackendApi<{
    data: {
      secret: string;
      uri: string;
      qrCodeDataUrl: string;
      backupCodes: string[];
      hashedCodes: string[];
    };
  }>("/api/auth/2fa/setup", {
    token: locals.token,
  });

  if (!res.ok || !res.data?.data) {
    throw redirect(303, "/inventory");
  }

  return {
    user: locals.user,
    lang: locals.lang,
    isAlreadyEnabled: false,
    secret: res.data.data.secret,
    uri: res.data.data.uri,
    qrCodeDataUrl: res.data.data.qrCodeDataUrl,
    backupCodes: res.data.data.backupCodes,
    hashedCodes: res.data.data.hashedCodes,
  };
};

export const actions: Actions = {
  enable: async ({ request, locals }) => {
    if (!locals.user || !locals.token) {
      throw redirect(303, "/login");
    }

    const formData = await request.formData();
    const code = String(formData.get("code") ?? "")
      .trim()
      .replace(/\s+/g, "");
    const secret = String(formData.get("secret") ?? "").trim();
    const hashedCodesRaw = String(formData.get("hashedCodes") ?? "[]");

    let hashedBackupCodes: string[] = [];
    try {
      hashedBackupCodes = JSON.parse(hashedCodesRaw);
    } catch {
      hashedBackupCodes = [];
    }

    if (!code || code.length !== 6) {
      return fail(400, {
        error: "Masukkan 6-digit kode verifikasi dari aplikasi Authenticator",
        code,
      });
    }

    const res = await callBackendApi<{ success: boolean; message: string }>(
      "/api/auth/2fa/enable",
      {
        method: "POST",
        token: locals.token,
        body: {
          code,
          secret,
          hashedBackupCodes,
        },
      },
    );

    if (!res.ok) {
      return fail(400, {
        error:
          res.errorMessage ||
          "Kode verifikasi tidak cocok. Pastikan jam pada perangkat Anda akurat.",
        code,
      });
    }

    throw redirect(303, "/inventory");
  },

  disable: async ({ request, locals }) => {
    if (!locals.user || !locals.token) {
      throw redirect(303, "/login");
    }

    const formData = await request.formData();
    const password = String(formData.get("password") ?? "");

    if (!password) {
      return fail(400, {
        error: "Masukkan password akun Anda untuk menonaktifkan 2FA",
      });
    }

    const res = await callBackendApi<{ success: boolean; message: string }>(
      "/api/auth/2fa/disable",
      {
        method: "POST",
        token: locals.token,
        body: { password },
      },
    );

    if (!res.ok) {
      return fail(400, {
        error: res.errorMessage || "Password yang Anda masukkan salah",
      });
    }

    throw redirect(303, "/setup/2fa");
  },

  skip: async () => {
    throw redirect(303, "/inventory");
  },
};
