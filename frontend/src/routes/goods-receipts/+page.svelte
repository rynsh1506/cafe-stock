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
  let showNewDrawer = $state(false);

  $effect(() => {
    activePoId = data.selectedPoId;
    if (data.selectedPoId) {
      showNewDrawer = true;
    }
  });

  let selectedOrder = $derived(
    data.receivableOrders.find((po) => po.id === activePoId) ??
      data.receivableOrders[0] ??
      null,
  );
</script>

<div>
  <!-- Toolbar -->
  <div
    class="flex flex-wrap items-center justify-between gap-3 border-b border-[#EDEDED] px-5 py-3 sm:px-6"
  >
    <div class="flex items-center gap-2.5">
      <h1 class="text-[15px] font-semibold tracking-tight text-[#111]">
        {dict.navGoodsReceipts}
      </h1>
      <span class="font-mono text-[11px] text-[#777]">
        {data.goodsReceipts.length} records
      </span>
    </div>

    <button
      type="button"
      onclick={() => (showNewDrawer = !showNewDrawer)}
      class="ui-btn cursor-pointer"
    >
      {showNewDrawer ? "Close" : "+ Record Receipt"}
    </button>
  </div>

  {#if form?.error}
    <div
      class="flex items-center gap-2 border-b border-[#EDEDED] bg-[#FFF5F5] px-5 py-2.5 text-[12px] font-medium text-[#D93025] sm:px-6"
    >
      <span class="h-1.5 w-1.5 rounded-full bg-[#D93025]"></span>
      <span>{form.error}</span>
    </div>
  {/if}
  {#if form?.success}
    <div
      class="flex items-center gap-2 border-b border-[#EDEDED] bg-[#FAFAFA] px-5 py-2.5 text-[12px] font-medium text-[#111] sm:px-6"
    >
      <span class="h-1.5 w-1.5 rounded-full bg-[#111]"></span>
      <span>{form.success}</span>
    </div>
  {/if}

  <!-- Collapsible Receipt Bar -->
  {#if showNewDrawer}
    <div class="border-b border-[#EDEDED] bg-[#FAFAFA] px-5 py-4 sm:px-6">
      {#if data.receivableOrders.length === 0}
        <div class="text-[12px] text-[#666]">
          No Purchase Orders are currently in ORDERED or PARTIALLY_RECEIVED
          status. Mark a Purchase Order as ORDERED first.
        </div>
      {:else}
        <form
          method="POST"
          action="?/postReceipt"
          class="grid grid-cols-1 items-end gap-3 sm:grid-cols-2 lg:grid-cols-5"
        >
          <div>
            <label
              for="gr-po"
              class="mb-1 block text-[11px] font-medium text-[#666]"
              >Purchase Order</label
            >
            <select
              id="gr-po"
              name="purchaseOrderId"
              bind:value={activePoId}
              required
              class="ui-select"
            >
              {#each data.receivableOrders as po}
                <option value={po.id}
                  >{po.orderNumber} — {po.supplierName}</option
                >
              {/each}
            </select>
          </div>

          <div>
            <label
              for="gr-item"
              class="mb-1 block text-[11px] font-medium text-[#666]"
              >Line Item</label
            >
            <select
              id="gr-item"
              name="purchaseOrderItemId"
              required
              class="ui-select"
            >
              {#if selectedOrder}
                {#each selectedOrder.items.filter((i) => i.remainingQuantity > 0) as item}
                  <option value={item.id}
                    >{item.productName} ({item.remainingQuantity}
                    {item.productUnit} left)</option
                  >
                {/each}
              {/if}
            </select>
          </div>

          <div>
            <label
              for="gr-qty"
              class="mb-1 block text-[11px] font-medium text-[#666]"
              >Qty Received</label
            >
            <input
              id="gr-qty"
              type="number"
              name="quantityReceived"
              min="1"
              value="5"
              required
              class="ui-input tabular-nums"
            />
          </div>

          <div>
            <label
              for="gr-notes"
              class="mb-1 block text-[11px] font-medium text-[#666]"
              >Delivery Note</label
            >
            <input
              id="gr-notes"
              type="text"
              name="notes"
              placeholder="Batch or delivery ref..."
              class="ui-input"
            />
          </div>

          <button type="submit" class="ui-btn w-full cursor-pointer">
            Post Receipt
          </button>
        </form>
      {/if}
    </div>
  {/if}

  <!-- Desktop Table -->
  <div class="hidden overflow-x-auto md:block">
    <table class="w-full text-left text-[13px]">
      <thead>
        <tr
          class="border-b border-[#EDEDED] bg-[#FAFAFA] text-[11px] font-medium text-[#777]"
        >
          <th class="px-5 py-2.5 sm:px-6">Receipt</th>
          <th class="px-5 py-2.5 sm:px-6">PO Ref</th>
          <th class="px-5 py-2.5 sm:px-6">Warehouse</th>
          <th class="px-5 py-2.5 sm:px-6">Received By</th>
          <th class="px-5 py-2.5 sm:px-6">Items Posted</th>
          <th class="px-5 py-2.5 text-right sm:px-6">Date</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-[#F2F2F2]">
        {#each data.goodsReceipts as gr}
          <tr class="hover:bg-[#FAFAFA]">
            <td
              class="px-5 py-3 font-mono text-[12px] font-semibold text-[#111] sm:px-6"
            >
              {gr.receiptNumber}
            </td>
            <td class="px-5 py-3 font-mono text-[12px] text-[#555] sm:px-6">
              {gr.purchaseOrderNumber}
            </td>
            <td class="px-5 py-3 text-[#333] sm:px-6">{gr.warehouseName}</td>
            <td class="px-5 py-3 text-[#555] sm:px-6">{gr.receiverName}</td>
            <td class="px-5 py-3 sm:px-6">
              {#each gr.items as item}
                <div class="text-[13px] text-[#111] tabular-nums">
                  <span>{item.productName}</span>
                  <span
                    class="ml-1.5 font-mono text-[12px] font-medium text-[#111]"
                  >
                    +{item.quantityReceived}
                    {item.productUnit}
                  </span>
                </div>
              {/each}
            </td>
            <td
              class="px-5 py-3 text-right font-mono text-[11px] text-[#777] sm:px-6"
            >
              {new Date(gr.receivedAt).toLocaleString()}
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>

  <!-- Mobile List -->
  <div class="divide-y divide-[#EDEDED] md:hidden">
    {#each data.goodsReceipts as gr}
      <div class="space-y-2 px-5 py-3.5">
        <div class="flex items-start justify-between gap-2">
          <div>
            <div class="font-mono text-[13px] font-semibold text-[#111]">
              {gr.receiptNumber}
            </div>
            <div class="font-mono text-[11px] text-[#777]">
              PO: {gr.purchaseOrderNumber} · {gr.warehouseName}
            </div>
          </div>
          <span class="font-mono text-[11px] text-[#777]">
            {new Date(gr.receivedAt).toLocaleDateString()}
          </span>
        </div>

        <div class="text-[12px] text-[#111]">
          {#each gr.items as item}
            <div class="flex items-center justify-between py-0.5">
              <span>{item.productName}</span>
              <span class="font-mono font-medium text-[#111]">
                +{item.quantityReceived}
                {item.productUnit}
              </span>
            </div>
          {/each}
        </div>
      </div>
    {/each}
  </div>
</div>
