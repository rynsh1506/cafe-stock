import React from "react";
import {
  FileText,
  AlertTriangle,
  ArrowUpRight,
  Plus,
  Warehouse,
} from "lucide-react";
import { NavigationTab } from "@/types";
import { useAuth } from "@/context/AuthContext";
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

  // Recent combined transactions with procurement stage context
  const recentTransactions = [
    {
      id: "tx_1",
      number: "PR-2026-000001",
      stage: "TAHAP 01 // PR",
      type: "Purchase Request",
      warehouse: "Gudang Utama Jakarta",
      date: "23 Okt 2026",
      status: "SUBMITTED",
      statusStyle: "bg-[#F9EFE0] text-[#8A4B14] border-[#DEC19B]",
      targetTab: "purchase-requests" as NavigationTab,
    },
    {
      id: "tx_2",
      number: "PO-2026-000001",
      stage: "TAHAP 02 // PO",
      type: "Purchase Order",
      warehouse: "Gudang Roastery Bandung",
      date: "22 Okt 2026",
      status: "ORDERED",
      statusStyle: "bg-[#E8F0F6] text-[#1E4A6D] border-[#B8CEE0]",
      targetTab: "purchase-orders" as NavigationTab,
    },
    {
      id: "tx_3",
      number: "GR-2026-000001",
      stage: "TAHAP 03 // GR",
      type: "Goods Receipt",
      warehouse: "Gudang Utama Jakarta",
      date: "21 Okt 2026",
      status: "RECEIVED",
      statusStyle: "bg-[#E7F2EC] text-[#1D593B] border-[#B2D3C1]",
      targetTab: "goods-receipts" as NavigationTab,
    },
    {
      id: "tx_4",
      number: "PR-2026-000003",
      stage: "TAHAP 01 // PR",
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
    { day: "SEN", date: "20/10", value: 12.4, height: "54%", lot: "Dairy" },
    { day: "SEL", date: "21/10", value: 15.8, height: "68%", lot: "Arabica" },
    { day: "RAB", date: "22/10", value: 19.2, height: "84%", lot: "Syrup" },
    {
      day: "KAM",
      date: "23/10",
      value: 14.7,
      height: "64%",
      lot: "Robusta",
      active: true,
    },
    { day: "JUM", date: "24/10", value: 22.0, height: "96%", lot: "Arabica" },
    { day: "SAB", date: "25/10", value: 17.5, height: "76%", lot: "Dairy" },
    { day: "MIN", date: "26/10", value: 10.2, height: "45%", lot: "Cup/Lid" },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Editorial Masthead (Menggantikan Banner AI Generik) */}
      <div className="border-b border-[#D8CFC0] pb-5 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-[#7A6858]">
            <span>LAPORAN HARIAN ROASTERY</span>
            <span>•</span>
            <span>2 GUDANG OPERASIONAL</span>
            <span>•</span>
            <span className="px-1.5 py-0.5 bg-[#EFEAD8] text-[#4A3828] border border-[#D4C8B4] font-semibold">
              PETUGAS: {currentUser.role}
            </span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-normal text-[#1A1411] tracking-tight mt-1.5">
            Buku Ikhtisar &amp; Kendali Pengadaan
          </h1>
          <p className="text-xs sm:text-sm text-[#6E5E50] mt-1 max-w-2xl">
            Pemantauan langsung dokumen permintaan bahan baku, pesanan pemasok,
            hingga timbang terima fisik di Gudang Jakarta dan Roastery Bandung.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          {currentUser.role === "APPROVER" ? (
            <button
              onClick={() => onNavigate("purchase-requests")}
              type="button"
              className="px-4 py-2.5 bg-[#1F1612] hover:bg-[#33241D] text-[#F7F3EC] font-mono text-xs uppercase tracking-wider font-semibold transition flex items-center gap-2 cursor-pointer border border-[#1F1612]"
            >
              <FileText className="w-3.5 h-3.5 text-[#D49B6A]" />
              <span>Periksa {pendingPRs} Dokumen PR</span>
            </button>
          ) : (
            <button
              onClick={() => onNavigate("purchase-requests")}
              type="button"
              className="px-4 py-2.5 bg-[#1F1612] hover:bg-[#33241D] text-[#F7F3EC] font-mono text-xs uppercase tracking-wider font-semibold transition flex items-center gap-2 cursor-pointer border border-[#1F1612]"
            >
              <Plus className="w-3.5 h-3.5 text-[#D49B6A]" />
              <span>Buat Purchase Request</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Architectural Ledger Strip (Menggantikan 4 Kotak KPI Generik) */}
      <div className="bg-[#FDFBF7] border border-[#D8CFC0] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[#DFD6C7]">
        {/* Index 01: Master Produk */}
        <div
          onClick={() => onNavigate("products")}
          className="p-4 sm:p-5 hover:bg-[#F7F2E7] transition cursor-pointer flex flex-col justify-between group"
        >
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] font-semibold uppercase tracking-widest text-[#7A6858]">
              01 // KATALOG BAHAN
            </span>
            <ArrowUpRight className="w-3.5 h-3.5 text-[#9C8B7A] group-hover:text-[#1A1411] transition shrink-0" />
          </div>
          <div className="my-3 flex items-baseline gap-2">
            <span className="font-mono text-2xl sm:text-3xl font-bold text-[#1A1411]">
              {totalProducts}
            </span>
            <span className="text-xs font-medium text-[#5E4F42]">
              SKU Terdaftar
            </span>
          </div>
          <div className="pt-2.5 border-t border-[#EAE3D5] flex items-center justify-between font-mono text-[10px]">
            <span className="text-[#6E5E50]">STATUS MASTER</span>
            <span className="text-[#1D593B] font-semibold">100% AKTIF</span>
          </div>
        </div>

        {/* Index 02: Antrean PR */}
        <div
          onClick={() => onNavigate("purchase-requests")}
          className="p-4 sm:p-5 hover:bg-[#F7F2E7] transition cursor-pointer flex flex-col justify-between group sm:border-b lg:border-b-0 border-[#DFD6C7]"
        >
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] font-semibold uppercase tracking-widest text-[#7A6858]">
              02 // ANTREAN OTORISASI
            </span>
            <ArrowUpRight className="w-3.5 h-3.5 text-[#9C8B7A] group-hover:text-[#1A1411] transition shrink-0" />
          </div>
          <div className="my-3 flex items-baseline gap-2">
            <span className="font-mono text-2xl sm:text-3xl font-bold text-[#8A4B14]">
              {pendingPRs}
            </span>
            <span className="text-xs font-medium text-[#5E4F42]">
              Dokumen PR
            </span>
          </div>
          <div className="pt-2.5 border-t border-[#EAE3D5] flex items-center justify-between font-mono text-[10px]">
            <span className="text-[#6E5E50]">SIAP JADI PO</span>
            <span className="text-[#8A4B14] font-semibold">
              {approvedPRs} APPROVED
            </span>
          </div>
        </div>

        {/* Index 03: PO Dalam Pengiriman */}
        <div
          onClick={() => onNavigate("purchase-orders")}
          className="p-4 sm:p-5 hover:bg-[#F7F2E7] transition cursor-pointer flex flex-col justify-between group"
        >
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] font-semibold uppercase tracking-widest text-[#7A6858]">
              03 // PESANAN PEMASOK
            </span>
            <ArrowUpRight className="w-3.5 h-3.5 text-[#9C8B7A] group-hover:text-[#1A1411] transition shrink-0" />
          </div>
          <div className="my-3 flex items-baseline gap-2">
            <span className="font-mono text-2xl sm:text-3xl font-bold text-[#1A1411]">
              {activePOs}
            </span>
            <span className="text-xs font-medium text-[#5E4F42]">
              PO Terbuka
            </span>
          </div>
          <div className="pt-2.5 border-t border-[#EAE3D5] flex items-center justify-between font-mono text-[10px]">
            <span className="text-[#6E5E50]">TAHAP TERIMA</span>
            <span className="text-[#1E4A6D] font-semibold">
              ORDERED / PARTIAL
            </span>
          </div>
        </div>

        {/* Index 04: Ambang Kritis */}
        <div
          onClick={() => onNavigate("inventory")}
          className="p-4 sm:p-5 hover:bg-[#F7F2E7] transition cursor-pointer flex flex-col justify-between group"
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
            <span className="text-xs font-medium text-[#7A271F]">
              Bahan Kritis
            </span>
          </div>
          <div className="pt-2.5 border-t border-[#EAE3D5] flex items-center justify-between font-mono text-[10px]">
            <span className="text-[#6E5E50]">TINDAKAN</span>
            <span className="text-[#9E2A20] font-semibold">WAJIB RESTOCK</span>
          </div>
        </div>
      </div>

      {/* 3. Bagian Tengah: Log Timbangan Bahan Masuk & Kartu Peringatan Stok */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Kolom Kiri (2 Kolom): Log Timbangan Penerimaan Fisik (Goods Receipt) */}
        <div className="lg:col-span-2 bg-[#FDFBF7] border border-[#D8CFC0] p-5 sm:p-6 flex flex-col justify-between">
          <div>
            {/* Header Log Timbangan — Anti-Wrapping pada Mobile */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-[#DFD6C7] pb-4 mb-5">
              <div>
                <div className="font-mono text-[10px] font-semibold uppercase tracking-widest text-[#7A6858]">
                  CATATAN TIMBANGAN FISIK // GOODS RECEIPT
                </div>
                <h2 className="font-serif text-lg sm:text-xl font-medium text-[#1A1411] mt-0.5">
                  Akumulasi Tonase Bahan Baku Masuk
                </h2>
                <p className="text-xs text-[#6E5E50] mt-0.5">
                  Rekapitulasi berat bersih penerimaan barang selama 7 hari
                  terakhir
                </p>
              </div>

              {/* Stamped Total Box */}
              <div className="bg-[#F4EFE4] border border-[#D8CFC0] px-3.5 py-2 flex sm:flex-col items-baseline sm:items-end justify-between gap-3 sm:gap-0.5 shrink-0">
                <div className="font-mono text-[10px] uppercase tracking-wider text-[#6E5E50]">
                  TOTAL MINGGU INI
                </div>
                <div className="font-mono text-lg sm:text-xl font-bold text-[#1A1411] whitespace-nowrap">
                  111.8 KG
                </div>
                <div className="font-mono text-[10px] text-[#1D593B] font-semibold whitespace-nowrap">
                  +14.2% vs minggu lalu
                </div>
              </div>
            </div>

            {/* Grafik Kolom Timbangan Berbasis Ledger Grid */}
            <div className="relative pt-4 pb-2">
              {/* Garis Panduan Horizontal */}
              <div className="grid grid-cols-7 gap-2 sm:gap-3.5 h-44 sm:h-48 items-end pt-6 px-1 border-b border-[#CFC5B5] relative">
                {weeklyVolume.map((item) => (
                  <div
                    key={item.day}
                    className="flex flex-col items-center justify-end h-full group"
                  >
                    {/* Angka Timbangan Selalu Terbaca di Atas Bar */}
                    <div
                      className={`font-mono text-[10px] mb-1.5 ${
                        item.active
                          ? "font-bold text-[#1A1411]"
                          : "text-[#7A6858]"
                      }`}
                    >
                      {item.value}
                    </div>
                    <div className="w-full max-w-[40px] bg-[#EFEAD8] border border-[#DED5C5] h-full flex items-end p-0.5">
                      <div
                        style={{ height: item.height }}
                        className={`w-full transition-all duration-300 ${
                          item.active
                            ? "bg-[#1F1612]"
                            : "bg-[#8C6239] group-hover:bg-[#5A3825]"
                        }`}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Label Hari & Lot */}
              <div className="grid grid-cols-7 gap-2 sm:gap-3.5 pt-2 px-1 text-center">
                {weeklyVolume.map((item) => (
                  <div key={item.day}>
                    <div
                      className={`font-mono text-[10px] ${
                        item.active
                          ? "font-bold text-[#1A1411]"
                          : "font-medium text-[#6E5E50]"
                      }`}
                    >
                      {item.day}
                    </div>
                    <div className="font-mono text-[9px] text-[#9C8B7A] hidden sm:block">
                      {item.lot}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Ringkasan Komposisi Lot di Bawah Grafik */}
          <div className="mt-5 pt-3.5 border-t border-[#EAE3D5] grid grid-cols-3 gap-2 font-mono text-[10px]">
            <div>
              <span className="text-[#8C7B6B] block">LOT DOMINAN</span>
              <span className="font-semibold text-[#1A1411]">
                Arabica &amp; House Blend
              </span>
            </div>
            <div>
              <span className="text-[#8C7B6B] block">RATA-RATA HARIAN</span>
              <span className="font-semibold text-[#1A1411]">
                15.97 KG / Hari
              </span>
            </div>
            <div className="text-right">
              <span className="text-[#8C7B6B] block">SELISIH TIMBANG</span>
              <span className="font-semibold text-[#1D593B]">
                0.0% (Sesuai)
              </span>
            </div>
          </div>
        </div>

        {/* Kolom Kanan (1 Kolom): Bon Peringatan Saldo Minimum */}
        <div className="bg-[#FDFBF7] border border-[#D8CFC0] border-t-2 border-t-[#9E2A20] p-5 sm:p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between border-b border-[#DFD6C7] pb-3.5 mb-4">
              <div>
                <div className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#9E2A20] flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>BON PERINGATAN GUDANG</span>
                </div>
                <h3 className="font-serif text-lg font-medium text-[#1A1411] mt-0.5">
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
                  className="p-3 border border-[#E2D8C8] bg-[#F8F4EC]"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[10px] font-semibold text-[#7A6858]">
                      {item.product.sku}
                    </span>
                    <span className="font-mono text-[10px] font-bold text-[#9E2A20]">
                      KURANG {item.deficit} {item.product.unit}
                    </span>
                  </div>
                  <div className="text-xs font-bold text-[#1A1411] mt-0.5">
                    {item.product.name}
                  </div>
                  <div className="flex items-center justify-between mt-2 font-mono text-[10px] text-[#6E5E50]">
                    <span className="flex items-center gap-1 truncate">
                      <Warehouse className="w-3 h-3 shrink-0" />
                      <span className="truncate">{item.warehouse.name}</span>
                    </span>
                    <span className="font-bold text-[#1A1411] shrink-0">
                      {item.currentStock} / {item.minStock} {item.product.unit}
                    </span>
                  </div>
                  {/* Bar Indikator Deplesi Stok */}
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

          <div className="pt-4 border-t border-[#DFD6C7] mt-4">
            <button
              onClick={() => onNavigate("purchase-requests")}
              type="button"
              className="w-full py-2.5 px-3 bg-[#1F1612] hover:bg-[#33241D] text-[#F7F3EC] font-mono text-[11px] uppercase tracking-wider font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Susun PR Pengadaan Baru</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 4. Jurnal Ekspedisi Dokumen (Tabel Riwayat Transaksi) */}
      <div className="bg-[#FDFBF7] border border-[#D8CFC0]">
        <div className="p-5 sm:p-6 border-b border-[#DFD6C7] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="font-mono text-[10px] font-semibold uppercase tracking-widest text-[#7A6858]">
              JURNAL EKSPEDISI DOKUMEN
            </div>
            <h3 className="font-serif text-lg font-medium text-[#1A1411] mt-0.5">
              Mutasi Dokumen Pengadaan Terkini
            </h3>
          </div>
          <div className="font-mono text-[11px] text-[#6E5E50] bg-[#F4EFE4] border border-[#DFD6C7] px-3 py-1.5">
            ALUR BAKU: PR → APPROVAL → PO → GOODS RECEIPT
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#DFD6C7] bg-[#F6F2E9] font-mono text-[10px] text-[#6E5E50] uppercase tracking-wider">
                <th className="py-3 px-5 font-semibold">No. Registrasi</th>
                <th className="py-3 px-4 font-semibold">Tahap Siklus</th>
                <th className="py-3 px-4 font-semibold">Gudang Tujuan</th>
                <th className="py-3 px-4 font-semibold">Tanggal Catat</th>
                <th className="py-3 px-4 font-semibold">Status Dokumen</th>
                <th className="py-3 px-5 text-right font-semibold">Berkas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EAE3D5]">
              {recentTransactions.map((tx) => (
                <tr
                  key={tx.id}
                  className="hover:bg-[#F7F3EA] transition text-[#1A1411]"
                >
                  <td className="py-3.5 px-5 font-mono font-bold text-[#1A1411] whitespace-nowrap">
                    {tx.number}
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className="font-mono text-[10px] text-[#7A6858] block">
                      {tx.stage}
                    </span>
                    <span className="font-medium text-[#2E231C]">
                      {tx.type}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-[#4A3B30] whitespace-nowrap">
                    {tx.warehouse}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[11px] text-[#6E5E50] whitespace-nowrap">
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
                      className="font-mono text-[11px] text-[#5A3825] hover:text-[#1A1411] font-semibold inline-flex items-center gap-1 cursor-pointer"
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
