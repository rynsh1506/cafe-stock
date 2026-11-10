<script lang="ts">
  import { getDictionary } from "@/lib/i18n";
  import CustomSelect from "@/lib/components/CustomSelect.svelte";
  import type { InventoryPageData } from "@/routes/inventory/+page.server";

  let { data }: { data: InventoryPageData } = $props();
  let dict = $derived(getDictionary(data.lang));
  let activeView = $state<"balances" | "movements">("balances");

  let warehouseOptions = $derived([
    { value: "", label: dict.allWarehouses },
    ...data.warehouses.map((wh) => ({
      value: wh.id,
      label: `${wh.code} — ${wh.name}`,
    })),
  ]);
  let selectedWarehouse = $state("");
  $effect(() => {
    selectedWarehouse = data.warehouseFilter || "";
  });
</script>

<div class="space-y-6">
  <!-- Header & Filter Bar -->
  <div class="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
    <div>
      <h1 class="font-serif text-2xl font-bold tracking-tight text-[#231712]">
        {dict.navInventory}
      </h1>
      <p class="mt-0.5 text-xs text-[#7D6B5D]">
        {dict.inventorySubtitle}
      </p>
    </div>

    <div class="flex flex-wrap items-center gap-2.5">
      <div class="ui-tabs">
        <button
          type="button"
          onclick={() => (activeView = "balances")}
          class="ui-tab cursor-pointer {activeView === 'balances'
            ? 'ui-tab-active'
            : ''}"
        >
          {dict.balancesTab} ({data.balances.length})
        </button>
        <button
          type="button"
          onclick={() => (activeView = "movements")}
          class="ui-tab cursor-pointer {activeView === 'movements'
            ? 'ui-tab-active'
            : ''}"
        >
          {dict.movementsTab} ({data.movements.length})
        </button>
      </div>

      <form
        method="GET"
        action="/inventory"
        class="flex flex-wrap items-center gap-2"
      >
        <div class="w-56">
          <CustomSelect
            name="warehouseId"
            bind:value={selectedWarehouse}
            options={warehouseOptions}
            placeholder={dict.allWarehouses}
          />
        </div>

        <label
          class="ui-btn-outline flex cursor-pointer items-center gap-1.5 text-xs"
        >
          <input
            type="checkbox"
            name="lowStock"
            value="true"
            checked={data.lowStockOnly}
            class="h-3.5 w-3.5 accent-[#5A3825]"
          />
          <span>{dict.lowStockOnly}</span>
        </label>

        <button type="submit" class="ui-btn cursor-pointer"
          >{dict.filter}</button
        >
      </form>
    </div>
  </div>

  <!-- Table Card -->
  <div class="ui-card overflow-hidden">
    {#if activeView === "balances"}
      <div class="overflow-x-auto">
        <table class="w-full border-collapse text-left text-xs">
          <thead>
            <tr
              class="border-b border-[#EDE4D8] bg-[#FAF7F2] text-[10px] font-bold tracking-wider text-[#8C7665] uppercase"
            >
              <th class="px-5 py-3.5">{dict.warehouse}</th>
              <th class="px-5 py-3.5">{dict.skuLabel}</th>
              <th class="px-5 py-3.5">{dict.nameLabel}</th>
              <th class="px-5 py-3.5 text-right">{dict.minThreshold}</th>
              <th class="px-5 py-3.5 text-right">{dict.currentStock}</th>
              <th class="px-5 py-3.5 text-center">{dict.health}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-[#F5EDE4]">
            {#each data.balances as bal}
              <tr class="transition hover:bg-[#FAF7F2]">
                <td class="px-5 py-3.5">
                  <span class="font-mono text-xs font-bold text-[#5A3825]"
                    >{bal.warehouseCode}</span
                  >
                  <span class="ml-1.5 text-[#6A574A]">{bal.warehouseName}</span>
                </td>
                <td class="px-5 py-3.5 font-mono text-xs text-[#6A574A]">
                  {bal.productSku}
                </td>
                <td class="px-5 py-3.5 font-semibold text-[#2E1F16]">
                  {bal.productName}
                </td>
                <td
                  class="px-5 py-3.5 text-right font-mono text-[#8C7665] tabular-nums"
                >
                  {bal.minStock}
                  {bal.productUnit}
                </td>
                <td
                  class="px-5 py-3.5 text-right font-mono text-xs font-bold text-[#2E1F16] tabular-nums"
                >
                  {bal.quantity}
                  {bal.productUnit}
                </td>
                <td class="px-5 py-3.5 text-center">
                  <span
                    class="ui-badge {bal.isLowStock
                      ? 'border-[#FFCDD2] bg-[#FFEBEE] text-[#C62828]'
                      : 'border-[#B2D3C1] bg-[#E7F2EC] text-[#1D593B]'}"
                  >
                    <span
                      class="ui-badge-dot {bal.isLowStock
                        ? 'bg-[#C62828]'
                        : 'bg-[#1D593B]'}"
                    ></span>
                    <span>{bal.isLowStock ? dict.critical : dict.healthy}</span>
                  </span>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {:else}
      <div class="overflow-x-auto">
        <table class="w-full border-collapse text-left text-xs">
          <thead>
            <tr
              class="border-b border-[#EDE4D8] bg-[#FAF7F2] text-[10px] font-bold tracking-wider text-[#8C7665] uppercase"
            >
              <th class="px-5 py-3.5">{dict.product}</th>
              <th class="px-5 py-3.5">{dict.warehouse}</th>
              <th class="px-5 py-3.5">{dict.movementType}</th>
              <th class="px-5 py-3.5 text-right">{dict.delta}</th>
              <th class="px-5 py-3.5 text-right">{dict.balanceAfter}</th>
              <th class="px-5 py-3.5 text-right">{dict.timestamp}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-[#F5EDE4]">
            {#each data.movements as mov}
              <tr class="transition hover:bg-[#FAF7F2]">
                <td class="px-5 py-3.5 font-semibold text-[#2E1F16]">
                  {mov.productName}
                  <span class="ml-1 font-mono text-[10px] text-[#8C7665]"
                    >({mov.productSku})</span
                  >
                </td>
                <td
                  class="px-5 py-3.5 font-mono text-xs font-bold text-[#5A3825]"
                >
                  {mov.warehouseCode}
                </td>
                <td class="px-5 py-3.5 font-mono text-[11px] text-[#6A574A]">
                  {mov.movementType}
                </td>
                <td
                  class="px-5 py-3.5 text-right font-mono font-bold text-[#1D593B] tabular-nums"
                >
                  +{mov.quantityChange}
                  {mov.productUnit}
                </td>
                <td
                  class="px-5 py-3.5 text-right font-mono font-semibold text-[#2E1F16] tabular-nums"
                >
                  {mov.balanceAfter}
                  {mov.productUnit}
                </td>
                <td
                  class="px-5 py-3.5 text-right font-mono text-[11px] text-[#8C7665]"
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
</div>
