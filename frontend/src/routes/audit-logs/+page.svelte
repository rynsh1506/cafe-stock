<script lang="ts">
  import { getDictionary } from "@/lib/i18n";
  import CustomSelect from "@/lib/components/CustomSelect.svelte";
  import Pagination from "@/lib/components/Pagination.svelte";
  import type { AuditLogsPageData } from "@/routes/audit-logs/+page.server";

  let { data }: { data: AuditLogsPageData } = $props();
  let dict = $derived(getDictionary(data.lang));

  let entityOptions = $derived([
    { value: "", label: dict.allEntities },
    ...[
      "USER",
      "PRODUCT",
      "SUPPLIER",
      "WAREHOUSE",
      "PURCHASE_REQUEST",
      "PURCHASE_ORDER",
      "GOODS_RECEIPT",
    ].map((e) => ({
      value: e,
      label: e,
    })),
  ]);
  let selectedEntity = $state("");
  $effect(() => {
    selectedEntity = data.entityType || "";
  });
</script>

<div class="space-y-6">
  <!-- Header & Filter Bar -->
  <div class="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
    <div>
      <h1 class="font-serif text-2xl font-bold tracking-tight text-[#231712]">
        {dict.navAuditLogs}
      </h1>
      <p class="mt-0.5 text-xs text-[#7D6B5D]">
        {dict.auditSubtitle}
      </p>
    </div>

    <form
      method="GET"
      action="/audit-logs"
      class="flex flex-col sm:flex-row sm:items-center gap-2.5 w-full sm:w-auto"
    >
      <div class="w-full sm:w-48">
        <CustomSelect
          name="entityType"
          bind:value={selectedEntity}
          options={entityOptions}
          placeholder={dict.allEntities}
        />
      </div>

      <div class="flex items-center gap-2 w-full sm:w-auto">
        <input
          type="text"
          name="search"
          value={data.search}
          placeholder={dict.searchActor}
          class="ui-input flex-1 sm:w-56"
        />
        <button type="submit" class="ui-btn cursor-pointer px-4 shrink-0"
          >{dict.filter}</button
        >
      </div>
    </form>
  </div>

  <!-- Audit Table Card -->
  <div class="ui-card overflow-hidden">
    <div
      class="flex items-center justify-between border-b border-[#EDE4D8] bg-[#FAF7F2] px-4 py-1.5 text-[11px] font-medium text-[#8C7665] sm:hidden"
    >
      <span>← Geser tabel untuk jejak audit lengkap →</span>
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
            <th class="px-5 py-3.5">{dict.action}</th>
            <th class="px-5 py-3.5">{dict.moduleEntity}</th>
            <th class="px-5 py-3.5">{dict.summary}</th>
            <th class="px-5 py-3.5">{dict.operator}</th>
            <th class="px-5 py-3.5 text-right">{dict.timestamp}</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-[#F5EDE4] whitespace-nowrap">
          {#each data.logs as log}
            <tr class="transition hover:bg-[#FAF7F2]">
              <td class="px-5 py-3.5">
                <span
                  class="ui-badge border-[#E0D5C7] bg-[#FAF4ED] text-[#5A3825] text-[10px]"
                >
                  <span class="ui-badge-dot bg-[#5A3825]"></span>
                  <span>{log.action}</span>
                </span>
              </td>
              <td class="px-5 py-3.5 font-mono text-[11px] text-[#6A574A]">
                {log.entityType}
              </td>
              <td class="px-5 py-3.5 font-medium text-[#2E1F16]">
                {log.summary}
              </td>
              <td class="px-5 py-3.5 text-[#6A574A]">
                {log.actorName}
                <span class="font-mono text-[10px] text-[#8C7665]"
                  >({log.actorRole})</span
                >
              </td>
              <td
                class="px-5 py-3.5 text-right font-mono text-[11px] text-[#8C7665]"
              >
                {new Date(log.createdAt).toLocaleString()}
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>

    <!-- Table Pagination -->
    <Pagination
      page={data.pagination.page}
      limit={data.pagination.limit}
      total={data.pagination.total}
      totalPages={data.pagination.totalPages}
    />
  </div>
</div>
