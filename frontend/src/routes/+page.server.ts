import { redirect, type ServerLoad } from "@sveltejs/kit";
import { callBackendApi } from "@/lib/server/api";
import { getDictionary } from "@/lib/i18n";
import type {
  AppLanguage,
  AuditLog,
  AuthUser,
  InventoryBalance,
  InventoryMovement,
  PaginatedResponse,
  Product,
  PurchaseOrder,
  PurchaseRequest,
  Warehouse,
} from "@/lib/types";

export interface WarehouseMetric {
  id: string;
  code: string;
  name: string;
  itemCount: number;
  totalQuantity: number;
  lowStockCount: number;
  capacityUtilization: number;
}

export interface PortfolioCategoryMetric {
  name: string;
  share: number;
  color: string;
  stock: string;
  count: number;
}

export interface ProcurementPipelineCounts {
  draftPr: number;
  submittedPr: number;
  approvedPr: number;
  orderedPo: number;
  partialPo: number;
  receivedPo: number;
}

export interface ChartSeriesPoint {
  label: string;
  sublabel: string;
  value: number;
  unit: string;
  delta: string;
}

export interface MetricDataset {
  headline: string;
  deltaText: string;
  unit: string;
  totalValue: number;
  averageValue?: number;
  points: ChartSeriesPoint[];
}

export type MetricKey = "volume" | "spend" | "velocity";
export type RangeKey = "7D" | "30D" | "90D";

export interface DashboardPageData {
  user: AuthUser;
  lang: AppLanguage;
  totalActiveProducts: number;
  lowStockCount: number;
  pendingPrCount: number;
  activePoCount: number;
  lowStockBalances: InventoryBalance[];
  recentMovements: InventoryMovement[];
  recentAudits: AuditLog[];
  warehousesMetrics: WarehouseMetric[];
  portfolioCategories: PortfolioCategoryMetric[];
  pipelineCounts: ProcurementPipelineCounts;
  totalInventoryUnits: number;
  chartDatasets: Record<MetricKey, Record<RangeKey, MetricDataset>>;
}

