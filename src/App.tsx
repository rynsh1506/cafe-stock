import React, { useState } from "react";
import { NavigationTab } from "@/types";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { KernelProvider, useKernel } from "@/kernel/KernelContext";
import { AppLayout } from "@/components/layout/AppLayout";
import { LoginPage } from "@/components/auth/LoginPage";
import { DashboardTab } from "@/components/dashboard/DashboardTab";
import { ControlPanelTab } from "@/components/control-panel/ControlPanelTab";
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
  const { branding } = useKernel();

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  const renderLedgerPlaceholder = (
    code: string,
    title: string,
    description: string,
    IconComponent: React.ElementType,
  ): React.ReactNode => (
    <div
      style={{
        backgroundColor: "var(--kr-bg-surface)",
        borderColor: "var(--kr-border)",
      }}
      className="border p-8 sm:p-12"
    >
      <div className="max-w-lg">
        <div
          style={{ color: "var(--kr-text-muted)" }}
          className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest mb-3"
        >
          <IconComponent
            style={{ color: "var(--kr-accent)" }}
            className="w-3.5 h-3.5"
          />
          <span>{code}</span>
        </div>
        <h2 className="font-serif text-2xl font-normal">{title}</h2>
        <p
          style={{ color: "var(--kr-text-muted)" }}
          className="text-xs sm:text-sm mt-2 leading-relaxed"
        >
          {description}
        </p>
      </div>
    </div>
  );

  const renderContent = (): React.ReactNode => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardTab onNavigate={setActiveTab} />;
      case "control-panel":
        return <ControlPanelTab />;
      case "products":
        return renderLedgerPlaceholder(
          "MODUL 02 // MASTER DATA",
          `Katalog ${branding.itemTerm}, Pemasok & Gudang`,
          "Pencatatan spesifikasi SKU item, satuan takar, batas stok minimum, serta daftar pemasok resmi dan titik gudang sesuai PRD Bagian 4.2.",
          Package,
        );
      case "purchase-requests":
        return renderLedgerPlaceholder(
          `MODUL 03 // TIKET ${branding.documentPrefixPR}`,
          `Buku Dokumen Purchase Request (${branding.documentPrefixPR})`,
          "Penyusunan permintaan pengadaan menggunakan payload agregat (header + daftar item), mulai dari status DRAFT, SUBMITTED, hingga otorisasi APPROVE / REJECT.",
          FileText,
        );
      case "purchase-orders":
        return renderLedgerPlaceholder(
          `MODUL 04 // PESANAN ${branding.documentPrefixPO}`,
          `Buku Dokumen Purchase Order (${branding.documentPrefixPO})`,
          "Penerbitan pesanan resmi dari permintaan berstatus APPROVED, penunjukan pemasok aktif, penomoran otomatis, dan pengiriman status ORDERED.",
          ShoppingCart,
        );
      case "goods-receipts":
        return renderLedgerPlaceholder(
          `MODUL 05 // PENERIMAAN ${branding.documentPrefixGR}`,
          `Bukti Timbang Terima (${branding.documentPrefixGR})`,
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
    <KernelProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </KernelProvider>
  );
}
