import React, { useState } from "react";
import { NavigationTab } from "@/types";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileHeader } from "@/components/layout/MobileHeader";
import { Search } from "lucide-react";
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

  const getBreadcrumbs = (): {
    code: string;
    section: string;
    title: string;
  } => {
    switch (activeTab) {
      case "dashboard":
        return {
          code: "SEC-01",
          section: "Ikhtisar",
          title: "Buku Ikhtisar & Alur Pengadaan",
        };
      case "products":
        return {
          code: "SEC-02",
          section: "Master Data",
          title: "Katalog Bahan Baku & Pemasok",
        };
      case "purchase-requests":
        return {
          code: "SEC-03",
          section: "Siklus Pengadaan",
          title: "Dokumen Purchase Request (PR)",
        };
      case "purchase-orders":
        return {
          code: "SEC-04",
          section: "Siklus Pengadaan",
          title: "Dokumen Purchase Order (PO)",
        };
      case "goods-receipts":
        return {
          code: "SEC-05",
          section: "Siklus Pengadaan",
          title: "Bukti Timbang Terima (Goods Receipt)",
        };
      case "inventory":
        return {
          code: "SEC-06",
          section: "Gudang",
          title: "Kartu Saldo & Mutasi Stok",
        };
      case "audit-logs":
        return {
          code: "SEC-07",
          section: "Kepatuhan",
          title: "Jurnal Audit Sistem",
        };
      default:
        return {
          code: "SEC-00",
          section: "CafeStock",
          title: "Roastery Ledger",
        };
    }
  };

  const crumb = getBreadcrumbs();

  return (
    <div className="flex h-screen w-full bg-[#F6F3EC] overflow-hidden text-[#1A1411]">
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
          <div className="relative w-72 max-w-[85vw] h-full shadow-2xl z-10 flex flex-col">
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

        {/* Desktop Top Ledger Header Bar */}
        <header className="hidden md:flex items-center justify-between px-8 py-3 bg-[#FDFBF7] border-b border-[#DFD6C7] shrink-0">
          {/* Breadcrumb & Document Index */}
          <div className="flex items-center gap-3 text-xs">
            <span className="font-mono text-[10px] font-semibold px-1.5 py-0.5 bg-[#EFEAD8] text-[#5C4938] border border-[#D8CEBE]">
              {crumb.code}
            </span>
            <span className="font-mono text-[11px] uppercase tracking-wider text-[#857464]">
              {crumb.section}
            </span>
            <span className="text-[#C7BBAE]">/</span>
            <span className="font-semibold text-[#1A1411]">{crumb.title}</span>
          </div>

          {/* Right Header Utilities */}
          <div className="flex items-center gap-5">
            {/* Quick Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#8C7B6B]" />
              <input
                type="text"
                placeholder="Cari No. Dokumen / SKU..."
                className="pl-8 pr-3 py-1 font-mono text-xs bg-[#F6F3EC] border border-[#D8CFC0] w-52 focus:w-64 transition-all focus:outline-none focus:border-[#261B16] text-[#1A1411] placeholder-[#9E8E7E]"
              />
            </div>

            {/* Active Staff Stamp */}
            <div className="flex items-center gap-3 pl-4 border-l border-[#DFD6C7]">
              <div className="text-right">
                <div className="text-xs font-semibold text-[#1A1411] leading-none">
                  {currentUser.name}
                </div>
                <div className="font-mono text-[10px] uppercase tracking-wider text-[#7A6858] mt-1">
                  {currentUser.role === "APPROVER"
                    ? "OTORISASI: APPROVER"
                    : "OTORISASI: STAFF USER"}
                </div>
              </div>
              <div className="w-7 h-7 bg-[#261B16] text-[#F7F3EC] flex items-center justify-center font-mono font-bold text-[11px]">
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
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 bg-[#F6F3EC]">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
};
