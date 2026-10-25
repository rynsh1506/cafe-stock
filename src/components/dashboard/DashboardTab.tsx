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
import { useStore } from "@/context/StoreContext";

interface DashboardTabProps {
  onNavigate: (tab: NavigationTab) => void;
}

export const DashboardTab: React.FC<DashboardTabProps> = ({ onNavigate }) => {
  const { currentUser } = useAuth();
  const { branding, emailConfig, enabledPlugins, t } = useKernel();
  const {
    products,
    purchaseRequests,
    purchaseOrders,
    goodsReceipts,
    warehouses,
    inventoryBalances,
  } = useStore();

  const totalProducts = products.length;
  const pendingPRs = purchaseRequests.filter(
    (pr) => pr.status === "SUBMITTED",
  ).length;
  const approvedPRs = purchaseRequests.filter(
    (pr) => pr.status === "APPROVED",
  ).length;
  const activePOs = purchaseOrders.filter(
    (po) => po.status === "ORDERED" || po.status === "PARTIALLY_RECEIVED",
  ).length;

  const criticalItems = inventoryBalances
    .filter((balance) => {
      const product = products.find((p) => p.id === balance.productId);
      return product ? balance.stock < product.minStock : false;
    })
    .map((balance) => {
      const product = products.find((p) => p.id === balance.productId)!;
      const warehouse = warehouses.find(
        (w) => w.id === balance.warehouseId,
      ) ?? {
        id: balance.warehouseId,
        code: "WH",
        name: balance.warehouseId,
        location: "-",
        isActive: true,
      };
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

  const getStatusStyle = (status: string): string => {
    switch (status) {
      case "SUBMITTED":
      case "PARTIALLY_RECEIVED":
        return "bg-[#F9EFE0] text-[#8A4B14] border-[#DEC19B]";
      case "ORDERED":
        return "bg-[#E8F0F6] text-[#1E4A6D] border-[#B8CEE0]";
      case "APPROVED":
      case "RECEIVED":
        return "bg-[#E7F2EC] text-[#1D593B] border-[#B2D3C1]";
      case "REJECTED":
      case "CANCELLED":
        return "bg-[#FCEAE8] text-[#9E2A20] border-[#E6B8B3]";
      default:
        return "bg-[#F2EFE9] text-[#5C5346] border-[#D8D0C0]";
    }
  };

  const recentTransactions = [
    ...purchaseRequests.map((pr) => ({
      id: pr.id,
      number: pr.requestNumber,
      stage: `01 // ${branding.documentPrefixPR}`,
      type: t("plugin.purchaseRequests.name"),
      warehouse:
        warehouses.find((w) => w.id === pr.warehouseId)?.name ?? pr.warehouseId,
      date: new Date(pr.createdAt).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      timestamp: new Date(pr.createdAt).getTime(),
      status: pr.status,
      statusStyle: getStatusStyle(pr.status),
      targetTab: "purchase-requests" as NavigationTab,
    })),
    ...purchaseOrders.map((po) => ({
      id: po.id,
      number: po.poNumber,
      stage: `02 // ${branding.documentPrefixPO}`,
      type: t("plugin.purchaseOrders.name"),
      warehouse:
        warehouses.find((w) => w.id === po.warehouseId)?.name ?? po.warehouseId,
      date: new Date(po.createdAt).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      timestamp: new Date(po.createdAt).getTime(),
      status: po.status,
      statusStyle: getStatusStyle(po.status),
      targetTab: "purchase-orders" as NavigationTab,
    })),
    ...goodsReceipts.map((gr) => {
      const parentPo = purchaseOrders.find(
        (po) => po.id === gr.purchaseOrderId,
      );
      const whName = parentPo
        ? (warehouses.find((w) => w.id === parentPo.warehouseId)?.name ??
          parentPo.warehouseId)
        : "Gudang Utama";
      return {
        id: gr.id,
        number: gr.grNumber,
        stage: `03 // ${branding.documentPrefixGR}`,
        type: t("plugin.goodsReceipts.name"),
        warehouse: whName,
        date: new Date(gr.receivedAt).toLocaleDateString("id-ID", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
        timestamp: new Date(gr.receivedAt).getTime(),
        status: "RECEIVED",
        statusStyle: getStatusStyle("RECEIVED"),
        targetTab: "goods-receipts" as NavigationTab,
      };
    }),
  ]
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 6);

  const dayLabels = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"] as const;
  const dayBuckets: Record<string, number> = {
    MON: 0,
    TUE: 0,
    WED: 0,
    THU: 0,
    FRI: 0,
    SAT: 0,
    SUN: 0,
  };

  for (const gr of goodsReceipts) {
    const d = new Date(gr.receivedAt);
    const dayKey =
      dayLabels[Number.isNaN(d.getDay()) ? 0 : d.getDay()] ?? "MON";
    const grTotal = gr.items.reduce((sum, item) => sum + item.quantity, 0);
    dayBuckets[dayKey] = (dayBuckets[dayKey] ?? 0) + grTotal;
  }

  const orderedDays = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
  const maxDayVal = Math.max(1, ...Object.values(dayBuckets));
  const todayKey = dayLabels[new Date().getDay()] ?? "MON";

  const weeklyVolume = orderedDays.map((day, idx) => {
    const val = dayBuckets[day] ?? 0;
    const pct =
      val === 0 ? 4 : Math.max(12, Math.round((val / maxDayVal) * 96));
    return {
      day,
      date: `D-${idx + 1}`,
      value: val,
      height: `${pct}%`,
      lot: val > 0 ? `${val} IN` : "0 IN",
      active: day === todayKey,
    };
  });

  const totalGrVolume = Object.values(dayBuckets).reduce((a, b) => a + b, 0);
  const dailyAvgVolume = (totalGrVolume / 7).toFixed(1);

  return (
    <div className="space-y-6">
      {/* 1. Editorial Masthead */}
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
            <span>
              {enabledPlugins.length} {t("dashboard.activeModules")}
            </span>
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
              <span>
                {t("dashboard.coreAlert")}: {emailConfig.coreAdminEmail}
              </span>
            </button>
          </div>
          <h1
            style={{ color: "var(--kr-text-main)" }}
            className="font-serif text-2xl sm:text-3xl font-normal tracking-tight mt-1.5"
          >
            {t("dashboard.titlePrefix")} {branding.itemTerm}
          </h1>
          <p
            style={{ color: "var(--kr-text-muted)" }}
            className="text-xs sm:text-sm mt-1 max-w-2xl"
          >
            {t("dashboard.subtitle")}
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
            <span>{t("dashboard.customizeKernel")}</span>
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
                {t("dashboard.reviewBtn")} {pendingPRs}{" "}
                {branding.documentPrefixPR}
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
              <span>
                {t("dashboard.createPrBtn")} ({branding.documentPrefixPR})
              </span>
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
              {t("dashboard.kpi1.label")}
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
              {t("dashboard.kpi1.unit")}
            </span>
          </div>
          <div
            style={{ borderColor: "var(--kr-border)" }}
            className="pt-2.5 border-t flex items-center justify-between font-mono text-[10px]"
          >
            <span style={{ color: "var(--kr-text-muted)" }}>
              {t("dashboard.kpi1.footer")}
            </span>
            <span className="text-[#1D593B] font-semibold">100% ACTIVE</span>
          </div>
        </div>

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
              {t("dashboard.kpi2.label")}
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
              {t("dashboard.kpi2.unit")}
            </span>
          </div>
          <div
            style={{ borderColor: "var(--kr-border)" }}
            className="pt-2.5 border-t flex items-center justify-between font-mono text-[10px]"
          >
            <span style={{ color: "var(--kr-text-muted)" }}>
              {t("dashboard.kpi2.footer")}
            </span>
            <span className="text-[#8A4B14] font-semibold">
              {approvedPRs} APPROVED
            </span>
          </div>
        </div>

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
              {t("dashboard.kpi3.label")}
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
              {t("dashboard.kpi3.unit")}
            </span>
          </div>
          <div
            style={{ borderColor: "var(--kr-border)" }}
            className="pt-2.5 border-t flex items-center justify-between font-mono text-[10px]"
          >
            <span style={{ color: "var(--kr-text-muted)" }}>
              {t("dashboard.kpi3.footer")}
            </span>
            <span className="text-[#1E4A6D] font-semibold">
              ORDERED / PARTIAL
            </span>
          </div>
        </div>

        <div
          onClick={() => onNavigate("inventory")}
          style={{ borderColor: "var(--kr-border)" }}
          className="p-4 sm:p-5 hover:opacity-90 transition cursor-pointer flex flex-col justify-between group"
        >
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] font-semibold uppercase tracking-widest text-[#9E2A20]">
              {t("dashboard.kpi4.label")}
            </span>
            <ArrowUpRight className="w-3.5 h-3.5 text-[#9E2A20] transition shrink-0" />
          </div>
          <div className="my-3 flex items-baseline gap-2">
            <span className="font-mono text-2xl sm:text-3xl font-bold text-[#9E2A20]">
              {criticalItems.length}
            </span>
            <span className="text-xs font-medium text-[#9E2A20]">
              {t("dashboard.kpi4.unit")}
            </span>
          </div>
          <div
            style={{ borderColor: "var(--kr-border)" }}
            className="pt-2.5 border-t flex items-center justify-between font-mono text-[10px]"
          >
            <span style={{ color: "var(--kr-text-muted)" }}>
              {t("dashboard.kpi4.footer")}
            </span>
            <span className="text-[#9E2A20] font-semibold">
              {emailConfig.triggers.onCriticalStock
                ? t("common.active")
                : t("common.inactive")}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Bagian Tengah: Log Timbangan & Bon Peringatan Stok */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div
          style={{
            backgroundColor: "var(--kr-bg-surface)",
            borderColor: "var(--kr-border)",
          }}
          className="lg:col-span-2 border p-5 sm:p-6 flex flex-col justify-between"
        >
          <div>
            <div
              style={{ borderColor: "var(--kr-border)" }}
              className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b pb-4 mb-5"
            >
              <div>
                <div
                  style={{ color: "var(--kr-text-muted)" }}
                  className="font-mono text-[10px] font-semibold uppercase tracking-widest"
                >
                  {t("dashboard.chart.tag")} // {branding.documentPrefixGR}
                </div>
                <h2 className="font-serif text-lg sm:text-xl font-normal mt-0.5">
                  {t("dashboard.chart.title")}
                </h2>
                <p
                  style={{ color: "var(--kr-text-muted)" }}
                  className="text-xs mt-0.5"
                >
                  {t("dashboard.chart.desc")}
                </p>
              </div>

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
                  {t("dashboard.chart.weekTotal")}
                </div>
                <div className="font-mono text-lg sm:text-xl font-bold whitespace-nowrap">
                  {totalGrVolume} UNIT/KG
                </div>
                <div className="font-mono text-[10px] text-[#1D593B] font-semibold whitespace-nowrap">
                  {goodsReceipts.length} DOKUMEN {branding.documentPrefixGR}
                </div>
              </div>
            </div>

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
                {t("dashboard.chart.dominantCat")}
              </span>
              <span className="font-semibold">{branding.itemTerm}</span>
            </div>
            <div>
              <span style={{ color: "var(--kr-text-muted)" }} className="block">
                {t("dashboard.chart.dailyAvg")}
              </span>
              <span className="font-semibold">{dailyAvgVolume} / Day</span>
            </div>
            <div className="text-right">
              <span style={{ color: "var(--kr-text-muted)" }} className="block">
                {t("dashboard.chart.auditVariance")}
              </span>
              <span className="font-semibold text-[#1D593B]">0.0% (OK)</span>
            </div>
          </div>
        </div>

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
                  <span>{t("dashboard.alert.tag")}</span>
                </div>
                <h3 className="font-serif text-lg font-normal mt-0.5">
                  {t("dashboard.alert.title")}
                </h3>
              </div>
              <span className="font-mono text-[10px] font-bold text-[#9E2A20] bg-[#FCEAE8] border border-[#E6B8B3] px-2 py-0.5">
                {criticalItems.length} SKU
              </span>
            </div>

            <div className="space-y-3">
              {criticalItems.length === 0 ? (
                <div
                  style={{
                    backgroundColor: "var(--kr-bg-main)",
                    borderColor: "var(--kr-border)",
                    color: "var(--kr-text-muted)",
                  }}
                  className="p-4 border font-mono text-xs text-center"
                >
                  Belum ada defisit stok kritis (0 SKU di bawah ambang batas).
                </div>
              ) : (
                criticalItems.map((item, idx) => (
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
                        {t("dashboard.alert.deficit")} {item.deficit}{" "}
                        {item.product.unit}
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
                        {item.currentStock} / {item.minStock}{" "}
                        {item.product.unit}
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-[#E5DEC9] mt-2 overflow-hidden">
                      <div
                        style={{ width: `${item.fillRatio}%` }}
                        className="h-full bg-[#9E2A20]"
                      />
                    </div>
                  </div>
                ))
              )}
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
              <span>
                {t("dashboard.alert.draftPrBtn")} ({branding.documentPrefixPR})
              </span>
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
              {t("dashboard.tx.tag")}
            </div>
            <h3 className="font-serif text-lg font-normal mt-0.5">
              {t("dashboard.tx.title")}
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
            {t("dashboard.tx.flowLabel")}: {branding.documentPrefixPR} →
            APPROVAL → {branding.documentPrefixPO} → {branding.documentPrefixGR}
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
                <th className="py-3 px-5 font-semibold">
                  {t("dashboard.tx.colReg")}
                </th>
                <th className="py-3 px-4 font-semibold">
                  {t("dashboard.tx.colStage")}
                </th>
                <th className="py-3 px-4 font-semibold">
                  {t("dashboard.tx.colWarehouse")}
                </th>
                <th className="py-3 px-4 font-semibold">
                  {t("dashboard.tx.colDate")}
                </th>
                <th className="py-3 px-4 font-semibold">
                  {t("dashboard.tx.colStatus")}
                </th>
                <th className="py-3 px-5 text-right font-semibold">
                  {t("dashboard.tx.colFile")}
                </th>
              </tr>
            </thead>
            <tbody
              style={{ borderColor: "var(--kr-border)" }}
              className="divide-y"
            >
              {recentTransactions.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    style={{ color: "var(--kr-text-muted)" }}
                    className="py-8 px-5 text-center font-mono text-xs"
                  >
                    Database masih kosong (0 dokumen transaksi). Silakan mulai
                    dengan mendaftarkan Gudang, Pemasok, dan SKU di menu{" "}
                    <button
                      type="button"
                      onClick={() => onNavigate("products")}
                      className="underline font-bold cursor-pointer"
                    >
                      {t("plugin.products.name")}
                    </button>
                    .
                  </td>
                </tr>
              ) : (
                recentTransactions.map((tx) => (
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
                        <span>{t("common.open")}</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
