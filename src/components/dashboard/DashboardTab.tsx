import React from "react";
import {
  FileText,
  AlertTriangle,
  ArrowUpRight,
  Plus,
  Warehouse,
  Sliders,
  Mail,
} from "lucide-react";
import { NavigationTab } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { useKernel } from "@/kernel/KernelContext";
import {
  INITIAL_PRODUCTS,
  INITIAL_PURCHASE_REQUESTS,
  INITIAL_PURCHASE_ORDERS,
  INITIAL_WAREHOUSES,
  INITIAL_INVENTORY_BALANCES,
} from "@/data/mockData";

interface DashboardTabProps {
  onNavigate: (tab: NavigationTab) => void;
}

export const DashboardTab: React.FC<DashboardTabProps> = ({ onNavigate }) => {
  const { currentUser } = useAuth();
  const { branding, emailConfig, enabledPlugins } = useKernel();

  // Compute live stats from mockData
  const totalProducts = INITIAL_PRODUCTS.length;
  const pendingPRs = INITIAL_PURCHASE_REQUESTS.filter(
    (pr) => pr.status === "SUBMITTED",
  ).length;
  const approvedPRs = INITIAL_PURCHASE_REQUESTS.filter(
    (pr) => pr.status === "APPROVED",
  ).length;
  const activePOs = INITIAL_PURCHASE_ORDERS.filter(
    (po) => po.status === "ORDERED" || po.status === "PARTIALLY_RECEIVED",
  ).length;

  // Find critical stocks (where stock < minStock)
  const criticalItems = INITIAL_INVENTORY_BALANCES.filter((balance) => {
    const product = INITIAL_PRODUCTS.find((p) => p.id === balance.productId);
    return product ? balance.stock < product.minStock : false;
  }).map((balance) => {
    const product = INITIAL_PRODUCTS.find((p) => p.id === balance.productId)!;
    const warehouse = INITIAL_WAREHOUSES.find(
      (w) => w.id === balance.warehouseId,
    )!;
    const deficit = Math.max(0, product.minStock - balance.stock);
    const fillRatio = Math.min(
      100,
      Math.round((balance.stock / product.minStock) * 100),
    );
    return {
      product,
      warehouse,
      currentStock: balance.stock,
      minStock: product.minStock,
      deficit,
      fillRatio,
    };
  });

  // Recent combined transactions with dynamic document prefixes
  const recentTransactions = [
    {
      id: "tx_1",
      number: `${branding.documentPrefixPR}-2026-000001`,
      stage: `TAHAP 01 // ${branding.documentPrefixPR}`,
      type: "Purchase Request",
      warehouse: "Gudang Utama Jakarta",
      date: "23 Okt 2026",
      status: "SUBMITTED",
      statusStyle: "bg-[#F9EFE0] text-[#8A4B14] border-[#DEC19B]",
      targetTab: "purchase-requests" as NavigationTab,
    },
    {
      id: "tx_2",
      number: `${branding.documentPrefixPO}-2026-000001`,
      stage: `TAHAP 02 // ${branding.documentPrefixPO}`,
      type: "Purchase Order",
      warehouse: "Gudang Roastery Bandung",
      date: "22 Okt 2026",
      status: "ORDERED",
      statusStyle: "bg-[#E8F0F6] text-[#1E4A6D] border-[#B8CEE0]",
      targetTab: "purchase-orders" as NavigationTab,
    },
    {
      id: "tx_3",
      number: `${branding.documentPrefixGR}-2026-000001`,
      stage: `TAHAP 03 // ${branding.documentPrefixGR}`,
      type: "Goods Receipt",
      warehouse: "Gudang Utama Jakarta",
      date: "21 Okt 2026",
      status: "RECEIVED",
      statusStyle: "bg-[#E7F2EC] text-[#1D593B] border-[#B2D3C1]",
      targetTab: "goods-receipts" as NavigationTab,
    },
    {
      id: "tx_4",
      number: `${branding.documentPrefixPR}-2026-000003`,
      stage: `TAHAP 01 // ${branding.documentPrefixPR}`,
      type: "Purchase Request",
      warehouse: "Gudang Roastery Bandung",
      date: "22 Okt 2026",
      status: "APPROVED",
      statusStyle: "bg-[#E7F2EC] text-[#1D593B] border-[#B2D3C1]",
      targetTab: "purchase-requests" as NavigationTab,
    },
  ];

  // Daily weighing intake log
  const weeklyVolume = [
    { day: "SEN", date: "20/10", value: 12.4, height: "54%", lot: "Batch-A" },
    { day: "SEL", date: "21/10", value: 15.8, height: "68%", lot: "Batch-B" },
    { day: "RAB", date: "22/10", value: 19.2, height: "84%", lot: "Batch-C" },
    {
      day: "KAM",
      date: "23/10",
      value: 14.7,
      height: "64%",
      lot: "Batch-D",
      active: true,
    },
    { day: "JUM", date: "24/10", value: 22.0, height: "96%", lot: "Batch-E" },
    { day: "SAB", date: "25/10", value: 17.5, height: "76%", lot: "Batch-F" },
    { day: "MIN", date: "26/10", value: 10.2, height: "45%", lot: "Batch-G" },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Editorial Masthead (Dynamic White-Label & Microkernel Status) */}
      <div
        style={{ borderColor: "var(--kr-border)" }}
        className="border-b pb-5 flex flex-col md:flex-row md:items-end justify-between gap-4"
      >
        <div>
          <div
            style={{ color: "var(--kr-text-muted)" }}
            className="flex flex-wrap items-center gap-2 font-mono text-[10px] uppercase tracking-widest"
          >
            <span>{branding.orgName}</span>
            <span>•</span>
            <span>{enabledPlugins.length} MODUL AKTIF</span>
            <span>•</span>
            <button
              type="button"
              onClick={() => onNavigate("control-panel")}
              style={{
                backgroundColor: "var(--kr-bg-elevated)",
                borderColor: "var(--kr-border)",
                color: "var(--kr-text-main)",
              }}
              className="px-1.5 py-0.5 border font-semibold inline-flex items-center gap-1 cursor-pointer hover:opacity-80"
            >
              <Mail className="w-2.5 h-2.5" />
              <span>NOTIF INTI: {emailConfig.coreAdminEmail}</span>
            </button>
          </div>
          <h1
            style={{ color: "var(--kr-text-main)" }}
            className="font-serif text-2xl sm:text-3xl font-normal tracking-tight mt-1.5"
          >
            Buku Ikhtisar &amp; Kendali {branding.itemTerm}
          </h1>
          <p
            style={{ color: "var(--kr-text-muted)" }}
            className="text-xs sm:text-sm mt-1 max-w-2xl"
          >
            Meja operasional {branding.appName} ({branding.appSubtitle}) —
            pemantauan terpadu dokumen {branding.documentPrefixPR}, pesanan{" "}
            {branding.documentPrefixPO}, hingga bukti terima{" "}
            {branding.documentPrefixGR}.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={() => onNavigate("control-panel")}
            type="button"
            style={{
              backgroundColor: "var(--kr-bg-surface)",
              borderColor: "var(--kr-border)",
              color: "var(--kr-text-main)",
            }}
            className="px-3.5 py-2.5 border font-mono text-xs uppercase tracking-wider font-semibold transition flex items-center gap-1.5 cursor-pointer hover:opacity-80"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Kustomisasi Kernel</span>
          </button>

          {currentUser.role === "APPROVER" ? (
            <button
              onClick={() => onNavigate("purchase-requests")}
              type="button"
              style={{
                backgroundColor: "var(--kr-bg-sidebar)",
                color: "var(--kr-text-sidebar)",
                borderColor: "var(--kr-border-sidebar)",
              }}
              className="px-4 py-2.5 border font-mono text-xs uppercase tracking-wider font-semibold transition flex items-center gap-2 cursor-pointer"
            >
              <FileText
                style={{ color: "var(--kr-accent)" }}
                className="w-3.5 h-3.5"
              />
              <span>
                Periksa {pendingPRs} {branding.documentPrefixPR}
              </span>
            </button>
          ) : (
            <button
              onClick={() => onNavigate("purchase-requests")}
              type="button"
              style={{
                backgroundColor: "var(--kr-bg-sidebar)",
                color: "var(--kr-text-sidebar)",
                borderColor: "var(--kr-border-sidebar)",
              }}
              className="px-4 py-2.5 border font-mono text-xs uppercase tracking-wider font-semibold transition flex items-center gap-2 cursor-pointer"
            >
              <Plus
                style={{ color: "var(--kr-accent)" }}
                className="w-3.5 h-3.5"
              />
              <span>Buat {branding.documentPrefixPR} Baru</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Architectural Ledger Strip */}
      <div
        style={{
          backgroundColor: "var(--kr-bg-surface)",
          borderColor: "var(--kr-border)",
        }}
        className="border grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x"
      >
        {/* Index 01: Master Produk */}
        <div
          onClick={() => onNavigate("products")}
          style={{ borderColor: "var(--kr-border)" }}
          className="p-4 sm:p-5 hover:opacity-90 transition cursor-pointer flex flex-col justify-between group"
        >
          <div className="flex items-center justify-between">
            <span
              style={{ color: "var(--kr-text-muted)" }}
              className="font-mono text-[10px] font-semibold uppercase tracking-widest"
            >
              01 // KATALOG {branding.itemTerm}
            </span>
            <ArrowUpRight className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 transition shrink-0" />
          </div>
          <div className="my-3 flex items-baseline gap-2">
            <span className="font-mono text-2xl sm:text-3xl font-bold">
              {totalProducts}
            </span>
            <span
              style={{ color: "var(--kr-text-muted)" }}
              className="text-xs font-medium"
            >
              SKU Terdaftar
            </span>
          </div>
          <div
            style={{ borderColor: "var(--kr-border)" }}
            className="pt-2.5 border-t flex items-center justify-between font-mono text-[10px]"
          >
            <span style={{ color: "var(--kr-text-muted)" }}>STATUS MASTER</span>
            <span className="text-[#1D593B] font-semibold">100% AKTIF</span>
          </div>
        </div>

        {/* Index 02: Antrean PR */}
        <div
          onClick={() => onNavigate("purchase-requests")}
          style={{ borderColor: "var(--kr-border)" }}
          className="p-4 sm:p-5 hover:opacity-90 transition cursor-pointer flex flex-col justify-between group"
        >
          <div className="flex items-center justify-between">
            <span
              style={{ color: "var(--kr-text-muted)" }}
              className="font-mono text-[10px] font-semibold uppercase tracking-widest"
            >
              02 // ANTREAN {branding.documentPrefixPR}
            </span>
            <ArrowUpRight className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 transition shrink-0" />
          </div>
          <div className="my-3 flex items-baseline gap-2">
            <span className="font-mono text-2xl sm:text-3xl font-bold text-[#8A4B14]">
              {pendingPRs}
            </span>
            <span
              style={{ color: "var(--kr-text-muted)" }}
              className="text-xs font-medium"
            >
              Dokumen {branding.documentPrefixPR}
            </span>
          </div>
          <div
            style={{ borderColor: "var(--kr-border)" }}
            className="pt-2.5 border-t flex items-center justify-between font-mono text-[10px]"
          >
            <span style={{ color: "var(--kr-text-muted)" }}>
              SIAP JADI {branding.documentPrefixPO}
            </span>
            <span className="text-[#8A4B14] font-semibold">
              {approvedPRs} APPROVED
            </span>
          </div>
        </div>

        {/* Index 03: PO Dalam Pengiriman */}
        <div
          onClick={() => onNavigate("purchase-orders")}
          style={{ borderColor: "var(--kr-border)" }}
          className="p-4 sm:p-5 hover:opacity-90 transition cursor-pointer flex flex-col justify-between group"
        >
          <div className="flex items-center justify-between">
            <span
              style={{ color: "var(--kr-text-muted)" }}
              className="font-mono text-[10px] font-semibold uppercase tracking-widest"
            >
              03 // PESANAN ({branding.documentPrefixPO})
            </span>
            <ArrowUpRight className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 transition shrink-0" />
          </div>
          <div className="my-3 flex items-baseline gap-2">
            <span className="font-mono text-2xl sm:text-3xl font-bold">
              {activePOs}
            </span>
            <span
              style={{ color: "var(--kr-text-muted)" }}
              className="text-xs font-medium"
            >
              {branding.documentPrefixPO} Terbuka
            </span>
          </div>
          <div
            style={{ borderColor: "var(--kr-border)" }}
            className="pt-2.5 border-t flex items-center justify-between font-mono text-[10px]"
          >
            <span style={{ color: "var(--kr-text-muted)" }}>TAHAP TERIMA</span>
            <span className="text-[#1E4A6D] font-semibold">
              ORDERED / PARTIAL
            </span>
          </div>
        </div>

        {/* Index 04: Ambang Kritis */}
        <div
          onClick={() => onNavigate("inventory")}
          style={{ borderColor: "var(--kr-border)" }}
          className="p-4 sm:p-5 hover:opacity-90 transition cursor-pointer flex flex-col justify-between group"
        >
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] font-semibold uppercase tracking-widest text-[#9E2A20]">
              04 // AMBANG MINIMUM
            </span>
            <ArrowUpRight className="w-3.5 h-3.5 text-[#9E2A20] transition shrink-0" />
          </div>
          <div className="my-3 flex items-baseline gap-2">
            <span className="font-mono text-2xl sm:text-3xl font-bold text-[#9E2A20]">
              {criticalItems.length}
            </span>
            <span className="text-xs font-medium text-[#9E2A20]">
              {branding.itemTerm} Kritis
            </span>
          </div>
          <div
            style={{ borderColor: "var(--kr-border)" }}
            className="pt-2.5 border-t flex items-center justify-between font-mono text-[10px]"
          >
            <span style={{ color: "var(--kr-text-muted)" }}>ALERT EMAIL</span>
            <span className="text-[#9E2A20] font-semibold">
              {emailConfig.triggers.onCriticalStock ? "AKTIF" : "MANUAL"}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Bagian Tengah: Log Timbangan Bahan Masuk & Kartu Peringatan Stok */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Kolom Kiri (2 Kolom): Log Timbangan Penerimaan Fisik */}
        <div
          style={{
            backgroundColor: "var(--kr-bg-surface)",
            borderColor: "var(--kr-border)",
          }}
          className="lg:col-span-2 border p-5 sm:p-6 flex flex-col justify-between"
        >
          <div>
            {/* Header Log Timbangan — Anti-Wrapping pada Mobile */}
            <div
              style={{ borderColor: "var(--kr-border)" }}
              className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b pb-4 mb-5"
            >
              <div>
                <div
                  style={{ color: "var(--kr-text-muted)" }}
                  className="font-mono text-[10px] font-semibold uppercase tracking-widest"
                >
                  CATATAN PENERIMAAN FISIK // {branding.documentPrefixGR}
                </div>
                <h2 className="font-serif text-lg sm:text-xl font-normal mt-0.5">
                  Akumulasi Volume {branding.itemTerm} Masuk
                </h2>
                <p
                  style={{ color: "var(--kr-text-muted)" }}
                  className="text-xs mt-0.5"
                >
                  Rekapitulasi kuantitas bersih penerimaan barang selama 7 hari
                  terakhir
                </p>
              </div>

              {/* Stamped Total Box */}
              <div
                style={{
                  backgroundColor: "var(--kr-bg-elevated)",
                  borderColor: "var(--kr-border)",
                }}
                className="border px-3.5 py-2 flex sm:flex-col items-baseline sm:items-end justify-between gap-3 sm:gap-0.5 shrink-0"
              >
                <div
                  style={{ color: "var(--kr-text-muted)" }}
                  className="font-mono text-[10px] uppercase tracking-wider"
                >
                  TOTAL MINGGU INI
                </div>
                <div className="font-mono text-lg sm:text-xl font-bold whitespace-nowrap">
                  111.8 UNIT/KG
                </div>
                <div className="font-mono text-[10px] text-[#1D593B] font-semibold whitespace-nowrap">
                  +14.2% vs minggu lalu
                </div>
              </div>
            </div>

            {/* Grafik Kolom Timbangan Berbasis Ledger Grid */}
            <div className="relative pt-4 pb-2">
              <div
                style={{ borderColor: "var(--kr-border)" }}
                className="grid grid-cols-7 gap-2 sm:gap-3.5 h-44 sm:h-48 items-end pt-6 px-1 border-b relative"
              >
                {weeklyVolume.map((item) => (
                  <div
                    key={item.day}
                    className="flex flex-col items-center justify-end h-full group"
                  >
                    <div
                      style={{
                        color: item.active
                          ? "var(--kr-text-main)"
                          : "var(--kr-text-muted)",
                      }}
                      className={`font-mono text-[10px] mb-1.5 ${
                        item.active ? "font-bold" : ""
                      }`}
                    >
                      {item.value}
                    </div>
                    <div
                      style={{
                        backgroundColor: "var(--kr-bg-elevated)",
                        borderColor: "var(--kr-border)",
                      }}
                      className="w-full max-w-[40px] border h-full flex items-end p-0.5"
                    >
                      <div
                        style={{
                          height: item.height,
                          backgroundColor: item.active
                            ? "var(--kr-bg-sidebar)"
                            : "var(--kr-accent)",
                        }}
                        className="w-full transition-all duration-300"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-2 sm:gap-3.5 pt-2 px-1 text-center">
                {weeklyVolume.map((item) => (
                  <div key={item.day}>
                    <div
                      className={`font-mono text-[10px] ${
                        item.active ? "font-bold" : "opacity-75"
                      }`}
                    >
                      {item.day}
                    </div>
                    <div
                      style={{ color: "var(--kr-text-muted)" }}
                      className="font-mono text-[9px] hidden sm:block"
                    >
                      {item.lot}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div
            style={{ borderColor: "var(--kr-border)" }}
            className="mt-5 pt-3.5 border-t grid grid-cols-3 gap-2 font-mono text-[10px]"
          >
            <div>
              <span style={{ color: "var(--kr-text-muted)" }} className="block">
                KATEGORI UTAMA
              </span>
              <span className="font-semibold">{branding.itemTerm} Inti</span>
            </div>
            <div>
              <span style={{ color: "var(--kr-text-muted)" }} className="block">
                RATA-RATA HARIAN
              </span>
              <span className="font-semibold">15.97 / Hari</span>
            </div>
            <div className="text-right">
              <span style={{ color: "var(--kr-text-muted)" }} className="block">
                SELISIH AUDIT
              </span>
              <span className="font-semibold text-[#1D593B]">
                0.0% (Sesuai)
              </span>
            </div>
          </div>
        </div>

        {/* Kolom Kanan (1 Kolom): Bon Peringatan Saldo Minimum */}
        <div
          style={{
            backgroundColor: "var(--kr-bg-surface)",
            borderColor: "var(--kr-border)",
          }}
          className="border border-t-2 border-t-[#9E2A20] p-5 sm:p-6 flex flex-col justify-between"
        >
          <div>
            <div
              style={{ borderColor: "var(--kr-border)" }}
              className="flex items-start justify-between border-b pb-3.5 mb-4"
            >
              <div>
                <div className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#9E2A20] flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>BON PERINGATAN GUDANG</span>
                </div>
                <h3 className="font-serif text-lg font-normal mt-0.5">
                  Saldo di Bawah Minimum
                </h3>
              </div>
              <span className="font-mono text-[10px] font-bold text-[#9E2A20] bg-[#FCEAE8] border border-[#E6B8B3] px-2 py-0.5">
                {criticalItems.length} ITEM
              </span>
            </div>

            <div className="space-y-3">
              {criticalItems.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    backgroundColor: "var(--kr-bg-main)",
                    borderColor: "var(--kr-border)",
                  }}
                  className="p-3 border"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span
                      style={{ color: "var(--kr-text-muted)" }}
                      className="font-mono text-[10px] font-semibold"
                    >
                      {item.product.sku}
                    </span>
                    <span className="font-mono text-[10px] font-bold text-[#9E2A20]">
                      KURANG {item.deficit} {item.product.unit}
                    </span>
                  </div>
                  <div className="text-xs font-bold mt-0.5">
                    {item.product.name}
                  </div>
                  <div
                    style={{ color: "var(--kr-text-muted)" }}
                    className="flex items-center justify-between mt-2 font-mono text-[10px]"
                  >
                    <span className="flex items-center gap-1 truncate">
                      <Warehouse className="w-3 h-3 shrink-0" />
                      <span className="truncate">{item.warehouse.name}</span>
                    </span>
                    <span
                      style={{ color: "var(--kr-text-main)" }}
                      className="font-bold shrink-0"
                    >
                      {item.currentStock} / {item.minStock} {item.product.unit}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-[#E5DEC9] mt-2 overflow-hidden">
                    <div
                      style={{ width: `${item.fillRatio}%` }}
                      className="h-full bg-[#9E2A20]"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div
            style={{ borderColor: "var(--kr-border)" }}
            className="pt-4 border-t mt-4"
          >
            <button
              onClick={() => onNavigate("purchase-requests")}
              type="button"
              style={{
                backgroundColor: "var(--kr-bg-sidebar)",
                color: "var(--kr-text-sidebar)",
              }}
              className="w-full py-2.5 px-3 font-mono text-[11px] uppercase tracking-wider font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Susun {branding.documentPrefixPR} Pengadaan Baru</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 4. Jurnal Ekspedisi Dokumen */}
      <div
        style={{
          backgroundColor: "var(--kr-bg-surface)",
          borderColor: "var(--kr-border)",
        }}
        className="border"
      >
        <div
          style={{ borderColor: "var(--kr-border)" }}
          className="p-5 sm:p-6 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-2"
        >
          <div>
            <div
              style={{ color: "var(--kr-text-muted)" }}
              className="font-mono text-[10px] font-semibold uppercase tracking-widest"
            >
              JURNAL EKSPEDISI DOKUMEN
            </div>
            <h3 className="font-serif text-lg font-normal mt-0.5">
              Mutasi Dokumen Pengadaan Terkini
            </h3>
          </div>
          <div
            style={{
              backgroundColor: "var(--kr-bg-elevated)",
              borderColor: "var(--kr-border)",
              color: "var(--kr-text-muted)",
            }}
            className="font-mono text-[11px] border px-3 py-1.5"
          >
            ALUR BAKU: {branding.documentPrefixPR} → APPROVAL →{" "}
            {branding.documentPrefixPO} → {branding.documentPrefixGR}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr
                style={{
                  backgroundColor: "var(--kr-bg-elevated)",
                  borderColor: "var(--kr-border)",
                  color: "var(--kr-text-muted)",
                }}
                className="border-b font-mono text-[10px] uppercase tracking-wider"
              >
                <th className="py-3 px-5 font-semibold">No. Registrasi</th>
                <th className="py-3 px-4 font-semibold">Tahap Siklus</th>
                <th className="py-3 px-4 font-semibold">Gudang Tujuan</th>
                <th className="py-3 px-4 font-semibold">Tanggal Catat</th>
                <th className="py-3 px-4 font-semibold">Status Dokumen</th>
                <th className="py-3 px-5 text-right font-semibold">Berkas</th>
              </tr>
            </thead>
            <tbody
              style={{ borderColor: "var(--kr-border)" }}
              className="divide-y"
            >
              {recentTransactions.map((tx) => (
                <tr
                  key={tx.id}
                  style={{ borderColor: "var(--kr-border)" }}
                  className="hover:opacity-90 transition"
                >
                  <td className="py-3.5 px-5 font-mono font-bold whitespace-nowrap">
                    {tx.number}
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span
                      style={{ color: "var(--kr-text-muted)" }}
                      className="font-mono text-[10px] block"
                    >
                      {tx.stage}
                    </span>
                    <span className="font-medium">{tx.type}</span>
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {tx.warehouse}
                  </td>
                  <td
                    style={{ color: "var(--kr-text-muted)" }}
                    className="py-3.5 px-4 font-mono text-[11px] whitespace-nowrap"
                  >
                    {tx.date}
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-0.5 font-mono text-[10px] font-bold border ${tx.statusStyle}`}
                    >
                      {tx.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-5 text-right whitespace-nowrap">
                    <button
                      onClick={() => onNavigate(tx.targetTab)}
                      type="button"
                      className="font-mono text-[11px] font-semibold inline-flex items-center gap-1 cursor-pointer hover:underline"
                    >
                      <span>BUKA</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
