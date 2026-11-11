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
  let totalStockUnits = $derived(
    data.balances.reduce((acc, b) => acc + Number(b.quantity), 0),
  );
  let lowStockCount = $derived(
    data.balances.filter((b) => Number(b.quantity) <= Number(b.minStock))
      .length,
  );
</script>

<div class="space-y-6">
  <!-- Header Title -->
  <div class="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
    <div>
      <h1 class="font-serif text-2xl font-bold tracking-tight text-[#231712]">
        {dict.navInventory}
      </h1>
      <p class="mt-0.5 text-xs text-[#7D6B5D]">
        {dict.inventorySubtitle}
      </p>
    </div>
  </div>

  <!-- KPI Metrics Grid -->
  <div class="grid grid-cols-2 gap-3.5 sm:grid-cols-4">
    <div
      class="ui-card flex items-center gap-3.5 p-4 transition hover:border-[#C68B59] hover:shadow-md"
    >
      <div
        class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#FAF2EA] text-[#7A4D33]"
      >
        <svg
          class="h-5 w-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path
            d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"
          />
          <path d="m3.3 7 8.7 5 8.7-5" />
          <path d="M12 22V12" />
        </svg>
      </div>
      <div>
        <div
          class="text-[10px] font-bold tracking-wider text-[#8C7665] uppercase"
        >
          Item Terdaftar
        </div>
        <div class="font-mono text-xl font-extrabold text-[#231712]">
          {data.balances.length}
          <span class="text-xs font-normal text-[#8C7665]">SKU</span>
        </div>
      </div>
    </div>

    <div
      class="ui-card flex items-center gap-3.5 p-4 transition hover:border-[#C68B59] hover:shadow-md"
    >
      <div
        class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#FAF2EA] text-[#7A4D33]"
      >
        <svg
          class="h-5 w-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
        </svg>
      </div>
      <div>
        <div
          class="text-[10px] font-bold tracking-wider text-[#8C7665] uppercase"
        >
          Total Stok Fisik
        </div>
        <div class="font-mono text-xl font-extrabold text-[#231712]">
          {totalStockUnits.toLocaleString("id-ID")}
          <span class="text-xs font-normal text-[#8C7665]">Unit</span>
        </div>
      </div>
    </div>

    <div
      class="ui-card flex items-center gap-3.5 p-4 transition hover:border-[#C68B59] hover:shadow-md {lowStockCount >
      0
        ? 'border-amber-300 bg-amber-50/40'
        : ''}"
    >
      <div
        class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl {lowStockCount >
        0
          ? 'bg-amber-100 text-amber-800'
          : 'bg-[#FAF2EA] text-[#7A4D33]'}"
      >
        <svg
          class="h-5 w-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path
            d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
          />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      </div>
      <div>
        <div
          class="text-[10px] font-bold tracking-wider text-[#8C7665] uppercase"
        >
          Stok Menipis
        </div>
        <div
          class="font-mono text-xl font-extrabold {lowStockCount > 0
            ? 'text-amber-900'
            : 'text-[#231712]'}"
        >
          {lowStockCount}
          <span class="text-xs font-normal text-[#8C7665]">Perlu Order</span>
        </div>
      </div>
    </div>

    <div
      class="ui-card flex items-center gap-3.5 p-4 transition hover:border-[#C68B59] hover:shadow-md"
    >
      <div
        class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#FAF2EA] text-[#7A4D33]"
      >
        <svg
          class="h-5 w-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      </div>
      <div>
        <div
          class="text-[10px] font-bold tracking-wider text-[#8C7665] uppercase"
        >
          Fasilitas Gudang
        </div>
        <div class="font-mono text-xl font-extrabold text-[#231712]">
          {data.warehouses.length}
          <span class="text-xs font-normal text-[#8C7665]">Lokasi</span>
        </div>
      </div>
    </div>
  </div>

  <!-- Tab Bar & Filter Toolbar -->
  <div
    class="flex flex-col justify-between gap-3 border-y border-[#EDE4D8] py-3 sm:flex-row sm:items-center"
  >
    <div class="w-full sm:w-auto overflow-x-auto no-scrollbar py-0.5">
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
    </div>

    <form
      method="GET"
      action="/inventory"
      class="flex flex-col sm:flex-row sm:items-center gap-2.5 w-full sm:w-auto"
    >
      <div class="w-full sm:w-56">
        <CustomSelect
          name="warehouseId"
          bind:value={selectedWarehouse}
          options={warehouseOptions}
          placeholder={dict.allWarehouses}
        />
      </div>

      <div class="flex items-center gap-2">
        <label
          class="ui-btn-outline flex flex-1 sm:flex-initial cursor-pointer items-center justify-center gap-1.5 text-xs"
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

        <button type="submit" class="ui-btn cursor-pointer px-4"
          >{dict.filter}</button
        >
      </div>
    </form>
  </div>

  <!-- Table Card -->
  <div class="ui-card overflow-hidden">
    {#if activeView === "balances"}
      <div
        class="flex items-center justify-between border-b border-[#EDE4D8] bg-[#FAF7F2] px-4 py-2 text-[11px] font-medium text-[#8C7665] sm:hidden"
      >
        <span>← Geser tabel untuk stok & status kesehatan →</span>
        <span
          class="rounded bg-[#EFE7DE] px-1.5 py-0.5 font-mono text-[10px] text-[#5A3825]"
          >6 Kolom</span
        >
      </div>
      <div class="overflow-x-auto">
        <table class="w-full min-w-[700px] border-collapse text-left text-xs">
          <thead>
            <tr
              class="border-b border-[#EDE4D8] bg-[#FAF7F2] text-[10px] font-bold tracking-wider text-[#8C7665] uppercase whitespace-nowrap"
            >
              <th class="px-5 py-3.5">{dict.warehouse}</th>
              <th class="px-5 py-3.5">{dict.skuLabel}</th>
              <th class="px-5 py-3.5">{dict.nameLabel}</th>
              <th class="px-5 py-3.5 text-right">{dict.minThreshold}</th>
              <th class="px-5 py-3.5 text-right">{dict.currentStock}</th>
              <th class="px-5 py-3.5 text-center">{dict.health}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-[#F5EDE4] whitespace-nowrap">
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
      <div
        class="flex items-center justify-between border-b border-[#EDE4D8] bg-[#FAF7F2] px-4 py-2 text-[11px] font-medium text-[#8C7665] sm:hidden"
      >
        <span>← Geser tabel untuk riwayat mutasi stok →</span>
        <span
          class="rounded bg-[#EFE7DE] px-1.5 py-0.5 font-mono text-[10px] text-[#5A3825]"
          >6 Kolom</span
        >
      </div>
      <div class="overflow-x-auto">
        <table class="w-full min-w-[700px] border-collapse text-left text-xs">
          <thead>
            <tr
              class="border-b border-[#EDE4D8] bg-[#FAF7F2] text-[10px] font-bold tracking-wider text-[#8C7665] uppercase whitespace-nowrap"
            >
              <th class="px-5 py-3.5">{dict.product}</th>
              <th class="px-5 py-3.5">{dict.warehouse}</th>
              <th class="px-5 py-3.5">{dict.movementType}</th>
              <th class="px-5 py-3.5 text-right">{dict.delta}</th>
              <th class="px-5 py-3.5 text-right">{dict.balanceAfter}</th>
              <th class="px-5 py-3.5 text-right">{dict.timestamp}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-[#F5EDE4] whitespace-nowrap">
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
