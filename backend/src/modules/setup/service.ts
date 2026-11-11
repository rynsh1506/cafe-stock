import { eq } from "drizzle-orm";
import { db } from "@/db/index";
import {
  auditLogs,
  goodsReceiptItems,
  goodsReceipts,
  inventoryBalances,
  inventoryMovements,
  products,
  purchaseOrderItems,
  purchaseOrders,
  purchaseRequestItems,
  purchaseRequests,
  sessions,
  suppliers,
  systemSettings,
  users,
  warehouses,
} from "@/db/schema";
import type { AuthenticatedUser } from "@/modules/auth/model";
import { recordAuditLog } from "@/utils/audit";
import { generateSessionToken, hashPassword } from "@/utils/crypto";
import { AppError } from "@/utils/errors";
import { logger } from "@/utils/logger";
import type { InitialSetupInput, UpdateSystemSettingsInput } from "./model";

export interface SystemSettingsSummary {
  cafeName: string;
  appUrl: string;
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpFrom: string;
  hasSmtpPassword: boolean;
  googleClientId: string;
  hasGoogleClientSecret: boolean;
  isSmtpConfigured: boolean;
  isGoogleOAuthConfigured: boolean;
  initializedAt?: string;
}

export async function checkSetupStatus(): Promise<{
  isInitialized: boolean;
  cafeName?: string;
  googleConfigured: boolean;
}> {
  const rows = await db.select().from(systemSettings);
  const map = new Map<string, string>();
  for (const r of rows) {
    map.set(r.key, r.value);
  }

  const isInitializedSetting = map.get("is_initialized") === "true";
  let isInitialized = isInitializedSetting;
  if (!isInitialized) {
    const approvers = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.role, "APPROVER"));
    if (approvers.length > 0) {
      isInitialized = true;
    }
  }

  const googleClientId =
    map.get("google_client_id") || process.env.GOOGLE_CLIENT_ID || "";
  const googleClientSecret =
    map.get("google_client_secret") || process.env.GOOGLE_CLIENT_SECRET || "";
  const googleConfigured = Boolean(
    googleClientId.trim() && googleClientSecret.trim(),
  );

  return {
    isInitialized,
    cafeName: map.get("cafe_name") || "CafeStock Roastery",
    googleConfigured,
  };
}

export async function executeInitialSetup(input: InitialSetupInput) {
  const status = await checkSetupStatus();
  if (status.isInitialized) {
    throw AppError.badRequest(
      "SETUP_ALREADY_INITIALIZED",
      "System is already initialized. First-time setup is locked.",
    );
  }

  return await db.transaction(async (tx) => {
    const [adminUser] = await tx
      .insert(users)
      .values({
        name: input.adminName.trim(),
        email: input.adminEmail.trim().toLowerCase(),
        passwordHash: hashPassword(input.adminPassword),
        role: "APPROVER",
        isActive: true,
      })
      .returning();

    const settingsToSave: Array<{ key: string; value: string }> = [
      { key: "is_initialized", value: "true" },
      { key: "initialized_at", value: new Date().toISOString() },
      {
        key: "cafe_name",
        value: (input.cafeName || "CafeStock Roastery").trim(),
      },
    ];

    if (input.appUrl?.trim()) {
      settingsToSave.push({ key: "app_url", value: input.appUrl.trim() });
    }
    if (input.smtpHost?.trim()) {
      settingsToSave.push({ key: "smtp_host", value: input.smtpHost.trim() });
    }
    if (input.smtpPort) {
      settingsToSave.push({ key: "smtp_port", value: String(input.smtpPort) });
    }
    if (input.smtpUser?.trim()) {
      settingsToSave.push({ key: "smtp_user", value: input.smtpUser.trim() });
    }
    if (input.smtpPassword?.trim()) {
      settingsToSave.push({
        key: "smtp_password",
        value: input.smtpPassword.trim(),
      });
    }
    if (input.smtpFrom?.trim()) {
      settingsToSave.push({ key: "smtp_from", value: input.smtpFrom.trim() });
    }
    if (input.googleClientId?.trim()) {
      settingsToSave.push({
        key: "google_client_id",
        value: input.googleClientId.trim(),
      });
    }
    if (input.googleClientSecret?.trim()) {
      settingsToSave.push({
        key: "google_client_secret",
        value: input.googleClientSecret.trim(),
      });
    }

    for (const s of settingsToSave) {
      await tx
        .insert(systemSettings)
        .values({
          key: s.key,
          value: s.value,
          updatedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: systemSettings.key,
          set: { value: s.value, updatedAt: new Date() },
        });
    }

    const sessionToken = generateSessionToken();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    await tx.insert(sessions).values({
      token: sessionToken,
      userId: adminUser.id,
      expiresAt,
    });

    await tx.insert(auditLogs).values({
      actorId: adminUser.id,
      actorName: adminUser.name,
      actorRole: adminUser.role,
      action: "INITIAL_SETUP_COMPLETED",
      entityType: "SYSTEM",
      entityId: adminUser.id,
      summary: `Initial Gitea-style setup completed. Root administrator ${adminUser.email} configured.`,
      metadata: {
        cafeName: input.cafeName || "CafeStock Roastery",
        configuredIntegrations: {
          smtp: Boolean(input.smtpHost),
          googleOAuth: Boolean(input.googleClientId),
        },
      },
    });

    logger.info("Initial system setup completed successfully", {
      adminEmail: adminUser.email,
      adminId: adminUser.id,
    });

    return {
      success: true,
      token: sessionToken,
      user: {
        id: adminUser.id,
        name: adminUser.name,
        email: adminUser.email,
        role: adminUser.role,
        isActive: adminUser.isActive,
      },
    };
  });
}

