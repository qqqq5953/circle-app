<template>
  <div>
    <ul
      class="flex flex-wrap justify-end gap-x-1.5 pt-1 pb-1.5 italic font-light text-slate-400 text-xs"
    >
      <li
        class="border-r last:border-none border-slate-300 pr-1.5 py-0.5 tracking-wider"
        v-for="(rate, currency) in currencyInUse"
        :key="currency"
      >
        {{ currency }}: {{ rate }}
      </li>
    </ul>

    <ul class="flex flex-wrap -m-1 md:-m-2">
      <li
        class="w-1/2 p-1.5 sm:w-1/4 md:p-2"
        :class="[
          {
            'sm:order-1': key === 'P / L',
            'sm:order-2': key === 'P / L %',
            'sm:order-3': key === 'Total cost',
            'sm:order-4': key === 'Total value',
          },
          customStyle,
        ]"
        v-for="(value, key) in totalStats"
        :key="key"
      >
        <div
          class="flex flex-col space-y-1 items-center border border-gray-400 text-slate-700 rounded shadow-md p-2 md:p-3"
        >
          <span class="text-xs md:text-sm">{{ key }}</span>
          <span
            class="font-medium text-sm md:text-base"
            :class="
              !value.includes('-') && (key === 'P / L' || key === 'P / L %')
                ? 'text-red-600'
                : value.includes('-') && (key === 'P / L' || key === 'P / L %')
                ? 'text-green-700'
                : null
            "
          >
            {{ value }}
          </span>
        </div>
      </li>
    </ul>
  </div>
</template>

<script>
import { computed, ref } from "vue";

export default {
  props: {
    fxRates: {
      type: Object,
    },
    totalStats: {
      type: Object,
    },
    latestInfo: {
      type: Object,
    },
    customStyle: {
      type: String,
    },
  },
  setup(props) {
    const codeToCurrencyMap = ref({
      tw: "TWD",
      us: "USDTWD",
      mf: "USDTWD",
      uk: "GBPTWD",
      hk: "HKDTWD",
      ks: "KRWTWD",
    });

    const currencyInUse = computed(() => {
      return Object.values(props.latestInfo)
        .filter((info) => info.code !== "tw")
        .reduce((obj, info) => {
          const code = info.code;
          const exchangeRate = props.fxRates[code];
          const currency = codeToCurrencyMap.value[code];
          obj[currency] = obj[currency] || (+exchangeRate).toFixed(2);
          return obj;
        }, {});
    });

    return {
      currencyInUse,
    };
  },
};
</script>