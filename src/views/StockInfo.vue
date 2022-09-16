<template>
  <div>
    <!-- v-if="isSkeletonLoading"
    -->
    <StockInfoSkeleton v-if="isSkeletonLoading" />
    <div
      class="flex flex-col gap-6 px-4 md:p-10 mx-auto w-full"
      v-if="!isSkeletonLoading"
    >
      <header>
        <h2 class="text-xl md:text-2xl pb-2 md:pb-3 max-w-fit">
          <span>{{ stock.price?.name }} </span>
          <span class="ml-1.5">({{ ticker }})</span>
        </h2>
        <div
          class="
            flex flex-col
            md:flex-row md:items-center
            gap-1.5
            md:gap-5
            border-t
            pt-2
            md:pt-4
          "
        >
          <span class="text-3xl">${{ stock.price?.previousClose }}</span>
          <div
            class="flex items-center gap-3 text-sm font-medium"
            :class="
              stock.price?.previousCloseChange > 0
                ? 'text-red-600'
                : 'text-green-600'
            "
          >
            <span
              class="px-2 py-1 rounded"
              :class="
                stock.price?.previousCloseChangePercent > 0
                  ? 'bg-red-100'
                  : 'bg-green-100'
              "
              ><i
                class="fas fa-arrow-up"
                v-if="stock.price?.previousCloseChangePercent > 0"
              ></i>
              <i class="fas fa-arrow-down" v-else></i>
              {{ stock.price?.previousCloseChangePercent }}%</span
            >
            <span>{{ stock.price?.previousCloseChange }}</span>
          </div>
        </div>
        <div
          class="
            flex flex-col
            gap-1
            text-xs
            break-all
            text-slate-500
            font-light
            mt-1
            md:mt-2
          "
        >
          <span>
            <span class="font-medium">{{ stock.price?.marketState }}: </span>
            <span>{{ regularMarketTime }}</span></span
          >
          <span>
            <span class="font-medium">CURRENT TIME: </span>
            <span>{{ currentTime }}</span>
          </span>
        </div>
      </header>

      <!-- class binding 的 xl: mt / mb 為調整用 -->
      <main class="grid gap-4 lg:gap-4 lg:grid-cols-3">
        <PriceTrend
          class="pb-5 lg:col-start-1 lg:col-end-4 xl:col-end-3"
          :priceTrend="stock.priceTrend"
          :closeChange="closeChange"
          :closeChangePercent="closeChangePercent"
          @switchTab="(tab) => (currentTab = tab)"
        />
        <SummaryDetail
          class="lg:col-start-3 lg:row-start-2 lg:row-end-3 xl:row-start-1"
          :class="{ 'xl:mb-12': isSummaryShow }"
          :stock="stock"
        />
        <div
          class="
            border
            rounded
            p-3
            flex flex-col
            gap-8
            lg:col-start-1 lg:col-end-3 lg:row-start-2
            xl:row-start-2 xl:row-end-4
          "
        >
          <div class="max-w-[99%]">
            <RevenueAndEarnings
              class="border-b pb-5"
              :earnings="stock.financialData?.earnings"
              v-if="stock.financialData?.earnings"
            />
            <EarningsPerShare
              class="pt-3"
              :financialData="stock.financialData"
              v-if="stock.financialData?.earnings"
            />
          </div>
        </div>
        <FinancialData
          class="
            lg:col-start-1 lg:col-end-3 lg:row-start-3 lg:row-end-5
            xl:row-start-4
          "
          :class="{
            'xl:mt-[9px]': isSummaryShow,
          }"
          :financialData="stock.financialData"
        />
        <SummaryProfile
          class="lg:col-start-3 lg:row-start-3 lg:row-end-4"
          :class="[
            isSummaryShow
              ? 'lg:row-end-6 xl:row-end-6 xl:-mt-12 2xl:row-end-5'
              : '',
          ]"
          :stock="stock"
          @toggleProfileSummary="(val) => (isSummaryShow = val)"
          ref="summaryProfileRef"
        />
      </main>
    </div>
  </div>
</template>

<script>
import { ref, nextTick, computed } from "vue";
import axios from "axios";

