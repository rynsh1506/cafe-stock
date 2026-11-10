<script lang="ts">
  import { getDictionary } from "@/lib/i18n";
  import CustomSelect from "@/lib/components/CustomSelect.svelte";
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

  let selectedMobileStatus = $state("");
  $effect(() => {
    selectedMobileStatus = data.statusFilter || "";
  });
  let selectedPrId = $state("");
  let selectedPrSupplierId = $state("");
  let selectedDirectSupplierId = $state("");
  let selectedDirectWarehouseId = $state("");
  let selectedDirectProductId = $state("");

  let statusFilterOptions = $derived([
    { value: "", label: dict.all.toUpperCase() },
    ...["DRAFT", "ORDERED", "PARTIALLY_RECEIVED", "RECEIVED", "CANCELLED"].map(
      (s) => ({ value: s, label: s }),
    ),
  ]);

  let approvedPrOptions = $derived([
    { value: "", label: `${dict.search}...` },
    ...data.approvedPrs.map((pr) => ({
      value: pr.id,
      label: `${pr.requestNumber} (${pr.warehouseName})`,
    })),
  ]);

  let supplierOptions = $derived([
    { value: "", label: dict.selectSupplier },
    ...data.suppliers.map((sup) => ({
      value: sup.id,
      label: `${sup.code} — ${sup.name}`,
    })),
  ]);

  let warehouseOptions = $derived([
    { value: "", label: dict.selectWarehouse },
    ...data.warehouses.map((wh) => ({
      value: wh.id,
      label: `${wh.code} — ${wh.name}`,
    })),
  ]);

  let productOptions = $derived([
    { value: "", label: dict.selectProduct },
    ...data.products.map((prod) => ({
      value: prod.id,
      label: `${prod.sku} — ${prod.name} (${prod.unit})`,
    })),
  ]);

  function statusBadgeClass(status: string): string {
    if (status === "RECEIVED") {
      return "border-[#B2D3C1] bg-[#E7F2EC] text-[#1D593B]";
    }
    if (status === "ORDERED" || status === "PARTIALLY_RECEIVED") {
      return "border-[#DEC19B] bg-[#F9EFE0] text-[#8A4B14]";
    }
    if (status === "CANCELLED") {
      return "border-[#E6B8B3] bg-[#FCEAE8] text-[#9E2A20]";
    }
    return "border-[#D8D0C0] bg-[#F2EFE9] text-[#5C5346]";
  }

  function statusDotClass(status: string): string {
    if (status === "RECEIVED") return "bg-[#1D593B]";
    if (status === "ORDERED") return "bg-[#5A3825]";
    if (status === "PARTIALLY_RECEIVED") return "bg-[#8A4B14]";
    if (status === "CANCELLED") return "bg-[#9E2A20]";
    return "bg-[#5C5346]";
  }
</script>

