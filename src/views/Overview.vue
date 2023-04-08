<template>
  <main>
    <section class="relative -mt-12 h-[360px]">
      <PieChart
        class="absolute left-0 top-0"
        :seriesData="holdingsTotalValue"
      />
      <div
        class="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 flex flex-col justify-center items-center w-full space-y-1"
        v-if="totalStats"
      >
        <p class="font-light text-sm">
          Total value <span class="text-xs">(TWD):</span>
        </p>
        <p
          class="font-semibold text-lg break-words w-2/5 text-center leading-5"
        >
          {{ totalStats["Total value"] }}
        </p>
        <p
          class="font-semibold text-base"
          :class="
            !totalStats['P / L %'].includes('-')
              ? 'text-red-600'
              : totalStats['P / L %'].includes('-')
              ? 'text-green-700'
              : null
          "
        >
          {{ totalStats["P / L %"] }}
        </p>
      </div>
    </section>

    <section>
      <!-- <div class="flex items-center">
        <h2 class="font-semibold text-lg inline">Total stats</h2>
        <p class="ml-1 pt-1 tracking-wider text-xs">(TWD)</p>
      </div> -->
      <div>
        <TotalStats
          :fxRates="fxRates"
          :totalStats="totalStats"
          :latestInfo="latestInfo"
        />
      </div>
    </section>

    <!-- Top 3 Performance -->
    <section v-if="topThreePerformance.length >= 3">
      <h2 class="font-semibold text-lg mb-4">Top 3 Performance</h2>
      <div
        class="flex flex-col space-y-6 sm:space-y-0 sm:flex-row sm:space-x-3"
      >
        <div
          class="sm:w-1/3"
          v-for="item in topThreePerformance"
          :key="item.ticker"
        >
          <Card>
            <template #card-title>
              <h3
                class="flex gap-x-3 gap-y-2 items-center mb-2 sm:flex-col md:flex-row"
              >
                <span class="ticker-badge" :class="item.style">
                  {{ item.ticker }}
                </span>
                <span
                  class="font-bold text-xs truncate w-3/5 sm:text-center sm:w-full md:text-left md:w-auto lg:text-sm"
                  >{{ item.name }}</span
                >
              </h3>
            </template>
            <template #card-sub-title>
              <div class="flex items-center gap-x-2">
                <p
                  class="font-medium px-2 py-1 lg:px-3 lg:py-2 rounded text-xs"
                  :class="
                    item.profitOrLossPercentage > 0
                      ? 'text-red-600 bg-red-100/70'
                      : item.profitOrLossPercentage < 0
                      ? 'text-green-700 bg-green-100'
                      : 'text-slate-500 bg-slate-200'
                  "
                >
                  <span v-if="item.profitOrLossPercentage !== 0">
                    <i
                      class="fas fa-arrow-up mr-px text-red-600"
                      v-if="item.profitOrLossPercentage > 0"
                    ></i>
                    <i
                      class="fas fa-arrow-down mr-px text-green-700"
                      v-else-if="item.profitOrLossPercentage < 0"
                    ></i>
                  </span>
                  <span v-else>--</span>
                  {{
                    item.profitOrLossPercentage < 0
                      ? item.profitOrLossPercentage * -1
                      : item.profitOrLossPercentage
                  }}
                  %
                </p>
                <p
                  class="text-xs font-medium"
                  :class="
                    item.profitOrLossValue > 0
                      ? 'text-red-600'
                      : item.profitOrLossValue < 0
                      ? 'text-green-700'
                      : 'text-slate-500'
                  "
                >
                  <span v-if="item.profitOrLossValue >= 0">
                    <span>+$</span>
                    <span>{{ item.profitOrLossValue }}</span>
                  </span>
                  <span v-else>
                    <span>-$</span>
                    <span>{{ item.profitOrLossValue * -1 }}</span>
                  </span>
                </p>
                <router-link
                  class="hover:text-indigo-500 text-indigo-600 font-bold ml-auto block"
                  :to="{
                    name: 'TradeDetails',
                    query: {
                      tempTicker: item.tempTicker,
                    },
                  }"
                >
                  <span class="text-xs flex items-center gap-x-1.5">
                    <span class="sm:hidden lg:inline">Details</span>
                    <i class="fa-solid fa-chevron-right"></i
                  ></span>
                </router-link>
              </div>
            </template>
          </Card>
        </div>
      </div>
    </section>

    <section>
      <div class="flex justify-between items-end py-3">
        <h2>
          <span class="text-lg font-semibold">Market info</span>
          <!-- <span class="ml-3 text-slate-600">- market info</span> -->
        </h2>

        <router-link
          class="hover:text-indigo-500 text-indigo-600 font-bold block px-4"
          :to="{ name: 'Holdings' }"
        >
          <span class="text-xs flex items-center gap-x-1.5">
            <span class="sm:hidden lg:inline">See all</span>
            <i class="fa-solid fa-chevron-right"></i
          ></span>
        </router-link>
      </div>
      <TickerInfo
        :stockLists="holdingList"
        :isMultiRows="true"
        :isUpdate="false"
        :toStockInfo="true"
        :hasOptionalTd="false"
      >
        <template #thead>
          <thead class="bg-gray-100 border-y hidden lg:table-header-group">
            <tr>
              <th
                class="px-6 py-3 text-gray-700 text-center text-xs uppercase border-x-0 whitespace-nowrap font-semibold w-6/12 lg:w-5/12"
              >
                Stocks
              </th>
              <td
                class="p-3 lg:px-0 text-gray-700 text-right text-xs uppercase border-x-0 whitespace-nowrap font-semibold w-[16%] md:w-[10%] lg:w-auto"
              >
                Price
              </td>
              <td
                class="pl-3 py-3 text-gray-700 text-right text-xs uppercase border-x-0 whitespace-nowrap font-semibold w-[30%] md:w-1/6 xl:pr-0"
              >
                Change %
              </td>
              <td
                class="px-3 text-gray-700 text-right text-xs uppercase border-x-0 whitespace-nowrap font-semibold hidden md:w-[12%] lg:table-cell"
              >
                Change
              </td>
              <td
                class="border-t-0 border-x-0 py-3 sm:py-3.5 pr-3 lg:pr-4 w-1/12"
              ></td>
            </tr>
          </thead>
        </template>
      </TickerInfo>
    </section>

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
import TickerInfo from "@/components/TickerInfo.vue";
import Card from "@/components/Card.vue";
import http from "../api/index";

