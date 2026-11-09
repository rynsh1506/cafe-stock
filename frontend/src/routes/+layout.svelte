<script lang="ts">
  import type { Snippet } from "svelte";
  import "@/app.css";
  import { getDictionary } from "@/lib/i18n";
  import type { LayoutServerData } from "@/routes/+layout.server";

  let { data, children }: { data: LayoutServerData; children: Snippet } =
    $props();

  let dict = $derived(getDictionary(data.lang));
  let isMobileMenuOpen = $state(false);

  const navGroups = $derived([
    {
      title:
        data.lang === "ID"
          ? "Ikhtisar"
          : data.lang === "JP"
            ? "概要"
            : "Overview",
      items: [
        { href: "/", label: dict.navDashboard, code: "01" },
        { href: "/master", label: dict.navMaster, code: "02" },
      ],
    },
    {
      title:
        data.lang === "ID"
          ? "Alur Pengadaan"
          : data.lang === "JP"
            ? "購買フロー"
            : "Procurement",
      items: [
        {
          href: "/purchase-requests",
          label: dict.navPurchaseRequests,
          code: "03",
        },
        { href: "/purchase-orders", label: dict.navPurchaseOrders, code: "04" },
        { href: "/goods-receipts", label: dict.navGoodsReceipts, code: "05" },
      ],
    },
    {
      title:
        data.lang === "ID"
          ? "Buku Besar & Audit"
          : data.lang === "JP"
            ? "台帳・監査"
            : "Ledger & Compliance",
      items: [
        { href: "/inventory", label: dict.navInventory, code: "06" },
        { href: "/audit-logs", label: dict.navAuditLogs, code: "07" },
      ],
    },
  ]);

  const flatNavLinks = $derived(navGroups.flatMap((g) => g.items));

  const currentPageLabel = $derived(
    flatNavLinks.find((item) => item.href === data.pathname)?.label ??
      dict.navDashboard,
  );

  function closeMobileMenu(): void {
    isMobileMenuOpen = false;
  }
</script>

<svelte:head>
  <title>CafeStock — {dict.brandSubtitle}</title>
</svelte:head>

