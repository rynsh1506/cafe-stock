import { t } from "elysia";

export const SetupStatusResponseSchema = t.Object({
  isInitialized: t.Boolean(),
  cafeName: t.Optional(t.String()),
});

export const InitialSetupRequestSchema = t.Object({
  adminName: t.String({ minLength: 2, maxLength: 100 }),
  adminEmail: t.String({ format: "email" }),
  adminPassword: t.String({ minLength: 8, maxLength: 128 }),
  cafeName: t.Optional(t.String({ maxLength: 100 })),
  appUrl: t.Optional(t.String({ maxLength: 255 })),
  smtpHost: t.Optional(t.String({ maxLength: 255 })),
  smtpPort: t.Optional(t.Number()),
  smtpUser: t.Optional(t.String({ maxLength: 255 })),
  smtpPassword: t.Optional(t.String({ maxLength: 255 })),
  smtpFrom: t.Optional(t.String({ maxLength: 255 })),
  googleClientId: t.Optional(t.String({ maxLength: 255 })),
  googleClientSecret: t.Optional(t.String({ maxLength: 255 })),
});

export type InitialSetupInput = typeof InitialSetupRequestSchema.static;