export default {
  components: {
    TotalStats,
    PieChart,
    TickerInfo,
    Card,
  },
  setup() {
    const fxRates = ref({});
    const totalStats = ref(null);
    const holdingsTotalValue = ref([]);
    const latestInfo = ref({});
    const holdingList = ref([]);
    const topThreePerformance = ref([]);

    (async () => {
      const updateRes = await http.get("/api/checkUpdateInfoAndStats");
      const { holdingLatestInfo, hasChecked } = updateRes.data.result;

      const result = await Promise.allSettled([
        http.get("/api/fxRates"),
        http.get(`/api/totalStats/${hasChecked}`),
        http.get(`/api/topThreePerformance/${hasChecked}`),
      ]);

      const [fxRatesObj, stats, topThree] = result.map(
        (item) => item.value.data.result
      );

      fxRates.value = fxRatesObj;
      totalStats.value = stats.totalStats;
      holdingsTotalValue.value = stats.holdingsTotalValue;
      latestInfo.value = holdingLatestInfo;
      topThreePerformance.value = topThree;

      holdingList.value = Object.values(holdingLatestInfo).map((item) => {
        return { ...item, price: item.close };
      });

      console.log("totalStats", totalStats.value);
      console.log("holdingList", holdingList.value);
      console.log("holdingsTotalValue", holdingsTotalValue.value);
      console.log("topThree", topThree);
    })();

    return {
      fxRates,
      totalStats,
      latestInfo,
      holdingsTotalValue,
      holdingList,
      topThreePerformance,
    };
  },
};
</script>
