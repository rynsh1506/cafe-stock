import { and, desc, eq, gt } from "drizzle-orm";
import { db } from "@/db/index";
import { otpVerifications, sessions, systemSettings, users } from "@/db/schema";
import type {
  AuthenticatedUser,
  LoginInput,
  LoginResponse,
} from "@/modules/auth/model";
import { recordAuditLog } from "@/utils/audit";
import {
  generateSessionToken,
  hashPassword,
  verifyPassword,
} from "@/utils/crypto";
import { AppError } from "@/utils/errors";
import { logger } from "@/utils/logger";
import {
  generateBackupCodes,
  generateTotpCode,
  generateTotpSecret,
  generateTotpUri,
  hashBackupCode,
  verifyTotpCode,
} from "@/utils/totp";
import QRCode from "qrcode";

const SESSION_DURATION_MS = 1000 * 60 * 60 * 24 * 7;
export const SESSION_COOKIE_NAME = "cafestock_session";

export async function resolveGoogleRedirectUri(
  originOverride?: string,
): Promise<string> {
  const envUri = process.env.GOOGLE_REDIRECT_URI?.trim();
  const isEnvLocalhostDefault =
    !envUri ||
    envUri === "http://localhost:3000/api/auth/google/callback" ||
    envUri === "http://127.0.0.1:3000/api/auth/google/callback";

  if (envUri && !isEnvLocalhostDefault) {
    return envUri;
  }

  const appUrlSetting = await db
    .select()
    .from(systemSettings)
    .where(eq(systemSettings.key, "app_url"));

  const configuredAppUrl = appUrlSetting[0]?.value?.trim();
  if (configuredAppUrl) {
    return `${configuredAppUrl.replace(/\/+$/, "")}/api/auth/google/callback`;
  }

  if (originOverride?.trim()) {
    return `${originOverride.trim().replace(/\/+$/, "")}/api/auth/google/callback`;
  }

  return envUri || "http://localhost:3000/api/auth/google/callback";
}

export async function getGoogleAuthUrl(
  originOverride?: string,
): Promise<string> {
  let clientId = process.env.GOOGLE_CLIENT_ID || "";
  const redirectUri = await resolveGoogleRedirectUri(originOverride);

  if (!clientId) {
    const setting = await db
      .select()
      .from(systemSettings)
      .where(eq(systemSettings.key, "google_client_id"));
    if (setting[0]?.value) {
      clientId = setting[0].value;
    }
  }

  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "openid email profile");
  url.searchParams.set("access_type", "offline");
  url.searchParams.set("prompt", "consent");
  return url.toString();
}

export type GoogleOAuthResult =
  | { type: "LOGGED_IN"; token: string; user: AuthenticatedUser }
  | { type: "OTP_REQUIRED"; email: string; otpCode: string }
  | { type: "PENDING_APPROVAL"; email: string };

