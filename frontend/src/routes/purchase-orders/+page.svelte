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

<div class="space-y-8">
  <!-- Header & Apple Segmented Status Filter -->
  <div class="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
    <div>
      <div class="text-[12px] font-medium text-[#86868B]">
        Stage 02 · DRAFT &rarr; ORDERED &rarr; PARTIALLY_RECEIVED &rarr;
        RECEIVED
      </div>
      <h1
        class="mt-1 text-2xl font-semibold tracking-tight text-[#1D1D1F] sm:text-[28px]"
      >
        {dict.poTitle}
      </h1>
    </div>

    <div
      class="apple-segmented inline-flex flex-wrap gap-0.5 self-start sm:self-auto"
    >
      {#each ["", "DRAFT", "ORDERED", "PARTIALLY_RECEIVED", "RECEIVED", "CANCELLED"] as status}
        <a
          href={status
            ? `/purchase-orders?status=${status}`
            : "/purchase-orders"}
          class="px-3 py-1.5 text-[11px] font-medium transition {data.statusFilter ===
          status
            ? 'apple-segmented-item-active font-semibold'
            : 'text-[#6E6E73] hover:text-[#1D1D1F]'}"
        >
          {status || "ALL"}
        </a>
      {/each}
    </div>
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

  <!-- Two Creation Cards -->
  <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
    <section class="apple-card p-5 sm:p-6">
      <div class="mb-4">
        <h2 class="text-[15px] font-semibold tracking-tight text-[#1D1D1F]">
          Convert Approved PR to PO
        </h2>
        <p class="text-[12px] text-[#86868B]">
          1:1 conversion from an APPROVED Purchase Request
        </p>
      </div>
      <form
        method="POST"
        action="?/createFromPr"
        class="grid grid-cols-1 gap-2.5 sm:grid-cols-2"
      >
        <select
          name="purchaseRequestId"
          required
          class="apple-input px-3.5 py-2.5 text-[13px]"
        >
          <option value="">Select Approved PR...</option>
          {#each data.approvedPrs as pr}
            <option value={pr.id}
              >{pr.requestNumber} ({pr.warehouseName})</option
            >
          {/each}
        </select>

        <select
          name="supplierId"
          required
          class="apple-input px-3.5 py-2.5 text-[13px]"
        >
          <option value="">Select Supplier...</option>
          {#each data.suppliers as sup}
            <option value={sup.id}>{sup.code} — {sup.name}</option>
          {/each}
        </select>

        <input
          type="date"
          name="expectedDate"
          class="apple-input px-3.5 py-2.5 text-[13px]"
        />

        <button
          type="submit"
          class="apple-btn-primary cursor-pointer px-4 py-2.5 text-[13px]"
        >
          Create from PR
        </button>
      </form>
    </section>

    <section class="apple-card p-5 sm:p-6">
      <div class="mb-4">
        <h2 class="text-[15px] font-semibold tracking-tight text-[#1D1D1F]">
          Direct Supplier Purchase Order
        </h2>
        <p class="text-[12px] text-[#86868B]">
          Create a standalone PO directly for a supplier and warehouse
        </p>
      </div>
      <form
        method="POST"
        action="?/createStandalone"
        class="grid grid-cols-1 gap-2.5 sm:grid-cols-2"
      >
        <select
          name="supplierId"
          required
          class="apple-input px-3.5 py-2.5 text-[13px]"
        >
          <option value="">Supplier...</option>
          {#each data.suppliers as sup}
            <option value={sup.id}>{sup.name}</option>
          {/each}
        </select>

        <select
          name="warehouseId"
          required
          class="apple-input px-3.5 py-2.5 text-[13px]"
        >
          <option value="">Warehouse...</option>
          {#each data.warehouses as wh}
            <option value={wh.id}>{wh.name}</option>
          {/each}
        </select>

        <select
          name="productId"
          required
          class="apple-input px-3.5 py-2.5 text-[13px]"
        >
          <option value="">Product...</option>
          {#each data.products as prod}
            <option value={prod.id}>{prod.name}</option>
          {/each}
        </select>

        <div class="flex gap-2">
          <input
            type="number"
            name="orderedQuantity"
            min="1"
            value="10"
            required
            class="apple-input w-24 px-3 py-2.5 text-[13px] tabular-nums"
          />
          <button
            type="submit"
            class="apple-btn-primary flex-1 cursor-pointer px-4 py-2.5 text-[13px]"
          >
            + Create PO
          </button>
        </div>
      </form>
    </section>
  </div>

  <!-- PO List Section -->
  <section class="apple-card overflow-hidden">
    <!-- Desktop Table -->
    <div class="hidden overflow-x-auto md:block">
      <table class="w-full text-left text-[13px]">
        <thead>
          <tr
            class="border-b border-black/[0.06] bg-[#FBFBFD] text-[11px] font-medium tracking-wider text-[#86868B] uppercase"
          >
            <th class="px-6 py-3.5">PO Number</th>
            <th class="px-6 py-3.5">Supplier & Destination</th>
            <th class="px-6 py-3.5">Fulfillment (Received / Ordered)</th>
            <th class="px-6 py-3.5 text-center">Status</th>
            <th class="px-6 py-3.5 text-right">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-black/[0.05]">
          {#each data.purchaseOrders as po}
            <tr class="transition hover:bg-[#F5F5F7]/60">
              <td class="px-6 py-4">
                <div class="font-mono text-[13px] font-semibold text-[#1D1D1F]">
                  {po.orderNumber}
                </div>
                {#if po.purchaseRequestNumber}
                  <div class="mt-0.5 font-mono text-[11px] text-[#86868B]">
                    Ref: {po.purchaseRequestNumber}
                  </div>
                {/if}
              </td>
              <td class="px-6 py-4">
                <div class="font-medium text-[#1D1D1F]">{po.supplierName}</div>
                <div class="text-[12px] text-[#86868B]">{po.warehouseName}</div>
              </td>
              <td class="px-6 py-4">
                {#each po.items as item}
                  <div class="text-[13px] text-[#1D1D1F] tabular-nums">
                    <span>{item.productName}</span>
                    <span
                      class="ml-1.5 font-mono text-[12px] font-semibold text-[#1D1D1F]"
                    >
                      {item.receivedQuantity}/{item.orderedQuantity}
                    </span>
                    <span class="text-[11px] text-[#86868B]"
                      >{item.productUnit}</span
                    >
                  </div>
                {/each}
              </td>
              <td class="px-6 py-4 text-center">
                <span
                  class="inline-flex items-center gap-1.5 font-mono text-[11px] font-medium text-[#1D1D1F]"
                >
                  <span
                    class="h-1.5 w-1.5 rounded-full {po.status === 'RECEIVED'
                      ? 'bg-[#1D1D1F]'
                      : po.status === 'CANCELLED'
                        ? 'bg-[#D70015]'
                        : 'bg-[#86868B]'}"
                  ></span>
                  <span>{po.status}</span>
                </span>
              </td>
              <td class="px-6 py-4 text-right">
                <div class="flex justify-end gap-2">
                  {#if po.status === "DRAFT"}
                    <form method="POST" action="?/markOrdered">
                      <input type="hidden" name="id" value={po.id} />
                      <button
                        type="submit"
                        class="apple-btn-primary cursor-pointer px-3 py-1.5 text-[12px]"
                      >
                        Mark Ordered
                      </button>
                    </form>
                  {/if}
                  {#if po.status === "ORDERED" || po.status === "PARTIALLY_RECEIVED"}
                    <a
                      href="/goods-receipts?poId={po.id}"
                      class="apple-btn-primary px-3 py-1.5 text-[12px]"
                    >
                      Receive Goods
                    </a>
                  {/if}
                  {#if po.status === "DRAFT" || po.status === "ORDERED"}
                    <form method="POST" action="?/cancel">
                      <input type="hidden" name="id" value={po.id} />
                      <button
                        type="submit"
                        class="apple-btn-secondary cursor-pointer px-3 py-1.5 text-[12px] text-[#D70015]"
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

    <!-- Mobile Responsive Stack -->
    <div class="divide-y divide-black/[0.06] md:hidden">
      {#each data.purchaseOrders as po}
        <div class="space-y-3 p-5">
          <div class="flex items-start justify-between gap-2">
            <div>
              <div class="font-mono text-[14px] font-semibold text-[#1D1D1F]">
                {po.orderNumber}
              </div>
              <div class="text-[12px] text-[#86868B]">
                {po.supplierName} &rarr; {po.warehouseName}
              </div>
            </div>
            <span
              class="inline-flex items-center gap-1.5 font-mono text-[11px] font-medium text-[#1D1D1F]"
            >
              <span
                class="h-1.5 w-1.5 rounded-full {po.status === 'RECEIVED'
                  ? 'bg-[#1D1D1F]'
                  : po.status === 'CANCELLED'
                    ? 'bg-[#D70015]'
                    : 'bg-[#86868B]'}"
              ></span>
              <span>{po.status}</span>
            </span>
          </div>

          <div class="rounded-xl bg-[#F5F5F7] p-3 text-[12px]">
            {#each po.items as item}
              <div class="flex items-center justify-between py-0.5">
                <span class="font-medium text-[#1D1D1F]"
                  >{item.productName}</span
                >
                <span class="font-mono text-[#1D1D1F]">
                  {item.receivedQuantity} / {item.orderedQuantity}
                  {item.productUnit}
                </span>
              </div>
            {/each}
          </div>

          <div class="flex gap-2">
            {#if po.status === "DRAFT"}
              <form method="POST" action="?/markOrdered" class="flex-1">
                <input type="hidden" name="id" value={po.id} />
                <button
                  type="submit"
                  class="apple-btn-primary w-full py-2 text-[13px]"
                >
                  Mark Ordered
                </button>
              </form>
            {/if}
            {#if po.status === "ORDERED" || po.status === "PARTIALLY_RECEIVED"}
              <a
                href="/goods-receipts?poId={po.id}"
                class="apple-btn-primary flex-1 py-2 text-center text-[13px]"
              >
                Receive Goods
              </a>
            {/if}
            {#if po.status === "DRAFT" || po.status === "ORDERED"}
              <form method="POST" action="?/cancel">
                <input type="hidden" name="id" value={po.id} />
                <button
                  type="submit"
                  class="apple-btn-secondary px-3.5 py-2 text-[13px] text-[#D70015]"
                >
                  Cancel
                </button>
              </form>
            {/if}
          </div>
        </div>
      {/each}
    </div>
  </section>
</div>
