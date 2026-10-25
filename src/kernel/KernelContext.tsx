import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { NavigationTab } from "@/types";
import {
  BrandingConfig,
  DatabaseConnectionConfig,
  EmailDispatchLog,
  EmailNotificationConfig,
  IndustryPresetId,
  KernelPluginManifest,
  KernelStorageMetrics,
  ThemeColors,
  ThemePalette,
} from "@/kernel/types";
import {
  DEFAULT_EMAIL_CONFIG,
  INDUSTRY_PRESETS,
  KERNEL_PLUGINS,
  THEME_PALETTES,
} from "@/kernel/registry";
import {
  BUILTIN_TRANSLATIONS,
  LocaleCode,
  SUPPORTED_LOCALES,
  TranslationDictionary,
  TranslationKey,
} from "@/kernel/i18n";

const STORAGE_KEYS = {
  ENABLED_PLUGINS: "kr_enabled_plugins_v1",
  THEME_ID: "kr_theme_id_v1",
  CUSTOM_COLORS: "kr_custom_colors_v1",
  BRANDING: "kr_branding_v1",
  EMAIL_CONFIG: "kr_email_config_v1",
  EMAIL_LOGS: "kr_email_logs_v1",
  LOCALE: "kr_locale_v1",
  CUSTOM_DICT: "kr_custom_dict_v1",
  DB_CONN: "kr_db_conn_v1",
} as const;

const DEFAULT_DB_CONNECTION: DatabaseConnectionConfig = {
  mode: "LOCAL_EMBEDDED",
  remoteEndpointUrl: "http://192.168.1.50:3000",
  instanceToken: "kr_live_node_99482a",
  autoSyncIntervalSec: 15,
  lastHandshakeStatus: "STANDALONE_LOCAL",
};

const INITIAL_DISPATCH_LOGS: EmailDispatchLog[] = [
  {
    id: "mail_003",
    timestamp: "26 Okt 2026, 08:14:22",
    eventHook: "mailer:onPrSubmitted",
    recipient: "approver-desk@perusahaan.co.id",
    subject:
      "[NOTIF-INTI] Tiket Pengadaan Baru #PR-2026-000001 Menunggu Review",
    status: "DELIVERED",
    latencyMs: 0.42,
  },
  {
    id: "mail_002",
    timestamp: "25 Okt 2026, 16:40:10",
    eventHook: "mailer:onCriticalStock",
    recipient: "inti-operasional@perusahaan.co.id",
    subject: "[NOTIF-INTI] Peringatan Saldo Minimum: Arabica Gayo (Sisa 10 KG)",
    status: "DELIVERED",
    latencyMs: 0.31,
  },
  {
    id: "mail_001",
    timestamp: "24 Okt 2026, 11:05:49",
    eventHook: "mailer:onGrReceived",
    recipient: "inti-operasional@perusahaan.co.id",
    subject:
      "[NOTIF-INTI] Bukti Timbang Terima #GR-2026-000001 Telah Menambah Stok",
    status: "DELIVERED",
    latencyMs: 0.28,
  },
];

interface KernelContextValue {
  plugins: KernelPluginManifest[];
  enabledPlugins: KernelPluginManifest[];
  isPluginEnabled: (id: NavigationTab) => boolean;
  togglePlugin: (id: NavigationTab) => void;
  themes: ThemePalette[];
  activeThemeId: string;
  activeColors: ThemeColors;
  selectTheme: (themeId: string) => void;
  updateCustomColor: (key: keyof ThemeColors, hexValue: string) => void;
  resetCustomColors: () => void;
  branding: BrandingConfig;
  updateBranding: (partial: Partial<BrandingConfig>) => void;
  applyIndustryPreset: (presetId: IndustryPresetId) => void;
  locale: LocaleCode;
  setLocale: (code: LocaleCode) => void;
  t: (key: TranslationKey) => string;
  customTranslations: Partial<TranslationDictionary>;
  updateCustomTranslation: (key: TranslationKey, value: string) => void;
  resetCustomTranslations: () => void;
  dbConnection: DatabaseConnectionConfig;
  updateDbConnection: (partial: Partial<DatabaseConnectionConfig>) => void;
  emailConfig: EmailNotificationConfig;
  updateEmailConfig: (partial: Partial<EmailNotificationConfig>) => void;
  toggleEmailTrigger: (
    triggerKey: keyof EmailNotificationConfig["triggers"],
  ) => void;
  emailLogs: EmailDispatchLog[];
  sendTestEmailNotification: () => void;
  clearEmailLogs: () => void;
  storageMetrics: KernelStorageMetrics;
  resetKernelToDefaults: () => void;
}

