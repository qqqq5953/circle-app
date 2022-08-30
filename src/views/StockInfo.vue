<template>
  <div>
    <StockInfoSkeleton v-if="isSkeletonLoading" />
    <div class="flex flex-col gap-4 px-4 md:p-10 mx-auto w-full" v-else>
      <header>
        <h2 class="text-xl mb-3">{{ stock.price?.name }}</h2>
        <div class="flex items-center gap-3 border-t pt-3">
          <span class="text-3xl">${{ stock.price?.price }}</span>
          <span
            class="px-3 py-1.5 rounded text-sm font-medium"
            :class="
              stock.price?.previousCloseChange > 0
                ? 'text-red-600 bg-red-100'
                : 'text-green-600 bg-green-100'
            "
          >
            <i
              class="fas fa-arrow-up"
              v-if="stock.price?.previousCloseChange > 0"
            ></i>
            <i class="fas fa-arrow-down" v-else></i>
            {{ stock.price?.previousCloseChangePercent }}%</span
          >
          <span
            class="text-sm font-medium"
            :class="
              stock.price?.previousCloseChange > 0
                ? 'text-red-600'
                : 'text-green-600 b'
            "
            >{{ stock.price?.previousCloseChange }}</span
          >
        </div>
      </header>

      <main class="flex flex-col lg:flex-row gap-6">
        <section class="lg:w-2/3">
          <Tabs
            :tabs="tabs_PriceTrend"
            :currentTabProps="currentTab_PriceTrend"
            @switchTab="(val) => (currentTab_PriceTrend = val)"
          />
          <Price
            :xAxisData="stock.priceTrend.xAxisData"
            :seriesData="stock.priceTrend.seriesData"
          />
        </section>

        <!-- Revenue and Earnings -->
        <section v-if="stock.financialData.earnings">
          <h2 class="text-2xl mb-2">Revenue and Earnings</h2>
          <Tabs
            :tabs="tabs_Earnings"
            :currentTabProps="currentTab_Earnings"
            @switchTab="(val) => (currentTab_Earnings = val)"
          />
          <component :is="currentTab_Earnings" v-bind="barData"></component>
        </section>

        <!-- Earnings per share -->
        <section v-if="stock.financialData.earnings">
          <h2 class="text-2xl">Earnings per share</h2>
          <EPS :xAxisData="epsQuarterlyDate" :seriesData="epsQuarterly" />
        </section>

        <!-- Financial Data -->
        <section class="border rounded p-3 text-sm">
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
                <input
                  class="hidden peer"
                  id="Income Statement"
                  type="checkbox"
                />
                <label
                  class="cursor-pointer peer-checked:[&>i]:rotate-180"
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
              <li class="flex items-center pt-3 text-slate-700">
                <span class="ml-auto underline">*TTM</span>
                <span class="w-1/5 text-right ml-1 underline">margin</span>
              </li>
              <li
                class="flex items-center"
                v-for="indicator in financialStatement"
                :key="indicator"
              >
                <span class="text-slate-700">{{ indicator.name }}</span>
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
          <details
            class="py-3 border-b last:border-0 group"
            v-for="(item, title) in financialIndicators"
            :key="title"
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
                v-for="(number, indicator) in item"
                :key="number"
              >
                <span class="text-slate-700">{{ indicator }}</span>
                <span class="font-medium">{{
                  parseFloat(number.toFixed(2)).toLocaleString("en-Us")
                }}</span>
              </li>
            </ul>
          </details>
        </section>

        <aside class="lg:w-1/3 flex flex-col gap-6">
          <section class="border rounded p-3 text-sm">
            <div class="flex flex-wrap gap-1 my-2 text-slate-700 font-light">
              <span
                class="rounded-full border px-3 py-1 bg-slate-100"
                v-if="stock.profile?.sector"
                >{{ stock.profile?.sector }}</span
              >
              <span
                class="rounded-full border px-3 py-1 bg-slate-100"
                v-if="stock.price?.quoteType"
                >{{ stock.price?.quoteType }}</span
              >
              <span
                class="rounded-full border px-3 py-1 bg-slate-100"
                v-if="stock.profile?.country"
                >{{
                  stock.profile?.country === "United States"
                    ? "US"
                    : stock.profile?.country
                }}</span
              >
            </div>
            <ul>
              <li class="flex items-center justify-between py-3 border-b">
                <span class="text-slate-700">Day Range:</span>
                <span class="font-medium"
                  >{{ stock.detail?.range["Day Range"].dayLow }} -
                  {{ stock.detail?.range["Day Range"].dayHigh }}</span
                >
              </li>
              <li class="flex items-center justify-between py-3 border-b">
                <span class="text-slate-700">52 Week Range:</span>
                <span class="font-medium">
                  {{ stock.detail?.range["52 Week Range"].fiftyTwoWeekLow }} -
                  {{ stock.detail?.range["52 Week Range"].fiftyTwoWeekHigh }}
                </span>
              </li>
              <li
                class="flex items-center justify-between py-3 border-b"
                v-for="(item, index) in stock?.detail?.fixed"
                :key="item"
              >
                <span class="text-slate-700">{{ index }}:</span>
                <span class="font-medium">{{ item }}</span>
              </li>
              <li class="flex items-center justify-between py-3">
                <span class="text-slate-700">Exchange:</span>
                <span class="font-medium">{{ stock.price?.exchangeName }}</span>
              </li>
            </ul>
          </section>

          <!-- Profile -->
          <section class="border rounded p-3 text-sm">
            <h2 class="text-2xl mb-2">Profile</h2>
            <ul>
              <li
                class="relative pb-3"
                :class="{ 'border-b': stock.price?.quoteType === 'Equity' }"
              >
                <div class="flex justify-between items-center text-slate-700">
                  <h3>Summary</h3>
                  <span v-if="isToggleShow">
                    <input class="hidden" id="box" type="checkbox" />
                    <label
                      class="cursor-pointer"
                      for="box"
                      @click="toggleSummary"
                    >
                      <i class="fa-solid fa-chevron-down"></i>
                    </label>
                  </span>
                </div>

                <!-- longBusinessSummary -->
                <div
                  class="pt-2 font-light"
                  :class="
                    isParagraphShow || !isToggleShow
                      ? 'h-auto overflow-visible'
                      : 'h-[200px] lg:h-[120px] overflow-hidden'
                  "
                >
                  <p class="text-zinc-700 font-extralight" ref="paragraph">
                    {{ stock.profile?.longBusinessSummary }}
                  </p>
                </div>

                <div
                  v-if="!isParagraphShow"
                  class="absolute z-10 rounded w-full h-1 bottom-2.5"
                  style="backdrop-filter: blur(1.5px)"
                ></div>
              </li>
              <template v-if="stock.price?.quoteType === 'Equity'">
                <li class="flex items-center justify-between py-3 border-b">
                  <span class="text-slate-700">Website</span>
                  <span class="text-right font-medium">
                    <a
                      class="hover:underline text-blue-600"
                      :href="stock.profile?.website"
                      target="blank"
                      >{{ stock.profile?.website.split("www.")[1] }}
                    </a>
                  </span>
                </li>
                <li class="flex items-center justify-between py-3 border-b">
                  <span class="text-slate-700">Address</span>
                  <span class="text-right font-medium">{{
                    stock.profile?.address
                  }}</span>
                </li>
                <li class="flex items-center justify-between py-3">
                  <span class="text-slate-700">Employees</span>
                  <span class="text-right font-medium">{{
                    stock.profile?.fullTimeEmployees
                  }}</span>
                </li>
              </template>
            </ul>
          </section>
        </aside>
      </main>
    </div>
  </div>
