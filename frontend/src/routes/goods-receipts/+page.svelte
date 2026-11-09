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

<div class="space-y-6">
  <h1 class="text-xl font-bold text-stone-900">{dict.grTitle}</h1>

  {#if form?.error}
    <div
      class="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold text-red-700"
    >
      {form.error}
    </div>
  {/if}
  {#if form?.success}
    <div
      class="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-semibold text-emerald-800"
    >
      {form.success}
    </div>
  {/if}

  <section class="rounded-xl border border-stone-200 bg-white p-5 shadow-xs">
    <h2 class="mb-3 text-sm font-bold text-stone-900">
      Post Atomic Goods Receipt (ORDERED / PARTIALLY_RECEIVED POs)
    </h2>

    {#if data.receivableOrders.length === 0}
      <p class="text-xs text-stone-500">
        No Purchase Orders currently in ORDERED or PARTIALLY_RECEIVED status.
        Mark a Purchase Order as ORDERED first.
      </p>
    {:else}
      <form
        method="POST"
        action="?/postReceipt"
        class="grid grid-cols-1 gap-3 sm:grid-cols-5"
      >
        <select
          name="purchaseOrderId"
          bind:value={activePoId}
          required
          class="rounded-lg border border-stone-300 bg-white px-3 py-2 text-xs"
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
          class="rounded-lg border border-stone-300 bg-white px-3 py-2 text-xs"
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
          class="rounded-lg border border-stone-300 bg-white px-3 py-2 text-xs"
        />

        <input
          type="text"
          name="notes"
          placeholder="Delivery note / batch ref..."
          class="rounded-lg border border-stone-300 bg-white px-3 py-2 text-xs"
        />

        <button
          type="submit"
          class="rounded-lg bg-emerald-700 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-800"
        >
          Post Goods Receipt
        </button>
      </form>
    {/if}
  </section>

  <section class="rounded-xl border border-stone-200 bg-white p-5 shadow-xs">
    <h2 class="mb-3 text-sm font-bold text-stone-900">
      Posted Goods Receipts History
    </h2>
    <div class="overflow-x-auto">
      <table class="w-full text-left text-xs">
        <thead>
          <tr class="border-b border-stone-200 text-stone-500">
            <th class="pb-2.5 font-semibold">GR Number</th>
            <th class="pb-2.5 font-semibold">PO Reference</th>
            <th class="pb-2.5 font-semibold">Warehouse</th>
            <th class="pb-2.5 font-semibold">Received By</th>
            <th class="pb-2.5 font-semibold">Items Received</th>
            <th class="pb-2.5 text-right font-semibold">Received At</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-stone-100">
          {#each data.goodsReceipts as gr}
            <tr>
              <td class="py-3 font-mono font-bold text-stone-900"
                >{gr.receiptNumber}</td
              >
              <td class="py-3 font-mono text-stone-700"
                >{gr.purchaseOrderNumber}</td
              >
              <td class="py-3 text-stone-700">{gr.warehouseName}</td>
              <td class="py-3 text-stone-700">{gr.receiverName}</td>
              <td class="py-3 text-stone-800">
                {#each gr.items as item}
                  <div>
                    <span class="font-semibold">{item.productName}</span>:
                    <span class="font-bold text-emerald-700"
                      >+{item.quantityReceived}
                      {item.productUnit}</span
                    >
                  </div>
                {/each}
              </td>
              <td class="py-3 text-right text-stone-500">
                {new Date(gr.receivedAt).toLocaleString()}
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </section>
</div>
