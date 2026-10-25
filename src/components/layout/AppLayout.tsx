import React, { useState } from "react";
import { NavigationTab } from "@/types";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileHeader } from "@/components/layout/MobileHeader";
import { Globe, Search, Sliders } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useKernel } from "@/kernel/KernelContext";
import { SUPPORTED_LOCALES, TranslationKey } from "@/kernel/i18n";

interface AppLayoutProps {
  activeTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  children: React.ReactNode;
}

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

export const AppLayout: React.FC<AppLayoutProps> = ({
  activeTab,
  onSelectTab,
  children,
}) => {
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState<boolean>(false);
  const { currentUser } = useAuth();
  const { plugins, branding, locale, setLocale, t } = useKernel();

  const currentPlugin = plugins.find((p) => p.id === activeTab);
  const crumb = currentPlugin
    ? {
        code: `MOD-${currentPlugin.code}`,
        section: branding.appName,
        title: t(PLUGIN_NAME_KEY_MAP[activeTab]),
      }
    : {
        code: "MOD-00",
        section: branding.appName,
        title: branding.appSubtitle,
      };

  return (
    <div
      style={{
        backgroundColor: "var(--kr-bg-main)",
        color: "var(--kr-text-main)",
      }}
      className="flex h-screen w-full overflow-hidden transition-colors duration-150"
    >
      {/* Desktop Sidebar */}
      <div className="hidden md:flex h-full shrink-0">
        <Sidebar activeTab={activeTab} onSelectTab={onSelectTab} />
      </div>

      {/* Mobile Drawer (Modal Overlay) */}
      {isMobileDrawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileDrawerOpen(false)}
            aria-hidden="true"
          />
          <div className="relative w-72 max-w-[85vw] h-full shadow-2xl z-10 flex flex-col">
            <Sidebar
              activeTab={activeTab}
              onSelectTab={onSelectTab}
              onCloseMobile={() => setIsMobileDrawerOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Main Layout Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0">
        {/* Mobile Header */}
        <MobileHeader
          activeTab={activeTab}
          isDrawerOpen={isMobileDrawerOpen}
          onToggleDrawer={() => setIsMobileDrawerOpen(!isMobileDrawerOpen)}
          onSelectTab={onSelectTab}
        />

        {/* Desktop Top Ledger Header Bar */}
        <header
          style={{
            backgroundColor: "var(--kr-bg-surface)",
            borderColor: "var(--kr-border)",
          }}
          className="hidden md:flex items-center justify-between px-8 py-3 border-b shrink-0 transition-colors duration-150"
        >
          {/* Breadcrumb & Document Index */}
          <div className="flex items-center gap-3 text-xs">
            <span
              style={{
                backgroundColor: "var(--kr-bg-elevated)",
                borderColor: "var(--kr-border)",
                color: "var(--kr-text-main)",
              }}
              className="font-mono text-[10px] font-semibold px-1.5 py-0.5 border"
            >
              {crumb.code}
            </span>
            <span
              style={{ color: "var(--kr-text-muted)" }}
              className="font-mono text-[11px] uppercase tracking-wider"
            >
              {crumb.section}
            </span>
            <span style={{ color: "var(--kr-text-muted)" }}>/</span>
            <span className="font-semibold">{crumb.title}</span>
          </div>

          {/* Right Header Utilities */}
          <div className="flex items-center gap-3.5">
            {/* Quick Search */}
            <div className="relative">
              <Search
                style={{ color: "var(--kr-text-muted)" }}
                className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2"
              />
              <input
                type="text"
                placeholder={t("common.searchPlaceholder")}
                style={{
                  backgroundColor: "var(--kr-bg-main)",
                  borderColor: "var(--kr-border)",
                  color: "var(--kr-text-main)",
                }}
                className="pl-8 pr-3 py-1 font-mono text-xs border w-48 focus:w-60 transition-all focus:outline-none"
              />
            </div>

            {/* Instant Multi-Language Switcher (ID | EN | JA) */}
            <div
              style={{
                backgroundColor: "var(--kr-bg-main)",
                borderColor: "var(--kr-border)",
              }}
              className="flex items-center border p-0.5"
              title={t("common.language")}
            >
              <Globe
                style={{ color: "var(--kr-text-muted)" }}
                className="w-3 h-3 mx-1.5"
              />
              {SUPPORTED_LOCALES.map((loc) => {
                const isCurrent = locale === loc.code;
                return (
                  <button
                    key={loc.code}
                    type="button"
                    onClick={() => setLocale(loc.code)}
                    style={{
                      backgroundColor: isCurrent
                        ? "var(--kr-bg-sidebar)"
                        : "transparent",
                      color: isCurrent
                        ? "var(--kr-text-sidebar)"
                        : "var(--kr-text-muted)",
                    }}
                    className="px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase transition cursor-pointer"
                  >
                    {loc.flagCode}
                  </button>
                );
              })}
            </div>

            {/* Gitea-style Site Administration Shortcut */}
            <button
              onClick={() => onSelectTab("control-panel")}
              type="button"
              style={{
                backgroundColor:
                  activeTab === "control-panel"
                    ? "var(--kr-bg-sidebar)"
                    : "var(--kr-bg-elevated)",
                color:
                  activeTab === "control-panel"
                    ? "var(--kr-text-sidebar)"
                    : "var(--kr-text-main)",
                borderColor: "var(--kr-border)",
              }}
              className="px-2.5 py-1 border font-mono text-[10px] font-semibold uppercase tracking-wider flex items-center gap-1.5 transition cursor-pointer hover:opacity-90"
            >
              <Sliders className="w-3 h-3" />
              <span>{t("common.controlPanel")}</span>
            </button>

            {/* Active Staff Stamp */}
            <div
              style={{ borderColor: "var(--kr-border)" }}
              className="flex items-center gap-3 pl-3.5 border-l"
            >
              <div className="text-right">
                <div className="text-xs font-semibold leading-none">
                  {currentUser.name}
                </div>
                <div
                  style={{ color: "var(--kr-text-muted)" }}
                  className="font-mono text-[10px] uppercase tracking-wider mt-1"
                >
                  {currentUser.role}
                </div>
              </div>
              <div
                style={{
                  backgroundColor: "var(--kr-bg-sidebar)",
                  color: "var(--kr-text-sidebar)",
                }}
                className="w-7 h-7 flex items-center justify-center font-mono font-bold text-[11px]"
              >
                {currentUser.name
                  .split(" ")
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join("")}
              </div>
            </div>
          </div>
        </header>

        {/* Content Outlet */}
        <main
          style={{ backgroundColor: "var(--kr-bg-main)" }}
          className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 transition-colors duration-150"
        >
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
};
