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
          </div>
          <div class="text-xs text-[#A69080]">
            {dict.brandSubtitle}
          </div>
        </div>
      </div>
    </div>

    <!-- Middle Hero Slogan & Subtext from Figma -->
    <div class="relative z-10 my-10 space-y-6 md:my-0">
      <div
        class="inline-flex items-center gap-2 rounded-lg border border-[#5A3825] bg-[#3B261C] px-3 py-1 text-xs font-medium text-[#E5B589]"
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
        <span>{dict.loginHeroBadge}</span>
      </div>

      <h1
        class="font-serif text-3xl leading-tight font-bold tracking-tight text-white sm:text-4xl lg:text-5xl"
      >
        {dict.loginHeroTitle1}
        <br />
        <span class="text-[#D8A57A]">{dict.loginHeroTitle2}</span>
      </h1>

      <p class="max-w-md text-sm leading-relaxed text-[#D0C2B6] sm:text-base">
        {dict.loginHeroDesc}
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
          <span>{dict.loginFeature1}</span>
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
          <span>{dict.loginFeature2}</span>
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
          <span>{dict.loginFeature3}</span>
        </div>
      </div>
    </div>

    <!-- Bottom Hero Info -->
    <div
      class="relative z-10 border-t border-[#38261E] pt-4 text-[11px] text-[#8C7665]"
    >
      {dict.loginHeroFooter}
    </div>
  </div>

  <!-- Right Side: Login Form & 1-Click Seeder Cards -->
  <div class="flex flex-1 items-center justify-center p-6 sm:p-10 lg:p-16">
    <div class="w-full max-w-md space-y-8">
      <!-- Header Form -->
      <div class="flex items-start justify-between gap-4">
        <div>
          <h2 class="font-serif text-2xl font-bold text-[#231712] sm:text-3xl">
            {dict.loginTitle}
          </h2>
          <p class="mt-1.5 text-xs text-[#7D6B5D] sm:text-sm">
            {dict.loginSubtitle}
          </p>
        </div>

        <!-- Language Switcher (Zero Flags) -->
        <div
          class="flex shrink-0 items-center rounded-lg border border-[#EDE4D8] bg-[#FAF7F2] p-0.5 font-mono text-[11px] font-bold"
        >
          {#each ["EN", "ID", "JP"] as const as l}
            <form method="POST" action="?/setLang" class="inline">
              <input type="hidden" name="lang" value={l} />
              <input type="hidden" name="redirectTo" value="/login" />
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
      </div>

      {#if data.status === "otp_required" || form?.status === "otp_required"}
        <!-- OTP Verification View -->
        <div class="space-y-6">
          <div class="space-y-2">
            <div
              class="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#D5C5B5] bg-[#EFE7DE] text-[#5A3825]"
            >
              <svg
                class="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <h2 class="font-serif text-2xl font-bold text-[#231712]">
              {dict.otpTitle}
            </h2>
            <p class="text-xs text-[#8C7665]">
              {dict.otpDesc}
            </p>
          </div>

          {#if form?.error || data.error}
            <div
              class="flex items-center gap-2.5 rounded-xl border border-[#F5C2C7] bg-[#FFF5F5] px-4 py-3 text-xs font-semibold text-[#C62828]"
            >
              <span class="h-2 w-2 shrink-0 rounded-full bg-[#C62828]"></span>
              <span>{form?.error || data.error}</span>
            </div>
          {/if}

          <form method="POST" action="?/verifyOtp" class="space-y-4">
            <input
              type="hidden"
              name="email"
              value={data.email ?? form?.email ?? ""}
            />

            <div class="space-y-1.5">
              <label
                for="otpCode"
                class="block text-xs font-bold tracking-wider text-[#5A4537] uppercase"
              >
                Kode OTP (6 Digit)
              </label>
              <input
                id="otpCode"
                name="code"
                type="text"
                maxlength="6"
                required
                value={data.hint ?? ""}
                placeholder={dict.otpPlaceholder}
                class="w-full rounded-xl border border-[#DDD2C4] bg-white py-3 text-center font-mono text-xl tracking-widest text-[#231712] placeholder-[#B5A597] shadow-xs transition focus:border-[#7A4D33] focus:ring-2 focus:ring-[#7A4D33]/15 focus:outline-none"
              />
              {#if data.hint}
                <p class="font-mono text-[11px] text-[#8C7665]">
                  Kode simulasi: <span class="font-bold text-[#5A3825]"
                    >{data.hint}</span
                  >
                </p>
              {/if}
            </div>

            <button
              type="submit"
              class="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#5A3825] px-4 py-3 text-sm font-bold tracking-wide text-white shadow-md transition hover:bg-[#45281A] hover:shadow-lg active:bg-[#341F14]"
            >
              <span>{dict.verifyOtpButton}</span>
            </button>

            <div class="text-center">
              <a
                href="/login"
                class="text-xs font-semibold text-[#7A4D33] hover:underline"
              >
                {dict.backToLogin}
              </a>
            </div>
          </form>
        </div>
      {:else if data.status === "2fa_required" || form?.status === "2fa_required"}
        <!-- 2FA Authenticator Verification View -->
        <div class="space-y-6">
          <div class="space-y-2">
            <div
              class="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#D5C5B5] bg-[#EFE7DE] text-[#5A3825]"
            >
              <svg
                class="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <h2 class="font-serif text-2xl font-bold text-[#231712]">
              Verifikasi 2FA Authenticator
            </h2>
            <p class="text-xs text-[#8C7665]">
              Buka aplikasi Authenticator Anda (Google Authenticator, Authy,
              atau Apple Passwords) dan masukkan 6 digit token saat ini atau
              kode pemulihan cadangan.
            </p>
          </div>

          {#if form?.error || data.error}
            <div
              class="flex items-center gap-2.5 rounded-xl border border-[#F5C2C7] bg-[#FFF5F5] px-4 py-3 text-xs font-semibold text-[#C62828]"
            >
              <span class="h-2 w-2 shrink-0 rounded-full bg-[#C62828]"></span>
              <span>{form?.error || data.error}</span>
            </div>
          {/if}

          <form method="POST" action="?/verify2Fa" class="space-y-4">
            <input
              type="hidden"
              name="email"
              value={data.email ?? form?.email ?? ""}
            />

            <div class="space-y-1.5">
              <label
                for="totpCode"
                class="block text-xs font-bold tracking-wider text-[#5A4537] uppercase"
              >
                Kode Token / Kode Cadangan
              </label>
              <input
                id="totpCode"
                name="code"
                type="text"
                maxlength="9"
                required
                autocomplete="one-time-code"
                placeholder="123456 atau XXXX-XXXX"
                class="w-full rounded-xl border border-[#DDD2C4] bg-white py-3 text-center font-mono text-xl tracking-widest text-[#231712] placeholder-[#B5A597] shadow-xs transition focus:border-[#7A4D33] focus:ring-2 focus:ring-[#7A4D33]/15 focus:outline-none"
              />
              <p class="text-[11px] text-[#8C7665]">
                Kode token diperbarui otomatis setiap 30 detik pada aplikasi HP
                Anda.
              </p>
            </div>

            <button
              type="submit"
              class="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#5A3825] px-4 py-3 text-sm font-bold tracking-wide text-white shadow-md transition hover:bg-[#45281A] hover:shadow-lg active:bg-[#341F14]"
            >
              <span>Verifikasi & Masuk</span>
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

            <div class="text-center">
              <a
                href="/login"
                class="text-xs font-semibold text-[#7A4D33] hover:underline"
              >
                ← {dict.backToLogin}
              </a>
            </div>
          </form>
        </div>
      {:else if data.status === "2fa_required" || form?.status === "2fa_required"}
        <!-- 2FA Authenticator Verification View -->
        <div class="space-y-6">
          <div class="space-y-2">
            <div
              class="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#D5C5B5] bg-[#EFE7DE] text-[#5A3825]"
            >
              <svg
                class="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <h2 class="font-serif text-2xl font-bold text-[#231712]">
              Verifikasi 2FA Authenticator
            </h2>
            <p class="text-xs text-[#8C7665]">
              Buka aplikasi Authenticator Anda (Google Authenticator, Authy,
              atau Apple Passwords) dan masukkan 6 digit token saat ini atau
              kode pemulihan cadangan.
            </p>
          </div>

          {#if form?.error || data.error}
            <div
              class="flex items-center gap-2.5 rounded-xl border border-[#F5C2C7] bg-[#FFF5F5] px-4 py-3 text-xs font-semibold text-[#C62828]"
            >
              <span class="h-2 w-2 shrink-0 rounded-full bg-[#C62828]"></span>
              <span>{form?.error || data.error}</span>
            </div>
          {/if}

          <form method="POST" action="?/verify2Fa" class="space-y-4">
            <input
              type="hidden"
              name="email"
              value={data.email ?? form?.email ?? ""}
            />

            <div class="space-y-1.5">
              <label
                for="totpCode"
                class="block text-xs font-bold tracking-wider text-[#5A4537] uppercase"
              >
                Kode Token / Kode Cadangan
              </label>
              <input
                id="totpCode"
                name="code"
                type="text"
                maxlength="9"
                required
                autocomplete="one-time-code"
                placeholder="123456 atau XXXX-XXXX"
                class="w-full rounded-xl border border-[#DDD2C4] bg-white py-3 text-center font-mono text-xl tracking-widest text-[#231712] placeholder-[#B5A597] shadow-xs transition focus:border-[#7A4D33] focus:ring-2 focus:ring-[#7A4D33]/15 focus:outline-none"
              />
              <p class="text-[11px] text-[#8C7665]">
                Kode token diperbarui otomatis setiap 30 detik pada aplikasi HP
                Anda.
              </p>
            </div>

            <button
              type="submit"
              class="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#5A3825] px-4 py-3 text-sm font-bold tracking-wide text-white shadow-md transition hover:bg-[#45281A] hover:shadow-lg active:bg-[#341F14]"
            >
              <span>Verifikasi & Masuk</span>
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

            <div class="text-center">
              <a
                href="/login"
                class="text-xs font-semibold text-[#7A4D33] hover:underline"
              >
                ← {dict.backToLogin}
              </a>
            </div>
          </form>
        </div>
      {:else if data.status === "pending_approval"}
        <!-- Pending Super Admin Approval View -->
        <div class="space-y-6 text-center">
          <div
            class="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-[#E0D0C0] bg-[#F5EDE4] text-[#7A4D33]"
          >
            <svg
              class="h-7 w-7"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>

          <div class="space-y-2">
            <h2 class="font-serif text-2xl font-bold text-[#231712]">
              {dict.pendingApprovalTitle}
            </h2>
            <p class="text-xs leading-relaxed text-[#756254]">
              {dict.pendingApprovalDesc}
            </p>
            {#if data.email}
              <div
                class="mt-3 inline-block rounded-lg border border-[#DDD2C4] bg-[#FAF7F2] px-3 py-1 font-mono text-xs font-bold text-[#5A3825]"
              >
                {data.email}
              </div>
            {/if}
          </div>

          <div class="pt-4">
            <a
              href="/login"
              class="flex w-full items-center justify-center rounded-xl bg-[#5A3825] px-4 py-3 text-xs font-bold tracking-wide text-white transition hover:bg-[#45281A]"
            >
              {dict.backToLogin}
            </a>
          </div>
        </div>
      {:else}
        <!-- Standard Login with Google OAuth & Staff Fallback -->
        <div class="space-y-5">
          <!-- Google OAuth Primary Button -->
          <a
            href="/api/auth/google"
            data-sveltekit-reload
            rel="external"
            class="flex w-full cursor-pointer items-center justify-center gap-3 rounded-xl border border-[#D5C5B5] bg-white px-4 py-3 text-sm font-semibold text-[#2E1F16] shadow-xs transition hover:border-[#7A4D33] hover:bg-[#FAF7F2] hover:shadow-sm"
          >
            <svg class="h-5 w-5 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>{dict.signInWithGoogle}</span>
          </a>

          <!-- Subtle Divider -->
          <div class="relative my-4 flex items-center justify-center">
            <div class="w-full border-t border-[#E5DACD]"></div>
            <span
              class="absolute bg-[#FAF7F2] px-3 font-sans text-[11px] font-medium text-[#9E8B7D]"
            >
              {dict.orSignInWithEmail}
            </span>
          </div>

          {#if form?.error || data.error}
            <div
              class="flex items-center gap-2.5 rounded-xl border border-[#F5C2C7] bg-[#FFF5F5] px-4 py-3 text-xs font-semibold text-[#C62828]"
            >
              <span class="h-2 w-2 shrink-0 rounded-full bg-[#C62828]"></span>
              <span>{form?.error || data.error}</span>
            </div>
          {/if}

          <form method="POST" action="?/login" class="space-y-4">
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
                  placeholder="user@cafestock.com"
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
          </form>
        </div>
      {/if}
    </div>
  </div>
</div>
