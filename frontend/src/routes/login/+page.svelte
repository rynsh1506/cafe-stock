<script lang="ts">
  import { getDictionary } from "@/lib/i18n";
  import type {
    LoginActionData,
    LoginPageServerData,
  } from "@/routes/login/+page.server";

  let {
    data,
    form,
  }: { data: LoginPageServerData; form: LoginActionData | null } = $props();

  let dict = $derived(getDictionary(data.lang));
  let emailInput = $state("");
  let passwordInput = $state("");

  $effect(() => {
    if (form?.email) {
      emailInput = form.email;
    }
  });

  function fillStaffCredentials(): void {
    emailInput = "staff@cafestock.com";
    passwordInput = "User123!";
  }

  function fillApproverCredentials(): void {
    emailInput = "approver@cafestock.com";
    passwordInput = "Approver123!";
  }
</script>

<div
  class="flex min-h-screen flex-col justify-between bg-[#F5F5F7] px-4 py-8 sm:px-6 lg:px-8"
>
  <!-- Top Bar with Apple Segmented Language Selector -->
  <div class="mx-auto flex w-full max-w-5xl items-center justify-between">
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
      <span class="text-[15px] font-semibold tracking-tight text-[#1D1D1F]">
        CafeStock
      </span>
    </div>

    <form
      method="POST"
      action="/login?/setLang"
      class="apple-segmented inline-flex"
    >
      <input type="hidden" name="redirectTo" value="/login" />
      {#each ["ID", "EN", "JP"] as code}
        <button
          type="submit"
          name="lang"
          value={code}
          class="cursor-pointer px-3 py-1 text-[11px] font-medium transition {data.lang ===
          code
            ? 'apple-segmented-item-active font-semibold'
            : 'text-[#6E6E73] hover:text-[#1D1D1F]'}"
        >
          {code}
        </button>
      {/each}
    </form>
  </div>

  <!-- Center Login Card -->
  <div class="mx-auto my-8 w-full max-w-[400px]">
    <div class="apple-card p-7 sm:p-9">
      <div class="mb-7 text-center">
        <div
          class="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#1D1D1F] text-white shadow-sm"
        >
          <svg
            class="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M17 8h1a4 4 0 1 1 0 8h-1" />
            <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z" />
          </svg>
        </div>
        <h1 class="text-[22px] font-semibold tracking-tight text-[#1D1D1F]">
          {dict.loginTitle}
        </h1>
        <p class="mt-1.5 text-[13px] leading-relaxed text-[#86868B]">
          {dict.loginSubtitle}
        </p>
      </div>

      {#if form?.error}
        <div
          class="mb-5 rounded-xl border border-black/[0.08] bg-[#F5F5F7] px-4 py-3 text-[12px] font-medium text-[#1D1D1F]"
        >
          <div class="flex items-center gap-2">
            <span class="h-1.5 w-1.5 shrink-0 rounded-full bg-[#D70015]"></span>
            <span>{form.error}</span>
          </div>
        </div>
      {/if}

      <form method="POST" action="?/login" class="space-y-4">
        <div>
          <label
            for="email"
            class="mb-1.5 block text-[12px] font-medium text-[#424245]"
          >
            {dict.emailLabel}
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            bind:value={emailInput}
            placeholder="staff@cafestock.com"
            class="apple-input w-full px-3.5 py-2.5 text-[14px]"
          />
        </div>

        <div>
          <label
            for="password"
            class="mb-1.5 block text-[12px] font-medium text-[#424245]"
          >
            {dict.passwordLabel}
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            bind:value={passwordInput}
            placeholder="••••••••"
            class="apple-input w-full px-3.5 py-2.5 text-[14px]"
          />
        </div>

        <button
          type="submit"
          class="apple-btn-primary mt-2 w-full cursor-pointer py-2.5 text-[14px]"
        >
          {dict.signInButton}
        </button>
      </form>

      <!-- Clean Monochromatic Seeder Account Fill -->
      <div class="mt-7 border-t border-black/[0.06] pt-5">
        <div
          class="mb-3 text-center text-[11px] font-medium tracking-wide text-[#86868B] uppercase"
        >
          {dict.quickDemoAccess}
        </div>
        <div class="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <button
            type="button"
            onclick={fillStaffCredentials}
            class="apple-btn-secondary flex cursor-pointer flex-col items-start px-3.5 py-2.5 text-left"
          >
            <div class="flex w-full items-center justify-between">
              <span class="text-[12px] font-semibold text-[#1D1D1F]">
                Staff Operator
              </span>
              <span class="font-mono text-[10px] text-[#86868B]">USER</span>
            </div>
            <span
              class="mt-0.5 truncate font-mono text-[11px] font-normal text-[#86868B]"
            >
              staff@cafestock.com
            </span>
          </button>

          <button
            type="button"
            onclick={fillApproverCredentials}
            class="apple-btn-secondary flex cursor-pointer flex-col items-start px-3.5 py-2.5 text-left"
          >
            <div class="flex w-full items-center justify-between">
              <span class="text-[12px] font-semibold text-[#1D1D1F]">
                Manager
              </span>
              <span class="font-mono text-[10px] text-[#86868B]">APPROVER</span>
            </div>
            <span
              class="mt-0.5 truncate font-mono text-[11px] font-normal text-[#86868B]"
            >
              approver@cafestock.com
            </span>
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Minimalist Footer -->
  <div class="text-center text-[11px] text-[#86868B]">
    CafeStock Procurement & Inventory Ledger • PR → Approval → PO → GR
  </div>
</div>
