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
  RotateCcw,
  Search,
  Send,
  Server,
  ShieldAlert,
  Sliders,
  Trash2,
} from "lucide-react";
import { useKernel } from "@/kernel/KernelContext";
import { IndustryPresetId, ThemeColors } from "@/kernel/types";
import {
  BUILTIN_TRANSLATIONS,
  SUPPORTED_LOCALES,
  TranslationKey,
} from "@/kernel/i18n";

type AdminSectionId =
  | "status"
  | "identity"
  | "i18n"
  | "database"
  | "plugins"
  | "themes"
  | "mailer"
  | "dev-sdk";

const CUSTOMIZABLE_DICT_KEYS: {
  key: TranslationKey;
  category: string;
}[] = [
  { key: "plugin.dashboard.name", category: "Menu Navigasi" },
  { key: "plugin.products.name", category: "Menu Navigasi" },
  { key: "plugin.purchaseRequests.name", category: "Menu Navigasi" },
  { key: "plugin.purchaseOrders.name", category: "Menu Navigasi" },
  { key: "plugin.goodsReceipts.name", category: "Menu Navigasi" },
  { key: "plugin.inventory.name", category: "Menu Navigasi" },
  { key: "plugin.auditLogs.name", category: "Menu Navigasi" },
  { key: "dashboard.titlePrefix", category: "Halaman Ikhtisar" },
  { key: "dashboard.subtitle", category: "Halaman Ikhtisar" },
  { key: "dashboard.createPrBtn", category: "Tombol Aksi" },
  { key: "dashboard.reviewBtn", category: "Tombol Aksi" },
  { key: "dashboard.kpi1.label", category: "Kartu Indeks KPI" },
  { key: "dashboard.kpi2.label", category: "Kartu Indeks KPI" },
  { key: "dashboard.kpi3.label", category: "Kartu Indeks KPI" },
  { key: "dashboard.kpi4.label", category: "Kartu Indeks KPI" },
  { key: "dashboard.chart.title", category: "Grafik & Laporan" },
  { key: "dashboard.alert.title", category: "Peringatan Gudang" },
  { key: "dashboard.tx.title", category: "Jurnal Transaksi" },
  { key: "login.heroLine1", category: "Halaman Login" },
  { key: "login.heroLine2", category: "Halaman Login" },
  { key: "login.welcomeTitle", category: "Halaman Login" },
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
  } = useKernel();

  const [activeSection, setActiveSection] = useState<AdminSectionId>("i18n");
  const [dictFilter, setDictFilter] = useState<string>("");
  const [testSentBanner, setTestSentBanner] = useState<boolean>(false);

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
      badge: locale.toUpperCase(),
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
      badge: emailConfig.enabled ? "SMTP ON" : "OFF",
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
    label: string;
    tokenName: string;
  }[] = [
    {
      key: "bgMain",
      label: "Latar Utama (Workspace)",
      tokenName: "--kr-bg-main",
    },
    {
      key: "bgSurface",
      label: "Permukaan Kertas / Panel",
      tokenName: "--kr-bg-surface",
    },
    {
      key: "bgSidebar",
      label: "Latar Navigasi Samping",
      tokenName: "--kr-bg-sidebar",
    },
    {
      key: "textMain",
      label: "Tinta Teks Utama",
      tokenName: "--kr-text-main",
    },
    {
      key: "border",
      label: "Garis Arsitektural Panel",
      tokenName: "--kr-border",
    },
    {
      key: "accent",
      label: "Warna Aksen Utama",
      tokenName: "--kr-accent",
    },
  ];

  const handleSendTestMail = (): void => {
    sendTestEmailNotification();
    setTestSentBanner(true);
    setTimeout(() => {
      setTestSentBanner(false);
    }, 3000);
  };

  const filteredDictItems = CUSTOMIZABLE_DICT_KEYS.filter((item) => {
    if (!dictFilter.trim()) {
      return true;
    }
    const q = dictFilter.toLowerCase();
    const defaultVal = BUILTIN_TRANSLATIONS[locale][item.key].toLowerCase();
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
        {/* Left Rail: Site Administration Menu (4 Cols on LG) */}
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
            <span>v2.1</span>
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

        {/* Right Content Area (8 Cols on LG) */}
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
                    <span>READ / WRITE LATENCY</span>
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
                    <span>ACTIVE ADD-ONS</span>
                  </div>
                  <div className="font-mono text-2xl font-bold mt-2">
                    {enabledPlugins.length} / {plugins.length}
                  </div>
                  <div
                    style={{ color: "var(--kr-text-muted)" }}
                    className="font-mono text-[10px] mt-1"
                  >
                    Locale: {locale.toUpperCase()} ({customOverrideCount} custom
                    terms)
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
                    <span>DB DRIVER MODE</span>
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
                  SPESIFIKASI KONFIGURASI KERNEL SAAT INI
                </div>
                <div
                  style={{ borderColor: "var(--kr-border)" }}
                  className="divide-y text-xs font-mono"
                >
                  <div className="px-4 py-2.5 flex items-center justify-between gap-4">
                    <span style={{ color: "var(--kr-text-muted)" }}>
                      App Identity
                    </span>
                    <span className="font-bold">
                      {branding.appName} ({branding.orgName})
                    </span>
                  </div>
                  <div className="px-4 py-2.5 flex items-center justify-between gap-4">
                    <span style={{ color: "var(--kr-text-muted)" }}>
                      Storage Adapter
                    </span>
                    <span>{storageMetrics.engineName}</span>
                  </div>
                  <div className="px-4 py-2.5 flex items-center justify-between gap-4">
                    <span style={{ color: "var(--kr-text-muted)" }}>
                      Active Language Pack
                    </span>
                    <span className="uppercase font-bold">
                      {locale} ({customOverrideCount} Kustom)
                    </span>
                  </div>
                  <div className="px-4 py-2.5 flex items-center justify-between gap-4">
                    <span style={{ color: "var(--kr-text-muted)" }}>
                      Core Alert Destination
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
                  PILIH PRESET PROFIL PENGGUNAAN (1-KLIK)
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {(
                    [
                      {
                        id: "ROASTERY_CAFE" as IndustryPresetId,
                        title: "Roastery & Cafe",
                        sub: "CafeStock — Bahan Baku & Bar",
                      },
                      {
                        id: "GENERAL_WAREHOUSE" as IndustryPresetId,
                        title: "ERP Gudang Umum",
                        sub: "OpenSupply — Komoditas Logistik",
                      },
                      {
                        id: "IT_ASSET_TICKETING" as IndustryPresetId,
                        title: "IT Ticketing Desk",
                        sub: "osProcure — Tiket & Pengadaan Aset",
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
                    Judul Utama Aplikasi
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
                    Subjudul / Tagline Sistem
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
                    Nama Organisasi / Cabang
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
                    Sebutan Item (Terminologi)
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
                    Prefix Request (PR)
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
                    Prefix Order (PO)
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
                    Prefix Receipt (GR)
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

          {/* SECTION 3: MULTI-BAHASA & KAMUS KUSTOM (i18n STUDIO) */}
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
                  ADM-03 // MULTI-LANGUAGE &amp; CUSTOM TERMINOLOGY DICTIONARY
                </div>
                <h2 className="font-serif text-xl font-normal mt-0.5">
                  Paket Bahasa &amp; Editor Kamus Kustom
                </h2>
                <p
                  style={{ color: "var(--kr-text-muted)" }}
                  className="text-xs mt-1"
                >
                  Pilih bahasa utama sistem (Indonesia, Inggris, Jepang) atau
                  ubah istilah kalimat apa pun sesuai bahasa/kebiasaan
                  perusahaan Anda secara langsung.
                </p>
              </div>

              {/* Built-In Language Packs */}
              <div>
                <div
                  style={{ color: "var(--kr-text-muted)" }}
                  className="font-mono text-[10px] font-semibold uppercase tracking-widest mb-2.5"
                >
                  PILIH PAKET BAHASA BAWAAN (BUILT-IN LOCALES)
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {SUPPORTED_LOCALES.map((loc) => {
                    const isCurrent = locale === loc.code;
                    return (
                      <button
                        key={loc.code}
                        type="button"
                        onClick={() => setLocale(loc.code)}
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
                          <span className="font-mono text-xs font-bold">
                            [{loc.flagCode}] {loc.nativeName}
                          </span>
                          {isCurrent && (
                            <Check className="w-3.5 h-3.5 text-[#1D593B]" />
                          )}
                        </div>
                        <div
                          style={{ color: "var(--kr-text-muted)" }}
                          className="font-mono text-[10px] mt-1"
                        >
                          Locale Code: {loc.code} ({loc.name})
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom Dictionary Editor */}
              <div
                style={{ borderColor: "var(--kr-border)" }}
                className="pt-4 border-t space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="font-mono text-[10px] font-semibold uppercase tracking-widest block">
                      EDITOR KAMUS KUSTOM ({customOverrideCount} ISTILAH DIUBAH)
                    </span>
                    <span
                      style={{ color: "var(--kr-text-muted)" }}
                      className="text-[11px]"
                    >
                      Ketik terjemahan/istilah Anda sendiri pada kolom kanan
                      untuk menimpa teks bawaan secara instan.
                    </span>
                  </div>
                  {customOverrideCount > 0 && (
                    <button
                      type="button"
                      onClick={resetCustomTranslations}
                      className="font-mono text-[10px] underline cursor-pointer shrink-0"
                    >
                      Reset Kamus Kustom
                    </button>
                  )}
                </div>

                {/* Search Filter */}
                <div className="relative">
                  <Search
                    style={{ color: "var(--kr-text-muted)" }}
                    className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2"
                  />
                  <input
                    type="text"
                    value={dictFilter}
                    onChange={(e) => setDictFilter(e.target.value)}
                    placeholder="Cari kunci kamus atau teks (misal: dashboard, menu, login)..."
                    style={{
                      backgroundColor: "var(--kr-bg-main)",
                      borderColor: "var(--kr-border)",
                      color: "var(--kr-text-main)",
                    }}
                    className="w-full pl-9 pr-3 py-2 border font-mono text-xs focus:outline-none"
                  />
                </div>

                {/* Dictionary Table */}
                <div
                  style={{ borderColor: "var(--kr-border)" }}
                  className="border divide-y max-h-80 overflow-y-auto"
                >
                  {filteredDictItems.map((item) => {
                    const builtinText = BUILTIN_TRANSLATIONS[locale][item.key];
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
                            Bawaan ({locale.toUpperCase()}): {builtinText}
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

          {/* SECTION 4: KONEKSI DATABASE & SERVER NODE (DUAL-MODE ADAPTER) */}
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
                  Mode Penyimpanan Database (Lokal Tauri vs Server Bersama)
                </h2>
                <p
                  style={{ color: "var(--kr-text-muted)" }}
                  className="text-xs mt-1"
                >
                  Pilih <strong>Standalone Local</strong> jika aplikasi hanya
                  dipakai pada 1 komputer mandiri, atau{" "}
                  <strong>Remote Server Node</strong> agar banyak karyawan (HP{" "}
                  <code>.apk</code> &amp; PC <code>.exe</code>) terhubung ke
                  database yang sama.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => updateDbConnection({ mode: "LOCAL_EMBEDDED" })}
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
                      <span>1. Standalone Local (Embedded)</span>
                    </div>
                    {dbConnection.mode === "LOCAL_EMBEDDED" && (
                      <Check className="w-4 h-4 text-[#1D593B]" />
                    )}
                  </div>
                  <p
                    style={{ color: "var(--kr-text-muted)" }}
                    className="text-xs mt-2 leading-relaxed"
                  >
                    Berjalan 100% lokal di dalam Tauri tanpa server luar. Sangat
                    kencang (&lt;0.1 ms), cocok untuk 1 perangkat kasir/gudang
                    tunggal atau simulasi offline.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    updateDbConnection({ mode: "REMOTE_SERVER_NODE" })
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
                      <span>2. Shared Server Node (Multi-Device)</span>
                    </div>
                    {dbConnection.mode === "REMOTE_SERVER_NODE" && (
                      <Check className="w-4 h-4 text-[#1D593B]" />
                    )}
                  </div>
                  <p
                    style={{ color: "var(--kr-text-muted)" }}
                    className="text-xs mt-2 leading-relaxed"
                  >
                    Menyambungkan aplikasi <code>.exe</code> &amp;{" "}
                    <code>.apk</code> karyawan ke node server kantor
                    (ElysiaJS/PostgreSQL) agar tiket PR &amp; Approval
                    tersinkronisasi real-time.
                  </p>
                </button>
              </div>

              {dbConnection.mode === "REMOTE_SERVER_NODE" && (
                <div
                  style={{
                    backgroundColor: "var(--kr-bg-main)",
                    borderColor: "var(--kr-border)",
                  }}
                  className="p-4 border space-y-4"
                >
                  <div className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#1D593B]">
                    ● KONFIGURASI ENDPOINT SERVER BERSAMA
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-mono text-[10px] font-semibold uppercase tracking-widest mb-1.5">
                        URL Host Server / API Node
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
                        Token Otorisasi Instansi
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
                </div>
              )}
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
                            {plugin.name}
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
                          {isSelected ? "● ACTIVE" : "APPLY"}
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
                    LIVE HEX COLOR PICKER
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
                          {field.label}
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
                  {emailConfig.enabled ? "SMTP: ENABLED" : "SMTP: DISABLED"}
                </button>
              </div>

              {testSentBanner && (
                <div className="p-3 bg-[#E7F2EC] border border-[#B2D3C1] text-[#1D593B] font-mono text-xs">
                  ✓ Test notification dispatched to:{" "}
                  <strong>{emailConfig.coreAdminEmail}</strong>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-mono text-[10px] font-semibold uppercase tracking-widest mb-1.5">
                    Alamat Email Inti (Penerima Utama / Admin)
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
                    Email Grup Approver
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {(
                  [
                    {
                      key: "onPrSubmitted",
                      label: "Saat Tiket PR Baru Diajukan (SUBMITTED)",
                    },
                    {
                      key: "onPrApproved",
                      label: "Saat PR Disetujui Approver (APPROVED)",
                    },
                    {
                      key: "onPrRejected",
                      label: "Saat PR Ditolak Approver (REJECTED)",
                    },
                    {
                      key: "onPoOrdered",
                      label: "Saat PO Diterbitkan ke Pemasok (ORDERED)",
                    },
                    {
                      key: "onGrReceived",
                      label: "Saat Barang Masuk Diterima Gudang (GR)",
                    },
                    {
                      key: "onCriticalStock",
                      label: "Saat Saldo Stok Menyentuh Batas Kritis",
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

              <div
                style={{ borderColor: "var(--kr-border)" }}
                className="pt-4 border-t space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-mono text-[10px] font-semibold uppercase tracking-widest">
                    OUTBOX DISPATCH LOG ({emailLogs.length})
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
                      <span>Clear</span>
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
                      <span>Send Test Email</span>
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
                  <span>Arsitektur Modular yang Bersih bagi Programmer:</span>
                </div>
                <ul className="list-disc list-inside text-xs space-y-2 leading-relaxed">
                  <li>
                    <strong>Tambah Plugin / Modul Baru</strong>: Cukup daftarkan
                    objek manifest di{" "}
                    <code className="font-mono px-1.5 py-0.5 bg-black/10">
                      src/kernel/registry.ts
                    </code>
                    .
                  </li>
                  <li>
                    <strong>Tambah Bahasa / Kamus Baru</strong>: Cukup tambahkan
                    kode bahasa atau kunci kamus bertipe ketat di{" "}
                    <code className="font-mono px-1.5 py-0.5 bg-black/10">
                      src/kernel/i18n.ts
                    </code>
                    .
                  </li>
                  <li>
                    <strong>Tambah Tema Palet Baru</strong>: Cukup tambahkan
                    objek warna di{" "}
                    <code className="font-mono px-1.5 py-0.5 bg-black/10">
                      THEME_PALETTES
                    </code>{" "}
                    pada{" "}
                    <code className="font-mono">src/kernel/registry.ts</code>.
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