const KernelContext = createContext<KernelContextValue | undefined>(undefined);

function readPersistedJson<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) {
      return fallback;
    }
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export const KernelProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [enabledPluginIds, setEnabledPluginIds] = useState<NavigationTab[]>(
    () =>
      readPersistedJson<NavigationTab[]>(
        STORAGE_KEYS.ENABLED_PLUGINS,
        KERNEL_PLUGINS.filter((p) => p.defaultEnabled).map((p) => p.id),
      ),
  );

  const [activeThemeId, setActiveThemeId] = useState<string>(() =>
    readPersistedJson<string>(STORAGE_KEYS.THEME_ID, "roastery-ledger"),
  );

  const [customColors, setCustomColors] = useState<Partial<ThemeColors>>(() =>
    readPersistedJson<Partial<ThemeColors>>(STORAGE_KEYS.CUSTOM_COLORS, {}),
  );

  const [branding, setBranding] = useState<BrandingConfig>(() =>
    readPersistedJson<BrandingConfig>(
      STORAGE_KEYS.BRANDING,
      INDUSTRY_PRESETS.ROASTERY_CAFE,
    ),
  );

  const [locale, setLocaleState] = useState<LocaleCode>(() =>
    readPersistedJson<LocaleCode>(STORAGE_KEYS.LOCALE, "id"),
  );

  const [customTranslations, setCustomTranslations] = useState<
    Partial<TranslationDictionary>
  >(() =>
    readPersistedJson<Partial<TranslationDictionary>>(
      STORAGE_KEYS.CUSTOM_DICT,
      {},
    ),
  );

  const [dbConnection, setDbConnection] = useState<DatabaseConnectionConfig>(
    () =>
      readPersistedJson<DatabaseConnectionConfig>(
        STORAGE_KEYS.DB_CONN,
        DEFAULT_DB_CONNECTION,
      ),
  );

  const [emailConfig, setEmailConfig] = useState<EmailNotificationConfig>(() =>
    readPersistedJson<EmailNotificationConfig>(
      STORAGE_KEYS.EMAIL_CONFIG,
      DEFAULT_EMAIL_CONFIG,
    ),
  );

  const [emailLogs, setEmailLogs] = useState<EmailDispatchLog[]>(() =>
    readPersistedJson<EmailDispatchLog[]>(
      STORAGE_KEYS.EMAIL_LOGS,
      INITIAL_DISPATCH_LOGS,
    ),
  );

  const [lastWriteMs, setLastWriteMs] = useState<number>(0.18);

  const baseTheme = useMemo(
    () =>
      THEME_PALETTES.find((t) => t.id === activeThemeId) ?? THEME_PALETTES[0],
    [activeThemeId],
  );

  const activeColors: ThemeColors = useMemo(
    () => ({
      ...baseTheme.colors,
      ...customColors,
    }),
    [baseTheme, customColors],
  );

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--kr-bg-main", activeColors.bgMain);
    root.style.setProperty("--kr-bg-surface", activeColors.bgSurface);
    root.style.setProperty("--kr-bg-elevated", activeColors.bgElevated);
    root.style.setProperty("--kr-bg-sidebar", activeColors.bgSidebar);
    root.style.setProperty(
      "--kr-bg-sidebar-header",
      activeColors.bgSidebarHeader,
    );
    root.style.setProperty("--kr-text-main", activeColors.textMain);
    root.style.setProperty("--kr-text-muted", activeColors.textMuted);
    root.style.setProperty("--kr-text-sidebar", activeColors.textSidebar);
    root.style.setProperty("--kr-border", activeColors.border);
    root.style.setProperty("--kr-border-sidebar", activeColors.borderSidebar);
    root.style.setProperty("--kr-accent", activeColors.accent);
    root.style.setProperty("--kr-accent-text", activeColors.accentText);
  }, [activeColors]);

  useEffect(() => {
    document.title = `${branding.appName} — ${branding.appSubtitle}`;
    document.documentElement.lang = locale;
  }, [branding.appName, branding.appSubtitle, locale]);

  const persistWithTiming = <T,>(key: string, value: T): void => {
    const t0 = performance.now();
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Ignore quota errors in sandboxed webviews
    }
    const elapsed = Number(Math.max(0.08, performance.now() - t0).toFixed(2));
    setLastWriteMs(elapsed);
  };

  const setLocale = (code: LocaleCode): void => {
    if (!SUPPORTED_LOCALES.some((l) => l.code === code)) {
      return;
    }
    setLocaleState(code);
    persistWithTiming(STORAGE_KEYS.LOCALE, code);
  };

  const t = (key: TranslationKey): string => {
    const customVal = customTranslations[key];
    if (customVal && customVal.trim().length > 0) {
      return customVal;
    }
    const dict = BUILTIN_TRANSLATIONS[locale] ?? BUILTIN_TRANSLATIONS.id;
    return dict[key] ?? BUILTIN_TRANSLATIONS.id[key];
  };

  const updateCustomTranslation = (
    key: TranslationKey,
    value: string,
  ): void => {
    setCustomTranslations((prev) => {
      const next = { ...prev, [key]: value };
      persistWithTiming(STORAGE_KEYS.CUSTOM_DICT, next);
      return next;
    });
  };

  const resetCustomTranslations = (): void => {
    setCustomTranslations({});
    persistWithTiming(STORAGE_KEYS.CUSTOM_DICT, {});
  };

  const updateDbConnection = (
    partial: Partial<DatabaseConnectionConfig>,
  ): void => {
    setDbConnection((prev) => {
      const next: DatabaseConnectionConfig = {
        ...prev,
        ...partial,
        lastHandshakeStatus:
          (partial.mode ?? prev.mode) === "REMOTE_SERVER_NODE"
            ? "CONNECTED"
            : "STANDALONE_LOCAL",
      };
      persistWithTiming(STORAGE_KEYS.DB_CONN, next);
      return next;
    });
  };

  const isPluginEnabled = (id: NavigationTab): boolean => {
    const manifest = KERNEL_PLUGINS.find((p) => p.id === id);
    if (manifest?.isCore) {
      return true;
    }
    return enabledPluginIds.includes(id);
  };

  const togglePlugin = (id: NavigationTab): void => {
    const manifest = KERNEL_PLUGINS.find((p) => p.id === id);
    if (!manifest || manifest.isCore) {
      return;
    }
    setEnabledPluginIds((prev) => {
      const next = prev.includes(id)
        ? prev.filter((item) => item !== id)
        : [...prev, id];
      persistWithTiming(STORAGE_KEYS.ENABLED_PLUGINS, next);
      return next;
    });
  };

  const selectTheme = (themeId: string): void => {
    setActiveThemeId(themeId);
    setCustomColors({});
    persistWithTiming(STORAGE_KEYS.THEME_ID, themeId);
    persistWithTiming(STORAGE_KEYS.CUSTOM_COLORS, {});
  };

  const updateCustomColor = (
    key: keyof ThemeColors,
    hexValue: string,
  ): void => {
    setCustomColors((prev) => {
      const next = { ...prev, [key]: hexValue };
      persistWithTiming(STORAGE_KEYS.CUSTOM_COLORS, next);
      return next;
    });
  };

  const resetCustomColors = (): void => {
    setCustomColors({});
    persistWithTiming(STORAGE_KEYS.CUSTOM_COLORS, {});
  };

  const updateBranding = (partial: Partial<BrandingConfig>): void => {
    setBranding((prev) => {
      const next = { ...prev, ...partial };
      persistWithTiming(STORAGE_KEYS.BRANDING, next);
      return next;
    });
  };

  const applyIndustryPreset = (presetId: IndustryPresetId): void => {
    const preset = INDUSTRY_PRESETS[presetId];
    setBranding(preset);
    persistWithTiming(STORAGE_KEYS.BRANDING, preset);
  };

  const updateEmailConfig = (
    partial: Partial<EmailNotificationConfig>,
  ): void => {
    setEmailConfig((prev) => {
      const next = { ...prev, ...partial };
      persistWithTiming(STORAGE_KEYS.EMAIL_CONFIG, next);
      return next;
    });
  };

  const toggleEmailTrigger = (
    triggerKey: keyof EmailNotificationConfig["triggers"],
  ): void => {
    setEmailConfig((prev) => {
      const next: EmailNotificationConfig = {
        ...prev,
        triggers: {
          ...prev.triggers,
          [triggerKey]: !prev.triggers[triggerKey],
        },
      };
      persistWithTiming(STORAGE_KEYS.EMAIL_CONFIG, next);
      return next;
    });
  };

  const sendTestEmailNotification = (): void => {
    const now = new Date();
    const formattedTime = now.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    const newLog: EmailDispatchLog = {
      id: `mail_${Date.now()}`,
      timestamp: `${formattedTime}`,
      eventHook: "mailer:testDispatch",
      recipient: emailConfig.coreAdminEmail,
      subject: `${emailConfig.subjectPrefix} Test Gateway — ${branding.appName} (${branding.orgName})`,
      status: emailConfig.enabled ? "DELIVERED" : "QUEUED",
      latencyMs: 0.24,
    };
    setEmailLogs((prev) => {
      const next = [newLog, ...prev.slice(0, 14)];
      persistWithTiming(STORAGE_KEYS.EMAIL_LOGS, next);
      return next;
    });
  };

  const clearEmailLogs = (): void => {
    setEmailLogs([]);
    persistWithTiming(STORAGE_KEYS.EMAIL_LOGS, []);
  };

  const resetKernelToDefaults = (): void => {
    const defaultIds = KERNEL_PLUGINS.filter((p) => p.defaultEnabled).map(
      (p) => p.id,
    );
    setEnabledPluginIds(defaultIds);
    setActiveThemeId("roastery-ledger");
    setCustomColors({});
    setBranding(INDUSTRY_PRESETS.ROASTERY_CAFE);
    setLocaleState("id");
    setCustomTranslations({});
    setDbConnection(DEFAULT_DB_CONNECTION);
    setEmailConfig(DEFAULT_EMAIL_CONFIG);
    setEmailLogs(INITIAL_DISPATCH_LOGS);
    Object.values(STORAGE_KEYS).forEach((k) => {
      try {
        window.localStorage.removeItem(k);
      } catch {
        // ignore
      }
    });
  };

  const enabledPlugins = useMemo(
    () => KERNEL_PLUGINS.filter((p) => isPluginEnabled(p.id)),
    [enabledPluginIds],
  );

  const storageMetrics: KernelStorageMetrics = {
    engineName:
      dbConnection.mode === "LOCAL_EMBEDDED"
        ? "Tauri Native LocalStore + Memory WAL"
        : `Hybrid Sync → ${dbConnection.remoteEndpointUrl}`,
    journalMode:
      dbConnection.mode === "LOCAL_EMBEDDED"
        ? "SYNCHRONOUS_ZERO_COPY"
        : "REMOTE_WAL_REPLICATION",
    avgReadLatencyMs: dbConnection.mode === "LOCAL_EMBEDDED" ? 0.09 : 1.45,
    avgWriteLatencyMs: lastWriteMs,
    persistedKeysCount: Object.keys(STORAGE_KEYS).length,
  };

  return (
    <KernelContext.Provider
      value={{
        plugins: KERNEL_PLUGINS,
        enabledPlugins,
        isPluginEnabled,
        togglePlugin,
        themes: THEME_PALETTES,
        activeThemeId,
        activeColors,
        selectTheme,
        updateCustomColor,
        resetCustomColors,
        branding,
        updateBranding,
        applyIndustryPreset,
        locale,
        setLocale,
        t,
        customTranslations,
        updateCustomTranslation,
        resetCustomTranslations,
        dbConnection,
        updateDbConnection,
        emailConfig,
        updateEmailConfig,
        toggleEmailTrigger,
        emailLogs,
        sendTestEmailNotification,
        clearEmailLogs,
        storageMetrics,
        resetKernelToDefaults,
      }}
    >
      {children}
    </KernelContext.Provider>
  );
};

export const useKernel = (): KernelContextValue => {
  const ctx = useContext(KernelContext);
  if (!ctx) {
    throw new Error("useKernel must be used within a KernelProvider");
  }
  return ctx;
};
