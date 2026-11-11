<script lang="ts">
  import { getDictionary } from "@/lib/i18n";
  import CustomSelect from "@/lib/components/CustomSelect.svelte";
  import Pagination from "@/lib/components/Pagination.svelte";
  import type {
    PurchaseRequestsActionData,
    PurchaseRequestsPageData,
  } from "@/routes/purchase-requests/+page.server";

  let {
    data,
    form,
  }: {
    data: PurchaseRequestsPageData;
    form: PurchaseRequestsActionData | null;
  } = $props();
  let dict = $derived(getDictionary(data.lang));
  let showNewDrawer = $state(false);

  let selectedMobileStatus = $state("");
  $effect(() => {
    selectedMobileStatus = data.statusFilter || "";
  });
  let selectedPrWarehouse = $state("");
  let selectedPrProduct = $state("");

  let statusFilterOptions = $derived([
    { value: "", label: dict.all.toUpperCase() },
    ...["DRAFT", "SUBMITTED", "APPROVED", "REJECTED"].map((s) => ({
      value: s,
      label: s,
    })),
  ]);

  let warehouseSelectOptions = $derived([
    { value: "", label: dict.selectWarehouse },
    ...data.warehouses.map((wh) => ({
      value: wh.id,
      label: `${wh.code} — ${wh.name}`,
    })),
  ]);

  let productSelectOptions = $derived([
    { value: "", label: dict.selectProduct },
    ...data.products.map((prod) => ({
      value: prod.id,
      label: `${prod.sku} — ${prod.name} (${prod.unit})`,
    })),
  ]);

  function statusBadgeClass(status: string): string {
    if (status === "APPROVED") {
      return "border-[#B2D3C1] bg-[#E7F2EC] text-[#1D593B]";
    }
    if (status === "SUBMITTED") {
      return "border-[#DEC19B] bg-[#F9EFE0] text-[#8A4B14]";
    }
    if (status === "REJECTED") {
      return "border-[#E6B8B3] bg-[#FCEAE8] text-[#9E2A20]";
    }
    return "border-[#D8D0C0] bg-[#F2EFE9] text-[#5C5346]";
  }

  function statusDotClass(status: string): string {
    if (status === "APPROVED") return "bg-[#1D593B]";
    if (status === "SUBMITTED") return "bg-[#8A4B14]";
    if (status === "REJECTED") return "bg-[#9E2A20]";
    return "bg-[#5C5346]";
  }
</script>

