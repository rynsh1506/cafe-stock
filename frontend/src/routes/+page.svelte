<script lang="ts">
  import { getDictionary } from "@/lib/i18n";
  import type { DashboardPageData } from "@/routes/+page.server";

  let { data }: { data: DashboardPageData } = $props();
  let dict = $derived(getDictionary(data.lang));
</script>

<div class="space-y-6">
  <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
    <a
      href="/master"
      class="rounded-xl border border-stone-200 bg-white p-5 shadow-xs transition hover:border-amber-400"
    >
      <div class="text-xs font-semibold tracking-wide text-stone-500 uppercase">
        {dict.kpiActiveProducts}
      </div>
      <div class="mt-2 text-3xl font-bold text-stone-900">
        {data.totalActiveProducts}
      </div>
    </a>

    <a
      href="/inventory?lowStock=true"
      class="rounded-xl border border-stone-200 bg-white p-5 shadow-xs transition hover:border-amber-400"
    >
      <div class="text-xs font-semibold tracking-wide text-stone-500 uppercase">
        {dict.kpiLowStockAlerts}
      </div>
      <div
        class="mt-2 text-3xl font-bold {data.lowStockCount > 0
          ? 'text-amber-700'
          : 'text-emerald-700'}"
      >
        {data.lowStockCount}
      </div>
    </a>

    <a
      href="/purchase-requests?status=SUBMITTED"
      class="rounded-xl border border-stone-200 bg-white p-5 shadow-xs transition hover:border-amber-400"
    >
      <div class="text-xs font-semibold tracking-wide text-stone-500 uppercase">
        {dict.kpiPendingPr}
      </div>
      <div class="mt-2 text-3xl font-bold text-sky-700">
        {data.pendingPrCount}
      </div>
    </a>

    <a
      href="/purchase-orders"
      class="rounded-xl border border-stone-200 bg-white p-5 shadow-xs transition hover:border-amber-400"
    >
      <div class="text-xs font-semibold tracking-wide text-stone-500 uppercase">
        {dict.kpiActivePo}
      </div>
      <div class="mt-2 text-3xl font-bold text-emerald-700">
        {data.activePoCount}
      </div>
    </a>
  </div>

  <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
    <section class="rounded-xl border border-stone-200 bg-white p-5 shadow-xs">
      <div class="mb-4 flex items-center justify-between">
        <h2 class="text-sm font-bold text-stone-900">{dict.recentMovements}</h2>
        <a
          href="/inventory"
          class="text-xs font-semibold text-amber-800 hover:underline"
          >{dict.navInventory} &rarr;</a
        >
      </div>

      {#if data.recentMovements.length === 0}
        <p class="py-6 text-center text-xs text-stone-500">
          No stock movements recorded yet. Post a Goods Receipt to update
          inventory.
        </p>
      {:else}
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead>
              <tr class="border-b border-stone-200 text-stone-500">
                <th class="pb-2 font-semibold">Product</th>
                <th class="pb-2 font-semibold">Warehouse</th>
                <th class="pb-2 text-right font-semibold">Change</th>
                <th class="pb-2 text-right font-semibold">Balance</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-stone-100">
              {#each data.recentMovements as mov}
                <tr>
                  <td class="py-2.5 font-medium text-stone-800">
                    {mov.productName}
                    <span class="block text-[11px] text-stone-400"
                      >{mov.productSku}</span
                    >
                  </td>
                  <td class="py-2.5 text-stone-600">{mov.warehouseCode}</td>
                  <td class="py-2.5 text-right font-bold text-emerald-700">
                    +{mov.quantityChange}
                    {mov.productUnit}
                  </td>
                  <td class="py-2.5 text-right font-semibold text-stone-800">
                    {mov.balanceAfter}
                    {mov.productUnit}
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      {/if}
    </section>

    <section class="rounded-xl border border-stone-200 bg-white p-5 shadow-xs">
      <div class="mb-4 flex items-center justify-between">
        <h2 class="text-sm font-bold text-stone-900">
          {dict.recentAuditTrail}
        </h2>
        <a
          href="/audit-logs"
          class="text-xs font-semibold text-amber-800 hover:underline"
          >{dict.navAuditLogs} &rarr;</a
        >
      </div>

      <div class="space-y-3">
        {#each data.recentAudits as log}
          <div
            class="flex items-start justify-between gap-3 rounded-lg border border-stone-100 bg-stone-50 px-3.5 py-2.5 text-xs"
          >
            <div>
              <span
                class="inline-block rounded bg-stone-200 px-1.5 py-0.5 text-[10px] font-bold text-stone-700"
                >{log.action}</span
              >
              <p class="mt-1 font-medium text-stone-800">{log.summary}</p>
              <p class="mt-0.5 text-[11px] text-stone-500">
                {log.actorName} ({log.actorRole})
              </p>
            </div>
            <span class="shrink-0 text-[11px] text-stone-400">
              {new Date(log.createdAt).toLocaleTimeString()}
            </span>
          </div>
        {/each}
      </div>
    </section>
  </div>
</div>
