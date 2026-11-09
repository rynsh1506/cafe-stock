import type { AuthUser, AppLanguage } from "@/lib/types";

declare global {
  namespace App {
    interface Locals {
      user: AuthUser | null;
      token: string | null;
      lang: AppLanguage;
    }
  }
}

export {};
