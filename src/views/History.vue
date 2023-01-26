<template>
  <main class="px-4 md:p-10 mx-auto w-full max-w-[1000px]">
    <h2 class="font-semibold text-lg">History</h2>
    <MultiLineChart :source="source" />

    <h2 class="font-semibold text-lg mt-10">Details</h2>

    <ul class="text-xs font-medium">
      <li class="flex gap-x-1 p-2 justify-between">
        <span class="w-1/5">Ticker</span>
        <span class="w-[10%] text-right">Shares </span>
        <span class="w-1/6 text-right">Cost </span>
        <span class="w-1/5 text-right">Close </span>
        <span class="w-1/4 text-right">Close date </span>
      </li>
    </ul>

    <ul>
      <li v-for="item in details" :key="item.date">
        <h3
          class="
            flex
            justify-between
            font-medium
            text-sm
            px-2
            py-1
            bg-indigo-100
            border-b border-indigo-300
            cursor-pointer
          "
          @click="toggleDropdown(item.date)"
        >
          <span>{{ item.date }}</span>
          <span>
            <i
              class="fa-solid fa-chevron-up"
              v-if="selectedDate.includes(item.date)"
            ></i>
            <i class="fa-solid fa-chevron-down" v-else></i>
          </span>
        </h3>
        <ul class="text-xs" v-if="selectedDate.includes(item.date)">
          <li
            class="flex gap-x-1 p-2 justify-between border-b last:border-none"
            v-for="trade in item.trades"
            :key="trade.recordUnix"
          >
            <span class="w-1/5">{{ trade.ticker }}</span>
            <span class="w-[10%] text-right">{{ trade.shares }}</span>
            <span class="w-1/6 text-right">${{ trade.cost }}</span>
            <span class="w-1/5 text-right">${{ trade.close }}</span>
            <span class="w-1/4 text-right">{{ trade.closeDate }}</span>
          </li>
        </ul>
      </li>
    </ul>
  </main>
</template>

<script>
import http from "../api/index";
import MultiLineChart from "@/components/MultiLineChart.vue";

import { ref } from "vue";
export default {
  components: {
    MultiLineChart,
  },
  setup() {
    const source = ref(null);
    const details = ref([]);
    const test = ref([]);

    async function getHistoryAssets() {
      try {
        const res = await http.get(`/api/history`);

        console.log("res", res.data.result);
        const { accData, nonAccData } = res.data.result;
        details.value = [...nonAccData]
          .map((data) => {
            return { ...data, date: data.date.replace(/\-/g, "/") };
          })
          .reverse();

        source.value = accData.reduce(
          (obj, data) => {
            obj.date.push(data.date.replace(/\-/g, "/"));
            obj.assetCost.push(data.totalCost);
            obj.assetValue.push(parseFloat(data.totalMarketValue.toFixed(2)));

            return obj;
          },
          { date: [], assetCost: [], assetValue: [] }
        );

        // 顯示最近一筆
        selectedDate.value.push(source.value.date.at(-1));
      } catch (error) {
        console.log("error", error);
      }
    }

    getHistoryAssets();

    const selectedDate = ref([]);

    function toggleDropdown(date) {
      if (selectedDate.value.includes(date)) {
        selectedDate.value = selectedDate.value.filter((item) => item !== date);
      } else {
        selectedDate.value.push(date);
      }
    }

    return {
      source,
      details,
      toggleDropdown,
      selectedDate,
      test,
    };
  },
};
</script>

