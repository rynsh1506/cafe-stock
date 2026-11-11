<script lang="ts">
  import { page as pageState } from "$app/state";

  interface Props {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
    pageParam?: string;
    limitParam?: string;
  }

  let {
    page = 1,
    limit = 10,
    total = 0,
    totalPages = 1,
    pageParam = "page",
    limitParam = "limit",
  }: Props = $props();

  let fromItem = $derived(total === 0 ? 0 : (page - 1) * limit + 1);
  let toItem = $derived(Math.min(page * limit, total));

  function buildUrl(targetPage: number, targetLimit?: number): string {
    const currentUrl = new URL(pageState.url.href);
    currentUrl.searchParams.set(pageParam, String(targetPage));
    if (targetLimit) {
      currentUrl.searchParams.set(limitParam, String(targetLimit));
    }
    return currentUrl.pathname + currentUrl.search;
  }

  let pageNumbers = $derived.by(() => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (page <= 4) {
      return [1, 2, 3, 4, 5, "...", totalPages];
    }
    if (page >= totalPages - 3) {
      return [
        1,
        "...",
        totalPages - 4,
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      ];
    }
    return [1, "...", page - 1, page, page + 1, "...", totalPages];
  });
</script>

<div
  class="flex flex-col items-center justify-between gap-3 border-t border-[#EDE4D8] bg-[#FAF7F2] px-4 py-3 sm:flex-row sm:px-6"
>
  <!-- Summary Stats -->
  <div class="text-xs text-[#7A6453]">
    {#if total === 0}
      <span>Tidak ada data untuk ditampilkan</span>
    {:else}
      <span>
        Menampilkan <strong class="font-mono font-bold text-[#5A3825]"
          >{fromItem}</strong
        >
        –
        <strong class="font-mono font-bold text-[#5A3825]">{toItem}</strong>
        dari
        <strong class="font-mono font-bold text-[#5A3825]">{total}</strong>
        data
      </span>
    {/if}
  </div>

  <!-- Pagination Controls -->
  {#if totalPages > 1}
    <div class="flex items-center gap-1.5">
      <!-- Previous Button -->
      {#if page > 1}
        <a
          href={buildUrl(page - 1)}
          class="flex h-8 items-center justify-center rounded-lg border border-[#D5C5B5] bg-white px-2.5 text-xs font-semibold text-[#5A3825] shadow-2xs transition hover:bg-[#EFE7DE] active:scale-95"
        >
          <svg
            class="mr-1 h-3.5 w-3.5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
          <span class="hidden sm:inline">Sebelumnya</span>
        </a>
      {:else}
        <span
          class="flex h-8 cursor-not-allowed items-center justify-center rounded-lg border border-[#EDE4D8] bg-[#FAF7F2] px-2.5 text-xs font-semibold text-[#B3A193] opacity-60"
        >
          <svg
            class="mr-1 h-3.5 w-3.5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
          <span class="hidden sm:inline">Sebelumnya</span>
        </span>
      {/if}

      <!-- Mobile Compact Indicator -->
      <div
        class="flex h-8 items-center rounded-lg border border-[#D5C5B5] bg-white px-3 font-mono text-xs font-bold text-[#5A3825] sm:hidden"
      >
        {page} / {totalPages}
      </div>

      <!-- Desktop Page Pills -->
      <div class="hidden items-center gap-1 sm:flex">
        {#each pageNumbers as p}
          {#if p === "..."}
            <span class="px-2 text-xs font-bold text-[#8C7665]">...</span>
          {:else if p === page}
            <span
              class="flex h-8 min-w-[32px] items-center justify-center rounded-lg bg-[#5A3825] px-2 font-mono text-xs font-bold text-white shadow-xs"
            >
              {p}
            </span>
          {:else}
            <a
              href={buildUrl(Number(p))}
              class="flex h-8 min-w-[32px] items-center justify-center rounded-lg border border-[#D5C5B5] bg-white px-2 font-mono text-xs font-medium text-[#5A3825] shadow-2xs transition hover:bg-[#EFE7DE] active:scale-95"
            >
              {p}
            </a>
          {/if}
        {/each}
      </div>

      <!-- Next Button -->
      {#if page < totalPages}
        <a
          href={buildUrl(page + 1)}
          class="flex h-8 items-center justify-center rounded-lg border border-[#D5C5B5] bg-white px-2.5 text-xs font-semibold text-[#5A3825] shadow-2xs transition hover:bg-[#EFE7DE] active:scale-95"
        >
          <span class="hidden sm:inline">Berikutnya</span>
          <svg
            class="ml-1 h-3.5 w-3.5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </a>
      {:else}
        <span
          class="flex h-8 cursor-not-allowed items-center justify-center rounded-lg border border-[#EDE4D8] bg-[#FAF7F2] px-2.5 text-xs font-semibold text-[#B3A193] opacity-60"
        >
          <span class="hidden sm:inline">Berikutnya</span>
          <svg
            class="ml-1 h-3.5 w-3.5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </span>
      {/if}
    </div>
  {/if}

  <!-- Page Size Selector -->
  {#if total > 10}
    <div class="hidden items-center gap-1.5 lg:flex">
      <span class="text-[11px] text-[#8C7665]">Per halaman:</span>
      <div
        class="inline-flex rounded-lg border border-[#EDE4D8] bg-white p-0.5 text-[11px]"
      >
        {#each [10, 25, 50] as size}
          <a
            href={buildUrl(1, size)}
            class="rounded-md px-2 py-0.5 font-mono font-semibold transition {limit ===
            size
              ? 'bg-[#5A3825] text-white shadow-2xs'
              : 'text-[#7A6453] hover:text-[#231712]'}"
          >
            {size}
          </a>
        {/each}
      </div>
    </div>
  {/if}
</div>
