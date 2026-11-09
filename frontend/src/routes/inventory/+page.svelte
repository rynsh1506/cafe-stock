<script lang="ts">
  import { getDictionary } from "@/lib/i18n";
  import type { InventoryPageData } from "@/routes/inventory/+page.server";

  let { data }: { data: InventoryPageData } = $props();
  let dict = $derived(getDictionary(data.lang));
</script>

<div class="space-y-6">
  <div class="flex flex-wrap items-center justify-between gap-4">
    <h1 class="text-xl font-bold text-stone-900">{dict.inventoryTitle}</h1>

    <form method="GET" action="/inventory" class="flex flex-wrap gap-2">
      <select
        name="warehouseId"
        class="rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-xs"
      >
        <option value="">All Warehouses</option>
        {#each data.warehouses as wh}
          <option value={wh.id} selected={data.warehouseFilter === wh.id}>
            {wh.code} — {wh.name}
          </option>
        {/each}
      </select>

      <label
        class="flex items-center gap-1.5 text-xs font-medium text-stone-700"
      >
        <input
          type="checkbox"
          name="lowStock"
          value="true"
          checked={data.lowStockOnly}
        />
        Low Stock Only
      </label>

      <button
        type="submit"
        class="rounded-lg bg-stone-800 px-3 py-1.5 text-xs font-semibold text-white"
      >
        Apply Filter
      </button>
    </form>
  </div>

  <section class="rounded-xl border border-stone-200 bg-white p-5 shadow-xs">
    <h2 class="mb-3 text-sm font-bold text-stone-900">
      Warehouse Stock Balances
    </h2>
    <div class="overflow-x-auto">
      <table class="w-full text-left text-xs">
        <thead>
          <tr class="border-b border-stone-200 text-stone-500">
            <th class="pb-2.5 font-semibold">Warehouse</th>
            <th class="pb-2.5 font-semibold">SKU</th>
            <th class="pb-2.5 font-semibold">Product</th>
            <th class="pb-2.5 text-right font-semibold">Min Stock</th>
            <th class="pb-2.5 text-right font-semibold">Current Stock</th>
            <th class="pb-2.5 text-center font-semibold">Health</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-stone-100">
          {#each data.balances as bal}
            <tr>
              <td class="py-2.5 text-stone-700">
                <span class="font-mono font-bold">{bal.warehouseCode}</span> —
                {bal.warehouseName}
              </td>
              <td class="py-2.5 font-mono font-semibold text-stone-800"
                >{bal.productSku}</td
              >
              <td class="py-2.5 font-medium text-stone-900"
                >{bal.productName}</td
              >
              <td class="py-2.5 text-right text-stone-500"
                >{bal.minStock} {bal.productUnit}</td
              >
              <td class="py-2.5 text-right font-bold text-stone-900"
                >{bal.quantity} {bal.productUnit}</td
              >
              <td class="py-2.5 text-center">
                <span
                  class="rounded-full px-2 py-0.5 text-[10px] font-bold {bal.isLowStock
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-emerald-100 text-emerald-800'}"
                >
                  {bal.isLowStock ? "LOW STOCK" : "HEALTHY"}
                </span>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </section>

  <section class="rounded-xl border border-stone-200 bg-white p-5 shadow-xs">
    <h2 class="mb-3 text-sm font-bold text-stone-900">
      Append-Only Stock Movements (PURCHASE_RECEIPT)
    </h2>
    <div class="overflow-x-auto">
      <table class="w-full text-left text-xs">
        <thead>
          <tr class="border-b border-stone-200 text-stone-500">
            <th class="pb-2.5 font-semibold">Timestamp</th>
            <th class="pb-2.5 font-semibold">Warehouse</th>
            <th class="pb-2.5 font-semibold">Product</th>
            <th class="pb-2.5 font-semibold">Movement Type</th>
            <th class="pb-2.5 text-right font-semibold">Change</th>
            <th class="pb-2.5 text-right font-semibold">Balance After</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-stone-100">
          {#each data.movements as mov}
            <tr>
              <td class="py-2.5 text-stone-500"
                >{new Date(mov.createdAt).toLocaleString()}</td
              >
              <td class="py-2.5 text-stone-700">{mov.warehouseCode}</td>
              <td class="py-2.5 font-medium text-stone-900"
                >{mov.productName} ({mov.productSku})</td
              >
              <td class="py-2.5 font-mono text-[11px] text-stone-600"
                >{mov.movementType}</td
              >
              <td class="py-2.5 text-right font-bold text-emerald-700"
                >+{mov.quantityChange} {mov.productUnit}</td
              >
              <td class="py-2.5 text-right font-bold text-stone-900"
                >{mov.balanceAfter} {mov.productUnit}</td
              >
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </section>
</div>
