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
  UserCheck,
  UserCircle,
  LogOut,
  ArrowRightLeft,
} from "lucide-react";
import { NavigationTab } from "@/types";
import { useAuth } from "@/context/AuthContext";

interface SidebarProps {
  activeTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  onCloseMobile,
}) => {
  const { currentUser, switchRole, logout } = useAuth();

  const navItems = [
    {
      id: "dashboard" as NavigationTab,
      label: "Dashboard",
      icon: LayoutDashboard,
      badge: undefined,
    },
    {
      id: "products" as NavigationTab,
      label: "Data Barang",
      icon: Package,
      badge: undefined,
    },
    {
      id: "purchase-requests" as NavigationTab,
      label: "Purchase Request",
      icon: FileText,
      badge: currentUser.role === "APPROVER" ? "2 Need Review" : undefined,
    },
    {
      id: "purchase-orders" as NavigationTab,
      label: "Purchase Order",
      icon: ShoppingCart,
      badge: undefined,
    },
    {
      id: "goods-receipts" as NavigationTab,
      label: "Barang Masuk (GR)",
      icon: Truck,
      badge: undefined,
    },
    {
      id: "inventory" as NavigationTab,
      label: "Stok Gudang",
      icon: Boxes,
      badge: undefined,
    },
    {
      id: "audit-logs" as NavigationTab,
      label: "Audit Trail",
      icon: ShieldCheck,
      badge: undefined,
    },
  ];

  const handleTabClick = (tab: NavigationTab): void => {
    onSelectTab(tab);
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  const toggleRole = (): void => {
    const nextRole = currentUser.role === "USER" ? "APPROVER" : "USER";
    switchRole(nextRole);
  };

  return (
    <aside className="w-64 bg-[#231712] text-[#EFE8E1] flex flex-col h-full border-r border-[#38261E] select-none shadow-xl">
      {/* Brand Header */}
      <div className="p-5 border-b border-[#38261E] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#5A3825] border border-[#7A4D33] flex items-center justify-center text-[#E5B589] shadow-inner">
            <Coffee className="w-5 h-5" />
          </div>
          <div>
            <div className="font-serif font-bold text-lg tracking-wide text-white flex items-center gap-1.5">
              CafeStock
              <span className="text-[10px] font-sans font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#45281A] text-[#D8A57A] border border-[#683C25]">
                v1.0
              </span>
            </div>
            <div className="text-[11px] text-[#A69080] tracking-tight">
              Inventory & Procurement
            </div>
          </div>
        </div>
      </div>

      {/* Role Banner / Quick Switcher */}
      <div className="px-4 py-3 bg-[#1C120D] border-b border-[#332119]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {currentUser.role === "APPROVER" ? (
              <span className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-[#4A321E] text-[#F3C592] border border-[#7B532F]">
                <UserCheck className="w-3 h-3" />
                Approver
              </span>
            ) : (
              <span className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-[#2D3748] text-[#90CDF4] border border-[#4A5568]">
                <UserCircle className="w-3 h-3" />
                Staff (User)
              </span>
            )}
          </div>
          <button
            onClick={toggleRole}
            type="button"
            className="flex items-center gap-1 text-[11px] text-[#CDB8A6] hover:text-white bg-[#301F18] hover:bg-[#422B22] px-2 py-1 rounded transition border border-[#482F24]"
            title="Klik untuk beralih role demi pengujian otorisasi PRD"
          >
            <ArrowRightLeft className="w-3 h-3" />
            <span>Switch</span>
          </button>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-[#8A7566]">
          Menu Utama
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleTabClick(item.id)}
              type="button"
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                isActive
                  ? "bg-[#5A3825] text-white shadow-md border border-[#7B4E34]"
                  : "text-[#C4B2A3] hover:text-white hover:bg-[#2F1F18]"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 ${
                    isActive ? "text-[#F1C89F]" : "text-[#9E8777]"
                  }`}
                />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[#8C2E26] text-white">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* User Footer Profile */}
      <div className="p-4 border-t border-[#38261E] bg-[#1E130E]/80">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-[#4A3022] border border-[#6B4430] flex items-center justify-center font-bold text-xs text-[#E3B892] shrink-0">
              {currentUser.name
                .split(" ")
                .map((n) => n[0])
                .slice(0, 2)
                .join("")}
            </div>
            <div className="truncate">
              <div className="text-xs font-semibold text-white truncate">
                {currentUser.name}
              </div>
              <div className="text-[10px] text-[#9A8474] truncate">
                {currentUser.username}
              </div>
            </div>
          </div>
          <button
            onClick={logout}
            type="button"
            className="p-1.5 text-[#9A8474] hover:text-[#E57373] hover:bg-[#341F18] rounded-md transition"
            title="Keluar"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
