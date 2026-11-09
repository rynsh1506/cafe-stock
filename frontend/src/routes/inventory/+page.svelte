<script lang="ts">
  import { getDictionary } from "@/lib/i18n";
  import type { InventoryPageData } from "@/routes/inventory/+page.server";

  let { data }: { data: InventoryPageData } = $props();
  let dict = $derived(getDictionary(data.lang));
  let activeView = $state<"balances" | "movements">("balances");
</script>

<div>
  <!-- Toolbar -->
  <div
    class="flex flex-wrap items-center justify-between gap-3 border-b border-[#EDEDED] px-5 py-3 sm:px-6"
  >
    <div class="flex flex-wrap items-center gap-3">
      <h1 class="text-[15px] font-semibold tracking-tight text-[#111]">
        {dict.navInventory}
      </h1>

      <div class="ui-tabs">
        <button
          type="button"
          onclick={() => (activeView = "balances")}
          class="ui-tab cursor-pointer {activeView === 'balances'
            ? 'ui-tab-active'
            : ''}"
        >
          Stock Balances ({data.balances.length})
        </button>
        <button
          type="button"
          onclick={() => (activeView = "movements")}
          class="ui-tab cursor-pointer {activeView === 'movements'
            ? 'ui-tab-active'
            : ''}"
        >
          Movement Ledger ({data.movements.length})
        </button>
      </div>
    </div>

    <form
      method="GET"
      action="/inventory"
      class="flex flex-wrap items-center gap-2"
    >
      <div class="w-48">
        <select name="warehouseId" class="ui-select">
          <option value="">All Warehouses</option>
          {#each data.warehouses as wh}
            <option value={wh.id} selected={data.warehouseFilter === wh.id}>
              {wh.code} — {wh.name}
            </option>
          {/each}
        </select>
      </div>

      <label
        class="ui-btn-outline flex cursor-pointer items-center gap-1.5 text-[12px]"
      >
        <input
          type="checkbox"
          name="lowStock"
          value="true"
          checked={data.lowStockOnly}
          class="h-3.5 w-3.5 accent-[#111]"
        />
        <span>Low Stock</span>
      </label>

      <button type="submit" class="ui-btn cursor-pointer">Filter</button>
    </form>
  </div>

  {#if activeView === "balances"}
    <!-- Desktop Table -->
    <div class="hidden overflow-x-auto md:block">
      <table class="w-full text-left text-[13px]">
        <thead>
          <tr
            class="border-b border-[#EDEDED] bg-[#FAFAFA] text-[11px] font-medium text-[#777]"
          >
            <th class="px-5 py-2.5 sm:px-6">Warehouse</th>
            <th class="px-5 py-2.5 sm:px-6">SKU</th>
            <th class="px-5 py-2.5 sm:px-6">Product</th>
            <th class="px-5 py-2.5 text-right sm:px-6">Min Threshold</th>
            <th class="px-5 py-2.5 text-right sm:px-6">Available</th>
            <th class="px-5 py-2.5 text-center sm:px-6">Status</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-[#F2F2F2]">
          {#each data.balances as bal}
            <tr class="hover:bg-[#FAFAFA]">
              <td class="px-5 py-2.5 sm:px-6">
                <span class="font-mono text-[12px] font-medium text-[#111]"
                  >{bal.warehouseCode}</span
                >
                <span class="ml-1.5 text-[#666]">{bal.warehouseName}</span>
              </td>
              <td class="px-5 py-2.5 font-mono text-[12px] text-[#555] sm:px-6">
                {bal.productSku}
              </td>
              <td class="px-5 py-2.5 font-medium text-[#111] sm:px-6">
                {bal.productName}
              </td>
              <td
                class="px-5 py-2.5 text-right font-mono text-[12px] text-[#777] tabular-nums sm:px-6"
              >
                {bal.minStock}
                {bal.productUnit}
              </td>
              <td
                class="px-5 py-2.5 text-right font-mono text-[13px] font-semibold text-[#111] tabular-nums sm:px-6"
              >
                {bal.quantity}
                {bal.productUnit}
              </td>
              <td class="px-5 py-2.5 text-center sm:px-6">
                <span
                  class="inline-flex items-center gap-1.5 font-mono text-[11px] text-[#111]"
                >
                  <span
                    class="h-1.5 w-1.5 rounded-full {bal.isLowStock
                      ? 'bg-[#D93025]'
                      : 'bg-[#111]'}"
                  ></span>
                  <span>{bal.isLowStock ? "LOW" : "OK"}</span>
                </span>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>

    <!-- Mobile List -->
    <div class="divide-y divide-[#EDEDED] md:hidden">
      {#each data.balances as bal}
        <div class="flex items-center justify-between gap-3 px-5 py-3">
          <div class="min-w-0">
            <div class="flex items-center gap-2">
              <span
                class="h-1.5 w-1.5 rounded-full {bal.isLowStock
                  ? 'bg-[#D93025]'
                  : 'bg-[#111]'}"
              ></span>
              <span class="font-mono text-[11px] text-[#777]"
                >{bal.warehouseCode} · {bal.productSku}</span
              >
            </div>
            <div class="mt-0.5 truncate text-[13px] font-medium text-[#111]">
              {bal.productName}
            </div>
            <div class="text-[11px] text-[#777]">
              Min: {bal.minStock}
              {bal.productUnit}
            </div>
          </div>

          <div class="shrink-0 text-right tabular-nums">
            <div class="font-mono text-[14px] font-semibold text-[#111]">
              {bal.quantity}
            </div>
            <div class="text-[11px] text-[#777]">{bal.productUnit}</div>
          </div>
        </div>
      {/each}
    </div>
  {:else}
    <!-- Movement Ledger Table -->
    <div class="overflow-x-auto">
      <table class="w-full text-left text-[13px]">
        <thead>
          <tr
            class="border-b border-[#EDEDED] bg-[#FAFAFA] text-[11px] font-medium text-[#777]"
          >
            <th class="px-5 py-2.5 sm:px-6">Product</th>
            <th class="px-5 py-2.5 sm:px-6">Warehouse</th>
            <th class="px-5 py-2.5 sm:px-6">Type</th>
            <th class="px-5 py-2.5 text-right sm:px-6">Delta</th>
            <th class="px-5 py-2.5 text-right sm:px-6">Balance After</th>
            <th class="px-5 py-2.5 text-right sm:px-6">Timestamp</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-[#F2F2F2]">
          {#each data.movements as mov}
            <tr class="hover:bg-[#FAFAFA]">
              <td class="px-5 py-2.5 font-medium text-[#111] sm:px-6">
                {mov.productName}
                <span class="ml-1 font-mono text-[11px] text-[#777]"
                  >{mov.productSku}</span
                >
              </td>
              <td class="px-5 py-2.5 font-mono text-[12px] text-[#555] sm:px-6">
                {mov.warehouseCode}
              </td>
              <td class="px-5 py-2.5 font-mono text-[11px] text-[#555] sm:px-6">
                {mov.movementType}
              </td>
              <td
                class="px-5 py-2.5 text-right font-mono text-[12px] font-semibold text-[#111] tabular-nums sm:px-6"
              >
                +{mov.quantityChange}
                {mov.productUnit}
              </td>
              <td
                class="px-5 py-2.5 text-right font-mono text-[12px] text-[#555] tabular-nums sm:px-6"
              >
                {mov.balanceAfter}
                {mov.productUnit}
              </td>
              <td
                class="px-5 py-2.5 text-right font-mono text-[11px] text-[#777] sm:px-6"
              >
                {new Date(mov.createdAt).toLocaleString()}
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {/if}
</div>
