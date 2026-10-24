import React from "react";
import { Coffee, Menu, X, ArrowRightLeft } from "lucide-react";
import { NavigationTab } from "@/types";
import { useAuth } from "@/context/AuthContext";

interface MobileHeaderProps {
  activeTab: NavigationTab;
  isDrawerOpen: boolean;
  onToggleDrawer: () => void;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({
  activeTab,
  isDrawerOpen,
  onToggleDrawer,
}) => {
  const { currentUser, switchRole } = useAuth();

  const getTabTitle = (tab: NavigationTab): string => {
    switch (tab) {
      case "dashboard":
        return "Dashboard";
      case "products":
        return "Data Barang";
      case "purchase-requests":
        return "Purchase Request";
      case "purchase-orders":
        return "Purchase Order";
      case "goods-receipts":
        return "Barang Masuk (GR)";
      case "inventory":
        return "Stok Gudang";
      case "audit-logs":
        return "Audit Trail";
      default:
        return "CafeStock";
    }
  };

  const toggleRole = (): void => {
    const nextRole = currentUser.role === "USER" ? "APPROVER" : "USER";
    switchRole(nextRole);
  };

  return (
    <header className="md:hidden sticky top-0 z-40 bg-[#231712] text-[#EFE8E1] border-b border-[#38261E] px-4 py-3 flex items-center justify-between shadow-md">
      <div className="flex items-center gap-2.5">
        <button
          onClick={onToggleDrawer}
          type="button"
          className="p-2 -ml-1 text-[#E5B589] hover:bg-[#341F18] rounded-lg transition"
          aria-label="Buka Navigasi"
        >
          {isDrawerOpen ? (
            <X className="w-5 h-5" />
          ) : (
            <Menu className="w-5 h-5" />
          )}
        </button>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#5A3825] border border-[#7A4D33] flex items-center justify-center text-[#E5B589]">
            <Coffee className="w-4 h-4" />
          </div>
          <div>
            <div className="font-serif font-bold text-sm text-white leading-tight">
              {getTabTitle(activeTab)}
            </div>
            <div className="text-[10px] text-[#A69080] leading-none">
              CafeStock Mobile
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        <button
          onClick={toggleRole}
          type="button"
          className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider border transition ${
            currentUser.role === "APPROVER"
              ? "bg-[#4A321E] text-[#F3C592] border-[#7B532F]"
              : "bg-[#2D3748] text-[#90CDF4] border-[#4A5568]"
          }`}
          title="Beralih Role"
        >
          <ArrowRightLeft className="w-2.5 h-2.5" />
          <span>{currentUser.role}</span>
        </button>
      </div>
    </header>
  );
};
