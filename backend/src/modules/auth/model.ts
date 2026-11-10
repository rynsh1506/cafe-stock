import { t } from "elysia";
import type { UserRole } from "@/db/schema";

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  isActive: boolean;
  totpEnabled?: boolean;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: AuthenticatedUser;
  requires2Fa?: boolean;
}

export const loginBodySchema = t.Object({
  email: t.String({ minLength: 3 }),
  password: t.String({ minLength: 1 }),
});

export const verifyOtpBodySchema = t.Object({
  email: t.String({ minLength: 3 }),
  code: t.String({ minLength: 4, maxLength: 8 }),
});

export const approveUserBodySchema = t.Object({
  role: t.Optional(t.Union([t.Literal("USER"), t.Literal("APPROVER")])),
});

export const enable2FaBodySchema = t.Object({
  code: t.String({ minLength: 6, maxLength: 6 }),
  secret: t.String({ minLength: 16 }),
  hashedBackupCodes: t.Optional(t.Array(t.String())),
});

export const verify2FaBodySchema = t.Object({
  email: t.String({ minLength: 3 }),
  code: t.String({ minLength: 6, maxLength: 9 }),
});

export const disable2FaBodySchema = t.Object({
  password: t.String({ minLength: 1 }),
});