export async function getSystemSettings(
  user: AuthenticatedUser,
): Promise<SystemSettingsSummary> {
  if (user.role !== "APPROVER") {
    throw AppError.forbidden("Only approvers can access system settings");
  }

  const rows = await db.select().from(systemSettings);
  const map = new Map<string, string>();
  for (const r of rows) {
    map.set(r.key, r.value);
  }

  const smtpHost = map.get("smtp_host") || process.env.SMTP_HOST || "";
  const smtpPortStr = map.get("smtp_port") || process.env.SMTP_PORT || "587";
  const smtpUser = map.get("smtp_user") || process.env.SMTP_USER || "";
  const smtpFrom = map.get("smtp_from") || process.env.SMTP_FROM || "";
  const smtpPassword =
    map.get("smtp_password") ||
    process.env.SMTP_PASS ||
    process.env.SMTP_PASSWORD ||
    "";

  const googleClientId =
    map.get("google_client_id") || process.env.GOOGLE_CLIENT_ID || "";
  const googleClientSecret =
    map.get("google_client_secret") || process.env.GOOGLE_CLIENT_SECRET || "";

  const isSmtpConfigured = Boolean(smtpHost && smtpUser);
  const isGoogleOAuthConfigured = Boolean(googleClientId && googleClientSecret);

  return {
    cafeName: map.get("cafe_name") || "CafeStock Roastery",
    appUrl:
      map.get("app_url") || process.env.APP_URL || "http://localhost:3000",
    smtpHost,
    smtpPort: Number(smtpPortStr) || 587,
    smtpUser,
    smtpFrom,
    hasSmtpPassword: Boolean(smtpPassword),
    googleClientId,
    hasGoogleClientSecret: Boolean(googleClientSecret),
    isSmtpConfigured,
    isGoogleOAuthConfigured,
    initializedAt: map.get("initialized_at"),
  };
}

export async function updateSystemSettings(
  user: AuthenticatedUser,
  input: UpdateSystemSettingsInput,
): Promise<SystemSettingsSummary> {
  if (user.role !== "APPROVER") {
    throw AppError.forbidden("Only approvers can modify system settings");
  }

  const updates: Array<{ key: string; value: string }> = [];

  if (input.cafeName !== undefined) {
    updates.push({ key: "cafe_name", value: input.cafeName.trim() });
  }
  if (input.appUrl !== undefined) {
    updates.push({ key: "app_url", value: input.appUrl.trim() });
  }
  if (input.smtpHost !== undefined) {
    updates.push({ key: "smtp_host", value: input.smtpHost.trim() });
  }
  if (input.smtpPort !== undefined) {
    updates.push({ key: "smtp_port", value: String(input.smtpPort) });
  }
  if (input.smtpUser !== undefined) {
    updates.push({ key: "smtp_user", value: input.smtpUser.trim() });
  }
  if (input.smtpFrom !== undefined) {
    updates.push({ key: "smtp_from", value: input.smtpFrom.trim() });
  }
  if (
    input.smtpPassword !== undefined &&
    input.smtpPassword.trim().length > 0
  ) {
    updates.push({ key: "smtp_password", value: input.smtpPassword.trim() });
  }
  if (input.googleClientId !== undefined) {
    updates.push({
      key: "google_client_id",
      value: input.googleClientId.trim(),
    });
  }
  if (
    input.googleClientSecret !== undefined &&
    input.googleClientSecret.trim().length > 0
  ) {
    updates.push({
      key: "google_client_secret",
      value: input.googleClientSecret.trim(),
    });
  }

  for (const item of updates) {
    await db
      .insert(systemSettings)
      .values({
        key: item.key,
        value: item.value,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: systemSettings.key,
        set: { value: item.value, updatedAt: new Date() },
      });
  }

  await db.insert(auditLogs).values({
    actorId: user.id,
    actorName: user.name,
    actorRole: user.role,
    action: "SYSTEM_SETTINGS_UPDATED",
    entityType: "SYSTEM",
    entityId: user.id,
    summary: `System integrations and parameters updated by ${user.name}`,
    metadata: {
      updatedKeys: updates.map((u) => u.key),
    },
  });

  logger.info("System settings updated", {
    userId: user.id,
    updatedKeys: updates.map((u) => u.key),
  });

  return await getSystemSettings(user);
}

export async function resetAllMasterData(
  actor: AuthenticatedUser,
): Promise<{ success: boolean; message: string }> {
  if (actor.role !== "APPROVER") {
    throw AppError.forbidden(
      "FORBIDDEN",
      "Only approvers can reset master data",
    );
  }

  await db.transaction(async (tx) => {
    await tx.delete(goodsReceiptItems);
    await tx.delete(goodsReceipts);
    await tx.delete(purchaseOrderItems);
    await tx.delete(purchaseOrders);
    await tx.delete(purchaseRequestItems);
    await tx.delete(purchaseRequests);
    await tx.delete(inventoryMovements);
    await tx.delete(inventoryBalances);
    await tx.delete(products);
    await tx.delete(suppliers);
    await tx.delete(warehouses);
  });

  await recordAuditLog({
    actor,
    action: "MASTER_DATA_RESET",
    entityType: "SYSTEM",
    entityId: actor.id,
    summary:
      "Reset and wiped all master data (products, suppliers, warehouses, and related transactions)",
  });

  return {
    success: true,
    message: "All master data has been wiped successfully.",
  };
}
