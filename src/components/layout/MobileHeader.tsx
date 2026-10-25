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
        return "01 // Buku Ikhtisar";
      case "products":
        return "02 // Katalog Bahan";
      case "purchase-requests":
        return "03 // Purchase Request";
      case "purchase-orders":
        return "04 // Purchase Order";
      case "goods-receipts":
        return "05 // Timbang Terima";
      case "inventory":
        return "06 // Kartu Stok";
      case "audit-logs":
        return "07 // Jurnal Audit";
      default:
        return "CafeStock Ledger";
    }
  };

  const toggleRole = (): void => {
    const nextRole = currentUser.role === "USER" ? "APPROVER" : "USER";
    switchRole(nextRole);
  };

  return (
    <header className="md:hidden sticky top-0 z-40 bg-[#191310] text-[#EBE4DA] border-b border-[#332720] px-3.5 py-2.5 flex items-center justify-between">
      <div className="flex items-center gap-2.5 min-w-0">
        <button
          onClick={onToggleDrawer}
          type="button"
          className="p-1.5 -ml-1 text-[#D49B6A] hover:bg-[#2A1E18] transition shrink-0"
          aria-label="Buka Navigasi"
        >
          {isDrawerOpen ? (
            <X className="w-5 h-5" />
          ) : (
            <Menu className="w-5 h-5" />
          )}
        </button>
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 bg-[#2A1E18] border border-[#523A2C] flex items-center justify-center text-[#D49B6A] shrink-0">
            <Coffee className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0">
            <div className="font-mono font-semibold text-xs text-[#F7F3EC] leading-tight truncate">
              {getTabTitle(activeTab)}
            </div>
            <div className="font-mono text-[9px] uppercase tracking-widest text-[#8C7A6B] leading-none mt-0.5">
              CAFESTOCK LEDGER
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        <button
          onClick={toggleRole}
          type="button"
          className={`flex items-center gap-1 px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-wider border transition whitespace-nowrap ${
            currentUser.role === "APPROVER"
              ? "bg-[#3B2616] text-[#F0C18C] border-[#6E472A]"
              : "bg-[#1B2C3B] text-[#9AC7EE] border-[#2F4E68]"
          }`}
          title="Beralih Role"
        >
          <ArrowRightLeft className="w-2.5 h-2.5 shrink-0" />
          <span>{currentUser.role}</span>
        </button>
      </div>
    </header>
  );
};
