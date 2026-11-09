<script lang="ts">
  import type { Snippet } from "svelte";
  import "@/app.css";
  import { getDictionary } from "@/lib/i18n";
  import type { LayoutServerData } from "@/routes/+layout.server";

  let { data, children }: { data: LayoutServerData; children: Snippet } =
    $props();

  let dict = $derived(getDictionary(data.lang));
  let isMobileMenuOpen = $state(false);

  const navItems = $derived([
    { href: "/", label: dict.navDashboard, icon: "grid" },
    { href: "/master", label: dict.navMaster, icon: "box" },
    {
      href: "/purchase-requests",
      label: dict.navPurchaseRequests,
      icon: "file",
    },
    { href: "/purchase-orders", label: dict.navPurchaseOrders, icon: "cart" },
    { href: "/goods-receipts", label: dict.navGoodsReceipts, icon: "check" },
    { href: "/inventory", label: dict.navInventory, icon: "layers" },
    { href: "/audit-logs", label: dict.navAuditLogs, icon: "activity" },
  ]);

  const currentPageLabel = $derived(
    navItems.find((item) => item.href === data.pathname)?.label ??
      dict.navDashboard,
  );
</script>

<svelte:head>
  <title>CafeStock — {currentPageLabel}</title>
</svelte:head>

