<script lang="ts">
  import { getDictionary } from "@/lib/i18n";
  import type {
    DashboardPageData,
    MetricKey,
    RangeKey,
  } from "@/routes/+page.server";

  let { data }: { data: DashboardPageData } = $props();
  let dict = $derived(getDictionary(data.lang));

  let selectedMetric = $state<MetricKey>("volume");
  let selectedRange = $state<RangeKey>("7D");
  let hoveredPointIndex = $state<number | null>(null);

  let activeDataset = $derived(
    data.chartDatasets[selectedMetric][selectedRange],
  );

  let activeMetricTitle = $derived(
    selectedMetric === "volume"
      ? dict.metricVolume
      : selectedMetric === "spend"
        ? dict.metricSpend
        : dict.metricVelocity,
  );

  let formattedHeadline = $derived.by(() => {
    if (selectedMetric === "volume") {
      return `${activeDataset.totalValue.toLocaleString("id-ID")} KG`;
    }
    if (selectedMetric === "spend") {
      return `Rp ${activeDataset.totalValue.toLocaleString("id-ID")}`;
    }
    return `${activeDataset.averageValue ?? 1.5} ${dict.operatingDays}`;
  });

  let formattedDeltaText = $derived.by(() => {
    if (selectedMetric === "volume") {
      return `${activeDataset.totalValue.toLocaleString("id-ID")} KG ${dict.aggregateIntake}`;
    }
    if (selectedMetric === "spend") {
      return `Rp ${activeDataset.totalValue.toLocaleString("id-ID")} ${dict.aggregateSpend}`;
    }
    return dict.slaTarget;
  });

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

  function formatPointValue(pt: { value: number; unit: string }): string {
    if (pt.unit === "Rp") {
      return `Rp ${pt.value.toLocaleString("id-ID")}`;
    }
    return `${pt.value} ${pt.unit}`;
  }
</script>

