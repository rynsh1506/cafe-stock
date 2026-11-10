<script lang="ts">
  import { getDictionary } from "@/lib/i18n";
  import type { DashboardPageData } from "@/routes/+page.server";

  let { data }: { data: DashboardPageData } = $props();
  let dict = $derived(getDictionary(data.lang));

  type MetricKey = "volume" | "spend" | "velocity";
  type RangeKey = "7D" | "30D" | "90D";

  let selectedMetric = $state<MetricKey>("volume");
  let selectedRange = $state<RangeKey>("7D");
  let hoveredPointIndex = $state<number | null>(null);

  interface ChartSeriesPoint {
    label: string;
    sublabel: string;
    value: number;
    unit: string;
    delta: string;
  }

  interface MetricDataset {
    title: string;
    headline: string;
    deltaText: string;
    unit: string;
    points: ChartSeriesPoint[];
  }

  const chartDatasets: Record<MetricKey, Record<RangeKey, MetricDataset>> = {
    volume: {
      "7D": {
        title: "Inbound Material Volume (KG)",
        headline: "148.6 KG",
        deltaText: "+18.4% vs previous 7 days",
        unit: "kg",
        points: [
          {
            label: "Mon",
            sublabel: "Nov 03",
            value: 14.2,
            unit: "kg",
            delta: "+2.1%",
          },
          {
            label: "Tue",
            sublabel: "Nov 04",
            value: 24.8,
            unit: "kg",
            delta: "+74.6%",
          },
          {
            label: "Wed",
            sublabel: "Nov 05",
            value: 11.5,
            unit: "kg",
            delta: "-53.6%",
          },
          {
            label: "Thu",
            sublabel: "Nov 06",
            value: 31.0,
            unit: "kg",
            delta: "+169.5%",
          },
          {
            label: "Fri",
            sublabel: "Nov 07",
            value: 18.4,
            unit: "kg",
            delta: "-40.6%",
          },
          {
            label: "Sat",
            sublabel: "Nov 08",
            value: 36.2,
            unit: "kg",
            delta: "+96.7%",
          },
          {
            label: "Sun",
            sublabel: "Nov 09",
            value: 12.5,
            unit: "kg",
            delta: "-65.4%",
          },
        ],
      },
      "30D": {
        title: "Monthly Inbound Volume (KG)",
        headline: "612.4 KG",
        deltaText: "+11.2% vs previous month",
        unit: "kg",
        points: [
          {
            label: "W1",
            sublabel: "Oct 12-18",
            value: 115.0,
            unit: "kg",
            delta: "-4.2%",
          },
          {
            label: "W2",
            sublabel: "Oct 19-25",
            value: 168.4,
            unit: "kg",
            delta: "+46.4%",
          },
          {
            label: "W3",
            sublabel: "Oct 26-Nov 01",
            value: 132.8,
            unit: "kg",
            delta: "-21.1%",
          },
          {
            label: "W4",
            sublabel: "Nov 02-08",
            value: 196.2,
            unit: "kg",
            delta: "+47.7%",
          },
        ],
      },
      "90D": {
        title: "Quarterly Inbound Volume (KG)",
        headline: "1,840 KG",
        deltaText: "+24.5% vs previous quarter",
        unit: "kg",
        points: [
          {
            label: "Aug",
            sublabel: "Roasting Peak",
            value: 520,
            unit: "kg",
            delta: "+8.3%",
          },
          {
            label: "Sep",
            sublabel: "Holiday Prep",
            value: 710,
            unit: "kg",
            delta: "+36.5%",
          },
          {
            label: "Oct",
            sublabel: "Standard Cadence",
            value: 610,
            unit: "kg",
            delta: "-14.1%",
          },
        ],
      },
    },
    spend: {
      "7D": {
        title: "Procurement Capital Outflow ($)",
        headline: "$4,850.00",
        deltaText: "-6.2% vs previous 7 days",
        unit: "$",
        points: [
          {
            label: "Mon",
            sublabel: "Nov 03",
            value: 420,
            unit: "$",
            delta: "+12.0%",
          },
          {
            label: "Tue",
            sublabel: "Nov 04",
            value: 1250,
            unit: "$",
            delta: "+197.6%",
          },
          {
            label: "Wed",
            sublabel: "Nov 05",
            value: 310,
            unit: "$",
            delta: "-75.2%",
          },
          {
            label: "Thu",
            sublabel: "Nov 06",
            value: 1680,
            unit: "$",
            delta: "+441.9%",
          },
          {
            label: "Fri",
            sublabel: "Nov 07",
            value: 540,
            unit: "$",
            delta: "-67.8%",
          },
          {
            label: "Sat",
            sublabel: "Nov 08",
            value: 650,
            unit: "$",
            delta: "+20.3%",
          },
          {
            label: "Sun",
            sublabel: "Nov 09",
            value: 0,
            unit: "$",
            delta: "-100.0%",
          },
        ],
      },
      "30D": {
        title: "Monthly Procurement Capital ($)",
        headline: "$21,420.00",
        deltaText: "+8.9% vs previous month",
        unit: "$",
        points: [
          {
            label: "W1",
            sublabel: "Bean Contracts",
            value: 6400,
            unit: "$",
            delta: "+14.0%",
          },
          {
            label: "W2",
            sublabel: "Packaging Run",
            value: 4200,
            unit: "$",
            delta: "-34.3%",
          },
          {
            label: "W3",
            sublabel: "Dairy & Consumables",
            value: 5100,
            unit: "$",
            delta: "+21.4%",
          },
          {
            label: "W4",
            sublabel: "Equipment Maint.",
            value: 5720,
            unit: "$",
            delta: "+12.1%",
          },
        ],
      },
      "90D": {
        title: "Quarterly Procurement Capital ($)",
        headline: "$64,280.00",
        deltaText: "+15.8% budget utilization",
        unit: "$",
        points: [
          {
            label: "Aug",
            sublabel: "Capex & Imports",
            value: 18200,
            unit: "$",
            delta: "+5.0%",
          },
          {
            label: "Sep",
            sublabel: "Seasonal Stocking",
            value: 26400,
            unit: "$",
            delta: "+45.0%",
          },
          {
            label: "Oct",
            sublabel: "Rebalancing",
            value: 19680,
            unit: "$",
            delta: "-25.4%",
          },
        ],
      },
    },
    velocity: {
      "7D": {
        title: "Order Turnaround Velocity (Days)",
        headline: "1.6 Days",
        deltaText: "0.4 days faster than target SLA",
        unit: "days",
        points: [
          {
            label: "Mon",
            sublabel: "Nov 03",
            value: 2.1,
            unit: "days",
            delta: "+0.2d",
          },
          {
            label: "Tue",
            sublabel: "Nov 04",
            value: 1.4,
            unit: "days",
            delta: "-0.7d",
          },
          {
            label: "Wed",
            sublabel: "Nov 05",
            value: 1.8,
            unit: "days",
            delta: "+0.4d",
          },
          {
            label: "Thu",
            sublabel: "Nov 06",
            value: 1.2,
            unit: "days",
            delta: "-0.6d",
          },
          {
            label: "Fri",
            sublabel: "Nov 07",
            value: 2.4,
            unit: "days",
            delta: "+1.2d",
          },
          {
            label: "Sat",
            sublabel: "Nov 08",
            value: 1.5,
            unit: "days",
            delta: "-0.9d",
          },
          {
            label: "Sun",
            sublabel: "Nov 09",
            value: 1.0,
            unit: "days",
            delta: "-0.5d",
          },
        ],
      },
      "30D": {
        title: "Monthly Turnaround Velocity (Days)",
        headline: "1.7 Days Avg",
        deltaText: "98.2% on-time supplier fulfillment",
        unit: "days",
        points: [
          {
            label: "W1",
            sublabel: "Oct 12-18",
            value: 1.9,
            unit: "days",
            delta: "+0.1d",
          },
          {
            label: "W2",
            sublabel: "Oct 19-25",
            value: 1.6,
            unit: "days",
            delta: "-0.3d",
          },
          {
            label: "W3",
            sublabel: "Oct 26-Nov 01",
            value: 1.8,
            unit: "days",
            delta: "+0.2d",
          },
          {
            label: "W4",
            sublabel: "Nov 02-08",
            value: 1.5,
            unit: "days",
            delta: "-0.3d",
          },
        ],
      },
      "90D": {
        title: "Quarterly Turnaround Velocity (Days)",
        headline: "1.8 Days Avg",
        deltaText: "+14% SLA compliance improvement",
        unit: "days",
        points: [
          {
            label: "Aug",
            sublabel: "Logistics Ramp",
            value: 2.2,
            unit: "days",
            delta: "+0.4d",
          },
          {
            label: "Sep",
            sublabel: "Dock Optimizations",
            value: 1.7,
            unit: "days",
            delta: "-0.5d",
          },
          {
            label: "Oct",
            sublabel: "Stabilized Cadence",
            value: 1.5,
            unit: "days",
            delta: "-0.2d",
          },
        ],
      },
    },
  };

  let activeDataset = $derived(chartDatasets[selectedMetric][selectedRange]);

  // SVG dimensions for responsive zigzag line and area
  const svgWidth = 720;
  const svgHeight = 220;
  const padLeft = 45;
  const padRight = 35;
  const padTop = 30;
  const padBottom = 35;

  let computedCoordinates = $derived.by(() => {
    const pts = activeDataset.points;
    const count = pts.length;
    if (count <= 1) return [];

    const rawVals = pts.map((p) => p.value);
    const minVal = 0;
    const maxVal = Math.max(...rawVals) * 1.18 || 1;
    const valRange = maxVal - minVal;

    const usableWidth = svgWidth - padLeft - padRight;
    const usableHeight = svgHeight - padTop - padBottom;

    return pts.map((pt, idx) => {
      const x = padLeft + (idx / (count - 1)) * usableWidth;
      const normY = (pt.value - minVal) / valRange;
      const y = svgHeight - padBottom - normY * usableHeight;
      return {
        ...pt,
        x: Math.round(x * 10) / 10,
        y: Math.round(y * 10) / 10,
      };
    });
  });

  let polylinePoints = $derived(
    computedCoordinates.map((c) => `${c.x},${c.y}`).join(" "),
  );

  let polygonPoints = $derived.by(() => {
    if (computedCoordinates.length === 0) return "";
    const bottomY = svgHeight - padBottom;
    const firstX = computedCoordinates[0].x;
    const lastX = computedCoordinates[computedCoordinates.length - 1].x;
    const lineCoords = computedCoordinates
      .map((c) => `${c.x},${c.y}`)
      .join(" ");
    return `${firstX},${bottomY} ${lineCoords} ${lastX},${bottomY}`;
  });

  let gridLines = $derived.by(() => {
    const usableHeight = svgHeight - padTop - padBottom;
    return [0, 0.33, 0.66, 1].map((ratio) => {
      const y = svgHeight - padBottom - ratio * usableHeight;
      return Math.round(y);
    });
  });

  // Roastery materials portfolio distribution
  const portfolioCategories = [
    {
      name: "Single Origin Arabica (Huila & Yirgacheffe)",
      share: 58,
      color: "bg-[#5A3825]",
      stock: "284 KG",
    },
    {
      name: "Specialty Degassing Packaging (1kg & 250g)",
      share: 22,
      color: "bg-[#8C5E3C]",
      stock: "1,420 Pcs",
    },
    {
      name: "Barista Oat & Dairy Concentrates",
      share: 13,
      color: "bg-[#C68B59]",
      stock: "86 L",
    },
    {
      name: "Cleaning & Roaster Descalers",
      share: 7,
      color: "bg-[#DFC7B2]",
      stock: "24 Units",
    },
  ];
