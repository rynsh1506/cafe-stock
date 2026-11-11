<script lang="ts">
  interface Option {
    value: string;
    label: string;
  }

  let {
    name = "",
    value = $bindable(""),
    options = [],
    placeholder = "Pilih...",
    class: customClass = "",
    onchange,
  }: {
    name?: string;
    value?: string;
    options: Option[];
    placeholder?: string;
    class?: string;
    onchange?: (val: string) => void;
  } = $props();

  let isOpen = $state(false);
  let containerRef = $state<HTMLDivElement | null>(null);

  let selectedOption = $derived(options.find((opt) => opt.value === value));
  let displayLabel = $derived(
    selectedOption ? selectedOption.label : placeholder,
  );

  function handleSelect(val: string) {
    value = val;
    isOpen = false;
    if (onchange) {
      onchange(val);
    }
  }

  function handleWindowClick(e: MouseEvent) {
    if (isOpen && containerRef && !containerRef.contains(e.target as Node)) {
      isOpen = false;
    }
  }
</script>

<svelte:window onclick={handleWindowClick} />

<div class="relative w-full {customClass}" bind:this={containerRef}>
  {#if name}
    <input type="hidden" {name} {value} />
  {/if}

  <!-- Trigger Button -->
  <button
    type="button"
    class="flex w-full cursor-pointer items-center justify-between rounded-xl border border-[#DDD2C4] bg-white px-3.5 py-2 text-left text-xs font-medium text-[#231712] shadow-xs transition hover:border-[#7A4D33] focus:border-[#7A4D33] focus:ring-2 focus:ring-[#7A4D33]/15 focus:outline-none"
    onclick={() => (isOpen = !isOpen)}
    aria-expanded={isOpen}
  >
    <span
      class="truncate pr-2 {value === ''
        ? 'text-[#8C7665]'
        : 'font-semibold text-[#2E1F16]'}"
    >
      {displayLabel}
    </span>
    <svg
      class="h-4 w-4 shrink-0 text-[#8C7665] transition-transform duration-200 {isOpen
        ? 'rotate-180 text-[#5A3825]'
        : ''}"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  </button>

  <!-- Roastery Espresso Dropdown Menu -->
  {#if isOpen}
    <div
      class="absolute top-full left-0 z-50 mt-1.5 max-h-72 w-full min-w-full overflow-y-auto rounded-xl border border-[#EDE4D8] bg-white p-1 shadow-xl transition-all scrollbar-none [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
    >
      {#each options as opt}
        {@const isSelected = opt.value === value}
        <button
          type="button"
          class="flex w-full cursor-pointer items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-xs transition {isSelected
            ? 'bg-[#F5EDE4] font-bold text-[#5A3825]'
            : 'text-[#4A3B32] hover:bg-[#FAF7F2] hover:text-[#231712]'}"
          onclick={() => handleSelect(opt.value)}
          title={opt.label}
        >
          <span class="truncate">{opt.label}</span>
          {#if isSelected}
            <svg
              class="h-3.5 w-3.5 shrink-0 text-[#5A3825]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          {/if}
        </button>
      {/each}
    </div>
  {/if}
</div>
