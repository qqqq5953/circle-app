<template>
  <div>
    <ul
      class="
        flex flex-wrap
        justify-end
        gap-x-1.5
        pt-1
        pb-1.5
        italic
        font-light
        text-slate-400
      "
    >
      <li
        class="border-r last:border-none border-slate-300 pr-1.5 py-0.5"
        v-for="(rate, currency) in fxRatesUsedTwoDecimals"
        :key="currency"
      >
        {{ currency }}: {{ rate }}
      </li>
    </ul>

    <ul class="flex flex-wrap -m-1 md:-m-2">
      <li
        class="w-1/2 p-1 sm:w-1/4 md:p-2"
        :class="{
          'sm:order-1': key === 'P / L',
          'sm:order-2': key === 'P / L %',
          'sm:order-3': key === 'Total cost',
          'sm:order-4': key === 'Total value',
        }"
        v-for="(value, key) in totalStats"
        :key="key"
      >
        <div
          class="
            flex flex-col
            items-center
            bg-slate-100
            text-slate-700
            rounded
            shadow
            p-2
            lg:p-1.5
          "
        >
          <span
            class="font-medium text-sm md:text-base"
            :class="
              value > 0 && (key === 'P / L' || key === 'P / L %')
                ? 'text-red-600'
                : value < 0 && (key === 'P / L' || key === 'P / L %')
                ? 'text-green-700'
                : null
            "
            >{{ key !== "P / L %" ? "$" : null }}{{ value }}
            {{ key === "P / L %" ? "%" : null }}</span
          >
          <span class="font-light">{{ key }}</span>
        </div>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  props: {
    totalStats: {
      type: Object,
    },
    fxRatesUsedTwoDecimals: {
      type: Object,
    },
  },
};
</script>

<style>
</style>