</script>

<div class="space-y-6">
  <!-- Top Espresso Banner (Figma Theme) -->
  <div
    class="flex flex-col gap-4 rounded-2xl border border-[#523323] bg-gradient-to-r from-[#2C1E18] to-[#4A2D1D] p-5 text-white shadow-md sm:p-7 md:flex-row md:items-center md:justify-between"
  >
    <div>
      <div
        class="mb-1.5 flex items-center justify-between gap-2 text-[11px] font-semibold tracking-wider text-[#D8A57A] uppercase sm:justify-start"
      >
        <span>Procurement &amp; Inventory Management</span>
        <span class="opacity-60">•</span>
        <span
          class="ui-badge border-[#7A4D33] bg-[#5A3825] text-white font-mono text-[10px]"
        >
          <span class="ui-badge-dot bg-[#E5B589]"></span>
          <span>ROLE: {data.user.role}</span>
        </span>
      </div>
      <h1
        class="font-serif text-xl font-bold tracking-tight text-white sm:text-2xl"
      >
        Welcome to CafeStock, {data.user.name}
      </h1>
      <p
        class="mt-1 max-w-2xl text-xs leading-relaxed text-[#D7CBC1] sm:text-sm"
      >
        Centralized operations console for purchase requests, managerial
        approvals, vendor purchase orders, warehouse dock receipts, and verified
        stock ledgers.
      </p>
    </div>

    <div class="flex shrink-0 items-center gap-2.5">
      <a
        href="/purchase-requests"
        class="flex items-center gap-2 rounded-xl bg-[#C68B59] px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-[#B37948] active:bg-[#9B6437]"
      >
        <svg
          class="h-4 w-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path
            d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
          />
          <polyline points="14 2 14 8 20 8" />
          <line x1="12" y1="18" x2="12" y2="12" />
          <line x1="9" y1="15" x2="15" y2="15" />
        </svg>
        <span>
          {data.user.role === "APPROVER"
            ? `Review ${data.pendingPrCount} Requests`
            : "+ Create Purchase Request"}
        </span>
      </a>
    </div>
  </div>

  <!-- 4 KPI Cards with Mini Zigzag Sparklines -->
  <div class="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
    <!-- Card 1: Active Products -->
    <a
      href="/master"
      class="group flex flex-col justify-between rounded-2xl border border-[#EDE4D8] bg-white p-4 shadow-xs transition hover:border-[#D5C5B5] sm:p-5"
    >
      <div class="flex items-start justify-between gap-2">
        <div
          class="text-[10px] leading-tight font-bold tracking-wider text-[#8C7665] uppercase sm:text-[11px]"
        >
          {dict.kpiActiveProducts}
        </div>
        <!-- Mini Zigzag Sparkline (Green Trend) -->
        <svg class="h-6 w-16 text-[#2E7D32]" viewBox="0 0 64 24" fill="none">
          <polyline
            points="2,18 14,14 26,17 38,9 50,12 62,4"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </div>
      <div class="mt-3">
        <div
          class="truncate text-lg font-bold text-[#2E1F16] transition group-hover:text-[#5A3825] sm:text-2xl"
        >
          {data.totalActiveProducts} SKU
        </div>
        <div
          class="mt-1 flex items-center gap-1.5 truncate text-[10px] font-semibold text-[#2E7D32] sm:text-[11px]"
        >
          <span class="h-1.5 w-1.5 rounded-full bg-[#2E7D32]"></span>
          <span class="truncate">Active catalog registry</span>
        </div>
      </div>
    </a>

    <!-- Card 2: PR Pending Review -->
    <a
      href="/purchase-requests?status=SUBMITTED"
      class="group flex flex-col justify-between rounded-2xl border border-[#EDE4D8] bg-white p-4 shadow-xs transition hover:border-[#D5C5B5] sm:p-5"
    >
      <div class="flex items-start justify-between gap-2">
        <div
          class="text-[10px] leading-tight font-bold tracking-wider text-[#8C7665] uppercase sm:text-[11px]"
        >
          {dict.kpiPendingPr}
        </div>
        <!-- Mini Zigzag Sparkline (Amber Warning) -->
        <svg class="h-6 w-16 text-[#D97706]" viewBox="0 0 64 24" fill="none">
          <polyline
            points="2,12 14,18 26,8 38,15 50,6 62,11"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </div>
      <div class="mt-3">
        <div
          class="truncate text-lg font-bold text-[#2E1F16] transition group-hover:text-[#B45309] sm:text-2xl"
        >
          {data.pendingPrCount} Pending
        </div>
        <div
          class="mt-1 flex items-center gap-1.5 truncate text-[10px] font-semibold text-[#D97706] sm:text-[11px]"
        >
          <span class="h-1.5 w-1.5 rounded-full bg-[#D97706]"></span>
          <span class="truncate">Requires manager sign-off</span>
        </div>
      </div>
    </a>

    <!-- Card 3: Active Purchase Orders -->
    <a
      href="/purchase-orders"
      class="group flex flex-col justify-between rounded-2xl border border-[#EDE4D8] bg-white p-4 shadow-xs transition hover:border-[#D5C5B5] sm:p-5"
    >
      <div class="flex items-start justify-between gap-2">
        <div
          class="text-[10px] leading-tight font-bold tracking-wider text-[#8C7665] uppercase sm:text-[11px]"
        >
          {dict.kpiActivePo}
        </div>
        <!-- Mini Zigzag Sparkline (Espresso Stable) -->
        <svg class="h-6 w-16 text-[#5A3825]" viewBox="0 0 64 24" fill="none">
          <polyline
            points="2,14 14,7 26,12 38,5 50,9 62,3"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </div>
      <div class="mt-3">
        <div
          class="truncate text-lg font-bold text-[#2E1F16] transition group-hover:text-[#5A3825] sm:text-2xl"
        >
          {data.activePoCount} Orders
        </div>
        <div
          class="mt-1 flex items-center gap-1.5 truncate text-[10px] font-semibold text-[#5A3825] sm:text-[11px]"
        >
          <span class="h-1.5 w-1.5 rounded-full bg-[#5A3825]"></span>
          <span class="truncate">In-transit &amp; dock pending</span>
        </div>
      </div>
    </a>

    <!-- Card 4: Low Stock Attention -->
    <a
      href="/inventory?lowStock=true"
      class="group flex flex-col justify-between rounded-2xl border border-[#EDE4D8] bg-white p-4 shadow-xs transition hover:border-[#D5C5B5] sm:p-5"
    >
      <div class="flex items-start justify-between gap-2">
        <div
          class="text-[10px] leading-tight font-bold tracking-wider text-[#8C7665] uppercase sm:text-[11px]"
        >
          {dict.kpiLowStockAlerts}
        </div>
        <!-- Mini Zigzag Sparkline (Red Alert) -->
        <svg class="h-6 w-16 text-[#C62828]" viewBox="0 0 64 24" fill="none">
          <polyline
            points="2,6 14,15 26,11 38,19 50,8 62,20"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </div>
      <div class="mt-3">
        <div class="truncate text-lg font-bold text-[#C62828] sm:text-2xl">
          {data.lowStockCount} Items
        </div>
        <div
          class="mt-1 flex items-center gap-1.5 truncate text-[10px] font-semibold text-[#C62828] sm:text-[11px]"
        >
          <span class="h-1.5 w-1.5 rounded-full bg-[#C62828]"></span>
          <span class="truncate">Under reorder threshold</span>
        </div>
      </div>
    </a>
  </div>

  <!-- Interactive Configurable Zigzag Line & Area Chart Card -->
  <div
    class="rounded-2xl border border-[#EDE4D8] bg-white p-5 shadow-xs sm:p-6"
  >
    <!-- Chart Controls Toolbar (Bisa diatur) -->
    <div
      class="flex flex-col justify-between gap-4 border-b border-[#F0E7DD] pb-5 lg:flex-row lg:items-center"
    >
      <div>
        <div
          class="text-[10px] font-bold tracking-wider text-[#8C7665] uppercase sm:text-xs"
        >
          Interactive Operational Trends
        </div>
        <h2 class="mt-0.5 text-base font-bold text-[#2E1F16] sm:text-lg">
          {activeDataset.title}
        </h2>
      </div>

      <!-- Metric & Range Switchers -->
      <div class="flex flex-wrap items-center gap-3">
        <!-- Metric Selector -->
        <div class="ui-tabs">
          <button
            type="button"
            onclick={() => (selectedMetric = "volume")}
            class="ui-tab {selectedMetric === 'volume' ? 'ui-tab-active' : ''}"
          >
            {dict.metricVolume}
          </button>
          <button
            type="button"
            onclick={() => (selectedMetric = "spend")}
            class="ui-tab {selectedMetric === 'spend' ? 'ui-tab-active' : ''}"
          >
            {dict.metricSpend}
          </button>
          <button
            type="button"
            onclick={() => (selectedMetric = "velocity")}
            class="ui-tab {selectedMetric === 'velocity'
              ? 'ui-tab-active'
              : ''}"
          >
            {dict.metricVelocity}
          </button>
        </div>

        <!-- Range Selector -->
        <div class="ui-tabs">
          {#each ["7D", "30D", "90D"] as const as r}
            <button
              type="button"
              onclick={() => (selectedRange = r)}
              class="ui-tab {selectedRange === r ? 'ui-tab-active' : ''}"
            >
              {r}
            </button>
          {/each}
        </div>
      </div>
    </div>

    <!-- Chart Headline Stats Bar -->
    <div class="mt-4 flex flex-wrap items-baseline justify-between gap-3 px-1">
      <div class="flex items-baseline gap-3">
        <span class="font-serif text-2xl font-bold text-[#2E1F16] sm:text-3xl">
          {activeDataset.headline}
        </span>
        <span
          class="ui-badge border-[#C8E6C9] bg-[#E8F5E9] text-[#2E7D32] text-xs font-semibold"
        >
          <span class="ui-badge-dot bg-[#2E7D32]"></span>
          <span>{activeDataset.deltaText}</span>
        </span>
      </div>
      <div class="text-xs text-[#8C7665]">
        <span>Hover nodes for granular telemetry</span>
      </div>
    </div>

    <!-- Responsive SVG Zigzag Chart -->
    <div class="relative mt-4 w-full overflow-hidden">
      <svg
        viewBox="0 0 {svgWidth} {svgHeight}"
        class="h-56 w-full select-none sm:h-64"
      >
        <defs>
          <linearGradient
            id="espressoZigzagGradient"
            x1="0%"
            y1="0%"
            x2="0%"
            y2="100%"
          >
            <stop offset="0%" stop-color="#5A3825" stop-opacity="0.32" />
            <stop offset="85%" stop-color="#C68B59" stop-opacity="0.06" />
            <stop offset="100%" stop-color="#C68B59" stop-opacity="0.0" />
          </linearGradient>
        </defs>

        <!-- Horizontal Reference Gridlines -->
        {#each gridLines as yPos}
          <line
            x1={padLeft}
            y1={yPos}
            x2={svgWidth - padRight}
            y2={yPos}
            stroke="#EDE4D8"
            stroke-width="1"
            stroke-dasharray="4 4"
          />
        {/each}

        <!-- Translucent Zigzag Area Fill -->
        {#if polygonPoints}
          <polygon points={polygonPoints} fill="url(#espressoZigzagGradient)" />
        {/if}

        <!-- Zigzag Trend Polyline Stroke -->
        {#if polylinePoints}
          <polyline
            points={polylinePoints}
            fill="none"
            stroke="#5A3825"
            stroke-width="3"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        {/if}

        <!-- Interactive Data Nodes & Tooltip Rings -->
        {#each computedCoordinates as point, index}
          <!-- Node Click/Hover Target Area -->
          <g
            class="cursor-pointer"
            role="button"
            tabindex="0"
            aria-label="{point.label}: {point.value} {point.unit}"
            onmouseenter={() => (hoveredPointIndex = index)}
            onmouseleave={() => (hoveredPointIndex = null)}
            onfocus={() => (hoveredPointIndex = index)}
            onblur={() => (hoveredPointIndex = null)}
          >
            <!-- Outer Glow when Hovered -->
            {#if hoveredPointIndex === index}
              <circle
                cx={point.x}
                cy={point.y}
                r="10"
                fill="#C68B59"
                fill-opacity="0.25"
              />
            {/if}

            <!-- Core Node Circle -->
            <circle
              cx={point.x}
              cy={point.y}
              r={hoveredPointIndex === index ? 5.5 : 4}
              fill="#ffffff"
              stroke="#5A3825"
              stroke-width="2.5"
              class="transition-all duration-150"
            />

            <!-- X-Axis Label -->
            <text
              x={point.x}
              y={svgHeight - 10}
              text-anchor="middle"
              font-size="11"
              font-family="system-ui, sans-serif"
              font-weight={hoveredPointIndex === index ? "700" : "500"}
              fill={hoveredPointIndex === index ? "#2E1F16" : "#8C7665"}
            >
              {point.label}
            </text>
          </g>
        {/each}
      </svg>

      <!-- Floating Tooltip Box when a node is hovered -->
      {#if hoveredPointIndex !== null && computedCoordinates[hoveredPointIndex]}
        {@const hp = computedCoordinates[hoveredPointIndex]}
        <div
          class="pointer-events-none absolute z-20 flex -translate-x-1/2 flex-col items-center rounded-xl border border-[#3D2517] bg-[#231712] px-3.5 py-2 text-white shadow-xl transition-all"
          style="left: {(hp.x / svgWidth) * 100}%; top: {Math.max(
            8,
            (hp.y / svgHeight) * 100 - 32,
          )}%;"
        >
          <div class="text-[10px] font-semibold text-[#D8A57A]">
            {hp.label} ({hp.sublabel})
          </div>
          <div class="font-mono text-sm font-bold text-white">
            {hp.value}
            {hp.unit}
          </div>
          <div class="text-[9.5px] font-medium text-[#A5D6A7]">
            {hp.delta} vs cycle avg
          </div>
        </div>
      {/if}
    </div>
  </div>

  <!-- Unified Procurement Pipeline Funnel Card -->
  <div
    class="rounded-2xl border border-[#EDE4D8] bg-white p-5 shadow-xs sm:p-6"
  >
    <div
      class="mb-4 flex flex-col justify-between gap-2 border-b border-[#F0E7DD] pb-4 sm:flex-row sm:items-center"
    >
      <div>
        <div
          class="text-[10px] font-bold tracking-wider text-[#8C7665] uppercase sm:text-xs"
        >
          {dict.pipelineTitle}
        </div>
        <h3 class="mt-0.5 text-base font-bold text-[#2E1F16]">
          Real-Time Inventory Progression
        </h3>
      </div>
      <div class="text-xs text-[#8C7665]">
        {dict.pipelineSubtitle}
      </div>
    </div>

    <!-- 5 Pipeline Steps Grid -->
    <div class="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-5">
      <!-- Step 1: Draft PR -->
      <a
        href="/purchase-requests?status=DRAFT"
        class="group flex flex-col justify-between rounded-xl border border-[#E9DFD3] bg-[#FCFAF7] p-3.5 transition hover:border-[#C68B59] hover:bg-white"
      >
        <div class="flex items-center justify-between text-xs text-[#8C7665]">
          <span class="font-mono text-[10px] font-bold">STAGE 01</span>
          <span
            class="ui-badge border-[#E0D5C7] bg-[#FAF4ED] text-[#7D6B5D] text-[10px]"
          >
            {data.pipelineCounts.draftPr}
          </span>
        </div>
        <div class="mt-3">
          <div
            class="text-xs font-bold text-[#2E1F16] group-hover:text-[#5A3825]"
          >
            Draft PRs
          </div>
          <div class="mt-0.5 text-[10px] text-[#8C7665]">
            Warehouse staff drafting
          </div>
        </div>
      </a>

      <!-- Step 2: Awaiting Approval -->
      <a
        href="/purchase-requests?status=SUBMITTED"
        class="group flex flex-col justify-between rounded-xl border border-[#FFE082] bg-[#FFFDE7] p-3.5 transition hover:border-[#D97706] hover:bg-white"
      >
        <div class="flex items-center justify-between text-xs text-[#D97706]">
          <span class="font-mono text-[10px] font-bold">STAGE 02</span>
          <span
            class="ui-badge border-[#FFE082] bg-[#FFF8E1] text-[#B45309] text-[10px]"
          >
            {data.pipelineCounts.submittedPr}
          </span>
        </div>
        <div class="mt-3">
          <div class="text-xs font-bold text-[#B45309]">Awaiting Approval</div>
          <div class="mt-0.5 text-[10px] text-[#8C7665]">
            Manager sign-off queue
          </div>
        </div>
      </a>

      <!-- Step 3: PO Issued -->
      <a
        href="/purchase-orders?status=ORDERED"
        class="group flex flex-col justify-between rounded-xl border border-[#E9DFD3] bg-[#FCFAF7] p-3.5 transition hover:border-[#5A3825] hover:bg-white"
      >
        <div class="flex items-center justify-between text-xs text-[#5A3825]">
          <span class="font-mono text-[10px] font-bold">STAGE 03</span>
          <span
            class="ui-badge border-[#D8C7B8] bg-[#F5EFEB] text-[#5A3825] text-[10px]"
          >
            {data.pipelineCounts.orderedPo}
          </span>
        </div>
        <div class="mt-3">
          <div
            class="text-xs font-bold text-[#2E1F16] group-hover:text-[#5A3825]"
          >
            PO Issued
          </div>
          <div class="mt-0.5 text-[10px] text-[#8C7665]">
            Supplier dispatched
          </div>
        </div>
      </a>

      <!-- Step 4: Receiving Bay -->
      <a
        href="/purchase-orders?status=PARTIALLY_RECEIVED"
        class="group flex flex-col justify-between rounded-xl border border-[#E9DFD3] bg-[#FCFAF7] p-3.5 transition hover:border-[#C68B59] hover:bg-white"
      >
        <div class="flex items-center justify-between text-xs text-[#C68B59]">
          <span class="font-mono text-[10px] font-bold">STAGE 04</span>
          <span
            class="ui-badge border-[#E2CEBC] bg-[#FAF2EB] text-[#A86F3E] text-[10px]"
          >
            {data.pipelineCounts.partialPo}
          </span>
        </div>
        <div class="mt-3">
          <div
            class="text-xs font-bold text-[#2E1F16] group-hover:text-[#A86F3E]"
          >
            Receiving Bay
          </div>
          <div class="mt-0.5 text-[10px] text-[#8C7665]">
            Dock inspection in progress
          </div>
        </div>
      </a>

      <!-- Step 5: Stock Settled -->
      <a
        href="/goods-receipts"
        class="group flex flex-col justify-between rounded-xl border border-[#C8E6C9] bg-[#F1F8F3] p-3.5 transition hover:border-[#2E7D32] hover:bg-white col-span-2 sm:col-span-1"
      >
        <div class="flex items-center justify-between text-xs text-[#2E7D32]">
          <span class="font-mono text-[10px] font-bold">STAGE 05</span>
          <span
            class="ui-badge border-[#C8E6C9] bg-[#E8F5E9] text-[#2E7D32] text-[10px]"
          >
            {data.pipelineCounts.receivedPo}
          </span>
        </div>
        <div class="mt-3">
          <div class="text-xs font-bold text-[#1B5E20]">Stock Settled</div>
          <div class="mt-0.5 text-[10px] text-[#8C7665]">
            Ledger updated atomically
          </div>
        </div>
      </a>
    </div>
  </div>

  <!-- Two-Column Operational Layout: Warehouse Capacity & Roastery Portfolio -->
  <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
    <!-- Left Card: Warehouse Storage & Capacity Utilization -->
    <div
      class="rounded-2xl border border-[#EDE4D8] bg-white p-5 shadow-xs sm:p-6"
    >
      <div
        class="mb-4 flex items-center justify-between border-b border-[#F0E7DD] pb-4"
      >
        <div>
          <div
            class="text-[10px] font-bold tracking-wider text-[#8C7665] uppercase sm:text-xs"
          >
            Storage Telemetry
          </div>
          <h3 class="mt-0.5 text-base font-bold text-[#2E1F16]">
            {dict.warehouseDistribution}
          </h3>
        </div>
        <a
          href="/inventory"
          class="text-xs font-semibold text-[#5A3825] hover:underline"
        >
          View Ledger &rarr;
        </a>
      </div>

      <div class="space-y-4">
        {#each data.warehousesMetrics as wh}
          <div class="rounded-xl border border-[#F0E7DD] bg-[#FCFAF7] p-3.5">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="font-mono text-xs font-bold text-[#5A3825]">
                  {wh.code}
                </span>
                <span class="text-xs font-bold text-[#2E1F16]">
                  {wh.name}
                </span>
              </div>
              <div class="flex items-center gap-2">
                {#if wh.lowStockCount > 0}
                  <span
                    class="ui-badge border-[#FFCDD2] bg-[#FFEBEE] text-[#C62828] text-[10px]"
                  >
                    <span class="ui-badge-dot bg-[#C62828]"></span>
                    <span>{wh.lowStockCount} Critical</span>
                  </span>
                {/if}
                <span class="font-mono text-xs font-bold text-[#2E1F16]">
                  {wh.capacityUtilization}%
                </span>
              </div>
            </div>

            <!-- Capacity Progress Bar -->
            <div
              class="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-[#EDE4D8]"
            >
              <div
                class="h-full rounded-full transition-all duration-300 {wh.capacityUtilization >
                85
                  ? 'bg-[#C62828]'
                  : wh.capacityUtilization > 65
                    ? 'bg-[#D97706]'
                    : 'bg-[#5A3825]'}"
                style="width: {wh.capacityUtilization}%;"
              ></div>
            </div>

            <div
              class="mt-2 flex items-center justify-between text-[11px] text-[#8C7665]"
            >
              <span>{wh.itemCount} SKUs Stored</span>
              <span
                >Total Volume: <strong class="text-[#2E1F16]"
                  >{wh.totalQuantity}</strong
                > Units</span
              >
            </div>
          </div>
        {/each}
      </div>
    </div>

    <!-- Right Card: Roastery Portfolio Composition -->
    <div
      class="rounded-2xl border border-[#EDE4D8] bg-white p-5 shadow-xs sm:p-6"
    >
      <div
        class="mb-4 flex items-center justify-between border-b border-[#F0E7DD] pb-4"
      >
        <div>
          <div
            class="text-[10px] font-bold tracking-wider text-[#8C7665] uppercase sm:text-xs"
          >
            Material Inventory Mix
          </div>
          <h3 class="mt-0.5 text-base font-bold text-[#2E1F16]">
            {dict.roasteryPortfolio}
          </h3>
        </div>
        <span class="text-xs text-[#8C7665]"> Active Roasting Run </span>
      </div>

      <!-- Segmented Stack Bar -->
      <div class="h-3 w-full overflow-hidden rounded-full bg-[#EDE4D8] flex">
        {#each portfolioCategories as cat}
          <div
            class="{cat.color} h-full transition-all duration-300"
            style="width: {cat.share}%;"
            title="{cat.name}: {cat.share}%"
          ></div>
        {/each}
      </div>

      <!-- Category Breakdown List -->
      <div class="mt-4 space-y-3">
        {#each portfolioCategories as cat}
          <div class="flex items-center justify-between text-xs">
            <div class="flex items-center gap-2">
              <span class="h-2.5 w-2.5 rounded-sm {cat.color} shrink-0"></span>
              <span class="font-medium text-[#2E1F16]">{cat.name}</span>
            </div>
            <div class="flex items-center gap-3">
              <span class="font-mono text-xs text-[#8C7665]">{cat.stock}</span>
              <span
                class="font-mono text-xs font-bold text-[#2E1F16] w-10 text-right"
                >{cat.share}%</span
              >
            </div>
          </div>
        {/each}
      </div>

      <div class="mt-5 border-t border-[#F0E7DD] pt-4">
        <div class="flex items-center justify-between text-xs text-[#8C7665]">
          <span>Composite Green Bean Reserve</span>
          <span class="font-mono font-bold text-[#2E1F16]"
            >~18 Operating Days</span
          >
        </div>
      </div>
    </div>
  </div>

  <!-- Bottom Section: Stock Attention & Recent Activity Table -->
  <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
    <!-- Left Column: Critical Stock Items -->
    <div
      class="flex flex-col justify-between rounded-2xl border border-[#EDE4D8] bg-white p-5 shadow-xs sm:p-6"
    >
      <div>
        <div
          class="mb-4 flex items-center justify-between border-b border-[#F0E7DD] pb-4"
        >
          <div>
            <div
              class="flex items-center gap-1.5 text-xs font-bold tracking-wider text-[#C62828] uppercase"
            >
              <svg
                class="h-3.5 w-3.5 text-[#C62828]"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path
                  d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"
                />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              <span>{dict.attentionTitle}</span>
            </div>
            <h3 class="mt-0.5 text-base font-bold text-[#2E1F16]">
              {dict.attentionSubtitle}
            </h3>
          </div>
          <span
            class="ui-badge border-[#FFCDD2] bg-[#FFEBEE] text-[#C62828] text-xs font-bold"
          >
            {data.lowStockCount} SKU
          </span>
        </div>

        {#if data.lowStockBalances.length === 0}
          <div
            class="rounded-xl border border-[#EDE4D8] bg-[#FAF7F2] p-4 text-center text-xs text-[#8C7665]"
          >
            All warehouse items are currently above their reorder safety
            thresholds.
          </div>
        {:else}
          <div class="space-y-3">
            {#each data.lowStockBalances.slice(0, 4) as item}
              <div
                class="rounded-xl border border-[#F3E7DC] bg-[#FCFAF7] p-3 transition hover:border-[#D5C5B5]"
              >
                <div class="flex items-center justify-between gap-2">
                  <span class="truncate text-xs font-bold text-[#2E1F16]">
                    {item.productName}
                  </span>
                  <span
                    class="ui-badge border-[#FFCDD2] bg-[#FFEBEE] text-[#C62828] text-[10px]"
                  >
                    <span class="ui-badge-dot bg-[#C62828]"></span>
                    <span>{dict.critical}</span>
                  </span>
                </div>
                <div
                  class="mt-2 flex items-center justify-between text-[11px] text-[#7A685B]"
                >
                  <span class="text-[10px] text-[#8C7665]">
                    {item.warehouseName}
                  </span>
                  <span class="font-mono font-bold text-[#C62828]">
                    {item.quantity} / Min {item.minStock}
                    {item.productUnit}
                  </span>
                </div>
              </div>
            {/each}
          </div>
        {/if}
      </div>

      <div class="mt-4 border-t border-[#F0E7DD] pt-4">
        <a
          href="/purchase-requests"
          class="flex w-full items-center justify-center gap-1.5 rounded-xl bg-[#5A3825] px-3 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-[#432718]"
        >
          <span>+ New Purchase Request</span>
          <svg
            class="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M7 17 17 7" />
            <path d="M7 7h10v10" />
          </svg>
        </a>
      </div>
    </div>

    <!-- Right 2 Columns: Recent Audit History -->
    <div
      class="rounded-2xl border border-[#EDE4D8] bg-white p-5 shadow-xs sm:p-6 lg:col-span-2"
    >
      <div
        class="mb-4 flex flex-col justify-between gap-3 border-b border-[#F0E7DD] pb-4 sm:flex-row sm:items-center"
      >
        <div>
          <div
            class="text-[10px] font-bold tracking-wider text-[#8C7665] uppercase sm:text-xs"
          >
            System Compliance Ledger
          </div>
          <h3 class="mt-0.5 text-base font-bold text-[#2E1F16]">
            Recent Stock &amp; Procurement Audit Trail
          </h3>
        </div>
        <a
          href="/audit-logs"
          class="text-xs font-semibold text-[#5A3825] hover:underline"
        >
          Full Audit Log &rarr;
        </a>
      </div>

      <div class="-mx-5 overflow-x-auto sm:mx-0">
        <table class="w-full border-collapse text-left text-xs">
          <thead>
            <tr
              class="border-b border-[#EDE4D8] text-[10px] font-bold tracking-wider text-[#8C7665] uppercase"
            >
              <th class="px-4 py-3">{dict.action} / {dict.moduleEntity}</th>
              <th class="px-4 py-3">{dict.summary}</th>
              <th class="px-4 py-3">{dict.operator}</th>
              <th class="px-4 py-3 text-right">{dict.timestamp}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-[#F5EDE4]">
            {#each data.recentAudits as log}
              <tr class="text-[#2E1F16] transition hover:bg-[#FAF7F2]">
                <td class="px-4 py-3 whitespace-nowrap">
                  <span
                    class="ui-badge border-[#E0D5C7] bg-[#FAF4ED] text-[#5A3825] text-[10px]"
                  >
                    <span class="ui-badge-dot bg-[#5A3825]"></span>
                    <span>{log.action}</span>
                  </span>
                  <span class="ml-1.5 font-mono text-[10px] text-[#8C7665]">
                    {log.entityType}
                  </span>
                </td>
                <td class="px-4 py-3 font-medium text-[#2E1F16]">
                  {log.summary}
                </td>
                <td class="px-4 py-3 text-[#6A574A]">
                  {log.actorName}
                  <span class="font-mono text-[10px] text-[#8C7665]"
                    >({log.actorRole})</span
                  >
                </td>
                <td
                  class="px-4 py-3 text-right font-mono text-[11px] whitespace-nowrap text-[#8C7665]"
                >
                  {new Date(log.createdAt).toLocaleString()}
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </div>
  </div>
</div>
