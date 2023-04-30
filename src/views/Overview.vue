<template>
  <main>
    <!-- v-if="loading" -->
    <OverviewSkeleton v-if="loading" />

    <template v-else-if="errors.length">
      <section class="flex flex-col justify-center items-center">
        <p class="pb-4 font-medium text-center text-xl md:text-2xl">
          Oops! Something went wrong!
        </p>
        <ul
          class="flex flex-col justify-center items-center space-y-4 list-disc"
        >
          <li v-for="(error, index) in errors" :key="index">
            <p class="md:text-lg font-medium">
              {{ error.content }}
              <i class="fas fa-times text-red-600 ml-2"></i>
            </p>
            <p class="text-sm md:text-base text-slate-700">
              {{ error.message }}
            </p>
          </li>
        </ul>
      </section>
    </template>

    <template v-else-if="holdingsTotalValue.length">
      <div class="flex flex-col gap-y-10 lg:flex-row lg:justify-between">
        <!-- pie chart -->
        <section class="relative -mx-6 -mt-12 h-[360px] lg:mx-0 lg:w-1/2">
          <PieChart
            class="absolute inset-x-0 top-0"
            :seriesData="holdingsTotalValue"
          />
          <!-- border border-red-300 -->
          <div
            class="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 flex flex-col justify-center items-center w-full space-y-1"
            v-if="totalStats"
          >
            <p class="font-light text-xs">
              Total value <span class="text-xs">(TWD)</span>
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

        <!-- total stats -->
        <section>
          <div>
            <TotalStats
              :fxRates="fxRates"
              :totalStats="totalStats"
              :latestInfo="latestInfo"
              customStyle="lg:w-1/2"
            />
          </div>
        </section>
      </div>

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

      <!-- holdings -->
      <section>
        <div class="flex justify-between items-center py-3">
          <h2 class="text-lg font-semibold">Market info</h2>
          <router-link
            class="hover:text-indigo-500 text-indigo-600 font-bold block px-4"
            :to="{ name: 'Holdings' }"
          >
            <span class="text-xs flex items-center gap-x-1.5">
              <span>See all</span>
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
    </template>

    <!-- <template v-else>
      <section class="py-[20%] text-center">
        <button
          class="bg-indigo-700 text-white hover:bg-indigo-600 rounded-full px-3 py-1.5 text-xs"
        >
          <span>+</span>
          <span class="mx-1">Make your first investment</span>
        </button>
      </section>
    </template> -->
  </main>
</template>

<script>
import { ref } from "vue";
import TotalStats from "@/components/Holdings/TotalStats.vue";
import PieChart from "@/components/Charts/PieChart.vue";
import TickerInfo from "@/components/TickerInfo.vue";
import Card from "@/components/Card.vue";
import OverviewSkeleton from "@/components/skeleton/OverviewSkeleton.vue";
import http from "../api/index";
import CardSkeleton from "@/components/skeleton/CardSkeleton.vue";
import { useRouter } from "vue-router";

export default {
  components: {
    TotalStats,
    PieChart,
    TickerInfo,
    Card,
    OverviewSkeleton,
    CardSkeleton,
  },
  setup() {
    const loading = ref(false);
    const errors = ref([]);
    const fxRates = ref({});
    const totalStats = ref(null);
    const holdingsTotalValue = ref([]);
    const latestInfo = ref({});
    const holdingList = ref([]);
    const topThreePerformance = ref([]);
    const router = useRouter();

    (async () => {
      toggleSkeleton(true);

      try {
        const updateRes = await http.get("/api/checkUpdateInfoAndStats");

        if (updateRes.data.errorMessage) {
          const { content, errorMessage } = updateRes.data;
          errors.value.push({ content, message: errorMessage });
          return;
        }

        if (!updateRes.data.result) return router.push({ name: "Init" });

        const { holdingLatestInfo, hasChecked } = updateRes.data.result;
        const result = await Promise.allSettled([
          http.get("/api/fxRates"),
          http.get(`/api/totalStats/${hasChecked}`),
          http.get(`/api/topThreePerformance/${hasChecked}`),
        ]);

        errors.value = result
          .filter((item) => item.value.data.errorMessage)
          .map((item) => {
            const { content, errorMessage } = item.value.data;
            return { content, message: errorMessage };
          });

        if (errors.value.length === 0) {
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

          // console.log("totalStats", totalStats.value);
          // console.log("holdingList", holdingList.value);
          // console.log("holdingsTotalValue", holdingsTotalValue.value);
          // console.log("topThree", topThree);
        }
      } catch (err) {
        console.log("err", err);

        errors.value.push(err.message);
      } finally {
        toggleSkeleton(false);
      }
    })();

    function toggleSkeleton(isLoading) {
      loading.value = isLoading;
    }

    return {
      loading,
      errors,
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
