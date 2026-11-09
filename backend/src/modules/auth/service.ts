import { and, eq, gt } from "drizzle-orm";
import { db } from "@/db/index";
import { sessions, users } from "@/db/schema";
import type {
  AuthenticatedUser,
  LoginInput,
  LoginResponse,
} from "@/modules/auth/model";
import { recordAuditLog } from "@/utils/audit";
import { generateSessionToken, verifyPassword } from "@/utils/crypto";
import { AppError } from "@/utils/errors";

const SESSION_DURATION_MS = 1000 * 60 * 60 * 24 * 7;
export const SESSION_COOKIE_NAME = "cafestock_session";

export function extractTokenFromRequest(request: Request): string | null {
  const authHeader = request.headers.get("authorization");
  if (authHeader && authHeader.toLowerCase().startsWith("bearer ")) {
    const token = authHeader.slice(7).trim();
    if (token.length > 0) {
      return token;
    }
  }

  const cookieHeader = request.headers.get("cookie");
  if (cookieHeader) {
    const cookies = cookieHeader.split(";");
    for (const part of cookies) {
      const [rawName, ...rest] = part.trim().split("=");
      if (rawName === SESSION_COOKIE_NAME) {
        const value = rest.join("=").trim();
        if (value.length > 0) {
          return decodeURIComponent(value);
        }
      }
    }
  }

  return null;
}

export async function loginUser(input: LoginInput): Promise<LoginResponse> {
  const normalizedEmail = input.email.trim().toLowerCase();
  if (!normalizedEmail || !input.password) {
    throw AppError.badRequest(
      "INVALID_CREDENTIALS",
      "Email and password are required",
    );
  }

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, normalizedEmail));

  if (!user || !user.isActive) {
    throw AppError.unauthorized("Invalid email or password");
  }

  const isPasswordValid = verifyPassword(input.password, user.passwordHash);
  if (!isPasswordValid) {
    throw AppError.unauthorized("Invalid email or password");
  }

  const token = generateSessionToken();
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

  await db.insert(sessions).values({
    token,
    userId: user.id,
    expiresAt,
  });

  const authenticatedUser: AuthenticatedUser = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    isActive: user.isActive,
  };

  await recordAuditLog({
    actor: {
      id: authenticatedUser.id,
      name: authenticatedUser.name,
      role: authenticatedUser.role,
    },
    action: "USER_LOGIN",
    entityType: "USER",
    entityId: authenticatedUser.id,
    summary: `User ${authenticatedUser.email} (${authenticatedUser.role}) signed in`,
  });

  return {
    token,
    user: authenticatedUser,
  };
}

export async function logoutSession(token: string | null): Promise<void> {
  if (!token) {
    return;
  }
  await db.delete(sessions).where(eq(sessions.token, token));
}

export async function getUserFromSessionToken(
  token: string | null,
): Promise<AuthenticatedUser | null> {
  if (!token) {
    return null;
  }

  const now = new Date();
  const rows = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      role: users.role,
      isActive: users.isActive,
    })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .where(and(eq(sessions.token, token), gt(sessions.expiresAt, now)));

  const user = rows[0];
  if (!user || !user.isActive) {
    return null;
  }

  return user;
}

export async function requireAuthenticatedUser(
  request: Request,
): Promise<AuthenticatedUser> {
  const token = extractTokenFromRequest(request);
  const user = await getUserFromSessionToken(token);
  if (!user) {
    throw AppError.unauthorized(
      "Valid authentication token or session cookie is required",
    );
  }
  return user;
}

export async function requireApproverUser(
  request: Request,
): Promise<AuthenticatedUser> {
  const user = await requireAuthenticatedUser(request);
  if (user.role !== "APPROVER") {
    throw AppError.forbidden(
      "Only users with the APPROVER role can perform this action",
    );
  }
  return user;
}
