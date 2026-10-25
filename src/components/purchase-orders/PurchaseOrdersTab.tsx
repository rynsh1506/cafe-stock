import React, { useState } from "react";
import { ShoppingCart, Plus, Send, XCircle, Truck, X } from "lucide-react";
import { NavigationTab, POStatus } from "@/types";
import { useStore } from "@/context/StoreContext";
import { useAuth } from "@/context/AuthContext";
import { useKernel } from "@/kernel/KernelContext";

interface PurchaseOrdersTabProps {
  onNavigate: (tab: NavigationTab) => void;
}

export const PurchaseOrdersTab: React.FC<PurchaseOrdersTabProps> = ({
  onNavigate,
}) => {
  const {
    purchaseOrders,
    purchaseRequests,
    suppliers,
    warehouses,
    products,
    createPurchaseOrder,
    markPurchaseOrderOrdered,
    cancelPurchaseOrder,
  } = useStore();
  const { currentUser } = useAuth();
  const { branding, t } = useKernel();

  const approvedPRs = purchaseRequests.filter((pr) => pr.status === "APPROVED");
  const activeSuppliers = suppliers.filter((s) => s.isActive);

  const [statusFilter, setStatusFilter] = useState<POStatus | "ALL">("ALL");
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [selectedPrId, setSelectedPrId] = useState<string>(
    approvedPRs[0]?.id ?? "",
  );
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>(
    activeSuppliers[0]?.id ?? "",
  );

  const filteredPOs = purchaseOrders.filter(
    (po) => statusFilter === "ALL" || po.status === statusFilter,
  );

  const handleOpenCreateModal = (): void => {
    setSelectedPrId(approvedPRs[0]?.id ?? "");
    setSelectedSupplierId(activeSuppliers[0]?.id ?? "");
    setShowCreateModal(true);
  };

  const handleCreatePO = (orderImmediately: boolean): void => {
    if (!selectedPrId || !selectedSupplierId) {
      return;
    }
    createPurchaseOrder({
      purchaseRequestId: selectedPrId,
      supplierId: selectedSupplierId,
      orderImmediately,
      createdBy: currentUser.username,
      prefixPO: branding.documentPrefixPO,
    });
    setShowCreateModal(false);
  };

  const getStatusStyle = (status: POStatus): string => {
    switch (status) {
      case "DRAFT":
        return "bg-[#F2EFE9] text-[#5C5346] border-[#D8D0C0]";
      case "ORDERED":
        return "bg-[#E8F0F6] text-[#1E4A6D] border-[#B8CEE0]";
      case "PARTIALLY_RECEIVED":
        return "bg-[#F9EFE0] text-[#8A4B14] border-[#DEC19B]";
      case "RECEIVED":
        return "bg-[#E7F2EC] text-[#1D593B] border-[#B2D3C1]";
      case "CANCELLED":
        return "bg-[#FCEAE8] text-[#9E2A20] border-[#E6B8B3]";
    }
  };

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
            <ShoppingCart
              style={{ color: "var(--kr-accent)" }}
              className="w-3.5 h-3.5"
            />
            <span>MOD-04 // {branding.documentPrefixPO} SUPPLIER DISPATCH</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-normal tracking-tight mt-1">
            {t("plugin.purchaseOrders.name")}
          </h1>
          <p
            style={{ color: "var(--kr-text-muted)" }}
            className="text-xs sm:text-sm mt-1 max-w-2xl"
          >
            {t("mod.po.desc")}
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreateModal}
          style={{
            backgroundColor: "var(--kr-bg-sidebar)",
            color: "var(--kr-text-sidebar)",
          }}
          className="px-4 py-2.5 font-mono text-xs uppercase tracking-wider font-semibold flex items-center gap-2 cursor-pointer self-start sm:self-auto shrink-0"
        >
          <Plus style={{ color: "var(--kr-accent)" }} className="w-3.5 h-3.5" />
          <span>
            + Terbitkan {branding.documentPrefixPO} dari{" "}
            {branding.documentPrefixPR}
          </span>
        </button>
      </div>

      {/* Status Filter */}
      <div className="flex flex-wrap items-center gap-1.5">
        {(
          [
            "ALL",
            "DRAFT",
            "ORDERED",
            "PARTIALLY_RECEIVED",
            "RECEIVED",
            "CANCELLED",
          ] as (POStatus | "ALL")[]
        ).map((st) => (
          <button
            key={st}
            type="button"
            onClick={() => setStatusFilter(st)}
            style={{
              backgroundColor:
                statusFilter === st
                  ? "var(--kr-bg-sidebar)"
                  : "var(--kr-bg-surface)",
              color:
                statusFilter === st
                  ? "var(--kr-text-sidebar)"
                  : "var(--kr-text-main)",
              borderColor: "var(--kr-border)",
            }}
            className="px-3 py-1.5 border font-mono text-[10px] font-semibold uppercase tracking-wider cursor-pointer"
          >
            {st === "ALL" ? `SEMUA (${purchaseOrders.length})` : st}
          </button>
        ))}
      </div>

      {/* PO List */}
      <div className="space-y-4">
        {filteredPOs.map((po) => {
          const sup = suppliers.find((s) => s.id === po.supplierId);
          const wh = warehouses.find((w) => w.id === po.warehouseId);
          const pr = purchaseRequests.find(
            (r) => r.id === po.purchaseRequestId,
          );
          return (
            <div
              key={po.id}
              style={{
                backgroundColor: "var(--kr-bg-surface)",
                borderColor: "var(--kr-border)",
              }}
              className="border p-5"
            >
              <div
                style={{ borderColor: "var(--kr-border)" }}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3.5 mb-4"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="font-mono text-sm font-bold">
                      {po.poNumber}
                    </span>
                    <span
                      className={`px-2 py-0.5 font-mono text-[10px] font-bold border ${getStatusStyle(po.status)}`}
                    >
                      {po.status}
                    </span>
                    <span className="font-mono text-xs font-semibold">
                      → {sup?.name ?? po.supplierId}
                    </span>
                  </div>
                  <div
                    style={{ color: "var(--kr-text-muted)" }}
                    className="font-mono text-[11px] mt-1"
                  >
                    Ref PR: {pr?.requestNumber ?? po.purchaseRequestId} •
                    Gudang: {wh?.name ?? po.warehouseId} •{" "}
                    {new Date(po.createdAt).toLocaleDateString("id-ID")}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  {po.status === "DRAFT" && (
                    <button
                      type="button"
                      onClick={() =>
                        markPurchaseOrderOrdered(po.id, currentUser.username)
                      }
                      className="px-3 py-1.5 bg-[#1E4A6D] text-white font-mono text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
                    >
                      <Send className="w-3 h-3" />
                      <span>Mark as Ordered</span>
                    </button>
                  )}

                  {(po.status === "ORDERED" ||
                    po.status === "PARTIALLY_RECEIVED") && (
                    <button
                      type="button"
                      onClick={() => onNavigate("goods-receipts")}
                      className="px-3 py-1.5 bg-[#1D593B] text-white font-mono text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
                    >
                      <Truck className="w-3.5 h-3.5" />
                      <span>Terima Barang ({branding.documentPrefixGR})</span>
                    </button>
                  )}

                  {(po.status === "DRAFT" || po.status === "ORDERED") && (
                    <button
                      type="button"
                      onClick={() =>
                        cancelPurchaseOrder(po.id, currentUser.username)
                      }
                      className="px-2.5 py-1.5 border border-[#9E2A20] text-[#9E2A20] font-mono text-[10px] font-bold uppercase flex items-center gap-1 cursor-pointer"
                    >
                      <XCircle className="w-3 h-3" />
                      <span>Batalkan</span>
                    </button>
                  )}
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
                      className="border-b font-mono text-[10px] uppercase"
                    >
                      <th className="py-2 px-3">SKU</th>
                      <th className="py-2 px-3">Nama {branding.itemTerm}</th>
                      <th className="py-2 px-3 text-right">Dipesan</th>
                      <th className="py-2 px-3 text-right">Sudah Diterima</th>
                      <th className="py-2 px-3 text-right">Sisa Pesanan</th>
                    </tr>
                  </thead>
                  <tbody
                    style={{ borderColor: "var(--kr-border)" }}
                    className="divide-y"
                  >
                    {po.items.map((item) => {
                      const prod = products.find(
                        (p) => p.id === item.productId,
                      );
                      const remaining = Math.max(
                        0,
                        item.quantity - item.receivedQuantity,
                      );
                      return (
                        <tr
                          key={item.id}
                          style={{ borderColor: "var(--kr-border)" }}
                        >
                          <td className="py-2.5 px-3 font-mono font-semibold">
                            {prod?.sku ?? item.productId}
                          </td>
                          <td className="py-2.5 px-3">
                            {prod?.name ?? item.productId}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono">
                            {item.quantity} {prod?.unit}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-semibold text-[#1D593B]">
                            {item.receivedQuantity} {prod?.unit}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-[#8A4B14]">
                            {remaining} {prod?.unit}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create PO Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div
            style={{
              backgroundColor: "var(--kr-bg-surface)",
              borderColor: "var(--kr-border)",
              color: "var(--kr-text-main)",
            }}
            className="w-full max-w-lg border p-6 shadow-2xl"
          >
            <div
              style={{ borderColor: "var(--kr-border)" }}
              className="flex items-center justify-between border-b pb-3 mb-4"
            >
              <h3 className="font-mono text-xs font-bold uppercase tracking-wider">
                TERBITKAN {branding.documentPrefixPO} DARI{" "}
                {branding.documentPrefixPR} APPROVED
              </h3>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {approvedPRs.length === 0 ? (
              <div className="space-y-4">
                <p className="text-xs leading-relaxed">
                  Belum ada dokumen {branding.documentPrefixPR} yang berstatus{" "}
                  <strong>APPROVED</strong>. Silakan setujui dokumen PR terlebih
                  dahulu di tab {branding.documentPrefixPR}.
                </p>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false);
                      onNavigate("purchase-requests");
                    }}
                    style={{
                      backgroundColor: "var(--kr-bg-sidebar)",
                      color: "var(--kr-text-sidebar)",
                    }}
                    className="px-4 py-2 font-mono text-xs uppercase cursor-pointer"
                  >
                    Buka Tab {branding.documentPrefixPR}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block font-mono text-[10px] uppercase mb-1">
                    Pilih Dokumen {branding.documentPrefixPR} (APPROVED)
                  </label>
                  <select
                    value={selectedPrId}
                    onChange={(e) => setSelectedPrId(e.target.value)}
                    style={{
                      backgroundColor: "var(--kr-bg-main)",
                      borderColor: "var(--kr-border)",
                      color: "var(--kr-text-main)",
                    }}
                    className="w-full px-3 py-2 border font-mono text-xs"
                  >
                    {approvedPRs.map((pr) => (
                      <option key={pr.id} value={pr.id}>
                        {pr.requestNumber} ({pr.items.length} SKU —{" "}
                        {pr.notes ?? "Siap PO"})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-mono text-[10px] uppercase mb-1">
                    Pilih Mitra Pemasok Resmi
                  </label>
                  <select
                    value={selectedSupplierId}
                    onChange={(e) => setSelectedSupplierId(e.target.value)}
                    style={{
                      backgroundColor: "var(--kr-bg-main)",
                      borderColor: "var(--kr-border)",
                      color: "var(--kr-text-main)",
                    }}
                    className="w-full px-3 py-2 border font-mono text-xs"
                  >
                    {activeSuppliers.map((sup) => (
                      <option key={sup.id} value={sup.id}>
                        {sup.name} ({sup.email})
                      </option>
                    ))}
                  </select>
                </div>

                <div
                  style={{ borderColor: "var(--kr-border)" }}
                  className="pt-4 border-t flex flex-wrap justify-end gap-2"
                >
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    style={{ borderColor: "var(--kr-border)" }}
                    className="px-4 py-2 border font-mono text-xs uppercase cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCreatePO(false)}
                    style={{
                      backgroundColor: "var(--kr-bg-elevated)",
                      borderColor: "var(--kr-border)",
                    }}
                    className="px-4 py-2 border font-mono text-xs font-semibold uppercase cursor-pointer"
                  >
                    Simpan DRAFT
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCreatePO(true)}
                    style={{
                      backgroundColor: "var(--kr-bg-sidebar)",
                      color: "var(--kr-text-sidebar)",
                    }}
                    className="px-4 py-2 font-mono text-xs font-bold uppercase cursor-pointer"
                  >
                    Terbitkan & Kirim (ORDERED)
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
