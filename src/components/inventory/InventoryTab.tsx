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
import { PaginationBar } from "@/components/layout/PaginationBar";

export const InventoryTab: React.FC = () => {
  const { products, warehouses, inventoryBalances, inventoryMovements } =
    useStore();
  const { branding, t } = useKernel();

  const [viewMode, setViewMode] = useState<"BALANCES" | "MOVEMENTS">(
    "BALANCES",
  );
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string>("ALL");
  const [balPage, setBalPage] = useState<number>(1);
  const [balPageSize, setBalPageSize] = useState<number>(10);
  const [movPage, setMovPage] = useState<number>(1);
  const [movPageSize, setMovPageSize] = useState<number>(10);

  const filteredBalances = inventoryBalances.filter(
    (b) =>
      selectedWarehouseId === "ALL" || b.warehouseId === selectedWarehouseId,
  );
  const paginatedBalances = filteredBalances.slice(
    (balPage - 1) * balPageSize,
    balPage * balPageSize,
  );

  const filteredMovements = inventoryMovements.filter(
    (m) =>
      selectedWarehouseId === "ALL" || m.warehouseId === selectedWarehouseId,
  );
  const paginatedMovements = filteredMovements.slice(
    (movPage - 1) * movPageSize,
    movPage * movPageSize,
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
            onChange={(e) => {
              setSelectedWarehouseId(e.target.value);
              setBalPage(1);
              setMovPage(1);
            }}
            style={{
              backgroundColor: "var(--kr-bg-surface)",
              borderColor: "var(--kr-border)",
              color: "var(--kr-text-main)",
            }}
            className="px-3 py-2 border font-mono text-xs uppercase cursor-pointer"
          >
            <option value="ALL">
              {t("mod.inv.allWarehouses")} ({warehouses.length})
            </option>
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
        className="inline-flex flex-wrap border"
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
          <span>
            {t("mod.inv.stockBalancesTab")} ({filteredBalances.length})
          </span>
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
          <span>
            {t("mod.inv.movementsTab")} ({filteredMovements.length})
          </span>
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
                <th className="py-3 px-4">{t("common.warehouse")}</th>
                <th className="py-3 px-4">{t("common.sku")}</th>
                <th className="py-3 px-4">
                  {t("common.name")} {branding.itemTerm}
                </th>
                <th className="py-3 px-4 text-right">{t("common.minStock")}</th>
                <th className="py-3 px-4 text-right">
                  {t("mod.inv.physicalStock")}
                </th>
                <th className="py-3 px-4">{t("mod.inv.stockHealth")}</th>
              </tr>
            </thead>
            <tbody
              style={{ borderColor: "var(--kr-border)" }}
              className="divide-y"
            >
              {paginatedBalances.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    style={{ color: "var(--kr-text-muted)" }}
                    className="py-8 px-4 text-center font-mono text-xs"
                  >
                    {t("common.emptyRecords")}
                  </td>
                </tr>
              ) : (
                paginatedBalances.map((bal, idx) => {
                  const wh = warehouses.find((w) => w.id === bal.warehouseId);
                  const prod = products.find((p) => p.id === bal.productId);
                  const minStock = prod?.minStock ?? 0;
                  const isLow = bal.stock < minStock;

                  return (
                    <tr key={idx} style={{ borderColor: "var(--kr-border)" }}>
                      <td className="py-3.5 px-4 font-mono text-[11px]">
                        <span className="font-bold">{wh?.code}</span> —{" "}
                        {wh?.name}
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
                            <span>
                              {t("mod.inv.lowStock")} (-{minStock - bal.stock})
                            </span>
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 font-mono text-[10px] font-bold border bg-[#E7F2EC] text-[#1D593B] border-[#B2D3C1] inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>{t("mod.inv.safeStock")}</span>
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
          <PaginationBar
            currentPage={balPage}
            totalItems={filteredBalances.length}
            pageSize={balPageSize}
            onPageChange={setBalPage}
            onPageSizeChange={(s) => {
              setBalPageSize(s);
              setBalPage(1);
            }}
          />
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
                <th className="py-3 px-4">{t("mod.inv.recordedTime")}</th>
                <th className="py-3 px-4">{t("mod.inv.movementType")}</th>
                <th className="py-3 px-4">{t("mod.inv.refNumber")}</th>
                <th className="py-3 px-4">{t("common.warehouse")}</th>
                <th className="py-3 px-4">{t("common.sku")}</th>
                <th className="py-3 px-4 text-right">
                  {t("mod.inv.movementQty")}
                </th>
              </tr>
            </thead>
            <tbody
              style={{ borderColor: "var(--kr-border)" }}
              className="divide-y"
            >
              {paginatedMovements.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    style={{ color: "var(--kr-text-muted)" }}
                    className="py-8 px-4 text-center font-mono text-xs"
                  >
                    {t("common.emptyRecords")}
                  </td>
                </tr>
              ) : (
                paginatedMovements.map((mov) => {
                  const wh = warehouses.find((w) => w.id === mov.warehouseId);
                  const prod = products.find((p) => p.id === mov.productId);
                  return (
                    <tr
                      key={mov.id}
                      style={{ borderColor: "var(--kr-border)" }}
                    >
                      <td className="py-3.5 px-4 font-mono text-[11px] whitespace-nowrap">
                        {new Date(mov.createdAt).toLocaleString()}
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
                })
              )}
            </tbody>
          </table>
          <PaginationBar
            currentPage={movPage}
            totalItems={filteredMovements.length}
            pageSize={movPageSize}
            onPageChange={setMovPage}
            onPageSizeChange={(s) => {
              setMovPageSize(s);
              setMovPage(1);
            }}
          />
        </div>
      )}
    </div>
  );
};
