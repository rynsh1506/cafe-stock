import type { ServerLoad } from "@sveltejs/kit";
import type { AppLanguage, AuthUser } from "@/lib/types";

export interface LayoutServerData {
  user: AuthUser | null;
  lang: AppLanguage;
  pathname: string;
}

export const load: ServerLoad = ({ locals, url }): LayoutServerData => {
  return {
    user: locals.user,
    lang: locals.lang,
    pathname: url.pathname,
  };
};
