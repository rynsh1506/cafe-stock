<script lang="ts">
  import { getDictionary } from "@/lib/i18n";
  import type {
    MasterActionData,
    MasterPageData,
  } from "@/routes/master/+page.server";

  let { data, form }: { data: MasterPageData; form: MasterActionData | null } =
    $props();
  let dict = $derived(getDictionary(data.lang));
  let activeSection = $state<"products" | "suppliers" | "warehouses">(
    "products",
  );
  let showCreateDrawer = $state(false);
</script>

<div>
  <!-- Top View Toolbar -->
  <div
    class="flex flex-wrap items-center justify-between gap-3 border-b border-[#EDEDED] px-5 py-3 sm:px-6"
  >
    <div class="flex flex-wrap items-center gap-3">
      <h1 class="text-[15px] font-semibold tracking-tight text-[#111113]">
        {dict.navMaster}
      </h1>

      <div class="ui-tabs">
        <button
          type="button"
          onclick={() => (activeSection = "products")}
          class="ui-tab cursor-pointer {activeSection === 'products'
            ? 'ui-tab-active'
            : ''}"
        >
          Products ({data.products.length})
        </button>
        <button
          type="button"
          onclick={() => (activeSection = "suppliers")}
          class="ui-tab cursor-pointer {activeSection === 'suppliers'
            ? 'ui-tab-active'
            : ''}"
        >
          Suppliers ({data.suppliers.length})
        </button>
        <button
          type="button"
          onclick={() => (activeSection = "warehouses")}
          class="ui-tab cursor-pointer {activeSection === 'warehouses'
            ? 'ui-tab-active'
            : ''}"
        >
          Warehouses ({data.warehouses.length})
        </button>
      </div>
    </div>

    <div class="flex flex-wrap items-center gap-2">
      <form method="GET" action="/master" class="flex items-center gap-1.5">
        <input
          type="text"
          name="search"
          value={data.search}
          placeholder="Filter..."
          class="ui-input w-40 sm:w-48"
        />
        <button type="submit" class="ui-btn-outline"> Search </button>
      </form>

      <button
        type="button"
        onclick={() => (showCreateDrawer = !showCreateDrawer)}
        class="ui-btn"
      >
        {showCreateDrawer ? "Close" : "+ New Entry"}
      </button>
    </div>
  </div>

  {#if form?.error}
    <div
      class="border-b border-[#EDEDED] bg-[#FEF2F2] px-6 py-2 text-[12px] text-[#DC2626]"
    >
      {form.error}
    </div>
  {/if}
  {#if form?.success}
    <div
      class="border-b border-[#EDEDED] bg-[#FAFAFA] px-6 py-2 text-[12px] text-[#111113]"
    >
      {form.success}
    </div>
  {/if}

  <!-- Collapsible Action Bar (Only Visible When Triggered) -->
  {#if showCreateDrawer}
    <div class="border-b border-[#EDEDED] bg-[#FAFAFA] px-5 py-4 sm:px-6">
      {#if activeSection === "products"}
        <form
          method="POST"
          action="?/createProduct"
          class="grid grid-cols-1 items-end gap-2.5 sm:grid-cols-3 lg:grid-cols-6"
        >
          <div>
            <label
              for="m-sku"
              class="mb-1 block text-[11px] font-medium text-[#52525B]"
              >SKU</label
            >
            <input
              id="m-sku"
              name="sku"
              required
              placeholder="SKU-CF-09"
              class="ui-input font-mono"
            />
          </div>
          <div>
            <label
              for="m-name"
              class="mb-1 block text-[11px] font-medium text-[#52525B]"
              >Name</label
            >
            <input
              id="m-name"
              name="name"
              required
              placeholder="Product name"
              class="ui-input"
            />
          </div>
          <div>
            <label
              for="m-cat"
              class="mb-1 block text-[11px] font-medium text-[#52525B]"
              >Category</label
            >
            <input
              id="m-cat"
              name="category"
              value="Coffee Beans"
              class="ui-input"
            />
          </div>
          <div>
            <label
              for="m-unit"
              class="mb-1 block text-[11px] font-medium text-[#52525B]"
              >Unit</label
            >
            <input
              id="m-unit"
              name="unit"
              required
              placeholder="bag, carton"
              class="ui-input"
            />
          </div>
          <div>
            <label
              for="m-price"
              class="mb-1 block text-[11px] font-medium text-[#52525B]"
              >Unit Price (IDR)</label
            >
            <input
              id="m-price"
              name="unitPrice"
              type="number"
              min="0"
              placeholder="150000"
              class="ui-input tabular-nums"
            />
          </div>
          <button type="submit" class="ui-btn w-full"> Save Product </button>
        </form>
      {:else if activeSection === "suppliers"}
        <form
          method="POST"
          action="?/createSupplier"
          class="grid max-w-2xl grid-cols-1 items-end gap-2.5 sm:grid-cols-3"
        >
          <div>
            <label
              for="s-code"
              class="mb-1 block text-[11px] font-medium text-[#52525B]"
              >Code</label
            >
            <input
              id="s-code"
              name="code"
              required
              placeholder="SUP-NEW-01"
              class="ui-input font-mono"
            />
          </div>
          <div>
            <label
              for="s-name"
              class="mb-1 block text-[11px] font-medium text-[#52525B]"
              >Supplier Name</label
            >
            <input
              id="s-name"
              name="name"
              required
              placeholder="Partner name"
              class="ui-input"
            />
          </div>
          <button type="submit" class="ui-btn w-full"> Save Supplier </button>
        </form>
      {:else}
        <form
          method="POST"
          action="?/createWarehouse"
          class="grid max-w-2xl grid-cols-1 items-end gap-2.5 sm:grid-cols-3"
        >
          <div>
            <label
              for="w-code"
              class="mb-1 block text-[11px] font-medium text-[#52525B]"
              >Code</label
            >
            <input
              id="w-code"
              name="code"
              required
              placeholder="WH-BALI-03"
              class="ui-input font-mono"
            />
          </div>
          <div>
            <label
              for="w-name"
              class="mb-1 block text-[11px] font-medium text-[#52525B]"
              >Warehouse Name</label
            >
            <input
              id="w-name"
              name="name"
              required
              placeholder="Location name"
              class="ui-input"
            />
          </div>
          <button type="submit" class="ui-btn w-full"> Save Warehouse </button>
        </form>
      {/if}
    </div>
  {/if}

  <!-- Active Data Sheet -->
  {#if activeSection === "products"}
    <div class="overflow-x-auto">
      <table class="w-full text-left text-[13px]">
        <thead>
          <tr
            class="border-b border-[#EDEDED] bg-[#FAFAFA] text-[11px] font-medium text-[#71717A]"
          >
            <th class="px-5 py-2.5 sm:px-6">SKU</th>
            <th class="px-5 py-2.5 sm:px-6">Product</th>
            <th class="hidden px-5 py-2.5 sm:table-cell sm:px-6">Category</th>
            <th class="hidden px-5 py-2.5 sm:table-cell sm:px-6">Unit</th>
            <th class="px-5 py-2.5 text-right sm:px-6">Price</th>
            <th class="px-5 py-2.5 text-center sm:px-6">Status</th>
            <th class="px-5 py-2.5 text-right sm:px-6"></th>
          </tr>
        </thead>
        <tbody class="divide-y divide-[#F4F4F5]">
          {#each data.products as prod}
            <tr class="hover:bg-[#FAFAFA]">
              <td
                class="px-5 py-2.5 font-mono text-[12px] text-[#52525B] sm:px-6"
              >
                {prod.sku}
              </td>
              <td class="px-5 py-2.5 font-medium text-[#111113] sm:px-6">
                {prod.name}
              </td>
              <td
                class="hidden px-5 py-2.5 text-[#71717A] sm:table-cell sm:px-6"
              >
                {prod.category}
              </td>
              <td
                class="hidden px-5 py-2.5 text-[#71717A] sm:table-cell sm:px-6"
              >
                {prod.unit}
              </td>
              <td
                class="px-5 py-2.5 text-right font-mono text-[12px] text-[#111113] tabular-nums sm:px-6"
              >
                Rp {prod.unitPrice.toLocaleString()}
              </td>
              <td class="px-5 py-2.5 text-center sm:px-6">
                <span class="font-mono text-[11px] text-[#71717A]">
                  {prod.isActive ? "Active" : "Inactive"}
                </span>
              </td>
              <td class="px-5 py-2.5 text-right sm:px-6">
                <form method="POST" action="?/toggleProduct" class="inline">
                  <input type="hidden" name="id" value={prod.id} />
                  <input
                    type="hidden"
                    name="isActive"
                    value={String(prod.isActive)}
                  />
                  <button type="submit" class="ui-btn-outline ui-btn-sm">
                    {prod.isActive ? "Disable" : "Enable"}
                  </button>
                </form>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {:else if activeSection === "suppliers"}
    <div class="overflow-x-auto">
      <table class="w-full text-left text-[13px]">
        <thead>
          <tr
            class="border-b border-[#EDEDED] bg-[#FAFAFA] text-[11px] font-medium text-[#71717A]"
          >
            <th class="px-5 py-2.5 sm:px-6">Code</th>
            <th class="px-5 py-2.5 sm:px-6">Supplier Name</th>
            <th class="px-5 py-2.5 text-center sm:px-6">Status</th>
            <th class="px-5 py-2.5 text-right sm:px-6"></th>
          </tr>
        </thead>
        <tbody class="divide-y divide-[#F4F4F5]">
          {#each data.suppliers as sup}
            <tr class="hover:bg-[#FAFAFA]">
              <td
                class="px-5 py-2.5 font-mono text-[12px] text-[#52525B] sm:px-6"
              >
                {sup.code}
              </td>
              <td class="px-5 py-2.5 font-medium text-[#111113] sm:px-6">
                {sup.name}
              </td>
              <td class="px-5 py-2.5 text-center sm:px-6">
                <span class="font-mono text-[11px] text-[#71717A]">
                  {sup.isActive ? "Active" : "Inactive"}
                </span>
              </td>
              <td class="px-5 py-2.5 text-right sm:px-6">
                <form method="POST" action="?/toggleSupplier" class="inline">
                  <input type="hidden" name="id" value={sup.id} />
                  <input
                    type="hidden"
                    name="isActive"
                    value={String(sup.isActive)}
                  />
                  <button type="submit" class="ui-btn-outline ui-btn-sm">
                    {sup.isActive ? "Disable" : "Enable"}
                  </button>
                </form>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {:else}
    <div class="overflow-x-auto">
      <table class="w-full text-left text-[13px]">
        <thead>
          <tr
            class="border-b border-[#EDEDED] bg-[#FAFAFA] text-[11px] font-medium text-[#71717A]"
          >
            <th class="px-5 py-2.5 sm:px-6">Code</th>
            <th class="px-5 py-2.5 sm:px-6">Warehouse Name</th>
            <th class="px-5 py-2.5 text-center sm:px-6">Status</th>
            <th class="px-5 py-2.5 text-right sm:px-6"></th>
          </tr>
        </thead>
        <tbody class="divide-y divide-[#F4F4F5]">
          {#each data.warehouses as wh}
            <tr class="hover:bg-[#FAFAFA]">
              <td
                class="px-5 py-2.5 font-mono text-[12px] text-[#52525B] sm:px-6"
              >
                {wh.code}
              </td>
              <td class="px-5 py-2.5 font-medium text-[#111113] sm:px-6">
                {wh.name}
              </td>
              <td class="px-5 py-2.5 text-center sm:px-6">
                <span class="font-mono text-[11px] text-[#71717A]">
                  {wh.isActive ? "Active" : "Inactive"}
                </span>
              </td>
              <td class="px-5 py-2.5 text-right sm:px-6">
                <form method="POST" action="?/toggleWarehouse" class="inline">
                  <input type="hidden" name="id" value={wh.id} />
                  <input
                    type="hidden"
                    name="isActive"
                    value={String(wh.isActive)}
                  />
                  <button type="submit" class="ui-btn-outline ui-btn-sm">
                    {wh.isActive ? "Disable" : "Enable"}
                  </button>
                </form>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {/if}
</div>
