import React, { useState } from "react";
import { NavigationTab } from "@/types";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { AppLayout } from "@/components/layout/AppLayout";
import { LoginPage } from "@/components/auth/LoginPage";
import { DashboardTab } from "@/components/dashboard/DashboardTab";
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

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  const renderContent = (): React.ReactNode => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardTab onNavigate={setActiveTab} />;
      case "products":
        return (
          <div className="bg-white rounded-2xl border border-[#EDE4D8] p-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#F7F2EB] text-[#5A3825] flex items-center justify-center mx-auto">
              <Package className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-[#2E1F16]">
              Data Barang (Master Data)
            </h2>
            <p className="text-xs text-[#8C7665] max-w-md mx-auto">
              Katalog master produk, satuan unit, stok minimum, status aktif,
              serta master supplier dan gudang sesuai PRD Bagian 4.2.
            </p>
          </div>
        );
      case "purchase-requests":
        return (
          <div className="bg-white rounded-2xl border border-[#EDE4D8] p-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#FFF8E1] text-[#D97706] flex items-center justify-center mx-auto">
              <FileText className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-[#2E1F16]">
              Purchase Request (PR)
            </h2>
            <p className="text-xs text-[#8C7665] max-w-md mx-auto">
              Alur pengajuan PR dengan form agregat, status DRAFT, SUBMITTED,
              hingga aksi APPROVE / REJECT oleh Approver.
            </p>
          </div>
        );
      case "purchase-orders":
        return (
          <div className="bg-white rounded-2xl border border-[#EDE4D8] p-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#EFF6FF] text-[#1D4ED8] flex items-center justify-center mx-auto">
              <ShoppingCart className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-[#2E1F16]">
              Purchase Order (PO)
            </h2>
            <p className="text-xs text-[#8C7665] max-w-md mx-auto">
              Pembuatan PO dari PR yang APPROVED, pemilihan supplier aktif,
              penomoran otomatis PO-2026-XXXXXX, dan aksi Mark as Ordered.
            </p>
          </div>
        );
      case "goods-receipts":
        return (
          <div className="bg-white rounded-2xl border border-[#EDE4D8] p-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#ECFDF5] text-[#047857] flex items-center justify-center mx-auto">
              <Truck className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-[#2E1F16]">
              Barang Masuk / Goods Receipt (GR)
            </h2>
            <p className="text-xs text-[#8C7665] max-w-md mx-auto">
              Penerimaan barang terhadap PO dengan validasi batas quantity
              (tidak boleh melebihi sisa ordered) dan update otomatis saldo
              stok.
            </p>
          </div>
        );
      case "inventory":
        return (
          <div className="bg-white rounded-2xl border border-[#EDE4D8] p-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#F7F2EB] text-[#5A3825] flex items-center justify-center mx-auto">
              <Boxes className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-[#2E1F16]">
              Stok Gudang & Mutasi
            </h2>
            <p className="text-xs text-[#8C7665] max-w-md mx-auto">
              Tabel saldo stok per gudang dan riwayat mutasi (append-only
              inventory_movements) yang menjadi acuan audit transaksi.
            </p>
          </div>
        );
      case "audit-logs":
        return (
          <div className="bg-white rounded-2xl border border-[#EDE4D8] p-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#F3E8FF] text-[#7E22CE] flex items-center justify-center mx-auto">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-[#2E1F16]">
              Audit Trail Log
            </h2>
            <p className="text-xs text-[#8C7665] max-w-md mx-auto">
              Pencatatan jejak audit untuk setiap aksi penting (Create, Submit,
              Approve, Reject, PO Ordered, GR Received) beserta aktor dan
              timestamp.
            </p>
          </div>
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
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
