<script lang="ts">
  import { getDictionary } from "@/lib/i18n";
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
</script>

<div>
  <!-- Top View Toolbar -->
  <div
    class="flex flex-wrap items-center justify-between gap-3 border-b border-[#EDEDED] px-5 py-3 sm:px-6"
  >
    <div class="flex flex-wrap items-center gap-3">
      <h1 class="text-[15px] font-semibold tracking-tight text-[#111113]">
        {dict.navPurchaseRequests}
      </h1>

      <div class="ui-tabs flex-wrap">
        {#each ["", "DRAFT", "SUBMITTED", "APPROVED", "REJECTED"] as status}
          <a
            href={status
              ? `/purchase-requests?status=${status}`
              : "/purchase-requests"}
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
      class="ui-btn"
    >
      {showNewDrawer ? "Cancel" : "+ New Request"}
    </button>
  </div>

  {#if form?.error}
    <div
      class="border-b border-[#EDEDED] bg-[#FEF2F2] px-6 py-2 text-[12px] text-[#DC2626]"
    >
      {form.error}
    </div>
  {/if}
  {#if form?.success}
    <div
      class="border-b border-[#EDEDED] bg-[#FAFAFA] px-6 py-2 text-[12px] text-[#111113]"
    >
      {form.success}
    </div>
  {/if}

  <!-- Collapsible Creation Bar -->
  {#if showNewDrawer}
    <div class="border-b border-[#EDEDED] bg-[#FAFAFA] px-5 py-4 sm:px-6">
      <form
        method="POST"
        action="?/create"
        class="grid grid-cols-1 items-end gap-2.5 sm:grid-cols-2 lg:grid-cols-5"
      >
        <div>
          <label
            for="pr-warehouse"
            class="mb-1 block text-[11px] font-medium text-[#52525B]"
          >
            Warehouse
          </label>
          <select
            id="pr-warehouse"
            name="warehouseId"
            required
            class="ui-select"
          >
            <option value="">Select warehouse...</option>
            {#each data.warehouses as wh}
              <option value={wh.id}>{wh.code} — {wh.name}</option>
            {/each}
          </select>
        </div>

        <div>
          <label
            for="pr-product"
            class="mb-1 block text-[11px] font-medium text-[#52525B]"
          >
            Product
          </label>
          <select id="pr-product" name="productId" required class="ui-select">
            <option value="">Select product...</option>
            {#each data.products as prod}
              <option value={prod.id}
                >{prod.sku} — {prod.name} ({prod.unit})</option
              >
            {/each}
          </select>
        </div>

        <div>
          <label
            for="pr-qty"
            class="mb-1 block text-[11px] font-medium text-[#52525B]"
          >
            Quantity
          </label>
          <input
            id="pr-qty"
            name="quantity"
            type="number"
            min="1"
            value="10"
            required
            class="ui-input tabular-nums"
          />
        </div>

        <div>
          <label
            for="pr-notes"
            class="mb-1 block text-[11px] font-medium text-[#52525B]"
          >
            Notes
          </label>
          <input
            id="pr-notes"
            name="notes"
            placeholder="Optional notes..."
            class="ui-input"
          />
        </div>

        <button type="submit" class="ui-btn w-full"> Create Draft </button>
      </form>
    </div>
  {/if}

  <!-- Edge-to-Edge Data Table -->
  <div class="overflow-x-auto">
    <table class="w-full text-left text-[13px]">
      <thead>
        <tr
          class="border-b border-[#EDEDED] bg-[#FAFAFA] text-[11px] font-medium text-[#71717A]"
        >
          <th class="px-5 py-2.5 sm:px-6">Request No.</th>
          <th class="px-5 py-2.5 sm:px-6">Warehouse</th>
          <th class="hidden px-5 py-2.5 md:table-cell sm:px-6">Requester</th>
          <th class="px-5 py-2.5 sm:px-6">Items</th>
          <th class="px-5 py-2.5 text-center sm:px-6">Status</th>
          <th class="px-5 py-2.5 text-right sm:px-6"></th>
        </tr>
      </thead>
      <tbody class="divide-y divide-[#F4F4F5]">
        {#each data.purchaseRequests as pr}
          <tr class="hover:bg-[#FAFAFA]">
            <td class="px-5 py-3 sm:px-6">
              <div class="font-mono text-[12px] font-semibold text-[#111113]">
                {pr.requestNumber}
              </div>
              {#if pr.notes}
                <div class="text-[11px] text-[#71717A]">{pr.notes}</div>
              {/if}
            </td>
            <td class="px-5 py-3 text-[#3F3F46] sm:px-6">
              {pr.warehouseName}
            </td>
            <td class="hidden px-5 py-3 text-[#71717A] md:table-cell sm:px-6">
              {pr.requesterName}
            </td>
            <td class="px-5 py-3 sm:px-6">
              {#each pr.items as item}
                <div class="text-[12px] text-[#111113] tabular-nums">
                  <span>{item.productName}</span>
                  <span class="ml-1 font-mono text-[#71717A]">
                    × {item.quantity}
                    {item.productUnit}
                  </span>
                </div>
              {/each}
            </td>
            <td class="px-5 py-3 text-center sm:px-6">
              <span class="font-mono text-[11px] font-medium text-[#52525B]">
                {pr.status}
              </span>
            </td>
            <td class="px-5 py-3 text-right sm:px-6">
              <div class="flex justify-end gap-1.5">
                {#if pr.status === "DRAFT"}
                  <form method="POST" action="?/submit">
                    <input type="hidden" name="id" value={pr.id} />
                    <button type="submit" class="ui-btn ui-btn-sm">
                      Submit
                    </button>
                  </form>
                {/if}

                {#if pr.status === "SUBMITTED" && data.user.role === "APPROVER"}
                  <form method="POST" action="?/approve">
                    <input type="hidden" name="id" value={pr.id} />
                    <button type="submit" class="ui-btn ui-btn-sm">
                      Approve
                    </button>
                  </form>
                  <form method="POST" action="?/reject">
                    <input type="hidden" name="id" value={pr.id} />
                    <input
                      type="hidden"
                      name="reason"
                      value="Rejected by Approver"
                    />
                    <button
                      type="submit"
                      class="ui-btn-outline ui-btn-sm text-[#DC2626]"
                    >
                      Reject
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
