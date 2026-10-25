import React, { useState } from "react";
import { Truck, Plus, CheckCircle2, ArrowUpRight, X } from "lucide-react";
import { NavigationTab } from "@/types";
import { useStore } from "@/context/StoreContext";
import { useAuth } from "@/context/AuthContext";
import { useKernel } from "@/kernel/KernelContext";

interface GoodsReceiptsTabProps {
  onNavigate: (tab: NavigationTab) => void;
}

export const GoodsReceiptsTab: React.FC<GoodsReceiptsTabProps> = ({
  onNavigate,
}) => {
  const {
    goodsReceipts,
    purchaseOrders,
    products,
    warehouses,
    suppliers,
    createGoodsReceipt,
  } = useStore();
  const { currentUser } = useAuth();
  const { branding, t } = useKernel();

  const openPOs = purchaseOrders.filter(
    (po) => po.status === "ORDERED" || po.status === "PARTIALLY_RECEIVED",
  );

  const [showReceiveModal, setShowReceiveModal] = useState<boolean>(false);
  const [selectedPoId, setSelectedPoId] = useState<string>(
    openPOs[0]?.id ?? "",
  );
  const [receiveQuantities, setReceiveQuantities] = useState<
    Record<string, number>
  >({});
  const [errorMsg, setErrorMsg] = useState<string>("");

  const activePO = openPOs.find((p) => p.id === selectedPoId) ?? openPOs[0];

  const handleOpenModal = (): void => {
    const firstPO = openPOs[0];
    setSelectedPoId(firstPO?.id ?? "");
    const initialMap: Record<string, number> = {};
    if (firstPO) {
      firstPO.items.forEach((item) => {
        initialMap[item.productId] = Math.max(
          0,
          item.quantity - item.receivedQuantity,
        );
      });
    }
    setReceiveQuantities(initialMap);
    setErrorMsg("");
    setShowReceiveModal(true);
  };

  const handleSelectPO = (poId: string): void => {
    setSelectedPoId(poId);
    const po = openPOs.find((p) => p.id === poId);
    const initialMap: Record<string, number> = {};
    if (po) {
      po.items.forEach((item) => {
        initialMap[item.productId] = Math.max(
          0,
          item.quantity - item.receivedQuantity,
        );
      });
    }
    setReceiveQuantities(initialMap);
    setErrorMsg("");
  };

  const handleSubmitGR = (e: React.FormEvent): void => {
    e.preventDefault();
    if (!activePO) {
      return;
    }

    const payloadItems = activePO.items.map((item) => ({
      productId: item.productId,
      quantity: Number(receiveQuantities[item.productId] ?? 0),
    }));

    const result = createGoodsReceipt({
      purchaseOrderId: activePO.id,
      receivedBy: currentUser.username,
      prefixGR: branding.documentPrefixGR,
      items: payloadItems,
    });

    if (!result.ok) {
      setErrorMsg(result.error ?? "Gagal mencatat penerimaan barang.");
      return;
    }

    setShowReceiveModal(false);
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
            <Truck
              style={{ color: "var(--kr-accent)" }}
              className="w-3.5 h-3.5"
            />
            <span>
              MOD-05 // {branding.documentPrefixGR} PHYSICAL INTAKE TRANSACTION
            </span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-normal tracking-tight mt-1">
            {t("plugin.goodsReceipts.name")}
          </h1>
          <p
            style={{ color: "var(--kr-text-muted)" }}
            className="text-xs sm:text-sm mt-1 max-w-2xl"
          >
            {t("mod.gr.desc")}
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenModal}
          style={{
            backgroundColor: "var(--kr-bg-sidebar)",
            color: "var(--kr-text-sidebar)",
          }}
          className="px-4 py-2.5 font-mono text-xs uppercase tracking-wider font-semibold flex items-center gap-2 cursor-pointer self-start sm:self-auto shrink-0"
        >
          <Plus style={{ color: "var(--kr-accent)" }} className="w-3.5 h-3.5" />
          <span>+ Catat Timbang Terima ({branding.documentPrefixGR})</span>
        </button>
      </div>

      {/* GR History List */}
      <div className="space-y-4">
        {goodsReceipts.map((gr) => {
          const po = purchaseOrders.find((p) => p.id === gr.purchaseOrderId);
          const wh = warehouses.find((w) => w.id === po?.warehouseId);
          const sup = suppliers.find((s) => s.id === po?.supplierId);

          return (
            <div
              key={gr.id}
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
                      {gr.grNumber}
                    </span>
                    <span className="px-2 py-0.5 font-mono text-[10px] font-bold border bg-[#E7F2EC] text-[#1D593B] border-[#B2D3C1] inline-flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>STOCK COMMITTED</span>
                    </span>
                    <span className="font-mono text-xs font-semibold">
                      Ref PO: {po?.poNumber ?? gr.purchaseOrderId}
                    </span>
                  </div>
                  <div
                    style={{ color: "var(--kr-text-muted)" }}
                    className="font-mono text-[11px] mt-1"
                  >
                    Gudang: {wh?.name ?? "-"} • Pemasok: {sup?.name ?? "-"} •
                    Petugas: {gr.receivedBy} •{" "}
                    {new Date(gr.receivedAt).toLocaleString("id-ID", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onNavigate("inventory")}
                  style={{ borderColor: "var(--kr-border)" }}
                  className="px-3 py-1.5 border font-mono text-[11px] font-semibold uppercase flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
                >
                  <span>Lihat Mutasi Stok</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
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
                      <th className="py-2 px-3 text-right">
                        Kuantitas Masuk (+Stok)
                      </th>
                    </tr>
                  </thead>
                  <tbody
                    style={{ borderColor: "var(--kr-border)" }}
                    className="divide-y"
                  >
                    {gr.items.map((item) => {
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
                            {prod?.name ?? item.productId}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-[#1D593B]">
                            +{item.quantity} {prod?.unit}
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

      {/* Modal Record Goods Receipt */}
      {showReceiveModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div
            style={{
              backgroundColor: "var(--kr-bg-surface)",
              borderColor: "var(--kr-border)",
              color: "var(--kr-text-main)",
            }}
            className="w-full max-w-2xl border p-6 shadow-2xl max-h-[90vh] overflow-y-auto"
          >
            <div
              style={{ borderColor: "var(--kr-border)" }}
              className="flex items-center justify-between border-b pb-3 mb-4"
            >
              <h3 className="font-mono text-xs font-bold uppercase tracking-wider">
                VERIFIKASI TIMBANG TERIMA FISIK ({branding.documentPrefixGR})
              </h3>
              <button
                type="button"
                onClick={() => setShowReceiveModal(false)}
                className="p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {openPOs.length === 0 ? (
              <div className="space-y-4">
                <p className="text-xs leading-relaxed">
                  Tidak ada dokumen {branding.documentPrefixPO} berstatus{" "}
                  <strong>ORDERED</strong> atau{" "}
                  <strong>PARTIALLY_RECEIVED</strong> yang menunggu penerimaan
                  barang.
                </p>
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setShowReceiveModal(false);
                      onNavigate("purchase-orders");
                    }}
                    style={{
                      backgroundColor: "var(--kr-bg-sidebar)",
                      color: "var(--kr-text-sidebar)",
                    }}
                    className="px-4 py-2 font-mono text-xs uppercase cursor-pointer"
                  >
                    Buka Tab {branding.documentPrefixPO}
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmitGR} className="space-y-4">
                {errorMsg && (
                  <div className="p-3 border border-[#9E2A20] bg-[#FCEAE8] text-[#9E2A20] font-mono text-xs">
                    {errorMsg}
                  </div>
                )}

                <div>
                  <label className="block font-mono text-[10px] uppercase mb-1">
                    Pilih Dokumen {branding.documentPrefixPO} Terbuka
                  </label>
                  <select
                    value={activePO?.id ?? ""}
                    onChange={(e) => handleSelectPO(e.target.value)}
                    style={{
                      backgroundColor: "var(--kr-bg-main)",
                      borderColor: "var(--kr-border)",
                      color: "var(--kr-text-main)",
                    }}
                    className="w-full px-3 py-2 border font-mono text-xs"
                  >
                    {openPOs.map((po) => {
                      const sup = suppliers.find((s) => s.id === po.supplierId);
                      return (
                        <option key={po.id} value={po.id}>
                          {po.poNumber} — {sup?.name ?? po.supplierId} (
                          {po.status})
                        </option>
                      );
                    })}
                  </select>
                </div>

                {activePO && (
                  <div className="overflow-x-auto border border-[#D8D0C0]">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr
                          style={{
                            backgroundColor: "var(--kr-bg-elevated)",
                            borderColor: "var(--kr-border)",
                          }}
                          className="border-b font-mono text-[10px] uppercase"
                        >
                          <th className="py-2 px-3">SKU / Item</th>
                          <th className="py-2 px-3 text-right">Dipesan</th>
                          <th className="py-2 px-3 text-right">Diterima</th>
                          <th className="py-2 px-3 text-right">Sisa Maks.</th>
                          <th className="py-2 px-3 text-right">
                            Terima Sekarang
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {activePO.items.map((item) => {
                          const prod = products.find(
                            (p) => p.id === item.productId,
                          );
                          const remaining = Math.max(
                            0,
                            item.quantity - item.receivedQuantity,
                          );
                          return (
                            <tr key={item.id}>
                              <td className="py-2.5 px-3">
                                <div className="font-mono font-bold text-[11px]">
                                  {prod?.sku}
                                </div>
                                <div>{prod?.name}</div>
                              </td>
                              <td className="py-2.5 px-3 text-right font-mono">
                                {item.quantity} {prod?.unit}
                              </td>
                              <td className="py-2.5 px-3 text-right font-mono">
                                {item.receivedQuantity} {prod?.unit}
                              </td>
                              <td className="py-2.5 px-3 text-right font-mono font-bold text-[#8A4B14]">
                                {remaining} {prod?.unit}
                              </td>
                              <td className="py-2.5 px-3 text-right">
                                <input
                                  type="number"
                                  min={0}
                                  max={remaining}
                                  disabled={remaining === 0}
                                  value={receiveQuantities[item.productId] ?? 0}
                                  onChange={(e) =>
                                    setReceiveQuantities((prev) => ({
                                      ...prev,
                                      [item.productId]: Number(e.target.value),
                                    }))
                                  }
                                  style={{
                                    backgroundColor: "var(--kr-bg-main)",
                                    borderColor: "var(--kr-border)",
                                    color: "var(--kr-text-main)",
                                  }}
                                  className="w-24 px-2 py-1 border font-mono text-xs text-right font-bold"
                                />
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}

                <div
                  style={{ borderColor: "var(--kr-border)" }}
                  className="pt-4 border-t flex justify-end gap-2"
                >
                  <button
                    type="button"
                    onClick={() => setShowReceiveModal(false)}
                    style={{ borderColor: "var(--kr-border)" }}
                    className="px-4 py-2 border font-mono text-xs uppercase cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    style={{
                      backgroundColor: "var(--kr-bg-sidebar)",
                      color: "var(--kr-text-sidebar)",
                    }}
                    className="px-4 py-2 font-mono text-xs font-bold uppercase cursor-pointer"
                  >
                    Simpan {branding.documentPrefixGR} & Tambah Stok
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
