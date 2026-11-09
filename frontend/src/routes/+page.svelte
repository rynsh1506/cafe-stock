<script lang="ts">
  import { getDictionary } from "@/lib/i18n";
  import type { DashboardPageData } from "@/routes/+page.server";

  let { data }: { data: DashboardPageData } = $props();
  let dict = $derived(getDictionary(data.lang));
</script>

<div class="space-y-8">
  <!-- Clean Apple Editorial Header -->
  <div class="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
    <div>
      <div class="text-[12px] font-medium text-[#86868B]">
        {dict.brandSubtitle}
      </div>
      <h1
        class="mt-1 text-2xl font-semibold tracking-tight text-[#1D1D1F] sm:text-[28px]"
      >
        {dict.navDashboard}
      </h1>
    </div>

    <div class="flex flex-wrap items-center gap-2.5">
      <a
        href="/purchase-requests"
        class="apple-btn-primary inline-flex items-center gap-2 px-4 py-2 text-[13px]"
      >
        <span>+ {dict.navPurchaseRequests}</span>
      </a>
      <a
        href="/goods-receipts"
        class="apple-btn-secondary inline-flex items-center gap-2 px-4 py-2 text-[13px]"
      >
        <span>{dict.navGoodsReceipts}</span>
      </a>
    </div>
  </div>

  <!-- 4 Clean Apple Metric Cards (Tabular Numbers, Zero Rainbow Clutter) -->
  <div class="grid grid-cols-2 gap-3.5 sm:gap-5 lg:grid-cols-4">
    <a
      href="/master"
      class="apple-card group flex flex-col justify-between p-5 transition hover:border-black/[0.15]"
    >
      <div class="flex items-center justify-between gap-2">
        <span class="text-[12px] font-medium text-[#86868B]">
          {dict.kpiActiveProducts}
        </span>
        <span
          class="font-mono text-[11px] text-[#86868B] transition group-hover:text-[#1D1D1F]"
        >
          &rarr;
        </span>
      </div>
      <div class="mt-4">
        <div
          class="text-2xl font-semibold tracking-tight text-[#1D1D1F] tabular-nums sm:text-[32px]"
        >
          {data.totalActiveProducts}
        </div>
        <div class="mt-1 text-[11px] text-[#86868B]">Active SKUs</div>
      </div>
    </a>

    <a
      href="/inventory?lowStock=true"
      class="apple-card group flex flex-col justify-between p-5 transition hover:border-black/[0.15]"
    >
      <div class="flex items-center justify-between gap-2">
        <span class="text-[12px] font-medium text-[#86868B]">
          {dict.kpiLowStockAlerts}
        </span>
        <span
          class="h-2 w-2 rounded-full {data.lowStockCount > 0
            ? 'bg-[#D70015]'
            : 'bg-[#1D1D1F]/20'}"
        ></span>
      </div>
      <div class="mt-4">
        <div
          class="text-2xl font-semibold tracking-tight text-[#1D1D1F] tabular-nums sm:text-[32px]"
        >
          {data.lowStockCount}
        </div>
        <div class="mt-1 text-[11px] text-[#86868B]">
          {data.lowStockCount > 0 ? "Below threshold" : "All stock healthy"}
        </div>
      </div>
    </a>

    <a
      href="/purchase-requests?status=SUBMITTED"
      class="apple-card group flex flex-col justify-between p-5 transition hover:border-black/[0.15]"
    >
      <div class="flex items-center justify-between gap-2">
        <span class="text-[12px] font-medium text-[#86868B]">
          {dict.kpiPendingPr}
        </span>
        <span
          class="font-mono text-[11px] text-[#86868B] transition group-hover:text-[#1D1D1F]"
        >
          &rarr;
        </span>
      </div>
      <div class="mt-4">
        <div
          class="text-2xl font-semibold tracking-tight text-[#1D1D1F] tabular-nums sm:text-[32px]"
        >
          {data.pendingPrCount}
        </div>
        <div class="mt-1 text-[11px] text-[#86868B]">Status SUBMITTED</div>
      </div>
    </a>

    <a
      href="/purchase-orders"
      class="apple-card group flex flex-col justify-between p-5 transition hover:border-black/[0.15]"
    >
      <div class="flex items-center justify-between gap-2">
        <span class="text-[12px] font-medium text-[#86868B]">
          {dict.kpiActivePo}
        </span>
        <span
          class="font-mono text-[11px] text-[#86868B] transition group-hover:text-[#1D1D1F]"
        >
          &rarr;
        </span>
      </div>
      <div class="mt-4">
        <div
          class="text-2xl font-semibold tracking-tight text-[#1D1D1F] tabular-nums sm:text-[32px]"
        >
          {data.activePoCount}
        </div>
        <div class="mt-1 text-[11px] text-[#86868B]">ORDERED / PARTIAL</div>
      </div>
    </a>
  </div>

  <!-- Two-Column Ledger Panels -->
  <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
    <!-- Recent Stock Movements -->
    <section class="apple-card overflow-hidden">
      <div
        class="flex items-center justify-between border-b border-black/[0.06] px-5 py-4 sm:px-6"
      >
        <div>
          <h2 class="text-[15px] font-semibold tracking-tight text-[#1D1D1F]">
            {dict.recentMovements}
          </h2>
          <p class="text-[12px] text-[#86868B]">
            Append-only warehouse stock ledger
          </p>
        </div>
        <a
          href="/inventory"
          class="text-[12px] font-medium text-[#6E6E73] transition hover:text-[#1D1D1F]"
        >
          {dict.navInventory} &rarr;
        </a>
      </div>

      {#if data.recentMovements.length === 0}
        <div class="px-6 py-12 text-center text-[13px] text-[#86868B]">
          No stock movements recorded yet. Post a Goods Receipt to update
          warehouse inventory.
        </div>
      {:else}
        <div class="divide-y divide-black/[0.05]">
          {#each data.recentMovements as mov}
            <div
              class="flex items-center justify-between gap-4 px-5 py-3.5 sm:px-6"
            >
              <div class="min-w-0">
                <div class="truncate text-[13px] font-medium text-[#1D1D1F]">
                  {mov.productName}
                </div>
                <div
                  class="mt-0.5 flex items-center gap-2 font-mono text-[11px] text-[#86868B]"
                >
                  <span>{mov.productSku}</span>
                  <span>•</span>
                  <span>{mov.warehouseCode}</span>
                </div>
              </div>
              <div class="shrink-0 text-right tabular-nums">
                <div class="font-mono text-[13px] font-semibold text-[#1D1D1F]">
                  +{mov.quantityChange}
                  {mov.productUnit}
                </div>
                <div class="text-[11px] text-[#86868B]">
                  Bal: {mov.balanceAfter}
                  {mov.productUnit}
                </div>
              </div>
            </div>
          {/each}
        </div>
      {/if}
    </section>

    <!-- Recent Audit Trail -->
    <section class="apple-card overflow-hidden">
      <div
        class="flex items-center justify-between border-b border-black/[0.06] px-5 py-4 sm:px-6"
      >
        <div>
          <h2 class="text-[15px] font-semibold tracking-tight text-[#1D1D1F]">
            {dict.recentAuditTrail}
          </h2>
          <p class="text-[12px] text-[#86868B]">
            Verified actor & state transitions
          </p>
        </div>
        <a
          href="/audit-logs"
          class="text-[12px] font-medium text-[#6E6E73] transition hover:text-[#1D1D1F]"
        >
          {dict.navAuditLogs} &rarr;
        </a>
      </div>

      <div class="divide-y divide-black/[0.05]">
        {#each data.recentAudits as log}
          <div
            class="flex items-start justify-between gap-4 px-5 py-3.5 sm:px-6"
          >
            <div class="min-w-0">
              <div class="flex items-center gap-2">
                <span class="h-1.5 w-1.5 rounded-full bg-[#1D1D1F]"></span>
                <span
                  class="font-mono text-[11px] font-medium tracking-tight text-[#6E6E73]"
                >
                  {log.action}
                </span>
              </div>
              <p class="mt-1 text-[13px] font-medium text-[#1D1D1F]">
                {log.summary}
              </p>
              <p class="mt-0.5 text-[11px] text-[#86868B]">
                {log.actorName} · {log.actorRole}
              </p>
            </div>
            <span class="shrink-0 font-mono text-[11px] text-[#86868B]">
              {new Date(log.createdAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
        {/each}
      </div>
    </section>
  </div>
</div>
