import { eq } from "drizzle-orm";
import { db } from "@/db/index";
import { auditLogs, sessions, systemSettings, users } from "@/db/schema";
import { generateSessionToken, hashPassword } from "@/utils/crypto";
import { AppError } from "@/utils/errors";
import { logger } from "@/utils/logger";
import type { InitialSetupInput } from "./model";

export async function checkSetupStatus(): Promise<{
  isInitialized: boolean;
  cafeName?: string;
}> {
  const initSetting = await db
    .select()
    .from(systemSettings)
    .where(eq(systemSettings.key, "is_initialized"));

  if (initSetting.length > 0 && initSetting[0].value === "true") {
    const cafeNameSetting = await db
      .select()
      .from(systemSettings)
      .where(eq(systemSettings.key, "cafe_name"));
    return {
      isInitialized: true,
      cafeName: cafeNameSetting[0]?.value,
    };
  }

  const approvers = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.role, "APPROVER"));

  if (approvers.length > 0) {
    return { isInitialized: true };
  }

  return { isInitialized: false };
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

    const sessionToken = generateSecureToken();
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