import useAxios from "@/composables/useAxios.js";
import useStockInfoStore from "@/stores/watchlistStore.js";
import StockInfoSkeleton from "@/components/skeleton/StockInfoSkeleton.vue";
import PriceTrend from "@/components/StockInfo/PriceTrend.vue";
import RevenueAndEarnings from "@/components/StockInfo/FinancialStatement/RevenueAndEarnings.vue";
import EarningsPerShare from "@/components/StockInfo/FinancialStatement/EarningsPerShare.vue";
import FinancialData from "@/components/StockInfo/FinancialStatement/FinancialData.vue";
import SummaryDetail from "@/components/StockInfo/SummaryDetail.vue";
import SummaryProfile from "@/components/StockInfo/SummaryProfile.vue";
export default {
  components: {
    StockInfoSkeleton,
    PriceTrend,
    EarningsPerShare,
    RevenueAndEarnings,
    FinancialData,
    SummaryDetail,
    SummaryProfile,
  },
  props: {
    ticker: {
      type: String,
    },
  },
  setup(props) {
    const $store = useStockInfoStore();
    const summaryProfileRef = ref(null);
    const isSummaryShow = ref(false);
    const isSkeletonLoading = ref(true);
    const stock = ref({});
    const currentTab = ref("5D");

    const toggleSkeleton = (isLoading) => (isSkeletonLoading.value = isLoading);

    const regularMarketTime = computed(() => {
      if (!stock.value.price) return;

      const year = new Date(stock.value.price.regularMarketTime).getFullYear();
      const month =
        new Date(stock.value.price.regularMarketTime).getMonth() + 1;
      const date = new Date(stock.value.price.regularMarketTime).getDate();
      const time = new Date(stock.value.price.regularMarketTime)
        .toString()
        .split("2022")[1];

      return `${year}/${month}/${date} ${time}`;
    });

    const currentTime = computed(() => {
      const year = new Date(Date.now()).getFullYear();
      const month = new Date(Date.now()).getMonth() + 1;
      const date = new Date(Date.now()).getDate();
      const hour = new Date(Date.now()).getHours();
      const minute = new Date(Date.now()).getMinutes();
      const second = new Date(Date.now()).getSeconds();

      return `${year}/${month}/${date} ${hour}:${minute}:${second}`;
    });

    const closeChange = computed(() => {
      if (!stock.value.priceTrend) return;

      switch (currentTab.value) {
        case "5D":
          return calculateCloseChange("5D");
        case "1M":
          return calculateCloseChange("1M");
        case "6M":
          return calculateCloseChange("6M");
        case "YTD":
          return calculateCloseChange("YTD");
        case "1Y":
          return calculateCloseChange("1Y");
        case "5Y":
          return calculateCloseChange("5Y");
      }
    });

    const closeChangePercent = computed(() => {
      if (!stock.value.priceTrend) return;

      switch (currentTab.value) {
        case "5D":
          return calculateCloseChangePercent("5D");
        case "1M":
          return calculateCloseChangePercent("1M");
        case "6M":
          return calculateCloseChangePercent("6M");
        case "YTD":
          return calculateCloseChangePercent("YTD");
        case "1Y":
          return calculateCloseChangePercent("1Y");
        case "5Y":
          return calculateCloseChangePercent("5Y");
      }
    });

    function calculateCloseChange(timeSpan) {
      const priceTrend = stock.value.priceTrend;
      const firstClosingPrice = priceTrend[timeSpan].seriesData[0];
      const lastClosingPrice = priceTrend[timeSpan].seriesData.slice(-1)[0];
      return (lastClosingPrice - firstClosingPrice).toFixed(2);
    }

    function calculateCloseChangePercent(timeSpan) {
      const priceTrend = stock.value.priceTrend;

      const firstClosingPrice = priceTrend[timeSpan].seriesData[0];
      const lastClosingPrice = priceTrend[timeSpan].seriesData.slice(-1)[0];
      return (
        ((lastClosingPrice - firstClosingPrice) * 100) /
        firstClosingPrice
      ).toFixed(2);
    }

    (async function getTickerInfo() {
      const quotePromiseObj = axios.get(`/api/quote/${props.ticker}`);
      const summaryPromiseObj = axios.get(`/api/tickerSummary/${props.ticker}`);
      const priceTrendPromiseObj = axios.get(
        `/api/historicalPrice/${props.ticker}/?timespan=1Y`
      );

      try {
        const promiseResponse = await Promise.allSettled([
          quotePromiseObj,
          summaryPromiseObj,
          priceTrendPromiseObj,
        ]);

        const quote = promiseResponse[0].value.data.result;
        const summary = promiseResponse[1].value.data.result;
        const priceTrend_1Y = promiseResponse[2].value.data.result;
        const { profile, detail, price } = summary;

        stock.value = {
          profile,
          detail,
          priceTrend: getTimespanPrice(priceTrend_1Y, "1Y"),
          price: {
            ...price,
            ...quote,
            previousClose: quote.price.toFixed(2),
          },
        };

        if (price.quoteType === "Equity") {
          stock.value.financialData = await getFinancialData();
        }

        toggleSkeleton(false);

        await nextTick();
        summaryProfileRef.value.adjustProfileSummaryDisplay();

        const axiosResponse = await axios.get(
          `/api/historicalPrice/${props.ticker}/?timespan=5Y`
        );
        const priceTrend_5Y = axiosResponse.data.result;

        stock.value.priceTrend["5Y"] = getTimespanPrice(priceTrend_5Y, "5Y");

        console.log("stock", stock.value);
      } catch (error) {
        console.log("error", error);
      }
    })();

    async function getFinancialData() {
      const response = await axios.get(`/api/financialData/${props.ticker}`);
      const financialData = response.data.result;
      return financialData;
    }

    function getTimespanPrice(priceTrend, maxTimespan = "1Y") {
      console.log("maxTimespan", maxTimespan);

      const year = new Date().getFullYear();
      const month = new Date().getMonth() + 1;
      const date = new Date().getDate();

      const startDateObj = {
        _1M: `${year}/${month - 1}/${date}`,
        _6M: `${year}/${month - 6}/${date}`,
        _YTD: `${year - 1}/12/31`,
        _1Y: `${year - 1}/${month}/${date}`,
        _5Y: `${year - 5}/${month}/${date}`,
      };

      const totalTimespan = ["5D", "1M", "6M", "YTD", "1Y", "5Y"];

      switch (maxTimespan) {
        case "1Y":
          return totalTimespan.slice(0, 5).reduce((obj, timespan) => {
            let data = null;

            if (timespan === "5D") {
              data = [...priceTrend].slice(0, 5).reverse();
              obj[timespan] = mappingPriceData(data);
              return obj;
            }

            const startDate = startDateObj[`_${timespan}`];
            const startIndex = getStartDateIndex(priceTrend, startDate);

            data = [...priceTrend].slice(0, startIndex).reverse();
            obj[timespan] = mappingPriceData(data);

            return obj;
          }, {});
        case "5Y":
          let data = null;
          const startDate = startDateObj[`_${maxTimespan}`];
          const startDate_TotalTimeSpan = priceTrend.slice(-1)[0].date;

          if (startDate_TotalTimeSpan === startDate) {
            console.log("test 有五年");
            const startIndex = getStartDateIndex(priceTrend, startDate);
            data = [...priceTrend].slice(0, startIndex).reverse();
          } else {
            console.log("test 沒有五年");
            data = [...priceTrend].reverse();
          }

          return mappingPriceData(data);
      }
    }

    function getStartDateIndex(priceTrend, fullDate) {
      console.log("fullDate", fullDate);
      const [startYear, startMonth, startDate] = fullDate.split("/");
      let date = startDate;
      let month = startMonth;
      let year = startYear;
      let startIndex = -1;

      while (startIndex === -1) {
        const startDate = `^${year}/${month}/${date}$`;
        const regex = new RegExp(startDate, "i");

        startIndex = priceTrend.findIndex(
          (element) => element.date === element.date.match(regex)?.[0]
        );

        if (date <= 1) {
          date = 31;
          if (month <= 1) {
            month = 12;
            year--;
          } else {
            month--;
          }
        } else {
          date--;
        }
      }

      return startIndex;
    }

    function mappingPriceData(timeSpan) {
      const xAxisData = timeSpan.map((item) => item.date);
      const seriesData = timeSpan.map((item) => item.close);

      return { xAxisData, seriesData };
    }

    return {
      stock,
      isSkeletonLoading,
      summaryProfileRef,
      closeChange,
      closeChangePercent,
      currentTab,
      isSummaryShow,
      regularMarketTime,
      currentTime,
    };
  },
};
</script>