<script lang="ts">
  import { getDictionary } from "@/lib/i18n";
  import CustomSelect from "@/lib/components/CustomSelect.svelte";
  import Pagination from "@/lib/components/Pagination.svelte";
  import type {
    MasterActionData,
    MasterPageData,
  } from "@/routes/master/+page.server";

  let {
    data,
    form,
  }: {
    data: MasterPageData;
    form: MasterActionData | null;
  } = $props();
  let dict = $derived(getDictionary(data.lang));

  let activeTab = $state<
    "products" | "suppliers" | "warehouses" | "users" | "settings"
  >("products");
  let activeUserSubtab = $state<"all" | "pending">("all");

  $effect(() => {
    if (data.pendingUsers.length > 0) {
      activeUserSubtab = "pending";
    }
  });
  let showNewDrawer = $state(false);
  let pendingRoles = $state<Record<string, "USER" | "APPROVER">>({});
  let copiedCallback = $state(false);

  let confirmModal = $state<{
    open: boolean;
    title: string;
    message: string;
    warning?: string;
    action: string;
    isDanger?: boolean;
    confirmLabel: string;
    fields: Record<string, string>;
  }>({
    open: false,
    title: "",
    message: "",
    action: "",
    isDanger: false,
    confirmLabel: "Konfirmasi",
    fields: {},
  });

  function openConfirm(options: {
    title: string;
    message: string;
    warning?: string;
    action: string;
    isDanger?: boolean;
    confirmLabel: string;
    fields: Record<string, string>;
  }) {
    confirmModal = { open: true, ...options };
  }

  function closeConfirm() {
    confirmModal.open = false;
  }

  const unitOptions = [
    { value: "kg", label: "kg" },
    { value: "liter", label: "liter" },
    { value: "box", label: "box" },
    { value: "pack", label: "pack" },
    { value: "pcs", label: "pcs" },
    { value: "bottle", label: "bottle" },
  ];
  let selectedUnit = $state("kg");

  let newButtonLabel = $derived.by(() => {
    if (showNewDrawer) return dict.closeForm;
    if (activeTab === "products") return dict.newProduct;
    if (activeTab === "suppliers") return dict.newSupplier;
    if (activeTab === "warehouses") return dict.newWarehouse;
    return "";
  });
</script>

