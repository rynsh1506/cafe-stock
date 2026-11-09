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
  class="flex min-h-screen flex-col items-center justify-center bg-stone-100 px-4 py-12"
>
  <div
    class="w-full max-w-md rounded-2xl border border-stone-200 bg-white p-8 shadow-sm"
  >
    <div class="mb-6 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div
          class="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-800 text-base font-bold text-white"
        >
          CS
        </div>
        <div>
          <h1 class="text-xl font-bold text-stone-900">{dict.loginTitle}</h1>
          <p class="text-xs text-stone-500">{dict.brandSubtitle}</p>
        </div>
      </div>

      <form method="POST" action="/login?/setLang" class="flex gap-1">
        <input type="hidden" name="redirectTo" value="/login" />
        {#each ["ID", "EN", "JP"] as code}
          <button
            type="submit"
            name="lang"
            value={code}
            class="rounded px-2 py-1 text-xs font-semibold {data.lang === code
              ? 'bg-amber-100 text-amber-900 ring-1 ring-amber-300'
              : 'text-stone-500 hover:bg-stone-100'}"
          >
            {code}
          </button>
        {/each}
      </form>
    </div>

    <p class="mb-6 text-sm text-stone-600">{dict.loginSubtitle}</p>

    {#if form?.error}
      <div
        class="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-xs font-medium text-red-700"
      >
        {form.error}
      </div>
    {/if}

    <form method="POST" action="?/login" class="space-y-4">
      <div>
        <label
          for="email"
          class="mb-1 block text-xs font-semibold text-stone-700"
          >{dict.emailLabel}</label
        >
        <input
          id="email"
          name="email"
          type="email"
          required
          bind:value={emailInput}
          placeholder="staff@cafestock.com"
          class="w-full rounded-lg border border-stone-300 px-3.5 py-2 text-sm focus:border-amber-700 focus:outline-none"
        />
      </div>

      <div>
        <label
          for="password"
          class="mb-1 block text-xs font-semibold text-stone-700"
          >{dict.passwordLabel}</label
        >
        <input
          id="password"
          name="password"
          type="password"
          required
          bind:value={passwordInput}
          placeholder="••••••••"
          class="w-full rounded-lg border border-stone-300 px-3.5 py-2 text-sm focus:border-amber-700 focus:outline-none"
        />
      </div>

      <button
        type="submit"
        class="w-full rounded-lg bg-amber-800 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-amber-900"
      >
        {dict.signInButton}
      </button>
    </form>

    <div class="mt-6 border-t border-stone-200 pt-5">
      <p class="mb-2.5 text-xs font-semibold text-stone-500">
        {dict.quickDemoAccess}
      </p>
      <div class="grid grid-cols-2 gap-2">
        <button
          type="button"
          onclick={fillStaffCredentials}
          class="rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-xs font-semibold text-sky-900 hover:bg-sky-100"
        >
          {dict.fillStaffRole}
        </button>
        <button
          type="button"
          onclick={fillApproverCredentials}
          class="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-900 hover:bg-emerald-100"
        >
          {dict.fillApproverRole}
        </button>
      </div>
    </div>
  </div>
</div>
