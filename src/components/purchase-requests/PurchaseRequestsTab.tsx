import React, { useState } from "react";
import {
  FileText,
  Plus,
  Check,
  XCircle,
  Send,
  ArrowUpRight,
  Trash2,
  Pencil,
  X,
} from "lucide-react";
import { NavigationTab, PRStatus, PurchaseRequest } from "@/types";
import { useStore } from "@/context/StoreContext";
import { useAuth } from "@/context/AuthContext";
import { useKernel } from "@/kernel/KernelContext";

interface PurchaseRequestsTabProps {
  onNavigate: (tab: NavigationTab) => void;
}

export const PurchaseRequestsTab: React.FC<PurchaseRequestsTabProps> = ({
  onNavigate,
}) => {
  const {
    purchaseRequests,
    products,
    warehouses,
    createPurchaseRequest,
    updateDraftPurchaseRequest,
    submitPurchaseRequest,
    approvePurchaseRequest,
    rejectPurchaseRequest,
  } = useStore();
  const { currentUser } = useAuth();
  const { branding, t } = useKernel();

  const activeWarehouses = warehouses.filter((w) => w.isActive);
  const activeProducts = products.filter((p) => p.isActive);

  const [statusFilter, setStatusFilter] = useState<PRStatus | "ALL">("ALL");
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [editingPrId, setEditingPrId] = useState<string | null>(null);
  const [warehouseId, setWarehouseId] = useState<string>(
    activeWarehouses[0]?.id ?? warehouses[0]?.id ?? "wh_jkt",
  );
  const [notes, setNotes] = useState<string>("");
  const [lineItems, setLineItems] = useState<
    { productId: string; quantity: number }[]
  >([
    {
      productId: activeProducts[0]?.id ?? products[0]?.id ?? "prd_01",
      quantity: 25,
    },
  ]);
  const [formError, setFormError] = useState<string>("");

  const filteredPRs = purchaseRequests.filter(
    (pr) => statusFilter === "ALL" || pr.status === statusFilter,
  );

  const handleOpenCreateModal = (): void => {
    setEditingPrId(null);
    setWarehouseId(activeWarehouses[0]?.id ?? warehouses[0]?.id ?? "wh_jkt");
    setNotes("");
    setLineItems([
      {
        productId: activeProducts[0]?.id ?? products[0]?.id ?? "prd_01",
        quantity: 25,
      },
    ]);
    setFormError("");
    setShowCreateModal(true);
  };

  const handleOpenEditDraft = (pr: PurchaseRequest): void => {
    setEditingPrId(pr.id);
    setWarehouseId(pr.warehouseId);
    setNotes(pr.notes ?? "");
    setLineItems(
      pr.items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      })),
    );
    setFormError("");
    setShowCreateModal(true);
  };

  const handleAddLine = (): void => {
    const unusedProduct = activeProducts.find(
      (p) => !lineItems.some((li) => li.productId === p.id),
    );
    if (!unusedProduct) {
      setFormError(
        "Semua SKU aktif telah ditambahkan ke dalam daftar permintaan ini.",
      );
      return;
    }
    setFormError("");
    setLineItems((prev) => [
      ...prev,
      { productId: unusedProduct.id, quantity: 10 },
    ]);
  };

  const handleRemoveLine = (index: number): void => {
    if (lineItems.length <= 1) {
      return;
    }
    setLineItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleUpdateLine = (
    index: number,
    field: "productId" | "quantity",
    val: string | number,
  ): void => {
    setFormError("");
    setLineItems((prev) =>
      prev.map((item, idx) =>
        idx === index
          ? {
              ...item,
              [field]: field === "quantity" ? Number(val) : String(val),
            }
          : item,
      ),
    );
  };

  const handleCreatePR = (submitImmediately: boolean): void => {
    if (lineItems.length === 0) {
      setFormError("Minimal harus terdapat 1 item dalam dokumen PR.");
      return;
    }
    const seen = new Set<string>();
    for (const item of lineItems) {
      if (item.quantity <= 0) {
        setFormError("Kuantitas setiap item wajib lebih besar dari 0.");
        return;
      }
      if (seen.has(item.productId)) {
        setFormError(
          "Tidak boleh ada duplikasi produk yang sama dalam satu dokumen PR.",
        );
        return;
      }
      seen.add(item.productId);
    }

    if (editingPrId) {
      updateDraftPurchaseRequest(editingPrId, {
        warehouseId,
        notes: notes.trim() || "Permintaan pengadaan stok rutin",
        items: lineItems,
        actor: currentUser.username,
      });
      if (submitImmediately) {
        submitPurchaseRequest(editingPrId, currentUser.username);
      }
    } else {
      createPurchaseRequest({
        warehouseId,
        notes: notes.trim() || "Permintaan pengadaan stok rutin",
        submitImmediately,
        items: lineItems,
        createdBy: currentUser.username,
        prefixPR: branding.documentPrefixPR,
      });
    }

    setEditingPrId(null);
    setNotes("");
    setFormError("");
    setShowCreateModal(false);
  };

  const getStatusBadgeStyle = (status: PRStatus): string => {
    switch (status) {
      case "DRAFT":
        return "bg-[#F2EFE9] text-[#5C5346] border-[#D8D0C0]";
      case "SUBMITTED":
        return "bg-[#F9EFE0] text-[#8A4B14] border-[#DEC19B]";
      case "APPROVED":
        return "bg-[#E7F2EC] text-[#1D593B] border-[#B2D3C1]";
      case "REJECTED":
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
            <FileText
              style={{ color: "var(--kr-accent)" }}
              className="w-3.5 h-3.5"
            />
            <span>MOD-03 // {branding.documentPrefixPR} AGGREGATE LEDGER</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-normal tracking-tight mt-1">
            {t("plugin.purchaseRequests.name")}
          </h1>
          <p
            style={{ color: "var(--kr-text-muted)" }}
            className="text-xs sm:text-sm mt-1 max-w-2xl"
          >
            {t("mod.pr.desc")}
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
          <span>+ Buat {branding.documentPrefixPR} Baru</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-1.5">
        {(
          ["ALL", "DRAFT", "SUBMITTED", "APPROVED", "REJECTED"] as (
            PRStatus | "ALL"
          )[]
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
            className="px-3 py-1.5 border font-mono text-[11px] font-semibold uppercase tracking-wider cursor-pointer transition"
          >
            {st === "ALL" ? `SEMUA (${purchaseRequests.length})` : st}
          </button>
        ))}
      </div>

      {/* PR Cards / Ledger List */}
      <div className="space-y-4">
        {filteredPRs.map((pr) => {
          const wh = warehouses.find((w) => w.id === pr.warehouseId);
          return (
            <div
              key={pr.id}
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
                      {pr.requestNumber}
                    </span>
                    <span
                      className={`px-2 py-0.5 font-mono text-[10px] font-bold border ${getStatusBadgeStyle(pr.status)}`}
                    >
                      {pr.status}
                    </span>
                    <span
                      style={{ color: "var(--kr-text-muted)" }}
                      className="font-mono text-[11px]"
                    >
                      • {wh?.name ?? pr.warehouseId}
                    </span>
                  </div>
                  <div
                    style={{ color: "var(--kr-text-muted)" }}
                    className="font-mono text-[11px] mt-1"
                  >
                    Oleh: {pr.createdBy} •{" "}
                    {new Date(pr.createdAt).toLocaleString("id-ID", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                    {pr.notes ? ` — "${pr.notes}"` : ""}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  {pr.status === "DRAFT" && (
                    <>
                      <button
                        type="button"
                        onClick={() => handleOpenEditDraft(pr)}
                        style={{
                          backgroundColor: "var(--kr-bg-elevated)",
                          borderColor: "var(--kr-border)",
                          color: "var(--kr-text-main)",
                        }}
                        className="px-3 py-1.5 border font-mono text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
                      >
                        <Pencil className="w-3 h-3" />
                        <span>Edit Draft</span>
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          submitPurchaseRequest(pr.id, currentUser.username)
                        }
                        className="px-3 py-1.5 bg-[#8A4B14] text-white font-mono text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
                      >
                        <Send className="w-3 h-3" />
                        <span>Ajukan (Submit)</span>
                      </button>
                    </>
                  )}

                  {pr.status === "SUBMITTED" && (
                    <>
                      <button
                        type="button"
                        onClick={() =>
                          approvePurchaseRequest(pr.id, currentUser.username)
                        }
                        className="px-3 py-1.5 bg-[#1D593B] text-white font-mono text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Approve</span>
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          rejectPurchaseRequest(
                            pr.id,
                            "Ditolak saat evaluasi stok",
                            currentUser.username,
                          )
                        }
                        className="px-3 py-1.5 bg-[#9E2A20] text-white font-mono text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Reject</span>
                      </button>
                    </>
                  )}

                  {pr.status === "APPROVED" && (
                    <button
                      type="button"
                      onClick={() => onNavigate("purchase-orders")}
                      style={{
                        backgroundColor: "var(--kr-bg-sidebar)",
                        color: "var(--kr-text-sidebar)",
                      }}
                      className="px-3 py-1.5 font-mono text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>Terbitkan {branding.documentPrefixPO}</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Line Items Table */}
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
                      <th className="py-2 px-3">Kode SKU</th>
                      <th className="py-2 px-3">Nama {branding.itemTerm}</th>
                      <th className="py-2 px-3 text-right">
                        Kuantitas Diminta
                      </th>
                    </tr>
                  </thead>
                  <tbody
                    style={{ borderColor: "var(--kr-border)" }}
                    className="divide-y"
                  >
                    {pr.items.map((item) => {
                      const prod = products.find(
                        (p) => p.id === item.productId,
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
                            {prod?.name ?? "Unknown Item"}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold">
                            {item.quantity} {prod?.unit ?? "UNIT"}
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

      {/* Create PR Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div
            style={{
              backgroundColor: "var(--kr-bg-surface)",
              borderColor: "var(--kr-border)",
              color: "var(--kr-text-main)",
            }}
            className="w-full max-w-xl border p-6 shadow-2xl max-h-[90vh] overflow-y-auto"
          >
            <div
              style={{ borderColor: "var(--kr-border)" }}
              className="flex items-center justify-between border-b pb-3 mb-4"
            >
              <h3 className="font-mono text-xs font-bold uppercase tracking-wider">
                {editingPrId
                  ? `EDIT DOKUMEN ${branding.documentPrefixPR} (STATUS: DRAFT)`
                  : `SUSUN DOKUMEN ${branding.documentPrefixPR} BARU (AGGREGATE FORM)`}
              </h3>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="mb-4 p-3 border border-[#9E2A20] bg-[#FCEAE8] text-[#9E2A20] font-mono text-xs">
                {formError}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block font-mono text-[10px] uppercase mb-1">
                  Gudang Tujuan Pengiriman (Aktif)
                </label>
                <select
                  value={warehouseId}
                  onChange={(e) => setWarehouseId(e.target.value)}
                  style={{
                    backgroundColor: "var(--kr-bg-main)",
                    borderColor: "var(--kr-border)",
                    color: "var(--kr-text-main)",
                  }}
                  className="w-full px-3 py-2 border font-mono text-xs"
                >
                  {activeWarehouses.map((w) => (
                    <option key={w.id} value={w.id}>
                      [{w.code}] {w.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-mono text-[10px] uppercase mb-1">
                  Catatan Keperluan / Keterangan
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Contoh: Restock mingguan biji kopi & susu"
                  style={{
                    backgroundColor: "var(--kr-bg-main)",
                    borderColor: "var(--kr-border)",
                    color: "var(--kr-text-main)",
                  }}
                  className="w-full px-3 py-2 border text-xs"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="font-mono text-[10px] font-bold uppercase">
                    Daftar Baris Item ({lineItems.length})
                  </label>
                  <button
                    type="button"
                    onClick={handleAddLine}
                    style={{ borderColor: "var(--kr-border)" }}
                    className="px-2.5 py-1 border font-mono text-[10px] font-semibold uppercase cursor-pointer"
                  >
                    + Tambah Baris Item
                  </button>
                </div>

                <div className="space-y-2">
                  {lineItems.map((li, idx) => (
                    <div
                      key={idx}
                      className="grid grid-cols-12 gap-2 items-center"
                    >
                      <div className="col-span-7 sm:col-span-8">
                        <select
                          value={li.productId}
                          onChange={(e) =>
                            handleUpdateLine(idx, "productId", e.target.value)
                          }
                          style={{
                            backgroundColor: "var(--kr-bg-main)",
                            borderColor: "var(--kr-border)",
                            color: "var(--kr-text-main)",
                          }}
                          className="w-full px-2.5 py-2 border font-mono text-xs"
                        >
                          {activeProducts.map((p) => (
                            <option key={p.id} value={p.id}>
                              [{p.sku}] {p.name} ({p.unit})
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="col-span-3">
                        <input
                          type="number"
                          min={1}
                          value={li.quantity}
                          onChange={(e) =>
                            handleUpdateLine(idx, "quantity", e.target.value)
                          }
                          style={{
                            backgroundColor: "var(--kr-bg-main)",
                            borderColor: "var(--kr-border)",
                            color: "var(--kr-text-main)",
                          }}
                          className="w-full px-2.5 py-2 border font-mono text-xs text-right"
                        />
                      </div>
                      <div className="col-span-2 sm:col-span-1 text-right">
                        <button
                          type="button"
                          onClick={() => handleRemoveLine(idx)}
                          disabled={lineItems.length <= 1}
                          className="p-2 text-[#9E2A20] disabled:opacity-30 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
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
                  onClick={() => handleCreatePR(false)}
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
                  onClick={() => handleCreatePR(true)}
                  style={{
                    backgroundColor: "var(--kr-bg-sidebar)",
                    color: "var(--kr-text-sidebar)",
                  }}
                  className="px-4 py-2 font-mono text-xs font-bold uppercase cursor-pointer"
                >
                  Simpan & Ajukan (SUBMIT)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
