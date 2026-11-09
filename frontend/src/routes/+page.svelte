<script lang="ts">
  import { getDictionary } from "@/lib/i18n";
  import type { DashboardPageData } from "@/routes/+page.server";

  let { data }: { data: DashboardPageData } = $props();
  let dict = $derived(getDictionary(data.lang));

  const weeklyVolume = [
    { day: "Sen", value: 12.4, height: "55%", active: false },
    { day: "Sel", value: 15.8, height: "70%", active: false },
    { day: "Rab", value: 19.2, height: "85%", active: false },
    { day: "Kam", value: 14.7, height: "65%", active: true },
    { day: "Jum", value: 22.0, height: "100%", active: false },
    { day: "Sab", value: 17.5, height: "78%", active: false },
    { day: "Min", value: 10.2, height: "45%", active: false },
  ];
</script>

<div class="space-y-6">
  <!-- Top Espresso Banner (Figma Screen 1) -->
  <div
    class="flex flex-col gap-4 rounded-2xl border border-[#523323] bg-gradient-to-r from-[#2C1E18] to-[#4A2D1D] p-5 text-white shadow-md sm:p-7 md:flex-row md:items-center md:justify-between"
  >
    <div>
      <div
        class="mb-1.5 flex items-center justify-between gap-2 text-[11px] font-semibold tracking-wider text-[#D8A57A] uppercase sm:justify-start"
      >
        <span>Sistem Manajemen Pengadaan &amp; Stok</span>
        <span class="opacity-60">•</span>
        <span
          class="shrink-0 rounded-full border border-[#7A4D33] bg-[#5A3825] px-2.5 py-0.5 text-[10px] font-bold whitespace-nowrap text-white"
        >
          Role: {data.user.role}
        </span>
      </div>
      <h1
        class="font-serif text-xl font-bold tracking-tight text-white sm:text-2xl"
      >
        Selamat Datang di CafeStock, {data.user.name}
      </h1>
      <p
        class="mt-1 max-w-2xl text-xs leading-relaxed text-[#D7CBC1] sm:text-sm"
      >
        Platform terpusat untuk alur Purchase Request, Approval, Purchase Order,
        hingga pencatatan Goods Receipt dan saldo stok gudang yang konsisten.
      </p>
    </div>

    <div class="flex shrink-0 items-center gap-2.5">
      <a
        href="/purchase-requests"
        class="flex items-center gap-2 rounded-xl bg-[#C68B59] px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-[#B37948] active:bg-[#9B6437]"
      >
        <svg
          class="h-4 w-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path
            d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
          />
          <polyline points="14 2 14 8 20 8" />
          <line x1="12" y1="18" x2="12" y2="12" />
          <line x1="9" y1="15" x2="15" y2="15" />
        </svg>
        <span>
          {data.user.role === "APPROVER"
            ? `Tinjau ${data.pendingPrCount} Permintaan`
            : "+ Buat Purchase Request"}
        </span>
      </a>
    </div>
  </div>

  <!-- 4 Figma KPI Cards -->
  <div class="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
    <!-- Card 1: Total Master Produk -->
    <a
      href="/master"
      class="group flex flex-col justify-between rounded-2xl border border-[#EDE4D8] bg-white p-4 shadow-xs transition hover:border-[#D5C5B5] sm:p-5"
    >
      <div class="flex items-start justify-between gap-2">
        <div
          class="text-[10px] leading-tight font-bold tracking-wider text-[#8C7665] uppercase sm:text-[11px]"
        >
          Total Master Produk
        </div>
        <div
          class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#F7F2EB] text-[#5A3825] transition group-hover:scale-105 sm:h-10 sm:w-10"
        >
          <svg
            class="h-4 w-4 sm:h-5 sm:w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"
            />
            <path d="m3.3 7 8.7 5 8.7-5" />
            <path d="M12 22V12" />
          </svg>
        </div>
      </div>
      <div class="mt-2.5">
        <div
          class="truncate text-lg font-bold text-[#2E1F16] transition group-hover:text-[#5A3825] sm:text-2xl"
        >
          {data.totalActiveProducts} SKU
        </div>
        <div
          class="mt-1 flex items-center gap-1 truncate text-[10px] font-medium text-[#2E7D32] sm:text-[11px]"
        >
          <svg
            class="h-3 w-3 shrink-0"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
          >
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
          <span class="truncate">Semua aktif di transaksi</span>
        </div>
      </div>
    </a>

    <!-- Card 2: PR Perlu Review -->
    <a
      href="/purchase-requests?status=SUBMITTED"
      class="group flex flex-col justify-between rounded-2xl border border-[#EDE4D8] bg-white p-4 shadow-xs transition hover:border-[#D5C5B5] sm:p-5"
    >
      <div class="flex items-start justify-between gap-2">
        <div
          class="text-[10px] leading-tight font-bold tracking-wider text-[#8C7665] uppercase sm:text-[11px]"
        >
          PR Perlu Review
        </div>
        <div
          class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#FFF8E1] text-[#D97706] transition group-hover:scale-105 sm:h-10 sm:w-10"
        >
          <svg
            class="h-4 w-4 sm:h-5 sm:w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
            />
            <polyline points="14 2 14 8 20 8" />
            <line x1="8" y1="13" x2="16" y2="13" />
            <line x1="8" y1="17" x2="13" y2="17" />
          </svg>
        </div>
      </div>
      <div class="mt-2.5">
        <div
          class="truncate text-lg font-bold text-[#2E1F16] transition group-hover:text-[#B45309] sm:text-2xl"
        >
          {data.pendingPrCount} Pengajuan
        </div>
        <div
          class="mt-1 flex items-center gap-1 truncate text-[10px] font-medium text-[#D97706] sm:text-[11px]"
        >
          <svg
            class="h-3 w-3 shrink-0"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
          >
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          <span class="truncate">Status SUBMITTED</span>
        </div>
      </div>
    </a>

    <!-- Card 3: PO Aktif / Penerimaan -->
    <a
      href="/purchase-orders"
      class="group flex flex-col justify-between rounded-2xl border border-[#EDE4D8] bg-white p-4 shadow-xs transition hover:border-[#D5C5B5] sm:p-5"
    >
      <div class="flex items-start justify-between gap-2">
        <div
          class="text-[10px] leading-tight font-bold tracking-wider text-[#8C7665] uppercase sm:text-[11px]"
        >
          PO Aktif / Penerimaan
        </div>
        <div
          class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#F7F2EB] text-[#5A3825] transition group-hover:scale-105 sm:h-10 sm:w-10"
        >
          <svg
            class="h-4 w-4 sm:h-5 sm:w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <circle cx="8" cy="21" r="1" />
            <circle cx="19" cy="21" r="1" />
            <path
              d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"
            />
          </svg>
        </div>
      </div>
      <div class="mt-2.5">
        <div
          class="truncate text-lg font-bold text-[#2E1F16] transition group-hover:text-[#5A3825] sm:text-2xl"
        >
          {data.activePoCount} Pesanan
        </div>
        <div
          class="mt-1 flex items-center gap-1 truncate text-[10px] font-medium text-[#5A3825] sm:text-[11px]"
        >
          <svg
            class="h-3 w-3 shrink-0"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
          >
            <path d="M10 17h4V5H2v12h3" />
            <path d="M20 17h2v-3.34a4 4 0 0 0-1.17-2.83L19 9h-5v8h1" />
            <circle cx="7.5" cy="17.5" r="2.5" />
            <circle cx="17.5" cy="17.5" r="2.5" />
          </svg>
          <span class="truncate">ORDERED / PARTIAL</span>
        </div>
      </div>
    </a>

    <!-- Card 4: Stok Kritis Gudang -->
    <a
      href="/inventory?lowStock=true"
      class="group flex flex-col justify-between rounded-2xl border border-[#EDE4D8] bg-white p-4 shadow-xs transition hover:border-[#D5C5B5] sm:p-5"
    >
      <div class="flex items-start justify-between gap-2">
        <div
          class="text-[10px] leading-tight font-bold tracking-wider text-[#8C7665] uppercase sm:text-[11px]"
        >
          Stok Kritis Gudang
        </div>
        <div
          class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#FFEBEE] text-[#C62828] transition group-hover:scale-105 sm:h-10 sm:w-10"
        >
          <svg
            class="h-4 w-4 sm:h-5 sm:w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <polygon points="12 2 2 7 12 12 22 7 12 2" />
            <polyline points="2 17 12 22 22 17" />
            <polyline points="2 12 12 17 22 12" />
          </svg>
        </div>
      </div>
      <div class="mt-2.5">
        <div class="truncate text-lg font-bold text-[#C62828] sm:text-2xl">
          {data.lowStockCount} Item
        </div>
        <div
          class="mt-1 flex items-center gap-1 truncate text-[10px] font-medium text-[#C62828] sm:text-[11px]"
        >
          <svg
            class="h-3 w-3 shrink-0"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
          >
            <path
              d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"
            />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          <span class="truncate">Saldo di bawah batas min</span>
        </div>
      </div>
    </a>
  </div>

  <!-- Middle Section: Weekly Incoming Volume Chart & Critical Stock Alert Widget -->
  <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
    <!-- Left 2 Cols: Weekly Volume Bar Chart (Figma Screen 2) -->
    <div
      class="rounded-2xl border border-[#EDE4D8] bg-white p-5 shadow-xs sm:p-6 lg:col-span-2"
    >
      <div
        class="mb-5 flex flex-col justify-between gap-3 border-b border-[#F0E7DD] pb-4 sm:flex-row sm:items-center"
      >
        <div>
          <div
            class="text-[10px] font-bold tracking-wider text-[#8C7665] uppercase sm:text-xs"
          >
            Aktivitas Pengadaan
          </div>
          <h2 class="mt-0.5 text-sm font-bold text-[#2E1F16] sm:text-base">
            Volume Bahan Baku Masuk
            <span class="text-xs font-normal whitespace-nowrap text-[#8A7566]">
              (Minggu Ini)
            </span>
          </h2>
        </div>
        <div
          class="flex items-baseline justify-between gap-1.5 sm:flex-col sm:items-end sm:justify-center sm:gap-0"
        >
          <div
            class="text-lg font-bold whitespace-nowrap text-[#2E1F16] sm:text-xl"
          >
            101.9 KG
          </div>
          <div
            class="flex items-center gap-1 text-[10px] font-semibold whitespace-nowrap text-[#2E7D32] sm:text-xs"
          >
            <svg
              class="h-3.5 w-3.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
              <polyline points="16 7 22 7 22 13" />
            </svg>
            <span>+14% vs minggu lalu</span>
          </div>
        </div>
      </div>

      <div
        class="flex h-44 items-end justify-between gap-2 px-2 pt-6 pb-2 sm:h-52 sm:gap-4"
      >
        {#each weeklyVolume as item}
          <div
            class="group flex h-full flex-1 flex-col items-center justify-end gap-2"
          >
            <div
              class="text-[10px] font-bold text-[#8C7665] opacity-0 transition group-hover:opacity-100"
            >
              {item.value} kg
            </div>
            <div
              class="relative flex h-full w-full max-w-[36px] items-end overflow-hidden rounded-t-lg bg-[#EDE4D8]"
            >
              <div
                style="height: {item.height}"
                class="w-full rounded-t-lg transition-all duration-300 {item.active
                  ? 'bg-[#5A3825] shadow-md'
                  : 'bg-[#C68B59] hover:bg-[#A86F3E]'}"
              ></div>
            </div>
            <div
              class="text-xs font-semibold {item.active
                ? 'font-bold text-[#5A3825]'
                : 'text-[#8A7566]'}"
            >
              {item.day}
            </div>
          </div>
        {/each}
      </div>
    </div>

    <!-- Right 1 Col: Critical Stock Widget -->
    <div
      class="flex flex-col justify-between rounded-2xl border border-[#EDE4D8] bg-white p-5 shadow-xs sm:p-6"
    >
      <div>
        <div
          class="mb-4 flex items-center justify-between border-b border-[#F0E7DD] pb-4"
        >
          <div>
            <div
              class="flex items-center gap-1.5 text-xs font-bold tracking-wider text-[#C62828] uppercase"
            >
              <svg
                class="h-3.5 w-3.5 text-[#C62828]"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path
                  d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"
                />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              <span>Perhatian Stok</span>
            </div>
            <h3 class="mt-0.5 text-base font-bold text-[#2E1F16]">
              Bahan Kritis / Menipis
            </h3>
          </div>
          <span
            class="rounded-full bg-[#FFEBEE] px-2.5 py-0.5 text-xs font-bold text-[#C62828]"
          >
            {data.lowStockCount} SKU
          </span>
        </div>

        {#if data.lowStockBalances.length === 0}
          <div
            class="rounded-xl border border-[#EDE4D8] bg-[#FAF7F2] p-4 text-center text-xs text-[#8C7665]"
          >
            Seluruh stok gudang berada di atas batas minimum.
          </div>
        {:else}
          <div class="space-y-3">
            {#each data.lowStockBalances.slice(0, 4) as item}
              <div
                class="rounded-xl border border-[#F3E7DC] bg-[#FCFAF7] p-3 transition hover:border-[#D5C5B5]"
              >
                <div class="flex items-center justify-between gap-2">
                  <span class="truncate text-xs font-bold text-[#2E1F16]">
                    {item.productName}
                  </span>
                  <span
                    class="shrink-0 rounded border border-[#FFCDD2] bg-[#FFEBEE] px-1.5 py-0.5 text-[10px] font-bold text-[#C62828]"
                  >
                    Kritis
                  </span>
                </div>
                <div
                  class="mt-2 flex items-center justify-between text-[11px] text-[#7A685B]"
                >
                  <span class="text-[10px] text-[#8C7665]">
                    {item.warehouseName}
                  </span>
                  <span class="font-mono font-bold text-[#C62828]">
                    {item.quantity} / Min {item.minStock}
                    {item.productUnit}
                  </span>
                </div>
              </div>
            {/each}
          </div>
        {/if}
      </div>

      <div class="mt-4 border-t border-[#F0E7DD] pt-4">
        <a
          href="/purchase-requests"
          class="flex w-full items-center justify-center gap-1.5 rounded-xl bg-[#5A3825] px-3 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-[#432718]"
        >
          <span>+ Buat Permintaan Pembelian</span>
          <svg
            class="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M7 17 17 7" />
            <path d="M7 7h10v10" />
          </svg>
        </a>
      </div>
    </div>
  </div>

  <!-- Bottom Section: Recent Movements & Audit History (Figma Screen 2) -->
  <div
    class="rounded-2xl border border-[#EDE4D8] bg-white p-5 shadow-xs sm:p-6"
  >
    <div
      class="mb-4 flex flex-col justify-between gap-3 border-b border-[#F0E7DD] pb-4 sm:flex-row sm:items-center"
    >
      <div>
        <div class="text-xs font-bold tracking-wider text-[#8C7665] uppercase">
          Riwayat Sistem
        </div>
        <h3 class="mt-0.5 text-base font-bold text-[#2E1F16]">
          Mutasi &amp; Aktivitas Pengadaan Terkini
        </h3>
      </div>
      <div class="text-xs text-[#8C7665]">
        Siklus: PR &rarr; Approval &rarr; PO &rarr; Goods Receipt
      </div>
    </div>

    <div class="-mx-5 overflow-x-auto sm:mx-0">
      <table class="w-full border-collapse text-left text-xs">
        <thead>
          <tr
            class="border-b border-[#EDE4D8] text-[10px] font-bold tracking-wider text-[#8C7665] uppercase"
          >
            <th class="px-4 py-3">Aksi / Modul</th>
            <th class="px-4 py-3">Ringkasan Transaksi</th>
            <th class="px-4 py-3">Petugas</th>
            <th class="px-4 py-3 text-right">Waktu</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-[#F5EDE4]">
          {#each data.recentAudits as log}
            <tr class="text-[#2E1F16] transition hover:bg-[#FAF7F2]">
              <td class="px-4 py-3 whitespace-nowrap">
                <span
                  class="rounded-full border border-[#E0D5C7] bg-[#FAF4ED] px-2.5 py-0.5 font-mono text-[10px] font-bold text-[#5A3825]"
                >
                  {log.action}
                </span>
                <span class="ml-1.5 font-mono text-[10px] text-[#8C7665]">
                  {log.entityType}
                </span>
              </td>
              <td class="px-4 py-3 font-medium text-[#2E1F16]">
                {log.summary}
              </td>
              <td class="px-4 py-3 text-[#6A574A]">
                {log.actorName}
                <span class="font-mono text-[10px] text-[#8C7665]"
                  >({log.actorRole})</span
                >
              </td>
              <td
                class="px-4 py-3 text-right font-mono text-[11px] whitespace-nowrap text-[#8C7665]"
              >
                {new Date(log.createdAt).toLocaleString()}
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </div>
</div>
