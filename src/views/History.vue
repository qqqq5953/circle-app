<template>
  <main class="px-4 md:p-10 mx-auto w-full max-w-[1000px]">
    <div class="flex flex-col gap-y-10 animate-pulse" v-if="isLoading">
      <div class="rounded bg-gray-300 h-6 w-40"></div>
      <div class="rounded bg-gray-300 h-40"></div>
      <div class="rounded bg-gray-300 h-6 w-40"></div>
      <div class="rounded bg-gray-300 h-60"></div>
    </div>
    <div v-else>
      <!-- <button class="border border-black p-2" @click="deleteAll">
        delete all
      </button> -->
      <section v-if="source">
        <h2 class="font-semibold text-lg">History</h2>
        <MultiLineChart :source="source" />
      </section>

      <section v-if="details.length !== 0">
        <h2 class="font-semibold text-lg mt-10">Details</h2>
        <TitleList class="p-2 md:px-3 text-xs" :list="childTitle" />

        <ul class="text-xs flex flex-col">
          <li
            class="last:mb-0"
            :class="selectedDate.includes(date) ? 'mb-0' : 'mb-3'"
            v-for="(trades, date) in details"
            :key="date"
          >
            <div
              class="
                flex
                justify-between
                px-2
                py-1.5
                md:px-3
                font-medium
                cursor-pointer
                rounded
              "
              :class="
                selectedDate.includes(date)
                  ? 'outline outline-1 outline-slate-200 bg-slate-100'
                  : 'bg-slate-100'
              "
              @click="toggleDropdown(date)"
            >
              <span class="text-slate-500">{{ date }}</span>
              <span>
                <i
                  class="fa-solid fa-chevron-up"
                  v-if="selectedDate.includes(date)"
                ></i>
                <i class="fa-solid fa-chevron-down" v-else></i>
              </span>
            </div>
            <ul v-if="selectedDate.includes(date)">
              <DetailList class="px-2 py-3.5 md:px-3" :list="trades" />
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
        console.log("totalValue", totalValue);
        console.log("historyDetails", historyDetails);

        // 顯示最近一筆
        selectedDate.value.push(Object.keys(historyDetails)[0]);
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
        name: "",
        style: "w-[27%] md:w-[15%]",
      },
      {
        name: "P / L %",
        style: "w-[23%] ml-auto text-right md:ml-0",
      },
      {
        name: "Cost",
        style: "w-[20%] text-right",
      },
      {
        name: "Shares",
        style: "w-[20%] md:w-[15%] text-right",
      },
      {
        name: "Close",
        style: "hidden md:inline md:w-[20%] text-right",
      },
      {
        name: "Value (TWD)",
        style: "hidden md:inline md:w-[20%] text-right",
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

      deleteAll,
    };
  },
};
</script>

