import type { RequestEvent } from "@sveltejs/kit";
import { callBackendApi } from "@/lib/server/api";
import type { AppLanguage, AuthUser } from "@/lib/types";

export const SESSION_COOKIE_NAME = "cafestock_session";
export const LANG_COOKIE_NAME = "cafestock_lang";

export async function handle({
  event,
  resolve,
}: {
  event: RequestEvent;
  resolve: (event: RequestEvent) => Promise<Response> | Response;
}): Promise<Response> {
  const rawLang = event.cookies.get(LANG_COOKIE_NAME);
  const validLang: AppLanguage =
    rawLang === "EN" || rawLang === "JP" || rawLang === "ID" ? rawLang : "EN";
  event.locals.lang = validLang;

  const token = event.cookies.get(SESSION_COOKIE_NAME) ?? null;
  event.locals.token = token;
  event.locals.user = null;

  if (token) {
    const meResponse = await callBackendApi<{ data: AuthUser }>(
      "/api/auth/me",
      {
        token,
      },
    );
    if (meResponse.ok && meResponse.data?.data) {
      event.locals.user = meResponse.data.data;
    } else {
      event.cookies.delete(SESSION_COOKIE_NAME, { path: "/" });
      event.locals.token = null;
    }
  }

  const pathname = event.url.pathname;
  const isApiRoute = pathname.startsWith("/api");
  const isSetupRoute = pathname === "/setup";
  const isAsset =
    pathname.startsWith("/_app") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".");

  if (!isApiRoute && !isAsset) {
    const setupStatus = await callBackendApi<{
      data: { isInitialized: boolean };
    }>("/api/setup/status");
    const isInitialized = Boolean(
      setupStatus.ok && setupStatus.data?.data?.isInitialized,
    );

    if (!isInitialized && !pathname.startsWith("/setup")) {
      return new Response(null, {
        status: 303,
        headers: { Location: "/setup" },
      });
    }

    if (isInitialized && pathname === "/setup") {
      return new Response(null, {
        status: 303,
        headers: { Location: "/login" },
      });
    }

    if (pathname === "/setup/2fa" && !event.locals.user) {
      return new Response(null, {
        status: 303,
        headers: { Location: "/login" },
      });
    }
  }

  return resolve(event);
}
