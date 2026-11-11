<script lang="ts">
  import { getDictionary } from "@/lib/i18n";
  import type { Setup2FaPageData } from "./+page.server";

  let {
    data,
    form,
  }: {
    data: Setup2FaPageData;
    form: { error?: string; code?: string } | null;
  } = $props();

  let dict = $derived(getDictionary(data.lang));
  let copiedSecret = $state(false);
  let copiedBackupCodes = $state(false);
  let isSubmitting = $state(false);

  function copyToClipboard(text: string, type: "secret" | "codes") {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(text);
      if (type === "secret") {
        copiedSecret = true;
        setTimeout(() => (copiedSecret = false), 2000);
      } else {
        copiedBackupCodes = true;
        setTimeout(() => (copiedBackupCodes = false), 2000);
      }
    }
  }
</script>

<svelte:head>
  <title>Pengaturan Autentikasi 2FA — CafeStock</title>
</svelte:head>

<div
  class="min-h-screen w-full bg-[#FAF7F2] text-[#2D241E] select-none py-10 px-4 sm:px-6 lg:px-8"
>
  <div class="mx-auto max-w-3xl">
    <!-- Header Brand & Navigation -->
    <div
      class="mb-8 flex items-center justify-between border-b border-[#EDE4D8] pb-5"
    >
      <div class="flex items-center gap-3">
        <div
          class="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#7A4D33] bg-[#5A3825] text-[#E5B589] shadow-sm"
        >
          <svg
            class="h-6 w-6"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <rect width="18" height="18" x="3" y="3" rx="2" />
            <path d="m9 12 2 2 4-4" />
          </svg>
        </div>
        <div>
          <span
            class="text-xs font-bold tracking-widest text-[#7A4D33] uppercase"
            >CafeStock Roastery</span
          >
          <h1 class="text-xl font-extrabold tracking-tight text-[#231712]">
            Autentikasi Dua Faktor (2FA)
          </h1>
        </div>
      </div>
      <a
        href="/inventory"
        class="rounded-xl border border-[#DDD2C4] bg-[#FAF7F2] px-4 py-2 text-xs font-bold text-[#5A3825] transition hover:bg-[#5A3825] hover:text-white"
      >
        &larr; Ke Dashboard
      </a>
    </div>

    {#if form?.error}
      <div
        class="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-xs font-semibold text-red-700 shadow-xs"
      >
        {form.error}
      </div>
    {/if}

    {#if data.isAlreadyEnabled}
      <!-- VIEW WHEN 2FA IS ALREADY ACTIVE -->
      <div class="rounded-3xl border border-emerald-200 bg-white p-8 shadow-sm">
        <div class="flex items-center gap-4">
          <div
            class="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700"
          >
            <svg
              class="h-6 w-6"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
              <path d="m9 12 2 2 4-4" />
            </svg>
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h2 class="text-lg font-bold text-[#231712]">
                2FA Authenticator Sedang Aktif
              </h2>
              <span
                class="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800"
                >Dilindungi</span
              >
            </div>
            <p class="mt-1 text-xs text-[#7A6253]">
              Akun <strong>{data.user.email}</strong> saat ini terlindungi dengan
              verifikasi kode OTP 6-digit Google Authenticator pada setiap login.
            </p>
          </div>
        </div>

        <div class="mt-8 border-t border-[#EDE4D8] pt-6">
          <h3 class="text-xs font-bold text-red-800 uppercase tracking-wider">
            Nonaktifkan 2FA
          </h3>
          <p class="mt-1 text-xs text-[#7A6253]">
            Jika Anda ingin mematikan autentikasi 2-faktor, masukkan password
            akun Anda di bawah ini:
          </p>

          <form
            method="POST"
            action="?/disable"
            class="mt-3 flex max-w-md items-center gap-2"
          >
            <input
              type="password"
              name="password"
              required
              placeholder="Masukkan password akun"
              class="w-full rounded-xl border border-[#DDD2C4] bg-[#FAF7F2] px-3.5 py-2.5 text-xs text-[#231712] focus:border-red-500 focus:bg-white focus:outline-none"
            />
            <button
              type="submit"
              class="shrink-0 cursor-pointer rounded-xl border border-red-300 bg-red-600 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-red-700"
            >
              Nonaktifkan 2FA
            </button>
          </form>
        </div>
      </div>
    {:else}
      <!-- VIEW WHEN 2FA IS NOT YET ENABLED (SETUP WIZARD) -->
      <!-- Alert / Notice Box -->
      <div
        class="mb-6 rounded-2xl border border-[#D9C4B3] bg-linear-to-r from-[#FAF2EA] to-[#F5ECE2] p-5 shadow-xs"
      >
        <div class="flex items-start gap-3.5">
          <div
            class="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#5A3825] text-[#E5B589]"
          >
            <svg
              class="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.2"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
              <path d="m9 12 2 2 4-4" />
            </svg>
          </div>
          <div>
            <h2 class="text-sm font-bold text-[#3E2519]">
              Amankan Akun Administrator ({data.user.email})
            </h2>
            <p class="mt-1 text-xs leading-relaxed text-[#6E5444]">
              Scan QR Code di bawah menggunakan <strong
                >Google Authenticator</strong
              >, <strong>Microsoft Authenticator</strong>, atau
              <strong>Aegis</strong> di ponsel Anda.
            </p>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
        <!-- LEFT COLUMN: QR CODE & MANUAL SECRET -->
        <div
          class="flex flex-col gap-4 rounded-3xl border border-[#EDE4D8] bg-white p-6 shadow-sm"
        >
          <div class="flex items-center gap-2">
            <span
              class="flex h-6 w-6 items-center justify-center rounded-full bg-[#5A3825] text-xs font-bold text-white"
              >1</span
            >
            <h3 class="text-sm font-bold text-[#231712]">
              Scan QR Code di Ponsel
            </h3>
          </div>

          <!-- Rendered QR Code Image -->
          <div
            class="flex flex-col items-center justify-center rounded-2xl border border-[#EDE4D8] bg-[#FAF7F2] p-4"
          >
            <img
              src={data.qrCodeDataUrl}
              alt="2FA QR Code"
              class="h-56 w-56 rounded-xl border border-[#DDD2C4] bg-white p-2 shadow-xs transition hover:scale-[1.02]"
            />
            <p class="mt-3 text-center text-[11px] text-[#7A6253]">
              Arahkan kamera aplikasi Authenticator Anda ke QR Code di atas.
            </p>
          </div>

          <!-- Manual Secret Key -->
          <div class="mt-1">
            <label
              for="manualSecret"
              class="block text-xs font-bold text-[#5A3825] uppercase tracking-wider"
            >
              Atau Ketik Kunci Manual
            </label>
            <div class="mt-1.5 flex items-center gap-2">
              <input
                id="manualSecret"
                type="text"
                readonly
                value={data.secret}
                class="w-full rounded-xl border border-[#DDD2C4] bg-[#FAF7F2] px-3 py-2 font-mono text-xs font-bold text-[#231712] focus:outline-none"
              />
              <button
                type="button"
                onclick={() => copyToClipboard(data.secret, "secret")}
                class="shrink-0 cursor-pointer rounded-xl border border-[#7A4D33] bg-[#FAF7F2] px-3 py-2 text-xs font-bold text-[#5A3825] transition hover:bg-[#5A3825] hover:text-white"
              >
                {copiedSecret ? "Tersalin!" : "Salin"}
              </button>
            </div>
          </div>
        </div>

        <!-- RIGHT COLUMN: BACKUP CODES & CONFIRMATION FORM -->
        <div
          class="flex flex-col justify-between gap-6 rounded-3xl border border-[#EDE4D8] bg-white p-6 shadow-sm"
        >
          <div>
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span
                  class="flex h-6 w-6 items-center justify-center rounded-full bg-[#5A3825] text-xs font-bold text-white"
                  >2</span
                >
                <h3 class="text-sm font-bold text-[#231712]">
                  Simpan Kode Cadangan
                </h3>
              </div>
              <button
                type="button"
                onclick={() =>
                  copyToClipboard(data.backupCodes.join("\n"), "codes")}
                class="cursor-pointer text-xs font-bold text-[#7A4D33] hover:underline"
              >
                {copiedBackupCodes ? "Tersalin!" : "Salin Semua"}
              </button>
            </div>

            <p class="mt-2 text-xs text-[#7A6253]">
              Simpan 10 kode cadangan ini di tempat aman. Setiap kode dapat
              digunakan 1 kali jika ponsel hilang.
            </p>

            <!-- Backup codes grid -->
            <div
              class="mt-3 grid grid-cols-2 gap-2 rounded-2xl border border-[#EDE4D8] bg-[#FAF7F2] p-3"
            >
              {#each data.backupCodes as code}
                <div
                  class="rounded-lg border border-[#E5DACD] bg-white px-2 py-1.5 text-center font-mono text-xs font-bold tracking-wider text-[#3E2519]"
                >
                  {code}
                </div>
              {/each}
            </div>
          </div>

          <!-- Confirmation Form -->
          <div class="border-t border-[#EDE4D8] pt-5">
            <div class="flex items-center gap-2 mb-2">
              <span
                class="flex h-6 w-6 items-center justify-center rounded-full bg-[#5A3825] text-xs font-bold text-white"
                >3</span
              >
              <h3 class="text-sm font-bold text-[#231712]">
                Masukkan 6-Digit untuk Aktivasi
              </h3>
            </div>

            <form
              method="POST"
              action="?/enable"
              onsubmit={() => (isSubmitting = true)}
            >
              <input type="hidden" name="secret" value={data.secret} />
              <input
                type="hidden"
                name="hashedCodes"
                value={JSON.stringify(data.hashedCodes)}
              />

              <div class="mt-2">
                <input
                  type="text"
                  name="code"
                  maxlength="6"
                  required
                  autocomplete="one-time-code"
                  placeholder="000000"
                  class="w-full rounded-2xl border border-[#DDD2C4] bg-[#FAF7F2] px-4 py-3 text-center font-mono text-2xl font-bold tracking-[0.3em] text-[#231712] transition focus:border-[#7A4D33] focus:bg-white focus:ring-2 focus:ring-[#7A4D33]/15 focus:outline-none"
                />
              </div>

              <div class="mt-4 flex flex-col gap-2.5">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  class="flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-[#5A3825] px-5 py-3.5 text-sm font-bold tracking-wide text-white shadow-md transition hover:bg-[#45281A] hover:shadow-lg disabled:opacity-50"
                >
                  {#if isSubmitting}
                    <svg
                      class="h-4 w-4 animate-spin text-white"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <circle
                        class="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        stroke-width="4"
                      />
                      <path
                        class="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                    <span>Memverifikasi...</span>
                  {:else}
                    <svg
                      class="h-4 w-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2.5"
                    >
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
                      <path d="m9 12 2 2 4-4" />
                    </svg>
                    <span>Aktifkan 2FA & Lanjut ke Dashboard</span>
                  {/if}
                </button>

                <button
                  type="submit"
                  formaction="?/skip"
                  class="cursor-pointer py-2 text-center text-xs font-semibold text-[#8C7665] transition hover:text-[#5A3825] hover:underline"
                >
                  Lewati untuk sekarang (Atur nanti di Profil Keamanan) &rarr;
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    {/if}
  </div>
</div>
