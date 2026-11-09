<script lang="ts">
  import type { HomePageData } from "@/routes/+page.server";

  let { data }: { data: HomePageData } = $props();
</script>

<main class="flex min-h-screen items-center justify-center bg-stone-50">
  <div class="rounded-lg border border-stone-200 bg-white p-8 shadow-sm">
    <h1 class="text-2xl font-semibold text-stone-900">CafeStock</h1>
    <p class="mt-2 text-sm text-stone-600">
      Server-side rendered at {data.renderedAt}
    </p>
  </div>
</main>