export async function handleGoogleCallback(
  code: string,
  originOverride?: string,
): Promise<GoogleOAuthResult> {
  let clientId = process.env.GOOGLE_CLIENT_ID || "";
  let clientSecret = process.env.GOOGLE_CLIENT_SECRET || "";
  const redirectUri = await resolveGoogleRedirectUri(originOverride);

  if (!clientId || !clientSecret) {
    const idSetting = await db
      .select()
      .from(systemSettings)
      .where(eq(systemSettings.key, "google_client_id"));
    const secretSetting = await db
      .select()
      .from(systemSettings)
      .where(eq(systemSettings.key, "google_client_secret"));
    if (idSetting[0]?.value) clientId = idSetting[0].value;
    if (secretSetting[0]?.value) clientSecret = secretSetting[0].value;
  }

  let email = "";
  let name = "Google User";
  let picture: string | null = null;
  let sub: string | null = null;

  try {
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    const tokenData = (await tokenRes.json()) as {
      access_token?: string;
      error?: string;
      error_description?: string;
    };

    if (!tokenRes.ok || !tokenData.access_token) {
      throw new Error(
        tokenData.error_description ||
          tokenData.error ||
          "Failed to exchange code",
      );
    }

    const userInfoRes = await fetch(
      "https://www.googleapis.com/oauth2/v3/userinfo",
      {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      },
    );

    const profile = (await userInfoRes.json()) as {
      email?: string;
      name?: string;
      picture?: string;
      sub?: string;
    };

    email = (profile.email || "").toLowerCase().trim();
    name = profile.name || email.split("@")[0] || "Google User";
    picture = profile.picture || null;
    sub = profile.sub || null;
  } catch (err) {
    logger.error("Google OAuth token exchange error", {
      error: err instanceof Error ? err.message : String(err),
    });
    throw AppError.badRequest(
      "GOOGLE_OAUTH_FAILED",
      `Google OAuth verification failed: ${err instanceof Error ? err.message : String(err)}`,
    );
  }

  if (!email) {
    throw AppError.badRequest(
      "INVALID_EMAIL",
      "No email received from Google profile",
    );
  }

  const existingAllUsers = await db.select({ id: users.id }).from(users);
  const [existingUser] = await db
    .select()
    .from(users)
    .where(eq(users.email, email));

  // Case 1: First user ever in the entire database => Super Admin!
  if (existingAllUsers.length === 0) {
    const [superAdmin] = await db
      .insert(users)
      .values({
        email,
        name: `${name} (Super Admin)`,
        passwordHash: hashPassword(crypto.randomUUID()),
        role: "APPROVER",
        isActive: true,
        avatarUrl: picture,
        googleId: sub,
      })
      .returning();

    const token = generateSessionToken();
    const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);
    await db.insert(sessions).values({
      token,
      userId: superAdmin.id,
      expiresAt,
    });

    const authenticatedUser: AuthenticatedUser = {
      id: superAdmin.id,
      email: superAdmin.email,
      name: superAdmin.name,
      role: superAdmin.role,
      isActive: superAdmin.isActive,
    };

    await recordAuditLog({
      actor: {
        id: superAdmin.id,
        name: superAdmin.name,
        role: superAdmin.role,
      },
      action: "SUPER_ADMIN_INITIALIZED",
      entityType: "USER",
      entityId: superAdmin.id,
      summary: `Initial Super Admin ${superAdmin.email} registered and authorized via Google OAuth`,
    });

    return {
      type: "LOGGED_IN",
      token,
      user: authenticatedUser,
    };
  }

  // Case 2: Existing user
  if (existingUser) {
    if (existingUser.isActive) {
      const token = generateSessionToken();
      const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);
      await db.insert(sessions).values({
        token,
        userId: existingUser.id,
        expiresAt,
      });

      const authenticatedUser: AuthenticatedUser = {
        id: existingUser.id,
        email: existingUser.email,
        name: existingUser.name,
        role: existingUser.role,
        isActive: existingUser.isActive,
      };

      await recordAuditLog({
        actor: {
          id: existingUser.id,
          name: existingUser.name,
          role: existingUser.role,
        },
        action: "USER_LOGIN_OAUTH",
        entityType: "USER",
        entityId: existingUser.id,
        summary: `User ${existingUser.email} signed in via Google OAuth`,
      });

      return {
        type: "LOGGED_IN",
        token,
        user: authenticatedUser,
      };
    }

    // Account awaiting Super Admin confirmation
    await recordAuditLog({
      actor: {
        id: existingUser.id,
        name: existingUser.name,
        role: existingUser.role,
      },
      action: "USER_LOGIN_PENDING_APPROVAL",
      entityType: "USER",
      entityId: existingUser.id,
      summary: `User ${existingUser.email} attempted login, pending Super Admin confirmation`,
    });

    return {
      type: "PENDING_APPROVAL",
      email: existingUser.email,
    };
  }

  // Case 3: Subsequent user (2nd user and onwards) - New account registration
  const [newUser] = await db
    .insert(users)
    .values({
      email,
      name,
      passwordHash: hashPassword(crypto.randomUUID()),
      role: "USER",
      isActive: false, // Inactive until Super Admin confirmation!
      avatarUrl: picture,
      googleId: sub,
    })
    .returning();

  // Generate 6-digit OTP code
  const otpCode = String(Math.floor(100000 + Math.random() * 900000));
  const otpExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

  await db.insert(otpVerifications).values({
    email: newUser.email,
    code: otpCode,
    expiresAt: otpExpiry,
    isVerified: false,
  });

  await recordAuditLog({
    actor: {
      id: newUser.id,
      name: newUser.name,
      role: newUser.role,
    },
    action: "USER_OAUTH_REGISTER_OTP_REQUIRED",
    entityType: "USER",
    entityId: newUser.id,
    summary: `New account ${newUser.email} created via Google OAuth. OTP generated, awaiting Super Admin confirmation`,
  });

  return {
    type: "OTP_REQUIRED",
    email: newUser.email,
    otpCode,
  };
}

