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

  const renderLedgerPlaceholder = (
    code: string,
    title: string,
    description: string,
    IconComponent: React.ElementType,
  ): React.ReactNode => (
    <div className="bg-[#FDFBF7] border border-[#D8CFC0] p-8 sm:p-12">
      <div className="max-w-lg">
        <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-[#7A6858] mb-3">
          <IconComponent className="w-3.5 h-3.5 text-[#8C6239]" />
          <span>{code}</span>
        </div>
        <h2 className="font-serif text-2xl font-normal text-[#1A1411]">
          {title}
        </h2>
        <p className="text-xs sm:text-sm text-[#6E5E50] mt-2 leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );

  const renderContent = (): React.ReactNode => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardTab onNavigate={setActiveTab} />;
      case "products":
        return renderLedgerPlaceholder(
          "MODUL 02 // MASTER DATA",
          "Katalog Bahan Baku, Pemasok & Gudang",
          "Pencatatan spesifikasi SKU bahan baku, satuan takar, batas stok minimum, serta daftar pemasok resmi dan titik gudang sesuai PRD Bagian 4.2.",
          Package,
        );
      case "purchase-requests":
        return renderLedgerPlaceholder(
          "MODUL 03 // PERMINTAAN BARANG",
          "Buku Dokumen Purchase Request (PR)",
          "Penyusunan permintaan pengadaan bahan baku menggunakan payload agregat (header + daftar item), mulai dari status DRAFT, SUBMITTED, hingga otorisasi APPROVE / REJECT.",
          FileText,
        );
      case "purchase-orders":
        return renderLedgerPlaceholder(
          "MODUL 04 // PESANAN PEMASOK",
          "Buku Dokumen Purchase Order (PO)",
          "Penerbitan pesanan resmi dari PR berstatus APPROVED, penunjukan pemasok aktif, penomoran otomatis PO-2026-XXXXXX, dan pengiriman status ORDERED.",
          ShoppingCart,
        );
      case "goods-receipts":
        return renderLedgerPlaceholder(
          "MODUL 05 // TIMBANG TERIMA",
          "Bukti Penerimaan Barang (Goods Receipt)",
          "Verifikasi fisik kedatangan barang terhadap dokumen PO dengan validasi ketat kuantitas sisa pesanan serta pembaruan saldo gudang secara transaksional.",
          Truck,
        );
      case "inventory":
        return renderLedgerPlaceholder(
          "MODUL 06 // KARTU STOK",
          "Saldo Gudang & Jurnal Mutasi",
          "Pemisahan tegas antara tabel saldo berjalan (inventory_balances) dan buku riwayat mutasi (append-only inventory_movements) per lokasi gudang.",
          Boxes,
        );
      case "audit-logs":
        return renderLedgerPlaceholder(
          "MODUL 07 // KEPATUHAN",
          "Jurnal Jejak Audit (Audit Trail)",
          "Rekaman permanen setiap tindakan krusial (Create, Submit, Approve, Reject, PO Ordered, GR Received) lengkap dengan identitas petugas dan waktu kejadian.",
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
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
