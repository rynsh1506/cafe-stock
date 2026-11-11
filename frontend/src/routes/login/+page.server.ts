import { fail, redirect, type Actions, type ServerLoad } from "@sveltejs/kit";
import { LANG_COOKIE_NAME, SESSION_COOKIE_NAME } from "@/hooks.server";
import { callBackendApi } from "@/lib/server/api";
import type { AppLanguage, AuthUser } from "@/lib/types";

export interface LoginPageServerData {
  lang: AppLanguage;
  status?: string;
  email?: string;
  hint?: string;
  error?: string;
  googleConfigured?: boolean;
}

export interface LoginActionData {
  error?: string;
  email?: string;
  status?: string;
  success?: boolean;
}

export const load: ServerLoad = async ({
  locals,
  url,
}): Promise<LoginPageServerData> => {
  if (locals.user) {
    throw redirect(303, "/");
  }

  let googleConfigured = false;
  try {
    const statusRes = await callBackendApi<{
      data: { isInitialized: boolean; googleConfigured: boolean };
    }>("/api/setup/status");
    if (statusRes.ok && statusRes.data?.data) {
      googleConfigured = Boolean(statusRes.data.data.googleConfigured);
    }
  } catch {
    googleConfigured = false;
  }

  return {
    lang: locals.lang,
    status: url.searchParams.get("status") ?? undefined,
    email: url.searchParams.get("email") ?? undefined,
    hint: url.searchParams.get("hint") ?? undefined,
    error: url.searchParams.get("error") ?? undefined,
    googleConfigured,
  };
};

export const actions: Actions = {
  login: async ({ request, cookies }) => {
    const formData = await request.formData();
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    if (!email || !password) {
      return fail(400, {
        error: "Email and password are required",
        email,
      });
    }

    const res = await callBackendApi<{
      data: { token: string; user: AuthUser; requires2Fa?: boolean };
    }>("/api/auth/login", {
      method: "POST",
      body: { email, password },
    });

    if (!res.ok || !res.data?.data) {
      return fail(res.status || 401, {
        error: res.errorMessage ?? "Invalid email or password",
        email,
      });
    }

    if (res.data.data.requires2Fa) {
      return {
        status: "2fa_required",
        email,
      };
    }

    cookies.set(SESSION_COOKIE_NAME, res.data.data.token, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
    });

    throw redirect(303, "/");
  },

  verify2Fa: async ({ request, cookies }) => {
    const formData = await request.formData();
    const email = String(formData.get("email") ?? "").trim();
    const code = String(formData.get("code") ?? "").trim();

    if (!email || !code) {
      return fail(400, {
        error: "Token Authenticator atau kode cadangan wajib diisi",
        email,
        status: "2fa_required",
      });
    }

    const res = await callBackendApi<{
      data: { token: string; user: AuthUser };
    }>("/api/auth/2fa/verify", {
      method: "POST",
      body: { email, code },
    });

    if (!res.ok || !res.data?.data) {
      return fail(res.status || 400, {
        error:
          res.errorMessage ??
          "Token Authenticator atau kode cadangan tidak valid",
        email,
        status: "2fa_required",
      });
    }

    cookies.set(SESSION_COOKIE_NAME, res.data.data.token, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
    });

    throw redirect(303, "/");
  },

  verifyOtp: async ({ request }) => {
    const formData = await request.formData();
    const email = String(formData.get("email") ?? "").trim();
    const code = String(formData.get("code") ?? "").trim();

    if (!email || !code) {
      return fail(400, {
        error: "Email dan kode OTP wajib diisi",
        email,
        status: "otp_required",
      });
    }

    const res = await callBackendApi<{
      data: { success: boolean; message: string };
    }>("/api/auth/otp/verify", {
      method: "POST",
      body: { email, code },
    });

    if (!res.ok) {
      return fail(res.status || 400, {
        error:
          res.errorMessage ?? "Kode OTP tidak valid atau telah kedaluwarsa",
        email,
        status: "otp_required",
      });
    }

    throw redirect(
      303,
      `/login?status=pending_approval&email=${encodeURIComponent(email)}`,
    );
  },

  logout: async ({ cookies, locals }) => {
    if (locals.token) {
      await callBackendApi("/api/auth/logout", {
        method: "POST",
        token: locals.token,
      });
    }
    cookies.delete(SESSION_COOKIE_NAME, { path: "/" });
    throw redirect(303, "/login");
  },

  setLang: async ({ request, cookies }) => {
    const formData = await request.formData();
    const lang = String(formData.get("lang") ?? "ID").toUpperCase();
    const redirectTo = String(formData.get("redirectTo") ?? "/");
    if (lang === "ID" || lang === "EN" || lang === "JP") {
      cookies.set(LANG_COOKIE_NAME, lang, {
        path: "/",
        httpOnly: false,
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 365,
      });
    }
    throw redirect(303, redirectTo.startsWith("/") ? redirectTo : "/");
  },
};
