import { t } from "elysia";
import type { UserRole } from "@/db/schema";

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  isActive: boolean;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: AuthenticatedUser;
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
