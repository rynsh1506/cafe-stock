import React, { useState } from "react";
import {
  Boxes,
  History,
  AlertTriangle,
  CheckCircle2,
  Warehouse,
} from "lucide-react";
import { useStore } from "@/context/StoreContext";
import { useKernel } from "@/kernel/KernelContext";

export const InventoryTab: React.FC = () => {
  const { products, warehouses, inventoryBalances, inventoryMovements } =
    useStore();
  const { branding, t } = useKernel();

  const [viewMode, setViewMode] = useState<"BALANCES" | "MOVEMENTS">(
    "BALANCES",
  );
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string>("ALL");

  const filteredBalances = inventoryBalances.filter(
    (b) =>
      selectedWarehouseId === "ALL" || b.warehouseId === selectedWarehouseId,
  );

  const filteredMovements = inventoryMovements.filter(
    (m) =>
      selectedWarehouseId === "ALL" || m.warehouseId === selectedWarehouseId,
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div
        style={{ borderColor: "var(--kr-border)" }}
        className="border-b pb-5 flex flex-col sm:flex-row sm:items-end justify-between gap-4"
      >
        <div>
          <div
            style={{ color: "var(--kr-text-muted)" }}
            className="font-mono text-[10px] uppercase tracking-widest flex items-center gap-2"
          >
            <Boxes
              style={{ color: "var(--kr-accent)" }}
              className="w-3.5 h-3.5"
            />
            <span>MOD-06 // WAREHOUSE BALANCES & APPEND-ONLY LEDGER</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-normal tracking-tight mt-1">
            {t("plugin.inventory.name")}
          </h1>
          <p
            style={{ color: "var(--kr-text-muted)" }}
            className="text-xs sm:text-sm mt-1 max-w-2xl"
          >
            {t("mod.inventory.desc")}
          </p>
        </div>

        {/* Warehouse Filter */}
        <div className="flex items-center gap-2">
          <Warehouse className="w-4 h-4 opacity-70" />
          <select
            value={selectedWarehouseId}
            onChange={(e) => setSelectedWarehouseId(e.target.value)}
            style={{
              backgroundColor: "var(--kr-bg-surface)",
              borderColor: "var(--kr-border)",
              color: "var(--kr-text-main)",
            }}
            className="px-3 py-2 border font-mono text-xs uppercase cursor-pointer"
          >
            <option value="ALL">SEMUA GUDANG ({warehouses.length})</option>
            {warehouses.map((wh) => (
              <option key={wh.id} value={wh.id}>
                [{wh.code}] {wh.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Sub-navigation: Stock Balances vs Movements Ledger */}
      <div
        style={{
          backgroundColor: "var(--kr-bg-surface)",
          borderColor: "var(--kr-border)",
        }}
        className="inline-flex border"
      >
        <button
          type="button"
          onClick={() => setViewMode("BALANCES")}
          style={{
            backgroundColor:
              viewMode === "BALANCES" ? "var(--kr-bg-sidebar)" : "transparent",
            color:
              viewMode === "BALANCES"
                ? "var(--kr-text-sidebar)"
                : "var(--kr-text-main)",
          }}
          className="px-4 py-2 font-mono text-xs font-semibold uppercase tracking-wider flex items-center gap-2 cursor-pointer"
        >
          <Boxes className="w-3.5 h-3.5" />
          <span>Saldo Gudang ({filteredBalances.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setViewMode("MOVEMENTS")}
          style={{
            backgroundColor:
              viewMode === "MOVEMENTS" ? "var(--kr-bg-sidebar)" : "transparent",
            color:
              viewMode === "MOVEMENTS"
                ? "var(--kr-text-sidebar)"
                : "var(--kr-text-main)",
            borderColor: "var(--kr-border)",
          }}
          className="px-4 py-2 font-mono text-xs font-semibold uppercase tracking-wider flex items-center gap-2 border-l cursor-pointer"
        >
          <History className="w-3.5 h-3.5" />
          <span>Riwayat Mutasi ({filteredMovements.length})</span>
        </button>
      </div>

      {viewMode === "BALANCES" ? (
        <div
          style={{
            backgroundColor: "var(--kr-bg-surface)",
            borderColor: "var(--kr-border)",
          }}
          className="border overflow-x-auto"
        >
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
                <th className="py-3 px-4">Lokasi Gudang</th>
                <th className="py-3 px-4">Kode SKU</th>
                <th className="py-3 px-4">Nama {branding.itemTerm}</th>
                <th className="py-3 px-4 text-right">Batas Min.</th>
                <th className="py-3 px-4 text-right">Saldo Fisik</th>
                <th className="py-3 px-4">Kesehatan Stok</th>
              </tr>
            </thead>
            <tbody
              style={{ borderColor: "var(--kr-border)" }}
              className="divide-y"
            >
              {filteredBalances.map((bal, idx) => {
                const wh = warehouses.find((w) => w.id === bal.warehouseId);
                const prod = products.find((p) => p.id === bal.productId);
                const minStock = prod?.minStock ?? 0;
                const isLow = bal.stock < minStock;

                return (
                  <tr key={idx} style={{ borderColor: "var(--kr-border)" }}>
                    <td className="py-3.5 px-4 font-mono text-[11px]">
                      <span className="font-bold">{wh?.code}</span> — {wh?.name}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold">
                      {prod?.sku ?? bal.productId}
                    </td>
                    <td className="py-3.5 px-4 font-semibold">
                      {prod?.name ?? bal.productId}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono">
                      {minStock} {prod?.unit}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-sm">
                      {bal.stock} {prod?.unit}
                    </td>
                    <td className="py-3.5 px-4">
                      {isLow ? (
                        <span className="px-2 py-0.5 font-mono text-[10px] font-bold border bg-[#FCEAE8] text-[#9E2A20] border-[#E6B8B3] inline-flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          <span>LOW STOCK (KURANG {minStock - bal.stock})</span>
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 font-mono text-[10px] font-bold border bg-[#E7F2EC] text-[#1D593B] border-[#B2D3C1] inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>SAFE THRESHOLD</span>
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div
          style={{
            backgroundColor: "var(--kr-bg-surface)",
            borderColor: "var(--kr-border)",
          }}
          className="border overflow-x-auto"
        >
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
                <th className="py-3 px-4">Waktu Catat</th>
                <th className="py-3 px-4">Tipe Mutasi</th>
                <th className="py-3 px-4">No. Referensi</th>
                <th className="py-3 px-4">Gudang</th>
                <th className="py-3 px-4">SKU / Item</th>
                <th className="py-3 px-4 text-right">Kuantitas Mutasi</th>
              </tr>
            </thead>
            <tbody
              style={{ borderColor: "var(--kr-border)" }}
              className="divide-y"
            >
              {filteredMovements.map((mov) => {
                const wh = warehouses.find((w) => w.id === mov.warehouseId);
                const prod = products.find((p) => p.id === mov.productId);
                return (
                  <tr key={mov.id} style={{ borderColor: "var(--kr-border)" }}>
                    <td className="py-3.5 px-4 font-mono text-[11px] whitespace-nowrap">
                      {new Date(mov.createdAt).toLocaleString("id-ID", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 font-mono text-[10px] font-bold border bg-[#E8F0F6] text-[#1E4A6D] border-[#B8CEE0]">
                        {mov.movementType}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold">
                      {mov.referenceId}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px]">
                      {wh?.name ?? mov.warehouseId}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-mono font-bold mr-1.5">
                        [{prod?.sku}]
                      </span>
                      <span>{prod?.name}</span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-[#1D593B]">
                      +{mov.quantity} {prod?.unit}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
