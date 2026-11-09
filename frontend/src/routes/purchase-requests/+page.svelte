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

<div class="space-y-8">
  <!-- Header & Apple Segmented Filter -->
  <div class="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
    <div>
      <div class="text-[12px] font-medium text-[#86868B]">
        Stage 01 · DRAFT &rarr; SUBMITTED &rarr; APPROVED / REJECTED
      </div>
      <h1
        class="mt-1 text-2xl font-semibold tracking-tight text-[#1D1D1F] sm:text-[28px]"
      >
        {dict.prTitle}
      </h1>
    </div>

    <div
      class="apple-segmented inline-flex flex-wrap gap-0.5 self-start sm:self-auto"
    >
      {#each ["", "DRAFT", "SUBMITTED", "APPROVED", "REJECTED"] as status}
        <a
          href={status
            ? `/purchase-requests?status=${status}`
            : "/purchase-requests"}
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

  <!-- Create Draft PR Card -->
  <section class="apple-card p-5 sm:p-6">
    <div class="mb-4 flex items-center justify-between">
      <div>
        <h2 class="text-[15px] font-semibold tracking-tight text-[#1D1D1F]">
          New Purchase Request
        </h2>
        <p class="text-[12px] text-[#86868B]">
          Create an aggregate requisition draft for a target warehouse
        </p>
      </div>
      <span class="font-mono text-[11px] text-[#86868B]">DRAFT</span>
    </div>

    <form
      method="POST"
      action="?/create"
      class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5"
    >
      <select
        name="warehouseId"
        required
        class="apple-input px-3.5 py-2.5 text-[13px]"
      >
        <option value="">Select Warehouse...</option>
        {#each data.warehouses as wh}
          <option value={wh.id}>{wh.code} — {wh.name}</option>
        {/each}
      </select>

      <select
        name="productId"
        required
        class="apple-input px-3.5 py-2.5 text-[13px]"
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
        class="apple-input px-3.5 py-2.5 text-[13px] tabular-nums"
      />

      <input
        name="notes"
        placeholder="Notes / purpose..."
        class="apple-input px-3.5 py-2.5 text-[13px]"
      />

      <button
        type="submit"
        class="apple-btn-primary cursor-pointer px-4 py-2.5 text-[13px]"
      >
        + Create Draft
      </button>
    </form>
  </section>

  <!-- PR List Section -->
  <section class="apple-card overflow-hidden">
    <!-- Desktop Table -->
    <div class="hidden overflow-x-auto md:block">
      <table class="w-full text-left text-[13px]">
        <thead>
          <tr
            class="border-b border-black/[0.06] bg-[#FBFBFD] text-[11px] font-medium tracking-wider text-[#86868B] uppercase"
          >
            <th class="px-6 py-3.5">Document No.</th>
            <th class="px-6 py-3.5">Warehouse</th>
            <th class="px-6 py-3.5">Requester</th>
            <th class="px-6 py-3.5">Requested Items</th>
            <th class="px-6 py-3.5 text-center">Status</th>
            <th class="px-6 py-3.5 text-right">Action</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-black/[0.05]">
          {#each data.purchaseRequests as pr}
            <tr class="transition hover:bg-[#F5F5F7]/60">
              <td class="px-6 py-4">
                <div class="font-mono text-[13px] font-semibold text-[#1D1D1F]">
                  {pr.requestNumber}
                </div>
                {#if pr.notes}
                  <div class="mt-0.5 text-[12px] text-[#86868B]">
                    {pr.notes}
                  </div>
                {/if}
              </td>
              <td class="px-6 py-4 text-[#424245]">{pr.warehouseName}</td>
              <td class="px-6 py-4 text-[#6E6E73]">{pr.requesterName}</td>
              <td class="px-6 py-4">
                {#each pr.items as item}
                  <div class="text-[13px] text-[#1D1D1F]">
                    <span class="font-medium">{item.productName}</span>
                    <span class="ml-1 font-mono text-[12px] text-[#6E6E73]">
                      × {item.quantity}
                      {item.productUnit}
                    </span>
                  </div>
                {/each}
              </td>
              <td class="px-6 py-4 text-center">
                <span
                  class="inline-flex items-center gap-1.5 font-mono text-[11px] font-medium text-[#1D1D1F]"
                >
                  <span
                    class="h-1.5 w-1.5 rounded-full {pr.status === 'APPROVED'
                      ? 'bg-[#1D1D1F]'
                      : pr.status === 'REJECTED'
                        ? 'bg-[#D70015]'
                        : pr.status === 'SUBMITTED'
                          ? 'bg-[#6E6E73]'
                          : 'bg-[#D2D2D7]'}"
                  ></span>
                  <span>{pr.status}</span>
                </span>
              </td>
              <td class="px-6 py-4 text-right">
                <div class="flex justify-end gap-2">
                  {#if pr.status === "DRAFT"}
                    <form method="POST" action="?/submit">
                      <input type="hidden" name="id" value={pr.id} />
                      <button
                        type="submit"
                        class="apple-btn-primary cursor-pointer px-3 py-1.5 text-[12px]"
                      >
                        Submit
                      </button>
                    </form>
                  {/if}

                  {#if pr.status === "SUBMITTED" && data.user.role === "APPROVER"}
                    <form method="POST" action="?/approve">
                      <input type="hidden" name="id" value={pr.id} />
                      <button
                        type="submit"
                        class="apple-btn-primary cursor-pointer px-3 py-1.5 text-[12px]"
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
                        class="apple-btn-secondary cursor-pointer px-3 py-1.5 text-[12px] text-[#D70015]"
                      >
                        Reject
                      </button>
                    </form>
                  {:else if pr.status === "SUBMITTED"}
                    <span class="text-[12px] text-[#86868B]">
                      Awaiting Approver
                    </span>
                  {/if}
                </div>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>

    <!-- Mobile Responsive Cards -->
    <div class="divide-y divide-black/[0.06] md:hidden">
      {#each data.purchaseRequests as pr}
        <div class="space-y-3 p-5">
          <div class="flex items-start justify-between gap-2">
            <div>
              <div class="font-mono text-[14px] font-semibold text-[#1D1D1F]">
                {pr.requestNumber}
              </div>
              <div class="text-[12px] text-[#86868B]">
                {pr.warehouseName} · {pr.requesterName}
              </div>
            </div>
            <span
              class="inline-flex items-center gap-1.5 font-mono text-[11px] font-medium text-[#1D1D1F]"
            >
              <span
                class="h-1.5 w-1.5 rounded-full {pr.status === 'APPROVED'
                  ? 'bg-[#1D1D1F]'
                  : pr.status === 'REJECTED'
                    ? 'bg-[#D70015]'
                    : 'bg-[#86868B]'}"
              ></span>
              <span>{pr.status}</span>
            </span>
          </div>

          <div class="rounded-xl bg-[#F5F5F7] p-3 text-[12px]">
            {#each pr.items as item}
              <div class="flex items-center justify-between py-0.5">
                <span class="font-medium text-[#1D1D1F]"
                  >{item.productName}</span
                >
                <span class="font-mono text-[#6E6E73]">
                  {item.quantity}
                  {item.productUnit}
                </span>
              </div>
            {/each}
          </div>

          {#if pr.status === "DRAFT"}
            <form method="POST" action="?/submit">
              <input type="hidden" name="id" value={pr.id} />
              <button
                type="submit"
                class="apple-btn-primary w-full py-2 text-[13px]"
              >
                Submit Purchase Request
              </button>
            </form>
          {:else if pr.status === "SUBMITTED" && data.user.role === "APPROVER"}
            <div class="grid grid-cols-2 gap-2">
              <form method="POST" action="?/approve">
                <input type="hidden" name="id" value={pr.id} />
                <button
                  type="submit"
                  class="apple-btn-primary w-full py-2 text-[13px]"
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
                  class="apple-btn-secondary w-full py-2 text-[13px] text-[#D70015]"
                >
                  Reject
                </button>
              </form>
            </div>
          {/if}
        </div>
      {/each}
    </div>
  </section>
</div>