export async function verifyUserOtp(
  email: string,
  code: string,
): Promise<{ success: boolean; message: string }> {
  const normalizedEmail = email.trim().toLowerCase();
  const normalizedCode = code.trim();

  const now = new Date();
  const records = await db
    .select()
    .from(otpVerifications)
    .where(
      and(
        eq(otpVerifications.email, normalizedEmail),
        eq(otpVerifications.code, normalizedCode),
        eq(otpVerifications.isVerified, false),
        gt(otpVerifications.expiresAt, now),
      ),
    )
    .orderBy(desc(otpVerifications.createdAt));

  const record = records[0];
  if (!record) {
    throw AppError.badRequest(
      "INVALID_OTP",
      "Kode OTP salah atau telah kedaluwarsa",
    );
  }

  await db
    .update(otpVerifications)
    .set({ isVerified: true })
    .where(eq(otpVerifications.id, record.id));

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, normalizedEmail));

  await recordAuditLog({
    actor: user ? { id: user.id, name: user.name, role: user.role } : null,
    action: "OTP_VERIFIED",
    entityType: "USER",
    entityId: user ? user.id : normalizedEmail,
    summary: `OTP successfully verified for ${normalizedEmail}. Account status is awaiting Super Admin confirmation`,
  });

  return {
    success: true,
    message:
      "OTP berhasil diverifikasi. Akun Anda menunggu konfirmasi dari Super Admin.",
  };
}

export async function listPendingUsers(admin: AuthenticatedUser) {
  if (admin.role !== "APPROVER") {
    throw AppError.forbidden("Only approvers can view pending users");
  }

  return await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      role: users.role,
      avatarUrl: users.avatarUrl,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(eq(users.isActive, false))
    .orderBy(desc(users.createdAt));
}

export async function approvePendingUser(
  admin: AuthenticatedUser,
  targetUserId: string,
  newRole: "USER" | "APPROVER" = "USER",
) {
  if (admin.role !== "APPROVER") {
    throw AppError.forbidden("Only approvers can confirm accounts");
  }

  const [targetUser] = await db
    .select()
    .from(users)
    .where(eq(users.id, targetUserId));

  if (!targetUser) {
    throw AppError.notFound("User not found");
  }

  await db
    .update(users)
    .set({ isActive: true, role: newRole, updatedAt: new Date() })
    .where(eq(users.id, targetUserId));

  await recordAuditLog({
    actor: { id: admin.id, name: admin.name, role: admin.role },
    action: "USER_APPROVED_BY_ADMIN",
    entityType: "USER",
    entityId: targetUser.id,
    summary: `Super Admin ${admin.name} confirmed and activated account ${targetUser.email} with role ${newRole}`,
  });

  return {
    id: targetUser.id,
    email: targetUser.email,
    name: targetUser.name,
    role: newRole,
    isActive: true,
  };
}

export async function rejectPendingUser(
  admin: AuthenticatedUser,
  targetUserId: string,
) {
  if (admin.role !== "APPROVER") {
    throw AppError.forbidden("Only approvers can reject accounts");
  }

  const [targetUser] = await db
    .select()
    .from(users)
    .where(eq(users.id, targetUserId));

  if (!targetUser) {
    throw AppError.notFound("User not found");
  }

  await db.delete(users).where(eq(users.id, targetUserId));

  await recordAuditLog({
    actor: { id: admin.id, name: admin.name, role: admin.role },
    action: "USER_REJECTED_BY_ADMIN",
    entityType: "USER",
    entityId: targetUser.id,
    summary: `Super Admin ${admin.name} rejected and deleted registration for ${targetUser.email}`,
  });
}

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

  if (user.totpEnabled) {
    return {
      token: "",
      requires2Fa: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        isActive: user.isActive,
        totpEnabled: true,
      },
    };
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
    totpEnabled: false,
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
    requires2Fa: false,
  };
}

export async function setup2Fa(user: AuthenticatedUser) {
  const secret = generateTotpSecret();
  const uri = generateTotpUri(user.email, secret);
  const { plainCodes, hashedCodes } = generateBackupCodes();
  const qrCodeDataUrl = await QRCode.toDataURL(uri, {
    width: 280,
    margin: 2,
    color: {
      dark: "#231712",
      light: "#FFFFFF",
    },
  });

  return {
    secret,
    uri,
    qrCodeDataUrl,
    backupCodes: plainCodes,
    hashedCodes,
  };
}

