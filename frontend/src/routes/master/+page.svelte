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

<div class="space-y-6">
  <div class="flex flex-wrap items-center justify-between gap-4">
    <h1 class="text-xl font-bold text-stone-900">{dict.masterTitle}</h1>

    <form method="GET" action="/master" class="flex gap-2">
      <input
        type="text"
        name="search"
        value={data.search}
        placeholder="Search SKU, Code, Name..."
        class="rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-xs"
      />
      <button
        type="submit"
        class="rounded-lg bg-stone-800 px-3 py-1.5 text-xs font-semibold text-white"
        >Filter</button
      >
    </form>
  </div>

  {#if form?.error}
    <div
      class="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold text-red-700"
    >
      {form.error}
    </div>
  {/if}
  {#if form?.success}
    <div
      class="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-semibold text-emerald-800"
    >
      {form.success}
    </div>
  {/if}

  <section class="rounded-xl border border-stone-200 bg-white p-5 shadow-xs">
    <h2 class="mb-4 text-sm font-bold text-stone-900">
      {dict.productsSection}
    </h2>

    <form
      method="POST"
      action="?/createProduct"
      class="mb-5 grid grid-cols-1 gap-3 rounded-lg bg-stone-50 p-3.5 sm:grid-cols-6"
    >
      <input
        name="sku"
        required
        placeholder="SKU (e.g. SKU-CF-09)"
        class="rounded border border-stone-300 bg-white px-2.5 py-1.5 text-xs"
      />
      <input
        name="name"
        required
        placeholder="Product Name"
        class="rounded border border-stone-300 bg-white px-2.5 py-1.5 text-xs"
      />
      <input
        name="category"
        placeholder="Category"
        value="Coffee Beans"
        class="rounded border border-stone-300 bg-white px-2.5 py-1.5 text-xs"
      />
      <input
        name="unit"
        required
        placeholder="Unit (bag, carton)"
        class="rounded border border-stone-300 bg-white px-2.5 py-1.5 text-xs"
      />
      <input
        name="unitPrice"
        type="number"
        min="0"
        placeholder="Unit Price (IDR)"
        class="rounded border border-stone-300 bg-white px-2.5 py-1.5 text-xs"
      />
      <button
        type="submit"
        class="rounded bg-amber-800 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-900"
      >
        + Add Product
      </button>
    </form>

    <div class="overflow-x-auto">
      <table class="w-full text-left text-xs">
        <thead>
          <tr class="border-b border-stone-200 text-stone-500">
            <th class="pb-2 font-semibold">SKU</th>
            <th class="pb-2 font-semibold">Name</th>
            <th class="pb-2 font-semibold">Category</th>
            <th class="pb-2 font-semibold">Unit</th>
            <th class="pb-2 text-right font-semibold">Price</th>
            <th class="pb-2 text-center font-semibold">Status</th>
            <th class="pb-2 text-right font-semibold">Action</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-stone-100">
          {#each data.products as prod}
            <tr>
              <td class="py-2.5 font-mono font-semibold text-stone-800"
                >{prod.sku}</td
              >
              <td class="py-2.5 font-medium text-stone-900">{prod.name}</td>
              <td class="py-2.5 text-stone-600">{prod.category}</td>
              <td class="py-2.5 text-stone-600">{prod.unit}</td>
              <td class="py-2.5 text-right text-stone-800"
                >Rp {prod.unitPrice.toLocaleString()}</td
              >
              <td class="py-2.5 text-center">
                <span
                  class="rounded-full px-2 py-0.5 text-[10px] font-bold {prod.isActive
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-stone-200 text-stone-600'}"
                >
                  {prod.isActive ? "ACTIVE" : "INACTIVE"}
                </span>
              </td>
              <td class="py-2.5 text-right">
                <form method="POST" action="?/toggleProduct" class="inline">
                  <input type="hidden" name="id" value={prod.id} />
                  <input
                    type="hidden"
                    name="isActive"
                    value={String(prod.isActive)}
                  />
                  <button
                    type="submit"
                    class="rounded border border-stone-300 px-2 py-1 text-[11px] font-medium hover:bg-stone-100"
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
  </section>

  <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
    <section class="rounded-xl border border-stone-200 bg-white p-5 shadow-xs">
      <h2 class="mb-4 text-sm font-bold text-stone-900">
        {dict.suppliersSection}
      </h2>

      <form
        method="POST"
        action="?/createSupplier"
        class="mb-4 grid grid-cols-1 gap-2.5 rounded-lg bg-stone-50 p-3 sm:grid-cols-3"
      >
        <input
          name="code"
          required
          placeholder="Code (SUP-NEW-01)"
          class="rounded border border-stone-300 bg-white px-2.5 py-1.5 text-xs"
        />
        <input
          name="name"
          required
          placeholder="Supplier Name"
          class="rounded border border-stone-300 bg-white px-2.5 py-1.5 text-xs"
        />
        <button
          type="submit"
          class="rounded bg-amber-800 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-900"
        >
          + Add Supplier
        </button>
      </form>

      <div class="divide-y divide-stone-100 text-xs">
        {#each data.suppliers as sup}
          <div class="flex items-center justify-between py-2.5">
            <div>
              <span class="font-mono font-bold text-stone-800">{sup.code}</span>
              — <span class="font-medium text-stone-900">{sup.name}</span>
            </div>
            <form method="POST" action="?/toggleSupplier">
              <input type="hidden" name="id" value={sup.id} />
              <input
                type="hidden"
                name="isActive"
                value={String(sup.isActive)}
              />
              <button
                type="submit"
                class="rounded px-2 py-0.5 text-[11px] font-semibold {sup.isActive
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-stone-200 text-stone-600'}"
              >
                {sup.isActive ? "ACTIVE" : "INACTIVE"}
              </button>
            </form>
          </div>
        {/each}
      </div>
    </section>

    <section class="rounded-xl border border-stone-200 bg-white p-5 shadow-xs">
      <h2 class="mb-4 text-sm font-bold text-stone-900">
        {dict.warehousesSection}
      </h2>

      <form
        method="POST"
        action="?/createWarehouse"
        class="mb-4 grid grid-cols-1 gap-2.5 rounded-lg bg-stone-50 p-3 sm:grid-cols-3"
      >
        <input
          name="code"
          required
          placeholder="Code (WH-BALI-03)"
          class="rounded border border-stone-300 bg-white px-2.5 py-1.5 text-xs"
        />
        <input
          name="name"
          required
          placeholder="Warehouse Name"
          class="rounded border border-stone-300 bg-white px-2.5 py-1.5 text-xs"
        />
        <button
          type="submit"
          class="rounded bg-amber-800 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-900"
        >
          + Add Warehouse
        </button>
      </form>

      <div class="divide-y divide-stone-100 text-xs">
        {#each data.warehouses as wh}
          <div class="flex items-center justify-between py-2.5">
            <div>
              <span class="font-mono font-bold text-stone-800">{wh.code}</span>
              — <span class="font-medium text-stone-900">{wh.name}</span>
            </div>
            <form method="POST" action="?/toggleWarehouse">
              <input type="hidden" name="id" value={wh.id} />
              <input
                type="hidden"
                name="isActive"
                value={String(wh.isActive)}
              />
              <button
                type="submit"
                class="rounded px-2 py-0.5 text-[11px] font-semibold {wh.isActive
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-stone-200 text-stone-600'}"
              >
                {wh.isActive ? "ACTIVE" : "INACTIVE"}
              </button>
            </form>
          </div>
        {/each}
      </div>
    </section>
  </div>
</div>
