<script lang="ts">
  import { getDictionary } from "@/lib/i18n";
  import type { AuditLogsPageData } from "@/routes/audit-logs/+page.server";

  let { data }: { data: AuditLogsPageData } = $props();
  let dict = $derived(getDictionary(data.lang));
</script>

<div class="space-y-8">
  <!-- Header & Filter Bar -->
  <div class="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
    <div>
      <div class="text-[12px] font-medium text-[#86868B]">
        Immutable Compliance & Security Event Log
      </div>
      <h1
        class="mt-1 text-2xl font-semibold tracking-tight text-[#1D1D1F] sm:text-[28px]"
      >
        {dict.auditTitle}
      </h1>
    </div>

    <form
      method="GET"
      action="/audit-logs"
      class="flex flex-wrap items-center gap-2"
    >
      <select name="entityType" class="apple-input px-3.5 py-2 text-[13px]">
        <option value="">All Entities</option>
        {#each ["USER", "PRODUCT", "SUPPLIER", "WAREHOUSE", "PURCHASE_REQUEST", "PURCHASE_ORDER", "GOODS_RECEIPT"] as entity}
          <option value={entity} selected={data.entityType === entity}>
            {entity}
          </option>
        {/each}
      </select>

      <input
        type="text"
        name="search"
        value={data.search}
        placeholder="Search actor or summary..."
        class="apple-input px-3.5 py-2 text-[13px] sm:w-56"
      />

      <button
        type="submit"
        class="apple-btn-primary cursor-pointer px-4 py-2 text-[13px]"
      >
        Filter
      </button>
    </form>
  </div>

  <!-- Audit List Card -->
  <section class="apple-card overflow-hidden">
    <div class="divide-y divide-black/[0.05]">
      {#each data.logs as log}
        <div
          class="flex flex-col justify-between gap-2 px-5 py-4 transition hover:bg-[#F5F5F7]/60 sm:flex-row sm:items-center sm:px-6"
        >
          <div class="min-w-0 space-y-1">
            <div class="flex flex-wrap items-center gap-2">
              <span class="h-1.5 w-1.5 rounded-full bg-[#1D1D1F]"></span>
              <span class="font-mono text-[11px] font-semibold text-[#1D1D1F]">
                {log.action}
              </span>
              <span class="text-[#D2D2D7]">·</span>
              <span class="font-mono text-[11px] text-[#86868B]">
                {log.entityType}
              </span>
            </div>
            <div class="text-[13px] font-medium text-[#1D1D1F]">
              {log.summary}
            </div>
            <div class="text-[12px] text-[#86868B]">
              {log.actorName} ({log.actorRole})
            </div>
          </div>

          <div class="shrink-0 font-mono text-[11px] text-[#86868B]">
            {new Date(log.createdAt).toLocaleString()}
          </div>
        </div>
      {/each}
    </div>
  </section>
</div>
