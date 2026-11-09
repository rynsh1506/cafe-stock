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

<div class="flex min-h-screen flex-col justify-between bg-[#FAFAFA] px-4 py-6">
  <!-- Minimal Top Header -->
  <div class="mx-auto flex w-full max-w-md items-center justify-between">
    <div class="flex items-center gap-2">
      <div
        class="flex h-5 w-5 items-center justify-center rounded-[5px] bg-[#111113] text-[10px] font-bold text-white"
      >
        C
      </div>
      <span class="text-[13px] font-semibold tracking-tight text-[#111113]">
        CafeStock
      </span>
    </div>

    <form method="POST" action="/login?/setLang" class="ui-tabs">
      <input type="hidden" name="redirectTo" value="/login" />
      {#each ["ID", "EN", "JP"] as code}
        <button
          type="submit"
          name="lang"
          value={code}
          class="ui-tab cursor-pointer {data.lang === code
            ? 'ui-tab-active'
            : ''}"
        >
          {code}
        </button>
      {/each}
    </form>
  </div>

  <!-- Focused Sign-In Box -->
  <div class="mx-auto my-auto w-full max-w-[340px] py-12">
    <div class="mb-6">
      <h1 class="text-[18px] font-semibold tracking-tight text-[#111113]">
        {dict.loginTitle}
      </h1>
      <p class="mt-1 text-[12px] text-[#71717A]">
        Enter your operator credentials to continue.
      </p>
    </div>

    {#if form?.error}
      <div
        class="mb-4 rounded-[6px] border border-[#E4E4E7] bg-white px-3 py-2 text-[12px] text-[#DC2626]"
      >
        {form.error}
      </div>
    {/if}

    <form method="POST" action="?/login" class="space-y-3.5">
      <div>
        <label
          for="email"
          class="mb-1 block text-[12px] font-medium text-[#3F3F46]"
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
          class="ui-input"
        />
      </div>

      <div>
        <label
          for="password"
          class="mb-1 block text-[12px] font-medium text-[#3F3F46]"
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
          class="ui-input"
        />
      </div>

      <button type="submit" class="ui-btn mt-1 w-full">
        {dict.signInButton}
      </button>
    </form>

    <div class="mt-6 border-t border-[#E4E4E7] pt-4">
      <div class="mb-2 text-[11px] font-medium text-[#71717A]">
        Quick fill seeder account
      </div>
      <div class="grid grid-cols-2 gap-2">
        <button
          type="button"
          onclick={fillStaffCredentials}
          class="ui-btn-outline justify-between px-2.5 text-[11px]"
        >
          <span>Staff</span>
          <span class="font-mono text-[10px] text-[#71717A]">USER</span>
        </button>

        <button
          type="button"
          onclick={fillApproverCredentials}
          class="ui-btn-outline justify-between px-2.5 text-[11px]"
        >
          <span>Manager</span>
          <span class="font-mono text-[10px] text-[#71717A]">APPROVER</span>
        </button>
      </div>
    </div>
  </div>

  <div class="h-4"></div>
</div>
