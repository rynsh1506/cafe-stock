<script lang="ts">
  import { getDictionary } from "@/lib/i18n";
  import type {
    GoodsReceiptsActionData,
    GoodsReceiptsPageData,
  } from "@/routes/goods-receipts/+page.server";

  let {
    data,
    form,
  }: {
    data: GoodsReceiptsPageData;
    form: GoodsReceiptsActionData | null;
  } = $props();
  let dict = $derived(getDictionary(data.lang));
  let activePoId = $state("");

  $effect(() => {
    activePoId = data.selectedPoId;
  });

  let selectedOrder = $derived(
    data.receivableOrders.find((po) => po.id === activePoId) ??
      data.receivableOrders[0] ??
      null,
  );
</script>

<div class="space-y-8">
  <div>
    <div class="text-[12px] font-medium text-[#86868B]">
      Stage 03 · Atomic Transaction &rarr; Inventory Balance + Append-Only
      Movement
    </div>
    <h1
      class="mt-1 text-2xl font-semibold tracking-tight text-[#1D1D1F] sm:text-[28px]"
    >
      {dict.grTitle}
    </h1>
  </div>

  {#if form?.error}
    <div
      class="apple-card flex items-center gap-2.5 px-4 py-3 text-[13px] font-medium text-[#1D1D1F]"
    >
      <span class="h-2 w-2 shrink-0 rounded-full bg-[#D70015]"></span>
      <span>{form.error}</span>
    </div>
  {/if}
  {#if form?.success}
    <div
      class="apple-card flex items-center gap-2.5 px-4 py-3 text-[13px] font-medium text-[#1D1D1F]"
    >
      <span class="h-2 w-2 shrink-0 rounded-full bg-[#1D1D1F]"></span>
      <span>{form.success}</span>
    </div>
  {/if}

  <!-- Post Receipt Form Card -->
  <section class="apple-card p-5 sm:p-6">
    <div class="mb-4 flex items-center justify-between">
      <div>
        <h2 class="text-[15px] font-semibold tracking-tight text-[#1D1D1F]">
          Record Goods Receipt
        </h2>
        <p class="text-[12px] text-[#86868B]">
          Verify incoming quantities against ORDERED or PARTIALLY_RECEIVED
          Purchase Orders
        </p>
      </div>
      <span class="font-mono text-[11px] text-[#86868B]">ATOMIC TX</span>
    </div>

    {#if data.receivableOrders.length === 0}
      <div
        class="rounded-xl bg-[#F5F5F7] px-4 py-6 text-center text-[13px] text-[#86868B]"
      >
        No Purchase Orders are currently in ORDERED or PARTIALLY_RECEIVED
        status. Mark a Purchase Order as ORDERED first.
      </div>
    {:else}
      <form
        method="POST"
        action="?/postReceipt"
        class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5"
      >
        <select
          name="purchaseOrderId"
          bind:value={activePoId}
          required
          class="apple-input px-3.5 py-2.5 text-[13px]"
        >
          {#each data.receivableOrders as po}
            <option value={po.id}
              >{po.orderNumber} — {po.supplierName} ({po.status})</option
            >
          {/each}
        </select>

        <select
          name="purchaseOrderItemId"
          required
          class="apple-input px-3.5 py-2.5 text-[13px]"
        >
          {#if selectedOrder}
            {#each selectedOrder.items.filter((i) => i.remainingQuantity > 0) as item}
              <option value={item.id}
                >{item.productName} (Rem: {item.remainingQuantity}
                {item.productUnit})</option
              >
            {/each}
          {/if}
        </select>

        <input
          type="number"
          name="quantityReceived"
          min="1"
          value="5"
          required
          placeholder="Qty Received"
          class="apple-input px-3.5 py-2.5 text-[13px] tabular-nums"
        />

        <input
          type="text"
          name="notes"
          placeholder="Delivery note / batch ref..."
          class="apple-input px-3.5 py-2.5 text-[13px]"
        />

        <button
          type="submit"
          class="apple-btn-primary cursor-pointer px-4 py-2.5 text-[13px]"
        >
          Post Receipt
        </button>
      </form>
    {/if}
  </section>

  <!-- History Section -->
  <section class="apple-card overflow-hidden">
    <div
      class="flex items-center justify-between border-b border-black/[0.06] px-5 py-4 sm:px-6"
    >
      <h2 class="text-[15px] font-semibold tracking-tight text-[#1D1D1F]">
        Posted Goods Receipts
      </h2>
      <span class="font-mono text-[11px] text-[#86868B]">
        {data.goodsReceipts.length} records
      </span>
    </div>

    <!-- Desktop Table -->
    <div class="hidden overflow-x-auto md:block">
      <table class="w-full text-left text-[13px]">
        <thead>
          <tr
            class="border-b border-black/[0.06] bg-[#FBFBFD] text-[11px] font-medium tracking-wider text-[#86868B] uppercase"
          >
            <th class="px-6 py-3.5">GR Number</th>
            <th class="px-6 py-3.5">PO Reference</th>
            <th class="px-6 py-3.5">Warehouse</th>
            <th class="px-6 py-3.5">Received By</th>
            <th class="px-6 py-3.5">Items Posted</th>
            <th class="px-6 py-3.5 text-right">Timestamp</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-black/[0.05]">
          {#each data.goodsReceipts as gr}
            <tr class="transition hover:bg-[#F5F5F7]/60">
              <td
                class="px-6 py-4 font-mono text-[13px] font-semibold text-[#1D1D1F]"
              >
                {gr.receiptNumber}
              </td>
              <td class="px-6 py-4 font-mono text-[12px] text-[#6E6E73]">
                {gr.purchaseOrderNumber}
              </td>
              <td class="px-6 py-4 text-[#424245]">{gr.warehouseName}</td>
              <td class="px-6 py-4 text-[#6E6E73]">{gr.receiverName}</td>
              <td class="px-6 py-4">
                {#each gr.items as item}
                  <div class="text-[13px] text-[#1D1D1F] tabular-nums">
                    <span class="font-medium">{item.productName}</span>
                    <span
                      class="ml-1.5 font-mono text-[12px] font-semibold text-[#1D1D1F]"
                    >
                      +{item.quantityReceived}
                      {item.productUnit}
                    </span>
                  </div>
                {/each}
              </td>
              <td
                class="px-6 py-4 text-right font-mono text-[12px] text-[#86868B]"
              >
                {new Date(gr.receivedAt).toLocaleString()}
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>

    <!-- Mobile Responsive Stack -->
    <div class="divide-y divide-black/[0.06] md:hidden">
      {#each data.goodsReceipts as gr}
        <div class="space-y-2.5 p-5">
          <div class="flex items-start justify-between gap-2">
            <div>
              <div class="font-mono text-[14px] font-semibold text-[#1D1D1F]">
                {gr.receiptNumber}
              </div>
              <div class="font-mono text-[11px] text-[#86868B]">
                PO: {gr.purchaseOrderNumber} · {gr.warehouseName}
              </div>
            </div>
            <span class="font-mono text-[11px] text-[#86868B]">
              {new Date(gr.receivedAt).toLocaleDateString()}
            </span>
          </div>

          <div class="rounded-xl bg-[#F5F5F7] p-3 text-[12px]">
            {#each gr.items as item}
              <div class="flex items-center justify-between py-0.5">
                <span class="font-medium text-[#1D1D1F]"
                  >{item.productName}</span
                >
                <span class="font-mono font-semibold text-[#1D1D1F]">
                  +{item.quantityReceived}
                  {item.productUnit}
                </span>
              </div>
            {/each}
          </div>
        </div>
      {/each}
    </div>
  </section>
</div>
