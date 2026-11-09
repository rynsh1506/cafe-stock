<script lang="ts">
  import { getDictionary } from "@/lib/i18n";
  import type { DashboardPageData } from "@/routes/+page.server";

  let { data }: { data: DashboardPageData } = $props();
  let dict = $derived(getDictionary(data.lang));
</script>

<div>
  <!-- Top View Toolbar -->
  <div
    class="flex flex-wrap items-center justify-between gap-3 border-b border-[#EDEDED] px-5 py-3 sm:px-6"
  >
    <h1 class="text-[15px] font-semibold tracking-tight text-[#111113]">
      {dict.navDashboard}
    </h1>

    <div class="flex items-center gap-2">
      <a href="/purchase-requests" class="ui-btn"> + New Request </a>
      <a href="/goods-receipts" class="ui-btn-outline"> Record Receipt </a>
    </div>
  </div>

  <!-- Flat Structural Metric Strip (Divided by 1px Hairlines — Zero Floating Cards) -->
  <div
    class="grid grid-cols-2 divide-x divide-y divide-[#EDEDED] border-b border-[#EDEDED] bg-[#FAFAFA] sm:grid-cols-4 sm:divide-y-0"
  >
    <a
      href="/master"
      class="flex items-baseline justify-between px-5 py-3.5 transition hover:bg-black/[0.02] sm:px-6"
    >
      <span class="text-[12px] text-[#71717A]">{dict.kpiActiveProducts}</span>
      <span
        class="font-mono text-[16px] font-semibold text-[#111113] tabular-nums"
      >
        {data.totalActiveProducts}
      </span>
    </a>

    <a
      href="/inventory?lowStock=true"
      class="flex items-baseline justify-between px-5 py-3.5 transition hover:bg-black/[0.02] sm:px-6"
    >
      <span class="text-[12px] text-[#71717A]">{dict.kpiLowStockAlerts}</span>
      <span
        class="font-mono text-[16px] font-semibold tabular-nums {data.lowStockCount >
        0
          ? 'text-[#DC2626]'
          : 'text-[#111113]'}"
      >
        {data.lowStockCount}
      </span>
    </a>

    <a
      href="/purchase-requests?status=SUBMITTED"
      class="flex items-baseline justify-between px-5 py-3.5 transition hover:bg-black/[0.02] sm:px-6"
    >
      <span class="text-[12px] text-[#71717A]">{dict.kpiPendingPr}</span>
      <span
        class="font-mono text-[16px] font-semibold text-[#111113] tabular-nums"
      >
        {data.pendingPrCount}
      </span>
    </a>

    <a
      href="/purchase-orders"
      class="flex items-baseline justify-between px-5 py-3.5 transition hover:bg-black/[0.02] sm:px-6"
    >
      <span class="text-[12px] text-[#71717A]">{dict.kpiActivePo}</span>
      <span
        class="font-mono text-[16px] font-semibold text-[#111113] tabular-nums"
      >
        {data.activePoCount}
      </span>
    </a>
  </div>

  <!-- Split Structural Ledger Panes -->
  <div
    class="grid grid-cols-1 divide-y divide-[#EDEDED] lg:grid-cols-2 lg:divide-x lg:divide-y-0"
  >
    <!-- Left Pane: Recent Stock Movements -->
    <section>
      <div
        class="flex items-center justify-between border-b border-[#EDEDED] px-5 py-2.5 sm:px-6"
      >
        <h2 class="text-[12px] font-medium text-[#52525B]">
          {dict.recentMovements}
        </h2>
        <a
          href="/inventory"
          class="text-[12px] text-[#71717A] hover:text-[#111113]"
        >
          View all &rarr;
        </a>
      </div>

      {#if data.recentMovements.length === 0}
        <div class="px-6 py-12 text-center text-[12px] text-[#71717A]">
          No stock movements recorded yet.
        </div>
      {:else}
        <div class="divide-y divide-[#F4F4F5]">
          {#each data.recentMovements as mov}
            <div
              class="flex items-center justify-between gap-4 px-5 py-2.5 hover:bg-[#FAFAFA] sm:px-6"
            >
              <div class="min-w-0">
                <div class="truncate text-[13px] font-medium text-[#111113]">
                  {mov.productName}
                </div>
                <div class="font-mono text-[11px] text-[#71717A]">
                  {mov.productSku} · {mov.warehouseCode}
                </div>
              </div>
              <div
                class="shrink-0 text-right font-mono text-[12px] tabular-nums"
              >
                <span class="font-semibold text-[#111113]">
                  +{mov.quantityChange}
                  {mov.productUnit}
                </span>
                <span class="ml-2 text-[#71717A]">
                  ({mov.balanceAfter})
                </span>
              </div>
            </div>
          {/each}
        </div>
      {/if}
    </section>

    <!-- Right Pane: Recent Activity -->
    <section>
      <div
        class="flex items-center justify-between border-b border-[#EDEDED] px-5 py-2.5 sm:px-6"
      >
        <h2 class="text-[12px] font-medium text-[#52525B]">
          {dict.recentAuditTrail}
        </h2>
        <a
          href="/audit-logs"
          class="text-[12px] text-[#71717A] hover:text-[#111113]"
        >
          View all &rarr;
        </a>
      </div>

      <div class="divide-y divide-[#F4F4F5]">
        {#each data.recentAudits as log}
          <div
            class="flex items-center justify-between gap-4 px-5 py-2.5 hover:bg-[#FAFAFA] sm:px-6"
          >
            <div class="min-w-0">
              <div class="truncate text-[13px] text-[#111113]">
                {log.summary}
              </div>
              <div class="text-[11px] text-[#71717A]">
                <span class="font-mono">{log.action}</span> · {log.actorName}
              </div>
            </div>
            <span class="shrink-0 font-mono text-[11px] text-[#71717A]">
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
