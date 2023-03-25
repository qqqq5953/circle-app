<template>
  <main class="px-4 md:p-10 mx-auto w-full max-w-[1000px]">
    <div class="flex flex-col gap-y-10 animate-pulse" v-if="loading">
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

        <div class="text-xs flex flex-col">
          <details
            class="last:mb-0 group mb-3 open:mb-0"
            v-for="(trades, date) in details"
            :key="date"
            :open="Object.keys(details)[0] === date"
          >
            <summary
              class="flex justify-between px-2 py-1.5 md:px-3 font-medium cursor-pointer rounded bg-slate-100 group-open:outline group-open:outline-1 group-open:outline-slate-200"
            >
              <span class="text-slate-500">{{ date }}</span>
              <span class="hidden group-open:inline">
                <i class="fa-solid fa-chevron-up"></i>
              </span>
              <span class="group-open:hidden">
                <i class="fa-solid fa-chevron-down"></i>
              </span>
            </summary>
            <ul>
              <DetailList class="px-2 py-3.5 md:px-3" :list="trades" />
            </ul>
          </details>
        </div>
      </section>

      <section
        class="flex flex-col items-center space-y-2"
        v-if="!data.success"
      >
        <h2 class="text-lg font-medium">
          {{ error.content }}
          <i class="fas fa-times text-red-600"></i>
        </h2>
        <p class="text-slate-700">{{ error.message }}</p>
      </section>
    </div>
  </main>
</template>

<script>
import http from "../api/index";
import MultiLineChart from "@/components/MultiLineChart.vue";
import TitleList from "@/components/History/TitleList.vue";
import DetailList from "@/components/History/DetailList.vue";
import useAxios from "@/composables/useAxios.js";

import { computed, ref } from "vue";
export default {
  components: {
    MultiLineChart,
    TitleList,
    DetailList,
  },
  setup() {
    const { data, error, loading } = useAxios("/api/history", "get");

    const source = computed(() => {
      return data.value?.result?.totalValue;
    });
    const details = computed(() => {
      return data.value?.result?.historyDetails || [];
    });

    const childTitle = ref([
      {
        name: "",
        style: "w-[25%] md:w-[15%]",
      },
      {
        name: "P / L %",
        style: "w-[30%] ml-auto text-right md:ml-0",
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
      data,
      error,
      loading,
      childTitle,
      deleteAll,
    };
  },
};
</script>

