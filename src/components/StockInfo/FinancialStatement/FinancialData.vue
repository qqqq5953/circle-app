<template>
  <section class="border rounded p-3 text-sm" v-if="financialData">
    <h2 class="text-2xl">Financial Data</h2>
    <details
      class="py-3 border-b last:border-0"
      open
      :ref="
        (el) => {
          detailsRefs['Income Statement'] = el;
        }
      "
    >
      <summary class="list-none text-slate-700 relative">
        <h2 class="font-semibold">Income Statement</h2>
        <span class="absolute top-1/2 -translate-y-1/2 right-0 z-10">
          <input class="hidden peer" id="Income Statement" type="checkbox" />
          <label
            class="cursor-pointer peer-checked:[&>i]:-rotate-180"
            for="Income Statement"
            @click="toggleDetails('Income Statement')"
          >
            <i
              class="
                fa-solid fa-chevron-up
                transition-transform
                duration-200
                ease-in-out
              "
            ></i>
          </label>
        </span>
      </summary>
      <ul class="flex flex-col gap-4">
        <li class="flex items-center pt-3 text-slate-600">
          <span class="ml-auto underline">*TTM</span>
          <span class="w-1/5 text-right ml-1 underline">margin</span>
        </li>
        <li
          class="flex items-center"
          v-for="indicator in financialStatement"
          :key="indicator"
        >
          <span class="text-slate-600">{{ indicator.name }}</span>
          <span class="ml-auto font-medium"
            >{{ indicator.profit }} billion</span
          >
          <span class="w-1/5 text-right ml-1 font-medium">{{
            indicator.margin
          }}</span>
        </li>
        <li class="text-xs text-slate-500 pt-4 font-light">
          * TTM: Trailing Twelve Month
        </li>
      </ul>
    </details>
    <template v-for="(data, title) in financialIndicators" :key="title">
      <details
        class="py-3 border-b last:border-0 group"
        v-if="Object.keys(data).length"
        :ref="
          (el) => {
            detailsRefs[title] = el;
          }
        "
      >
        <summary class="list-none text-slate-700 relative">
          <h2 class="font-semibold">{{ title }}</h2>
          <span class="absolute top-1/2 -translate-y-1/2 right-0 z-10">
            <input class="hidden peer" :id="title" type="checkbox" />
            <label
              class="cursor-pointer peer-checked:[&>i]:rotate-180"
              :for="title"
              @click="toggleDetails(title)"
            >
              <i
                class="
                  fa-solid fa-chevron-down
                  transition-transform
                  duration-200
                  ease-in-out
                "
              ></i>
            </label>
          </span>
        </summary>
        <ul class="pt-2 group-open:duration-200 group-open:ease-in-out">
          <li
            class="
              flex
              items-center
              justify-between
              py-3
              border-b
              last:border-0 last:pb-0
            "
            v-for="(number, indicator) in data"
            :key="number"
          >
            <span class="text-slate-600">{{ indicator }}</span>
            <span class="font-medium">{{
              parseFloat(number.toFixed(2)).toLocaleString("en-Us")
            }}</span>
          </li>
        </ul>
      </details>
    </template>
  </section>
</template>

<script>
import { ref, computed, onBeforeUpdate } from "vue";
export default {
  props: {
    financialData: Object,
  },
  setup(props) {
    const financialIndicators = computed(() => {
      if (!props.financialData) return;
      const omit = ["earnings", "IncomeStatement", "IncomeStatementMargin"];
      return Object.keys(props.financialData)
        .filter((key) => !omit.includes(key))
        .reduce((obj, key) => {
          obj[key] = props.financialData[key];
          return obj;
        }, {});
    });

    const financialStatement = computed(() => {
      if (!props.financialData) return;

      const { IncomeStatement, IncomeStatementMargin } = props.financialData;

      return Object.entries(IncomeStatement).reduce((acc, item, index) => {
        const BILLION = 1000000000;
        const obj = {};
        const [key, value] = item;
        const [key1, value1] = Object.entries(IncomeStatementMargin)[index];

        obj.name = key;
        obj["profit"] = (value / BILLION).toFixed(2);
        obj["margin"] =
          key1 !== "Revenue Growth"
            ? `${parseFloat((value1 * 100).toFixed(2))}%`
            : "---";
        acc.push(obj);
        return acc;
      }, []);
    });

    // dropdowns
    const detailsRefs = ref({});

    const toggleDetails = (key) => {
      const detailsRef = detailsRefs.value[key];
      detailsRef.open = !detailsRef.open;
    };

    onBeforeUpdate(() => (detailsRefs.value = {}));

    return {
      financialIndicators,
      financialStatement,
      detailsRefs,
      toggleDetails,
    };
  },
};
</script>