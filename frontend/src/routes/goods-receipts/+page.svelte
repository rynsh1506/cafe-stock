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

<div class="space-y-6">
  <!-- Header -->
  <div class="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
    <div>
      <h1 class="font-serif text-2xl font-bold tracking-tight text-[#231712]">
        {dict.navGoodsReceipts}
      </h1>
      <p class="mt-0.5 text-xs text-[#7D6B5D]">
        Verifikasi penerimaan barang fisik dari pemasok dan penambahan stok
        gudang otomatis.
      </p>
    </div>

    <button
      type="button"
      onclick={() => (showNewDrawer = !showNewDrawer)}
      class="ui-btn cursor-pointer"
    >
      {showNewDrawer ? "Tutup Form" : "+ Catat Penerimaan (GR)"}
    </button>
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

  <!-- Collapsible Receipt Form Card -->
  {#if showNewDrawer}
    <div class="ui-card p-5 sm:p-6">
      <div class="mb-4 border-b border-[#F0E7DD] pb-3">
        <h2 class="font-serif text-base font-bold text-[#231712]">
          Catat Bukti Barang Masuk (Goods Receipt)
        </h2>
      </div>
      {#if data.receivableOrders.length === 0}
        <div
          class="rounded-xl border border-[#EDE4D8] bg-[#FAF7F2] p-4 text-xs text-[#8C7665]"
        >
          Belum ada Purchase Order berstatus ORDERED atau PARTIALLY_RECEIVED.
        </div>
      {:else}
        <form
          method="POST"
          action="?/postReceipt"
          class="grid grid-cols-1 items-end gap-3.5 sm:grid-cols-2 lg:grid-cols-5"
        >
          <div>
            <label
              for="gr-po"
              class="mb-1.5 block text-[11px] font-bold tracking-wider text-[#5A4537] uppercase"
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
                <option value={po.id}>
                  {po.orderNumber} — {po.supplierName}
                </option>
              {/each}
            </select>
          </div>

          <div>
            <label
              for="gr-item"
              class="mb-1.5 block text-[11px] font-bold tracking-wider text-[#5A4537] uppercase"
              >Item Pesanan</label
            >
            <select
              id="gr-item"
              name="purchaseOrderItemId"
              required
              class="ui-select"
            >
              {#if selectedOrder}
                {#each selectedOrder.items.filter((i) => i.remainingQuantity > 0) as item}
                  <option value={item.id}>
                    {item.productName} (Sisa: {item.remainingQuantity}
                    {item.productUnit})
                  </option>
                {/each}
              {/if}
            </select>
          </div>

          <div>
            <label
              for="gr-qty"
              class="mb-1.5 block text-[11px] font-bold tracking-wider text-[#5A4537] uppercase"
              >Kuantitas Diterima</label
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
              class="mb-1.5 block text-[11px] font-bold tracking-wider text-[#5A4537] uppercase"
              >No. Surat Jalan / Catatan</label
            >
            <input
              id="gr-notes"
              type="text"
              name="notes"
              placeholder="Ref surat jalan..."
              class="ui-input"
            />
          </div>

          <button type="submit" class="ui-btn w-full cursor-pointer">
            Simpan Penerimaan
          </button>
        </form>
      {/if}
    </div>
  {/if}

  <!-- Goods Receipts Table Card -->
  <div class="ui-card overflow-hidden">
    <div class="overflow-x-auto">
      <table class="w-full border-collapse text-left text-xs">
        <thead>
          <tr
            class="border-b border-[#EDE4D8] bg-[#FAF7F2] text-[10px] font-bold tracking-wider text-[#8C7665] uppercase"
          >
            <th class="px-5 py-3.5">No. GR</th>
            <th class="px-5 py-3.5">Ref. PO</th>
            <th class="px-5 py-3.5">Gudang Tujuan</th>
            <th class="px-5 py-3.5">Petugas Penerima</th>
            <th class="px-5 py-3.5">Item Masuk</th>
            <th class="px-5 py-3.5 text-right">Waktu Catat</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-[#F5EDE4]">
          {#each data.goodsReceipts as gr}
            <tr class="transition hover:bg-[#FAF7F2]">
              <td class="px-5 py-4 font-mono text-xs font-bold text-[#5A3825]">
                {gr.receiptNumber}
              </td>
              <td class="px-5 py-4 font-mono text-xs text-[#6A574A]">
                {gr.purchaseOrderNumber}
              </td>
              <td class="px-5 py-4 font-semibold text-[#2E1F16]">
                {gr.warehouseName}
              </td>
              <td class="px-5 py-4 text-[#6A574A]">{gr.receiverName}</td>
              <td class="px-5 py-4">
                {#each gr.items as item}
                  <div class="text-xs text-[#2E1F16] tabular-nums">
                    <span class="font-medium">{item.productName}</span>
                    <span class="ml-1.5 font-mono font-bold text-[#1D593B]">
                      +{item.quantityReceived}
                      {item.productUnit}
                    </span>
                  </div>
                {/each}
              </td>
              <td
                class="px-5 py-4 text-right font-mono text-[11px] text-[#8C7665]"
              >
                {new Date(gr.receivedAt).toLocaleString()}
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </div>
</div>
