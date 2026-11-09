<script lang="ts">
  import { getDictionary } from "@/lib/i18n";
  import type {
    PurchaseOrdersActionData,
    PurchaseOrdersPageData,
  } from "@/routes/purchase-orders/+page.server";

  let {
    data,
    form,
  }: {
    data: PurchaseOrdersPageData;
    form: PurchaseOrdersActionData | null;
  } = $props();
  let dict = $derived(getDictionary(data.lang));
</script>

<div class="space-y-6">
  <div class="flex flex-wrap items-center justify-between gap-4">
    <h1 class="text-xl font-bold text-stone-900">{dict.poTitle}</h1>

    <div class="flex flex-wrap gap-1.5">
      {#each ["", "DRAFT", "ORDERED", "PARTIALLY_RECEIVED", "RECEIVED", "CANCELLED"] as status}
        <a
          href={status
            ? `/purchase-orders?status=${status}`
            : "/purchase-orders"}
          class="rounded-lg px-3 py-1.5 text-xs font-semibold {data.statusFilter ===
          status
            ? 'bg-amber-800 text-white'
            : 'border border-stone-300 bg-white text-stone-700 hover:bg-stone-100'}"
        >
          {status || "ALL"}
        </a>
      {/each}
    </div>
  </div>

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

  <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
    <section class="rounded-xl border border-stone-200 bg-white p-5 shadow-xs">
      <h2 class="mb-3 text-sm font-bold text-stone-900">
        Create PO from Approved Purchase Request
      </h2>
      <form
        method="POST"
        action="?/createFromPr"
        class="grid grid-cols-1 gap-2.5 sm:grid-cols-4"
      >
        <select
          name="purchaseRequestId"
          required
          class="rounded-lg border border-stone-300 bg-white px-2.5 py-2 text-xs"
        >
          <option value="">Approved PR...</option>
          {#each data.approvedPrs as pr}
            <option value={pr.id}
              >{pr.requestNumber} ({pr.warehouseName})</option
            >
          {/each}
        </select>

        <select
          name="supplierId"
          required
          class="rounded-lg border border-stone-300 bg-white px-2.5 py-2 text-xs"
        >
          <option value="">Select Supplier...</option>
          {#each data.suppliers as sup}
            <option value={sup.id}>{sup.code} — {sup.name}</option>
          {/each}
        </select>

        <input
          type="date"
          name="expectedDate"
          class="rounded-lg border border-stone-300 bg-white px-2.5 py-2 text-xs"
        />

        <button
          type="submit"
          class="rounded-lg bg-amber-800 px-3 py-2 text-xs font-semibold text-white hover:bg-amber-900"
        >
          Create from PR
        </button>
      </form>
    </section>

    <section class="rounded-xl border border-stone-200 bg-white p-5 shadow-xs">
      <h2 class="mb-3 text-sm font-bold text-stone-900">
        Create Standalone Purchase Order
      </h2>
      <form
        method="POST"
        action="?/createStandalone"
        class="grid grid-cols-1 gap-2.5 sm:grid-cols-5"
      >
        <select
          name="supplierId"
          required
          class="rounded-lg border border-stone-300 bg-white px-2.5 py-2 text-xs"
        >
          <option value="">Supplier...</option>
          {#each data.suppliers as sup}
            <option value={sup.id}>{sup.name}</option>
          {/each}
        </select>

        <select
          name="warehouseId"
          required
          class="rounded-lg border border-stone-300 bg-white px-2.5 py-2 text-xs"
        >
          <option value="">Warehouse...</option>
          {#each data.warehouses as wh}
            <option value={wh.id}>{wh.name}</option>
          {/each}
        </select>

        <select
          name="productId"
          required
          class="rounded-lg border border-stone-300 bg-white px-2.5 py-2 text-xs"
        >
          <option value="">Product...</option>
          {#each data.products as prod}
            <option value={prod.id}>{prod.name}</option>
          {/each}
        </select>

        <input
          type="number"
          name="orderedQuantity"
          min="1"
          value="10"
          required
          class="rounded-lg border border-stone-300 bg-white px-2.5 py-2 text-xs"
        />

        <button
          type="submit"
          class="rounded-lg bg-stone-800 px-3 py-2 text-xs font-semibold text-white hover:bg-stone-900"
        >
          + Create PO
        </button>
      </form>
    </section>
  </div>

  <section class="rounded-xl border border-stone-200 bg-white p-5 shadow-xs">
    <div class="overflow-x-auto">
      <table class="w-full text-left text-xs">
        <thead>
          <tr class="border-b border-stone-200 text-stone-500">
            <th class="pb-2.5 font-semibold">PO Number</th>
            <th class="pb-2.5 font-semibold">Supplier & Warehouse</th>
            <th class="pb-2.5 font-semibold">Items (Received / Ordered)</th>
            <th class="pb-2.5 text-center font-semibold">Status</th>
            <th class="pb-2.5 text-right font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-stone-100">
          {#each data.purchaseOrders as po}
            <tr>
              <td class="py-3 font-mono font-bold text-stone-900">
                {po.orderNumber}
                {#if po.purchaseRequestNumber}
                  <span class="block text-[11px] font-normal text-stone-500"
                    >Ref: {po.purchaseRequestNumber}</span
                  >
                {/if}
              </td>
              <td class="py-3 text-stone-700">
                <div class="font-semibold text-stone-900">
                  {po.supplierName}
                </div>
                <div class="text-[11px] text-stone-500">{po.warehouseName}</div>
              </td>
              <td class="py-3 text-stone-700">
                {#each po.items as item}
                  <div>
                    <span class="font-medium">{item.productName}</span>:
                    <span class="font-bold"
                      >{item.receivedQuantity} / {item.orderedQuantity}</span
                    >
                    {item.productUnit}
                  </div>
                {/each}
              </td>
              <td class="py-3 text-center">
                <span
                  class="rounded-full px-2.5 py-0.5 text-[10px] font-bold {po.status ===
                  'RECEIVED'
                    ? 'bg-emerald-100 text-emerald-800'
                    : po.status === 'PARTIALLY_RECEIVED'
                      ? 'bg-amber-100 text-amber-800'
                      : po.status === 'ORDERED'
                        ? 'bg-sky-100 text-sky-800'
                        : po.status === 'CANCELLED'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-stone-200 text-stone-700'}"
                >
                  {po.status}
                </span>
              </td>
              <td class="py-3 text-right">
                <div class="flex justify-end gap-1.5">
                  {#if po.status === "DRAFT"}
                    <form method="POST" action="?/markOrdered">
                      <input type="hidden" name="id" value={po.id} />
                      <button
                        type="submit"
                        class="rounded bg-sky-700 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-sky-800"
                      >
                        Mark ORDERED
                      </button>
                    </form>
                  {/if}
                  {#if po.status === "ORDERED" || po.status === "PARTIALLY_RECEIVED"}
                    <a
                      href="/goods-receipts?poId={po.id}"
                      class="rounded bg-emerald-700 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-emerald-800"
                    >
                      Receive Goods
                    </a>
                  {/if}
                  {#if po.status === "DRAFT" || po.status === "ORDERED"}
                    <form method="POST" action="?/cancel">
                      <input type="hidden" name="id" value={po.id} />
                      <button
                        type="submit"
                        class="rounded border border-red-300 px-2.5 py-1 text-[11px] font-semibold text-red-700 hover:bg-red-50"
                      >
                        Cancel
                      </button>
                    </form>
                  {/if}
                </div>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </section>
</div>
