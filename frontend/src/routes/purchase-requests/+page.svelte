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
</script>

<div class="space-y-6">
  <div class="flex flex-wrap items-center justify-between gap-4">
    <h1 class="text-xl font-bold text-stone-900">{dict.prTitle}</h1>

    <div class="flex flex-wrap gap-1.5">
      {#each ["", "DRAFT", "SUBMITTED", "APPROVED", "REJECTED"] as status}
        <a
          href={status
            ? `/purchase-requests?status=${status}`
            : "/purchase-requests"}
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

  <section class="rounded-xl border border-stone-200 bg-white p-5 shadow-xs">
    <h2 class="mb-3 text-sm font-bold text-stone-900">
      Create New Purchase Request (DRAFT)
    </h2>
    <form
      method="POST"
      action="?/create"
      class="grid grid-cols-1 gap-3 sm:grid-cols-5"
    >
      <select
        name="warehouseId"
        required
        class="rounded-lg border border-stone-300 bg-white px-3 py-2 text-xs"
      >
        <option value="">Select Warehouse...</option>
        {#each data.warehouses as wh}
          <option value={wh.id}>{wh.code} — {wh.name}</option>
        {/each}
      </select>

      <select
        name="productId"
        required
        class="rounded-lg border border-stone-300 bg-white px-3 py-2 text-xs"
      >
        <option value="">Select Product...</option>
        {#each data.products as prod}
          <option value={prod.id}>{prod.sku} — {prod.name} ({prod.unit})</option
          >
        {/each}
      </select>

      <input
        name="quantity"
        type="number"
        min="1"
        value="10"
        required
        placeholder="Quantity"
        class="rounded-lg border border-stone-300 bg-white px-3 py-2 text-xs"
      />

      <input
        name="notes"
        placeholder="Request notes..."
        class="rounded-lg border border-stone-300 bg-white px-3 py-2 text-xs"
      />

      <button
        type="submit"
        class="rounded-lg bg-amber-800 px-4 py-2 text-xs font-semibold text-white hover:bg-amber-900"
      >
        + Create Draft PR
      </button>
    </form>
  </section>

  <section class="rounded-xl border border-stone-200 bg-white p-5 shadow-xs">
    <div class="overflow-x-auto">
      <table class="w-full text-left text-xs">
        <thead>
          <tr class="border-b border-stone-200 text-stone-500">
            <th class="pb-2.5 font-semibold">PR Number</th>
            <th class="pb-2.5 font-semibold">Warehouse</th>
            <th class="pb-2.5 font-semibold">Requested By</th>
            <th class="pb-2.5 font-semibold">Items</th>
            <th class="pb-2.5 text-center font-semibold">Status</th>
            <th class="pb-2.5 text-right font-semibold">Workflow Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-stone-100">
          {#each data.purchaseRequests as pr}
            <tr>
              <td class="py-3 font-mono font-bold text-stone-900">
                {pr.requestNumber}
                {#if pr.notes}
                  <span
                    class="block font-sans text-[11px] font-normal text-stone-500"
                    >{pr.notes}</span
                  >
                {/if}
              </td>
              <td class="py-3 text-stone-700">{pr.warehouseName}</td>
              <td class="py-3 text-stone-700">{pr.requesterName}</td>
              <td class="py-3 text-stone-700">
                {#each pr.items as item}
                  <div>
                    <span class="font-semibold">{item.productName}</span>:
                    {item.quantity}
                    {item.productUnit}
                  </div>
                {/each}
              </td>
              <td class="py-3 text-center">
                <span
                  class="rounded-full px-2.5 py-0.5 text-[10px] font-bold {pr.status ===
                  'APPROVED'
                    ? 'bg-emerald-100 text-emerald-800'
                    : pr.status === 'REJECTED'
                      ? 'bg-red-100 text-red-800'
                      : pr.status === 'SUBMITTED'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-stone-200 text-stone-700'}"
                >
                  {pr.status}
                </span>
              </td>
              <td class="py-3 text-right">
                <div class="flex justify-end gap-1.5">
                  {#if pr.status === "DRAFT"}
                    <form method="POST" action="?/submit">
                      <input type="hidden" name="id" value={pr.id} />
                      <button
                        type="submit"
                        class="rounded bg-sky-700 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-sky-800"
                      >
                        Submit PR
                      </button>
                    </form>
                  {/if}

                  {#if pr.status === "SUBMITTED" && data.user.role === "APPROVER"}
                    <form method="POST" action="?/approve">
                      <input type="hidden" name="id" value={pr.id} />
                      <button
                        type="submit"
                        class="rounded bg-emerald-700 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-emerald-800"
                      >
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
                        class="rounded bg-red-700 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-red-800"
                      >
                        Reject
                      </button>
                    </form>
                  {:else if pr.status === "SUBMITTED"}
                    <span class="text-[11px] italic text-stone-400"
                      >Requires APPROVER role</span
                    >
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