<div class="space-y-6">
  <!-- Header & Filter Bar -->
  <div class="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
    <div>
      <h1 class="font-serif text-2xl font-bold tracking-tight text-[#231712]">
        {dict.navPurchaseOrders}
      </h1>
      <p class="mt-0.5 text-xs text-[#7D6B5D]">
        {dict.poSubtitle}
      </p>
    </div>

    <div class="flex flex-wrap items-center gap-2.5">
      <!-- Mobile Filter Dropdown -->
      <div class="w-full sm:hidden">
        <CustomSelect
          bind:value={selectedMobileStatus}
          options={statusFilterOptions}
          onchange={(val) => {
            window.location.href = val
              ? `/purchase-orders?status=${val}`
              : "/purchase-orders";
          }}
        />
      </div>

      <!-- Desktop Smooth Non-wrapping Tabs -->
      <div class="hidden sm:inline-flex ui-tabs overflow-x-auto max-w-full">
        {#each ["", "DRAFT", "ORDERED", "PARTIALLY_RECEIVED", "RECEIVED", "CANCELLED"] as status}
          <a
            href={status
              ? `/purchase-orders?status=${status}`
              : "/purchase-orders"}
            class="ui-tab {data.statusFilter === status ? 'ui-tab-active' : ''}"
          >
            {status || dict.all.toUpperCase()}
          </a>
        {/each}
      </div>

      <button
        type="button"
        onclick={() => (showNewDrawer = !showNewDrawer)}
        class="ui-btn cursor-pointer w-full sm:w-auto"
      >
        {showNewDrawer ? dict.closeForm : dict.newPo}
      </button>
    </div>
  </div>

  {#if form?.error}
    <div
      class="flex items-center gap-2 rounded-xl border border-[#F5C2C7] bg-[#FFF5F5] px-4 py-3 text-xs font-semibold text-[#C62828]"
    >
      <span class="h-2 w-2 rounded-full bg-[#C62828]"></span>
      <span>{form.error}</span>
    </div>
  {/if}
  {#if form?.success}
    <div
      class="flex items-center gap-2 rounded-xl border border-[#B2D3C1] bg-[#E7F2EC] px-4 py-3 text-xs font-semibold text-[#1D593B]"
    >
      <span class="h-2 w-2 rounded-full bg-[#1D593B]"></span>
      <span>{form.success}</span>
    </div>
  {/if}

  <!-- Collapsible Order Creation Card -->
  {#if showNewDrawer}
    <div class="ui-card p-5 sm:p-6">
      <div
        class="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-[#F0E7DD] pb-3"
      >
        <h2 class="font-serif text-base font-bold text-[#231712]">
          {dict.issuePo}
        </h2>
        <div class="ui-tabs">
          <button
            type="button"
            onclick={() => (createMode = "fromPr")}
            class="ui-tab cursor-pointer {createMode === 'fromPr'
              ? 'ui-tab-active'
              : ''}"
          >
            {dict.fromApprovedPr}
          </button>
          <button
            type="button"
            onclick={() => (createMode = "direct")}
            class="ui-tab cursor-pointer {createMode === 'direct'
              ? 'ui-tab-active'
              : ''}"
          >
            {dict.directPo}
          </button>
        </div>
      </div>

      {#if createMode === "fromPr"}
        <form
          method="POST"
          action="?/createFromPr"
          class="grid grid-cols-1 items-end gap-3.5 sm:grid-cols-2 lg:grid-cols-4"
        >
          <div>
            <label
              for="po-pr-id"
              class="mb-1.5 block text-[11px] font-bold tracking-wider text-[#5A4537] uppercase"
              >{dict.approvedPr}</label
            >
            <CustomSelect
              name="purchaseRequestId"
              bind:value={selectedPrId}
              options={approvedPrOptions}
              placeholder={`${dict.search}...`}
            />
          </div>
          <div>
            <label
              for="po-pr-supplier"
              class="mb-1.5 block text-[11px] font-bold tracking-wider text-[#5A4537] uppercase"
              >{dict.supplierPartner}</label
            >
            <CustomSelect
              name="supplierId"
              bind:value={selectedPrSupplierId}
              options={supplierOptions}
              placeholder={dict.selectSupplier}
            />
          </div>
          <div>
            <label
              for="po-expected-date"
              class="mb-1.5 block text-[11px] font-bold tracking-wider text-[#5A4537] uppercase"
              >{dict.expectedDelivery}</label
            >
            <input
              id="po-expected-date"
              type="date"
              name="expectedDate"
              class="ui-input"
            />
          </div>
          <button type="submit" class="ui-btn w-full cursor-pointer">
            {dict.convertPrToPo}
          </button>
        </form>
      {:else}
        <form
          method="POST"
          action="?/createStandalone"
          class="grid grid-cols-1 items-end gap-3.5 sm:grid-cols-2 lg:grid-cols-5"
        >
          <div>
            <label
              for="po-direct-supplier"
              class="mb-1.5 block text-[11px] font-bold tracking-wider text-[#5A4537] uppercase"
              >{dict.supplier}</label
            >
            <CustomSelect
              name="supplierId"
              bind:value={selectedDirectSupplierId}
              options={supplierOptions}
              placeholder={dict.selectSupplier}
            />
          </div>
          <div>
            <label
              for="po-direct-warehouse"
              class="mb-1.5 block text-[11px] font-bold tracking-wider text-[#5A4537] uppercase"
              >{dict.warehouse}</label
            >
            <CustomSelect
              name="warehouseId"
              bind:value={selectedDirectWarehouseId}
              options={warehouseOptions}
              placeholder={dict.selectWarehouse}
            />
          </div>
          <div>
            <label
              for="po-direct-product"
              class="mb-1.5 block text-[11px] font-bold tracking-wider text-[#5A4537] uppercase"
              >{dict.product}</label
            >
            <CustomSelect
              name="productId"
              bind:value={selectedDirectProductId}
              options={productOptions}
              placeholder={dict.selectProduct}
            />
          </div>
          <div>
            <label
              for="po-direct-qty"
              class="mb-1.5 block text-[11px] font-bold tracking-wider text-[#5A4537] uppercase"
              >{dict.quantity}</label
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
            {dict.savePo}
          </button>
        </form>
      {/if}
    </div>
  {/if}

  <!-- PO Table Card -->
  <div class="ui-card overflow-hidden">
    <div class="overflow-x-auto">
      <table class="w-full border-collapse text-left text-xs">
        <thead>
          <tr
            class="border-b border-[#EDE4D8] bg-[#FAF7F2] text-[10px] font-bold tracking-wider text-[#8C7665] uppercase"
          >
            <th class="px-5 py-3.5">{dict.poNumber}</th>
            <th class="px-5 py-3.5">{dict.supplierAndWarehouse}</th>
            <th class="px-5 py-3.5">{dict.fulfillment}</th>
            <th class="px-5 py-3.5 text-center">{dict.status}</th>
            <th class="px-5 py-3.5 text-right">{dict.actions}</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-[#F5EDE4]">
          {#each data.purchaseOrders as po}
            <tr class="transition hover:bg-[#FAF7F2]">
              <td class="px-5 py-4">
                <div class="font-mono text-xs font-bold text-[#5A3825]">
                  {po.orderNumber}
                </div>
                {#if po.purchaseRequestNumber}
                  <div class="mt-0.5 font-mono text-[10px] text-[#8C7665]">
                    Ref: {po.purchaseRequestNumber}
                  </div>
                {/if}
              </td>
              <td class="px-5 py-4">
                <div class="font-semibold text-[#2E1F16]">
                  {po.supplierName}
                </div>
                <div class="text-[11px] text-[#8C7665]">
                  {po.warehouseName}
                </div>
              </td>
              <td class="px-5 py-4">
                {#each po.items as item}
                  <div class="text-xs text-[#2E1F16] tabular-nums">
                    <span>{item.productName}</span>
                    <span class="ml-1.5 font-mono font-bold text-[#5A3825]">
                      {item.receivedQuantity}/{item.orderedQuantity}
                    </span>
                    <span class="text-[10px] text-[#8C7665]"
                      >{item.productUnit}</span
                    >
                  </div>
                {/each}
              </td>
              <td class="px-5 py-4 text-center">
                <span class="ui-badge {statusBadgeClass(po.status)}">
                  <span class="ui-badge-dot {statusDotClass(po.status)}"></span>
                  <span>{po.status}</span>
                </span>
              </td>
              <td class="px-5 py-4 text-right">
                <div class="flex justify-end gap-1.5">
                  {#if po.status === "DRAFT"}
                    <form method="POST" action="?/markOrdered">
                      <input type="hidden" name="id" value={po.id} />
                      <button
                        type="submit"
                        class="ui-btn ui-btn-sm cursor-pointer"
                      >
                        {dict.markOrdered}
                      </button>
                    </form>
                  {/if}
                  {#if po.status === "ORDERED" || po.status === "PARTIALLY_RECEIVED"}
                    <a
                      href="/goods-receipts?poId={po.id}"
                      class="ui-btn ui-btn-sm"
                    >
                      {dict.receiveGoods}
                    </a>
                  {/if}
                  {#if po.status === "DRAFT" || po.status === "ORDERED"}
                    <form method="POST" action="?/cancel">
                      <input type="hidden" name="id" value={po.id} />
                      <button
                        type="submit"
                        class="ui-btn-outline ui-btn-sm cursor-pointer text-[#C62828]"
                      >
                        {dict.cancel}
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
  </div>
</div>
