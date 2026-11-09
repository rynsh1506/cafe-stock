<script lang="ts">
  import { getDictionary } from "@/lib/i18n";
  import type { AuditLogsPageData } from "@/routes/audit-logs/+page.server";

  let { data }: { data: AuditLogsPageData } = $props();
  let dict = $derived(getDictionary(data.lang));
</script>

<div>
  <!-- Toolbar -->
  <div
    class="flex flex-wrap items-center justify-between gap-3 border-b border-[#EDEDED] px-5 py-3 sm:px-6"
  >
    <div class="flex items-center gap-2.5">
      <h1 class="text-[15px] font-semibold tracking-tight text-[#111]">
        {dict.navAuditLogs}
      </h1>
      <span class="font-mono text-[11px] text-[#777]">
        {data.logs.length} events
      </span>
    </div>

    <form
      method="GET"
      action="/audit-logs"
      class="flex flex-wrap items-center gap-2"
    >
      <div class="w-44">
        <select name="entityType" class="ui-select">
          <option value="">All Entities</option>
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
          placeholder="Search actor or summary..."
          class="ui-input"
        />
      </div>

      <button type="submit" class="ui-btn-outline cursor-pointer">
        Filter
      </button>
    </form>
  </div>

  <!-- Desktop Table -->
  <div class="hidden overflow-x-auto md:block">
    <table class="w-full text-left text-[13px]">
      <thead>
        <tr
          class="border-b border-[#EDEDED] bg-[#FAFAFA] text-[11px] font-medium text-[#777]"
        >
          <th class="px-5 py-2.5 sm:px-6">Action</th>
          <th class="px-5 py-2.5 sm:px-6">Entity</th>
          <th class="px-5 py-2.5 sm:px-6">Summary</th>
          <th class="px-5 py-2.5 sm:px-6">Actor</th>
          <th class="px-5 py-2.5 text-right sm:px-6">Timestamp</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-[#F2F2F2]">
        {#each data.logs as log}
          <tr class="hover:bg-[#FAFAFA]">
            <td
              class="px-5 py-2.5 font-mono text-[11px] font-semibold text-[#111] sm:px-6"
            >
              {log.action}
            </td>
            <td class="px-5 py-2.5 font-mono text-[11px] text-[#666] sm:px-6">
              {log.entityType}
            </td>
            <td class="px-5 py-2.5 text-[#111] sm:px-6">
              {log.summary}
            </td>
            <td class="px-5 py-2.5 text-[12px] text-[#555] sm:px-6">
              {log.actorName}
              <span class="font-mono text-[11px] text-[#888]"
                >({log.actorRole})</span
              >
            </td>
            <td
              class="px-5 py-2.5 text-right font-mono text-[11px] text-[#777] sm:px-6"
            >
              {new Date(log.createdAt).toLocaleString()}
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>

  <!-- Mobile List -->
  <div class="divide-y divide-[#EDEDED] md:hidden">
    {#each data.logs as log}
      <div class="space-y-1 px-5 py-3">
        <div class="flex items-center justify-between gap-2">
          <span class="font-mono text-[11px] font-semibold text-[#111]">
            {log.action} · {log.entityType}
          </span>
          <span class="font-mono text-[11px] text-[#777]">
            {new Date(log.createdAt).toLocaleDateString()}
          </span>
        </div>
        <div class="text-[13px] text-[#111]">{log.summary}</div>
        <div class="text-[11px] text-[#777]">
          {log.actorName} ({log.actorRole})
        </div>
      </div>
    {/each}
  </div>
</div>