export async function enable2Fa(
  user: AuthenticatedUser,
  code: string,
  secret: string,
  hashedBackupCodes?: string[],
) {
  const isValid = verifyTotpCode(code, secret);
  if (!isValid) {
    throw AppError.badRequest(
      "INVALID_2FA_CODE",
      "Kode verifikasi 6-digit Authenticator tidak cocok atau salah",
    );
  }

  const backupCodesToStore =
    hashedBackupCodes && hashedBackupCodes.length > 0
      ? hashedBackupCodes
      : generateBackupCodes().hashedCodes;

  await db
    .update(users)
    .set({
      totpSecret: secret,
      totpEnabled: true,
      backupCodes: backupCodesToStore,
    })
    .where(eq(users.id, user.id));

  await recordAuditLog({
    actor: { id: user.id, name: user.name, role: user.role },
    action: "USER_2FA_ENABLED",
    entityType: "USER",
    entityId: user.id,
    summary: `User ${user.email} enabled RFC 6238 Authenticator 2FA`,
  });

  return {
    success: true,
    message: "Autentikasi dua faktor (2FA) berhasil diaktifkan",
  };
}

export async function verify2FaLogin(
  email: string,
  code: string,
): Promise<LoginResponse> {
  const normalizedEmail = email.trim().toLowerCase();
  const normalizedCode = code.trim().toUpperCase();

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, normalizedEmail));

  if (!user || !user.isActive || !user.totpEnabled || !user.totpSecret) {
    throw AppError.badRequest(
      "INVALID_2FA_REQUEST",
      "2FA is not enabled for this account",
    );
  }

  let isValid = false;
  let usedBackupCode = false;

  if (/^\d{6}$/.test(normalizedCode)) {
    isValid = verifyTotpCode(normalizedCode, user.totpSecret);
  }

  if (!isValid && user.backupCodes && user.backupCodes.length > 0) {
    const hashed = hashBackupCode(normalizedCode);
    const codeIndex = user.backupCodes.indexOf(hashed);
    if (codeIndex !== -1) {
      isValid = true;
      usedBackupCode = true;
      const remaining = [...user.backupCodes];
      remaining.splice(codeIndex, 1);
      await db
        .update(users)
        .set({ backupCodes: remaining })
        .where(eq(users.id, user.id));
    }
  }

  if (!isValid) {
    throw AppError.badRequest(
      "INVALID_2FA_CODE",
      "Token Authenticator atau kode cadangan tidak valid",
    );
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
    totpEnabled: user.totpEnabled,
  };

  await recordAuditLog({
    actor: {
      id: authenticatedUser.id,
      name: authenticatedUser.name,
      role: authenticatedUser.role,
    },
    action: usedBackupCode
      ? "USER_LOGIN_2FA_BACKUP_CODE"
      : "USER_LOGIN_2FA_TOTP",
    entityType: "USER",
    entityId: authenticatedUser.id,
    summary: `User ${authenticatedUser.email} authenticated via ${usedBackupCode ? "Recovery Backup Code" : "Authenticator TOTP"}`,
  });

  return {
    token,
    user: authenticatedUser,
    requires2Fa: false,
  };
}

export async function disable2Fa(
  user: AuthenticatedUser,
  passwordConfirm: string,
) {
  const [currentUser] = await db
    .select()
    .from(users)
    .where(eq(users.id, user.id));

  if (!currentUser) {
    throw AppError.notFound("User not found");
  }

  const isPasswordValid = verifyPassword(
    passwordConfirm,
    currentUser.passwordHash,
  );
  if (!isPasswordValid) {
    throw AppError.unauthorized("Password konfirmasi salah");
  }

  await db
    .update(users)
    .set({
      totpSecret: null,
      totpEnabled: false,
      backupCodes: null,
    })
    .where(eq(users.id, user.id));

  await recordAuditLog({
    actor: { id: user.id, name: user.name, role: user.role },
    action: "USER_2FA_DISABLED",
    entityType: "USER",
    entityId: user.id,
    summary: `User ${user.email} disabled Authenticator 2FA`,
  });

  return {
    success: true,
    message: "Autentikasi dua faktor (2FA) dinonaktifkan",
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
      totpEnabled: users.totpEnabled,
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
