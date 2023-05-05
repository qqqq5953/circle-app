<template>
  <main>
    <div class="flex flex-col gap-y-10 animate-pulse" v-if="loading">
      <div class="rounded bg-gray-300 h-6 w-40"></div>
      <div class="rounded bg-gray-300 h-40"></div>
      <div class="rounded bg-gray-300 h-6 w-40"></div>
      <div class="rounded bg-gray-300 h-60"></div>
    </div>

    <section class="flex flex-col items-center space-y-2" v-else-if="error">
      <h2 class="text-lg font-medium">
        {{ error.content }}
        <i class="fas fa-times text-red-600"></i>
      </h2>
      <p class="text-slate-700">{{ error.message }}</p>

      <button
        class="border rounded px-2 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed"
        :disabled="loading"
        @click="reolad"
      >
        reload
      </button>
    </section>

    <template v-else>
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
              class="flex justify-between px-2 py-1.5 md:px-3 font-medium cursor-pointer rounded bg-slate-100 group-open:border group-open:border-slate-200 focus:outline-none"
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
    </template>
  </main>
</template>

<script>
import http from "../api/index";
import MultiLineChart from "@/components/Charts/MultiLineChart.vue";
import TitleList from "@/components/History/TitleList.vue";
import DetailList from "@/components/History/DetailList.vue";
import useAxios from "@/composables/useAxios.js";
import { useRouter } from "vue-router";

import { computed, ref, watch } from "vue";
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

    const router = useRouter();
    function reolad() {
      if (!error.value) {
        http.delete("/api/closePrice").then((res) => {
          console.log("delete res", res);
          router.go();
        });
      }
    }

    watch(loading, (newVal) => {
      if (newVal) return;
      if (!data.value?.result) router.replace({ name: "Init" });
    });

    return {
      source,
      details,
      data,
      error,
      loading,
      childTitle,
      reolad,
    };
  },
};
</script>

<style scoped>
details > summary::-webkit-details-marker {
  display: none;
}
</style>