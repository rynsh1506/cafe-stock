import React, { useState } from "react";
import {
  Activity,
  Blocks,
  Building2,
  Check,
  Code2,
  Cpu,
  Database,
  Globe,
  HardDrive,
  Mail,
  Palette,
  Plus,
  RotateCcw,
  Search,
  Send,
  Server,
  ShieldAlert,
  Sliders,
  Trash2,
  Users,
  UserPlus,
} from "lucide-react";
import { useKernel } from "@/kernel/KernelContext";
import { useAuth } from "@/context/AuthContext";
import { useStore } from "@/context/StoreContext";
import {
  DatabaseEngineType,
  IndustryPresetId,
  ThemeColors,
} from "@/kernel/types";
import {
  BUILTIN_LOCALES,
  BuiltInLocaleCode,
  TranslationKey,
} from "@/kernel/i18n";
import { NavigationTab, UserRole } from "@/types";

type AdminSectionId =
  | "status"
  | "users"
  | "identity"
  | "i18n"
  | "database"
  | "plugins"
  | "themes"
  | "mailer"
  | "dev-sdk";

const PLUGIN_NAME_KEY_MAP: Record<NavigationTab, TranslationKey> = {
  dashboard: "plugin.dashboard.name",
  products: "plugin.products.name",
  "purchase-requests": "plugin.purchaseRequests.name",
  "purchase-orders": "plugin.purchaseOrders.name",
  "goods-receipts": "plugin.goodsReceipts.name",
  inventory: "plugin.inventory.name",
  "audit-logs": "plugin.auditLogs.name",
  "control-panel": "plugin.controlPanel.name",
};

const CUSTOMIZABLE_DICT_KEYS: {
  key: TranslationKey;
  category: string;
}[] = [
  { key: "plugin.dashboard.name", category: "Navigasi" },
  { key: "plugin.products.name", category: "Navigasi" },
  { key: "plugin.purchaseRequests.name", category: "Navigasi" },
  { key: "plugin.purchaseOrders.name", category: "Navigasi" },
  { key: "plugin.goodsReceipts.name", category: "Navigasi" },
  { key: "plugin.inventory.name", category: "Navigasi" },
  { key: "plugin.auditLogs.name", category: "Navigasi" },
  { key: "plugin.controlPanel.name", category: "Navigasi" },
  { key: "dashboard.titlePrefix", category: "Dashboard" },
  { key: "dashboard.subtitle", category: "Dashboard" },
  { key: "dashboard.createPrBtn", category: "Dashboard" },
  { key: "dashboard.reviewBtn", category: "Dashboard" },
  { key: "dashboard.kpi1.label", category: "KPI" },
  { key: "dashboard.kpi2.label", category: "KPI" },
  { key: "dashboard.kpi3.label", category: "KPI" },
  { key: "dashboard.kpi4.label", category: "KPI" },
  { key: "dashboard.chart.title", category: "Grafik" },
  { key: "dashboard.alert.title", category: "Gudang" },
  { key: "dashboard.tx.title", category: "Transaksi" },
  { key: "login.heroLine1", category: "Login" },
  { key: "login.heroLine2", category: "Login" },
  { key: "login.welcomeTitle", category: "Login" },
  { key: "cp.headerTitle", category: "Control Panel" },
];