<div class="space-y-6">
  <!-- Header & Filter Bar -->
  <div class="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
    <div>
      <h1 class="font-serif text-2xl font-bold tracking-tight text-[#231712]">
        {dict.navPurchaseRequests}
      </h1>
      <p class="mt-0.5 text-xs text-[#7D6B5D]">
        {dict.prSubtitle}
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
              ? `/purchase-requests?status=${val}`
              : "/purchase-requests";
          }}
        />
      </div>

      <!-- Desktop Smooth Non-wrapping Tabs -->
      <div class="hidden sm:inline-flex ui-tabs overflow-x-auto max-w-full">
        {#each ["", "DRAFT", "SUBMITTED", "APPROVED", "REJECTED"] as status}
          <a
            href={status
              ? `/purchase-requests?status=${status}`
              : "/purchase-requests"}
            class="ui-tab {data.statusFilter === status ? 'ui-tab-active' : ''}"
          >
            {status || dict.all.toUpperCase()}
          </a>
        {/each}
      </div>

      {#if data.user.role === "USER"}
        <button
          type="button"
          onclick={() => (showNewDrawer = !showNewDrawer)}
          class="ui-btn cursor-pointer w-full sm:w-auto"
        >
          {showNewDrawer ? dict.closeForm : dict.newPr}
        </button>
      {/if}
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

  <!-- Collapsible Creation Card -->
  {#if showNewDrawer && data.user.role === "USER"}
    <div class="ui-card p-5 sm:p-6">
      <div class="mb-4 border-b border-[#F0E7DD] pb-3">
        <h2 class="font-serif text-base font-bold text-[#231712]">
          {dict.createDraftPr}
        </h2>
      </div>
      <form
        method="POST"
        action="?/create"
        class="grid grid-cols-1 items-end gap-3.5 sm:grid-cols-2 lg:grid-cols-5"
      >
        <div>
          <label
            for="pr-warehouse"
            class="mb-1.5 block text-[11px] font-bold tracking-wider text-[#5A4537] uppercase"
            >{dict.destinationWarehouse}</label
          >
          <CustomSelect
            name="warehouseId"
            bind:value={selectedPrWarehouse}
            options={warehouseSelectOptions}
            placeholder={dict.selectWarehouse}
          />
        </div>
        <div>
          <label
            for="pr-product"
            class="mb-1.5 block text-[11px] font-bold tracking-wider text-[#5A4537] uppercase"
            >{dict.product}</label
          >
          <CustomSelect
            name="productId"
            bind:value={selectedPrProduct}
            options={productSelectOptions}
            placeholder={dict.selectProduct}
          />
        </div>
        <div>
          <label
            for="pr-quantity"
            class="mb-1.5 block text-[11px] font-bold tracking-wider text-[#5A4537] uppercase"
            >{dict.quantity}</label
          >
          <input
            id="pr-quantity"
            type="number"
            name="quantity"
            min="1"
            value="10"
            required
            class="ui-input tabular-nums"
          />
        </div>
        <div>
          <label
            for="pr-notes"
            class="mb-1.5 block text-[11px] font-bold tracking-wider text-[#5A4537] uppercase"
            >{dict.notes}</label
          >
          <input
            id="pr-notes"
            type="text"
            name="notes"
            placeholder="..."
            class="ui-input"
          />
        </div>
        <button type="submit" class="ui-btn w-full cursor-pointer">
          {dict.saveDraftPr}
        </button>
      </form>
    </div>
  {/if}

  <!-- PR Table Card -->
  <div class="ui-card overflow-hidden">
    <div
      class="flex items-center justify-between border-b border-[#EDE4D8] bg-[#FAF7F2] px-4 py-1.5 text-[11px] font-medium text-[#8C7665] sm:hidden"
    >
      <span>← Geser tabel untuk detail & aksi PR →</span>
      <span
        class="rounded bg-[#EFE7DE] px-1.5 py-0.5 font-mono text-[10px] text-[#5A3825]"
        >5 Kolom</span
      >
    </div>
    <div class="overflow-x-auto">
      <table class="w-full min-w-180 border-collapse text-left text-xs">
        <thead>
          <tr
            class="border-b border-[#EDE4D8] bg-[#FAF7F2] text-[10px] font-bold tracking-wider text-[#8C7665] uppercase whitespace-nowrap"
          >
            <th class="px-5 py-3.5">{dict.requestId}</th>
            <th class="px-5 py-3.5">{dict.warehouseAndRequester}</th>
            <th class="px-5 py-3.5">{dict.requestedItems}</th>
            <th class="px-5 py-3.5 text-center">{dict.status}</th>
            <th class="px-5 py-3.5 text-right">{dict.actions}</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-[#F5EDE4] whitespace-nowrap">
          {#each data.purchaseRequests as pr}
            <tr class="transition hover:bg-[#FAF7F2]">
              <td class="px-5 py-4">
                <div class="font-mono text-xs font-bold text-[#5A3825]">
                  {pr.requestNumber}
                </div>
                <div class="mt-0.5 font-mono text-[10px] text-[#8C7665]">
                  {new Date(pr.createdAt).toLocaleDateString()}
                </div>
              </td>
              <td class="px-5 py-4">
                <div class="font-semibold text-[#2E1F16]">
                  {pr.warehouseName}
                </div>
                <div class="text-[11px] text-[#8C7665]">
                  {pr.requesterName}
                </div>
              </td>
              <td class="px-5 py-4">
                {#each pr.items as item}
                  <div class="text-xs text-[#2E1F16] tabular-nums">
                    <span class="font-medium">{item.productName}</span>
                    <span class="ml-1.5 font-mono font-bold text-[#5A3825]">
                      {item.quantity}
                      {item.productUnit}
                    </span>
                  </div>
                {/each}
                {#if pr.notes}
                  <div class="mt-1 text-[11px] text-[#8C7665]">{pr.notes}</div>
                {/if}
              </td>
              <td class="px-5 py-4 text-center">
                <span class="ui-badge {statusBadgeClass(pr.status)}">
                  <span class="ui-badge-dot {statusDotClass(pr.status)}"></span>
                  <span>{pr.status}</span>
                </span>
              </td>
              <td class="px-5 py-4 text-right">
                <div class="flex justify-end gap-1.5">
                  {#if pr.status === "DRAFT" && data.user.role === "USER"}
                    <form method="POST" action="?/submit">
                      <input type="hidden" name="id" value={pr.id} />
                      <button
                        type="submit"
                        class="ui-btn ui-btn-sm cursor-pointer"
                      >
                        {dict.submitPr}
                      </button>
                    </form>
                    <form method="POST" action="?/delete">
                      <input type="hidden" name="id" value={pr.id} />
                      <button
                        type="submit"
                        class="ui-btn-outline ui-btn-sm cursor-pointer text-[#C62828]"
                      >
                        {dict.delete}
                      </button>
                    </form>
                  {/if}
                  {#if pr.status === "SUBMITTED" && data.user.role === "APPROVER"}
                    <form method="POST" action="?/approve">
                      <input type="hidden" name="id" value={pr.id} />
                      <button
                        type="submit"
                        class="ui-btn ui-btn-sm cursor-pointer"
                      >
                        {dict.approve}
                      </button>
                    </form>
                    <form method="POST" action="?/reject">
                      <input type="hidden" name="id" value={pr.id} />
                      <button
                        type="submit"
                        class="ui-btn-outline ui-btn-sm cursor-pointer text-[#C62828]"
                      >
                        {dict.reject}
                      </button>
                    </form>
                  {/if}
                  {#if pr.status === "APPROVED"}
                    <a href="/purchase-orders" class="ui-btn-outline ui-btn-sm">
                      {dict.createPo}
                    </a>
                  {/if}
                </div>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>

    <Pagination
      page={data.pagination.page}
      limit={data.pagination.limit}
      total={data.pagination.total}
      totalPages={data.pagination.totalPages}
    />
  </div>
</div>
