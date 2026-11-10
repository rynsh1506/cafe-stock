<script lang="ts">
  import { getDictionary } from "@/lib/i18n";
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

  let activeTab = $state<"products" | "suppliers" | "warehouses">("products");
  let showNewDrawer = $state(false);
</script>

<div class="space-y-6">
  <!-- Header & Tab Bar -->
  <div class="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
    <div>
      <h1 class="font-serif text-2xl font-bold tracking-tight text-[#231712]">
        {dict.navMaster}
      </h1>
      <p class="mt-0.5 text-xs text-[#7D6B5D]">
        {dict.masterSubtitle}
      </p>
    </div>

    <div class="flex flex-wrap items-center gap-2.5">
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
      </div>

      <button
        type="button"
        onclick={() => (showNewDrawer = !showNewDrawer)}
        class="ui-btn cursor-pointer"
      >
        {showNewDrawer ? dict.closeForm : dict.newProduct}
      </button>
    </div>
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
            Add New SKU Product
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
              >SKU</label
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
              >Product Name</label
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
              >Category</label
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
              >Unit</label
            >
            <select id="prod-unit" name="unit" class="ui-select">
              <option value="kg">kg</option>
              <option value="liter">liter</option>
              <option value="box">box</option>
              <option value="pack">pack</option>
              <option value="pcs">pcs</option>
              <option value="bottle">bottle</option>
            </select>
          </div>
          <div>
            <label
              for="prod-min"
              class="mb-1.5 block text-[11px] font-bold tracking-wider text-[#5A4537] uppercase"
              >Min Stock</label
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
            Save SKU
          </button>
        </form>
      {:else if activeTab === "suppliers"}
        <div class="mb-4 border-b border-[#F0E7DD] pb-3">
          <h2 class="font-serif text-base font-bold text-[#231712]">
            Add New Supplier Partner
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
              >Supplier Code</label
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
              >Supplier Name</label
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
              >Email</label
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
              >Phone</label
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
              >Address</label
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
            Save Supplier
          </button>
        </form>
      {:else}
        <div class="mb-4 border-b border-[#F0E7DD] pb-3">
          <h2 class="font-serif text-base font-bold text-[#231712]">
            Add New Warehouse Facility
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
              >Warehouse Code</label
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
              >Facility Name</label
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
              >Address</label
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
            Save Warehouse
          </button>
        </form>
      {/if}
    </div>
  {/if}

  <!-- Table Card -->
  <div class="ui-card overflow-hidden">
    {#if activeTab === "products"}
      <div class="overflow-x-auto">
        <table class="w-full border-collapse text-left text-xs">
          <thead>
            <tr
              class="border-b border-[#EDE4D8] bg-[#FAF7F2] text-[10px] font-bold tracking-wider text-[#8C7665] uppercase"
            >
              <th class="px-5 py-3.5">SKU</th>
              <th class="px-5 py-3.5">Product Name</th>
              <th class="px-5 py-3.5">Category</th>
              <th class="px-5 py-3.5">Unit</th>
              <th class="px-5 py-3.5 text-right">Min Threshold</th>
              <th class="px-5 py-3.5 text-right">Status</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-[#F5EDE4]">
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
                <td class="px-5 py-3.5 text-right">
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
                      <span>{prod.isActive ? "ACTIVE" : "INACTIVE"}</span>
                    </button>
                  </form>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {:else if activeTab === "suppliers"}
      <div class="overflow-x-auto">
        <table class="w-full border-collapse text-left text-xs">
          <thead>
            <tr
              class="border-b border-[#EDE4D8] bg-[#FAF7F2] text-[10px] font-bold tracking-wider text-[#8C7665] uppercase"
            >
              <th class="px-5 py-3.5">Code</th>
              <th class="px-5 py-3.5">Supplier Name</th>
              <th class="px-5 py-3.5">Email</th>
              <th class="px-5 py-3.5">Phone</th>
              <th class="px-5 py-3.5">Address</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-[#F5EDE4]">
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
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {:else}
      <div class="overflow-x-auto">
        <table class="w-full border-collapse text-left text-xs">
          <thead>
            <tr
              class="border-b border-[#EDE4D8] bg-[#FAF7F2] text-[10px] font-bold tracking-wider text-[#8C7665] uppercase"
            >
              <th class="px-5 py-3.5">Warehouse Code</th>
              <th class="px-5 py-3.5">Facility Name</th>
              <th class="px-5 py-3.5">Address</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-[#F5EDE4]">
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
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {/if}
  </div>
</div>
