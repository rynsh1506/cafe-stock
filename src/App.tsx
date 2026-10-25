import React, { useState } from "react";
import { NavigationTab } from "@/types";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { KernelProvider, useKernel } from "@/kernel/KernelContext";
import { AppLayout } from "@/components/layout/AppLayout";
import { LoginPage } from "@/components/auth/LoginPage";
import { DashboardTab } from "@/components/dashboard/DashboardTab";
import { ControlPanelTab } from "@/components/control-panel/ControlPanelTab";
import {
  Boxes,
  Package,
  FileText,
  ShoppingCart,
  Truck,
  ShieldCheck,
} from "lucide-react";

const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NavigationTab>("dashboard");
  const { isAuthenticated } = useAuth();
  const { branding, t } = useKernel();

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  const renderLedgerPlaceholder = (
    code: string,
    title: string,
    description: string,
    IconComponent: React.ElementType,
  ): React.ReactNode => (
    <div
      style={{
        backgroundColor: "var(--kr-bg-surface)",
        borderColor: "var(--kr-border)",
      }}
      className="border p-8 sm:p-12"
    >
      <div className="max-w-lg">
        <div
          style={{ color: "var(--kr-text-muted)" }}
          className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest mb-3"
        >
          <IconComponent
            style={{ color: "var(--kr-accent)" }}
            className="w-3.5 h-3.5"
          />
          <span>{code}</span>
        </div>
        <h2 className="font-serif text-2xl font-normal">{title}</h2>
        <p
          style={{ color: "var(--kr-text-muted)" }}
          className="text-xs sm:text-sm mt-2 leading-relaxed"
        >
          {description}
        </p>
      </div>
    </div>
  );

  const renderContent = (): React.ReactNode => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardTab onNavigate={setActiveTab} />;
      case "control-panel":
        return <ControlPanelTab />;
      case "products":
        return renderLedgerPlaceholder(
          "MOD-02 // MASTER",
          t("plugin.products.name"),
          t("mod.products.desc"),
          Package,
        );
      case "purchase-requests":
        return renderLedgerPlaceholder(
          `MOD-03 // ${branding.documentPrefixPR}`,
          `${t("plugin.purchaseRequests.name")} (${branding.documentPrefixPR})`,
          t("mod.pr.desc"),
          FileText,
        );
      case "purchase-orders":
        return renderLedgerPlaceholder(
          `MOD-04 // ${branding.documentPrefixPO}`,
          `${t("plugin.purchaseOrders.name")} (${branding.documentPrefixPO})`,
          t("mod.po.desc"),
          ShoppingCart,
        );
      case "goods-receipts":
        return renderLedgerPlaceholder(
          `MOD-05 // ${branding.documentPrefixGR}`,
          `${t("plugin.goodsReceipts.name")} (${branding.documentPrefixGR})`,
          t("mod.gr.desc"),
          Truck,
        );
      case "inventory":
        return renderLedgerPlaceholder(
          "MOD-06 // LEDGER",
          t("plugin.inventory.name"),
          t("mod.inventory.desc"),
          Boxes,
        );
      case "audit-logs":
        return renderLedgerPlaceholder(
          "MOD-07 // AUDIT",
          t("plugin.auditLogs.name"),
          t("mod.audit.desc"),
          ShieldCheck,
        );
      default:
        return <DashboardTab onNavigate={setActiveTab} />;
    }
  };

  return (
    <AppLayout activeTab={activeTab} onSelectTab={setActiveTab}>
      {renderContent()}
    </AppLayout>
  );
};

export default function App() {
  return (
    <KernelProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </KernelProvider>
  );
}
