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
  let showNewDrawer = $state(false);
  let createMode = $state<"fromPr" | "direct">("fromPr");
</script>

<div>
  <!-- Toolbar -->
  <div
    class="flex flex-wrap items-center justify-between gap-3 border-b border-[#EDEDED] px-5 py-3 sm:px-6"
  >
    <div class="flex flex-wrap items-center gap-3">
      <h1 class="text-[15px] font-semibold tracking-tight text-[#111]">
        {dict.navPurchaseOrders}
      </h1>

      <div class="ui-tabs flex-wrap">
        {#each ["", "DRAFT", "ORDERED", "PARTIALLY_RECEIVED", "RECEIVED", "CANCELLED"] as status}
          <a
            href={status
              ? `/purchase-orders?status=${status}`
              : "/purchase-orders"}
            class="ui-tab {data.statusFilter === status ? 'ui-tab-active' : ''}"
          >
            {status || "All"}
          </a>
        {/each}
      </div>
    </div>

    <button
      type="button"
      onclick={() => (showNewDrawer = !showNewDrawer)}
      class="ui-btn cursor-pointer"
    >
      {showNewDrawer ? "Close" : "+ New Order"}
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

  <!-- Collapsible Order Creation Bar -->
  {#if showNewDrawer}
    <div class="border-b border-[#EDEDED] bg-[#FAFAFA] px-5 py-4 sm:px-6">
      <div class="mb-3 flex items-center gap-3">
        <div class="ui-tabs">
          <button
            type="button"
            onclick={() => (createMode = "fromPr")}
            class="ui-tab cursor-pointer {createMode === 'fromPr'
              ? 'ui-tab-active'
              : ''}"
          >
            From Approved PR
          </button>
          <button
            type="button"
            onclick={() => (createMode = "direct")}
            class="ui-tab cursor-pointer {createMode === 'direct'
              ? 'ui-tab-active'
              : ''}"
          >
            Direct Order
          </button>
        </div>
      </div>

      {#if createMode === "fromPr"}
        <form
          method="POST"
          action="?/createFromPr"
          class="grid grid-cols-1 items-end gap-3 sm:grid-cols-2 lg:grid-cols-4"
        >
          <div>
            <label
              for="po-pr-id"
              class="mb-1 block text-[11px] font-medium text-[#666]"
              >Approved Request</label
            >
            <select
              id="po-pr-id"
              name="purchaseRequestId"
              required
              class="ui-select"
            >
              <option value="">Select Request...</option>
              {#each data.approvedPrs as pr}
                <option value={pr.id}
                  >{pr.requestNumber} ({pr.warehouseName})</option
                >
              {/each}
            </select>
          </div>
          <div>
            <label
              for="po-pr-supplier"
              class="mb-1 block text-[11px] font-medium text-[#666]"
              >Supplier</label
            >
            <select
              id="po-pr-supplier"
              name="supplierId"
              required
              class="ui-select"
            >
              <option value="">Select Supplier...</option>
              {#each data.suppliers as sup}
                <option value={sup.id}>{sup.code} — {sup.name}</option>
              {/each}
            </select>
          </div>
          <div>
            <label
              for="po-expected-date"
              class="mb-1 block text-[11px] font-medium text-[#666]"
              >Expected Delivery</label
            >
            <input
              id="po-expected-date"
              type="date"
              name="expectedDate"
              class="ui-input"
            />
          </div>
          <button type="submit" class="ui-btn w-full cursor-pointer">
            Convert to PO
          </button>
        </form>
      {:else}
        <form
          method="POST"
          action="?/createStandalone"
          class="grid grid-cols-1 items-end gap-3 sm:grid-cols-2 lg:grid-cols-5"
        >
          <div>
            <label
              for="po-direct-supplier"
              class="mb-1 block text-[11px] font-medium text-[#666]"
              >Supplier</label
            >
            <select
              id="po-direct-supplier"
              name="supplierId"
              required
              class="ui-select"
            >
              <option value="">Select Supplier...</option>
              {#each data.suppliers as sup}
                <option value={sup.id}>{sup.name}</option>
              {/each}
            </select>
          </div>
          <div>
            <label
              for="po-direct-warehouse"
              class="mb-1 block text-[11px] font-medium text-[#666]"
              >Warehouse</label
            >
            <select
              id="po-direct-warehouse"
              name="warehouseId"
              required
              class="ui-select"
            >
              <option value="">Select Warehouse...</option>
              {#each data.warehouses as wh}
                <option value={wh.id}>{wh.name}</option>
              {/each}
            </select>
          </div>
          <div>
            <label
              for="po-direct-product"
              class="mb-1 block text-[11px] font-medium text-[#666]"
              >Product</label
            >
            <select
              id="po-direct-product"
              name="productId"
              required
              class="ui-select"
            >
              <option value="">Select Product...</option>
              {#each data.products as prod}
                <option value={prod.id}>{prod.name}</option>
              {/each}
            </select>
          </div>
          <div>
            <label
              for="po-direct-qty"
              class="mb-1 block text-[11px] font-medium text-[#666]"
              >Quantity</label
            >
            <input
              id="po-direct-qty"
              type="number"
              name="orderedQuantity"
              min="1"
              value="10"
              required
              class="ui-input tabular-nums"
            />
          </div>
          <button type="submit" class="ui-btn w-full cursor-pointer">
            Create Order
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
          <th class="px-5 py-2.5 sm:px-6">Order</th>
          <th class="px-5 py-2.5 sm:px-6">Supplier & Warehouse</th>
          <th class="px-5 py-2.5 sm:px-6">Fulfillment</th>
          <th class="px-5 py-2.5 text-center sm:px-6">Status</th>
          <th class="px-5 py-2.5 text-right sm:px-6">Actions</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-[#F2F2F2]">
        {#each data.purchaseOrders as po}
          <tr class="hover:bg-[#FAFAFA]">
            <td class="px-5 py-3 sm:px-6">
              <div class="font-mono text-[12px] font-semibold text-[#111]">
                {po.orderNumber}
              </div>
              {#if po.purchaseRequestNumber}
                <div class="mt-0.5 font-mono text-[11px] text-[#777]">
                  Ref: {po.purchaseRequestNumber}
                </div>
              {/if}
            </td>
            <td class="px-5 py-3 sm:px-6">
              <div class="font-medium text-[#111]">{po.supplierName}</div>
              <div class="text-[11px] text-[#777]">{po.warehouseName}</div>
            </td>
            <td class="px-5 py-3 sm:px-6">
              {#each po.items as item}
                <div class="text-[13px] text-[#111] tabular-nums">
                  <span>{item.productName}</span>
                  <span
                    class="ml-1.5 font-mono text-[12px] font-medium text-[#111]"
                  >
                    {item.receivedQuantity}/{item.orderedQuantity}
                  </span>
                  <span class="text-[11px] text-[#777]">{item.productUnit}</span
                  >
                </div>
              {/each}
            </td>
            <td class="px-5 py-3 text-center sm:px-6">
              <span
                class="inline-flex items-center gap-1.5 font-mono text-[11px] text-[#111]"
              >
                <span
                  class="h-1.5 w-1.5 rounded-full {po.status === 'RECEIVED'
                    ? 'bg-[#111]'
                    : po.status === 'CANCELLED'
                      ? 'bg-[#D93025]'
                      : 'bg-[#999]'}"
                ></span>
                <span>{po.status}</span>
              </span>
            </td>
            <td class="px-5 py-3 text-right sm:px-6">
              <div class="flex justify-end gap-1.5">
                {#if po.status === "DRAFT"}
                  <form method="POST" action="?/markOrdered">
                    <input type="hidden" name="id" value={po.id} />
                    <button
                      type="submit"
                      class="ui-btn ui-btn-sm cursor-pointer"
                    >
                      Mark Ordered
                    </button>
                  </form>
                {/if}
                {#if po.status === "ORDERED" || po.status === "PARTIALLY_RECEIVED"}
                  <a
                    href="/goods-receipts?poId={po.id}"
                    class="ui-btn ui-btn-sm"
                  >
                    Receive
                  </a>
                {/if}
                {#if po.status === "DRAFT" || po.status === "ORDERED"}
                  <form method="POST" action="?/cancel">
                    <input type="hidden" name="id" value={po.id} />
                    <button
                      type="submit"
                      class="ui-btn-outline ui-btn-sm cursor-pointer text-[#D93025]"
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

  <!-- Mobile List -->
  <div class="divide-y divide-[#EDEDED] md:hidden">
    {#each data.purchaseOrders as po}
      <div class="space-y-2.5 px-5 py-3.5">
        <div class="flex items-start justify-between gap-2">
          <div>
            <div class="font-mono text-[13px] font-semibold text-[#111]">
              {po.orderNumber}
            </div>
            <div class="text-[11px] text-[#777]">
              {po.supplierName} · {po.warehouseName}
            </div>
          </div>
          <span
            class="inline-flex items-center gap-1.5 font-mono text-[11px] text-[#111]"
          >
            <span
              class="h-1.5 w-1.5 rounded-full {po.status === 'RECEIVED'
                ? 'bg-[#111]'
                : po.status === 'CANCELLED'
                  ? 'bg-[#D93025]'
                  : 'bg-[#999]'}"
            ></span>
            <span>{po.status}</span>
          </span>
        </div>

        <div class="text-[12px] text-[#111]">
          {#each po.items as item}
            <div class="flex items-center justify-between py-0.5">
              <span>{item.productName}</span>
              <span class="font-mono text-[#555]">
                {item.receivedQuantity}/{item.orderedQuantity}
                {item.productUnit}
              </span>
            </div>
          {/each}
        </div>

        <div class="flex gap-2">
          {#if po.status === "DRAFT"}
            <form method="POST" action="?/markOrdered" class="flex-1">
              <input type="hidden" name="id" value={po.id} />
              <button type="submit" class="ui-btn ui-btn-sm w-full">
                Mark Ordered
              </button>
            </form>
          {/if}
          {#if po.status === "ORDERED" || po.status === "PARTIALLY_RECEIVED"}
            <a
              href="/goods-receipts?poId={po.id}"
              class="ui-btn ui-btn-sm flex-1 text-center"
            >
              Receive
            </a>
          {/if}
          {#if po.status === "DRAFT" || po.status === "ORDERED"}
            <form method="POST" action="?/cancel">
              <input type="hidden" name="id" value={po.id} />
              <button
                type="submit"
                class="ui-btn-outline ui-btn-sm text-[#D93025]"
              >
                Cancel
              </button>
            </form>
          {/if}
        </div>
      </div>
    {/each}
  </div>
</div>