</template>

<script>
import { ref, nextTick, computed, onBeforeUpdate, watch } from "vue";
import axios from "axios";

import useAxios from "@/composables/useAxios.js";
import useStockInfoStore from "@/stores/watchlistStore.js";
import StockInfoSkeleton from "@/components/skeleton/StockInfoSkeleton.vue";
import Price from "@/components/LineChart.vue";
import Quarterly from "@/components/BarChart.vue";
import Yearly from "@/components/BarChart.vue";
import EPS from "@/components/BarChart.vue";
import Tabs from "@/components/Tabs.vue";
export default {
  components: {
    StockInfoSkeleton,
    Price,
    Quarterly,
    Yearly,
    EPS,
    Tabs,
  },
  props: {
    ticker: {
      type: String,
    },
  },
  setup(props) {
    console.log("props", props.ticker);
    const $store = useStockInfoStore();

    const isToggleShow = ref(false);
    const isParagraphShow = ref(false);
    const isSkeletonLoading = ref(true);

    const stock = ref({});
    const paragraph = ref(null);
    const paragraphHeight = ref(null);
    const paragraphBorderHeight = ref(200);

    const toggleSummary = () => {
      isParagraphShow.value = !isParagraphShow.value;
    };

    const toggleSkeleton = (isLoading) => {
      isSkeletonLoading.value = isLoading;
    };

    const epsQuarterlyDate = ref(null);
    const epsQuarterly = ref(null);
    const seriesData = ref(null);
    const tabs_PriceTrend = ref(["5D", "1M", "6M"]);
    const currentTab_PriceTrend = ref("5D");
    const cachedPrice = {};

    async function getTickerInfo() {
      const quotePromiseObj = axios.get(`/api/quote/${props.ticker}`);
      const summaryPromiseObj = axios.get(`/api/tickerSummary/${props.ticker}`);
      const priceTrendPromiseObj = axios.get(
        `/api/historicalPrice/${props.ticker}?window=${currentTab_PriceTrend.value}`
      );

      const response = await Promise.allSettled([
        quotePromiseObj,
        summaryPromiseObj,
        priceTrendPromiseObj,
      ]);

      const quote = response[0].value.data.result;
      const summary = response[1].value.data.result;
      const priceTrend = response[2].value.data.result;
      const { profile, detail, price } = summary;

      const xAxisData = priceTrend.map((item) => item.date);
      const seriesData = priceTrend.map((item) => item.close);

      cachePrice({ xAxisData, seriesData });

      stock.value = {
        profile,
        detail,
        priceTrend: { xAxisData, seriesData },
        price: { ...price, ...quote },
      };

      if (price.quoteType === "Equity") await getFinancialData();

      toggleSkeleton(false);

      await nextTick();
      paragraphHeight.value = paragraph.value?.offsetHeight;
      isToggleShow.value =
        paragraph.value?.offsetHeight > paragraphBorderHeight.value;
    }
    getTickerInfo();

    // financial data
    async function getFinancialData() {
      const financialDataPromiseObj = axios.get(
        `/api/financialData/${props.ticker}`
      );
      const response = await Promise.allSettled([financialDataPromiseObj]);

      const financialData = response[0].value.data.result;
      const { earnings } = financialData;

      stock.value = { ...stock.value, financialData };

      epsQuarterly.value = getEPS(earnings);
      epsQuarterlyDate.value = [
        ...getDate("quarterly"),
        earnings.earningsChart.currentQuarterEstimateDate +
          earnings.earningsChart.currentQuarterEstimateYear +
          "(e)",
      ];

      console.log("financialData", financialData);
    }

    const financialIndicators = computed(() => {
      const omit = ["earnings", "IncomeStatement", "IncomeStatementMargin"];
      return Object.keys(stock.value.financialData)
        .filter((key) => !omit.includes(key))
        .reduce((obj, key) => {
          obj[key] = stock.value.financialData[key];
          return obj;
        }, {});
    });

    const financialStatement = computed(() => {
      const { IncomeStatement, IncomeStatementMargin } =
        stock.value.financialData;

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

    // eps
    function getEPS(earnings) {
      const { earningsChart } = earnings;
      const barSeries1 = {
        name: "EPS",
        data: [
          ...earningsChart.quarterly.map((item) => item.actual),
          {
            value: earningsChart.currentQuarterEstimate,
            itemStyle: {
              color: "#bfdbfe",
              borderType: "dashed",
            },
            label: {
              show: true,
              position: "top",
            },
          },
        ],
        type: "bar",
        itemStyle: {
          color: "#3b82f6",
          borderRadius: [3, 3, 0, 0],
        },
        barWidth: 22,
        emphasis: {
          itemStyle: {
            color: "#1d4ed8",
            borderType: "dashed",
          },
          focus: "series",
          blurScope: "coordinateSystem",
        },
      };

      return [barSeries1];
    }

    // revenue and earnings
    function getEarningsAndRevenue(frequency = "quarterly") {
      const BILLION = 1000000000;
      const { financialsChart } = stock.value.financialData.earnings;

      const earnings = financialsChart[frequency].map((item) =>
        parseFloat((item.earnings / BILLION).toFixed(2))
      );
      const revenue = financialsChart[frequency].map((item) =>
        parseFloat((item.revenue / BILLION).toFixed(2))
      );

      const barSeries1 = {
        name: "Revenue",
        data: revenue,
        type: "bar",
        itemStyle: {
          color: "#3b82f6",
          borderRadius: [3, 3, 0, 0],
        },
        emphasis: {
          itemStyle: {
            color: "#1d4ed8",
          },
          focus: "series",
          blurScope: "coordinateSystem",
        },
      };

      const barSeries2 = {
        name: "Earnings",
        data: earnings,
        type: "bar",
        itemStyle: {
          color: "#fde047",
          borderRadius: [3, 3, 0, 0],
        },
        emphasis: {
          itemStyle: {
            color: "#facc15",
          },
          focus: "series",
          blurScope: "coordinateSystem",
        },
      };

      return [barSeries1, barSeries2];
    }

    function getDate(frequency = "quarterly") {
      const { financialsChart } = stock.value.financialData.earnings;
      return financialsChart[frequency].map((item) => item.date);
    }

    function getBarChartData(frequency) {
      return {
        xAxisData: getDate(frequency),
        seriesData: getEarningsAndRevenue(frequency),
      };
    }

    const tabs_Earnings = ref(["Quarterly", "Yearly"]);
    const currentTab_Earnings = ref("Quarterly");
    const barData = computed(() => {
      if (!stock.value.financialData.earnings) return;

      if (currentTab_Earnings.value === "Quarterly") {
        return getBarChartData("quarterly");
      } else if (currentTab_Earnings.value === "Yearly") {
        return getBarChartData("yearly");
      }
    });

    async function getPriceData() {
      if (cachedPrice.hasOwnProperty(currentTab_PriceTrend.value)) {
        console.log("cachedPrice");
        const { xAxisData, seriesData } =
          cachedPrice[currentTab_PriceTrend.value];
        stock.value.priceTrend.xAxisData = xAxisData;
        stock.value.priceTrend.seriesData = seriesData;
        return;
      }

      const response = await axios.get(
        `/api/historicalPrice/${props.ticker}?window=${currentTab_PriceTrend.value}`
      );
      const priceTrend = response.data.result;
      console.log("priceTrend", priceTrend);

      stock.value.priceTrend = priceTrend;

      const xAxisData = stock.value.priceTrend.map((item) => item.date);
      const seriesData = stock.value.priceTrend.map((item) => item.close);

      stock.value.priceTrend.xAxisData = xAxisData;
      stock.value.priceTrend.seriesData = seriesData;

      cachePrice({ xAxisData, seriesData });
    }

    function checkCache() {}
    function cachePrice(obj) {
      cachedPrice[currentTab_PriceTrend.value] = obj;
    }

    watch(currentTab_PriceTrend, (newVal) => {
      console.log("newVal", newVal);

      getPriceData();
    });

    const detailsRefs = ref({});

    const toggleDetails = (key) => {
      const detailsRef = detailsRefs.value[key];
      detailsRef.open = !detailsRef.open;
    };

    onBeforeUpdate(() => (detailsRefs.value = {}));

    return {
      stock,
      paragraph,
      paragraphHeight,
      isParagraphShow,
      isToggleShow,
      toggleSummary,
      isSkeletonLoading,

      epsQuarterlyDate,
      epsQuarterly,
      seriesData,

      tabs_Earnings,
      currentTab_Earnings,
      barData,

      financialIndicators,
      financialStatement,

      detailsRefs,
      toggleDetails,

      tabs_PriceTrend,
      currentTab_PriceTrend,
    };
  },
};
</script>

<style scoped>
summary::-webkit-details-marker {
  display: none;
}
</style>