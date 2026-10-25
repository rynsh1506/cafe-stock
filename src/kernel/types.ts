import { NavigationTab } from "@/types";

export type PluginCategory =
  "CORE_OVERVIEW" | "PROCUREMENT_FLOW" | "WAREHOUSE_AUDIT" | "SYSTEM_EXTENSION";

export type IndustryPresetId =
  "ROASTERY_CAFE" | "GENERAL_WAREHOUSE" | "IT_ASSET_TICKETING";

/**
 * Standard Plugin Contract for the Microkernel Architecture.
 * Any developer adding a new module only needs to register an entry conforming to this interface
 * in `src/kernel/registry.ts`.
 */
export interface KernelPluginManifest {
  id: NavigationTab;
  code: string;
  name: string;
  sectionLabel: string;
  category: PluginCategory;
  version: string;
  author: string;
  description: string;
  isCore: boolean;
  defaultEnabled: boolean;
  hooks: string[];
}

export interface ThemeColors {
  bgMain: string;
  bgSurface: string;
  bgElevated: string;
  bgSidebar: string;
  bgSidebarHeader: string;
  textMain: string;
  textMuted: string;
  textSidebar: string;
  border: string;
  borderSidebar: string;
  accent: string;
  accentText: string;
}

export interface ThemePalette {
  id: string;
  name: string;
  badge: string;
  description: string;
  colors: ThemeColors;
}

export interface BrandingConfig {
  appName: string;
  appSubtitle: string;
  orgName: string;
  industryPreset: IndustryPresetId;
  documentPrefixPR: string;
  documentPrefixPO: string;
  documentPrefixGR: string;
  itemTerm: string;
}

export interface EmailNotificationTriggers {
  onPrSubmitted: boolean;
  onPrApproved: boolean;
  onPrRejected: boolean;
  onPoOrdered: boolean;
  onGrReceived: boolean;
  onCriticalStock: boolean;
}

export interface EmailNotificationConfig {
  enabled: boolean;
  coreAdminEmail: string;
  approverGroupEmail: string;
  smtpHost: string;
  smtpPort: number;
  useTls: boolean;
  senderIdentity: string;
  subjectPrefix: string;
  triggers: EmailNotificationTriggers;
}

export interface EmailDispatchLog {
  id: string;
  timestamp: string;
  eventHook: string;
  recipient: string;
  subject: string;
  status: "DELIVERED" | "QUEUED";
  latencyMs: number;
}

export interface KernelStorageMetrics {
  engineName: string;
  journalMode: string;
  avgReadLatencyMs: number;
  avgWriteLatencyMs: number;
  persistedKeysCount: number;
}

export type DatabaseConnectionMode = "LOCAL_EMBEDDED" | "REMOTE_SERVER_NODE";

export interface DatabaseConnectionConfig {
  mode: DatabaseConnectionMode;
  remoteEndpointUrl: string;
  instanceToken: string;
  autoSyncIntervalSec: number;
  lastHandshakeStatus: "CONNECTED" | "STANDALONE_LOCAL";
}
