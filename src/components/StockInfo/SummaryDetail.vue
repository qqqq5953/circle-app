<template>
  <section class="border rounded p-3 text-sm">
    <div class="flex flex-wrap gap-1 my-2 text-slate-600 font-light">
      <span
        class="rounded-full border px-3 py-1 bg-slate-100"
        v-if="stock.profile?.sector"
        >{{ stock.profile?.sector }}</span
      >
      <span
        class="rounded-full border px-3 py-1 bg-slate-100"
        v-if="stock.price?.quoteType"
        >{{ stock.price?.quoteType }}</span
      >
      <span
        class="rounded-full border px-3 py-1 bg-slate-100"
        v-if="stock.profile?.country"
        >{{
          stock.profile?.country === "United States"
            ? "US"
            : stock.profile?.country
        }}</span
      >
    </div>
    <ul>
      <li
        class="flex items-center justify-between py-3 border-b"
        v-for="(detail, indicator) in stock.detail?.range"
        :key="indicator"
      >
        <span class="text-slate-600">{{ indicator }}:</span>
        <span class="font-medium">{{ detail.low }} - {{ detail.high }}</span>
      </li>
      <li
        class="flex items-center justify-between py-3 border-b"
        v-for="(detail, indicator) in stock.detail?.fixed"
        :key="indicator"
      >
        <span class="text-slate-600">{{ indicator }}:</span>
        <span class="font-medium">{{ detail }}</span>
      </li>
      <li class="flex items-center justify-between py-3">
        <span class="text-slate-600">Exchange:</span>
        <span class="font-medium">{{ stock.price?.exchangeName }}</span>
      </li>
    </ul>
  </section>
</template>

<script>
export default {
  props: {
    stock: Object,
  },
};
</script>