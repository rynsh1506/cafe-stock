import React, { useState } from "react";
import { NavigationTab } from "@/types";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { KernelProvider } from "@/kernel/KernelContext";
import { StoreProvider } from "@/context/StoreContext";
import { AppLayout } from "@/components/layout/AppLayout";
import { LoginPage } from "@/components/auth/LoginPage";
import { DashboardTab } from "@/components/dashboard/DashboardTab";
import { ProductsTab } from "@/components/products/ProductsTab";
import { PurchaseRequestsTab } from "@/components/purchase-requests/PurchaseRequestsTab";
import { PurchaseOrdersTab } from "@/components/purchase-orders/PurchaseOrdersTab";
import { GoodsReceiptsTab } from "@/components/goods-receipts/GoodsReceiptsTab";
import { InventoryTab } from "@/components/inventory/InventoryTab";
import { AuditLogsTab } from "@/components/audit-logs/AuditLogsTab";
import { ControlPanelTab } from "@/components/control-panel/ControlPanelTab";

const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NavigationTab>("dashboard");
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  const renderContent = (): React.ReactNode => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardTab onNavigate={setActiveTab} />;
      case "products":
        return <ProductsTab />;
      case "purchase-requests":
        return <PurchaseRequestsTab onNavigate={setActiveTab} />;
      case "purchase-orders":
        return <PurchaseOrdersTab onNavigate={setActiveTab} />;
      case "goods-receipts":
        return <GoodsReceiptsTab onNavigate={setActiveTab} />;
      case "inventory":
        return <InventoryTab />;
      case "audit-logs":
        return <AuditLogsTab />;
      case "control-panel":
        return <ControlPanelTab />;
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
        <StoreProvider>
          <AppContent />
        </StoreProvider>
      </AuthProvider>
    </KernelProvider>
  );
}
