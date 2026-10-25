import React, { useState } from "react";
import {
  Activity,
  Blocks,
  Building2,
  Check,
  Code2,
  Cpu,
  Database,
  Mail,
  Palette,
  RotateCcw,
  Send,
  ShieldAlert,
  Sliders,
  Trash2,
} from "lucide-react";
import { useKernel } from "@/kernel/KernelContext";
import { IndustryPresetId, ThemeColors } from "@/kernel/types";

type AdminSectionId =
  "status" | "identity" | "plugins" | "themes" | "mailer" | "dev-sdk";

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
    emailConfig,
    updateEmailConfig,
    toggleEmailTrigger,
    emailLogs,
    sendTestEmailNotification,
    clearEmailLogs,
    storageMetrics,
    resetKernelToDefaults,
  } = useKernel();

  const [activeSection, setActiveSection] = useState<AdminSectionId>("status");
  const [testSentBanner, setTestSentBanner] = useState<boolean>(false);

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
      label: "Status Kernel & Performa",
      icon: Activity,
      badge: "ONLINE",
    },
    {
      id: "identity",
      code: "ADM-02",
      label: "Identitas & Judul Aplikasi",
      icon: Building2,
    },
    {
      id: "plugins",
      code: "ADM-03",
      label: "Manajemen Plugin (Add-On)",
      icon: Blocks,
      badge: `${enabledPlugins.length}/${plugins.length}`,
    },
    {
      id: "themes",
      code: "ADM-04",
      label: "Palet Tema & Studio Warna",
      icon: Palette,
    },
    {
      id: "mailer",
      code: "ADM-05",
      label: "Email Inti & Notifikasi",
      icon: Mail,
      badge: emailConfig.enabled ? "SMTP ON" : "OFF",
    },
    {
      id: "dev-sdk",
      code: "ADM-06",
      label: "Arsitektur & Panduan Dev",
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

  return (
    <div className="space-y-6">
      {/* Top Site Administration Header (Gitea / osTicket Style) */}
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
            <span>SITE ADMINISTRATION // MICROKERNEL CONTROL PANEL</span>
            <span>•</span>
            <span>TAURI NATIVE ENGINE</span>
          </div>
          <h1
            style={{ color: "var(--kr-text-main)" }}
            className="font-serif text-2xl sm:text-3xl font-normal tracking-tight mt-1"
          >
            Panel Kontrol &amp; Konfigurasi Inti
          </h1>
          <p
            style={{ color: "var(--kr-text-muted)" }}
            className="text-xs sm:text-sm mt-1 max-w-2xl"
          >
            Pusat pengaturan mandiri ala Gitea &amp; osTicket: kelola judul
            instansi, aktifkan/nonaktifkan modul add-on, racik palet warna tema,
            dan atur pengiriman notifikasi ke email inti.
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
          title="Kembalikan seluruh konfigurasi kernel ke pengaturan awal"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Default Kernel</span>
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
            <span>MENU ADMINISTRASI SISTEM</span>
            <span>v2.0</span>
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
                  className="w-full px-4 py-3.5 text-left flex items-center justify-between transition border-l-4 cursor-pointer hover:opacity-90"
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
          {/* SECTION 1: STATUS KERNEL & PERFORMA TAURI */}
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
                <h2
                  style={{ color: "var(--kr-text-main)" }}
                  className="font-serif text-xl font-normal mt-0.5"
                >
                  Status Microkernel &amp; Kecepatan Penyimpanan Lokal
                </h2>
              </div>

              {/* 3 Telemetry Boxes */}
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
                    <span>LATENSI BACA / TULIS</span>
                  </div>
                  <div
                    style={{ color: "var(--kr-text-main)" }}
                    className="font-mono text-2xl font-bold mt-2"
                  >
                    {storageMetrics.avgReadLatencyMs} ms
                  </div>
                  <div className="font-mono text-[10px] text-[#1D593B] font-semibold mt-1">
                    Write: {storageMetrics.avgWriteLatencyMs} ms (Zero-Latency)
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
                    <span>MODUL ADD-ON AKTIF</span>
                  </div>
                  <div
                    style={{ color: "var(--kr-text-main)" }}
                    className="font-mono text-2xl font-bold mt-2"
                  >
                    {enabledPlugins.length} / {plugins.length}
                  </div>
                  <div
                    style={{ color: "var(--kr-text-muted)" }}
                    className="font-mono text-[10px] mt-1"
                  >
                    Terpasang di memori kernel
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
                    <span>MODE RUNTIME</span>
                  </div>
                  <div
                    style={{ color: "var(--kr-text-main)" }}
                    className="font-mono text-lg font-bold mt-2 truncate"
                  >
                    Tauri Native
                  </div>
                  <div
                    style={{ color: "var(--kr-text-muted)" }}
                    className="font-mono text-[10px] mt-1"
                  >
                    Tanpa ketergantungan API luar
                  </div>
                </div>
              </div>

              {/* System Configuration Table (Gitea Style) */}
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
                      Nama Instansi / Judul Aplikasi
                    </span>
                    <span className="font-bold">
                      {branding.appName} ({branding.orgName})
                    </span>
                  </div>
                  <div className="px-4 py-2.5 flex items-center justify-between gap-4">
                    <span style={{ color: "var(--kr-text-muted)" }}>
                      Engine Penyimpanan Lokal
                    </span>
                    <span>{storageMetrics.engineName}</span>
                  </div>
                  <div className="px-4 py-2.5 flex items-center justify-between gap-4">
                    <span style={{ color: "var(--kr-text-muted)" }}>
                      Palet Tema Aktif
                    </span>
                    <span className="uppercase">{activeThemeId}</span>
                  </div>
                  <div className="px-4 py-2.5 flex items-center justify-between gap-4">
                    <span style={{ color: "var(--kr-text-muted)" }}>
                      Email Inti Tujuan (osTicket Alert)
                    </span>
                    <span className="font-semibold">
                      {emailConfig.coreAdminEmail}
                    </span>
                  </div>
                  <div className="px-4 py-2.5 flex items-center justify-between gap-4">
                    <span style={{ color: "var(--kr-text-muted)" }}>
                      Format Penomoran Dokumen
                    </span>
                    <span>
                      {branding.documentPrefixPR}-2026 /{" "}
                      {branding.documentPrefixPO}-2026 /{" "}
                      {branding.documentPrefixGR}-2026
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
                <h2
                  style={{ color: "var(--kr-text-main)" }}
                  className="font-serif text-xl font-normal mt-0.5"
                >
                  Pengaturan Judul Aplikasi, Organisasi &amp; Preset Industri
                </h2>
                <p
                  style={{ color: "var(--kr-text-muted)" }}
                  className="text-xs mt-1"
                >
                  Ubah aplikasi ini menjadi sistem Roastery Cafe, Gudang
                  Logistik Umum, atau Sistem Tiket Permintaan Aset IT (ala
                  osTicket) hanya dengan sekali klik.
                </p>
              </div>

              {/* 1-Click Industry Presets */}
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

              {/* Custom Input Fields */}
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

              {/* Document Prefixes */}
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

          {/* SECTION 3: MANAJEMEN PLUGIN & ADD-ON (ODOO / MICROKERNEL STYLE) */}
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
                  ADM-03 // MODULAR PLUGIN REGISTRY (ODOO STYLE)
                </div>
                <h2
                  style={{ color: "var(--kr-text-main)" }}
                  className="font-serif text-xl font-normal mt-0.5"
                >
                  Daftar Modul &amp; Add-On Terpasang
                </h2>
                <p
                  style={{ color: "var(--kr-text-muted)" }}
                  className="text-xs mt-1"
                >
                  Aktifkan atau nonaktifkan fitur secara modular. Ketika modul
                  dinonaktifkan, menu navigasi akan langsung menyesuaikan secara
                  real-time tanpa perlu restart.
                </p>
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
                              KERNEL INTI
                            </span>
                          )}
                        </div>
                        <p
                          style={{ color: "var(--kr-text-muted)" }}
                          className="text-xs leading-relaxed"
                        >
                          {plugin.description}
                        </p>
                        <div className="flex flex-wrap items-center gap-1.5 pt-1">
                          {plugin.hooks.map((hook) => (
                            <span
                              key={hook}
                              style={{
                                borderColor: "var(--kr-border)",
                                color: "var(--kr-text-muted)",
                              }}
                              className="font-mono text-[9px] px-1.5 py-0.5 border"
                            >
                              hook: {hook}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="shrink-0 flex items-center gap-2">
                        <button
                          type="button"
                          disabled={plugin.isCore}
                          onClick={() => togglePlugin(plugin.id)}
                          className={`px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-wider border transition ${
                            plugin.isCore
                              ? "opacity-50 cursor-not-allowed bg-[#E5DEC9] text-[#5E4F42] border-[#CFC5B5]"
                              : enabled
                                ? "bg-[#E7F2EC] text-[#1D593B] border-[#B2D3C1] hover:bg-[#D5E9DF] cursor-pointer"
                                : "bg-[#FCEAE8] text-[#9E2A20] border-[#E6B8B3] hover:bg-[#F8D8D4] cursor-pointer"
                          }`}
                        >
                          {plugin.isCore
                            ? "TERKUNCI (INTI)"
                            : enabled
                              ? "AKTIF (KLIK UNTUK LEPAS)"
                              : "NONAKTIF (PASANG)"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* SECTION 4: PALET TEMA & STUDIO WARNA */}
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
                  ADM-04 // THEME ENGINE &amp; COLOR PALETTE STUDIO
                </div>
                <h2
                  style={{ color: "var(--kr-text-main)" }}
                  className="font-serif text-xl font-normal mt-0.5"
                >
                  Pilih Preset Palet atau Racik Warna Sendiri
                </h2>
                <p
                  style={{ color: "var(--kr-text-muted)" }}
                  className="text-xs mt-1"
                >
                  Seluruh warna diinjeksi melalui CSS Custom Properties pada
                  level kernel sehingga pergantian tema berlangsung dalam 0
                  milidetik.
                </p>
              </div>

              {/* Curated Theme Presets */}
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

                      {/* Color Swatch Strip */}
                      <div className="flex items-center gap-1.5 mt-3 pt-2.5 border-t border-[#DFD6C7]/50">
                        <span
                          style={{ backgroundColor: theme.colors.bgSidebar }}
                          className="w-5 h-5 border border-black/20"
                          title="Sidebar"
                        />
                        <span
                          style={{ backgroundColor: theme.colors.bgMain }}
                          className="w-5 h-5 border border-black/20"
                          title="Workspace"
                        />
                        <span
                          style={{ backgroundColor: theme.colors.bgSurface }}
                          className="w-5 h-5 border border-black/20"
                          title="Surface"
                        />
                        <span
                          style={{ backgroundColor: theme.colors.accent }}
                          className="w-5 h-5 border border-black/20"
                          title="Accent"
                        />
                        <span className="ml-auto font-mono text-[10px] font-semibold">
                          {isSelected ? "● DIGUNAKAN" : "TERAPKAN"}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Fine-Grained Color Customizer */}
              <div
                style={{ borderColor: "var(--kr-border)" }}
                className="pt-4 border-t"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-[10px] font-semibold uppercase tracking-widest">
                    KUSTOMISASI TOKEN WARNA MANUAL (LIVE HEX PICKER)
                  </span>
                  <button
                    type="button"
                    onClick={resetCustomColors}
                    className="font-mono text-[10px] underline cursor-pointer"
                  >
                    Reset Warna Manual
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

          {/* SECTION 5: EMAIL INTI & NOTIFIKASI (OSTICKET STYLE) */}
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
                    ADM-05 // OSTICKET-STYLE EMAIL DISPATCHER &amp; HOOKS
                  </div>
                  <h2
                    style={{ color: "var(--kr-text-main)" }}
                    className="font-serif text-xl font-normal mt-0.5"
                  >
                    Pengaturan Email Inti &amp; Pemicu Notifikasi
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
                    ? "GATEWAY EMAIL: AKTIF"
                    : "GATEWAY EMAIL: NONAKTIF"}
                </button>
              </div>

              {testSentBanner && (
                <div className="p-3 bg-[#E7F2EC] border border-[#B2D3C1] text-[#1D593B] font-mono text-xs flex items-center justify-between">
                  <span>
                    ✓ Paket uji notifikasi berhasil dikirim ke Email Inti:{" "}
                    <strong>{emailConfig.coreAdminEmail}</strong>
                  </span>
                </div>
              )}

              {/* Core Recipient & SMTP Settings */}
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
                    Email Meja Approver / Manajer
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

                <div>
                  <label className="block font-mono text-[10px] font-semibold uppercase tracking-widest mb-1.5">
                    SMTP Relay Host &amp; Port
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={emailConfig.smtpHost}
                      onChange={(e) =>
                        updateEmailConfig({ smtpHost: e.target.value })
                      }
                      style={{
                        backgroundColor: "var(--kr-bg-main)",
                        borderColor: "var(--kr-border)",
                        color: "var(--kr-text-main)",
                      }}
                      className="flex-1 px-3 py-2 border font-mono text-xs focus:outline-none"
                    />
                    <input
                      type="number"
                      value={emailConfig.smtpPort}
                      onChange={(e) =>
                        updateEmailConfig({
                          smtpPort: Number(e.target.value) || 587,
                        })
                      }
                      style={{
                        backgroundColor: "var(--kr-bg-main)",
                        borderColor: "var(--kr-border)",
                        color: "var(--kr-text-main)",
                      }}
                      className="w-20 px-2.5 py-2 border font-mono text-xs focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-mono text-[10px] font-semibold uppercase tracking-widest mb-1.5">
                    Tag Prefix Subjek Email
                  </label>
                  <input
                    type="text"
                    value={emailConfig.subjectPrefix}
                    onChange={(e) =>
                      updateEmailConfig({ subjectPrefix: e.target.value })
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

              {/* Event Trigger Checkboxes */}
              <div>
                <div
                  style={{ color: "var(--kr-text-muted)" }}
                  className="font-mono text-[10px] font-semibold uppercase tracking-widest mb-2.5"
                >
                  ATURAN PEMICU NOTIFIKASI OTOMATIS KE EMAIL INTI
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
              </div>

              {/* Test Dispatch & Outbox Log */}
              <div
                style={{ borderColor: "var(--kr-border)" }}
                className="pt-4 border-t space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-mono text-[10px] font-semibold uppercase tracking-widest">
                    LOG OUTBOX NOTIFIKASI EMAIL ({emailLogs.length})
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={clearEmailLogs}
                      style={{
                        borderColor: "var(--kr-border)",
                        color: "var(--kr-text-muted)",
                      }}
                      className="px-2.5 py-1.5 border font-mono text-[10px] uppercase hover:opacity-80 flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Bersihkan Log</span>
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
                      <span>Kirim Uji Email ke Inti</span>
                    </button>
                  </div>
                </div>

                <div
                  style={{ borderColor: "var(--kr-border)" }}
                  className="border divide-y max-h-56 overflow-y-auto"
                >
                  {emailLogs.length === 0 ? (
                    <div
                      style={{ color: "var(--kr-text-muted)" }}
                      className="p-4 text-center font-mono text-xs"
                    >
                      Belum ada riwayat pengiriman email.
                    </div>
                  ) : (
                    emailLogs.map((log) => (
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
                            Tujuan: {log.recipient} • Hook: {log.eventHook} •{" "}
                            {log.timestamp}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0 font-mono text-[10px]">
                          <span style={{ color: "var(--kr-text-muted)" }}>
                            {log.latencyMs} ms
                          </span>
                          <span className="px-1.5 py-0.5 bg-[#E7F2EC] text-[#1D593B] border border-[#B2D3C1] font-bold">
                            {log.status}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* SECTION 6: PANDUAN KUSTOMISASI DEVELOPER (SDK) */}
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
                  ADM-06 // EXTENSIBLE DEVELOPER ARCHITECTURE
                </div>
                <h2
                  style={{ color: "var(--kr-text-main)" }}
                  className="font-serif text-xl font-normal mt-0.5"
                >
                  Panduan Menambah Fitur / Plugin Baru bagi Programmer
                </h2>
                <p
                  style={{ color: "var(--kr-text-muted)" }}
                  className="text-xs mt-1"
                >
                  Kode aplikasi ini dirancang dengan pola Microkernel Registry
                  agar programmer tidak perlu mengacak-acak komponen Sidebar
                  atau Header saat menambah fitur baru.
                </p>
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
                  <span>3 Langkah Menambah Modul Baru:</span>
                </div>
                <ol className="list-decimal list-inside text-xs space-y-2 leading-relaxed">
                  <li>
                    Buka berkas{" "}
                    <code className="font-mono px-1.5 py-0.5 bg-black/10">
                      src/kernel/registry.ts
                    </code>{" "}
                    — seluruh daftar plugin, palet tema, dan preset industri
                    terpusat di satu tempat.
                  </li>
                  <li>
                    Tambahkan objek kontrak{" "}
                    <code className="font-mono px-1.5 py-0.5 bg-black/10">
                      KernelPluginManifest
                    </code>{" "}
                    ke dalam array{" "}
                    <code className="font-mono">KERNEL_PLUGINS</code>.
                  </li>
                  <li>
                    Hubungkan komponen tampilan Anda di{" "}
                    <code className="font-mono px-1.5 py-0.5 bg-black/10">
                      src/App.tsx
                    </code>
                    . Sidebar, Mobile Drawer, Breadcrumb, dan Panel Kontrol ini
                    akan otomatis mengenali plugin tersebut.
                  </li>
                </ol>
              </div>

              <div>
                <div
                  style={{ color: "var(--kr-text-muted)" }}
                  className="font-mono text-[10px] font-semibold uppercase tracking-widest mb-2"
                >
                  CONTOH KONTRAK PLUGIN (TYPESCRIPT)
                </div>
                <pre className="p-4 bg-[#140F0C] text-[#EBE4DA] font-mono text-[11px] overflow-x-auto leading-relaxed border border-[#332720]">
                  {`// Di dalam src/kernel/registry.ts:
{
  id: "custom-ticketing",
  code: "08",
  name: "Meja Tiket Keluhan",
  sectionLabel: "Ekstensi",
  category: "SYSTEM_EXTENSION",
  version: "1.0.0",
  author: "Tim Developer Internal",
  description: "Modul tambahan untuk menangani tiket operasional cabang.",
  isCore: false,
  defaultEnabled: true,
  hooks: ["mailer:onTicketCreated"],
}`}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
