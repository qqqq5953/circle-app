<template>
  <main class="px-4 md:p-10 mx-auto w-full max-w-[1000px]">
    <div class="flex flex-col gap-y-10 animate-pulse" v-if="isLoading">
      <div class="rounded bg-gray-300 h-6 w-40"></div>
      <div class="rounded bg-gray-300 h-40"></div>
      <div class="rounded bg-gray-300 h-6 w-40"></div>
      <div class="rounded bg-gray-300 h-60"></div>
    </div>
    <div v-else>
      <button class="border border-black p-2" @click="deleteAll">
        delete all
      </button>
      <section v-if="source">
        <h2 class="font-semibold text-lg">History</h2>
        <MultiLineChart :source="source" />
      </section>

      <section v-if="details.length !== 0">
        <h2 class="font-semibold text-lg mt-10">Details</h2>
        <TitleList class="border-b px-1 py-1" :list="childTitle" />

        <ul>
          <li v-for="(trades, date) in details" :key="date">
            <div
              class="
                flex
                justify-between
                p-1
                text-xs
                font-medium
                bg-indigo-100
                border-b border-indigo-300
                cursor-pointer
              "
              @click="toggleDropdown(date)"
            >
              <span>{{ date }}</span>
              <span>
                <i
                  class="fa-solid fa-chevron-up"
                  v-if="selectedDate.includes(date)"
                ></i>
                <i class="fa-solid fa-chevron-down" v-else></i>
              </span>
            </div>
            <ul class="text-xs" v-if="selectedDate.includes(date)">
              <DetailList class="px-1 py-2" :list="trades" />
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
import DetailList from "@/components/History/DetailList.vue";

import { ref } from "vue";
export default {
  components: {
    MultiLineChart,
    TitleList,
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

        const { totalValue, historyDetails } = res.data.result;
        source.value = totalValue;
        details.value = historyDetails;

        // 顯示最近一筆
        // selectedDate.value.push(source.value.date.at(-1));
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
        name: "Value (TWD)",
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

    function deleteAll() {
      http.post("/api/deleteAll").then((res) => {
        console.log("delete res", res);
      });
    }

    return {
      source,
      details,
      toggleDropdown,
      selectedDate,
      isLoading,

      childTitle,
      totalTitle,

      deleteAll,
    };
  },
};
</script>

