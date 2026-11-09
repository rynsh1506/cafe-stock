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
    rawLang === "EN" || rawLang === "JP" || rawLang === "ID" ? rawLang : "ID";
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

  return resolve(event);
}