<div class="space-y-6">
  <!-- Header Title -->
  <div class="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
    <div>
      <h1 class="font-serif text-2xl font-bold tracking-tight text-[#231712]">
        {dict.navMaster}
      </h1>
      <p class="mt-0.5 text-xs text-[#7D6B5D]">
        {dict.masterSubtitle}
      </p>
    </div>
  </div>

  <!-- KPI Metric Overview Cards -->
  <div class="grid grid-cols-2 gap-3.5 sm:grid-cols-4">
    <button
      type="button"
      onclick={() => (activeTab = "products")}
      class="ui-card flex cursor-pointer items-center gap-3.5 p-4 text-left transition hover:border-[#C68B59] hover:shadow-md {activeTab ===
      'products'
        ? 'border-[#7A4D33] bg-[#FAF7F2] ring-1 ring-[#7A4D33]/20'
        : ''}"
    >
      <div
        class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#FAF2EA] text-[#7A4D33]"
      >
        <svg
          class="h-5 w-5"
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
      </div>
      <div>
        <div
          class="text-[10px] font-bold tracking-wider text-[#8C7665] uppercase"
        >
          {dict.productsSection}
        </div>
        <div class="font-mono text-xl font-extrabold text-[#231712]">
          {data.products.length}
          <span class="text-xs font-normal text-[#8C7665]">SKU</span>
        </div>
      </div>
    </button>

    <button
      type="button"
      onclick={() => (activeTab = "suppliers")}
      class="ui-card flex cursor-pointer items-center gap-3.5 p-4 text-left transition hover:border-[#C68B59] hover:shadow-md {activeTab ===
      'suppliers'
        ? 'border-[#7A4D33] bg-[#FAF7F2] ring-1 ring-[#7A4D33]/20'
        : ''}"
    >
      <div
        class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#FAF2EA] text-[#7A4D33]"
      >
        <svg
          class="h-5 w-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      </div>
      <div>
        <div
          class="text-[10px] font-bold tracking-wider text-[#8C7665] uppercase"
        >
          {dict.suppliersSection}
        </div>
        <div class="font-mono text-xl font-extrabold text-[#231712]">
          {data.suppliers.length}
          <span class="text-xs font-normal text-[#8C7665]">Mitra</span>
        </div>
      </div>
    </button>

    <button
      type="button"
      onclick={() => (activeTab = "warehouses")}
      class="ui-card flex cursor-pointer items-center gap-3.5 p-4 text-left transition hover:border-[#C68B59] hover:shadow-md {activeTab ===
      'warehouses'
        ? 'border-[#7A4D33] bg-[#FAF7F2] ring-1 ring-[#7A4D33]/20'
        : ''}"
    >
      <div
        class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#FAF2EA] text-[#7A4D33]"
      >
        <svg
          class="h-5 w-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      </div>
      <div>
        <div
          class="text-[10px] font-bold tracking-wider text-[#8C7665] uppercase"
        >
          {dict.warehousesSection}
        </div>
        <div class="font-mono text-xl font-extrabold text-[#231712]">
          {data.warehouses.length}
          <span class="text-xs font-normal text-[#8C7665]">Lokasi</span>
        </div>
      </div>
    </button>

    {#if data.isApprover}
      <button
        type="button"
        onclick={() => (activeTab = "users")}
        class="ui-card flex cursor-pointer items-center gap-3.5 p-4 text-left transition hover:border-[#C68B59] hover:shadow-md {activeTab ===
        'users'
          ? 'border-[#7A4D33] bg-[#FAF7F2] ring-1 ring-[#7A4D33]/20'
          : ''} {data.pendingUsers.length > 0
          ? 'border-amber-300 bg-amber-50/40'
          : ''}"
      >
        <div
          class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl {data
            .pendingUsers.length > 0
            ? 'bg-amber-100 text-amber-800'
            : 'bg-[#FAF2EA] text-[#7A4D33]'}"
        >
          <svg
            class="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        </div>
        <div class="min-w-0 flex-1">
          <div
            class="text-[10px] font-bold tracking-wider text-[#8C7665] uppercase truncate"
          >
            {dict.usersManagementSection}
          </div>
          <div class="flex flex-wrap items-baseline gap-1.5 mt-0.5">
            <span class="font-mono text-xl font-extrabold text-[#231712]">
              {data.allUsers.length}
            </span>
            <span class="text-xs font-normal text-[#8C7665]">Akun</span>
            {#if data.pendingUsers.length > 0}
              <span
                class="rounded-full bg-amber-200/90 px-2 py-0.5 text-[10px] font-extrabold text-amber-950 shadow-2xs whitespace-nowrap"
              >
                +{data.pendingUsers.length} Antrean
              </span>
            {/if}
          </div>
        </div>
      </button>
    {/if}
  </div>

  <!-- Tab Bar & Action Toolbar -->
  <div
    class="flex flex-col justify-between gap-3 border-y border-[#EDE4D8] py-3 sm:flex-row sm:items-center"
  >
    <div class="w-full sm:w-auto overflow-x-auto no-scrollbar py-0.5">
      <div class="ui-tabs">
        <button
          type="button"
          onclick={() => (activeTab = "products")}
          class="ui-tab cursor-pointer {activeTab === 'products'
            ? 'ui-tab-active'
            : ''}"
        >
          {dict.productsSection} ({data.products.length})
        </button>
        <button
          type="button"
          onclick={() => (activeTab = "suppliers")}
          class="ui-tab cursor-pointer {activeTab === 'suppliers'
            ? 'ui-tab-active'
            : ''}"
        >
          {dict.suppliersSection} ({data.suppliers.length})
        </button>
        <button
          type="button"
          onclick={() => (activeTab = "warehouses")}
          class="ui-tab cursor-pointer {activeTab === 'warehouses'
            ? 'ui-tab-active'
            : ''}"
        >
          {dict.warehousesSection} ({data.warehouses.length})
        </button>
        {#if data.isApprover}
          <button
            type="button"
            onclick={() => (activeTab = "users")}
            class="ui-tab cursor-pointer {activeTab === 'users'
              ? 'ui-tab-active'
              : ''}"
          >
            {dict.usersManagementSection} ({data.allUsers.length})
            {#if data.pendingUsers.length > 0}
              <span
                class="ml-2 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-extrabold tracking-wide {activeTab ===
                'users'
                  ? 'bg-[#FAF7F2] text-[#5A3825] shadow-xs'
                  : 'border border-amber-300 bg-amber-100 text-amber-900'}"
              >
                {data.pendingUsers.length} Pending
              </span>
            {/if}
          </button>
          <button
            type="button"
            onclick={() => (activeTab = "settings")}
            class="ui-tab cursor-pointer {activeTab === 'settings'
              ? 'ui-tab-active'
              : ''}"
          >
            <svg
              class="-mt-0.5 mr-1 inline h-3.5 w-3.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <circle cx="12" cy="12" r="3" />
              <path
                d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"
              />
            </svg>
            {dict.systemSettingsSection}
          </button>
        {/if}
      </div>
    </div>

    {#if activeTab !== "users" && activeTab !== "settings"}
      <button
        type="button"
        onclick={() => (showNewDrawer = !showNewDrawer)}
        class="ui-btn cursor-pointer w-full sm:w-auto shrink-0"
      >
        {newButtonLabel}
      </button>
    {/if}
  </div>

  {#if form?.error}
    <div
      class="flex items-center gap-2 rounded-xl border border-[#F5C2C7] bg-[#FFF5F5] px-4 py-3 text-xs font-semibold text-[#C62828]"
    >
      <span class="h-2 w-2 rounded-full bg-[#C62828]"></span>
      <span>{form.error}</span>
    </div>
  {/if}
  {#if form?.success}
    <div
      class="flex items-center gap-2 rounded-xl border border-[#B2D3C1] bg-[#E7F2EC] px-4 py-3 text-xs font-semibold text-[#1D593B]"
    >
      <span class="h-2 w-2 rounded-full bg-[#1D593B]"></span>
      <span>{form.success}</span>
    </div>
  {/if}

  <!-- Collapsible Creation Card -->
  {#if showNewDrawer}
    <div class="ui-card p-5 sm:p-6">
      {#if activeTab === "products"}
        <div class="mb-4 border-b border-[#F0E7DD] pb-3">
          <h2 class="font-serif text-base font-bold text-[#231712]">
            {dict.addProductTitle}
          </h2>
        </div>
        <form
          method="POST"
          action="?/createProduct"
          class="grid grid-cols-1 items-end gap-3.5 sm:grid-cols-2 lg:grid-cols-6"
        >
          <div>
            <label
              for="prod-sku"
              class="mb-1.5 block text-[11px] font-bold tracking-wider text-[#5A4537] uppercase"
              >{dict.thSku}</label
            >
            <input
              id="prod-sku"
              type="text"
              name="sku"
              required
              placeholder="COF-001"
              class="ui-input font-mono uppercase"
            />
          </div>
          <div>
            <label
              for="prod-name"
              class="mb-1.5 block text-[11px] font-bold tracking-wider text-[#5A4537] uppercase"
              >{dict.thProductName}</label
            >
            <input
              id="prod-name"
              type="text"
              name="name"
              required
              placeholder="Arabica Gayo"
              class="ui-input"
            />
          </div>
          <div>
            <label
              for="prod-cat"
              class="mb-1.5 block text-[11px] font-bold tracking-wider text-[#5A4537] uppercase"
              >{dict.thCategory}</label
            >
            <input
              id="prod-cat"
              type="text"
              name="category"
              required
              placeholder="Coffee Beans"
              class="ui-input"
            />
          </div>
          <div>
            <label
              for="prod-unit"
              class="mb-1.5 block text-[11px] font-bold tracking-wider text-[#5A4537] uppercase"
              >{dict.thUnit}</label
            >
            <CustomSelect
              name="unit"
              bind:value={selectedUnit}
              options={unitOptions}
            />
          </div>
          <div>
            <label
              for="prod-min"
              class="mb-1.5 block text-[11px] font-bold tracking-wider text-[#5A4537] uppercase"
              >{dict.thMinThreshold}</label
            >
            <input
              id="prod-min"
              type="number"
              name="minStock"
              value="10"
              min="0"
              required
              class="ui-input tabular-nums"
            />
          </div>
          <button type="submit" class="ui-btn w-full cursor-pointer">
            {dict.saveProduct}
          </button>
        </form>
      {:else if activeTab === "suppliers"}
        <div class="mb-4 border-b border-[#F0E7DD] pb-3">
          <h2 class="font-serif text-base font-bold text-[#231712]">
            {dict.addSupplierTitle}
          </h2>
        </div>
        <form
          method="POST"
          action="?/createSupplier"
          class="grid grid-cols-1 items-end gap-3.5 sm:grid-cols-2 lg:grid-cols-6"
        >
          <div>
            <label
              for="sup-code"
              class="mb-1.5 block text-[11px] font-bold tracking-wider text-[#5A4537] uppercase"
              >{dict.thSupplierCode}</label
            >
            <input
              id="sup-code"
              type="text"
              name="code"
              required
              placeholder="SUP-001"
              class="ui-input font-mono uppercase"
            />
          </div>
          <div>
            <label
              for="sup-name"
              class="mb-1.5 block text-[11px] font-bold tracking-wider text-[#5A4537] uppercase"
              >{dict.thSupplierName}</label
            >
            <input
              id="sup-name"
              type="text"
              name="name"
              required
              placeholder="Nusantara Roasters"
              class="ui-input"
            />
          </div>
          <div>
            <label
              for="sup-email"
              class="mb-1.5 block text-[11px] font-bold tracking-wider text-[#5A4537] uppercase"
              >{dict.thContactEmail}</label
            >
            <input
              id="sup-email"
              type="email"
              name="contactEmail"
              required
              placeholder="order@supplier.id"
              class="ui-input"
            />
          </div>
          <div>
            <label
              for="sup-phone"
              class="mb-1.5 block text-[11px] font-bold tracking-wider text-[#5A4537] uppercase"
              >{dict.thPhone}</label
            >
            <input
              id="sup-phone"
              type="text"
              name="phone"
              required
              placeholder="+62-811-2233"
              class="ui-input"
            />
          </div>
          <div>
            <label
              for="sup-address"
              class="mb-1.5 block text-[11px] font-bold tracking-wider text-[#5A4537] uppercase"
              >{dict.thAddress}</label
            >
            <input
              id="sup-address"
              type="text"
              name="address"
              required
              placeholder="Bandung Roastery Facility"
              class="ui-input"
            />
          </div>
          <button type="submit" class="ui-btn w-full cursor-pointer">
            {dict.saveSupplier}
          </button>
        </form>
      {:else}
        <div class="mb-4 border-b border-[#F0E7DD] pb-3">
          <h2 class="font-serif text-base font-bold text-[#231712]">
            {dict.addWarehouseTitle}
          </h2>
        </div>
        <form
          method="POST"
          action="?/createWarehouse"
          class="grid grid-cols-1 items-end gap-3.5 sm:grid-cols-2 lg:grid-cols-4"
        >
          <div>
            <label
              for="wh-code"
              class="mb-1.5 block text-[11px] font-bold tracking-wider text-[#5A4537] uppercase"
              >{dict.thWarehouseCode}</label
            >
            <input
              id="wh-code"
              type="text"
              name="code"
              required
              placeholder="WH-SBY"
              class="ui-input font-mono uppercase"
            />
          </div>
          <div>
            <label
              for="wh-name"
              class="mb-1.5 block text-[11px] font-bold tracking-wider text-[#5A4537] uppercase"
              >{dict.thWarehouseName}</label
            >
            <input
              id="wh-name"
              type="text"
              name="name"
              required
              placeholder="Surabaya Hub"
              class="ui-input"
            />
          </div>
          <div>
            <label
              for="wh-loc"
              class="mb-1.5 block text-[11px] font-bold tracking-wider text-[#5A4537] uppercase"
              >{dict.thAddress}</label
            >
            <input
              id="wh-loc"
              type="text"
              name="address"
              required
              placeholder="Jl. Darmo No. 18"
              class="ui-input"
            />
          </div>
          <button type="submit" class="ui-btn w-full cursor-pointer">
            {dict.saveWarehouse}
          </button>
        </form>
      {/if}
    </div>
  {/if}

  <!-- Table Card -->
  <div class="ui-card overflow-hidden">
    {#if activeTab === "products"}
      <div
        class="flex items-center justify-between border-b border-[#EDE4D8] bg-[#FAF7F2] px-4 py-1.5 text-[11px] font-medium text-[#8C7665] sm:hidden"
      >
        <span>← Geser tabel untuk kolom lengkap →</span>
        <span
          class="rounded bg-[#EFE7DE] px-1.5 py-0.5 font-mono text-[10px] text-[#5A3825]"
          >6 Kolom</span
        >
      </div>
      <div class="overflow-x-auto">
        <table class="w-full min-w-180 border-collapse text-left text-xs">
          <thead>
            <tr
              class="border-b border-[#EDE4D8] bg-[#FAF7F2] text-[10px] font-bold tracking-wider text-[#8C7665] uppercase whitespace-nowrap"
            >
              <th class="px-5 py-3.5">{dict.thSku}</th>
              <th class="px-5 py-3.5">{dict.thProductName}</th>
              <th class="px-5 py-3.5">{dict.thCategory}</th>
              <th class="px-5 py-3.5">{dict.thUnit}</th>
              <th class="px-5 py-3.5 text-right">{dict.thMinThreshold}</th>
              <th class="px-5 py-3.5 text-center">{dict.thStatus}</th>
              {#if data.isApprover}
                <th class="px-5 py-3.5 text-right">{dict.actions}</th>
              {/if}
            </tr>
          </thead>
          <tbody class="divide-y divide-[#F5EDE4] whitespace-nowrap">
            {#if data.products.length === 0}
              <tr>
                <td
                  colspan={data.isApprover ? 7 : 6}
                  class="py-12 text-center text-xs text-[#8C7665]"
                >
                  <p class="font-serif text-sm font-bold text-[#2E1F16]">
                    Belum ada data produk
                  </p>
                  <p class="mt-1 text-[#A8988B]">
                    Klik "+ New Product" di atas untuk menambahkan produk
                    pertama ke dalam katalog.
                  </p>
                </td>
              </tr>
            {:else}
              {#each data.products as prod}
                <tr class="transition hover:bg-[#FAF7F2]">
                  <td
                    class="px-5 py-3.5 font-mono text-xs font-bold text-[#5A3825]"
                  >
                    {prod.sku}
                  </td>
                  <td class="px-5 py-3.5 font-semibold text-[#2E1F16]">
                    {prod.name}
                  </td>
                  <td class="px-5 py-3.5 text-[#6A574A]">{prod.category}</td>
                  <td class="px-5 py-3.5 font-mono text-[#6A574A]">
                    {prod.unit}
                  </td>
                  <td
                    class="px-5 py-3.5 text-right font-mono font-semibold text-[#2E1F16] tabular-nums"
                  >
                    {prod.minStock}
                  </td>
                  <td class="px-5 py-3.5 text-center">
                    <form
                      method="POST"
                      action="?/toggleProduct"
                      class="inline-block"
                    >
                      <input type="hidden" name="id" value={prod.id} />
                      <input
                        type="hidden"
                        name="isActive"
                        value={String(prod.isActive)}
                      />
                      <button
                        type="submit"
                        class="cursor-pointer ui-badge transition hover:scale-105 {prod.isActive
                          ? 'border-[#B2D3C1] bg-[#E7F2EC] text-[#1D593B]'
                          : 'border-[#E6B8B3] bg-[#FCEAE8] text-[#9E2A20]'}"
                      >
                        <span
                          class="ui-badge-dot {prod.isActive
                            ? 'bg-[#1D593B]'
                            : 'bg-[#9E2A20]'}"
                        ></span>
                        <span
                          >{prod.isActive
                            ? dict.activeStatus
                            : dict.inactiveStatus}</span
                        >
                      </button>
                    </form>
                  </td>
                  {#if data.isApprover}
                    <td class="px-5 py-3.5 text-right">
                      <button
                        type="button"
                        onclick={() =>
                          openConfirm({
                            title: `Hapus Produk ${prod.sku}`,
                            message: `Apakah Anda yakin ingin menghapus produk '${prod.name}' (${prod.sku}) secara permanen?`,
                            confirmLabel: "Ya, Hapus Produk",
                            isDanger: true,
                            action: "?/deleteProduct",
                            fields: { id: prod.id },
                          })}
                        class="cursor-pointer rounded-lg border border-[#F5C2C7] bg-[#FFF5F5] px-2.5 py-1 text-[11px] font-semibold text-[#C62828] transition hover:bg-[#FFEBEB] active:scale-95"
                      >
                        Hapus
                      </button>
                    </td>
                  {/if}
                </tr>
              {/each}
            {/if}
          </tbody>
        </table>
      </div>

      <Pagination
        page={data.productsPagination.page}
        limit={data.productsPagination.limit}
        total={data.productsPagination.total}
        totalPages={data.productsPagination.totalPages}
      />
    {:else if activeTab === "suppliers"}
      <div
        class="flex items-center justify-between border-b border-[#EDE4D8] bg-[#FAF7F2] px-4 py-1.5 text-[11px] font-medium text-[#8C7665] sm:hidden"
      >
        <span>← Geser tabel untuk kolom lengkap →</span>
        <span
          class="rounded bg-[#EFE7DE] px-1.5 py-0.5 font-mono text-[10px] text-[#5A3825]"
          >{data.isApprover ? "6 Kolom" : "5 Kolom"}</span
        >
      </div>
      <div class="overflow-x-auto">
        <table class="w-full min-w-175 border-collapse text-left text-xs">
          <thead>
            <tr
              class="border-b border-[#EDE4D8] bg-[#FAF7F2] text-[10px] font-bold tracking-wider text-[#8C7665] uppercase whitespace-nowrap"
            >
              <th class="px-5 py-3.5">{dict.thSupplierCode}</th>
              <th class="px-5 py-3.5">{dict.thSupplierName}</th>
              <th class="px-5 py-3.5">{dict.thContactEmail}</th>
              <th class="px-5 py-3.5">{dict.thPhone}</th>
              <th class="px-5 py-3.5">{dict.thAddress}</th>
              {#if data.isApprover}
                <th class="px-5 py-3.5 text-right">{dict.actions}</th>
              {/if}
            </tr>
          </thead>
          <tbody class="divide-y divide-[#F5EDE4] whitespace-nowrap">
            {#if data.suppliers.length === 0}
              <tr>
                <td
                  colspan={data.isApprover ? 6 : 5}
                  class="py-12 text-center text-xs text-[#8C7665]"
                >
                  <p class="font-serif text-sm font-bold text-[#2E1F16]">
                    Belum ada data pemasok
                  </p>
                  <p class="mt-1 text-[#A8988B]">
                    Klik "+ New Supplier" di atas untuk mendaftarkan mitra
                    pemasok baru.
                  </p>
                </td>
              </tr>
            {:else}
              {#each data.suppliers as sup}
                <tr class="transition hover:bg-[#FAF7F2]">
                  <td
                    class="px-5 py-3.5 font-mono text-xs font-bold text-[#5A3825]"
                  >
                    {sup.code}
                  </td>
                  <td class="px-5 py-3.5 font-semibold text-[#2E1F16]">
                    {sup.name}
                  </td>
                  <td class="px-5 py-3.5 text-[#6A574A]">{sup.contactEmail}</td>
                  <td class="px-5 py-3.5 font-mono text-[#6A574A]">
                    {sup.phone}
                  </td>
                  <td class="px-5 py-3.5 text-[#6A574A]">{sup.address}</td>
                  {#if data.isApprover}
                    <td class="px-5 py-3.5 text-right">
                      <button
                        type="button"
                        onclick={() =>
                          openConfirm({
                            title: `Hapus Pemasok ${sup.code}`,
                            message: `Apakah Anda yakin ingin menghapus mitra pemasok '${sup.name}' (${sup.code}) secara permanen?`,
                            confirmLabel: "Ya, Hapus Pemasok",
                            isDanger: true,
                            action: "?/deleteSupplier",
                            fields: { id: sup.id },
                          })}
                        class="cursor-pointer rounded-lg border border-[#F5C2C7] bg-[#FFF5F5] px-2.5 py-1 text-[11px] font-semibold text-[#C62828] transition hover:bg-[#FFEBEB] active:scale-95"
                      >
                        Hapus
                      </button>
                    </td>
                  {/if}
                </tr>
              {/each}
            {/if}
          </tbody>
        </table>
      </div>

      <Pagination
        page={data.suppliersPagination.page}
        limit={data.suppliersPagination.limit}
        total={data.suppliersPagination.total}
        totalPages={data.suppliersPagination.totalPages}
      />
    {:else if activeTab === "warehouses"}
      <div
        class="flex items-center justify-between border-b border-[#EDE4D8] bg-[#FAF7F2] px-4 py-1.5 text-[11px] font-medium text-[#8C7665] sm:hidden"
      >
        <span>← Geser tabel untuk kolom lengkap →</span>
        <span
          class="rounded bg-[#EFE7DE] px-1.5 py-0.5 font-mono text-[10px] text-[#5A3825]"
          >{data.isApprover ? "4 Kolom" : "3 Kolom"}</span
        >
      </div>
      <div class="overflow-x-auto">
        <table class="w-full min-w-150 border-collapse text-left text-xs">
          <thead>
            <tr
              class="border-b border-[#EDE4D8] bg-[#FAF7F2] text-[10px] font-bold tracking-wider text-[#8C7665] uppercase whitespace-nowrap"
            >
              <th class="px-5 py-3.5">{dict.thWarehouseCode}</th>
              <th class="px-5 py-3.5">{dict.thWarehouseName}</th>
              <th class="px-5 py-3.5">{dict.thAddress}</th>
              {#if data.isApprover}
                <th class="px-5 py-3.5 text-right">{dict.actions}</th>
              {/if}
            </tr>
          </thead>
          <tbody class="divide-y divide-[#F5EDE4] whitespace-nowrap">
            {#if data.warehouses.length === 0}
              <tr>
                <td
                  colspan={data.isApprover ? 4 : 3}
                  class="py-12 text-center text-xs text-[#8C7665]"
                >
                  <p class="font-serif text-sm font-bold text-[#2E1F16]">
                    Belum ada data fasilitas gudang
                  </p>
                  <p class="mt-1 text-[#A8988B]">
                    Klik "+ New Warehouse" di atas untuk menambahkan lokasi
                    gudang atau cabang roastery.
                  </p>
                </td>
              </tr>
            {:else}
              {#each data.warehouses as wh}
                <tr class="transition hover:bg-[#FAF7F2]">
                  <td
                    class="px-5 py-3.5 font-mono text-xs font-bold text-[#5A3825]"
                  >
                    {wh.code}
                  </td>
                  <td class="px-5 py-3.5 font-semibold text-[#2E1F16]">
                    {wh.name}
                  </td>
                  <td class="px-5 py-3.5 text-[#6A574A]">{wh.address}</td>
                  {#if data.isApprover}
                    <td class="px-5 py-3.5 text-right">
                      <button
                        type="button"
                        onclick={() =>
                          openConfirm({
                            title: `Hapus Gudang ${wh.code}`,
                            message: `Apakah Anda yakin ingin menghapus fasilitas gudang '${wh.name}' (${wh.code}) secara permanen?`,
                            confirmLabel: "Ya, Hapus Gudang",
                            isDanger: true,
                            action: "?/deleteWarehouse",
                            fields: { id: wh.id },
                          })}
                        class="cursor-pointer rounded-lg border border-[#F5C2C7] bg-[#FFF5F5] px-2.5 py-1 text-[11px] font-semibold text-[#C62828] transition hover:bg-[#FFEBEB] active:scale-95"
                      >
                        Hapus
                      </button>
                    </td>
                  {/if}
                </tr>
              {/each}
            {/if}
          </tbody>
        </table>
      </div>

      <Pagination
        page={data.warehousesPagination.page}
        limit={data.warehousesPagination.limit}
        total={data.warehousesPagination.total}
        totalPages={data.warehousesPagination.totalPages}
      />
    {:else if activeTab === "users"}
      <!-- User Management & Access Control Tab -->
      <div class="space-y-4">
        <!-- Subtab Filter Bar -->
        <div
          class="flex flex-col gap-2.5 border-b border-[#EDE4D8] bg-[#FAF7F2] px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5"
        >
          <div
            class="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5"
          >
            <button
              type="button"
              onclick={() => (activeUserSubtab = "all")}
              class="cursor-pointer whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-semibold shrink-0 transition {activeUserSubtab ===
              'all'
                ? 'bg-[#5A3825] text-white shadow-xs'
                : 'text-[#7A6453] hover:bg-[#EFE7DE]'}"
            >
              Semua Pengguna Terdaftar ({data.allUsers.length})
            </button>
            <button
              type="button"
              onclick={() => (activeUserSubtab = "pending")}
              class="flex cursor-pointer whitespace-nowrap items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold shrink-0 transition {activeUserSubtab ===
              'pending'
                ? 'bg-[#5A3825] text-white shadow-xs'
                : 'text-[#7A6453] hover:bg-[#EFE7DE]'}"
            >
              <span
                >Antrean Menunggu Persetujuan ({data.pendingUsers.length})</span
              >
            </button>
          </div>
          <span class="text-[11px] text-[#8C7665]">
            Hanya akun dengan peran <strong class="text-[#5A3825]"
              >APPROVER</strong
            > yang memiliki hak akses halaman ini.
          </span>
        </div>

        {#if activeUserSubtab === "pending"}
          <!-- Pending Approvals Table -->
          <div class="overflow-x-auto">
            {#if data.pendingUsers.length === 0}
              <div class="p-12 text-center text-xs text-[#8C7665]">
                <div
                  class="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200"
                >
                  <svg
                    class="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <p class="font-serif text-base font-bold text-[#2E1F16]">
                  {dict.noPendingUsers}
                </p>
                <p class="mt-1 text-[#A8988B]">
                  Seluruh akun pendaftaran staf baru telah disetujui atau tidak
                  ada antrean pending saat ini.
                </p>
              </div>
            {:else}
              <div
                class="flex items-center justify-between border-b border-[#EDE4D8] bg-[#FAF7F2] px-4 py-1.5 text-[11px] font-medium text-[#8C7665] sm:hidden"
              >
                <span>← Geser tabel untuk penetapan peran & persetujuan →</span>
                <span
                  class="rounded bg-[#EFE7DE] px-1.5 py-0.5 font-mono text-[10px] text-[#5A3825]"
                  >5 Kolom</span
                >
              </div>
              <table
                class="w-full min-w-187.5 border-collapse text-left text-xs"
              >
                <thead>
                  <tr
                    class="border-b border-[#EDE4D8] bg-[#FAF7F2] text-[10px] font-bold tracking-wider text-[#8C7665] uppercase whitespace-nowrap"
                  >
                    <th class="px-5 py-3.5">Nama & Profil</th>
                    <th class="px-5 py-3.5">{dict.emailLabel}</th>
                    <th class="px-5 py-3.5">{dict.registeredAt}</th>
                    <th class="px-5 py-3.5">Penetapan Peran (Role)</th>
                    <th class="px-5 py-3.5 text-right">{dict.actions}</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-[#F5EDE4] whitespace-nowrap">
                  {#each data.pendingUsers as u}
                    <tr class="transition hover:bg-[#FAF7F2]">
                      <td class="px-5 py-3.5">
                        <div class="flex items-center gap-2.5">
                          <div
                            class="flex h-8 w-8 items-center justify-center rounded-full border border-[#D5C5B5] bg-[#EFE7DE] text-xs font-bold text-[#5A3825]"
                          >
                            {u.name.slice(0, 2).toUpperCase()}
                          </div>
                          <span class="font-semibold text-[#2E1F16]"
                            >{u.name}</span
                          >
                        </div>
                      </td>
                      <td class="px-5 py-3.5 font-mono text-[#5A3825]">
                        {u.email}
                      </td>
                      <td class="px-5 py-3.5 text-[#6A574A]">
                        {new Date(u.createdAt).toLocaleString()}
                      </td>
                      <td class="px-5 py-3.5">
                        <!-- Custom Segmented Role Selector (Anti-AI-Slop & Anti-Default-Select) -->
                        <div
                          class="inline-flex rounded-lg border border-[#EDE4D8] bg-[#F5EDE4] p-0.5 text-[11px] shadow-2xs"
                        >
                          <button
                            type="button"
                            onclick={() => (pendingRoles[u.id] = "USER")}
                            class="cursor-pointer rounded-md px-2.5 py-1 font-semibold transition {(pendingRoles[
                              u.id
                            ] ?? 'USER') === 'USER'
                              ? 'bg-[#5A3825] text-white shadow-xs'
                              : 'text-[#7A6453] hover:text-[#231712]'}"
                          >
                            Staff (USER)
                          </button>
                          <button
                            type="button"
                            onclick={() => (pendingRoles[u.id] = "APPROVER")}
                            class="cursor-pointer rounded-md px-2.5 py-1 font-semibold transition {pendingRoles[
                              u.id
                            ] === 'APPROVER'
                              ? 'bg-[#7A4D33] text-white shadow-xs'
                              : 'text-[#7A6453] hover:text-[#231712]'}"
                          >
                            Manajer (APPROVER)
                          </button>
                        </div>
                      </td>
                      <td class="px-5 py-3.5 text-right">
                        <div class="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onclick={() =>
                              openConfirm({
                                title: "Konfirmasi Persetujuan Akun",
                                message: `Apakah Anda yakin ingin menyetujui pendaftaran dan mengaktifkan akun ${u.name} (${u.email}) dengan peran ${pendingRoles[u.id] ?? "USER"}?`,
                                action: "?/approveUser",
                                confirmLabel: "Setujui & Aktifkan",
                                fields: {
                                  id: u.id,
                                  role: pendingRoles[u.id] ?? "USER",
                                },
                              })}
                            class="cursor-pointer rounded-lg bg-[#5A3825] px-3 py-1.5 text-[11px] font-bold text-white shadow-xs transition hover:bg-[#45281A] hover:shadow-sm"
                          >
                            Setujui & Aktifkan
                          </button>
                          <button
                            type="button"
                            onclick={() =>
                              openConfirm({
                                title: "Konfirmasi Penolakan Pendaftaran",
                                message: `Apakah Anda yakin ingin menolak pengajuan akun dari ${u.name} (${u.email})?`,
                                warning:
                                  "Peringatan: Data pendaftaran akun ini akan dihapus secara permanen dari database.",
                                action: "?/rejectUser",
                                isDanger: true,
                                confirmLabel: "Tolak & Hapus",
                                fields: { id: u.id },
                              })}
                            class="cursor-pointer rounded-lg border border-[#F5C2C7] bg-[#FFF5F5] px-2.5 py-1.5 text-[11px] font-bold text-[#C62828] transition hover:bg-[#FFEBEE]"
                          >
                            {dict.rejectAccount}
                          </button>
                        </div>
                      </td>
                    </tr>
                  {/each}
                </tbody>
              </table>
            {/if}
          </div>
        {:else}
          <div
            class="flex items-center justify-between border-b border-[#EDE4D8] bg-[#FAF7F2] px-4 py-1.5 text-[11px] font-medium text-[#8C7665] sm:hidden"
          >
            <span>← Geser tabel untuk informasi akun lengkap →</span>
            <span
              class="rounded bg-[#EFE7DE] px-1.5 py-0.5 font-mono text-[10px] text-[#5A3825]"
              >7 Kolom</span
            >
          </div>
          <!-- All Registered Users Table -->
          <div class="overflow-x-auto">
            <table class="w-full min-w-212.5 border-collapse text-left text-xs">
              <thead>
                <tr
                  class="border-b border-[#EDE4D8] bg-[#FAF7F2] text-[10px] font-bold tracking-wider text-[#8C7665] uppercase whitespace-nowrap"
                >
                  <th class="px-5 py-3.5">Nama & Profil</th>
                  <th class="px-5 py-3.5">{dict.emailLabel}</th>
                  <th class="px-5 py-3.5">Peran (Role)</th>
                  <th class="px-5 py-3.5">Autentikasi 2FA</th>
                  <th class="px-5 py-3.5">Status Akun</th>
                  <th class="px-5 py-3.5">Terdaftar Pada</th>
                  <th class="px-5 py-3.5 text-right">{dict.actions}</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-[#F5EDE4] whitespace-nowrap">
                {#each data.allUsers as u}
                  <tr class="transition hover:bg-[#FAF7F2]">
                    <td class="px-5 py-3.5">
                      <div class="flex items-center gap-2.5">
                        <div
                          class="flex h-8 w-8 items-center justify-center rounded-full border border-[#D5C5B5] bg-[#EFE7DE] text-xs font-bold text-[#5A3825]"
                        >
                          {u.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div class="font-semibold text-[#2E1F16]">
                            {u.name}
                            {#if u.id === data.currentUserId}
                              <span
                                class="ml-1 rounded-md bg-[#EDE4D8] px-1.5 py-0.5 text-[9px] font-bold text-[#7A4D33]"
                              >
                                Anda
                              </span>
                            {/if}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td class="px-5 py-3.5 font-mono text-[#5A3825]">
                      {u.email}
                    </td>
                    <td class="px-5 py-3.5">
                      {#if u.role === "APPROVER"}
                        <span
                          class="inline-flex items-center gap-1 rounded-md border border-[#D4A373] bg-[#FAF2EA] px-2 py-0.5 text-[10px] font-bold text-[#7A4D33]"
                        >
                          <svg
                            class="h-3 w-3"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                          >
                            <path
                              d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                            />
                          </svg>
                          Manajer (APPROVER)
                        </span>
                      {:else}
                        <span
                          class="inline-flex items-center rounded-md border border-[#D5C5B5] bg-[#F5EDE4] px-2 py-0.5 text-[10px] font-semibold text-[#5A3825]"
                        >
                          Staff (USER)
                        </span>
                      {/if}
                    </td>
                    <td class="px-5 py-3.5">
                      {#if u.totpEnabled}
                        <span
                          class="inline-flex items-center gap-1 rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700"
                        >
                          <span class="h-1.5 w-1.5 rounded-full bg-emerald-500"
                          ></span>
                          2FA Aktif
                        </span>
                      {:else}
                        <span
                          class="inline-flex items-center rounded-md border border-stone-200 bg-stone-50 px-2 py-0.5 text-[10px] text-stone-500"
                        >
                          Non-aktif
                        </span>
                      {/if}
                    </td>
                    <td class="px-5 py-3.5">
                      {#if u.isActive}
                        <span
                          class="inline-flex items-center rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700"
                        >
                          Aktif
                        </span>
                      {:else}
                        <span
                          class="inline-flex items-center rounded-md border border-rose-200 bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-700"
                        >
                          Dinonaktifkan
                        </span>
                      {/if}
                    </td>
                    <td class="px-5 py-3.5 text-[#6A574A]">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td class="px-5 py-3.5 text-right">
                      <div class="flex items-center justify-end gap-1.5">
                        <!-- Toggle Role Action -->
                        <button
                          type="button"
                          disabled={u.id === data.currentUserId &&
                            u.role === "APPROVER" &&
                            data.allUsers.filter(
                              (x) => x.role === "APPROVER" && x.isActive,
                            ).length <= 1}
                          onclick={() => {
                            const newRole =
                              u.role === "APPROVER" ? "USER" : "APPROVER";
                            openConfirm({
                              title: "Konfirmasi Perubahan Peran",
                              message: `Ubah peran akun ${u.name} (${u.email}) dari ${u.role} menjadi ${newRole}?`,
                              action: "?/updateUserRole",
                              confirmLabel: `Jadikan ${newRole}`,
                              fields: { id: u.id, role: newRole },
                            });
                          }}
                          class="cursor-pointer rounded-lg border border-[#DDD2C4] bg-white px-2 py-1 text-[11px] font-medium text-[#2E1F16] transition hover:bg-[#FAF7F2] disabled:cursor-not-allowed disabled:opacity-40"
                          title="Ganti peran antara Staff dan Manajer"
                        >
                          {u.role === "APPROVER"
                            ? "Ubah ke Staff"
                            : "Jadikan Manajer"}
                        </button>

                        <!-- Suspend / Activate Action -->
                        {#if u.id !== data.currentUserId}
                          <button
                            type="button"
                            onclick={() =>
                              openConfirm({
                                title: u.isActive
                                  ? "Konfirmasi Penonaktifan Akun"
                                  : "Konfirmasi Pengaktifan Akun",
                                message: u.isActive
                                  ? `Nonaktifkan akun ${u.name} (${u.email})? Pengguna akan langsung dikeluarkan dari sesi aktif dan tidak dapat login ke sistem.`
                                  : `Aktifkan kembali akun ${u.name} (${u.email}) agar dapat login kembali?`,
                                action: "?/toggleUserStatus",
                                isDanger: u.isActive,
                                confirmLabel: u.isActive
                                  ? "Nonaktifkan Akun"
                                  : "Aktifkan Akun",
                                fields: {
                                  id: u.id,
                                  isActive: u.isActive ? "false" : "true",
                                },
                              })}
                            class="cursor-pointer rounded-lg border px-2 py-1 text-[11px] font-medium transition {u.isActive
                              ? 'border-amber-200 bg-amber-50/60 text-amber-800 hover:bg-amber-100'
                              : 'border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100'}"
                          >
                            {u.isActive ? "Suspend" : "Aktifkan"}
                          </button>

                          <!-- Force Delete Action -->
                          <button
                            type="button"
                            onclick={() =>
                              openConfirm({
                                title: "Konfirmasi Hapus Paksa Akun",
                                message: `Apakah Anda yakin ingin menghapus paksa akun ${u.name} (${u.email}) dari sistem?`,
                                warning:
                                  "Peringatan: Seluruh data akun ini akan dimusnahkan secara permanen dari database. Tindakan ini tidak dapat dibatalkan!",
                                action: "?/deleteUser",
                                isDanger: true,
                                confirmLabel: "Hapus Permanen",
                                fields: { id: u.id },
                              })}
                            class="cursor-pointer rounded-lg border border-[#F5C2C7] bg-[#FFF5F5] px-2 py-1 text-[11px] font-bold text-[#C62828] transition hover:bg-[#FFEBEE]"
                            title="Hapus akun secara permanen"
                          >
                            Hapus
                          </button>
                        {/if}
                      </div>
                    </td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
        {/if}
      </div>
    {:else if activeTab === "settings" && data.systemSettings}
      <!-- System Configuration & Integrations Settings Tab -->
      <form method="POST" action="?/updateSettings" class="space-y-6">
        <div
          class="flex items-center justify-between border-b border-[#EDE4D8] bg-[#FAF7F2] px-6 py-4"
        >
          <div>
            <h2 class="font-serif text-lg font-bold text-[#231712]">
              {dict.systemSettingsSection}
            </h2>
            <p class="text-xs text-[#7A6453]">
              Atur integrasi layanan Single Sign-On (Google OAuth), kredensial
              SMTP email notifikasi, serta parameter instansi kapan saja.
            </p>
          </div>
          <button
            type="submit"
            class="ui-btn flex cursor-pointer items-center gap-1.5 shadow-md hover:shadow-lg"
          >
            <svg
              class="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"
              />
              <polyline points="17 21 17 13 7 13 7 21" />
              <polyline points="7 3 7 8 15 8" />
            </svg>
            <span>Simpan Perubahan Konfigurasi</span>
          </button>
        </div>

        <div class="grid grid-cols-1 gap-6 p-6 lg:grid-cols-2">
          <!-- Card 1: Google OAuth 2.0 Integration -->
          <div
            class="space-y-4 rounded-2xl border border-[#EDE4D8] bg-[#FAF7F2]/60 p-5 shadow-xs"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2.5">
                <div
                  class="flex h-9 w-9 items-center justify-center rounded-xl border border-[#D5C5B5] bg-white text-[#5A3825] shadow-2xs"
                >
                  <svg class="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                    <path
                      d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 class="font-serif text-sm font-bold text-[#231712]">
                    Google OAuth 2.0 (SSO)
                  </h3>
                  <p class="text-[11px] text-[#8C7665]">
                    Login instan untuk staf tanpa perlu menghafal password.
                  </p>
                </div>
              </div>
              {#if data.systemSettings.isGoogleOAuthConfigured}
                <span
                  class="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-800"
                >
                  <span class="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                  Aktif
                </span>
              {:else}
                <span
                  class="rounded-full border border-stone-200 bg-stone-100 px-2 py-0.5 text-[10px] text-stone-600"
                >
                  Belum Dikonfigurasi
                </span>
              {/if}
            </div>

            <div class="space-y-3 pt-2">
              <div class="space-y-1">
                <label
                  for="googleClientId"
                  class="block text-[11px] font-bold tracking-wider text-[#5A4537] uppercase"
                >
                  Google Client ID
                </label>
                <input
                  id="googleClientId"
                  name="googleClientId"
                  type="text"
                  value={data.systemSettings.googleClientId}
                  placeholder="xxxx.apps.googleusercontent.com"
                  class="w-full rounded-xl border border-[#DDD2C4] bg-white px-3 py-2 text-xs text-[#231712] transition focus:border-[#7A4D33] focus:outline-none"
                />
              </div>

              <div class="space-y-1">
                <label
                  for="googleClientSecret"
                  class="block text-[11px] font-bold tracking-wider text-[#5A4537] uppercase"
                >
                  Google Client Secret
                </label>
                <input
                  id="googleClientSecret"
                  name="googleClientSecret"
                  type="password"
                  placeholder={data.systemSettings.hasGoogleClientSecret
                    ? "•••••••••••••••• (Tersimpan rahasia, isi hanya jika ingin mengubah)"
                    : "Masukkan Google Client Secret"}
                  class="w-full rounded-xl border border-[#DDD2C4] bg-white px-3 py-2 text-xs text-[#231712] transition focus:border-[#7A4D33] focus:outline-none"
                />
              </div>

              <div
                class="rounded-xl border border-[#E0D5C7] bg-[#F7F4EF] p-3 text-[11px] text-[#6A574A] space-y-1"
              >
                <div class="font-bold text-[#3E2B20]">
                  Panduan Google Cloud Console:
                </div>
                <div>
                  Authorized redirect URI yang harus didaftarkan di Google
                  Console:
                </div>
                <div
                  class="flex items-center justify-between rounded-lg border border-[#DDD2C4] bg-white px-2 py-1 font-mono text-[10px] text-[#5A3825]"
                >
                  <span class="truncate"
                    >{data.systemSettings.appUrl}/api/auth/google/callback</span
                  >
                  <button
                    type="button"
                    onclick={() => {
                      navigator.clipboard.writeText(
                        `${data.systemSettings?.appUrl}/api/auth/google/callback`,
                      );
                      copiedCallback = true;
                      setTimeout(() => (copiedCallback = false), 2000);
                    }}
                    class="ml-2 cursor-pointer text-xs font-bold text-[#7A4D33] hover:underline shrink-0"
                  >
                    {copiedCallback ? "Tersalin!" : "Salin"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Card 2: SMTP Email Integration -->
          <div
            class="space-y-4 rounded-2xl border border-[#EDE4D8] bg-[#FAF7F2]/60 p-5 shadow-xs"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2.5">
                <div
                  class="flex h-9 w-9 items-center justify-center rounded-xl border border-[#D5C5B5] bg-white text-[#5A3825] shadow-2xs"
                >
                  <svg
                    class="h-4 w-4"
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
                </div>
                <div>
                  <h3 class="font-serif text-sm font-bold text-[#231712]">
                    Email SMTP Server
                  </h3>
                  <p class="text-[11px] text-[#8C7665]">
                    Pengiriman notifikasi purchase order dan token keamanan.
                  </p>
                </div>
              </div>
              {#if data.systemSettings.isSmtpConfigured}
                <span
                  class="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-800"
                >
                  <span class="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                  Aktif
                </span>
              {:else}
                <span
                  class="rounded-full border border-stone-200 bg-stone-100 px-2 py-0.5 text-[10px] text-stone-600"
                >
                  Belum Dikonfigurasi
                </span>
              {/if}
            </div>

            <div class="space-y-3 pt-2">
              <div class="grid grid-cols-3 gap-2">
                <div class="col-span-2 space-y-1">
                  <label
                    for="smtpHost"
                    class="block text-[11px] font-bold tracking-wider text-[#5A4537] uppercase"
                  >
                    SMTP Host
                  </label>
                  <input
                    id="smtpHost"
                    name="smtpHost"
                    type="text"
                    value={data.systemSettings.smtpHost}
                    placeholder="smtp.gmail.com"
                    class="w-full rounded-xl border border-[#DDD2C4] bg-white px-3 py-2 text-xs text-[#231712] transition focus:border-[#7A4D33] focus:outline-none"
                  />
                </div>
                <div class="space-y-1">
                  <label
                    for="smtpPort"
                    class="block text-[11px] font-bold tracking-wider text-[#5A4537] uppercase"
                  >
                    Port
                  </label>
                  <input
                    id="smtpPort"
                    name="smtpPort"
                    type="number"
                    value={data.systemSettings.smtpPort}
                    placeholder="587"
                    class="w-full rounded-xl border border-[#DDD2C4] bg-white px-3 py-2 text-xs text-[#231712] transition focus:border-[#7A4D33] focus:outline-none"
                  />
                </div>
              </div>

              <div class="grid grid-cols-2 gap-2">
                <div class="space-y-1">
                  <label
                    for="smtpUser"
                    class="block text-[11px] font-bold tracking-wider text-[#5A4537] uppercase"
                  >
                    SMTP Username / Email
                  </label>
                  <input
                    id="smtpUser"
                    name="smtpUser"
                    type="text"
                    value={data.systemSettings.smtpUser}
                    placeholder="roastery@gmail.com"
                    class="w-full rounded-xl border border-[#DDD2C4] bg-white px-3 py-2 text-xs text-[#231712] transition focus:border-[#7A4D33] focus:outline-none"
                  />
                </div>
                <div class="space-y-1">
                  <label
                    for="smtpPassword"
                    class="block text-[11px] font-bold tracking-wider text-[#5A4537] uppercase"
                  >
                    SMTP Password
                  </label>
                  <input
                    id="smtpPassword"
                    name="smtpPassword"
                    type="password"
                    placeholder={data.systemSettings.hasSmtpPassword
                      ? "•••••••••••••••• (Tersimpan rahasia)"
                      : "App Password SMTP"}
                    class="w-full rounded-xl border border-[#DDD2C4] bg-white px-3 py-2 text-xs text-[#231712] transition focus:border-[#7A4D33] focus:outline-none"
                  />
                </div>
              </div>

              <div class="space-y-1">
                <label
                  for="smtpFrom"
                  class="block text-[11px] font-bold tracking-wider text-[#5A4537] uppercase"
                >
                  Nama Pengirim (From)
                </label>
                <input
                  id="smtpFrom"
                  name="smtpFrom"
                  type="text"
                  value={data.systemSettings.smtpFrom}
                  placeholder="CafeStock Roastery <no-reply@cafestock.com>"
                  class="w-full rounded-xl border border-[#DDD2C4] bg-white px-3 py-2 text-xs text-[#231712] transition focus:border-[#7A4D33] focus:outline-none"
                />
              </div>
            </div>
          </div>

          <!-- Card 3: Base Instance Info -->
          <div
            class="space-y-4 rounded-2xl border border-[#EDE4D8] bg-[#FAF7F2]/60 p-5 shadow-xs lg:col-span-2"
          >
            <h3 class="font-serif text-sm font-bold text-[#231712]">
              Identitas Kafe & Base URL Aplikasi
            </h3>
            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div class="space-y-1">
                <label
                  for="cafeName"
                  class="block text-[11px] font-bold tracking-wider text-[#5A4537] uppercase"
                >
                  Nama Brand / Kafe
                </label>
                <input
                  id="cafeName"
                  name="cafeName"
                  type="text"
                  value={data.systemSettings.cafeName}
                  placeholder="CafeStock Roastery"
                  class="w-full rounded-xl border border-[#DDD2C4] bg-white px-3 py-2 text-xs text-[#231712] transition focus:border-[#7A4D33] focus:outline-none"
                />
              </div>

              <div class="space-y-1">
                <label
                  for="appUrl"
                  class="block text-[11px] font-bold tracking-wider text-[#5A4537] uppercase"
                >
                  Base Application URL
                </label>
                <input
                  id="appUrl"
                  name="appUrl"
                  type="text"
                  value={data.systemSettings.appUrl}
                  placeholder="http://localhost:3000"
                  class="w-full rounded-xl border border-[#DDD2C4] bg-white px-3 py-2 text-xs text-[#231712] transition focus:border-[#7A4D33] focus:outline-none"
                />
                <p class="text-[10px] text-[#8C7665]">
                  Digunakan untuk membangun tautan absolut di email dan Google
                  OAuth.
                </p>
              </div>
            </div>
          </div>

          <!-- Danger Zone: Reset Master Data -->
          <div
            class="rounded-2xl border border-red-200 bg-red-50/40 p-5 sm:p-6 space-y-3"
          >
            <div
              class="flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div>
                <h4 class="font-serif text-sm font-bold text-red-900">
                  Zona Bahaya: Kosongkan & Reset Seluruh Master Data
                </h4>
                <p class="mt-0.5 text-xs text-red-700/80">
                  Menghapus semua produk, pemasok, gudang, saldo stok, dan
                  transaksi demo. Akun login Anda tetap aman.
                </p>
              </div>
              <button
                type="button"
                onclick={() =>
                  openConfirm({
                    title: "Kosongkan Seluruh Master Data?",
                    message:
                      "Tindakan ini akan menghapus semua produk, pemasok, gudang, dan riwayat transaksi dari database. Akun pengguna tidak akan terpengaruh. Tindakan ini tidak dapat dibatalkan.",
                    confirmLabel: "Ya, Kosongkan Master Data",
                    isDanger: true,
                    action: "?/resetMasterData",
                    fields: {},
                  })}
                class="cursor-pointer shrink-0 rounded-xl border border-red-300 bg-red-600 px-4 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-red-700 active:scale-95"
              >
                Kosongkan Master Data
              </button>
            </div>
          </div>
        </div>
      </form>
    {/if}
  </div>
</div>

<!-- Unified Managerial Confirmation Dialog Modal (Anti-Piggyback & Idempotency) -->
{#if confirmModal.open}
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs"
  >
    <div
      class="w-full max-w-md space-y-4 rounded-2xl border border-[#EDE4D8] bg-white p-6 shadow-2xl"
    >
      <div class="flex items-center gap-3">
        <div
          class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border {confirmModal.isDanger
            ? 'border-[#F2C2B8] bg-[#FDF2F0] text-[#C62828]'
            : 'border-[#EDE4D8] bg-[#FAF2EA] text-[#5A3825]'}"
        >
          <svg
            class="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            {#if confirmModal.isDanger}
              <path
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            {:else}
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            {/if}
          </svg>
        </div>
        <div>
          <h3 class="font-serif text-lg font-bold text-[#231712]">
            {confirmModal.title}
          </h3>
          <p class="text-xs text-[#7A6453]">
            Tindakan ini memerlukan otorisasi manajerial.
          </p>
        </div>
      </div>

      <div
        class="space-y-2 rounded-xl border border-[#EDE4D8] bg-[#FAF7F2] p-3 text-xs leading-relaxed text-[#5A4537]"
      >
        <p>{confirmModal.message}</p>
        {#if confirmModal.warning}
          <p
            class="rounded-lg border border-[#F5C2C7] bg-[#FFF5F5] p-2 text-[11px] font-semibold text-[#C62828]"
          >
            {confirmModal.warning}
          </p>
        {/if}
      </div>

      <div class="flex items-center justify-end gap-3 pt-2">
        <button
          type="button"
          onclick={closeConfirm}
          class="cursor-pointer rounded-xl border border-[#D5C5B5] px-4 py-2 text-xs font-semibold text-[#5A3825] transition hover:bg-[#F5EFE6]"
        >
          {dict.cancel}
        </button>
        <form method="POST" action={confirmModal.action}>
          {#each Object.entries(confirmModal.fields) as [k, v]}
            <input type="hidden" name={k} value={v} />
          {/each}
          <button
            type="submit"
            class="cursor-pointer rounded-xl px-4 py-2 text-xs font-bold text-white shadow-sm transition {confirmModal.isDanger
              ? 'bg-[#C62828] hover:bg-[#A82323]'
              : 'bg-[#5A3825] hover:bg-[#45281A]'}"
          >
            {confirmModal.confirmLabel}
          </button>
        </form>
      </div>
    </div>
  </div>
{/if}
