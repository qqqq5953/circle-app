<template>
  <main class="px-4 md:p-10 mx-auto w-full max-w-[1000px]">
    <div class="flex flex-col gap-y-10 animate-pulse" v-if="isLoading">
      <div class="rounded bg-gray-300 h-6 w-40"></div>
      <div class="rounded bg-gray-300 h-40"></div>
      <div class="rounded bg-gray-300 h-6 w-40"></div>
      <div class="rounded bg-gray-300 h-60"></div>
    </div>
    <div v-else>
      <section v-if="source">
        <h2 class="font-semibold text-lg">History</h2>
        <MultiLineChart :source="source" />
      </section>

      <section v-if="details.length !== 0">
        <h2 class="font-semibold text-lg mt-10">Details</h2>
        <TitleList :list="totalTitle" />

        <ul>
          <li v-for="item in details" :key="item.date">
            <div
              class="
                text-xs
                font-medium
                px-2
                py-1
                bg-indigo-100
                border-b border-indigo-300
                cursor-pointer
              "
              @click="toggleDropdown(item.date)"
            >
              <TotalList :list="item" :selectedDate="selectedDate" />
            </div>
            <ul class="text-xs" v-if="selectedDate.includes(item.date)">
              <TitleList class="border-b px-2 py-1" :list="childTitle" />
              <DetailList class="p-2" :list="item.trades" />
            </ul>
          </li>
        </ul>
      </section>

      <p v-else>no data</p>
    </div>
  </main>
</template>

<script>
import http from "../api/index";
import MultiLineChart from "@/components/MultiLineChart.vue";
import TitleList from "@/components/History/TitleList.vue";
import TotalList from "@/components/History/TotalList.vue";
import DetailList from "@/components/History/DetailList.vue";

import { ref } from "vue";
export default {
  components: {
    MultiLineChart,
    TitleList,
    TotalList,
    DetailList,
  },
  setup() {
    const source = ref(null);
    const details = ref([]);
    const isLoading = ref(false);

    async function getHistoryAssets() {
      isLoading.value = true;

      try {
        const res = await http.get(`/api/history`);

        console.log("res", res.data.result);

        if (!res.data.result) {
          isLoading.value = false;
          return;
        }

        const { nonAccData, accData } = res.data.result;
        details.value = [...nonAccData]
          .map((data) => {
            return {
              ...data,
              date: data.date.replace(/\-/g, "/"),
            };
          })
          .reverse();

        console.log("details.value", details.value);

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

      isLoading.value = false;
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

    const childTitle = ref([
      {
        name: "Ticker",
        style: "w-[22%] bg-blue-300",
      },
      {
        name: "Cost",
        style: "w-[24%] text-right bg-red-300",
      },
      {
        name: "Shares",
        style: "w-[15%] text-right bg-blue-300",
      },
      {
        name: "Value",
        style: "w-[24%] text-right bg-red-300",
      },
      {
        name: "P / L %",
        style: "w-[15%] text-right bg-blue-300",
      },
    ]);
    const totalTitle = ref([
      {
        name: "Trade date",
        style: "w-[22%] bg-blue-300",
      },
      {
        name: "Total cost",
        style: "w-[24%] text-right bg-red-300",
      },
      {
        name: "Total shares",
        style: "w-[15%] text-right bg-blue-300",
      },
      {
        name: "Total value",
        style: "w-[24%] text-right bg-red-300",
      },
      {
        name: "",
        style: "w-[15%] text-right bg-blue-300",
      },
    ]);

    return {
      source,
      details,
      toggleDropdown,
      selectedDate,
      isLoading,

      childTitle,
      totalTitle,
    };
  },
};
</script>

