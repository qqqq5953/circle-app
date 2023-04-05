<template>
  <main>
    <section class="md:px-0 lg:px-4">
      <div class="flex items-center">
        <h2 class="font-semibold text-lg inline">Total stats</h2>
        <p class="ml-1 pt-1 tracking-wider">(TWD)</p>
      </div>
      <div>
        <TotalStats
          :fxRates="fxRates"
          :totalStats="totalStats"
          :latestInfo="latestInfo"
        />
      </div>
    </section>

    <div class="relative -mt-12 h-[360px]">
      <PieChart
        class="absolute left-0 top-0"
        :seriesData="holdingsTotalValue"
      />
      <div
        class="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 flex flex-col justify-center items-center w-full space-y-1"
        v-if="totalStats"
      >
        <p class="font-light text-sm">Total value:</p>
        <p
          class="font-semibold text-lg break-words w-1/3 text-center leading-5"
        >
          {{ totalStats["Total value"] }}
        </p>
        <p class="font-semibold text-sm text-red-600">
          {{ totalStats["P / L %"] }}
        </p>
      </div>
    </div>

    <div class="flex flex-wrap">
      <!-- Rate of Return Since last month-->
      <div
        class="w-full lg:w-6/12 xl:w-3/12 px-4 md:px-0 lg:px-4"
        v-for="i in 4"
        :key="i"
      >
        <div
          class="flex flex-col flex-auto break-words bg-white rounded p-4 mb-6 xl:mb-0 shadow-lg"
        >
          <div class="flex flex-wrap">
            <div class="relative w-full pr-4 max-w-full flex-1">
              <h5 class="text-blueGray-400 uppercase font-bold text-xs">
                Total Return
              </h5>
              <span class="font-semibold text-xl text-blueGray-700"> 5% </span>
            </div>
            <div
              class="text-white ml-4 p-3 text-center inline-flex items-center justify-center w-12 h-12 shadow-lg rounded-full bg-gray-400"
            >
              <i class="fas fa-chart-line"></i>
            </div>
          </div>
          <p class="flex text-sm text-blueGray-400 mt-4">
            <span class="flex-shrink-0 text-emerald-500 mr-2">
              <i class="fas fa-arrow-up"></i> 1.48%
            </span>
            <span class="whitespace-nowrap"> Since last month </span>
          </p>
        </div>
      </div>
    </div>
  </main>
</template>

<script>
import { ref } from "vue";
import TotalStats from "@/components/Holdings/TotalStats.vue";
import PieChart from "@/components/Charts/PieChart.vue";
import http from "../api/index";

export default {
  components: {
    TotalStats,
    PieChart,
  },
  setup() {
    const fxRates = ref({});
    const totalStats = ref(null);
    const holdingsTotalValue = ref(null);
    const latestInfo = ref({});

    (async () => {
      const result = await Promise.allSettled([
        http.get("/api/fxRates"),
        http.get("/api/totalStats"),
        http.get("/api/holdingLatestInfo"),
      ]);

      const [fxRatesObj, stats, holdingLatestInfo] = result.map(
        (item) => item.value.data.result
      );

      fxRates.value = fxRatesObj;
      totalStats.value = stats.totalStats;
      holdingsTotalValue.value = stats.holdingsTotalValue;
      latestInfo.value = holdingLatestInfo;

      console.log("totalStats", totalStats.value);
      console.log("holdingsTotalValue", holdingsTotalValue.value);
    })();

    return {
      fxRates,
      totalStats,
      latestInfo,
      holdingsTotalValue,
    };
  },
};
</script>
