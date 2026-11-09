<script lang="ts">
  import { getDictionary } from "@/lib/i18n";
  import type { InventoryPageData } from "@/routes/inventory/+page.server";

  let { data }: { data: InventoryPageData } = $props();
  let dict = $derived(getDictionary(data.lang));
</script>

<div class="space-y-8">
  <!-- Header & Filter Bar -->
  <div class="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
    <div>
      <div class="text-[12px] font-medium text-[#86868B]">
        Separated Balance Snapshot & Append-Only Movement Ledger
      </div>
      <h1
        class="mt-1 text-2xl font-semibold tracking-tight text-[#1D1D1F] sm:text-[28px]"
      >
        {dict.inventoryTitle}
      </h1>
    </div>

    <form
      method="GET"
      action="/inventory"
      class="flex flex-wrap items-center gap-2.5"
    >
      <select name="warehouseId" class="apple-input px-3.5 py-2 text-[13px]">
        <option value="">All Warehouses</option>
        {#each data.warehouses as wh}
          <option value={wh.id} selected={data.warehouseFilter === wh.id}>
            {wh.code} — {wh.name}
          </option>
        {/each}
      </select>

      <label
        class="apple-btn-secondary flex cursor-pointer items-center gap-2 px-3.5 py-2 text-[12px]"
      >
        <input
          type="checkbox"
          name="lowStock"
          value="true"
          checked={data.lowStockOnly}
          class="accent-[#1D1D1F]"
        />
        <span>Low Stock Only</span>
      </label>

      <button
        type="submit"
        class="apple-btn-primary cursor-pointer px-4 py-2 text-[13px]"
      >
        Apply
      </button>
    </form>
  </div>

  <!-- Warehouse Stock Balances -->
  <section class="apple-card overflow-hidden">
    <div
      class="flex items-center justify-between border-b border-black/[0.06] px-5 py-4 sm:px-6"
    >
      <div>
        <h2 class="text-[15px] font-semibold tracking-tight text-[#1D1D1F]">
          Warehouse Stock Balances
        </h2>
        <p class="text-[12px] text-[#86868B]">
          Real-time inventory_balances per product and warehouse
        </p>
      </div>
      <span class="font-mono text-[11px] text-[#86868B]">
        {data.balances.length} records
      </span>
    </div>

    <!-- Desktop Table -->
    <div class="hidden overflow-x-auto md:block">
      <table class="w-full text-left text-[13px]">
        <thead>
          <tr
            class="border-b border-black/[0.06] bg-[#FBFBFD] text-[11px] font-medium tracking-wider text-[#86868B] uppercase"
          >
            <th class="px-6 py-3.5">Warehouse</th>
            <th class="px-6 py-3.5">SKU</th>
            <th class="px-6 py-3.5">Product</th>
            <th class="px-6 py-3.5 text-right">Min Threshold</th>
            <th class="px-6 py-3.5 text-right">Current Stock</th>
            <th class="px-6 py-3.5 text-center">Health</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-black/[0.05]">
          {#each data.balances as bal}
            <tr class="transition hover:bg-[#F5F5F7]/60">
              <td class="px-6 py-3.5">
                <span class="font-mono text-[12px] font-medium text-[#1D1D1F]"
                  >{bal.warehouseCode}</span
                >
                <span class="ml-1.5 text-[#6E6E73]">{bal.warehouseName}</span>
              </td>
              <td class="px-6 py-3.5 font-mono text-[12px] text-[#6E6E73]">
                {bal.productSku}
              </td>
              <td class="px-6 py-3.5 font-medium text-[#1D1D1F]">
                {bal.productName}
              </td>
              <td
                class="px-6 py-3.5 text-right font-mono text-[12px] text-[#86868B] tabular-nums"
              >
                {bal.minStock}
                {bal.productUnit}
              </td>
              <td
                class="px-6 py-3.5 text-right font-mono text-[13px] font-semibold text-[#1D1D1F] tabular-nums"
              >
                {bal.quantity}
                {bal.productUnit}
              </td>
              <td class="px-6 py-3.5 text-center">
                <span
                  class="inline-flex items-center gap-1.5 font-mono text-[11px] font-medium text-[#1D1D1F]"
                >
                  <span
                    class="h-1.5 w-1.5 rounded-full {bal.isLowStock
                      ? 'bg-[#D70015]'
                      : 'bg-[#1D1D1F]'}"
                  ></span>
                  <span>{bal.isLowStock ? "LOW STOCK" : "HEALTHY"}</span>
                </span>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>

    <!-- Mobile Responsive Stack -->
    <div class="divide-y divide-black/[0.05] md:hidden">
      {#each data.balances as bal}
        <div class="flex items-center justify-between gap-3 px-5 py-4">
          <div class="min-w-0">
            <div class="flex items-center gap-2">
              <span
                class="h-1.5 w-1.5 rounded-full {bal.isLowStock
                  ? 'bg-[#D70015]'
                  : 'bg-[#1D1D1F]'}"
              ></span>
              <span class="font-mono text-[11px] text-[#86868B]"
                >{bal.warehouseCode} · {bal.productSku}</span
              >
            </div>
            <div class="mt-0.5 truncate text-[14px] font-medium text-[#1D1D1F]">
              {bal.productName}
            </div>
            <div class="mt-0.5 text-[11px] text-[#86868B]">
              Min: {bal.minStock}
              {bal.productUnit}
            </div>
          </div>

          <div class="shrink-0 text-right tabular-nums">
            <div class="font-mono text-[15px] font-semibold text-[#1D1D1F]">
              {bal.quantity}
            </div>
            <div class="text-[11px] text-[#86868B]">{bal.productUnit}</div>
          </div>
        </div>
      {/each}
    </div>
  </section>

  <!-- Append-Only Stock Movements -->
  <section class="apple-card overflow-hidden">
    <div
      class="flex items-center justify-between border-b border-black/[0.06] px-5 py-4 sm:px-6"
    >
      <div>
        <h2 class="text-[15px] font-semibold tracking-tight text-[#1D1D1F]">
          Append-Only Stock Movements
        </h2>
        <p class="text-[12px] text-[#86868B]">
          Immutable inventory_movements ledger entries (PURCHASE_RECEIPT)
        </p>
      </div>
      <span class="font-mono text-[11px] text-[#86868B]">
        {data.movements.length} entries
      </span>
    </div>

    <div class="divide-y divide-black/[0.05]">
      {#each data.movements as mov}
        <div
          class="flex items-center justify-between gap-4 px-5 py-3.5 sm:px-6"
        >
          <div class="min-w-0">
            <div class="truncate text-[13px] font-medium text-[#1D1D1F]">
              {mov.productName}
            </div>
            <div
              class="mt-0.5 flex flex-wrap items-center gap-2 font-mono text-[11px] text-[#86868B]"
            >
              <span>{mov.warehouseCode}</span>
              <span>•</span>
              <span>{mov.productSku}</span>
              <span>•</span>
              <span>{mov.movementType}</span>
              <span>•</span>
              <span>{new Date(mov.createdAt).toLocaleString()}</span>
            </div>
          </div>

          <div class="shrink-0 text-right tabular-nums">
            <div class="font-mono text-[13px] font-semibold text-[#1D1D1F]">
              +{mov.quantityChange}
              {mov.productUnit}
            </div>
            <div class="font-mono text-[11px] text-[#86868B]">
              After: {mov.balanceAfter}
              {mov.productUnit}
            </div>
          </div>
        </div>
      {/each}
    </div>
  </section>
</div>