export const load: ServerLoad = async ({
  locals,
}): Promise<DashboardPageData> => {
  if (!locals.user || !locals.token) {
    throw redirect(303, "/login");
  }

  const token = locals.token;

  const [
    productsRes,
    lowStockRes,
    pendingPrRes,
    orderedPoRes,
    partialPoRes,
    movementsRes,
    auditsRes,
    warehousesRes,
    allBalancesRes,
    draftPrRes,
    approvedPrRes,
    receivedPoRes,
    allOrdersRes,
  ] = await Promise.all([
    callBackendApi<PaginatedResponse<Product>>(
      "/api/products?isActive=true&limit=1",
      { token },
    ),
    callBackendApi<PaginatedResponse<InventoryBalance>>(
      "/api/inventory?lowStock=true&limit=6",
      { token },
    ),
    callBackendApi<PaginatedResponse<PurchaseRequest>>(
      "/api/purchase-requests?status=SUBMITTED&limit=1",
      { token },
    ),
    callBackendApi<PaginatedResponse<PurchaseOrder>>(
      "/api/purchase-orders?status=ORDERED&limit=1",
      { token },
    ),
    callBackendApi<PaginatedResponse<PurchaseOrder>>(
      "/api/purchase-orders?status=PARTIALLY_RECEIVED&limit=1",
      { token },
    ),
    callBackendApi<PaginatedResponse<InventoryMovement>>(
      "/api/inventory/movements?limit=100",
      { token },
    ),
    callBackendApi<PaginatedResponse<AuditLog>>("/api/audit-logs?limit=6", {
      token,
    }),
    callBackendApi<PaginatedResponse<Warehouse>>("/api/warehouses?limit=20", {
      token,
    }),
    callBackendApi<PaginatedResponse<InventoryBalance>>(
      "/api/inventory?limit=100",
      { token },
    ),
    callBackendApi<PaginatedResponse<PurchaseRequest>>(
      "/api/purchase-requests?status=DRAFT&limit=1",
      { token },
    ),
    callBackendApi<PaginatedResponse<PurchaseRequest>>(
      "/api/purchase-requests?status=APPROVED&limit=1",
      { token },
    ),
    callBackendApi<PaginatedResponse<PurchaseOrder>>(
      "/api/purchase-orders?status=RECEIVED&limit=1",
      { token },
    ),
    callBackendApi<PaginatedResponse<PurchaseOrder>>(
      "/api/purchase-orders?limit=100",
      { token },
    ),
  ]);

  const balances = allBalancesRes.data?.data ?? [];
  const warehouses = warehousesRes.data?.data ?? [];
  let totalInventoryUnits = 0;

  const warehousesMetrics: WarehouseMetric[] = warehouses.map((wh, idx) => {
    const whBalances = balances.filter((b) => b.warehouseId === wh.id);
    const whTotal = whBalances.reduce(
      (sum, b) => sum + (Number(b.quantity) || 0),
      0,
    );
    const lowCount = whBalances.filter((b) => b.isLowStock).length;
    totalInventoryUnits += whTotal;

    // Nominal capacity based on facility tier
    const nominalBase = idx === 0 ? 600 : idx === 1 ? 400 : 300;
    const utilization = Math.min(
      95,
      Math.max(18, Math.round((whTotal / nominalBase) * 100)),
    );

    return {
      id: wh.id,
      code: wh.code,
      name: wh.name,
      itemCount: whBalances.length,
      totalQuantity: whTotal,
      lowStockCount: lowCount,
      capacityUtilization: utilization,
    };
  });

  // Dynamically compute portfolio categories from real inventory balances
  const categoryMap = new Map<
    string,
    { total: number; unit: string; count: number }
  >();
  for (const b of balances) {
    const cat = b.productCategory || "General Inventory";
    const existing = categoryMap.get(cat) || {
      total: 0,
      unit: b.productUnit || "units",
      count: 0,
    };
    existing.total += Number(b.quantity) || 0;
    existing.count += 1;
    categoryMap.set(cat, existing);
  }

  const categoryColors = [
    "bg-[#5A3825]",
    "bg-[#8C5E3C]",
    "bg-[#C68B59]",
    "bg-[#DFC7B2]",
    "bg-[#A86F3E]",
    "bg-[#7A4D33]",
  ];

  const portfolioCategories: PortfolioCategoryMetric[] = Array.from(
    categoryMap.entries(),
  ).map(([name, info], idx) => {
    const share =
      totalInventoryUnits > 0
        ? Math.round((info.total / totalInventoryUnits) * 100)
        : 0;
    return {
      name,
      share,
      color: categoryColors[idx % categoryColors.length],
      stock: `${info.total} ${info.unit}`,
      count: info.count,
    };
  });

  // Dynamically compute operational time-series metrics from real database records
  const allOrders = allOrdersRes.data?.data ?? [];
  const allMovements = movementsRes.data?.data ?? [];

  const lang = (locals.lang as AppLanguage) || "ID";
  const dict = getDictionary(lang);

  const now = new Date();
  const dayNamesID = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
  const dayNamesEN = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const dayNamesJP = ["日", "月", "火", "水", "木", "金", "土"];
  const dayNames =
    lang === "ID" ? dayNamesID : lang === "JP" ? dayNamesJP : dayNamesEN;

  const monthNamesID = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "Mei",
    "Jun",
    "Jul",
    "Agu",
    "Sep",
    "Okt",
    "Nov",
    "Des",
  ];
  const monthNamesEN = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const monthNamesJP = [
    "1月",
    "2月",
    "3月",
    "4月",
    "5月",
    "6月",
    "7月",
    "8月",
    "9月",
    "10月",
    "11月",
    "12月",
  ];
  const monthNames =
    lang === "ID" ? monthNamesID : lang === "JP" ? monthNamesJP : monthNamesEN;

  // 1. Last 7 Days (Daily Granularity)
  const last7Days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() - (6 - i));
    const dStr = d.toISOString().split("T")[0];
    return {
      date: d,
      dateStr: dStr,
      dayName: dayNames[d.getDay()],
      shortLabel: `${String(d.getDate()).padStart(2, "0")} ${monthNames[d.getMonth()]}`,
    };
  });

  // 2. Last 30 Days (Daily Granularity - 30 consecutive days)
  const last30Days = Array.from({ length: 30 }).map((_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() - (29 - i));
    const dStr = d.toISOString().split("T")[0];
    return {
      date: d,
      dateStr: dStr,
      dayName: `${d.getDate()} ${monthNames[d.getMonth()]}`,
      shortLabel: `${String(d.getDate()).padStart(2, "0")} ${monthNames[d.getMonth()]}`,
    };
  });

  // 3. Last 90 Days (Daily Granularity - 90 consecutive days)
  const last90Days = Array.from({ length: 90 }).map((_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() - (89 - i));
    const dStr = d.toISOString().split("T")[0];
    return {
      date: d,
      dateStr: dStr,
      dayName: `${d.getDate()} ${monthNames[d.getMonth()]}`,
      shortLabel: `${String(d.getDate()).padStart(2, "0")} ${monthNames[d.getMonth()]}`,
    };
  });

  // Calculate volume point
  function computeVolumePoint(
    day: { date: Date; dateStr: string; dayName: string; shortLabel: string },
    windowDays: number,
  ): ChartSeriesPoint {
    const matchingMovements = allMovements.filter((m) => {
      const mDate = new Date(m.createdAt);
      const diffDays = Math.abs(
        (day.date.getTime() - mDate.getTime()) / (1000 * 60 * 60 * 24),
      );
      return diffDays <= windowDays && m.movementType === "IN";
    });

    const realDbVal = matchingMovements.reduce(
      (sum, m) => sum + Math.abs(Number(m.quantityChange) || 0),
      0,
    );

    return {
      label: day.dayName,
      sublabel: day.shortLabel,
      value: realDbVal,
      unit: "kg",
      delta: `${realDbVal} kg`,
    };
  }

  // Calculate spend point
  function computeSpendPoint(
    day: { date: Date; dateStr: string; dayName: string; shortLabel: string },
    windowDays: number,
  ): ChartSeriesPoint {
    const matchingOrders = allOrders.filter((po) => {
      const poDate = new Date(po.createdAt);
      const diffDays = Math.abs(
        (day.date.getTime() - poDate.getTime()) / (1000 * 60 * 60 * 24),
      );
      return diffDays <= windowDays;
    });

    const realDbSpend = matchingOrders.reduce((sum, po) => {
      const itemsSum = (po.items ?? []).reduce(
        (is, it) => is + Number(it.orderedQuantity) * Number(it.unitPrice),
        0,
      );
      return sum + itemsSum;
    }, 0);

    return {
      label: day.dayName,
      sublabel: day.shortLabel,
      value: realDbSpend,
      unit: "Rp",
      delta: `Rp ${realDbSpend.toLocaleString("id-ID")}`,
    };
  }

  // Calculate velocity point
  function computeVelocityPoint(
    day: { date: Date; dateStr: string; dayName: string; shortLabel: string },
    windowDays: number,
  ): ChartSeriesPoint {
    const matchingOrders = allOrders.filter((po) => {
      if (po.status !== "RECEIVED" && po.status !== "PARTIALLY_RECEIVED") {
        return false;
      }
      const poDate = new Date(po.updatedAt || po.createdAt);
      const diffDays = Math.abs(
        (day.date.getTime() - poDate.getTime()) / (1000 * 60 * 60 * 24),
      );
      return diffDays <= windowDays;
    });

    let val = 0;
    if (matchingOrders.length > 0) {
      const totalDays = matchingOrders.reduce((sum, po) => {
        const start = new Date(po.createdAt).getTime();
        const end = new Date(po.updatedAt).getTime();
        return sum + Math.max(0.1, (end - start) / (1000 * 60 * 60 * 24));
      }, 0);
      val = Math.round((totalDays / matchingOrders.length) * 10) / 10;
    }

    return {
      label: day.dayName,
      sublabel: day.shortLabel,
      value: val,
      unit: dict.operatingDays,
      delta: val > 0 ? `${val} ${dict.operatingDays}` : dict.slaTarget,
    };
  }

  const volume7dPoints = last7Days.map((d) => computeVolumePoint(d, 0.5));
  const spend7dPoints = last7Days.map((d) => computeSpendPoint(d, 0.5));
  const velocity7dPoints = last7Days.map((d) => computeVelocityPoint(d, 0.5));

  const volume30dPoints = last30Days.map((d) => computeVolumePoint(d, 0.5));
  const spend30dPoints = last30Days.map((d) => computeSpendPoint(d, 0.5));
  const velocity30dPoints = last30Days.map((d) => computeVelocityPoint(d, 0.5));

  // 90D: Aggregated per 30 days (3 monthly bars) as requested ("klo untuk 90 per 30 hari aja")
  const block30d_3 = last90Days.slice(0, 30); // earliest (61-90 days ago)
  const block30d_2 = last90Days.slice(30, 60); // middle (31-60 days ago)
  const block30d_1 = last90Days.slice(60, 90); // latest (last 30 days)

  function formatMonthYear(d: Date): string {
    return d.toLocaleDateString("id-ID", { month: "short", year: "2-digit" });
  }

  function aggregate30dBlock(
    days: typeof last90Days,
    name: string,
    sublabel: string,
  ): {
    volume: ChartSeriesPoint;
    spend: ChartSeriesPoint;
    velocity: ChartSeriesPoint;
  } {
    const volPts = days.map((d) => computeVolumePoint(d, 0.5));
    const totalVol = volPts.reduce((s, p) => s + p.value, 0);
    const spendPts = days.map((d) => computeSpendPoint(d, 0.5));
    const totalSpend = spendPts.reduce((s, p) => s + p.value, 0);
    const velPts = days.map((d) => computeVelocityPoint(d, 0.5));
    const activeVelPts = velPts.filter((p) => p.value > 0);
    const avgVelocity =
      activeVelPts.length > 0
        ? Math.round(
            (activeVelPts.reduce((s, p) => s + p.value, 0) /
              activeVelPts.length) *
              10,
          ) / 10
        : 0;

    return {
      volume: {
        label: name,
        sublabel,
        value: totalVol,
        unit: "kg",
        delta: `${totalVol.toLocaleString("id-ID")} kg`,
      },
      spend: {
        label: name,
        sublabel,
        value: totalSpend,
        unit: "Rp",
        delta: `Rp ${totalSpend.toLocaleString("id-ID")}`,
      },
      velocity: {
        label: name,
        sublabel,
        value: avgVelocity,
        unit: dict.operatingDays,
        delta:
          avgVelocity > 0
            ? `${avgVelocity} ${dict.operatingDays}`
            : dict.slaTarget,
      },
    };
  }

  const b3 = aggregate30dBlock(
    block30d_3,
    formatMonthYear(block30d_3[15].date),
    "Hari 61–90",
  );
  const b2 = aggregate30dBlock(
    block30d_2,
    formatMonthYear(block30d_2[15].date),
    "Hari 31–60",
  );
  const b1 = aggregate30dBlock(
    block30d_1,
    formatMonthYear(block30d_1[15].date),
    "30 Hari Terakhir",
  );

  const volume90dPoints = [b3.volume, b2.volume, b1.volume];
  const spend90dPoints = [b3.spend, b2.spend, b1.spend];
  const velocity90dPoints = [b3.velocity, b2.velocity, b1.velocity];

  const totalVolume7d = volume7dPoints.reduce((sum, p) => sum + p.value, 0);
  const totalVolume30d = volume30dPoints.reduce((sum, p) => sum + p.value, 0);
  const totalVolume90d = volume90dPoints.reduce((sum, p) => sum + p.value, 0);

  const totalSpend7d = spend7dPoints.reduce((sum, p) => sum + p.value, 0);
  const totalSpend30d = spend30dPoints.reduce((sum, p) => sum + p.value, 0);
  const totalSpend90d = spend90dPoints.reduce((sum, p) => sum + p.value, 0);

  const activeVel7d = velocity7dPoints.filter((p) => p.value > 0);
  const avgVel7d =
    activeVel7d.length > 0
      ? Math.round(
          (activeVel7d.reduce((s, p) => s + p.value, 0) / activeVel7d.length) *
            10,
        ) / 10
      : 0;

  const activeVel30d = velocity30dPoints.filter((p) => p.value > 0);
  const avgVel30d =
    activeVel30d.length > 0
      ? Math.round(
          (activeVel30d.reduce((s, p) => s + p.value, 0) /
            activeVel30d.length) *
            10,
        ) / 10
      : 0;

  const activeVel90d = velocity90dPoints.filter((p) => p.value > 0);
  const avgVel90d =
    activeVel90d.length > 0
      ? Math.round(
          (activeVel90d.reduce((s, p) => s + p.value, 0) /
            activeVel90d.length) *
            10,
        ) / 10
      : 0;

  const chartDatasets: Record<MetricKey, Record<RangeKey, MetricDataset>> = {
    volume: {
      "7D": {
        headline: `${totalVolume7d.toLocaleString("id-ID")} KG`,
        deltaText: `${totalVolume7d.toLocaleString("id-ID")} KG ${dict.aggregateIntake}`,
        unit: "kg",
        totalValue: totalVolume7d,
        points: volume7dPoints,
      },
      "30D": {
        headline: `${totalVolume30d.toLocaleString("id-ID")} KG`,
        deltaText: `${totalVolume30d.toLocaleString("id-ID")} KG ${dict.aggregateIntake}`,
        unit: "kg",
        totalValue: totalVolume30d,
        points: volume30dPoints,
      },
      "90D": {
        headline: `${totalVolume90d.toLocaleString("id-ID")} KG`,
        deltaText: `${totalVolume90d.toLocaleString("id-ID")} KG ${dict.aggregateIntake}`,
        unit: "kg",
        totalValue: totalVolume90d,
        points: volume90dPoints,
      },
    },
    spend: {
      "7D": {
        headline: `Rp ${totalSpend7d.toLocaleString("id-ID")}`,
        deltaText: `Rp ${totalSpend7d.toLocaleString("id-ID")} ${dict.aggregateSpend}`,
        unit: "Rp",
        totalValue: totalSpend7d,
        points: spend7dPoints,
      },
      "30D": {
        headline: `Rp ${totalSpend30d.toLocaleString("id-ID")}`,
        deltaText: `Rp ${totalSpend30d.toLocaleString("id-ID")} ${dict.aggregateSpend}`,
        unit: "Rp",
        totalValue: totalSpend30d,
        points: spend30dPoints,
      },
      "90D": {
        headline: `Rp ${totalSpend90d.toLocaleString("id-ID")}`,
        deltaText: `Rp ${totalSpend90d.toLocaleString("id-ID")} ${dict.aggregateSpend}`,
        unit: "Rp",
        totalValue: totalSpend90d,
        points: spend90dPoints,
      },
    },
    velocity: {
      "7D": {
        headline: `${avgVel7d} ${dict.operatingDays}`,
        deltaText: avgVel7d > 0 ? `${avgVel7d}d target SLA` : dict.slaTarget,
        unit: "days",
        totalValue: avgVel7d,
        averageValue: avgVel7d,
        points: velocity7dPoints,
      },
      "30D": {
        headline: `${avgVel30d} ${dict.operatingDays}`,
        deltaText: avgVel30d > 0 ? `${avgVel30d}d target SLA` : dict.slaTarget,
        unit: "days",
        totalValue: avgVel30d,
        averageValue: avgVel30d,
        points: velocity30dPoints,
      },
      "90D": {
        headline: `${avgVel90d} ${dict.operatingDays}`,
        deltaText: avgVel90d > 0 ? `${avgVel90d}d target SLA` : dict.slaTarget,
        unit: "days",
        totalValue: avgVel90d,
        averageValue: avgVel90d,
        points: velocity90dPoints,
      },
    },
  };

  return {
    user: locals.user,
    lang: locals.lang,
    totalActiveProducts: productsRes.data?.meta.total ?? 0,
    lowStockCount: lowStockRes.data?.meta.total ?? 0,
    pendingPrCount: pendingPrRes.data?.meta.total ?? 0,
    activePoCount:
      (orderedPoRes.data?.meta.total ?? 0) +
      (partialPoRes.data?.meta.total ?? 0),
    lowStockBalances: lowStockRes.data?.data ?? [],
    recentMovements: movementsRes.data?.data?.slice(0, 6) ?? [],
    recentAudits: auditsRes.data?.data ?? [],
    warehousesMetrics,
    portfolioCategories,
    pipelineCounts: {
      draftPr: draftPrRes.data?.meta.total ?? 0,
      submittedPr: pendingPrRes.data?.meta.total ?? 0,
      approvedPr: approvedPrRes.data?.meta.total ?? 0,
      orderedPo: orderedPoRes.data?.meta.total ?? 0,
      partialPo: partialPoRes.data?.meta.total ?? 0,
      receivedPo: receivedPoRes.data?.meta.total ?? 0,
    },
    totalInventoryUnits,
    chartDatasets,
  };
};
