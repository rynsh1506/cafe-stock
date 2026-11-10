<script lang="ts">
  import "@/app.css";
  import { page } from "$app/state";
  import { getDictionary } from "@/lib/i18n";
  import type { LayoutServerData } from "@/routes/+layout.server";
  import type { Snippet } from "svelte";

  let { data, children }: { data: LayoutServerData; children: Snippet } =
    $props();

  let dict = $derived(getDictionary(data.lang));
  let currentPath = $derived(page.url.pathname);
  let mobileMenuOpen = $state(false);

  $effect(() => {
    void currentPath;
    mobileMenuOpen = false;
  });

  const navItems = $derived([
    {
      href: "/",
      label: dict.navDashboard,
      group: dict.groupOverview,
      icon: "grid",
    },
    {
      href: "/master",
      label: dict.navMaster,
      group: dict.groupMaster,
      icon: "box",
    },
    {
      href: "/purchase-requests",
      label: dict.navPurchaseRequests,
      group: dict.groupProcurement,
      icon: "file",
    },
    {
      href: "/purchase-orders",
      label: dict.navPurchaseOrders,
      group: dict.groupProcurement,
      icon: "cart",
    },
    {
      href: "/goods-receipts",
      label: dict.navGoodsReceipts,
      group: dict.groupWarehouse,
      icon: "truck",
    },
    {
      href: "/inventory",
      label: dict.navInventory,
      group: dict.groupWarehouse,
      icon: "layers",
    },
    {
      href: "/audit-logs",
      label: dict.navAuditLogs,
      group: dict.groupCompliance,
      icon: "shield",
    },
  ]);

  let activeItem = $derived(
    navItems.find((item) => item.href === currentPath) ?? navItems[0],
  );
</script>

<svelte:head>
  <title>CafeStock — {dict.brandSubtitle}</title>
</svelte:head>

