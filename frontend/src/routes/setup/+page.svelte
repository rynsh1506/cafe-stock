<script lang="ts">
  import { getDictionary } from "@/lib/i18n";
  import type {
    SetupActionData,
    SetupPageServerData,
  } from "@/routes/setup/+page.server";

  let {
    data,
    form,
  }: {
    data: SetupPageServerData;
    form: SetupActionData | null;
  } = $props();

  let dict = $derived(getDictionary(data.lang));
  let showAdvanced = $state(false);
  let showPassword = $state(false);
  let isSubmitting = $state(false);
</script>

<div class="min-h-screen w-full bg-[#FAF7F2] text-[#2D241E] select-none">
  <!-- Top Navigation Bar -->
  <header class="border-b border-[#EDE4D8] bg-white px-6 py-4 shadow-xs">
    <div class="mx-auto flex max-w-4xl items-center justify-between">
      <div class="flex items-center gap-3">
        <div
          class="flex h-10 w-10 items-center justify-center rounded-xl border border-[#7A4D33] bg-[#5A3825] text-[#E5B589] shadow-sm"
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
            <path d="M17 8h1a4 4 0 1 1 0 8h-1" />
            <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z" />
            <line x1="6" y1="2" x2="6" y2="4" />
            <line x1="10" y1="2" x2="10" y2="4" />
            <line x1="14" y1="2" x2="14" y2="4" />
          </svg>
        </div>
        <div>
          <span class="font-serif text-lg font-bold text-[#231712]"
            >CafeStock</span
          >
          <span
            class="ml-2 rounded-md bg-[#F5EDE4] px-2 py-0.5 text-[11px] font-semibold text-[#7A4D33]"
            >Setup Wizard</span
          >
        </div>
      </div>

      <div class="flex items-center gap-2 text-xs text-[#8C7665]">
        <span class="font-medium">Instance Initialization</span>
        <span class="h-1.5 w-1.5 rounded-full bg-[#2E7D32]"></span>
        <span class="font-bold text-[#2E7D32]">Ready</span>
      </div>
    </div>
  </header>

  <!-- Main Setup Form Container -->
  <main class="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
    <!-- Header Title -->
    <div class="mb-8 text-center sm:text-left">
      <h1 class="font-serif text-2xl font-bold text-[#231712] sm:text-3xl">
        Inisialisasi & Konfigurasi Awal
      </h1>
      <p class="mt-2 text-sm text-[#735F52]">
        Selamat datang di CafeStock Roastery. Buat akun Administrator Utama dan
        tentukan preferensi sistem Anda di bawah ini (mirip instalasi Gitea).
      </p>
    </div>

    <!-- Error Alert -->
    {#if form?.error}
      <div
        class="mb-6 flex items-start gap-3 rounded-2xl border border-[#F2C2B8] bg-[#FDF2F0] p-4 text-sm text-[#C93B2B] shadow-xs"
      >
        <svg
          class="mt-0.5 h-5 w-5 shrink-0 text-[#C93B2B]"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <div>
          <div class="font-bold">Konfigurasi Belum Lengkap</div>
          <div class="text-xs text-[#A82B1C]">{form.error}</div>
        </div>
      </div>
    {/if}

    <form
      method="POST"
      onsubmit={() => (isSubmitting = true)}
      class="space-y-6"
    >
      <!-- SECTION 1: Administrator Account -->
      <div
        class="overflow-hidden rounded-2xl border border-[#EDE4D8] bg-white shadow-sm"
      >
        <div class="border-b border-[#EDE4D8] bg-[#FAF7F2] px-6 py-4">
          <div class="flex items-center gap-2">
            <svg
              class="h-5 w-5 text-[#7A4D33]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            <h2
              class="text-sm font-bold tracking-wider text-[#2E1F16] uppercase"
            >
              1. Akun Administrator Utama (Super Admin)
            </h2>
          </div>
          <p class="mt-1 text-xs text-[#8C7665]">
            Akun ini akan otomatis disetujui sebagai <strong
              class="text-[#5A3825]">APPROVER</strong
            >
            dan memegang hak kontrol penuh atas seluruh sistem dan staf lainnya.
          </p>
        </div>

        <div class="space-y-4 p-6">
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label
                for="adminName"
                class="block text-xs font-bold tracking-wider text-[#5A4537] uppercase"
              >
                Nama Lengkap / Jabatan <span class="text-[#C93B2B]">*</span>
              </label>
              <input
                id="adminName"
                type="text"
                name="adminName"
                required
                value={form?.adminName ?? ""}
                placeholder="Contoh: Budi Santoso (Head Roaster)"
                class="mt-1.5 w-full rounded-xl border border-[#DDD2C4] bg-[#FCFBF9] px-3.5 py-2.5 text-sm text-[#231712] placeholder-[#B5A597] transition focus:border-[#7A4D33] focus:bg-white focus:ring-2 focus:ring-[#7A4D33]/15 focus:outline-none"
              />
            </div>

            <div>
              <label
                for="adminEmail"
                class="block text-xs font-bold tracking-wider text-[#5A4537] uppercase"
              >
                Email Administrator <span class="text-[#C93B2B]">*</span>
              </label>
              <input
                id="adminEmail"
                type="email"
                name="adminEmail"
                required
                value={form?.adminEmail ?? ""}
                placeholder="admin@cafestock.com"
                class="mt-1.5 w-full rounded-xl border border-[#DDD2C4] bg-[#FCFBF9] px-3.5 py-2.5 text-sm text-[#231712] placeholder-[#B5A597] transition focus:border-[#7A4D33] focus:bg-white focus:ring-2 focus:ring-[#7A4D33]/15 focus:outline-none"
              />
            </div>
          </div>

          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label
                for="adminPassword"
                class="block text-xs font-bold tracking-wider text-[#5A4537] uppercase"
              >
                Password Baru <span class="text-[#C93B2B]">*</span>
              </label>
              <div class="relative mt-1.5">
                <input
                  id="adminPassword"
                  type={showPassword ? "text" : "password"}
                  name="adminPassword"
                  required
                  minlength="8"
                  placeholder="Minimal 8 karakter"
                  class="w-full rounded-xl border border-[#DDD2C4] bg-[#FCFBF9] py-2.5 pr-10 pl-3.5 text-sm text-[#231712] placeholder-[#B5A597] transition focus:border-[#7A4D33] focus:bg-white focus:ring-2 focus:ring-[#7A4D33]/15 focus:outline-none"
                />
                <button
                  type="button"
                  onclick={() => (showPassword = !showPassword)}
                  class="absolute inset-y-0 right-0 flex cursor-pointer items-center pr-3 text-[#A39282] transition hover:text-[#5A3825]"
                  aria-label="Toggle password"
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

            <div>
              <label
                for="adminPasswordConfirm"
                class="block text-xs font-bold tracking-wider text-[#5A4537] uppercase"
              >
                Konfirmasi Password <span class="text-[#C93B2B]">*</span>
              </label>
              <input
                id="adminPasswordConfirm"
                type={showPassword ? "text" : "password"}
                name="adminPasswordConfirm"
                required
                minlength="8"
                placeholder="Ulangi password di atas"
                class="mt-1.5 w-full rounded-xl border border-[#DDD2C4] bg-[#FCFBF9] px-3.5 py-2.5 text-sm text-[#231712] placeholder-[#B5A597] transition focus:border-[#7A4D33] focus:bg-white focus:ring-2 focus:ring-[#7A4D33]/15 focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- SECTION 2: General Application Settings -->
      <div
        class="overflow-hidden rounded-2xl border border-[#EDE4D8] bg-white shadow-sm"
      >
        <div class="border-b border-[#EDE4D8] bg-[#FAF7F2] px-6 py-4">
          <div class="flex items-center gap-2">
            <svg
              class="h-5 w-5 text-[#7A4D33]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"
              />
              <circle cx="12" cy="12" r="3" />
            </svg>
            <h2
              class="text-sm font-bold tracking-wider text-[#2E1F16] uppercase"
            >
              2. Pengaturan Instansi & Roastery
            </h2>
          </div>
          <p class="mt-1 text-xs text-[#8C7665]">
            Identitas brand kafe atau roastery yang digunakan pada kop invoice &
            laporan inventaris.
          </p>
        </div>

        <div class="space-y-4 p-6">
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label
                for="cafeName"
                class="block text-xs font-bold tracking-wider text-[#5A4537] uppercase"
              >
                Nama Brand / Kafe
              </label>
              <input
                id="cafeName"
                type="text"
                name="cafeName"
                value={form?.cafeName ?? "CafeStock Roastery"}
                placeholder="CafeStock Roastery"
                class="mt-1.5 w-full rounded-xl border border-[#DDD2C4] bg-[#FCFBF9] px-3.5 py-2.5 text-sm text-[#231712] placeholder-[#B5A597] transition focus:border-[#7A4D33] focus:bg-white focus:ring-2 focus:ring-[#7A4D33]/15 focus:outline-none"
              />
            </div>

            <div>
              <label
                for="appUrl"
                class="block text-xs font-bold tracking-wider text-[#5A4537] uppercase"
              >
                Base Application URL
              </label>
              <input
                id="appUrl"
                type="url"
                name="appUrl"
                value={form?.appUrl ??
                  data?.suggestedAppUrl ??
                  "http://localhost:3000"}
                placeholder={data?.suggestedAppUrl ?? "http://localhost:3000"}
                class="mt-1.5 w-full rounded-xl border border-[#DDD2C4] bg-[#FCFBF9] px-3.5 py-2.5 text-sm text-[#231712] placeholder-[#B5A597] transition focus:border-[#7A4D33] focus:bg-white focus:ring-2 focus:ring-[#7A4D33]/15 focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- SECTION 3: Optional Integrations (SMTP & Google OAuth) -->
      <div
        class="overflow-hidden rounded-2xl border border-[#EDE4D8] bg-white shadow-sm"
      >
        <button
          type="button"
          onclick={() => (showAdvanced = !showAdvanced)}
          class="flex w-full cursor-pointer items-center justify-between border-b border-[#EDE4D8] bg-[#FAF7F2] px-6 py-4 text-left transition hover:bg-[#F5EDE4]"
        >
          <div class="flex items-center gap-2">
            <svg
              class="h-5 w-5 text-[#7A4D33]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"
              />
              <polyline points="22,6 12,13 2,6" />
            </svg>
            <div>
              <h2
                class="text-sm font-bold tracking-wider text-[#2E1F16] uppercase"
              >
                3. Integrasi Tambahan (SMTP & Google OAuth) — Opsional
              </h2>
              <p class="mt-0.5 text-xs text-[#8C7665]">
                Klik untuk membuka. Anda dapat mengabaikan bagian ini dan
                mengaturnya nanti.
              </p>
            </div>
          </div>
          <svg
            class="h-5 w-5 text-[#8C7665] transition-transform duration-200 {showAdvanced
              ? 'rotate-180 text-[#5A3825]'
              : ''}"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>

        {#if showAdvanced}
          <div class="space-y-6 p-6">
            <!-- Email / SMTP Settings -->
            <div>
              <h3
                class="mb-3 text-xs font-bold tracking-wider text-[#7A4D33] uppercase"
              >
                Pengaturan SMTP Mailer (Kirim Email Notifikasi & OTP)
              </h3>
              <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div class="sm:col-span-2">
                  <label
                    for="smtpHost"
                    class="block text-xs font-semibold text-[#5A4537]"
                    >SMTP Host</label
                  >
                  <input
                    id="smtpHost"
                    type="text"
                    name="smtpHost"
                    value={form?.smtpHost ?? ""}
                    placeholder="smtp.gmail.com / smtp.mailgun.org"
                    class="mt-1 w-full rounded-xl border border-[#DDD2C4] bg-[#FCFBF9] px-3 py-2 text-xs text-[#231712] focus:border-[#7A4D33] focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label
                    for="smtpPort"
                    class="block text-xs font-semibold text-[#5A4537]"
                    >SMTP Port</label
                  >
                  <input
                    id="smtpPort"
                    type="number"
                    name="smtpPort"
                    value={form?.smtpPort ?? "587"}
                    placeholder="587"
                    class="mt-1 w-full rounded-xl border border-[#DDD2C4] bg-[#FCFBF9] px-3 py-2 text-xs text-[#231712] focus:border-[#7A4D33] focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div class="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label
                    for="smtpUser"
                    class="block text-xs font-semibold text-[#5A4537]"
                    >SMTP User / Email</label
                  >
                  <input
                    id="smtpUser"
                    type="text"
                    name="smtpUser"
                    value={form?.smtpUser ?? ""}
                    placeholder="user@example.com"
                    class="mt-1 w-full rounded-xl border border-[#DDD2C4] bg-[#FCFBF9] px-3 py-2 text-xs text-[#231712] focus:border-[#7A4D33] focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label
                    for="smtpPassword"
                    class="block text-xs font-semibold text-[#5A4537]"
                    >SMTP Password</label
                  >
                  <input
                    id="smtpPassword"
                    type="password"
                    name="smtpPassword"
                    placeholder="App password"
                    class="mt-1 w-full rounded-xl border border-[#DDD2C4] bg-[#FCFBF9] px-3 py-2 text-xs text-[#231712] focus:border-[#7A4D33] focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label
                    for="smtpFrom"
                    class="block text-xs font-semibold text-[#5A4537]"
                    >From Address</label
                  >
                  <input
                    id="smtpFrom"
                    type="text"
                    name="smtpFrom"
                    value={form?.smtpFrom ?? ""}
                    placeholder="noreply@cafestock.com"
                    class="mt-1 w-full rounded-xl border border-[#DDD2C4] bg-[#FCFBF9] px-3 py-2 text-xs text-[#231712] focus:border-[#7A4D33] focus:bg-white focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <!-- Google OAuth Settings -->
            <div class="border-t border-[#EDE4D8] pt-5">
              <h3
                class="mb-3 text-xs font-bold tracking-wider text-[#7A4D33] uppercase"
              >
                Pengaturan Google OAuth (Single Sign-On)
              </h3>
              <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label
                    for="googleClientId"
                    class="block text-xs font-semibold text-[#5A4537]"
                    >Google Client ID</label
                  >
                  <input
                    id="googleClientId"
                    type="text"
                    name="googleClientId"
                    value={form?.googleClientId ?? ""}
                    placeholder="apps.googleusercontent.com"
                    class="mt-1 w-full rounded-xl border border-[#DDD2C4] bg-[#FCFBF9] px-3 py-2 text-xs text-[#231712] focus:border-[#7A4D33] focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label
                    for="googleClientSecret"
                    class="block text-xs font-semibold text-[#5A4537]"
                    >Google Client Secret</label
                  >
                  <input
                    id="googleClientSecret"
                    type="password"
                    name="googleClientSecret"
                    placeholder="Client Secret"
                    class="mt-1 w-full rounded-xl border border-[#DDD2C4] bg-[#FCFBF9] px-3 py-2 text-xs text-[#231712] focus:border-[#7A4D33] focus:bg-white focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        {/if}
      </div>

      <!-- Action Button -->
      <div class="pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          class="flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-[#5A3825] px-6 py-4 text-sm font-bold tracking-wide text-white shadow-md transition hover:bg-[#45281A] hover:shadow-lg active:bg-[#341F14] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {#if isSubmitting}
            <svg
              class="h-5 w-5 animate-spin text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              ></circle>
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <span>Memasang & Mengonfigurasi CafeStock...</span>
          {:else}
            <svg
              class="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"
              />
            </svg>
            <span>Pasang & Selesaikan Setup CafeStock</span>
          {/if}
        </button>
        <p class="mt-3 text-center text-xs text-[#8C7665]">
          Setelah setup selesai, halaman konfigurasi ini akan dikunci secara
          permanen demi keamanan.
        </p>
      </div>
    </form>
  </main>
</div>