{#if !data.user}
  <div class="min-h-screen bg-[#F5F5F7] text-[#1D1D1F]">
    {@render children()}
  </div>
{:else}
  <div class="flex min-h-screen bg-[#F5F5F7] text-[#1D1D1F]">
    <!-- Desktop macOS / iPadOS Translucent Sidebar -->
    <aside
      class="hidden w-[252px] shrink-0 flex-col border-r border-black/[0.06] bg-[#FBFBFD]/90 lg:flex"
    >
      <div
        class="sticky top-0 flex h-screen flex-col justify-between px-3.5 py-5"
      >
        <div class="space-y-6">
          <!-- Brand Header -->
          <a
            href="/"
            class="flex items-center gap-3 rounded-xl px-2.5 py-1.5 transition hover:bg-black/[0.03]"
          >
            <div
              class="flex h-8 w-8 shrink-0 items-center justify-center rounded-[9px] bg-[#1D1D1F] text-white shadow-xs"
            >
              <svg
                class="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M17 8h1a4 4 0 1 1 0 8h-1" />
                <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z" />
                <line x1="6" y1="2" x2="6" y2="4" />
                <line x1="10" y1="2" x2="10" y2="4" />
                <line x1="14" y1="2" x2="14" y2="4" />
              </svg>
            </div>
            <div class="min-w-0">
              <div
                class="truncate text-[15px] font-semibold tracking-tight text-[#1D1D1F]"
              >
                CafeStock
              </div>
              <div class="truncate text-[11px] font-medium text-[#86868B]">
                Supply & Inventory
              </div>
            </div>
          </a>

          <!-- Grouped Navigation Sections -->
          <nav class="space-y-5">
            {#each navGroups as group}
              <div>
                <div
                  class="mb-1.5 px-2.5 text-[11px] font-semibold tracking-wider text-[#86868B] uppercase"
                >
                  {group.title}
                </div>
                <div class="space-y-0.5">
                  {#each group.items as item}
                    {@const isActive = data.pathname === item.href}
                    <a
                      href={item.href}
                      class="group flex items-center justify-between rounded-[10px] px-2.5 py-2 text-[13px] transition-all {isActive
                        ? 'bg-[#1D1D1F] font-medium text-white shadow-xs'
                        : 'font-normal text-[#424245] hover:bg-black/[0.04] hover:text-[#1D1D1F]'}"
                    >
                      <span class="truncate">{item.label}</span>
                      <span
                        class="font-mono text-[10px] {isActive
                          ? 'text-white/60'
                          : 'text-[#86868B]/70 group-hover:text-[#6E6E73]'}"
                      >
                        {item.code}
                      </span>
                    </a>
                  {/each}
                </div>
              </div>
            {/each}
          </nav>
        </div>

        <!-- Bottom Operator Account Dock -->
        <div
          class="space-y-3 border-t border-black/[0.06] pt-4 text-xs text-[#1D1D1F]"
        >
          <!-- Apple Segmented Language Switcher -->
          <form
            method="POST"
            action="/login?/setLang"
            class="apple-segmented grid grid-cols-3"
          >
            <input type="hidden" name="redirectTo" value={data.pathname} />
            {#each ["ID", "EN", "JP"] as code}
              <button
                type="submit"
                name="lang"
                value={code}
                class="cursor-pointer py-1 text-center text-[11px] font-medium transition-all {data.lang ===
                code
                  ? 'apple-segmented-item-active font-semibold'
                  : 'text-[#6E6E73] hover:text-[#1D1D1F]'}"
              >
                {code}
              </button>
            {/each}
          </form>

          <!-- User Profile Card -->
          <div
            class="flex items-center justify-between gap-2 rounded-xl border border-black/[0.06] bg-white p-2.5 shadow-2xs"
          >
            <div class="flex min-w-0 items-center gap-2.5">
              <div
                class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#F5F5F7] text-[11px] font-semibold text-[#1D1D1F]"
              >
                {data.user.name
                  .split(" ")
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join("")}
              </div>
              <div class="min-w-0">
                <div class="truncate text-[12px] font-semibold text-[#1D1D1F]">
                  {data.user.name}
                </div>
                <div
                  class="flex items-center gap-1.5 text-[11px] text-[#86868B]"
                >
                  <span
                    class="inline-block h-1.5 w-1.5 rounded-full {data.user
                      .role === 'APPROVER'
                      ? 'bg-[#1D1D1F]'
                      : 'bg-[#86868B]'}"
                  ></span>
                  <span class="font-mono text-[10px] tracking-wide uppercase">
                    {data.user.role}
                  </span>
                </div>
              </div>
            </div>

            <form method="POST" action="/login?/logout">
              <button
                type="submit"
                title={dict.logout}
                class="cursor-pointer rounded-lg p-1.5 text-[#86868B] transition hover:bg-[#F5F5F7] hover:text-[#1D1D1F]"
              >
                <svg
                  class="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.8"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
              </button>
            </form>
          </div>
        </div>
      </div>
    </aside>

    <!-- Mobile & Tablet Slide-Over Sheet Drawer -->
    {#if isMobileMenuOpen}
      <div class="fixed inset-0 z-50 flex lg:hidden">
        <button
          type="button"
          aria-label="Close navigation menu"
          onclick={closeMobileMenu}
          class="fixed inset-0 bg-black/25 backdrop-blur-xs transition-opacity"
        ></button>

        <div
          class="relative z-10 flex h-full w-[280px] max-w-[84vw] flex-col justify-between border-r border-black/[0.08] bg-[#FBFBFD] p-4 shadow-2xl"
        >
          <div class="space-y-5 overflow-y-auto">
            <div class="flex items-center justify-between px-1">
              <div class="flex items-center gap-2.5">
                <div
                  class="flex h-8 w-8 items-center justify-center rounded-[9px] bg-[#1D1D1F] text-white"
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
                  <div class="text-sm font-semibold text-[#1D1D1F]">
                    CafeStock
                  </div>
                  <div class="text-[11px] text-[#86868B]">
                    {data.user.role}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onclick={closeMobileMenu}
                aria-label="Close drawer"
                class="rounded-lg p-1.5 text-[#86868B] hover:bg-black/[0.05] hover:text-[#1D1D1F]"
              >
                <svg
                  class="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.8"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <nav class="space-y-4">
              {#each navGroups as group}
                <div>
                  <div
                    class="mb-1 px-2.5 text-[11px] font-semibold tracking-wider text-[#86868B] uppercase"
                  >
                    {group.title}
                  </div>
                  <div class="space-y-0.5">
                    {#each group.items as item}
                      {@const isActive = data.pathname === item.href}
                      <a
                        href={item.href}
                        onclick={closeMobileMenu}
                        class="flex items-center justify-between rounded-[10px] px-3 py-2.5 text-[13px] transition {isActive
                          ? 'bg-[#1D1D1F] font-medium text-white'
                          : 'text-[#424245] hover:bg-black/[0.04]'}"
                      >
                        <span>{item.label}</span>
                        <span
                          class="font-mono text-[10px] {isActive
                            ? 'text-white/60'
                            : 'text-[#86868B]'}"
                        >
                          {item.code}
                        </span>
                      </a>
                    {/each}
                  </div>
                </div>
              {/each}
            </nav>
          </div>

          <div class="space-y-3 border-t border-black/[0.06] pt-3">
            <form
              method="POST"
              action="/login?/setLang"
              class="apple-segmented grid grid-cols-3"
            >
              <input type="hidden" name="redirectTo" value={data.pathname} />
              {#each ["ID", "EN", "JP"] as code}
                <button
                  type="submit"
                  name="lang"
                  value={code}
                  class="py-1 text-center text-[11px] font-medium {data.lang ===
                  code
                    ? 'apple-segmented-item-active font-semibold'
                    : 'text-[#6E6E73]'}"
                >
                  {code}
                </button>
              {/each}
            </form>

            <div class="flex items-center justify-between px-1">
              <div class="min-w-0">
                <div class="truncate text-xs font-semibold text-[#1D1D1F]">
                  {data.user.name}
                </div>
                <div class="truncate text-[11px] text-[#86868B]">
                  {data.user.email}
                </div>
              </div>
              <form method="POST" action="/login?/logout">
                <button
                  type="submit"
                  class="apple-btn-secondary px-3 py-1.5 text-xs"
                >
                  {dict.logout}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    {/if}

    <!-- Main Workspace Column -->
    <div class="flex min-w-0 flex-1 flex-col">
      <!-- Translucent Frosted Top Bar -->
      <header
        class="apple-glass sticky top-0 z-30 border-b border-black/[0.06]"
      >
        <div
          class="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8"
        >
          <div class="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onclick={() => (isMobileMenuOpen = true)}
              aria-label="Open navigation menu"
              class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-black/[0.08] bg-white text-[#1D1D1F] lg:hidden"
            >
              <svg
                class="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <line x1="4" y1="7" x2="20" y2="7" />
                <line x1="4" y1="12" x2="20" y2="12" />
                <line x1="4" y1="17" x2="14" y2="17" />
              </svg>
            </button>

            <div class="flex min-w-0 items-center gap-2">
              <span
                class="hidden text-[13px] font-normal text-[#86868B] sm:inline"
              >
                CafeStock
              </span>
              <span class="hidden text-[#D2D2D7] sm:inline">/</span>
              <span
                class="truncate text-[14px] font-semibold tracking-tight text-[#1D1D1F]"
              >
                {currentPageLabel}
              </span>
            </div>
          </div>

          <div class="flex shrink-0 items-center gap-2.5">
            <!-- Mobile Quick Language Indicator + Role Indicator -->
            <div
              class="flex items-center gap-2 rounded-full border border-black/[0.06] bg-white/90 px-3 py-1 text-[11px] font-medium text-[#1D1D1F]"
            >
              <span
                class="h-1.5 w-1.5 rounded-full {data.user.role === 'APPROVER'
                  ? 'bg-[#1D1D1F]'
                  : 'bg-[#86868B]'}"
              ></span>
              <span class="hidden sm:inline">{data.user.name}</span>
              <span class="text-[#D2D2D7] hidden sm:inline">•</span>
              <span class="font-mono text-[10px] text-[#6E6E73]"
                >{data.user.role}</span
              >
            </div>
          </div>
        </div>

        <!-- Horizontal Scrollable Pill Strip on Mobile/Tablet -->
        <div
          class="flex gap-1.5 overflow-x-auto border-t border-black/[0.04] px-4 py-2 lg:hidden"
        >
          {#each flatNavLinks as item}
            {@const isActive = data.pathname === item.href}
            <a
              href={item.href}
              class="shrink-0 rounded-full px-3 py-1 text-[12px] transition {isActive
                ? 'bg-[#1D1D1F] font-medium text-white'
                : 'bg-black/[0.04] text-[#6E6E73] hover:text-[#1D1D1F]'}"
            >
              {item.label}
            </a>
          {/each}
        </div>
      </header>

      <!-- Page Content Container -->
      <main
        class="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8"
      >
        {@render children()}
      </main>
    </div>
  </div>
{/if}
