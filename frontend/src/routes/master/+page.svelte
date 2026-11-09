<script lang="ts">
  import { getDictionary } from "@/lib/i18n";
  import type {
    MasterActionData,
    MasterPageData,
  } from "@/routes/master/+page.server";

  let { data, form }: { data: MasterPageData; form: MasterActionData | null } =
    $props();
  let dict = $derived(getDictionary(data.lang));
</script>

<div class="space-y-8">
  <!-- Header & Search Bar -->
  <div class="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
    <div>
      <div class="text-[12px] font-medium text-[#86868B]">
        SKU, Supplier & Warehouse Directory
      </div>
      <h1
        class="mt-1 text-2xl font-semibold tracking-tight text-[#1D1D1F] sm:text-[28px]"
      >
        {dict.masterTitle}
      </h1>
    </div>

    <form method="GET" action="/master" class="flex w-full gap-2 sm:w-auto">
      <input
        type="text"
        name="search"
        value={data.search}
        placeholder="Search SKU, Code, Name..."
        class="apple-input flex-1 px-3.5 py-2 text-[13px] sm:w-64"
      />
      <button
        type="submit"
        class="apple-btn-primary cursor-pointer px-4 py-2 text-[13px]"
      >
        Search
      </button>
    </form>
  </div>

  {#if form?.error}
    <div
      class="apple-card flex items-center gap-2.5 px-4 py-3 text-[13px] font-medium text-[#1D1D1F]"
    >
      <span class="h-2 w-2 shrink-0 rounded-full bg-[#D70015]"></span>
      <span>{form.error}</span>
    </div>
  {/if}
  {#if form?.success}
    <div
      class="apple-card flex items-center gap-2.5 px-4 py-3 text-[13px] font-medium text-[#1D1D1F]"
    >
      <span class="h-2 w-2 shrink-0 rounded-full bg-[#1D1D1F]"></span>
      <span>{form.success}</span>
    </div>
  {/if}

  <!-- Products Section -->
  <section class="apple-card overflow-hidden">
    <div class="border-b border-black/[0.06] px-5 py-4 sm:px-6">
      <div class="flex items-center justify-between">
        <h2 class="text-[15px] font-semibold tracking-tight text-[#1D1D1F]">
          {dict.productsSection}
        </h2>
        <span class="font-mono text-[11px] text-[#86868B]">
          {data.products.length} items
        </span>
      </div>

      <form
        method="POST"
        action="?/createProduct"
        class="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-6"
      >
        <input
          name="sku"
          required
          placeholder="SKU (e.g. SKU-CF-09)"
          class="apple-input px-3 py-2 font-mono text-[12px]"
        />
        <input
          name="name"
          required
          placeholder="Product Name"
          class="apple-input px-3 py-2 text-[13px]"
        />
        <input
          name="category"
          placeholder="Category"
          value="Coffee Beans"
          class="apple-input px-3 py-2 text-[13px]"
        />
        <input
          name="unit"
          required
          placeholder="Unit (bag, carton)"
          class="apple-input px-3 py-2 text-[13px]"
        />
        <input
          name="unitPrice"
          type="number"
          min="0"
          placeholder="Price (IDR)"
          class="apple-input px-3 py-2 text-[13px] tabular-nums"
        />
        <button
          type="submit"
          class="apple-btn-primary cursor-pointer px-4 py-2 text-[13px]"
        >
          + Add Product
        </button>
      </form>
    </div>

    <!-- Desktop Table -->
    <div class="hidden overflow-x-auto md:block">
      <table class="w-full text-left text-[13px]">
        <thead>
          <tr
            class="border-b border-black/[0.06] bg-[#FBFBFD] text-[11px] font-medium tracking-wider text-[#86868B] uppercase"
          >
            <th class="px-6 py-3">SKU</th>
            <th class="px-6 py-3">Product Name</th>
            <th class="px-6 py-3">Category</th>
            <th class="px-6 py-3">Unit</th>
            <th class="px-6 py-3 text-right">Unit Price</th>
            <th class="px-6 py-3 text-center">State</th>
            <th class="px-6 py-3 text-right">Action</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-black/[0.05]">
          {#each data.products as prod}
            <tr class="transition hover:bg-[#F5F5F7]/60">
              <td
                class="px-6 py-3.5 font-mono text-[12px] font-medium text-[#1D1D1F]"
              >
                {prod.sku}
              </td>
              <td class="px-6 py-3.5 font-medium text-[#1D1D1F]">
                {prod.name}
              </td>
              <td class="px-6 py-3.5 text-[#6E6E73]">{prod.category}</td>
              <td class="px-6 py-3.5 text-[#6E6E73]">{prod.unit}</td>
              <td
                class="px-6 py-3.5 text-right font-mono text-[12px] text-[#1D1D1F] tabular-nums"
              >
                Rp {prod.unitPrice.toLocaleString()}
              </td>
              <td class="px-6 py-3.5 text-center">
                <span
                  class="inline-flex items-center gap-1.5 text-[11px] font-medium text-[#1D1D1F]"
                >
                  <span
                    class="h-1.5 w-1.5 rounded-full {prod.isActive
                      ? 'bg-[#1D1D1F]'
                      : 'bg-[#D2D2D7]'}"
                  ></span>
                  <span
                    class={prod.isActive ? "text-[#1D1D1F]" : "text-[#86868B]"}
                  >
                    {prod.isActive ? "Active" : "Inactive"}
                  </span>
                </span>
              </td>
              <td class="px-6 py-3.5 text-right">
                <form method="POST" action="?/toggleProduct" class="inline">
                  <input type="hidden" name="id" value={prod.id} />
                  <input
                    type="hidden"
                    name="isActive"
                    value={String(prod.isActive)}
                  />
                  <button
                    type="submit"
                    class="apple-btn-secondary cursor-pointer px-3 py-1 text-[12px]"
                  >
                    {prod.isActive ? "Deactivate" : "Activate"}
                  </button>
                </form>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>

    <!-- Mobile Responsive Stack -->
    <div class="divide-y divide-black/[0.05] md:hidden">
      {#each data.products as prod}
        <div class="flex items-center justify-between gap-3 px-5 py-4">
          <div class="min-w-0">
            <div class="flex items-center gap-2">
              <span
                class="h-1.5 w-1.5 rounded-full {prod.isActive
                  ? 'bg-[#1D1D1F]'
                  : 'bg-[#D2D2D7]'}"
              ></span>
              <span class="font-mono text-[11px] text-[#86868B]"
                >{prod.sku}</span
              >
              <span class="text-[11px] text-[#86868B]">• {prod.category}</span>
            </div>
            <div class="mt-0.5 truncate text-[14px] font-medium text-[#1D1D1F]">
              {prod.name}
            </div>
            <div class="mt-0.5 font-mono text-[12px] text-[#6E6E73]">
              Rp {prod.unitPrice.toLocaleString()} / {prod.unit}
            </div>
          </div>

          <form method="POST" action="?/toggleProduct" class="shrink-0">
            <input type="hidden" name="id" value={prod.id} />
            <input
              type="hidden"
              name="isActive"
              value={String(prod.isActive)}
            />
            <button
              type="submit"
              class="apple-btn-secondary px-3 py-1.5 text-[12px]"
            >
              {prod.isActive ? "Disable" : "Enable"}
            </button>
          </form>
        </div>
      {/each}
    </div>
  </section>

  <!-- Suppliers & Warehouses Grid -->
  <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
    <!-- Suppliers Card -->
    <section class="apple-card overflow-hidden">
      <div class="border-b border-black/[0.06] px-5 py-4 sm:px-6">
        <div class="flex items-center justify-between">
          <h2 class="text-[15px] font-semibold tracking-tight text-[#1D1D1F]">
            {dict.suppliersSection}
          </h2>
          <span class="font-mono text-[11px] text-[#86868B]">
            {data.suppliers.length} partners
          </span>
        </div>

        <form
          method="POST"
          action="?/createSupplier"
          class="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3"
        >
          <input
            name="code"
            required
            placeholder="Code (SUP-NEW-01)"
            class="apple-input px-3 py-2 font-mono text-[12px]"
          />
          <input
            name="name"
            required
            placeholder="Supplier Name"
            class="apple-input px-3 py-2 text-[13px]"
          />
          <button
            type="submit"
            class="apple-btn-primary cursor-pointer px-3 py-2 text-[13px]"
          >
            + Add Supplier
          </button>
        </form>
      </div>

      <div class="divide-y divide-black/[0.05]">
        {#each data.suppliers as sup}
          <div
            class="flex items-center justify-between gap-3 px-5 py-3.5 sm:px-6"
          >
            <div class="min-w-0">
              <div class="truncate text-[13px] font-medium text-[#1D1D1F]">
                {sup.name}
              </div>
              <div class="font-mono text-[11px] text-[#86868B]">{sup.code}</div>
            </div>

            <form method="POST" action="?/toggleSupplier" class="shrink-0">
              <input type="hidden" name="id" value={sup.id} />
              <input
                type="hidden"
                name="isActive"
                value={String(sup.isActive)}
              />
              <button
                type="submit"
                class="apple-btn-secondary inline-flex cursor-pointer items-center gap-1.5 px-3 py-1 text-[12px]"
              >
                <span
                  class="h-1.5 w-1.5 rounded-full {sup.isActive
                    ? 'bg-[#1D1D1F]'
                    : 'bg-[#D2D2D7]'}"
                ></span>
                <span>{sup.isActive ? "Active" : "Inactive"}</span>
              </button>
            </form>
          </div>
        {/each}
      </div>
    </section>

    <!-- Warehouses Card -->
    <section class="apple-card overflow-hidden">
      <div class="border-b border-black/[0.06] px-5 py-4 sm:px-6">
        <div class="flex items-center justify-between">
          <h2 class="text-[15px] font-semibold tracking-tight text-[#1D1D1F]">
            {dict.warehousesSection}
          </h2>
          <span class="font-mono text-[11px] text-[#86868B]">
            {data.warehouses.length} locations
          </span>
        </div>

        <form
          method="POST"
          action="?/createWarehouse"
          class="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3"
        >
          <input
            name="code"
            required
            placeholder="Code (WH-BALI-03)"
            class="apple-input px-3 py-2 font-mono text-[12px]"
          />
          <input
            name="name"
            required
            placeholder="Warehouse Name"
            class="apple-input px-3 py-2 text-[13px]"
          />
          <button
            type="submit"
            class="apple-btn-primary cursor-pointer px-3 py-2 text-[13px]"
          >
            + Add Location
          </button>
        </form>
      </div>

      <div class="divide-y divide-black/[0.05]">
        {#each data.warehouses as wh}
          <div
            class="flex items-center justify-between gap-3 px-5 py-3.5 sm:px-6"
          >
            <div class="min-w-0">
              <div class="truncate text-[13px] font-medium text-[#1D1D1F]">
                {wh.name}
              </div>
              <div class="font-mono text-[11px] text-[#86868B]">{wh.code}</div>
            </div>

            <form method="POST" action="?/toggleWarehouse" class="shrink-0">
              <input type="hidden" name="id" value={wh.id} />
              <input
                type="hidden"
                name="isActive"
                value={String(wh.isActive)}
              />
              <button
                type="submit"
                class="apple-btn-secondary inline-flex cursor-pointer items-center gap-1.5 px-3 py-1 text-[12px]"
              >
                <span
                  class="h-1.5 w-1.5 rounded-full {wh.isActive
                    ? 'bg-[#1D1D1F]'
                    : 'bg-[#D2D2D7]'}"
                ></span>
                <span>{wh.isActive ? "Active" : "Inactive"}</span>
              </button>
            </form>
          </div>
        {/each}
      </div>
    </section>
  </div>
</div>