<div class="space-y-6">
  <!-- Top Espresso Banner -->
  <div
    class="flex flex-col gap-4 rounded-2xl border border-[#523323] bg-gradient-to-r from-[#2C1E18] to-[#4A2D1D] p-5 text-white shadow-md sm:p-7 md:flex-row md:items-center md:justify-between"
  >
    <div>
      <div
        class="mb-1.5 flex items-center justify-between gap-2 text-[11px] font-semibold tracking-wider text-[#D8A57A] uppercase sm:justify-start"
      >
        <span>{dict.bannerSystemTitle}</span>
        <span class="opacity-60">•</span>
        <span
          class="ui-badge border-[#7A4D33] bg-[#5A3825] font-mono text-[10px] text-white"
        >
          <span class="ui-badge-dot bg-[#E5B589]"></span>
          <span>{dict.roleBadgePrefix} {data.user.role}</span>
        </span>
      </div>
      <h1
        class="font-serif text-xl font-bold tracking-tight text-white sm:text-2xl"
      >
        {dict.welcomeUserPrefix}
        {data.user.name}
      </h1>
      <p
        class="mt-1 max-w-2xl text-xs leading-relaxed text-[#D7CBC1] sm:text-sm"
      >
        {dict.bannerSubtitle}
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
            ? dict.reviewPendingCount(data.pendingPrCount)
            : dict.newPr}
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
          <span class="truncate">{dict.activeCatalogDesc}</span>
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
          {data.pendingPrCount}
        </div>
        <div
          class="mt-1 flex items-center gap-1.5 truncate text-[10px] font-semibold text-[#D97706] sm:text-[11px]"
        >
          <span class="h-1.5 w-1.5 rounded-full bg-[#D97706]"></span>
          <span class="truncate">{dict.pendingSignoffDesc}</span>
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
          {data.activePoCount}
        </div>
        <div
          class="mt-1 flex items-center gap-1.5 truncate text-[10px] font-semibold text-[#5A3825] sm:text-[11px]"
        >
          <span class="h-1.5 w-1.5 rounded-full bg-[#5A3825]"></span>
          <span class="truncate">{dict.inTransitDesc}</span>
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
          {data.lowStockCount}
        </div>
        <div
          class="mt-1 flex items-center gap-1.5 truncate text-[10px] font-semibold text-[#C62828] sm:text-[11px]"
        >
          <span class="h-1.5 w-1.5 rounded-full bg-[#C62828]"></span>
          <span class="truncate">{dict.underReorderDesc}</span>
        </div>
      </div>
    </a>
  </div>

  <!-- Interactive Configurable Zigzag Line & Area Chart Card -->
  <div
    class="rounded-2xl border border-[#EDE4D8] bg-white p-5 shadow-xs sm:p-6"
  >
    <!-- Chart Controls Toolbar -->
    <div
      class="flex flex-col justify-between gap-4 border-b border-[#F0E7DD] pb-5 lg:flex-row lg:items-center"
    >
      <div>
        <div
          class="text-[10px] font-bold tracking-wider text-[#8C7665] uppercase sm:text-xs"
        >
          {dict.interactiveTrendsTitle}
        </div>
        <h2 class="mt-0.5 text-base font-bold text-[#2E1F16] sm:text-lg">
          {activeMetricTitle}
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
          {formattedHeadline}
        </span>
        <span
          class="ui-badge border-[#C8E6C9] bg-[#E8F5E9] text-xs font-semibold text-[#2E7D32]"
        >
          <span class="ui-badge-dot bg-[#2E7D32]"></span>
          <span>{formattedDeltaText}</span>
        </span>
      </div>
      <div class="text-xs text-[#8C7665]">
        <span>{dict.hoverTelemetryNotice}</span>
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
            aria-label="{point.label}: {formatPointValue(point)}"
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
            {#if computedCoordinates.length <= 10 || index % 5 === 0 || index === computedCoordinates.length - 1 || hoveredPointIndex === index}
              <text
                x={point.x}
                y={svgHeight - 10}
                text-anchor="middle"
                font-size="10"
                font-family="system-ui, sans-serif"
                font-weight={hoveredPointIndex === index ? "700" : "500"}
                fill={hoveredPointIndex === index ? "#2E1F16" : "#8C7665"}
              >
                {point.label}
              </text>
            {/if}
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
            {formatPointValue(hp)}
          </div>
          <div class="text-[9.5px] font-medium text-[#A5D6A7]">
            {hp.delta}
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
          {dict.realtimeProgression}
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
          <span class="font-mono text-[10px] font-bold">{dict.stage} 01</span>
          <span
            class="ui-badge border-[#E0D5C7] bg-[#FAF4ED] text-[10px] text-[#7D6B5D]"
          >
            {data.pipelineCounts.draftPr}
          </span>
        </div>
        <div class="mt-3">
          <div
            class="text-xs font-bold text-[#2E1F16] group-hover:text-[#5A3825]"
          >
            {dict.stageDraftTitle}
          </div>
          <div class="mt-0.5 text-[10px] text-[#8C7665]">
            {dict.stageDraftDesc}
          </div>
        </div>
      </a>

      <!-- Step 2: Awaiting Approval -->
      <a
        href="/purchase-requests?status=SUBMITTED"
        class="group flex flex-col justify-between rounded-xl border border-[#FFE082] bg-[#FFFDE7] p-3.5 transition hover:border-[#D97706] hover:bg-white"
      >
        <div class="flex items-center justify-between text-xs text-[#D97706]">
          <span class="font-mono text-[10px] font-bold">{dict.stage} 02</span>
          <span
            class="ui-badge border-[#FFE082] bg-[#FFF8E1] text-[10px] text-[#B45309]"
          >
            {data.pipelineCounts.submittedPr}
          </span>
        </div>
        <div class="mt-3">
          <div class="text-xs font-bold text-[#B45309]">
            {dict.stageApprovalTitle}
          </div>
          <div class="mt-0.5 text-[10px] text-[#8C7665]">
            {dict.stageApprovalDesc}
          </div>
        </div>
      </a>

      <!-- Step 3: PO Issued -->
      <a
        href="/purchase-orders?status=ORDERED"
        class="group flex flex-col justify-between rounded-xl border border-[#E9DFD3] bg-[#FCFAF7] p-3.5 transition hover:border-[#5A3825] hover:bg-white"
      >
        <div class="flex items-center justify-between text-xs text-[#5A3825]">
          <span class="font-mono text-[10px] font-bold">{dict.stage} 03</span>
          <span
            class="ui-badge border-[#D8C7B8] bg-[#F5EFEB] text-[10px] text-[#5A3825]"
          >
            {data.pipelineCounts.orderedPo}
          </span>
        </div>
        <div class="mt-3">
          <div
            class="text-xs font-bold text-[#2E1F16] group-hover:text-[#5A3825]"
          >
            {dict.stagePoTitle}
          </div>
          <div class="mt-0.5 text-[10px] text-[#8C7665]">
            {dict.stagePoDesc}
          </div>
        </div>
      </a>

      <!-- Step 4: Receiving Bay -->
      <a
        href="/purchase-orders?status=PARTIALLY_RECEIVED"
        class="group flex flex-col justify-between rounded-xl border border-[#E9DFD3] bg-[#FCFAF7] p-3.5 transition hover:border-[#C68B59] hover:bg-white"
      >
        <div class="flex items-center justify-between text-xs text-[#C68B59]">
          <span class="font-mono text-[10px] font-bold">{dict.stage} 04</span>
          <span
            class="ui-badge border-[#E2CEBC] bg-[#FAF2EB] text-[10px] text-[#A86F3E]"
          >
            {data.pipelineCounts.partialPo}
          </span>
        </div>
        <div class="mt-3">
          <div
            class="text-xs font-bold text-[#2E1F16] group-hover:text-[#A86F3E]"
          >
            {dict.stageReceivingTitle}
          </div>
          <div class="mt-0.5 text-[10px] text-[#8C7665]">
            {dict.stageReceivingDesc}
          </div>
        </div>
      </a>

      <!-- Step 5: Stock Settled -->
      <a
        href="/goods-receipts"
        class="group col-span-2 flex flex-col justify-between rounded-xl border border-[#C8E6C9] bg-[#F1F8F3] p-3.5 transition hover:border-[#2E7D32] hover:bg-white sm:col-span-1"
      >
        <div class="flex items-center justify-between text-xs text-[#2E7D32]">
          <span class="font-mono text-[10px] font-bold">{dict.stage} 05</span>
          <span
            class="ui-badge border-[#C8E6C9] bg-[#E8F5E9] text-[10px] text-[#2E7D32]"
          >
            {data.pipelineCounts.receivedPo}
          </span>
        </div>
        <div class="mt-3">
          <div class="text-xs font-bold text-[#1B5E20]">
            {dict.stageSettledTitle}
          </div>
          <div class="mt-0.5 text-[10px] text-[#8C7665]">
            {dict.stageSettledDesc}
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
            {dict.storageTelemetry}
          </div>
          <h3 class="mt-0.5 text-base font-bold text-[#2E1F16]">
            {dict.warehouseDistribution}
          </h3>
        </div>
        <a
          href="/inventory"
          class="text-xs font-semibold text-[#5A3825] hover:underline"
        >
          {dict.viewLedger} &rarr;
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
                    class="ui-badge border-[#FFCDD2] bg-[#FFEBEE] text-[10px] text-[#C62828]"
                  >
                    <span class="ui-badge-dot bg-[#C62828]"></span>
                    <span>{wh.lowStockCount} {dict.critical}</span>
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
              <span>{wh.itemCount} {dict.skusStored}</span>
              <span
                >{dict.totalStoredVolume}:
                <strong class="text-[#2E1F16]">{wh.totalQuantity}</strong>
                {dict.units}</span
              >
            </div>
          </div>
        {/each}
      </div>
    </div>

    <!-- Right Card: Real Database Category Portfolio Composition -->
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
            {dict.materialMix}
          </div>
          <h3 class="mt-0.5 text-base font-bold text-[#2E1F16]">
            {dict.roasteryPortfolio}
          </h3>
        </div>
        <span class="text-xs text-[#8C7665]">
          {dict.activeStockComposition}
        </span>
      </div>

      <!-- Segmented Stack Bar from real inventory balances -->
      <div class="flex h-3 w-full overflow-hidden rounded-full bg-[#EDE4D8]">
        {#each data.portfolioCategories as cat}
          <div
            class="{cat.color} h-full transition-all duration-300"
            style="width: {cat.share}%;"
            title="{cat.name}: {cat.share}%"
          ></div>
        {/each}
      </div>

      <!-- Category Breakdown List -->
      <div class="mt-4 space-y-3">
        {#each data.portfolioCategories as cat}
          <div class="flex items-center justify-between text-xs">
            <div class="flex items-center gap-2">
              <span class="h-2.5 w-2.5 shrink-0 rounded-sm {cat.color}"></span>
              <span class="font-medium text-[#2E1F16]">{cat.name}</span>
            </div>
            <div class="flex items-center gap-3">
              <span class="font-mono text-xs text-[#8C7665]">{cat.stock}</span>
              <span
                class="w-10 text-right font-mono text-xs font-bold text-[#2E1F16]"
                >{cat.share}%</span
              >
            </div>
          </div>
        {/each}
      </div>

      <div class="mt-5 border-t border-[#F0E7DD] pt-4">
        <div class="flex items-center justify-between text-xs text-[#8C7665]">
          <span>{dict.compositeReserveDays}</span>
          <span class="font-mono font-bold text-[#2E1F16]"
            >~18 {dict.operatingDays}</span
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
            class="ui-badge border-[#FFCDD2] bg-[#FFEBEE] text-xs font-bold text-[#C62828]"
          >
            {data.lowStockCount} SKU
          </span>
        </div>

        {#if data.lowStockBalances.length === 0}
          <div
            class="rounded-xl border border-[#EDE4D8] bg-[#FAF7F2] p-4 text-center text-xs text-[#8C7665]"
          >
            {dict.allStockHealthy}
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
                    class="ui-badge border-[#FFCDD2] bg-[#FFEBEE] text-[10px] text-[#C62828]"
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
          <span>{dict.newPr}</span>
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
            {dict.complianceLedger}
          </div>
          <h3 class="mt-0.5 text-base font-bold text-[#2E1F16]">
            {dict.auditTrailTitle}
          </h3>
        </div>
        <a
          href="/audit-logs"
          class="text-xs font-semibold text-[#5A3825] hover:underline"
        >
          {dict.fullAuditLog} &rarr;
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
                    class="ui-badge border-[#E0D5C7] bg-[#FAF4ED] text-[10px] text-[#5A3825]"
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
