import React, { useState } from "react";
import { NavigationTab } from "@/types";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileHeader } from "@/components/layout/MobileHeader";
import { Bell, Search } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface AppLayoutProps {
  activeTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  activeTab,
  onSelectTab,
  children,
}) => {
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState<boolean>(false);
  const { currentUser } = useAuth();

  const getBreadcrumbs = (): string[] => {
    switch (activeTab) {
      case "dashboard":
        return ["Beranda", "Dashboard"];
      case "products":
        return ["Master Data", "Data Barang"];
      case "purchase-requests":
        return ["Procurement", "Purchase Request"];
      case "purchase-orders":
        return ["Procurement", "Purchase Order"];
      case "goods-receipts":
        return ["Inventory", "Barang Masuk (GR)"];
      case "inventory":
        return ["Inventory", "Stok Gudang"];
      case "audit-logs":
        return ["Sistem", "Audit Trail"];
      default:
        return ["CafeStock"];
    }
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <div className="flex h-screen w-full bg-[#FAF7F2] overflow-hidden text-[#2D241E]">
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
          <div className="relative w-72 max-w-[85vw] h-full shadow-2xl z-10 animate-in slide-in-from-left duration-200 flex flex-col">
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
        />

        {/* Desktop Top Header Bar */}
        <header className="hidden md:flex items-center justify-between px-8 py-3.5 bg-white border-b border-[#EDE4D8] shrink-0 shadow-xs">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs font-medium text-[#7D6B5D]">
            <span>{breadcrumbs[0]}</span>
            <span>/</span>
            <span className="font-semibold text-[#3D2C20]">
              {breadcrumbs[1]}
            </span>
          </div>

          {/* Right Header Utilities */}
          <div className="flex items-center gap-4">
            {/* Search Input Preview */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#A39282]" />
              <input
                type="text"
                placeholder="Cari SKU, PR, PO..."
                className="pl-9 pr-4 py-1.5 text-xs bg-[#FAF7F2] border border-[#E4D9CC] rounded-lg w-52 focus:w-64 transition-all focus:outline-none focus:border-[#7A4D33]"
              />
            </div>

            {/* Notification Bell */}
            <button
              type="button"
              className="relative p-2 text-[#7D6B5D] hover:text-[#3D2C20] hover:bg-[#FAF7F2] rounded-lg transition"
              title="Notifikasi"
            >
              <Bell className="w-4 h-4" />
              {currentUser.role === "APPROVER" && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#C83E2D]" />
              )}
            </button>

            {/* Active User Chip */}
            <div className="flex items-center gap-2 pl-2 border-l border-[#EDE4D8]">
              <div className="text-right">
                <div className="text-xs font-bold text-[#2E1F16]">
                  {currentUser.name}
                </div>
                <div className="text-[10px] font-semibold text-[#8C7665]">
                  {currentUser.role === "APPROVER"
                    ? "Manager (Approver)"
                    : "Warehouse Staff (User)"}
                </div>
              </div>
              <div className="w-8 h-8 rounded-full bg-[#EFE7DE] border border-[#D5C5B5] flex items-center justify-center font-bold text-xs text-[#5A3825]">
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
        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-[#FAF7F2]">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
};