export const ControlPanelTab: React.FC = () => {
  const {
    plugins,
    enabledPlugins,
    isPluginEnabled,
    togglePlugin,
    themes,
    activeThemeId,
    activeColors,
    selectTheme,
    updateCustomColor,
    resetCustomColors,
    branding,
    updateBranding,
    applyIndustryPreset,
    locale,
    availableLocales,
    setLocale,
    createCustomLocale,
    deleteCustomLocale,
    t,
    getBaseTranslationForCurrentLocale,
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
  } = useKernel();
  const {
    currentUser,
    accounts,
    registerAccount,
    approveAccount,
    rejectAccount,
    deleteAccount,
    updateAccountRole,
  } = useAuth();
  const {
    products,
    suppliers,
    warehouses,
    purchaseRequests,
    purchaseOrders,
    goodsReceipts,
    inventoryBalances,
    auditLogs,
    wipeAllDatabase,
    seedDemoData,
    exportSqlDump,
  } = useStore();
  const [sqlPreview, setSqlPreview] = useState<string>("");

  const [activeSection, setActiveSection] =
    useState<AdminSectionId>("database");
  const [dictFilter, setDictFilter] = useState<string>("");
  const [newLangCode, setNewLangCode] = useState<string>("");
  const [newLangName, setNewLangName] = useState<string>("");
  const [newLangBase, setNewLangBase] = useState<BuiltInLocaleCode>("id");
  const [testSentBanner, setTestSentBanner] = useState<boolean>(false);

  // User Manager State
  const [usrFullName, setUsrFullName] = useState<string>("");
  const [usrUsername, setUsrUsername] = useState<string>("");
  const [usrEmail, setUsrEmail] = useState<string>("");
  const [usrPassword, setUsrPassword] = useState<string>("");
  const [usrRole, setUsrRole] = useState<UserRole>("USER");
  const [usrMessage, setUsrMessage] = useState<string>("");

  const customOverrideCount = Object.values(customTranslations).filter(
    (v) => v && v.trim().length > 0,
  ).length;

  const adminNavItems: {
    id: AdminSectionId;
    code: string;
    label: string;
    icon: React.ElementType;
    badge?: string;
  }[] = [
    {
      id: "status",
      code: "ADM-01",
      label: t("cp.nav.status"),
      icon: Activity,
      badge: "ONLINE",
    },
    {
      id: "users",
      code: "ADM-USR",
      label: "Manajemen Akun & Role",
      icon: Users,
      badge: `${accounts.length} AKUN`,
    },
    {
      id: "identity",
      code: "ADM-02",
      label: t("cp.nav.identity"),
      icon: Building2,
    },
    {
      id: "i18n",
      code: "ADM-03",
      label: t("cp.nav.i18n"),
      icon: Globe,
      badge: `${locale.toUpperCase()} (${availableLocales.length})`,
    },
    {
      id: "database",
      code: "ADM-04",
      label: t("cp.nav.database"),
      icon: Database,
      badge: dbConnection.mode === "LOCAL_EMBEDDED" ? "LOCAL" : "REMOTE",
    },
    {
      id: "plugins",
      code: "ADM-05",
      label: t("cp.nav.plugins"),
      icon: Blocks,
      badge: `${enabledPlugins.length}/${plugins.length}`,
    },
    {
      id: "themes",
      code: "ADM-06",
      label: t("cp.nav.themes"),
      icon: Palette,
    },
    {
      id: "mailer",
      code: "ADM-07",
      label: t("cp.nav.mailer"),
      icon: Mail,
      badge: emailConfig.enabled ? "ON" : "OFF",
    },
    {
      id: "dev-sdk",
      code: "ADM-08",
      label: t("cp.nav.devSdk"),
      icon: Code2,
    },
  ];

  const colorTokenFields: {
    key: keyof ThemeColors;
    labelKey: TranslationKey;
    tokenName: string;
  }[] = [
    {
      key: "bgMain",
      labelKey: "cp.themes.tokenBgMain",
      tokenName: "--kr-bg-main",
    },
    {
      key: "bgSurface",
      labelKey: "cp.themes.tokenBgSurface",
      tokenName: "--kr-bg-surface",
    },
    {
      key: "bgSidebar",
      labelKey: "cp.themes.tokenBgSidebar",
      tokenName: "--kr-bg-sidebar",
    },
    {
      key: "textMain",
      labelKey: "cp.themes.tokenTextMain",
      tokenName: "--kr-text-main",
    },
    {
      key: "border",
      labelKey: "cp.themes.tokenBorder",
      tokenName: "--kr-border",
    },
    {
      key: "accent",
      labelKey: "cp.themes.tokenAccent",
      tokenName: "--kr-accent",
    },
  ];

  const handleCreateLanguage = (e: React.FormEvent): void => {
    e.preventDefault();
    if (!newLangCode.trim() || !newLangName.trim()) {
      return;
    }
    createCustomLocale(newLangCode, newLangName, newLangBase);
    setNewLangCode("");
    setNewLangName("");
  };

  const handleSendTestMail = (): void => {
    sendTestEmailNotification();
    setTestSentBanner(true);
    setTimeout(() => {
      setTestSentBanner(false);
    }, 3000);
  };

  const handleAdminCreateUser = (e: React.FormEvent): void => {
    e.preventDefault();
    const res = registerAccount(
      {
        name: usrFullName,
        username: usrUsername,
        email: usrEmail,
        password: usrPassword,
        role: usrRole,
      },
      false,
    );
    if (!res.ok) {
      setUsrMessage(
        res.errorKey ? t(res.errorKey as TranslationKey) : "Gagal membuat akun",
      );
      return;
    }
    setUsrFullName("");
    setUsrUsername("");
    setUsrEmail("");
    setUsrPassword("");
    setUsrMessage("✓ Akun baru berhasil didaftarkan ke sistem.");
    setTimeout(() => setUsrMessage(""), 3500);
  };

  const filteredDictItems = CUSTOMIZABLE_DICT_KEYS.filter((item) => {
    if (!dictFilter.trim()) {
      return true;
    }
    const q = dictFilter.toLowerCase();
    const defaultVal = getBaseTranslationForCurrentLocale(
      item.key,
    ).toLowerCase();
    return (
      item.key.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q) ||
      defaultVal.includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Top Site Administration Header */}
      <div
        style={{ borderColor: "var(--kr-border)" }}
        className="border-b pb-5 flex flex-col md:flex-row md:items-end justify-between gap-4"
      >
        <div>
          <div
            style={{ color: "var(--kr-text-muted)" }}
            className="flex flex-wrap items-center gap-2 font-mono text-[10px] uppercase tracking-widest"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>{t("cp.headerTag")}</span>
            <span>•</span>
            <span>TAURI NATIVE ENGINE</span>
          </div>
          <h1
            style={{ color: "var(--kr-text-main)" }}
            className="font-serif text-2xl sm:text-3xl font-normal tracking-tight mt-1"
          >
            {t("cp.headerTitle")}
          </h1>
          <p
            style={{ color: "var(--kr-text-muted)" }}
            className="text-xs sm:text-sm mt-1 max-w-2xl"
          >
            {t("cp.headerDesc")}
          </p>
        </div>

        <button
          onClick={resetKernelToDefaults}
          type="button"
          style={{
            borderColor: "var(--kr-border)",
            backgroundColor: "var(--kr-bg-surface)",
            color: "var(--kr-text-main)",
          }}
          className="px-3.5 py-2 border font-mono text-[11px] uppercase tracking-wider font-semibold hover:opacity-80 transition flex items-center gap-2 cursor-pointer shrink-0"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>{t("cp.resetDefaultBtn")}</span>
        </button>
      </div>

      {/* Main Two-Column Gitea Admin Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Rail: Site Administration Menu */}
        <div
          style={{
            backgroundColor: "var(--kr-bg-surface)",
            borderColor: "var(--kr-border)",
          }}
          className="lg:col-span-4 border"
        >
          <div
            style={{
              backgroundColor: "var(--kr-bg-elevated)",
              borderColor: "var(--kr-border)",
              color: "var(--kr-text-muted)",
            }}
            className="px-4 py-3 border-b font-mono text-[10px] font-semibold uppercase tracking-widest flex items-center justify-between"
          >
            <span>{t("cp.menuTitle")}</span>
            <span>v2.2</span>
          </div>

          <div style={{ borderColor: "var(--kr-border)" }} className="divide-y">
            {adminNavItems.map((item) => {
              const Icon = item.icon;
              const isSelected = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  type="button"
                  style={{
                    backgroundColor: isSelected
                      ? "var(--kr-bg-elevated)"
                      : "transparent",
                    borderLeftColor: isSelected
                      ? "var(--kr-accent)"
                      : "transparent",
                    color: "var(--kr-text-main)",
                  }}
                  className="w-full px-4 py-3 text-left flex items-center justify-between transition border-l-4 cursor-pointer hover:opacity-90"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon
                      style={{
                        color: isSelected
                          ? "var(--kr-accent)"
                          : "var(--kr-text-muted)",
                      }}
                      className="w-4 h-4 shrink-0"
                    />
                    <div className="min-w-0">
                      <div
                        style={{ color: "var(--kr-text-muted)" }}
                        className="font-mono text-[9px] uppercase tracking-wider"
                      >
                        {item.code}
                      </div>
                      <div className="text-xs font-semibold truncate">
                        {item.label}
                      </div>
                    </div>
                  </div>
                  {item.badge && (
                    <span
                      style={{
                        backgroundColor: "var(--kr-bg-main)",
                        borderColor: "var(--kr-border)",
                        color: "var(--kr-text-main)",
                      }}
                      className="font-mono text-[9px] font-bold px-1.5 py-0.5 border shrink-0"
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Content Area */}
        <div
          style={{
            backgroundColor: "var(--kr-bg-surface)",
            borderColor: "var(--kr-border)",
          }}
          className="lg:col-span-8 border p-5 sm:p-7"
        >
          {/* SECTION 1: STATUS KERNEL */}
          {activeSection === "status" && (
            <div className="space-y-6">
              <div
                style={{ borderColor: "var(--kr-border)" }}
                className="border-b pb-4"
              >
                <div
                  style={{ color: "var(--kr-text-muted)" }}
                  className="font-mono text-[10px] uppercase tracking-widest"
                >
                  ADM-01 // SYSTEM TELEMETRY &amp; STORAGE ENGINE
                </div>
                <h2 className="font-serif text-xl font-normal mt-0.5">
                  {t("cp.nav.status")}
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div
                  style={{
                    backgroundColor: "var(--kr-bg-elevated)",
                    borderColor: "var(--kr-border)",
                  }}
                  className="p-4 border"
                >
                  <div
                    style={{ color: "var(--kr-text-muted)" }}
                    className="font-mono text-[10px] uppercase tracking-wider flex items-center gap-1.5"
                  >
                    <Database className="w-3.5 h-3.5" />
                    <span>{t("cp.status.latencyTitle")}</span>
                  </div>
                  <div className="font-mono text-2xl font-bold mt-2">
                    {storageMetrics.avgReadLatencyMs} ms
                  </div>
                  <div className="font-mono text-[10px] text-[#1D593B] font-semibold mt-1">
                    Write: {storageMetrics.avgWriteLatencyMs} ms
                  </div>
                </div>

                <div
                  style={{
                    backgroundColor: "var(--kr-bg-elevated)",
                    borderColor: "var(--kr-border)",
                  }}
                  className="p-4 border"
                >
                  <div
                    style={{ color: "var(--kr-text-muted)" }}
                    className="font-mono text-[10px] uppercase tracking-wider flex items-center gap-1.5"
                  >
                    <Blocks className="w-3.5 h-3.5" />
                    <span>{t("cp.status.addonsTitle")}</span>
                  </div>
                  <div className="font-mono text-2xl font-bold mt-2">
                    {enabledPlugins.length} / {plugins.length}
                  </div>
                  <div
                    style={{ color: "var(--kr-text-muted)" }}
                    className="font-mono text-[10px] mt-1"
                  >
                    {locale.toUpperCase()} ({customOverrideCount}{" "}
                    {t("cp.status.customTerms")})
                  </div>
                </div>

                <div
                  style={{
                    backgroundColor: "var(--kr-bg-elevated)",
                    borderColor: "var(--kr-border)",
                  }}
                  className="p-4 border"
                >
                  <div
                    style={{ color: "var(--kr-text-muted)" }}
                    className="font-mono text-[10px] uppercase tracking-wider flex items-center gap-1.5"
                  >
                    <Cpu className="w-3.5 h-3.5" />
                    <span>{t("cp.status.dbModeTitle")}</span>
                  </div>
                  <div className="font-mono text-sm font-bold mt-2 truncate">
                    {dbConnection.mode === "LOCAL_EMBEDDED"
                      ? "Standalone Local"
                      : "Remote Server Node"}
                  </div>
                  <div
                    style={{ color: "var(--kr-text-muted)" }}
                    className="font-mono text-[10px] mt-1 truncate"
                  >
                    {dbConnection.lastHandshakeStatus}
                  </div>
                </div>
              </div>

              <div
                style={{ borderColor: "var(--kr-border)" }}
                className="border"
              >
                <div
                  style={{
                    backgroundColor: "var(--kr-bg-elevated)",
                    borderColor: "var(--kr-border)",
                  }}
                  className="px-4 py-2.5 border-b font-mono text-[10px] font-semibold uppercase tracking-widest"
                >
                  {t("cp.status.specHeader")}
                </div>
                <div
                  style={{ borderColor: "var(--kr-border)" }}
                  className="divide-y text-xs font-mono"
                >
                  <div className="px-4 py-2.5 flex items-center justify-between gap-4">
                    <span style={{ color: "var(--kr-text-muted)" }}>
                      {t("cp.status.rowIdentity")}
                    </span>
                    <span className="font-bold">
                      {branding.appName} ({branding.orgName})
                    </span>
                  </div>
                  <div className="px-4 py-2.5 flex items-center justify-between gap-4">
                    <span style={{ color: "var(--kr-text-muted)" }}>
                      {t("cp.status.rowStorage")}
                    </span>
                    <span>{storageMetrics.engineName}</span>
                  </div>
                  <div className="px-4 py-2.5 flex items-center justify-between gap-4">
                    <span style={{ color: "var(--kr-text-muted)" }}>
                      {t("cp.status.rowLang")}
                    </span>
                    <span className="uppercase font-bold">
                      {locale} ({availableLocales.length} locales)
                    </span>
                  </div>
                  <div className="px-4 py-2.5 flex items-center justify-between gap-4">
                    <span style={{ color: "var(--kr-text-muted)" }}>
                      {t("cp.status.rowEmail")}
                    </span>
                    <span className="font-semibold">
                      {emailConfig.coreAdminEmail}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 2: IDENTITAS & WHITE-LABEL BRANDING */}
          {activeSection === "identity" && (
            <div className="space-y-6">
              <div
                style={{ borderColor: "var(--kr-border)" }}
                className="border-b pb-4"
              >
                <div
                  style={{ color: "var(--kr-text-muted)" }}
                  className="font-mono text-[10px] uppercase tracking-widest"
                >
                  ADM-02 // WHITE-LABEL &amp; TERMINOLOGY ENGINE
                </div>
                <h2 className="font-serif text-xl font-normal mt-0.5">
                  {t("cp.nav.identity")}
                </h2>
              </div>

              <div>
                <div
                  style={{ color: "var(--kr-text-muted)" }}
                  className="font-mono text-[10px] font-semibold uppercase tracking-widest mb-2.5"
                >
                  {t("cp.identity.presetLabel")}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {(
                    [
                      {
                        id: "ROASTERY_CAFE" as IndustryPresetId,
                        title: t("cp.identity.presetRoastery"),
                        sub: "CafeStock — PR / PO / GR",
                      },
                      {
                        id: "GENERAL_WAREHOUSE" as IndustryPresetId,
                        title: t("cp.identity.presetWarehouse"),
                        sub: "OpenSupply — REQ / ORD / RCV",
                      },
                      {
                        id: "IT_ASSET_TICKETING" as IndustryPresetId,
                        title: t("cp.identity.presetTicketing"),
                        sub: "osProcure — TKT / PO-IT / AST",
                      },
                    ] as const
                  ).map((preset) => {
                    const isCurrent = branding.industryPreset === preset.id;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => applyIndustryPreset(preset.id)}
                        style={{
                          backgroundColor: isCurrent
                            ? "var(--kr-bg-elevated)"
                            : "var(--kr-bg-main)",
                          borderColor: isCurrent
                            ? "var(--kr-accent)"
                            : "var(--kr-border)",
                        }}
                        className="p-3.5 text-left border transition cursor-pointer"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold">
                            {preset.title}
                          </span>
                          {isCurrent && (
                            <Check className="w-3.5 h-3.5 text-[#1D593B]" />
                          )}
                        </div>
                        <div
                          style={{ color: "var(--kr-text-muted)" }}
                          className="font-mono text-[10px] mt-1"
                        >
                          {preset.sub}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block font-mono text-[10px] font-semibold uppercase tracking-widest mb-1.5">
                    {t("cp.identity.appNameLabel")}
                  </label>
                  <input
                    type="text"
                    value={branding.appName}
                    onChange={(e) =>
                      updateBranding({ appName: e.target.value })
                    }
                    style={{
                      backgroundColor: "var(--kr-bg-main)",
                      borderColor: "var(--kr-border)",
                      color: "var(--kr-text-main)",
                    }}
                    className="w-full px-3 py-2 border font-mono text-xs focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-mono text-[10px] font-semibold uppercase tracking-widest mb-1.5">
                    {t("cp.identity.appSubLabel")}
                  </label>
                  <input
                    type="text"
                    value={branding.appSubtitle}
                    onChange={(e) =>
                      updateBranding({ appSubtitle: e.target.value })
                    }
                    style={{
                      backgroundColor: "var(--kr-bg-main)",
                      borderColor: "var(--kr-border)",
                      color: "var(--kr-text-main)",
                    }}
                    className="w-full px-3 py-2 border font-mono text-xs focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-mono text-[10px] font-semibold uppercase tracking-widest mb-1.5">
                    {t("cp.identity.orgNameLabel")}
                  </label>
                  <input
                    type="text"
                    value={branding.orgName}
                    onChange={(e) =>
                      updateBranding({ orgName: e.target.value })
                    }
                    style={{
                      backgroundColor: "var(--kr-bg-main)",
                      borderColor: "var(--kr-border)",
                      color: "var(--kr-text-main)",
                    }}
                    className="w-full px-3 py-2 border font-mono text-xs focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-mono text-[10px] font-semibold uppercase tracking-widest mb-1.5">
                    {t("cp.identity.itemTermLabel")}
                  </label>
                  <input
                    type="text"
                    value={branding.itemTerm}
                    onChange={(e) =>
                      updateBranding({ itemTerm: e.target.value })
                    }
                    style={{
                      backgroundColor: "var(--kr-bg-main)",
                      borderColor: "var(--kr-border)",
                      color: "var(--kr-text-main)",
                    }}
                    className="w-full px-3 py-2 border font-mono text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 pt-2">
                <div>
                  <label className="block font-mono text-[10px] font-semibold uppercase tracking-widest mb-1">
                    {t("cp.identity.prefixPrLabel")}
                  </label>
                  <input
                    type="text"
                    value={branding.documentPrefixPR}
                    onChange={(e) =>
                      updateBranding({
                        documentPrefixPR: e.target.value.toUpperCase(),
                      })
                    }
                    style={{
                      backgroundColor: "var(--kr-bg-main)",
                      borderColor: "var(--kr-border)",
                      color: "var(--kr-text-main)",
                    }}
                    className="w-full px-3 py-2 border font-mono text-xs uppercase focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-mono text-[10px] font-semibold uppercase tracking-widest mb-1">
                    {t("cp.identity.prefixPoLabel")}
                  </label>
                  <input
                    type="text"
                    value={branding.documentPrefixPO}
                    onChange={(e) =>
                      updateBranding({
                        documentPrefixPO: e.target.value.toUpperCase(),
                      })
                    }
                    style={{
                      backgroundColor: "var(--kr-bg-main)",
                      borderColor: "var(--kr-border)",
                      color: "var(--kr-text-main)",
                    }}
                    className="w-full px-3 py-2 border font-mono text-xs uppercase focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-mono text-[10px] font-semibold uppercase tracking-widest mb-1">
                    {t("cp.identity.prefixGrLabel")}
                  </label>
                  <input
                    type="text"
                    value={branding.documentPrefixGR}
                    onChange={(e) =>
                      updateBranding({
                        documentPrefixGR: e.target.value.toUpperCase(),
                      })
                    }
                    style={{
                      backgroundColor: "var(--kr-bg-main)",
                      borderColor: "var(--kr-border)",
                      color: "var(--kr-text-main)",
                    }}
                    className="w-full px-3 py-2 border font-mono text-xs uppercase focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* SECTION 3: MULTI-BAHASA, PEMBUAT BAHASA BARU & KAMUS KUSTOM */}
          {activeSection === "i18n" && (
            <div className="space-y-6">
              <div
                style={{ borderColor: "var(--kr-border)" }}
                className="border-b pb-4"
              >
                <div
                  style={{ color: "var(--kr-text-muted)" }}
                  className="font-mono text-[10px] uppercase tracking-widest"
                >
                  ADM-03 // MULTI-LANGUAGE &amp; CUSTOM LOCALE STUDIO
                </div>
                <h2 className="font-serif text-xl font-normal mt-0.5">
                  {t("cp.nav.i18n")}
                </h2>
                <p
                  style={{ color: "var(--kr-text-muted)" }}
                  className="text-xs mt-1"
                >
                  {t("cp.i18n.desc")}
                </p>
              </div>

              {/* Installed Languages Grid (Built-In + User-Created) */}
              <div>
                <div
                  style={{ color: "var(--kr-text-muted)" }}
                  className="font-mono text-[10px] font-semibold uppercase tracking-widest mb-2.5"
                >
                  {t("cp.i18n.activeLocalesLabel")} ({availableLocales.length})
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {availableLocales.map((loc) => {
                    const isCurrent = locale === loc.code;
                    return (
                      <div
                        key={loc.code}
                        onClick={() => setLocale(loc.code)}
                        style={{
                          backgroundColor: isCurrent
                            ? "var(--kr-bg-elevated)"
                            : "var(--kr-bg-main)",
                          borderColor: isCurrent
                            ? "var(--kr-accent)"
                            : "var(--kr-border)",
                        }}
                        className="p-3.5 border transition cursor-pointer flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-mono text-xs font-bold truncate">
                              [{loc.flagCode}] {loc.nativeName}
                            </span>
                            {isCurrent && (
                              <Check className="w-3.5 h-3.5 text-[#1D593B] shrink-0" />
                            )}
                          </div>
                          <div
                            style={{ color: "var(--kr-text-muted)" }}
                            className="font-mono text-[10px] mt-1 flex items-center justify-between"
                          >
                            <span>Code: {loc.code}</span>
                            <span className="px-1 py-0.2 border text-[9px]">
                              {loc.isBuiltIn
                                ? t("cp.i18n.builtInBadge")
                                : t("cp.i18n.customBadge")}
                            </span>
                          </div>
                        </div>

                        {!loc.isBuiltIn && (
                          <div className="mt-2.5 pt-2 border-t border-black/10 flex justify-end">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteCustomLocale(loc.code);
                              }}
                              className="font-mono text-[10px] text-[#9E2A20] hover:underline flex items-center gap-1 cursor-pointer"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>{t("common.delete")}</span>
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Create New Custom Language Form (Besides the 3 Built-In Locales) */}
              <form
                onSubmit={handleCreateLanguage}
                style={{
                  backgroundColor: "var(--kr-bg-main)",
                  borderColor: "var(--kr-border)",
                }}
                className="p-4 border space-y-3"
              >
                <div className="font-mono text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5">
                  <Plus className="w-3.5 h-3.5" />
                  <span>{t("cp.i18n.addLangTitle")}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-end">
                  <div className="sm:col-span-3">
                    <input
                      type="text"
                      required
                      maxLength={8}
                      value={newLangCode}
                      onChange={(e) => setNewLangCode(e.target.value)}
                      placeholder={t("cp.i18n.addLangCodePlaceholder")}
                      style={{
                        backgroundColor: "var(--kr-bg-surface)",
                        borderColor: "var(--kr-border)",
                        color: "var(--kr-text-main)",
                      }}
                      className="w-full px-2.5 py-2 border font-mono text-xs focus:outline-none"
                    />
                  </div>
                  <div className="sm:col-span-4">
                    <input
                      type="text"
                      required
                      value={newLangName}
                      onChange={(e) => setNewLangName(e.target.value)}
                      placeholder={t("cp.i18n.addLangNamePlaceholder")}
                      style={{
                        backgroundColor: "var(--kr-bg-surface)",
                        borderColor: "var(--kr-border)",
                        color: "var(--kr-text-main)",
                      }}
                      className="w-full px-2.5 py-2 border font-mono text-xs focus:outline-none"
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <label
                      style={{ color: "var(--kr-text-muted)" }}
                      className="block font-mono text-[9px] uppercase mb-0.5"
                    >
                      {t("cp.i18n.addLangBaseLabel")}
                    </label>
                    <select
                      value={newLangBase}
                      onChange={(e) =>
                        setNewLangBase(e.target.value as BuiltInLocaleCode)
                      }
                      style={{
                        backgroundColor: "var(--kr-bg-surface)",
                        borderColor: "var(--kr-border)",
                        color: "var(--kr-text-main)",
                      }}
                      className="w-full px-2 py-2 border font-mono text-xs focus:outline-none"
                    >
                      {BUILTIN_LOCALES.map((b) => (
                        <option key={b.code} value={b.code}>
                          {b.flagCode} ({b.nativeName})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <button
                      type="submit"
                      style={{
                        backgroundColor: "var(--kr-bg-sidebar)",
                        color: "var(--kr-text-sidebar)",
                      }}
                      className="w-full py-2 px-2.5 font-mono text-[10px] font-bold uppercase tracking-wider cursor-pointer"
                    >
                      {t("cp.i18n.addLangBtn")}
                    </button>
                  </div>
                </div>
              </form>

              {/* Custom Dictionary Editor for Currently Active Locale */}
              <div
                style={{ borderColor: "var(--kr-border)" }}
                className="pt-4 border-t space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="font-mono text-[10px] font-semibold uppercase tracking-widest block">
                      {t("cp.i18n.editorTitle")} [{locale.toUpperCase()}] (
                      {customOverrideCount} {t("cp.status.customTerms")})
                    </span>
                    <span
                      style={{ color: "var(--kr-text-muted)" }}
                      className="text-[11px]"
                    >
                      {t("cp.i18n.editorSubtitle")}
                    </span>
                  </div>
                  {customOverrideCount > 0 && (
                    <button
                      type="button"
                      onClick={resetCustomTranslations}
                      className="font-mono text-[10px] underline cursor-pointer shrink-0"
                    >
                      {t("cp.i18n.resetDictBtn")}
                    </button>
                  )}
                </div>

                <div className="relative">
                  <Search
                    style={{ color: "var(--kr-text-muted)" }}
                    className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2"
                  />
                  <input
                    type="text"
                    value={dictFilter}
                    onChange={(e) => setDictFilter(e.target.value)}
                    placeholder={t("cp.i18n.searchPlaceholder")}
                    style={{
                      backgroundColor: "var(--kr-bg-main)",
                      borderColor: "var(--kr-border)",
                      color: "var(--kr-text-main)",
                    }}
                    className="w-full pl-9 pr-3 py-2 border font-mono text-xs focus:outline-none"
                  />
                </div>

                <div
                  style={{ borderColor: "var(--kr-border)" }}
                  className="border divide-y max-h-80 overflow-y-auto"
                >
                  {filteredDictItems.map((item) => {
                    const builtinText = getBaseTranslationForCurrentLocale(
                      item.key,
                    );
                    const customVal = customTranslations[item.key] ?? "";
                    return (
                      <div
                        key={item.key}
                        style={{ borderColor: "var(--kr-border)" }}
                        className="p-3 grid grid-cols-1 sm:grid-cols-12 gap-2 sm:items-center"
                      >
                        <div className="sm:col-span-5 min-w-0">
                          <div className="font-mono text-[10px] font-bold truncate">
                            {item.key}
                          </div>
                          <div
                            style={{ color: "var(--kr-text-muted)" }}
                            className="text-[11px] truncate"
                          >
                            {t("cp.i18n.defaultTextPrefix")}: {builtinText}
                          </div>
                        </div>
                        <div className="sm:col-span-7">
                          <input
                            type="text"
                            value={customVal}
                            onChange={(e) =>
                              updateCustomTranslation(item.key, e.target.value)
                            }
                            placeholder={builtinText}
                            style={{
                              backgroundColor: "var(--kr-bg-main)",
                              borderColor: customVal
                                ? "var(--kr-accent)"
                                : "var(--kr-border)",
                              color: "var(--kr-text-main)",
                            }}
                            className="w-full px-2.5 py-1.5 border font-mono text-xs focus:outline-none"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* SECTION: MANAJEMEN AKUN PENGGUNA (ADM-USR) */}
          {activeSection === "users" && (
            <div className="space-y-6">
              <div
                style={{ borderColor: "var(--kr-border)" }}
                className="border-b pb-4"
              >
                <div
                  style={{ color: "var(--kr-text-muted)" }}
                  className="font-mono text-[10px] uppercase tracking-widest"
                >
                  ADM-USR // OPERATOR &amp; APPROVER ACCOUNT REGISTRY
                </div>
                <h2 className="font-serif text-xl font-normal mt-0.5">
                  Manajemen Akun Pengguna &amp; Otorisasi Role
                </h2>
                <p
                  style={{ color: "var(--kr-text-muted)" }}
                  className="text-xs mt-1"
                >
                  Tambahkan akun karyawan gudang (USER) atau manajer pemeriksa
                  (APPROVER) baru langsung dari Panel Kontrol tanpa perlu keluar
                  (logout) dari sesi Anda.
                </p>
              </div>

              {usrMessage && (
                <div className="p-3 border border-[#1D593B] bg-[#E7F2EC] text-[#1D593B] font-mono text-xs">
                  {usrMessage}
                </div>
              )}

              {/* Antrean Persetujuan Akun Baru (PENDING APPROVAL) */}
              {accounts.some((a) => a.status === "PENDING") && (
                <div className="p-4 border-2 border-[#8A4B14] bg-[#F9EFE0] space-y-3">
                  <div className="font-mono text-xs font-bold uppercase tracking-wider text-[#8A4B14]">
                    ● ANTREAN PERSETUJUAN PENDAFTARAN AKUN BARU (
                    {accounts.filter((a) => a.status === "PENDING").length}{" "}
                    PENDING)
                  </div>
                  <p className="text-xs text-[#5C5346]">
                    Pengguna berikut mendaftar melalui halaman Login dan tidak
                    dapat masuk sebelum Anda menyetujui (Approve) akun mereka:
                  </p>
                  <div className="space-y-2">
                    {accounts
                      .filter((a) => a.status === "PENDING")
                      .map((pendingAcc) => (
                        <div
                          key={pendingAcc.id}
                          className="p-3 bg-white border border-[#DEC19B] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                        >
                          <div>
                            <div className="font-semibold text-xs text-[#1E1A17]">
                              {pendingAcc.name}{" "}
                              <span className="font-mono text-[11px] text-[#8A4B14]">
                                (@{pendingAcc.username})
                              </span>
                            </div>
                            <div className="font-mono text-[10px] text-[#5C5346]">
                              {pendingAcc.email} • Diajukan:{" "}
                              {new Date(pendingAcc.createdAt).toLocaleString(
                                "id-ID",
                              )}
                            </div>
                          </div>
                          <div className="flex flex-wrap items-center gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={() => {
                                approveAccount(pendingAcc.id, "USER");
                                setUsrMessage(
                                  `Akun @${pendingAcc.username} telah DISETUJUI sebagai USER (Staff Gudang).`,
                                );
                              }}
                              className="px-3 py-1.5 bg-[#1D593B] text-white font-mono text-[10px] font-bold uppercase cursor-pointer"
                            >
                              ✓ Approve sbg Staff (USER)
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                approveAccount(pendingAcc.id, "APPROVER");
                                setUsrMessage(
                                  `Akun @${pendingAcc.username} telah DISETUJUI sebagai APPROVER (Admin).`,
                                );
                              }}
                              className="px-3 py-1.5 bg-[#1E4A6D] text-white font-mono text-[10px] font-bold uppercase cursor-pointer"
                            >
                              ✓ Approve sbg Admin (APPROVER)
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                rejectAccount(pendingAcc.id);
                                setUsrMessage(
                                  `Pendaftaran akun @${pendingAcc.username} telah DITOLAK (REJECTED).`,
                                );
                              }}
                              className="px-3 py-1.5 bg-[#9E2A20] text-white font-mono text-[10px] font-bold uppercase cursor-pointer"
                            >
                              ✕ Tolak
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Form Tambah Akun Baru */}
              <form
                onSubmit={handleAdminCreateUser}
                style={{
                  backgroundColor: "var(--kr-bg-main)",
                  borderColor: "var(--kr-border)",
                }}
                className="p-4 border space-y-3.5"
              >
                <div className="font-mono text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5">
                  <UserPlus
                    style={{ color: "var(--kr-accent)" }}
                    className="w-3.5 h-3.5"
                  />
                  <span>TAMBAH AKUN PETUGAS / APPROVER BARU</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-mono text-[10px] uppercase mb-1">
                      {t("login.fullNameLabel")}
                    </label>
                    <input
                      type="text"
                      required
                      value={usrFullName}
                      onChange={(e) => setUsrFullName(e.target.value)}
                      placeholder="cth: Riko Toni"
                      style={{
                        backgroundColor: "var(--kr-bg-surface)",
                        borderColor: "var(--kr-border)",
                        color: "var(--kr-text-main)",
                      }}
                      className="w-full px-3 py-2 border text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-mono text-[10px] uppercase mb-1">
                      {t("login.usernameLabel")}
                    </label>
                    <input
                      type="text"
                      required
                      value={usrUsername}
                      onChange={(e) => setUsrUsername(e.target.value)}
                      placeholder="cth: riko_approver"
                      style={{
                        backgroundColor: "var(--kr-bg-surface)",
                        borderColor: "var(--kr-border)",
                        color: "var(--kr-text-main)",
                      }}
                      className="w-full px-3 py-2 border font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-mono text-[10px] uppercase mb-1">
                      {t("login.emailLabel")}
                    </label>
                    <input
                      type="email"
                      required
                      value={usrEmail}
                      onChange={(e) => setUsrEmail(e.target.value)}
                      placeholder="riko@perusahaan.id"
                      style={{
                        backgroundColor: "var(--kr-bg-surface)",
                        borderColor: "var(--kr-border)",
                        color: "var(--kr-text-main)",
                      }}
                      className="w-full px-3 py-2 border font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-mono text-[10px] uppercase mb-1">
                      {t("login.passwordLabel")}
                    </label>
                    <input
                      type="password"
                      required
                      value={usrPassword}
                      onChange={(e) => setUsrPassword(e.target.value)}
                      placeholder="••••••••"
                      style={{
                        backgroundColor: "var(--kr-bg-surface)",
                        borderColor: "var(--kr-border)",
                        color: "var(--kr-text-main)",
                      }}
                      className="w-full px-3 py-2 border font-mono text-xs"
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] uppercase">
                      {t("login.roleLabel")}:
                    </span>
                    <select
                      value={usrRole}
                      onChange={(e) => setUsrRole(e.target.value as UserRole)}
                      style={{
                        backgroundColor: "var(--kr-bg-surface)",
                        borderColor: "var(--kr-border)",
                        color: "var(--kr-text-main)",
                      }}
                      className="px-3 py-1.5 border font-mono text-xs cursor-pointer"
                    >
                      <option value="USER">USER (Staff Gudang)</option>
                      <option value="APPROVER">
                        APPROVER (Manajer / Admin)
                      </option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    style={{
                      backgroundColor: "var(--kr-bg-sidebar)",
                      color: "var(--kr-text-sidebar)",
                    }}
                    className="px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider cursor-pointer"
                  >
                    + Simpan Akun Baru
                  </button>
                </div>
              </form>

              {/* Tabel Daftar Akun Terdaftar */}
              <div
                style={{ borderColor: "var(--kr-border)" }}
                className="border overflow-x-auto"
              >
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr
                      style={{
                        backgroundColor: "var(--kr-bg-elevated)",
                        borderColor: "var(--kr-border)",
                      }}
                      className="border-b font-mono text-[10px] uppercase"
                    >
                      <th className="py-2.5 px-4">Nama Lengkap</th>
                      <th className="py-2.5 px-4">Username</th>
                      <th className="py-2.5 px-4">Status</th>
                      <th className="py-2.5 px-4">Role Otorisasi</th>
                      <th className="py-2.5 px-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {accounts.map((acc) => {
                      const isSelf = acc.id === currentUser.id;
                      const accStatus = acc.status ?? "ACTIVE";
                      return (
                        <tr
                          key={acc.id}
                          style={{ borderColor: "var(--kr-border)" }}
                        >
                          <td className="py-3 px-4 font-semibold">
                            <div>
                              {acc.name}{" "}
                              {isSelf && (
                                <span className="font-mono text-[9px] px-1.5 py-0.5 bg-[#E7F2EC] text-[#1D593B] border border-[#B2D3C1] ml-1">
                                  SESI AKTIF
                                </span>
                              )}
                            </div>
                            <div
                              style={{ color: "var(--kr-text-muted)" }}
                              className="font-mono text-[10px] font-normal"
                            >
                              {acc.email}
                            </div>
                          </td>
                          <td className="py-3 px-4 font-mono">
                            @{acc.username}
                          </td>
                          <td className="py-3 px-4 font-mono text-[10px] font-bold">
                            {accStatus === "ACTIVE" ? (
                              <span className="px-2 py-0.5 bg-[#E7F2EC] text-[#1D593B] border border-[#B2D3C1]">
                                ACTIVE
                              </span>
                            ) : accStatus === "PENDING" ? (
                              <span className="px-2 py-0.5 bg-[#F9EFE0] text-[#8A4B14] border border-[#DEC19B]">
                                PENDING APPROVAL
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 bg-[#FCEAE8] text-[#9E2A20] border border-[#E6B8B3]">
                                REJECTED
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <select
                              value={acc.role}
                              onChange={(e) =>
                                updateAccountRole(
                                  acc.id,
                                  e.target.value as UserRole,
                                )
                              }
                              style={{
                                backgroundColor: "var(--kr-bg-main)",
                                borderColor: "var(--kr-border)",
                                color: "var(--kr-text-main)",
                              }}
                              className="px-2 py-1 border font-mono text-[10px] font-bold uppercase cursor-pointer"
                            >
                              <option value="APPROVER">APPROVER</option>
                              <option value="USER">USER</option>
                            </select>
                          </td>
                          <td className="py-3 px-4 text-right">
                            {!isSelf && accounts.length > 1 && (
                              <button
                                type="button"
                                onClick={() => deleteAccount(acc.id)}
                                className="p-1.5 text-[#9E2A20] hover:opacity-80 cursor-pointer"
                                title={t("common.delete")}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SECTION 4: KONEKSI DATABASE & SERVER NODE */}
          {activeSection === "database" && (
            <div className="space-y-6">
              <div
                style={{ borderColor: "var(--kr-border)" }}
                className="border-b pb-4"
              >
                <div
                  style={{ color: "var(--kr-text-muted)" }}
                  className="font-mono text-[10px] uppercase tracking-widest"
                >
                  ADM-04 // HYBRID STORAGE &amp; MULTI-DEVICE SYNC ADAPTER
                </div>
                <h2 className="font-serif text-xl font-normal mt-0.5">
                  {t("cp.nav.database")}
                </h2>
                <p
                  style={{ color: "var(--kr-text-muted)" }}
                  className="text-xs mt-1"
                >
                  {t("cp.db.desc")}
                </p>
              </div>

              {/* 1. Pilih Mode Topologi */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() =>
                    updateDbConnection({
                      mode: "LOCAL_EMBEDDED",
                      engine: "SQLITE",
                    })
                  }
                  style={{
                    backgroundColor:
                      dbConnection.mode === "LOCAL_EMBEDDED"
                        ? "var(--kr-bg-elevated)"
                        : "var(--kr-bg-main)",
                    borderColor:
                      dbConnection.mode === "LOCAL_EMBEDDED"
                        ? "var(--kr-accent)"
                        : "var(--kr-border)",
                  }}
                  className="p-4 text-left border transition cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-mono text-xs font-bold">
                      <HardDrive className="w-4 h-4" />
                      <span>{t("cp.db.localTitle")}</span>
                    </div>
                    {dbConnection.mode === "LOCAL_EMBEDDED" && (
                      <Check className="w-4 h-4 text-[#1D593B]" />
                    )}
                  </div>
                  <p
                    style={{ color: "var(--kr-text-muted)" }}
                    className="text-xs mt-2 leading-relaxed"
                  >
                    {t("cp.db.localDesc")}
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    updateDbConnection({
                      mode: "REMOTE_SERVER_NODE",
                      engine:
                        dbConnection.engine === "SQLITE"
                          ? "POSTGRESQL"
                          : dbConnection.engine,
                    })
                  }
                  style={{
                    backgroundColor:
                      dbConnection.mode === "REMOTE_SERVER_NODE"
                        ? "var(--kr-bg-elevated)"
                        : "var(--kr-bg-main)",
                    borderColor:
                      dbConnection.mode === "REMOTE_SERVER_NODE"
                        ? "var(--kr-accent)"
                        : "var(--kr-border)",
                  }}
                  className="p-4 text-left border transition cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-mono text-xs font-bold">
                      <Server className="w-4 h-4" />
                      <span>{t("cp.db.remoteTitle")}</span>
                    </div>
                    {dbConnection.mode === "REMOTE_SERVER_NODE" && (
                      <Check className="w-4 h-4 text-[#1D593B]" />
                    )}
                  </div>
                  <p
                    style={{ color: "var(--kr-text-muted)" }}
                    className="text-xs mt-2 leading-relaxed"
                  >
                    {t("cp.db.remoteDesc")}
                  </p>
                </button>
              </div>

              {/* 2. Pilih Engine Database (Bring Your Own Database ala Gitea) */}
              <div className="space-y-3">
                <div className="font-mono text-[10px] font-bold uppercase tracking-widest">
                  PILIH ENGINE DATABASE (KOMPATIBILITAS SQLITE vs POSTGRESQL vs
                  MARIADB/MYSQL)
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {(
                    [
                      {
                        id: "SQLITE" as DatabaseEngineType,
                        title: "SQLite 3 (Embedded)",
                        badge: "ZERO-CONFIG",
                        desc: "Tersimpan dalam 1 file lokal (.sqlite). Dialek SQL & tipe datanya 98% identik dengan PostgreSQL.",
                        defaultPort: 0,
                      },
                      {
                        id: "POSTGRESQL" as DatabaseEngineType,
                        title: "PostgreSQL 16+",
                        badge: "DIREKOMENDASIKAN",
                        desc: "Standar utama PRD & paling serasi dengan SQLite (mendukung RETURNING, UPSERT ON CONFLICT, & Row Lock).",
                        defaultPort: 5432,
                      },
                      {
                        id: "MYSQL_MARIADB" as DatabaseEngineType,
                        title: "MySQL / MariaDB",
                        badge: "BYOD OPSIONAL",
                        desc: "Gunakan jika kantor Anda sudah memiliki server database MariaDB / MySQL / XAMPP yang berjalan.",
                        defaultPort: 3306,
                      },
                    ] as const
                  ).map((eng) => {
                    const isSelected = dbConnection.engine === eng.id;
                    return (
                      <button
                        key={eng.id}
                        type="button"
                        onClick={() =>
                          updateDbConnection({
                            engine: eng.id,
                            dbPort:
                              eng.defaultPort > 0
                                ? eng.defaultPort
                                : dbConnection.dbPort,
                          })
                        }
                        style={{
                          backgroundColor: isSelected
                            ? "var(--kr-bg-elevated)"
                            : "var(--kr-bg-main)",
                          borderColor: isSelected
                            ? "var(--kr-accent)"
                            : "var(--kr-border)",
                        }}
                        className="p-3.5 text-left border transition cursor-pointer flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-mono text-xs font-bold">
                              {eng.title}
                            </span>
                            <span className="font-mono text-[9px] px-1.5 py-0.5 border font-semibold">
                              {eng.badge}
                            </span>
                          </div>
                          <p
                            style={{ color: "var(--kr-text-muted)" }}
                            className="text-[11px] mt-2 leading-relaxed"
                          >
                            {eng.desc}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. Detail Koneksi Database */}
              {dbConnection.engine === "SQLITE" ? (
                <div
                  style={{
                    backgroundColor: "var(--kr-bg-main)",
                    borderColor: "var(--kr-border)",
                  }}
                  className="p-4 border space-y-3"
                >
                  <div className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#1D593B]">
                    ● LOKASI FILE DATABASE SQLITE3 LOKAL (EMBEDDED)
                  </div>
                  <div>
                    <label className="block font-mono text-[10px] uppercase mb-1">
                      Path File SQLite (.sqlite / .db)
                    </label>
                    <input
                      type="text"
                      value={dbConnection.sqliteFilePath}
                      onChange={(e) =>
                        updateDbConnection({ sqliteFilePath: e.target.value })
                      }
                      style={{
                        backgroundColor: "var(--kr-bg-surface)",
                        borderColor: "var(--kr-border)",
                        color: "var(--kr-text-main)",
                      }}
                      className="w-full px-3 py-2 border font-mono text-xs"
                    />
                  </div>
                </div>
              ) : (
                <div
                  style={{
                    backgroundColor: "var(--kr-bg-main)",
                    borderColor: "var(--kr-border)",
                  }}
                  className="p-4 border space-y-4"
                >
                  <div className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#1E4A6D]">
                    ● PARAMETER KONEKSI DATABASE EXTERNAL ({dbConnection.engine}
                    )
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div className="sm:col-span-2">
                      <label className="block font-mono text-[10px] uppercase mb-1">
                        DB Host / IP Address
                      </label>
                      <input
                        type="text"
                        value={dbConnection.dbHost}
                        onChange={(e) =>
                          updateDbConnection({ dbHost: e.target.value })
                        }
                        style={{
                          backgroundColor: "var(--kr-bg-surface)",
                          borderColor: "var(--kr-border)",
                          color: "var(--kr-text-main)",
                        }}
                        className="w-full px-3 py-2 border font-mono text-xs"
                      />
                    </div>
                    <div>
                      <label className="block font-mono text-[10px] uppercase mb-1">
                        Port
                      </label>
                      <input
                        type="number"
                        value={dbConnection.dbPort}
                        onChange={(e) =>
                          updateDbConnection({
                            dbPort: Number(e.target.value) || 5432,
                          })
                        }
                        style={{
                          backgroundColor: "var(--kr-bg-surface)",
                          borderColor: "var(--kr-border)",
                          color: "var(--kr-text-main)",
                        }}
                        className="w-full px-3 py-2 border font-mono text-xs"
                      />
                    </div>
                    <div>
                      <label className="block font-mono text-[10px] uppercase mb-1">
                        Nama Database
                      </label>
                      <input
                        type="text"
                        value={dbConnection.dbName}
                        onChange={(e) =>
                          updateDbConnection({ dbName: e.target.value })
                        }
                        style={{
                          backgroundColor: "var(--kr-bg-surface)",
                          borderColor: "var(--kr-border)",
                          color: "var(--kr-text-main)",
                        }}
                        className="w-full px-3 py-2 border font-mono text-xs"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* 4. Konfigurasi Endpoint Shared Server & Panduan Setup Multi-Device */}
              <div
                style={{
                  backgroundColor: "var(--kr-bg-main)",
                  borderColor: "var(--kr-border)",
                }}
                className="p-4 border space-y-4"
              >
                <div className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#1D593B]">
                  {t("cp.db.remoteHeader")} (UNTUK SINKRONISASI .EXE &amp; .APK)
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-mono text-[10px] font-semibold uppercase tracking-widest mb-1.5">
                      {t("cp.db.hostUrlLabel")}
                    </label>
                    <input
                      type="text"
                      value={dbConnection.remoteEndpointUrl}
                      onChange={(e) =>
                        updateDbConnection({
                          remoteEndpointUrl: e.target.value,
                        })
                      }
                      placeholder="http://192.168.1.50:3000"
                      style={{
                        backgroundColor: "var(--kr-bg-surface)",
                        borderColor: "var(--kr-border)",
                        color: "var(--kr-text-main)",
                      }}
                      className="w-full px-3 py-2 border font-mono text-xs focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-mono text-[10px] font-semibold uppercase tracking-widest mb-1.5">
                      {t("cp.db.tokenLabel")}
                    </label>
                    <input
                      type="text"
                      value={dbConnection.instanceToken}
                      onChange={(e) =>
                        updateDbConnection({ instanceToken: e.target.value })
                      }
                      style={{
                        backgroundColor: "var(--kr-bg-surface)",
                        borderColor: "var(--kr-border)",
                        color: "var(--kr-text-main)",
                      }}
                      className="w-full px-3 py-2 border font-mono text-xs focus:outline-none"
                    />
                  </div>
                </div>

                {/* Panduan Cara Setup Shared Server (Otomatis Menyesuaikan Engine DB) */}
                <div
                  style={{ borderColor: "var(--kr-border)" }}
                  className="pt-4 border-t space-y-3"
                >
                  <div className="font-mono text-[10px] font-bold uppercase tracking-widest">
                    PANDUAN CARA SETUP SHARED SERVER (MULTI-DEVICE DESKTOP .EXE
                    &amp; MOBILE .APK)
                  </div>
                  <div className="text-xs space-y-2 leading-relaxed">
                    <p>
                      <strong>
                        Langkah 1 — Siapkan Database di Komputer Server / VPS:
                      </strong>{" "}
                      Salin konfigurasi <code>docker-compose.yml</code> di bawah
                      ini (otomatis disesuaikan dengan pilihan engine{" "}
                      <strong>{dbConnection.engine}</strong> Anda) lalu jalankan{" "}
                      <code>docker compose up -d</code>:
                    </p>
                    <pre
                      style={{
                        backgroundColor: "var(--kr-bg-sidebar)",
                        color: "var(--kr-text-sidebar)",
                      }}
                      className="p-3 font-mono text-[11px] overflow-x-auto"
                    >
                      {dbConnection.engine === "MYSQL_MARIADB"
                        ? `services:
  cafestock-mariadb:
    image: mariadb:11
    restart: always
    environment:
      MARIADB_ROOT_PASSWORD: secret_password
      MARIADB_DATABASE: ${dbConnection.dbName}
    ports:
      - "${dbConnection.dbPort}:3306"
    volumes:
      - ./db_data:/var/lib/mysql`
                        : `services:
  cafestock-postgres:
    image: postgres:16-alpine
    restart: always
    environment:
      POSTGRES_USER: ${dbConnection.dbUser}
      POSTGRES_PASSWORD: secret_password
      POSTGRES_DB: ${dbConnection.dbName}
    ports:
      - "${dbConnection.dbPort}:5432"
    volumes:
      - ./pg_data:/var/lib/postgresql/data`}
                    </pre>
                    <p>
                      <strong>
                        Langkah 2 — Jalankan Node API Server (ElysiaJS):
                      </strong>{" "}
                      Masukkan <code>DATABASE_URL</code> berikut pada file{" "}
                      <code>.env</code> server Anda:
                    </p>
                    <pre
                      style={{
                        backgroundColor: "var(--kr-bg-sidebar)",
                        color: "var(--kr-text-sidebar)",
                      }}
                      className="p-3 font-mono text-[11px] overflow-x-auto"
                    >
                      {dbConnection.engine === "SQLITE"
                        ? `DATABASE_ENGINE="sqlite"
DATABASE_URL="file:${dbConnection.sqliteFilePath}"
INSTANCE_TOKEN="${dbConnection.instanceToken}"`
                        : dbConnection.engine === "MYSQL_MARIADB"
                          ? `DATABASE_ENGINE="mysql"
DATABASE_URL="mysql://root:secret_password@${dbConnection.dbHost}:${dbConnection.dbPort}/${dbConnection.dbName}"
INSTANCE_TOKEN="${dbConnection.instanceToken}"`
                          : `DATABASE_ENGINE="postgresql"
DATABASE_URL="postgres://${dbConnection.dbUser}:secret_password@${dbConnection.dbHost}:${dbConnection.dbPort}/${dbConnection.dbName}"
INSTANCE_TOKEN="${dbConnection.instanceToken}"`}
                    </pre>
                    <p>
                      <strong>
                        Langkah 3 — Hubungkan HP (.apk) &amp; Laptop (.exe)
                        Karyawan:
                      </strong>{" "}
                      Karyawan cukup meng-install file <code>.exe</code> atau{" "}
                      <code>.apk</code>, buka{" "}
                      <strong>Panel Kontrol → ADM-04</strong>, pilih{" "}
                      <strong>Shared Server Node</strong>, lalu isi URL Server{" "}
                      <code>{dbConnection.remoteEndpointUrl}</code> dan Token{" "}
                      <code>{dbConnection.instanceToken}</code>.
                    </p>
                  </div>
                </div>
              </div>

              {/* 5. Inspektor Tabel Database Aktif & Utilitas SQL / Seeder */}
              <div
                style={{
                  backgroundColor: "var(--kr-bg-main)",
                  borderColor: "var(--kr-border)",
                }}
                className="p-4 border space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="font-mono text-[10px] font-bold uppercase tracking-widest">
                      STATUS TABEL DATABASE RELASIONAL SAAT INI (LIVE ROWS)
                    </div>
                    <p
                      style={{ color: "var(--kr-text-muted)" }}
                      className="text-xs mt-0.5"
                    >
                      Secara bawaan (default), instalasi baru dimulai dalam
                      keadaan <strong>0 baris (kosong murni)</strong> tanpa data
                      dummy. Seluruh transaksi yang Anda buat disimpan secara
                      persisten ke penyimpanan database.
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => setSqlPreview(exportSqlDump())}
                      style={{
                        backgroundColor: "var(--kr-bg-surface)",
                        borderColor: "var(--kr-border)",
                        color: "var(--kr-text-main)",
                      }}
                      className="px-3 py-1.5 border font-mono text-[10px] font-bold uppercase cursor-pointer"
                    >
                      Export SQL (.sql)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        seedDemoData();
                        setSqlPreview("");
                      }}
                      style={{
                        backgroundColor: "var(--kr-bg-sidebar)",
                        color: "var(--kr-text-sidebar)",
                      }}
                      className="px-3 py-1.5 font-mono text-[10px] font-bold uppercase cursor-pointer"
                    >
                      + Muat Data Contoh (Opsional)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        wipeAllDatabase();
                        setSqlPreview("");
                      }}
                      className="px-3 py-1.5 bg-[#9E2A20] text-white font-mono text-[10px] font-bold uppercase cursor-pointer"
                    >
                      Kosongkan Database (0 Rows)
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 font-mono text-xs">
                  {[
                    { name: "warehouses", count: warehouses.length },
                    { name: "suppliers", count: suppliers.length },
                    { name: "products", count: products.length },
                    {
                      name: "purchase_requests",
                      count: purchaseRequests.length,
                    },
                    { name: "purchase_orders", count: purchaseOrders.length },
                    { name: "goods_receipts", count: goodsReceipts.length },
                    {
                      name: "inventory_balances",
                      count: inventoryBalances.length,
                    },
                    { name: "audit_logs", count: auditLogs.length },
                  ].map((tbl) => (
                    <div
                      key={tbl.name}
                      style={{
                        backgroundColor: "var(--kr-bg-surface)",
                        borderColor: "var(--kr-border)",
                      }}
                      className="p-2.5 border flex items-center justify-between"
                    >
                      <span
                        style={{ color: "var(--kr-text-muted)" }}
                        className="text-[10px] truncate"
                      >
                        {tbl.name}
                      </span>
                      <span className="font-bold">{tbl.count} rows</span>
                    </div>
                  ))}
                </div>

                {sqlPreview && (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between font-mono text-[10px]">
                      <span className="font-bold uppercase">
                        PORTABLE SQL DUMP (COMPATIBLE WITH SQLITE / POSTGRESQL /
                        MARIADB)
                      </span>
                      <button
                        type="button"
                        onClick={() => setSqlPreview("")}
                        className="underline cursor-pointer"
                      >
                        Tutup Preview SQL
                      </button>
                    </div>
                    <pre
                      style={{
                        backgroundColor: "var(--kr-bg-sidebar)",
                        color: "var(--kr-text-sidebar)",
                      }}
                      className="p-3 font-mono text-[10px] max-h-60 overflow-auto"
                    >
                      {sqlPreview}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SECTION 5: MANAJEMEN PLUGIN & ADD-ON */}
          {activeSection === "plugins" && (
            <div className="space-y-5">
              <div
                style={{ borderColor: "var(--kr-border)" }}
                className="border-b pb-4"
              >
                <div
                  style={{ color: "var(--kr-text-muted)" }}
                  className="font-mono text-[10px] uppercase tracking-widest"
                >
                  ADM-05 // MODULAR PLUGIN REGISTRY (ODOO STYLE)
                </div>
                <h2 className="font-serif text-xl font-normal mt-0.5">
                  {t("cp.nav.plugins")}
                </h2>
              </div>

              <div className="space-y-3">
                {plugins.map((plugin) => {
                  const enabled = isPluginEnabled(plugin.id);
                  const translatedPluginTitle = t(
                    PLUGIN_NAME_KEY_MAP[plugin.id],
                  );
                  return (
                    <div
                      key={plugin.id}
                      style={{
                        backgroundColor: enabled
                          ? "var(--kr-bg-main)"
                          : "var(--kr-bg-surface)",
                        borderColor: "var(--kr-border)",
                      }}
                      className="p-4 border flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            style={{
                              backgroundColor: "var(--kr-bg-elevated)",
                              borderColor: "var(--kr-border)",
                            }}
                            className="font-mono text-[10px] font-bold px-1.5 py-0.5 border"
                          >
                            MOD-{plugin.code}
                          </span>
                          <span className="text-xs font-bold">
                            {translatedPluginTitle}
                          </span>
                          <span
                            style={{ color: "var(--kr-text-muted)" }}
                            className="font-mono text-[10px]"
                          >
                            v{plugin.version} • {plugin.author}
                          </span>
                          {plugin.isCore && (
                            <span className="font-mono text-[9px] font-bold px-1.5 py-0.5 bg-[#EFEAD8] text-[#5C4938] border border-[#D4C8B4]">
                              {t("common.lockedCore")}
                            </span>
                          )}
                        </div>
                        <p
                          style={{ color: "var(--kr-text-muted)" }}
                          className="text-xs leading-relaxed"
                        >
                          {plugin.description}
                        </p>
                      </div>

                      <div className="shrink-0">
                        <button
                          type="button"
                          disabled={plugin.isCore}
                          onClick={() => togglePlugin(plugin.id)}
                          className={`px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-wider border transition ${
                            plugin.isCore
                              ? "opacity-50 cursor-not-allowed bg-[#E5DEC9] text-[#5E4F42] border-[#CFC5B5]"
                              : enabled
                                ? "bg-[#E7F2EC] text-[#1D593B] border-[#B2D3C1] cursor-pointer"
                                : "bg-[#FCEAE8] text-[#9E2A20] border-[#E6B8B3] cursor-pointer"
                          }`}
                        >
                          {plugin.isCore
                            ? t("common.lockedCore")
                            : enabled
                              ? t("common.active")
                              : t("common.inactive")}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* SECTION 6: PALET TEMA & STUDIO WARNA */}
          {activeSection === "themes" && (
            <div className="space-y-6">
              <div
                style={{ borderColor: "var(--kr-border)" }}
                className="border-b pb-4"
              >
                <div
                  style={{ color: "var(--kr-text-muted)" }}
                  className="font-mono text-[10px] uppercase tracking-widest"
                >
                  ADM-06 // THEME ENGINE &amp; COLOR PALETTE STUDIO
                </div>
                <h2 className="font-serif text-xl font-normal mt-0.5">
                  {t("cp.nav.themes")}
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {themes.map((theme) => {
                  const isSelected = activeThemeId === theme.id;
                  return (
                    <button
                      key={theme.id}
                      type="button"
                      onClick={() => selectTheme(theme.id)}
                      style={{
                        backgroundColor: "var(--kr-bg-main)",
                        borderColor: isSelected
                          ? "var(--kr-accent)"
                          : "var(--kr-border)",
                      }}
                      className="p-4 text-left border transition cursor-pointer flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-bold">
                            {theme.name}
                          </span>
                          <span className="font-mono text-[9px] font-bold px-1.5 py-0.5 border">
                            {theme.badge}
                          </span>
                        </div>
                        <p
                          style={{ color: "var(--kr-text-muted)" }}
                          className="text-[11px] mt-1 leading-snug"
                        >
                          {theme.description}
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5 mt-3 pt-2.5 border-t border-[#DFD6C7]/50">
                        <span
                          style={{ backgroundColor: theme.colors.bgSidebar }}
                          className="w-5 h-5 border border-black/20"
                        />
                        <span
                          style={{ backgroundColor: theme.colors.bgMain }}
                          className="w-5 h-5 border border-black/20"
                        />
                        <span
                          style={{ backgroundColor: theme.colors.bgSurface }}
                          className="w-5 h-5 border border-black/20"
                        />
                        <span
                          style={{ backgroundColor: theme.colors.accent }}
                          className="w-5 h-5 border border-black/20"
                        />
                        <span className="ml-auto font-mono text-[10px] font-semibold">
                          {isSelected ? t("common.inUse") : t("common.apply")}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div
                style={{ borderColor: "var(--kr-border)" }}
                className="pt-4 border-t"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-[10px] font-semibold uppercase tracking-widest">
                    {t("cp.themes.pickerHeader")}
                  </span>
                  <button
                    type="button"
                    onClick={resetCustomColors}
                    className="font-mono text-[10px] underline cursor-pointer"
                  >
                    {t("common.reset")}
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {colorTokenFields.map((field) => (
                    <div
                      key={field.key}
                      style={{
                        backgroundColor: "var(--kr-bg-main)",
                        borderColor: "var(--kr-border)",
                      }}
                      className="p-2.5 border flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0">
                        <div className="text-[11px] font-semibold truncate">
                          {t(field.labelKey)}
                        </div>
                        <div
                          style={{ color: "var(--kr-text-muted)" }}
                          className="font-mono text-[9px]"
                        >
                          {field.tokenName} • {activeColors[field.key]}
                        </div>
                      </div>
                      <input
                        type="color"
                        value={activeColors[field.key]}
                        onChange={(e) =>
                          updateCustomColor(field.key, e.target.value)
                        }
                        className="w-7 h-7 cursor-pointer border-0 bg-transparent shrink-0"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* SECTION 7: EMAIL INTI & NOTIFIKASI */}
          {activeSection === "mailer" && (
            <div className="space-y-6">
              <div
                style={{ borderColor: "var(--kr-border)" }}
                className="border-b pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <div
                    style={{ color: "var(--kr-text-muted)" }}
                    className="font-mono text-[10px] uppercase tracking-widest"
                  >
                    ADM-07 // OSTICKET-STYLE EMAIL DISPATCHER &amp; HOOKS
                  </div>
                  <h2 className="font-serif text-xl font-normal mt-0.5">
                    {t("cp.nav.mailer")}
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    updateEmailConfig({ enabled: !emailConfig.enabled })
                  }
                  className={`px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-wider border cursor-pointer ${
                    emailConfig.enabled
                      ? "bg-[#E7F2EC] text-[#1D593B] border-[#B2D3C1]"
                      : "bg-[#FCEAE8] text-[#9E2A20] border-[#E6B8B3]"
                  }`}
                >
                  {emailConfig.enabled
                    ? t("cp.mailer.smtpEnabled")
                    : t("cp.mailer.smtpDisabled")}
                </button>
              </div>

              {testSentBanner && (
                <div className="p-3 bg-[#E7F2EC] border border-[#B2D3C1] text-[#1D593B] font-mono text-xs">
                  {t("cp.mailer.testSentNotice")}{" "}
                  <strong>{emailConfig.coreAdminEmail}</strong>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-mono text-[10px] font-semibold uppercase tracking-widest mb-1.5">
                    {t("cp.mailer.coreEmailLabel")}
                  </label>
                  <input
                    type="email"
                    value={emailConfig.coreAdminEmail}
                    onChange={(e) =>
                      updateEmailConfig({ coreAdminEmail: e.target.value })
                    }
                    style={{
                      backgroundColor: "var(--kr-bg-main)",
                      borderColor: "var(--kr-border)",
                      color: "var(--kr-text-main)",
                    }}
                    className="w-full px-3 py-2 border font-mono text-xs focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-mono text-[10px] font-semibold uppercase tracking-widest mb-1.5">
                    {t("cp.mailer.approverEmailLabel")}
                  </label>
                  <input
                    type="email"
                    value={emailConfig.approverGroupEmail}
                    onChange={(e) =>
                      updateEmailConfig({ approverGroupEmail: e.target.value })
                    }
                    style={{
                      backgroundColor: "var(--kr-bg-main)",
                      borderColor: "var(--kr-border)",
                      color: "var(--kr-text-main)",
                    }}
                    className="w-full px-3 py-2 border font-mono text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <div
                  style={{ color: "var(--kr-text-muted)" }}
                  className="font-mono text-[10px] font-semibold uppercase tracking-widest mb-2.5"
                >
                  {t("cp.mailer.triggersHeader")}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {(
                    [
                      {
                        key: "onPrSubmitted",
                        label: t("cp.mailer.trigPrSub"),
                      },
                      {
                        key: "onPrApproved",
                        label: t("cp.mailer.trigPrApp"),
                      },
                      {
                        key: "onPrRejected",
                        label: t("cp.mailer.trigPrRej"),
                      },
                      {
                        key: "onPoOrdered",
                        label: t("cp.mailer.trigPoOrd"),
                      },
                      {
                        key: "onGrReceived",
                        label: t("cp.mailer.trigGrRec"),
                      },
                      {
                        key: "onCriticalStock",
                        label: t("cp.mailer.trigCrit"),
                      },
                    ] as const
                  ).map((rule) => (
                    <label
                      key={rule.key}
                      style={{
                        backgroundColor: "var(--kr-bg-main)",
                        borderColor: "var(--kr-border)",
                      }}
                      className="p-2.5 border flex items-center gap-2.5 cursor-pointer text-xs"
                    >
                      <input
                        type="checkbox"
                        checked={emailConfig.triggers[rule.key]}
                        onChange={() => toggleEmailTrigger(rule.key)}
                        className="w-3.5 h-3.5 accent-[#1F1612]"
                      />
                      <span>{rule.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div
                style={{ borderColor: "var(--kr-border)" }}
                className="pt-4 border-t space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-mono text-[10px] font-semibold uppercase tracking-widest">
                    {t("cp.mailer.outboxHeader")} ({emailLogs.length})
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={clearEmailLogs}
                      style={{
                        borderColor: "var(--kr-border)",
                        color: "var(--kr-text-muted)",
                      }}
                      className="px-2.5 py-1.5 border font-mono text-[10px] uppercase flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>{t("common.clear")}</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleSendTestMail}
                      style={{
                        backgroundColor: "var(--kr-bg-sidebar)",
                        color: "var(--kr-text-sidebar)",
                      }}
                      className="px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider font-semibold flex items-center gap-1.5 cursor-pointer"
                    >
                      <Send className="w-3 h-3" />
                      <span>{t("cp.mailer.sendTestBtn")}</span>
                    </button>
                  </div>
                </div>

                <div
                  style={{ borderColor: "var(--kr-border)" }}
                  className="border divide-y max-h-52 overflow-y-auto"
                >
                  {emailLogs.map((log) => (
                    <div
                      key={log.id}
                      style={{ borderColor: "var(--kr-border)" }}
                      className="p-3 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                    >
                      <div className="min-w-0">
                        <div className="font-semibold truncate">
                          {log.subject}
                        </div>
                        <div
                          style={{ color: "var(--kr-text-muted)" }}
                          className="font-mono text-[10px] mt-0.5"
                        >
                          To: {log.recipient} • {log.eventHook} •{" "}
                          {log.timestamp}
                        </div>
                      </div>
                      <span className="px-1.5 py-0.5 bg-[#E7F2EC] text-[#1D593B] border border-[#B2D3C1] font-mono text-[10px] font-bold shrink-0">
                        {log.status} ({log.latencyMs}ms)
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* SECTION 8: PANDUAN KUSTOMISASI DEVELOPER (SDK) */}
          {activeSection === "dev-sdk" && (
            <div className="space-y-5">
              <div
                style={{ borderColor: "var(--kr-border)" }}
                className="border-b pb-4"
              >
                <div
                  style={{ color: "var(--kr-text-muted)" }}
                  className="font-mono text-[10px] uppercase tracking-widest"
                >
                  ADM-08 // EXTENSIBLE DEVELOPER ARCHITECTURE
                </div>
                <h2 className="font-serif text-xl font-normal mt-0.5">
                  {t("cp.nav.devSdk")}
                </h2>
              </div>

              <div
                style={{
                  backgroundColor: "var(--kr-bg-main)",
                  borderColor: "var(--kr-border)",
                }}
                className="p-4 border space-y-3"
              >
                <div className="font-mono text-xs font-bold flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-[#8A4B14]" />
                  <span>{t("cp.sdk.boxTitle")}</span>
                </div>
                <ul className="list-disc list-inside text-xs space-y-2 leading-relaxed">
                  <li>{t("cp.sdk.step1")}</li>
                  <li>{t("cp.sdk.step2")}</li>
                  <li>{t("cp.sdk.step3")}</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
