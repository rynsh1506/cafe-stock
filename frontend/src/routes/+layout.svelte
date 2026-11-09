<script lang="ts">
  import type { Snippet } from "svelte";
  import "@/app.css";
  import { getDictionary } from "@/lib/i18n";
  import type { LayoutServerData } from "@/routes/+layout.server";

  let { data, children }: { data: LayoutServerData; children: Snippet } =
    $props();

  let dict = $derived(getDictionary(data.lang));

  const navLinks = $derived([
    { href: "/", label: dict.navDashboard },
    { href: "/master", label: dict.navMaster },
    { href: "/purchase-requests", label: dict.navPurchaseRequests },
    { href: "/purchase-orders", label: dict.navPurchaseOrders },
    { href: "/goods-receipts", label: dict.navGoodsReceipts },
    { href: "/inventory", label: dict.navInventory },
    { href: "/audit-logs", label: dict.navAuditLogs },
  ]);
</script>

<svelte:head>
  <title>CafeStock — {dict.brandSubtitle}</title>
</svelte:head>

<div class="min-h-screen bg-stone-50 text-stone-900">
  {#if data.user}
    <header
      class="sticky top-0 z-30 border-b border-stone-200 bg-white/95 backdrop-blur"
    >
      <div
        class="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-3 sm:px-6"
      >
        <div class="flex items-center gap-3">
          <a href="/" class="flex items-center gap-2.5">
            <div
              class="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-800 text-sm font-bold text-white shadow-xs"
            >
              CS
            </div>
            <div>
              <span class="text-base font-bold tracking-tight text-stone-900"
                >CafeStock</span
              >
              <span class="block text-xs text-stone-500"
                >{dict.brandSubtitle}</span
              >
            </div>
          </a>
        </div>

        <nav class="flex flex-wrap items-center gap-1">
          {#each navLinks as item}
            <a
              href={item.href}
              class="rounded-md px-3 py-1.5 text-xs font-medium transition-colors {data.pathname ===
              item.href
                ? 'bg-amber-900 text-white'
                : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'}"
            >
              {item.label}
            </a>
          {/each}
        </nav>

        <div class="flex items-center gap-3">
          <form method="POST" action="/login?/setLang" class="flex gap-1">
            <input type="hidden" name="redirectTo" value={data.pathname} />
            {#each ["ID", "EN", "JP"] as code}
              <button
                type="submit"
                name="lang"
                value={code}
                class="rounded px-2 py-1 text-xs font-semibold transition-colors {data.lang ===
                code
                  ? 'bg-amber-100 text-amber-900 ring-1 ring-amber-300'
                  : 'text-stone-500 hover:bg-stone-100'}"
              >
                {code}
              </button>
            {/each}
          </form>

          <div
            class="hidden items-center gap-2 border-l border-stone-200 pl-3 sm:flex"
          >
            <div class="text-right">
              <div class="text-xs font-semibold text-stone-800">
                {data.user.name}
              </div>
              <div class="text-[11px] text-stone-500">{data.user.email}</div>
            </div>
            <span
              class="rounded-full px-2.5 py-0.5 text-[11px] font-bold {data.user
                .role === 'APPROVER'
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-sky-100 text-sky-800'}"
            >
              {data.user.role}
            </span>
          </div>

          <form method="POST" action="/login?/logout">
            <button
              type="submit"
              class="rounded-md border border-stone-300 bg-white px-3 py-1.5 text-xs font-medium text-stone-700 hover:bg-stone-100"
            >
              {dict.logout}
            </button>
          </form>
        </div>
      </div>
    </header>
  {/if}

  <main class={data.user ? "mx-auto max-w-7xl px-4 py-6 sm:px-6" : ""}>
    {@render children()}
  </main>
</div>
