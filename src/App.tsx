import React, { useState } from "react";
import { NavigationTab } from "@/types";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { AppLayout } from "@/components/layout/AppLayout";
import { LoginPage } from "@/components/auth/LoginPage";
import {
  Boxes,
  Package,
  FileText,
  ShoppingCart,
  Truck,
  CheckCircle2,
  Clock,
  AlertTriangle,
} from "lucide-react";

const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NavigationTab>("dashboard");
  const { currentUser, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <AppLayout activeTab={activeTab} onSelectTab={setActiveTab}>
      <div className="space-y-6">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-[#2C1E18] to-[#45281A] rounded-2xl p-5 sm:p-6 text-white shadow-lg border border-[#523323] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-[#D8A57A] mb-1.5">
              <span>Sistem Pengadaan & Stok</span>
              <span className="opacity-60">•</span>
              <span className="px-2 py-0.5 rounded-full bg-[#5A3825] text-white text-[10px] font-bold border border-[#7A4D33] whitespace-nowrap shrink-0">
                Role: {currentUser.role}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-serif font-bold text-white">
              Selamat Datang di CafeStock, {currentUser.name}
            </h1>
            <p className="text-xs sm:text-sm text-[#DDD0C6] mt-1 max-w-xl">
              Platform terpusat untuk alur Purchase Request, Approval, Purchase
              Order, hingga pencatatan Goods Receipt dan saldo stok gudang yang
              konsisten.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setActiveTab("purchase-requests")}
              type="button"
              className="px-4 py-2.5 rounded-xl bg-[#C68B59] hover:bg-[#B37948] text-white text-xs font-bold transition shadow-md flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              <span>
                {currentUser.role === "APPROVER"
                  ? "Tinjau Permintaan"
                  : "+ Buat Purchase Request"}
              </span>
            </button>
          </div>
        </div>

        {/* Highlight KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white p-4 rounded-xl border border-[#EDE4D8] shadow-xs flex items-center justify-between">
            <div>
              <div className="text-[11px] font-semibold text-[#8C7665] uppercase tracking-wider">
                Total Master Produk
              </div>
              <div className="text-xl sm:text-2xl font-bold text-[#2E1F16] mt-1">
                24 SKU
              </div>
              <div className="text-[10px] text-[#2E7D32] flex items-center gap-1 mt-0.5">
                <CheckCircle2 className="w-3 h-3" />
                <span>Seluruh master aktif</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#F7F2EB] text-[#5A3825] flex items-center justify-center shrink-0">
              <Package className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-[#EDE4D8] shadow-xs flex items-center justify-between">
            <div>
              <div className="text-[11px] font-semibold text-[#8C7665] uppercase tracking-wider">
                PR Perlu Review
              </div>
              <div className="text-xl sm:text-2xl font-bold text-[#2E1F16] mt-1">
                2 Pengajuan
              </div>
              <div className="text-[10px] text-[#D97706] flex items-center gap-1 mt-0.5">
                <Clock className="w-3 h-3" />
                <span>Status SUBMITTED</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#FFF8E1] text-[#D97706] flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-[#EDE4D8] shadow-xs flex items-center justify-between">
            <div>
              <div className="text-[11px] font-semibold text-[#8C7665] uppercase tracking-wider">
                PO Menunggu Penerimaan
              </div>
              <div className="text-xl sm:text-2xl font-bold text-[#2E1F16] mt-1">
                3 Pesanan
              </div>
              <div className="text-[10px] text-[#5A3825] flex items-center gap-1 mt-0.5">
                <Truck className="w-3 h-3" />
                <span>ORDERED / PARTIAL</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#F7F2EB] text-[#5A3825] flex items-center justify-center shrink-0">
              <ShoppingCart className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-[#EDE4D8] shadow-xs flex items-center justify-between">
            <div>
              <div className="text-[11px] font-semibold text-[#8C7665] uppercase tracking-wider">
                Stok Kritis Gudang
              </div>
              <div className="text-xl sm:text-2xl font-bold text-[#C62828] mt-1">
                1 Item
              </div>
              <div className="text-[10px] text-[#C62828] flex items-center gap-1 mt-0.5">
                <AlertTriangle className="w-3 h-3" />
                <span>Biji Kopi House Blend</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#FFEBEE] text-[#C62828] flex items-center justify-center shrink-0">
              <Boxes className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Content Tab Details */}
        <div className="bg-white rounded-2xl border border-[#EDE4D8] p-5 sm:p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#F0E7DD] pb-4 mb-4">
            <div>
              <h2 className="text-base font-bold text-[#2E1F16]">
                Navigasi Aktif: {activeTab.toUpperCase()}
              </h2>
              <p className="text-xs text-[#8C7665]">
                Fondasi antarmuka telah siap dan responsif untuk Desktop,
                Tablet, maupun Mobile.
              </p>
            </div>
            <span className="self-start sm:self-center text-xs font-semibold px-2.5 py-1 rounded-full bg-[#FAF3EC] text-[#7A4D33] border border-[#E8DACB] shrink-0 whitespace-nowrap">
              Figma Design Aligned
            </span>
          </div>

          <div className="text-xs text-[#5D4E43] space-y-2">
            <p className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#2E7D32]" />
              Struktur tata letak navigasi responsif (Sidebar desktop & Drawer
              hamburger mobile) telah terpasang.
            </p>
            <p className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#2E7D32]" />
              Role switcher instan (`USER` vs `APPROVER`) di sidebar/header
              berfungsi penuh untuk pengujian otorisasi PRD.
            </p>
            <p className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#2E7D32]" />
              Palet warna warm espresso & cafe theme dari Figma terintegrasi.
            </p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
