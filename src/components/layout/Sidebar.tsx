import React from "react";
import {
  Coffee,
  LayoutDashboard,
  Package,
  FileText,
  ShoppingCart,
  Truck,
  Boxes,
  ShieldCheck,
  Sliders,
  LogOut,
} from "lucide-react";
import { NavigationTab } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { useKernel } from "@/kernel/KernelContext";
import { PluginCategory } from "@/kernel/types";
import { TranslationKey } from "@/kernel/i18n";

interface SidebarProps {
  activeTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  onCloseMobile?: () => void;
}

const PLUGIN_ICON_MAP: Record<NavigationTab, React.ElementType> = {
  dashboard: LayoutDashboard,
  products: Package,
  "purchase-requests": FileText,
  "purchase-orders": ShoppingCart,
  "goods-receipts": Truck,
  inventory: Boxes,
  "audit-logs": ShieldCheck,
  "control-panel": Sliders,
};

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

const CATEGORY_TITLES: { key: PluginCategory; labelKey: TranslationKey }[] = [
  { key: "CORE_OVERVIEW", labelKey: "nav.cat.overview" },
  { key: "PROCUREMENT_FLOW", labelKey: "nav.cat.procurement" },
  { key: "WAREHOUSE_AUDIT", labelKey: "nav.cat.warehouse" },
  { key: "SYSTEM_EXTENSION", labelKey: "nav.cat.system" },
];

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  onCloseMobile,
}) => {
  const { currentUser, logout } = useAuth();
  const { enabledPlugins, branding, t } = useKernel();

  const handleTabClick = (tab: NavigationTab): void => {
    onSelectTab(tab);
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  return (
    <aside
      style={{
        backgroundColor: "var(--kr-bg-sidebar)",
        color: "var(--kr-text-sidebar)",
        borderColor: "var(--kr-border-sidebar)",
      }}
      className="w-full md:w-64 flex flex-col h-full border-r select-none transition-colors duration-150"
    >
      {/* Dynamic White-Label Brand Stamp Header */}
      <div
        style={{ borderColor: "var(--kr-border-sidebar)" }}
        className="px-5 py-4 border-b flex items-center justify-between"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div
            style={{
              backgroundColor: "var(--kr-bg-sidebar-header)",
              borderColor: "var(--kr-border-sidebar)",
              color: "var(--kr-accent)",
            }}
            className="w-9 h-9 border flex items-center justify-center shrink-0"
          >
            <Coffee className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="font-serif font-semibold text-lg tracking-tight flex items-center gap-2 leading-none truncate">
              <span className="truncate">{branding.appName}</span>
              <span
                style={{
                  backgroundColor: "var(--kr-bg-sidebar-header)",
                  borderColor: "var(--kr-border-sidebar)",
                  color: "var(--kr-accent)",
                }}
                className="font-mono text-[9px] font-medium uppercase px-1.5 py-0.5 border shrink-0"
              >
                KERNEL
              </span>
            </div>
            <div className="font-mono text-[10px] uppercase tracking-widest opacity-65 mt-1 truncate">
              {branding.appSubtitle}
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Plugin-Driven Navigation Rail */}
      <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto">
        {CATEGORY_TITLES.map((cat) => {
          const groupItems = enabledPlugins.filter(
            (p) => p.category === cat.key,
          );
          if (groupItems.length === 0) {
            return null;
          }
          return (
            <div key={cat.key}>
              <div className="px-2.5 pb-1.5 font-mono text-[9px] font-semibold uppercase tracking-[0.16em] opacity-55">
                {t(cat.labelKey)}
              </div>
              <div className="space-y-0.5">
                {groupItems.map((item) => {
                  const Icon = PLUGIN_ICON_MAP[item.id] ?? Package;
                  const isActive = activeTab === item.id;
                  const translatedName = t(
                    PLUGIN_NAME_KEY_MAP[item.id] ?? "plugin.dashboard.name",
                  );
                  const badge =
                    item.id === "purchase-requests" &&
                    currentUser.role === "APPROVER"
                      ? "1 REVIEW"
                      : undefined;

                  return (
                    <button
                      key={item.id}
                      onClick={() => handleTabClick(item.id)}
                      type="button"
                      style={{
                        backgroundColor: isActive
                          ? "var(--kr-bg-sidebar-header)"
                          : "transparent",
                        borderLeftColor: isActive
                          ? "var(--kr-accent)"
                          : "transparent",
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-2 text-xs transition cursor-pointer border-l-2 ${
                        isActive
                          ? "font-semibold opacity-100"
                          : "opacity-75 hover:opacity-100"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span
                          style={{
                            color: isActive ? "var(--kr-accent)" : undefined,
                          }}
                          className="font-mono text-[10px] opacity-75"
                        >
                          {item.code}
                        </span>
                        <Icon
                          style={{
                            color: isActive ? "var(--kr-accent)" : undefined,
                          }}
                          className="w-3.5 h-3.5 shrink-0"
                        />
                        <span className="truncate">{translatedName}</span>
                      </div>
                      {badge && (
                        <span className="font-mono text-[9px] font-bold px-1.5 py-0.5 bg-[#7C2D23] text-[#FCE8E6] border border-[#A64236] shrink-0">
                          {badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      {/* Petugas Footer */}
      <div
        style={{
          backgroundColor: "var(--kr-bg-sidebar-header)",
          borderColor: "var(--kr-border-sidebar)",
        }}
        className="p-4 border-t"
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              style={{
                borderColor: "var(--kr-border-sidebar)",
                color: "var(--kr-accent)",
              }}
              className="w-8 h-8 border flex items-center justify-center font-mono font-bold text-xs shrink-0"
            >
              {currentUser.name
                .split(" ")
                .map((n) => n[0])
                .slice(0, 2)
                .join("")}
            </div>
            <div className="truncate">
              <div className="text-xs font-semibold truncate">
                {currentUser.name}
              </div>
              <div className="font-mono text-[10px] opacity-65 truncate">
                {currentUser.username}
              </div>
            </div>
          </div>
          <button
            onClick={logout}
            type="button"
            className="p-1.5 opacity-70 hover:opacity-100 hover:text-[#E57373] transition cursor-pointer shrink-0"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
