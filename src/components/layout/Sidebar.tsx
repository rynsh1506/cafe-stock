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

  const navGroups = [
    {
      groupTitle: "IKHTISAR & KATALOG",
      items: [
        {
          code: "01",
          id: "dashboard" as NavigationTab,
          label: "Buku Ikhtisar",
          icon: LayoutDashboard,
          badge: undefined,
        },
        {
          code: "02",
          id: "products" as NavigationTab,
          label: "Katalog Bahan Baku",
          icon: Package,
          badge: undefined,
        },
      ],
    },
    {
      groupTitle: "SIKLUS PENGADAAN",
      items: [
        {
          code: "03",
          id: "purchase-requests" as NavigationTab,
          label: "Purchase Request",
          icon: FileText,
          badge: currentUser.role === "APPROVER" ? "1 REVIEW" : undefined,
        },
        {
          code: "04",
          id: "purchase-orders" as NavigationTab,
          label: "Purchase Order",
          icon: ShoppingCart,
          badge: undefined,
        },
        {
          code: "05",
          id: "goods-receipts" as NavigationTab,
          label: "Timbang Terima (GR)",
          icon: Truck,
          badge: undefined,
        },
      ],
    },
    {
      groupTitle: "GUDANG & KEPATUHAN",
      items: [
        {
          code: "06",
          id: "inventory" as NavigationTab,
          label: "Kartu Stok Gudang",
          icon: Boxes,
          badge: undefined,
        },
        {
          code: "07",
          id: "audit-logs" as NavigationTab,
          label: "Jurnal Audit",
          icon: ShieldCheck,
          badge: undefined,
        },
      ],
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
    <aside className="w-full md:w-64 bg-[#191310] text-[#EBE4DA] flex flex-col h-full border-r border-[#332720] select-none">
      {/* Brand Stamp Header */}
      <div className="px-5 py-4 border-b border-[#332720] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-[#2A1E18] border border-[#523A2C] flex items-center justify-center text-[#D49B6A] shrink-0">
            <Coffee className="w-4 h-4" />
          </div>
          <div>
            <div className="font-serif font-semibold text-lg tracking-tight text-[#F7F3EC] flex items-center gap-2 leading-none">
              CafeStock
              <span className="font-mono text-[9px] font-medium uppercase px-1.5 py-0.5 bg-[#2A1E18] text-[#C89666] border border-[#473225]">
                v1.0
              </span>
            </div>
            <div className="font-mono text-[10px] uppercase tracking-widest text-[#8C7A6B] mt-1">
              Roastery Ledger
            </div>
          </div>
        </div>
      </div>

      {/* Otorisasi Role Shift */}
      <div className="px-4 py-3 bg-[#140F0C] border-b border-[#2E221B]">
        <div className="font-mono text-[9px] uppercase tracking-widest text-[#7D6C5E] mb-1.5">
          OTORISASI PETUGAS AKTIF
        </div>
        <div className="flex items-center justify-between gap-2">
          {currentUser.role === "APPROVER" ? (
            <span className="font-mono text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 bg-[#3B2616] text-[#F0C18C] border border-[#6E472A] truncate">
              ROLE // APPROVER
            </span>
          ) : (
            <span className="font-mono text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 bg-[#1B2C3B] text-[#9AC7EE] border border-[#2F4E68] truncate">
              ROLE // USER
            </span>
          )}
          <button
            onClick={toggleRole}
            type="button"
            className="flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider text-[#C8B7A6] hover:text-white bg-[#261C17] hover:bg-[#382921] px-2 py-1 transition border border-[#423127] cursor-pointer shrink-0"
            title="Ubah role untuk menguji otorisasi USER vs APPROVER"
          >
            <ArrowRightLeft className="w-3 h-3" />
            <span>Ganti</span>
          </button>
        </div>
      </div>

      {/* Navigation Ledger Index */}
      <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto">
        {navGroups.map((group) => (
          <div key={group.groupTitle}>
            <div className="px-2.5 pb-1.5 font-mono text-[9px] font-semibold uppercase tracking-[0.16em] text-[#7D6C5E]">
              {group.groupTitle}
            </div>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleTabClick(item.id)}
                    type="button"
                    className={`w-full flex items-center justify-between px-2.5 py-2 text-xs transition cursor-pointer border-l-2 ${
                      isActive
                        ? "bg-[#281E19] text-[#F7F3EC] border-[#D49B6A] font-semibold"
                        : "border-transparent text-[#B8A798] hover:text-[#F2ECE4] hover:bg-[#211814]"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className={`font-mono text-[10px] ${
                          isActive ? "text-[#D49B6A]" : "text-[#6E5D4F]"
                        }`}
                      >
                        {item.code}
                      </span>
                      <Icon
                        className={`w-3.5 h-3.5 shrink-0 ${
                          isActive ? "text-[#D49B6A]" : "text-[#8C7A6B]"
                        }`}
                      />
                      <span className="truncate">{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="font-mono text-[9px] font-bold px-1.5 py-0.5 bg-[#7C2D23] text-[#FCE8E6] border border-[#A64236] shrink-0">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Petugas Footer */}
      <div className="p-4 border-t border-[#332720] bg-[#140F0C]">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 bg-[#2A1E18] border border-[#523A2C] flex items-center justify-center font-mono font-bold text-xs text-[#D49B6A] shrink-0">
              {currentUser.name
                .split(" ")
                .map((n) => n[0])
                .slice(0, 2)
                .join("")}
            </div>
            <div className="truncate">
              <div className="text-xs font-semibold text-[#F2ECE4] truncate">
                {currentUser.name}
              </div>
              <div className="font-mono text-[10px] text-[#8C7A6B] truncate">
                {currentUser.username}
              </div>
            </div>
          </div>
          <button
            onClick={logout}
            type="button"
            className="p-1.5 text-[#8C7A6B] hover:text-[#E57373] hover:bg-[#2A1E18] transition cursor-pointer shrink-0"
            title="Tutup Buku Kerja (Logout)"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
