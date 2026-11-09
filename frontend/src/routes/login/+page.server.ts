import { fail, redirect, type Actions, type ServerLoad } from "@sveltejs/kit";
import { LANG_COOKIE_NAME, SESSION_COOKIE_NAME } from "@/hooks.server";
import { callBackendApi } from "@/lib/server/api";
import type { AppLanguage, AuthUser } from "@/lib/types";

export interface LoginPageServerData {
  lang: AppLanguage;
}

export interface LoginActionData {
  error?: string;
  email?: string;
}

export const load: ServerLoad = ({ locals }): LoginPageServerData => {
  if (locals.user) {
    throw redirect(303, "/");
  }
  return {
    lang: locals.lang,
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
      data: { token: string; user: AuthUser };
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

    cookies.set(SESSION_COOKIE_NAME, res.data.data.token, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
    });

    throw redirect(303, "/");
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
