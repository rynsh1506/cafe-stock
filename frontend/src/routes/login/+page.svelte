<script lang="ts">
  import { getDictionary } from "@/lib/i18n";
  import type {
    LoginActionData,
    LoginPageServerData,
  } from "@/routes/login/+page.server";

  let {
    data,
    form,
  }: {
    data: LoginPageServerData;
    form: LoginActionData | null;
  } = $props();
  let dict = $derived(getDictionary(data.lang));
  let showPassword = $state(false);
</script>

<div
  class="flex min-h-screen w-full flex-col bg-[#FAF7F2] text-[#2D241E] select-none md:flex-row"
>
  <!-- Left Side: Figma Espresso Hero Visual -->
  <div
    class="relative flex shrink-0 flex-col justify-between overflow-hidden bg-[#231712] p-8 text-[#EFE8E1] shadow-2xl sm:p-12 md:w-1/2 lg:w-5/12 lg:p-16"
  >
    <!-- Ambient Coffee Glow -->
    <div
      class="pointer-events-none absolute -top-24 -left-24 h-96 w-96 rounded-full bg-[#5A3825]/30 blur-3xl"
    ></div>
    <div
      class="pointer-events-none absolute -right-24 -bottom-24 h-96 w-96 rounded-full bg-[#7A4D33]/20 blur-3xl"
    ></div>

    <!-- Top Branding -->
    <div class="relative z-10">
      <div class="flex items-center gap-3">
        <div
          class="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#7A4D33] bg-[#5A3825] text-[#E5B589] shadow-lg"
        >
          <svg
            class="h-6 w-6"
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
        <div>
          <div
            class="flex items-center gap-2 font-serif text-2xl font-bold tracking-wide text-white"
          >
            <span>CafeStock</span>
            <span
              class="rounded-full border border-[#683C25] bg-[#45281A] px-2 py-0.5 font-sans text-[11px] font-semibold tracking-wider text-[#D8A57A] uppercase"
            >
              v1.0
            </span>
          </div>
          <div class="text-xs text-[#A69080]">
            Inventory &amp; Procurement System
          </div>
        </div>
      </div>
    </div>

    <!-- Middle Hero Slogan & Subtext from Figma -->
    <div class="relative z-10 my-10 space-y-6 md:my-0">
      <div
        class="inline-flex items-center gap-2 rounded-full border border-[#5A3825] bg-[#3B261C] px-3 py-1 text-xs font-medium text-[#E5B589]"
      >
        <svg
          class="h-3.5 w-3.5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path
            d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z"
          />
        </svg>
        <span>From Purchase Request to Stock Updated</span>
      </div>

      <h1
        class="font-serif text-3xl leading-tight font-bold tracking-tight text-white sm:text-4xl lg:text-5xl"
      >
        Stock in order.
        <br />
        <span class="text-[#D8A57A]">Craft intact.</span>
      </h1>

      <p class="max-w-md text-sm leading-relaxed text-[#D0C2B6] sm:text-base">
        A unified system recording the entire cafe procurement cycle—from
        Purchase Requests and managerial Approvals to Purchase Orders and Goods
        Receipts with reliable, consistent stock balances.
      </p>

      <!-- Feature Highlights -->
      <div class="space-y-2.5 pt-2 text-xs text-[#E0D4C8]">
        <div class="flex items-center gap-2.5">
          <svg
            class="h-4 w-4 shrink-0 text-[#D8A57A]"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
          <span>
            Single aggregate payload contract for rapid transactional flows
          </span>
        </div>
        <div class="flex items-center gap-2.5">
          <svg
            class="h-4 w-4 shrink-0 text-[#D8A57A]"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
          <span>
            Strict separation of current stock balances and append-only ledger
          </span>
        </div>
        <div class="flex items-center gap-2.5">
          <svg
            class="h-4 w-4 shrink-0 text-[#D8A57A]"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
          <span>Backend-enforced role authorization (USER &amp; APPROVER)</span>
        </div>
      </div>
    </div>

    <!-- Bottom Hero Info -->
    <div
      class="relative z-10 border-t border-[#38261E] pt-4 text-[11px] text-[#8C7665]"
    >
      Group 2 • Inventory Procurement System © 2026
    </div>
  </div>

  <!-- Right Side: Login Form & 1-Click Seeder Cards -->
  <div class="flex flex-1 items-center justify-center p-6 sm:p-10 lg:p-16">
    <div class="w-full max-w-md space-y-8">
      <!-- Header Form -->
      <div>
        <h2 class="font-serif text-2xl font-bold text-[#231712] sm:text-3xl">
          Welcome back.
        </h2>
        <p class="mt-1.5 text-xs text-[#7D6B5D] sm:text-sm">
          {dict.loginSubtitle}
        </p>
      </div>

      {#if form?.error}
        <div
          class="flex items-center gap-2.5 rounded-xl border border-[#F5C2C7] bg-[#FFF5F5] px-4 py-3 text-xs font-semibold text-[#C62828]"
        >
          <span class="h-2 w-2 shrink-0 rounded-full bg-[#C62828]"></span>
          <span>{form.error}</span>
        </div>
      {/if}

      <form method="POST" action="?/login" class="space-y-5">
        <div class="space-y-1.5">
          <label
            for="email"
            class="block text-xs font-bold tracking-wider text-[#5A4537] uppercase"
          >
            {dict.emailLabel}
          </label>
          <div class="relative">
            <div
              class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#A39282]"
            >
              <svg
                class="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            <input
              id="email"
              type="email"
              name="email"
              required
              value={form?.email ?? ""}
              placeholder="staff@cafestock.com"
              class="w-full rounded-xl border border-[#DDD2C4] bg-white py-2.5 pr-4 pl-10 text-sm text-[#231712] placeholder-[#B5A597] shadow-xs transition focus:border-[#7A4D33] focus:ring-2 focus:ring-[#7A4D33]/15 focus:outline-none"
            />
          </div>
        </div>

        <div class="space-y-1.5">
          <div class="flex items-center justify-between">
            <label
              for="password"
              class="block text-xs font-bold tracking-wider text-[#5A4537] uppercase"
            >
              {dict.passwordLabel}
            </label>
          </div>
          <div class="relative">
            <div
              class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#A39282]"
            >
              <svg
                class="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              name="password"
              required
              placeholder="••••••••"
              class="w-full rounded-xl border border-[#DDD2C4] bg-white py-2.5 pr-11 pl-10 text-sm text-[#231712] placeholder-[#B5A597] shadow-xs transition focus:border-[#7A4D33] focus:ring-2 focus:ring-[#7A4D33]/15 focus:outline-none"
            />
            <button
              type="button"
              onclick={() => (showPassword = !showPassword)}
              class="absolute inset-y-0 right-0 flex cursor-pointer items-center pr-3.5 text-[#A39282] transition hover:text-[#5A3825]"
              aria-label="Toggle password visibility"
            >
              {#if showPassword}
                <svg
                  class="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                  <path
                    d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"
                  />
                  <path
                    d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"
                  />
                  <line x1="2" x2="22" y1="2" y2="22" />
                </svg>
              {:else}
                <svg
                  class="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              {/if}
            </button>
          </div>
        </div>

        <button
          type="submit"
          class="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#5A3825] px-4 py-3 text-sm font-bold tracking-wide text-white shadow-md transition hover:bg-[#45281A] hover:shadow-lg active:bg-[#341F14]"
        >
          <span>{dict.signInButton}</span>
          <svg
            class="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
          </svg>
        </button>

        <div class="pt-2 text-center">
          <p class="font-mono text-[11px] text-[#8C7665]">
            Default credentials: <span class="font-semibold text-[#5A3825]"
              >staff@cafestock.com</span
            >
            / <span class="font-semibold text-[#5A3825]">User123!</span> &bull;
            <span class="font-semibold text-[#5A3825]"
              >approver@cafestock.com</span
            >
            / <span class="font-semibold text-[#5A3825]">Approver123!</span>
          </p>
        </div>
      </form>
    </div>
  </div>
</div>
