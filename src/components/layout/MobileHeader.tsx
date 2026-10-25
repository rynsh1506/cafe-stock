import React from "react";
import { Coffee, Menu, X, Sliders, Globe } from "lucide-react";
import { NavigationTab } from "@/types";
import { useKernel } from "@/kernel/KernelContext";
import { TranslationKey } from "@/kernel/i18n";

interface MobileHeaderProps {
  activeTab: NavigationTab;
  isDrawerOpen: boolean;
  onToggleDrawer: () => void;
  onSelectTab: (tab: NavigationTab) => void;
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

export const MobileHeader: React.FC<MobileHeaderProps> = ({
  activeTab,
  isDrawerOpen,
  onToggleDrawer,
  onSelectTab,
}) => {
  const { plugins, branding, locale, availableLocales, setLocale, t } =
    useKernel();

  const currentPlugin = plugins.find((p) => p.id === activeTab);
  const titleText = currentPlugin
    ? `${currentPlugin.code} // ${t(PLUGIN_NAME_KEY_MAP[activeTab])}`
    : branding.appName;

  return (
    <header
      style={{
        backgroundColor: "var(--kr-bg-sidebar)",
        color: "var(--kr-text-sidebar)",
        borderColor: "var(--kr-border-sidebar)",
      }}
      className="md:hidden sticky top-0 z-40 border-b px-3 py-2.5 flex items-center justify-between gap-2"
    >
      <div className="flex items-center gap-2 min-w-0">
        <button
          onClick={onToggleDrawer}
          type="button"
          style={{ color: "var(--kr-accent)" }}
          className="p-1.5 -ml-1 transition shrink-0"
          aria-label="Open Navigation"
        >
          {isDrawerOpen ? (
            <X className="w-5 h-5" />
          ) : (
            <Menu className="w-5 h-5" />
          )}
        </button>
        <div className="flex items-center gap-2 min-w-0">
          <div
            style={{
              backgroundColor: "var(--kr-bg-sidebar-header)",
              borderColor: "var(--kr-border-sidebar)",
              color: "var(--kr-accent)",
            }}
            className="w-7 h-7 border flex items-center justify-center shrink-0"
          >
            <Coffee className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0">
            <div className="font-mono font-semibold text-xs leading-tight truncate">
              {titleText}
            </div>
            <div className="font-mono text-[9px] uppercase tracking-widest opacity-65 leading-none mt-0.5 truncate">
              {branding.appName}
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        {/* Compact Language Code Dropdown for Mobile (Code Only) */}
        <div
          style={{
            backgroundColor: "var(--kr-bg-sidebar-header)",
            borderColor: "var(--kr-border-sidebar)",
          }}
          className="flex items-center border px-1.5 py-1"
        >
          <Globe className="w-3 h-3 mr-1 opacity-75 shrink-0" />
          <select
            value={locale}
            onChange={(e) => setLocale(e.target.value)}
            aria-label={t("common.language")}
            style={{
              backgroundColor: "var(--kr-bg-sidebar-header)",
              color: "var(--kr-text-sidebar)",
            }}
            className="font-mono text-[10px] font-bold uppercase focus:outline-none cursor-pointer"
          >
            {availableLocales.map((loc) => (
              <option key={loc.code} value={loc.code}>
                {loc.code.toUpperCase()}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={() => onSelectTab("control-panel")}
          type="button"
          style={{
            borderColor: "var(--kr-border-sidebar)",
            color:
              activeTab === "control-panel" ? "var(--kr-accent)" : undefined,
          }}
          className="p-1.5 border transition"
          title={t("common.controlPanel")}
        >
          <Sliders className="w-3.5 h-3.5" />
        </button>
      </div>
    </header>
  );
};