{#snippet navIcon(name: string, active: boolean)}
  {#if name === "grid"}
    <svg
      class="h-4 w-4 shrink-0 {active ? 'text-[#F1C89F]' : 'text-[#9E8777]'}"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
    >
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
    </svg>
  {:else if name === "box"}
    <svg
      class="h-4 w-4 shrink-0 {active ? 'text-[#F1C89F]' : 'text-[#9E8777]'}"
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
  {:else if name === "file"}
    <svg
      class="h-4 w-4 shrink-0 {active ? 'text-[#F1C89F]' : 'text-[#9E8777]'}"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="8" y1="13" x2="16" y2="13" />
      <line x1="8" y1="17" x2="13" y2="17" />
    </svg>
  {:else if name === "cart"}
    <svg
      class="h-4 w-4 shrink-0 {active ? 'text-[#F1C89F]' : 'text-[#9E8777]'}"
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
  {:else if name === "truck"}
    <svg
      class="h-4 w-4 shrink-0 {active ? 'text-[#F1C89F]' : 'text-[#9E8777]'}"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
    >
      <path d="M10 17h4V5H2v12h3" />
      <path d="M20 17h2v-3.34a4 4 0 0 0-1.17-2.83L19 9h-5v8h1" />
      <circle cx="7.5" cy="17.5" r="2.5" />
      <circle cx="17.5" cy="17.5" r="2.5" />
    </svg>
  {:else if name === "layers"}
    <svg
      class="h-4 w-4 shrink-0 {active ? 'text-[#F1C89F]' : 'text-[#9E8777]'}"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
    >
      <polygon points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 17 12 22 22 17" />
      <polyline points="2 12 12 17 22 12" />
    </svg>
  {:else}
    <svg
      class="h-4 w-4 shrink-0 {active ? 'text-[#F1C89F]' : 'text-[#9E8777]'}"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  {/if}
{/snippet}

{#if currentPath === "/login" || currentPath === "/setup" || !data.user}
  {@render children()}
{:else}
  <div class="flex h-screen w-full overflow-hidden bg-[#FAF7F2] text-[#2D241E]">
    <!-- Desktop Sidebar (Figma Warm Espresso) -->
    <aside
      class="hidden h-full w-64 shrink-0 flex-col border-r border-[#38261E] bg-[#231712] text-[#EFE8E1] shadow-xl select-none md:flex"
    >
      <!-- Brand Header -->
      <div
        class="flex items-center justify-between border-b border-[#38261E] p-5"
      >
        <div class="flex items-center gap-3">
          <div
            class="flex h-10 w-10 items-center justify-center rounded-xl border border-[#7A4D33] bg-[#5A3825] text-[#E5B589] shadow-inner"
          >
            <svg
              class="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M17 8h1a4 4 0 1 1 0 8h-1" />
              <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z" />
              <line x1="6" y1="2" x2="6" y2="4" />
              <line x1="10" y1="2" x2="10" y2="4" />
              <line x1="14" y1="2" x2="14" y2="4" />
            </svg>
          </div>
          <div>
            <div
              class="flex items-center gap-1.5 font-serif text-lg font-bold tracking-wide text-white"
            >
              <span>CafeStock</span>
            </div>
            <div class="text-[11px] tracking-tight text-[#A69080]">
              {dict.inventoryAndProcurement}
            </div>
          </div>
        </div>
      </div>

      <!-- Navigation Links -->
      <nav class="flex-1 space-y-1.5 overflow-y-auto px-3 py-4">
        <div
          class="px-3 pb-2 text-[10px] font-semibold tracking-wider text-[#8A7566] uppercase"
        >
          {dict.mainNav}
        </div>
        {#each navItems as item}
          {@const isActive = currentPath === item.href}
          <a
            href={item.href}
            class="flex w-full items-center justify-between rounded-lg px-3.5 py-2.5 text-sm font-medium transition-all duration-150 {isActive
              ? 'border border-[#7B4E34] bg-[#5A3825] text-white shadow-md'
              : 'text-[#C4B2A3] hover:bg-[#2F1F18] hover:text-white'}"
          >
            <div class="flex items-center gap-3">
              {@render navIcon(item.icon, isActive)}
              <span>{item.label}</span>
            </div>
          </a>
        {/each}
      </nav>

      <!-- User Footer Profile -->
      <div class="border-t border-[#38261E] bg-[#1E130E]/80 p-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2.5 overflow-hidden">
            <div
              class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#6B4430] bg-[#4A3022] text-xs font-bold text-[#E3B892]"
            >
              {data.user.name
                .split(" ")
                .map((n: string) => n[0])
                .slice(0, 2)
                .join("")}
            </div>
            <div class="truncate">
              <div class="truncate text-xs font-semibold text-white">
                {data.user.name}
              </div>
              <div class="truncate text-[10px] text-[#A69080]">
                {data.user.role === "APPROVER"
                  ? dict.roleManager
                  : dict.roleStaff} &bull; {data.user.email}
              </div>
            </div>
          </div>

          <form method="POST" action="/login?/logout">
            <button
              type="submit"
              class="cursor-pointer rounded-md p-1.5 text-[#9A8474] transition hover:bg-[#341F18] hover:text-[#E57373]"
              title={dict.logout}
            >
              <svg
                class="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </button>
          </form>
        </div>
      </div>
    </aside>

    <!-- Mobile Drawer Overlay -->
    {#if mobileMenuOpen}
      <div class="fixed inset-0 z-50 flex md:hidden">
        <button
          type="button"
          class="fixed inset-0 bg-black/60 backdrop-blur-xs"
          onclick={() => (mobileMenuOpen = false)}
          aria-label="Close navigation drawer"
        ></button>
        <div
          class="relative z-10 flex h-full w-72 max-w-[85vw] flex-col bg-[#231712] text-[#EFE8E1] shadow-2xl"
        >
          <div
            class="flex items-center justify-between border-b border-[#38261E] p-5"
          >
            <div class="flex items-center gap-3">
              <div
                class="flex h-9 w-9 items-center justify-center rounded-xl border border-[#7A4D33] bg-[#5A3825] text-[#E5B589]"
              >
                <svg
                  class="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M17 8h1a4 4 0 1 1 0 8h-1" />
                  <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z" />
                </svg>
              </div>
              <div>
                <div class="font-serif text-base font-bold text-white">
                  CafeStock
                </div>
                <div class="text-[10px] text-[#A69080]">
                  {dict.inventoryAndProcurement}
                </div>
              </div>
            </div>
            <button
              type="button"
              onclick={() => (mobileMenuOpen = false)}
              class="rounded-lg p-1.5 text-[#CDB8A6] hover:bg-[#341F18]"
              aria-label="Close drawer"
            >
              <svg
                class="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          <nav class="flex-1 space-y-1.5 overflow-y-auto px-3 py-4">
            {#each navItems as item}
              {@const isActive = currentPath === item.href}
              <a
                href={item.href}
                class="flex w-full items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-medium {isActive
                  ? 'border border-[#7B4E34] bg-[#5A3825] text-white shadow-md'
                  : 'text-[#C4B2A3] hover:bg-[#2F1F18] hover:text-white'}"
              >
                {@render navIcon(item.icon, isActive)}
                <span>{item.label}</span>
              </a>
            {/each}
          </nav>

          <div class="border-t border-[#38261E] bg-[#1E130E] p-4">
            <div class="flex items-center justify-between">
              <div class="truncate">
                <div class="truncate text-xs font-semibold text-white">
                  {data.user.name}
                </div>
                <div class="font-mono text-[10px] text-[#9A8474]">
                  {data.user.email} · {data.user.role === "APPROVER"
                    ? dict.roleManager
                    : dict.roleStaff}
                </div>
              </div>
              <form method="POST" action="/login?/logout">
                <button
                  type="submit"
                  class="rounded-md bg-[#341F18] px-2.5 py-1.5 text-xs font-semibold text-[#E57373]"
                >
                  {dict.logout}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    {/if}

    <!-- Main Layout Area -->
    <div class="flex h-full min-w-0 flex-1 flex-col overflow-hidden">
      <!-- Mobile Header (Figma Espresso Topbar) -->
      <header
        class="sticky top-0 z-40 flex items-center justify-between border-b border-[#38261E] bg-[#231712] px-4 py-3 text-[#EFE8E1] shadow-md md:hidden"
      >
        <div class="flex items-center gap-2.5">
          <button
            type="button"
            onclick={() => (mobileMenuOpen = !mobileMenuOpen)}
            class="-ml-1 rounded-lg p-2 text-[#E5B589] transition hover:bg-[#341F18]"
            aria-label="Open navigation"
          >
            <svg
              class="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div class="flex items-center gap-2">
            <div
              class="flex h-7 w-7 items-center justify-center rounded-lg border border-[#7A4D33] bg-[#5A3825] text-[#E5B589]"
            >
              <svg
                class="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path d="M17 8h1a4 4 0 1 1 0 8h-1" />
                <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z" />
              </svg>
            </div>
            <div>
              <div
                class="font-serif text-sm leading-tight font-bold text-white"
              >
                {activeItem.label}
              </div>
              <div class="text-[10px] leading-none text-[#A69080]">
                CafeStock Mobile
              </div>
            </div>
          </div>
        </div>

        <!-- Mobile Language Switcher (Zero Flags) -->
        <div
          class="flex items-center rounded-lg border border-[#482F24] bg-[#1E130E] p-0.5 font-mono text-[10px] font-bold"
        >
          {#each ["EN", "ID", "JP"] as const as l}
            <form method="POST" action="/login?/setLang" class="inline">
              <input type="hidden" name="lang" value={l} />
              <input type="hidden" name="redirectTo" value={currentPath} />
              <button
                type="submit"
                class="cursor-pointer rounded px-1.5 py-0.5 transition {data.lang ===
                l
                  ? 'bg-[#5A3825] text-white shadow-xs'
                  : 'text-[#A69080] hover:text-white'}"
              >
                {l}
              </button>
            </form>
          {/each}
        </div>
      </header>

      <!-- Desktop Top Header Bar -->
      <header
        class="hidden shrink-0 items-center justify-between border-b border-[#EDE4D8] bg-white px-8 py-3.5 shadow-xs md:flex"
      >
        <div class="flex items-center gap-2 text-xs font-medium text-[#7D6B5D]">
          <span>{activeItem.group}</span>
          <span>/</span>
          <span class="font-semibold text-[#3D2C20]">{activeItem.label}</span>
        </div>

        <div class="flex items-center gap-4">
          <!-- Desktop Language Switcher (Zero Flags) -->
          <div
            class="flex items-center rounded-lg border border-[#EDE4D8] bg-[#FAF7F2] p-0.5 font-mono text-[11px] font-bold"
          >
            {#each ["EN", "ID", "JP"] as const as l}
              <form method="POST" action="/login?/setLang" class="inline">
                <input type="hidden" name="lang" value={l} />
                <input type="hidden" name="redirectTo" value={currentPath} />
                <button
                  type="submit"
                  class="cursor-pointer rounded-md px-2 py-0.5 transition {data.lang ===
                  l
                    ? 'bg-[#5A3825] text-white shadow-xs'
                    : 'text-[#8C7665] hover:text-[#5A3825]'}"
                >
                  {l}
                </button>
              </form>
            {/each}
          </div>

          <div class="flex items-center gap-2.5 border-l border-[#EDE4D8] pl-4">
            <div class="text-right">
              <div class="text-xs font-bold text-[#2E1F16]">
                {data.user.name}
              </div>
              <div class="text-[10px] font-semibold text-[#8C7665]">
                {data.user.role === "APPROVER"
                  ? dict.roleManager
                  : dict.roleStaff}
              </div>
            </div>
            <div
              class="flex h-8 w-8 items-center justify-center rounded-full border border-[#D5C5B5] bg-[#EFE7DE] text-xs font-bold text-[#5A3825]"
            >
              {data.user.name
                .split(" ")
                .map((n: string) => n[0])
                .slice(0, 2)
                .join("")}
            </div>
          </div>
        </div>
      </header>

      <!-- Content Outlet -->
      <main class="flex-1 overflow-y-auto bg-[#FAF7F2] p-4 md:p-8">
        <div class="mx-auto max-w-7xl">
          {@render children()}
        </div>
      </main>
    </div>
  </div>
{/if}
