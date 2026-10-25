import React from "react";
import { Coffee, Menu, X, ArrowRightLeft, Sliders, Globe } from "lucide-react";
import { NavigationTab } from "@/types";
import { useAuth } from "@/context/AuthContext";
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
  const { currentUser, switchRole } = useAuth();
  const { plugins, branding, locale, availableLocales, setLocale, t } =
    useKernel();

  const currentPlugin = plugins.find((p) => p.id === activeTab);
  const titleText = currentPlugin
    ? `${currentPlugin.code} // ${t(PLUGIN_NAME_KEY_MAP[activeTab])}`
    : branding.appName;

  const toggleRole = (): void => {
    const nextRole = currentUser.role === "USER" ? "APPROVER" : "USER";
    switchRole(nextRole);
  };

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
        {/* Compact Scalable Language Dropdown for Mobile (Supports Unlimited Languages) */}
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
            className="font-mono text-[10px] font-bold uppercase focus:outline-none cursor-pointer max-w-[56px]"
          >
            {availableLocales.map((loc) => (
              <option key={loc.code} value={loc.code}>
                {loc.flagCode} — {loc.nativeName}
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

        <button
          onClick={toggleRole}
          type="button"
          className={`flex items-center gap-1 px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-wider border transition whitespace-nowrap ${
            currentUser.role === "APPROVER"
              ? "bg-[#3B2616] text-[#F0C18C] border-[#6E472A]"
              : "bg-[#1B2C3B] text-[#9AC7EE] border-[#2F4E68]"
          }`}
          title={t("common.switchRole")}
        >
          <ArrowRightLeft className="w-2.5 h-2.5 shrink-0" />
          <span>{currentUser.role}</span>
        </button>
      </div>
    </header>
  );
};
