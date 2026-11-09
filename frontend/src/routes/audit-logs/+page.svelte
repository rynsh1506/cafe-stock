<script lang="ts">
  import { getDictionary } from "@/lib/i18n";
  import type { AuditLogsPageData } from "@/routes/audit-logs/+page.server";

  let { data }: { data: AuditLogsPageData } = $props();
  let dict = $derived(getDictionary(data.lang));
</script>

<div class="space-y-6">
  <div class="flex flex-wrap items-center justify-between gap-4">
    <h1 class="text-xl font-bold text-stone-900">{dict.auditTitle}</h1>

    <form method="GET" action="/audit-logs" class="flex flex-wrap gap-2">
      <select
        name="entityType"
        class="rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-xs"
      >
        <option value="">All Entities</option>
        {#each ["USER", "PRODUCT", "SUPPLIER", "WAREHOUSE", "PURCHASE_REQUEST", "PURCHASE_ORDER", "GOODS_RECEIPT"] as entity}
          <option value={entity} selected={data.entityType === entity}
            >{entity}</option
          >
        {/each}
      </select>

      <input
        type="text"
        name="search"
        value={data.search}
        placeholder="Search actor or summary..."
        class="rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-xs"
      />

      <button
        type="submit"
        class="rounded-lg bg-stone-800 px-3 py-1.5 text-xs font-semibold text-white"
      >
        Filter
      </button>
    </form>
  </div>

  <section class="rounded-xl border border-stone-200 bg-white p-5 shadow-xs">
    <div class="overflow-x-auto">
      <table class="w-full text-left text-xs">
        <thead>
          <tr class="border-b border-stone-200 text-stone-500">
            <th class="pb-2.5 font-semibold">Timestamp</th>
            <th class="pb-2.5 font-semibold">Actor</th>
            <th class="pb-2.5 font-semibold">Entity</th>
            <th class="pb-2.5 font-semibold">Action</th>
            <th class="pb-2.5 font-semibold">Summary</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-stone-100">
          {#each data.logs as log}
            <tr>
              <td class="py-2.5 text-stone-500"
                >{new Date(log.createdAt).toLocaleString()}</td
              >
              <td class="py-2.5 font-medium text-stone-800">
                {log.actorName}
                <span
                  class="ml-1 rounded bg-stone-100 px-1.5 py-0.5 text-[10px] font-bold text-stone-600"
                  >{log.actorRole}</span
                >
              </td>
              <td class="py-2.5 font-mono text-[11px] text-stone-600"
                >{log.entityType}</td
              >
              <td class="py-2.5">
                <span
                  class="rounded bg-amber-100 px-2 py-0.5 font-mono text-[11px] font-bold text-amber-900"
                  >{log.action}</span
                >
              </td>
              <td class="py-2.5 text-stone-800">{log.summary}</td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </section>
</div>
