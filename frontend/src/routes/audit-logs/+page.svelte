<script lang="ts">
  import { getDictionary } from "@/lib/i18n";
  import type { AuditLogsPageData } from "@/routes/audit-logs/+page.server";

  let { data }: { data: AuditLogsPageData } = $props();
  let dict = $derived(getDictionary(data.lang));
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
      class="flex flex-wrap items-center gap-2"
    >
      <div class="w-44">
        <select name="entityType" class="ui-select">
          <option value="">{dict.allEntities}</option>
          {#each ["USER", "PRODUCT", "SUPPLIER", "WAREHOUSE", "PURCHASE_REQUEST", "PURCHASE_ORDER", "GOODS_RECEIPT"] as entity}
            <option value={entity} selected={data.entityType === entity}>
              {entity}
            </option>
          {/each}
        </select>
      </div>

      <div class="w-52">
        <input
          type="text"
          name="search"
          value={data.search}
          placeholder={dict.searchActor}
          class="ui-input"
        />
      </div>

      <button type="submit" class="ui-btn cursor-pointer">{dict.filter}</button>
    </form>
  </div>

  <!-- Audit Table Card -->
  <div class="ui-card overflow-hidden">
    <div class="overflow-x-auto">
      <table class="w-full border-collapse text-left text-xs">
        <thead>
          <tr
            class="border-b border-[#EDE4D8] bg-[#FAF7F2] text-[10px] font-bold tracking-wider text-[#8C7665] uppercase"
          >
            <th class="px-5 py-3.5">{dict.action}</th>
            <th class="px-5 py-3.5">{dict.moduleEntity}</th>
            <th class="px-5 py-3.5">{dict.summary}</th>
            <th class="px-5 py-3.5">{dict.operator}</th>
            <th class="px-5 py-3.5 text-right">{dict.timestamp}</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-[#F5EDE4]">
          {#each data.logs as log}
            <tr class="transition hover:bg-[#FAF7F2]">
              <td class="px-5 py-3.5">
                <span
                  class="rounded-full border border-[#E0D5C7] bg-[#FAF4ED] px-2.5 py-0.5 font-mono text-[10px] font-bold text-[#5A3825]"
                >
                  {log.action}
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
  </div>
</div>
