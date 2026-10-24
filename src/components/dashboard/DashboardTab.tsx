import React from "react";
import {
  Package,
  FileText,
  ShoppingCart,
  Truck,
  AlertTriangle,
  Clock,
  ArrowUpRight,
  TrendingUp,
  Warehouse,
  Boxes,
  CheckCircle2,
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
    return {
      product,
      warehouse,
      currentStock: balance.stock,
      minStock: product.minStock,
    };
  });

  // Recent combined transactions
  const recentTransactions = [
    {
      id: "tx_1",
      number: "PR-2026-000001",
      type: "Purchase Request",
      warehouse: "Gudang Utama Jakarta",
      date: "23 Okt 2026",
      status: "SUBMITTED",
      statusColor: "bg-[#FFF8E1] text-[#B45309] border-[#FDE68A]",
      targetTab: "purchase-requests" as NavigationTab,
    },
    {
      id: "tx_2",
      number: "PO-2026-000001",
      type: "Purchase Order",
      warehouse: "Gudang Roastery Bandung",
      date: "22 Okt 2026",
      status: "ORDERED",
      statusColor: "bg-[#EFF6FF] text-[#1D4ED8] border-[#BFDBFE]",
      targetTab: "purchase-orders" as NavigationTab,
    },
    {
      id: "tx_3",
      number: "GR-2026-000001",
      type: "Goods Receipt",
      warehouse: "Gudang Utama Jakarta",
      date: "21 Okt 2026",
      status: "RECEIVED",
      statusColor: "bg-[#ECFDF5] text-[#047857] border-[#A7F3D0]",
      targetTab: "goods-receipts" as NavigationTab,
    },
    {
      id: "tx_4",
      number: "PR-2026-000003",
      type: "Purchase Request",
      warehouse: "Gudang Roastery Bandung",
      date: "22 Okt 2026",
      status: "APPROVED",
      statusColor: "bg-[#F0FDF4] text-[#15803D] border-[#BBF7D0]",
      targetTab: "purchase-requests" as NavigationTab,
    },
  ];

  // Bar chart weekly mockup data from Figma
  const weeklyVolume = [
    { day: "Sen", value: 12.4, height: "55%" },
    { day: "Sel", value: 15.8, height: "70%" },
    { day: "Rab", value: 19.2, height: "85%" },
    { day: "Kam", value: 14.7, height: "65%", active: true },
    { day: "Jum", value: 22.0, height: "100%" },
    { day: "Sab", value: 17.5, height: "78%" },
    { day: "Min", value: 10.2, height: "45%" },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner Sesuai Figma */}
      <div className="bg-gradient-to-r from-[#2C1E18] to-[#4A2D1D] rounded-2xl p-5 sm:p-7 text-white shadow-md border border-[#523323] flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center justify-between sm:justify-start gap-2 text-[11px] font-semibold uppercase tracking-wider text-[#D8A57A] mb-1.5">
            <span>Sistem Pengadaan & Stok</span>
            <span className="opacity-60">•</span>
            <span className="px-2 py-0.5 rounded-full bg-[#5A3825] text-white text-[10px] font-bold border border-[#7A4D33] whitespace-nowrap shrink-0">
              Role: {currentUser.role}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-serif font-bold text-white tracking-tight">
            Selamat Datang di CafeStock, {currentUser.name}
          </h1>
          <p className="text-xs sm:text-sm text-[#D7CBC1] mt-1 max-w-2xl leading-relaxed">
            Kelola seluruh alur pembelian dari Purchase Request, Approval
            manajerial, Purchase Order, hingga pencatatan Goods Receipt dan stok
            gudang terupdate secara konsisten.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          {currentUser.role === "APPROVER" ? (
            <button
              onClick={() => onNavigate("purchase-requests")}
              type="button"
              className="px-4 py-2.5 rounded-xl bg-[#C68B59] hover:bg-[#B37948] active:bg-[#9B6437] text-white text-xs font-bold transition shadow-sm flex items-center gap-2 cursor-pointer"
            >
              <FileText className="w-4 h-4" />
              <span>Tinjau 2 Permintaan</span>
            </button>
          ) : (
            <button
              onClick={() => onNavigate("purchase-requests")}
              type="button"
              className="px-4 py-2.5 rounded-xl bg-[#C68B59] hover:bg-[#B37948] active:bg-[#9B6437] text-white text-xs font-bold transition shadow-sm flex items-center gap-2 cursor-pointer"
            >
              <FileText className="w-4 h-4" />
              <span>+ Buat Purchase Request</span>
            </button>
          )}
        </div>
      </div>

      {/* 4 Kartu KPI Metrik Utama */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {/* Total Master Produk */}
        <div
          onClick={() => onNavigate("products")}
          className="bg-white p-4 sm:p-5 rounded-2xl border border-[#EDE4D8] shadow-xs hover:border-[#D5C5B5] transition cursor-pointer flex items-center justify-between group"
        >
          <div>
            <div className="text-[11px] font-bold text-[#8C7665] uppercase tracking-wider">
              Total Master Produk
            </div>
            <div className="text-xl sm:text-2xl font-bold text-[#2E1F16] mt-1 group-hover:text-[#5A3825] transition">
              {totalProducts} SKU
            </div>
            <div className="text-[10px] text-[#2E7D32] flex items-center gap-1 mt-1 font-medium">
              <CheckCircle2 className="w-3 h-3" />
              <span>Semua aktif di transaksi</span>
            </div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-[#F7F2EB] text-[#5A3825] flex items-center justify-center shrink-0 group-hover:scale-105 transition">
            <Package className="w-5 h-5" />
          </div>
        </div>

        {/* PR Perlu Review */}
        <div
          onClick={() => onNavigate("purchase-requests")}
          className="bg-white p-4 sm:p-5 rounded-2xl border border-[#EDE4D8] shadow-xs hover:border-[#D5C5B5] transition cursor-pointer flex items-center justify-between group"
        >
          <div>
            <div className="text-[11px] font-bold text-[#8C7665] uppercase tracking-wider">
              PR Perlu Review
            </div>
            <div className="text-xl sm:text-2xl font-bold text-[#2E1F16] mt-1 group-hover:text-[#B45309] transition">
              {pendingPRs} Pengajuan
            </div>
            <div className="text-[10px] text-[#D97706] flex items-center gap-1 mt-1 font-medium">
              <Clock className="w-3 h-3" />
              <span>Status SUBMITTED</span>
            </div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-[#FFF8E1] text-[#D97706] flex items-center justify-center shrink-0 group-hover:scale-105 transition">
            <FileText className="w-5 h-5" />
          </div>
        </div>

        {/* PO Aktif / Menunggu GR */}
        <div
          onClick={() => onNavigate("purchase-orders")}
          className="bg-white p-4 sm:p-5 rounded-2xl border border-[#EDE4D8] shadow-xs hover:border-[#D5C5B5] transition cursor-pointer flex items-center justify-between group"
        >
          <div>
            <div className="text-[11px] font-bold text-[#8C7665] uppercase tracking-wider">
              PO Aktif / Penerimaan
            </div>
            <div className="text-xl sm:text-2xl font-bold text-[#2E1F16] mt-1 group-hover:text-[#5A3825] transition">
              {activePOs} Pesanan
            </div>
            <div className="text-[10px] text-[#5A3825] flex items-center gap-1 mt-1 font-medium">
              <Truck className="w-3 h-3" />
              <span>ORDERED / PARTIAL</span>
            </div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-[#F7F2EB] text-[#5A3825] flex items-center justify-center shrink-0 group-hover:scale-105 transition">
            <ShoppingCart className="w-5 h-5" />
          </div>
        </div>

        {/* Stok Kritis Gudang */}
        <div
          onClick={() => onNavigate("inventory")}
          className="bg-white p-4 sm:p-5 rounded-2xl border border-[#EDE4D8] shadow-xs hover:border-[#D5C5B5] transition cursor-pointer flex items-center justify-between group"
        >
          <div>
            <div className="text-[11px] font-bold text-[#8C7665] uppercase tracking-wider">
              Stok Kritis Gudang
            </div>
            <div className="text-xl sm:text-2xl font-bold text-[#C62828] mt-1">
              {criticalItems.length} Item
            </div>
            <div className="text-[10px] text-[#C62828] flex items-center gap-1 mt-1 font-medium">
              <AlertTriangle className="w-3 h-3" />
              <span>Saldo di bawah batas min</span>
            </div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-[#FFEBEE] text-[#C62828] flex items-center justify-center shrink-0 group-hover:scale-105 transition">
            <Boxes className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Bagian Tengah: Visual Grafik Bar Aktivitas & Widget Stok Kritis Sesuai Figma */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Kolom Kiri: Visual Grafik Penerimaan Bahan Baku Mingguan (2 Kolom) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-[#EDE4D8] p-5 sm:p-6 shadow-xs">
          <div className="flex items-center justify-between border-b border-[#F0E7DD] pb-4 mb-5">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-[#8C7665]">
                Aktivitas Pengadaan
              </div>
              <h2 className="text-base font-bold text-[#2E1F16] flex items-center gap-2 mt-0.5">
                Volume Bahan Baku Masuk
                <span className="text-xs font-normal text-[#8A7566]">
                  (Minggu Ini)
                </span>
              </h2>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-[#2E1F16]">101.9 KG</div>
              <div className="text-[10px] text-[#2E7D32] flex items-center gap-1 justify-end font-semibold">
                <TrendingUp className="w-3 h-3" />
                <span>+14% vs minggu lalu</span>
              </div>
            </div>
          </div>

          {/* Bar Chart Sesuai Figma Screen 2 */}
          <div className="h-44 sm:h-52 flex items-end justify-between gap-2 sm:gap-4 px-2 pt-6 pb-2">
            {weeklyVolume.map((item) => (
              <div
                key={item.day}
                className="flex-1 flex flex-col items-center gap-2 h-full justify-end group"
              >
                <div className="text-[10px] font-bold text-[#8C7665] opacity-0 group-hover:opacity-100 transition">
                  {item.value} kg
                </div>
                <div className="w-full max-w-[36px] bg-[#EDE4D8] rounded-t-lg relative overflow-hidden h-full flex items-end">
                  <div
                    style={{ height: item.height }}
                    className={`w-full rounded-t-lg transition-all duration-300 ${
                      item.active
                        ? "bg-[#5A3825] shadow-md"
                        : "bg-[#C68B59] hover:bg-[#A86F3E]"
                    }`}
                  />
                </div>
                <div
                  className={`text-xs font-semibold ${
                    item.active ? "text-[#5A3825] font-bold" : "text-[#8A7566]"
                  }`}
                >
                  {item.day}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Kolom Kanan: Widget Stok Perlu Perhatian (1 Kolom) */}
        <div className="bg-white rounded-2xl border border-[#EDE4D8] p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-[#F0E7DD] pb-4 mb-4">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-[#C62828] flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-[#C62828]" />
                  Perhatian Stok
                </div>
                <h3 className="text-base font-bold text-[#2E1F16] mt-0.5">
                  Bahan Kritis / Menipis
                </h3>
              </div>
              <span className="text-xs font-bold text-[#C62828] bg-[#FFEBEE] px-2 py-0.5 rounded-full">
                {criticalItems.length} SKU
              </span>
            </div>

            <div className="space-y-3">
              {criticalItems.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl border border-[#F3E7DC] bg-[#FCFAF7] hover:border-[#D5C5B5] transition"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#2E1F16] truncate max-w-[170px]">
                      {item.product.name}
                    </span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#FFEBEE] text-[#C62828] border border-[#FFCDD2] shrink-0">
                      Kritis
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-2 text-[11px] text-[#7A685B]">
                    <span className="flex items-center gap-1 text-[10px] text-[#8C7665]">
                      <Warehouse className="w-3 h-3" />
                      {item.warehouse.name}
                    </span>
                    <span className="font-bold text-[#C62828]">
                      {item.currentStock} / Min {item.minStock}{" "}
                      {item.product.unit}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-[#F0E7DD] mt-4">
            <button
              onClick={() => onNavigate("purchase-requests")}
              type="button"
              className="w-full py-2.5 px-3 rounded-xl bg-[#5A3825] hover:bg-[#432718] text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
            >
              <span>+ Buat Permintaan Pembelian</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Tabel Transaksi Terkini Sesuai Figma Screen 2 */}
      <div className="bg-white rounded-2xl border border-[#EDE4D8] p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#F0E7DD] pb-4 mb-4">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-[#8C7665]">
              Riwayat Sistem
            </div>
            <h3 className="text-base font-bold text-[#2E1F16] mt-0.5">
              Transaksi Terkini
            </h3>
          </div>
          <div className="text-xs text-[#8C7665]">
            Siklus: PR $\rightarrow$ Approval $\rightarrow$ PO $\rightarrow$
            Goods Receipt
          </div>
        </div>

        {/* Tabel Responsif */}
        <div className="overflow-x-auto -mx-5 sm:mx-0">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#EDE4D8] text-[#8C7665] font-bold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4">No. Dokumen</th>
                <th className="py-3 px-4">Jenis Dokumen</th>
                <th className="py-3 px-4">Gudang Tujuan</th>
                <th className="py-3 px-4">Tanggal</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F5EDE4]">
              {recentTransactions.map((tx) => (
                <tr
                  key={tx.id}
                  className="hover:bg-[#FAF7F2] transition text-[#2E1F16]"
                >
                  <td className="py-3 px-4 font-mono font-bold text-[#5A3825]">
                    {tx.number}
                  </td>
                  <td className="py-3 px-4 font-medium text-[#4A382C]">
                    {tx.type}
                  </td>
                  <td className="py-3 px-4 text-[#6A574A]">{tx.warehouse}</td>
                  <td className="py-3 px-4 text-[#8C7665]">{tx.date}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${tx.statusColor} whitespace-nowrap`}
                    >
                      {tx.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => onNavigate(tx.targetTab)}
                      type="button"
                      className="text-xs text-[#5A3825] hover:text-[#2E1F16] font-bold hover:underline inline-flex items-center gap-1"
                    >
                      <span>Lihat</span>
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