{#if !data.user}
  <div class="min-h-screen bg-[#FAFAFA] text-[#111113]">
    {@render children()}
  </div>
{:else}
  <div class="flex min-h-screen bg-white text-[#111113] select-none">
    <!-- Desktop Native Sidebar (220px) -->
    <aside
      class="hidden w-[220px] shrink-0 flex-col justify-between border-r border-[#EDEDED] bg-[#FAFAFA] lg:flex"
    >
      <div class="p-3">
        <!-- Workspace Switcher / Brand -->
        <a
          href="/"
          class="mb-4 flex items-center justify-between rounded-[6px] px-2 py-1.5 transition hover:bg-black/[0.04]"
        >
          <div class="flex items-center gap-2">
            <div
              class="flex h-5 w-5 items-center justify-center rounded-[5px] bg-[#111113] text-[10px] font-bold text-white"
            >
              C
            </div>
            <span
              class="text-[13px] font-semibold tracking-tight text-[#111113]"
            >
              CafeStock
            </span>
          </div>
          <span class="font-mono text-[10px] text-[#71717A]">
            {data.user.role}
          </span>
        </a>

        <!-- Flat Navigation List -->
        <nav class="space-y-0.5">
          {#each navItems as item}
            {@const isActive = data.pathname === item.href}
            <a
              href={item.href}
              class="flex items-center gap-2.5 rounded-[6px] px-2.5 py-1.5 text-[13px] transition-colors {isActive
                ? 'bg-black/[0.06] font-medium text-[#111113]'
                : 'text-[#52525B] hover:bg-black/[0.03] hover:text-[#111113]'}"
            >
              <svg
                class="h-3.5 w-3.5 shrink-0 {isActive
                  ? 'text-[#111113]'
                  : 'text-[#71717A]'}"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                {#if item.icon === "grid"}
                  <rect width="7" height="7" x="3" y="3" rx="1" />
                  <rect width="7" height="7" x="14" y="3" rx="1" />
                  <rect width="7" height="7" x="14" y="14" rx="1" />
                  <rect width="7" height="7" x="3" y="14" rx="1" />
                {:else if item.icon === "box"}
                  <path
                    d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"
                  />
                  <path d="m3.3 7 8.7 5 8.7-5" />
                  <path d="M12 22V12" />
                {:else if item.icon === "file"}
                  <path
                    d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"
                  />
                  <path d="M14 2v4a2 2 0 0 0 2 2h4" />
                {:else if item.icon === "cart"}
                  <circle cx="8" cy="21" r="1" />
                  <circle cx="19" cy="21" r="1" />
                  <path
                    d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"
                  />
                {:else if item.icon === "check"}
                  <path d="M20 6 9 17l-5-5" />
                {:else if item.icon === "layers"}
                  <path
                    d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"
                  />
                  <path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65" />
                  <path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65" />
                {:else}
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                {/if}
              </svg>
              <span class="truncate">{item.label}</span>
            </a>
          {/each}
        </nav>
      </div>

      <!-- Bottom Account & Locale Footer -->
      <div class="border-t border-[#EDEDED] p-3 space-y-2.5">
        <form
          method="POST"
          action="/login?/setLang"
          class="ui-tabs flex w-full"
        >
          <input type="hidden" name="redirectTo" value={data.pathname} />
          {#each ["ID", "EN", "JP"] as code}
            <button
              type="submit"
              name="lang"
              value={code}
              class="ui-tab flex-1 cursor-pointer text-center {data.lang ===
              code
                ? 'ui-tab-active'
                : ''}"
            >
              {code}
            </button>
          {/each}
        </form>

        <div class="flex items-center justify-between gap-2 px-1">
          <div class="min-w-0">
            <div class="truncate text-[12px] font-medium text-[#111113]">
              {data.user.name}
            </div>
            <div class="truncate text-[11px] text-[#71717A]">
              {data.user.email}
            </div>
          </div>

          <form method="POST" action="/login?/logout">
            <button
              type="submit"
              title={dict.logout}
              class="cursor-pointer rounded-[5px] px-2 py-1 text-[11px] font-medium text-[#71717A] transition hover:bg-black/[0.05] hover:text-[#111113]"
            >
              {dict.logout}
            </button>
          </form>
        </div>
      </div>
    </aside>

    <!-- Mobile Drawer -->
    {#if isMobileMenuOpen}
      <div class="fixed inset-0 z-50 flex lg:hidden">
        <button
          type="button"
          aria-label="Close menu"
          onclick={() => (isMobileMenuOpen = false)}
          class="fixed inset-0 bg-black/20"
        ></button>

        <div
          class="relative z-10 flex h-full w-[240px] flex-col justify-between border-r border-[#EDEDED] bg-[#FAFAFA] p-3"
        >
          <div>
            <div class="mb-4 flex items-center justify-between px-2 py-1">
              <span class="text-[13px] font-semibold text-[#111113]">
                CafeStock
              </span>
              <button
                type="button"
                onclick={() => (isMobileMenuOpen = false)}
                class="rounded p-1 text-[#71717A] hover:text-[#111113]"
              >
                ✕
              </button>
            </div>

            <nav class="space-y-0.5">
              {#each navItems as item}
                {@const isActive = data.pathname === item.href}
                <a
                  href={item.href}
                  onclick={() => (isMobileMenuOpen = false)}
                  class="flex items-center gap-2.5 rounded-[6px] px-2.5 py-2 text-[13px] {isActive
                    ? 'bg-black/[0.06] font-medium text-[#111113]'
                    : 'text-[#52525B]'}"
                >
                  <span>{item.label}</span>
                </a>
              {/each}
            </nav>
          </div>

          <div class="border-t border-[#EDEDED] pt-3 space-y-2">
            <form
              method="POST"
              action="/login?/setLang"
              class="ui-tabs flex w-full"
            >
              <input type="hidden" name="redirectTo" value={data.pathname} />
              {#each ["ID", "EN", "JP"] as code}
                <button
                  type="submit"
                  name="lang"
                  value={code}
                  class="ui-tab flex-1 text-center {data.lang === code
                    ? 'ui-tab-active'
                    : ''}"
                >
                  {code}
                </button>
              {/each}
            </form>

            <div class="flex items-center justify-between px-1">
              <span class="truncate text-[12px] font-medium text-[#111113]">
                {data.user.name}
              </span>
              <form method="POST" action="/login?/logout">
                <button type="submit" class="ui-btn-outline ui-btn-sm">
                  {dict.logout}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    {/if}

    <!-- Main Content Column -->
    <div class="flex min-w-0 flex-1 flex-col select-text">
      <!-- Mobile Compact Bar -->
      <header
        class="flex h-11 items-center justify-between border-b border-[#EDEDED] bg-white px-4 lg:hidden"
      >
        <div class="flex items-center gap-2.5">
          <button
            type="button"
            onclick={() => (isMobileMenuOpen = true)}
            aria-label="Open menu"
            class="ui-btn-outline ui-btn-sm"
          >
            Menu
          </button>
          <span class="text-[13px] font-semibold text-[#111113]">
            {currentPageLabel}
          </span>
        </div>
        <span class="font-mono text-[11px] text-[#71717A]">
          {data.user.role}
        </span>
      </header>

      <main class="flex-1">
        {@render children()}
      </main>
    </div>
  </div>
{/if}
