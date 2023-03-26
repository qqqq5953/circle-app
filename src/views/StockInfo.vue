<template>
  <main>
    <StockInfoSkeleton v-if="isSkeletonLoading" />
    <div class="flex flex-col gap-2" v-if="!isSkeletonLoading">
      <header>
        <h2 class="text-xl md:text-2xl pb-2 md:pb-3 max-w-fit">
          <span>{{ stock.price?.name }} </span>
          <span class="ml-1.5">({{ stock.price?.ticker }})</span>
        </h2>
        <div
          class="flex flex-col md:flex-row md:items-center gap-1.5 md:gap-5 border-t py-2 md:pt-4"
        >
          <span class="text-3xl">${{ stock.price?.previousClose }}</span>
          <div
            class="flex items-center gap-2 text-sm font-medium py-0.5 md:py-0"
            :class="
              stock.price?.previousCloseChange > 0
                ? 'text-red-600'
                : 'text-green-600'
            "
          >
            <span
              class="px-2 py-1 rounded"
              :class="
                stock.price.previousCloseChangePercent > 0
                  ? 'bg-red-100'
                  : 'bg-green-100'
              "
              ><i
                class="fas fa-arrow-up"
                v-if="stock.price.previousCloseChangePercent > 0"
              ></i>
              <i class="fas fa-arrow-down" v-else></i>
              <span class="ml-1.5">{{ previousCloseChangePercent }}%</span>
            </span>
            <span>{{ stock.price?.previousCloseChange }}</span>
            <span>Today</span>
          </div>
        </div>
        <div
          class="flex flex-col gap-1 text-xs break-all text-slate-500 font-light"
        >
          <span>
            <span class="font-medium">{{ marketState }}: </span>
            <span>{{ regularMarketTime }}</span>
          </span>
          <span>
            <span class="font-medium">CURRENT TIME: </span>
            <span>{{ currentTime }}</span>
          </span>
        </div>
      </header>

      <!-- class binding 的 xl: mt / mb 為調整用 -->
      <div class="grid gap-4 lg:gap-4 lg:grid-cols-3">
        <PriceTrend
          class="pb-5 lg:col-start-1 lg:col-end-4 xl:col-end-3"
          :ticker="ticker"
          @switchTab="(tab) => (currentTab = tab)"
        />
        <SummaryDetail
          class="lg:col-start-3 lg:row-start-2 lg:row-end-3 xl:row-start-1"
          :class="{ 'xl:mb-[39.5px]': isSummaryShow }"
          :stock="stock"
        />
        <div
          class="border rounded p-3 flex flex-col gap-8 lg:col-start-1 lg:col-end-3 lg:row-start-2 xl:row-start-2 xl:row-end-4"
          v-if="stock.financialData?.earnings"
        >
          <div class="max-w-[99%]">
            <RevenueAndEarnings
              class="border-b pb-5"
              :earnings="stock.financialData?.earnings"
            />
            <EarningsPerShare
              class="pt-3"
              :financialData="stock.financialData"
            />
          </div>
        </div>
        <FinancialData
          class="lg:col-start-1 lg:col-end-3 lg:row-start-3 lg:row-end-5 xl:row-start-4"
          :financialData="stock.financialData"
        />
        <SummaryProfile
          class="lg:col-start-3 lg:row-start-3 lg:row-end-4"
          :class="[
            isSummaryShow
              ? 'lg:row-end-6 xl:row-end-6 xl:-mt-[39.5px] 2xl:row-end-5'
              : '',
          ]"
          :stock="stock"
          @toggleProfileSummary="(val) => (isSummaryShow = val)"
          ref="summaryProfileRef"
        />
      </div>
    </div>
  </main>
</template>

<script>
import { ref, nextTick, computed } from "vue";
import http from "../api/index";

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
    ticker: String,
  },
  setup(props) {
    const summaryProfileRef = ref(null);
    const isSummaryShow = ref(false);
    const isSkeletonLoading = ref(true);
    const stock = ref({});
    const currentTab = ref("5D");

    const toggleSkeleton = (isLoading) => (isSkeletonLoading.value = isLoading);

    const regularMarketTime = computed(() => {
      if (!stock.value.price) return;

      const dateObj = new Date(stock.value.price.regularMarketTime);
      const year = dateObj.getFullYear();
      const month = dateObj.getMonth() + 1;
      const date = dateObj.getDate();
      const time = dateObj.toString().split(year)[1];

      return `${year}/${month}/${date} ${time}`;
    });

    const marketState = computed(() => {
      if (!stock.value.price) return;

      return stock.value.price?.marketState !== "POSTPOST"
        ? stock.value.price?.marketState
        : "POST";
    });

    const currentTime = computed(() => {
      const dateObj = new Date(Date.now());
      const year = dateObj.getFullYear();
      const month = dateObj.getMonth() + 1;
      const date = dateObj.getDate();
      const hour = dateObj.getHours();
      const minute = dateObj.getMinutes();
      const second = dateObj.getSeconds();

      return `${year}/${month}/${date} ${hour}:${minute}:${second}`;
    });

    const previousCloseChangePercent = computed(() => {
      if (!stock.value.price) return;
      const close = parseFloat(stock.value.price.previousCloseChangePercent);
      return close > 0 ? close : close * -1;
    });

    (async function getTickerInfo() {
      const quotePromiseObj = http.get(`/api/quote/${props.ticker}`);
      const summaryPromiseObj = http.get(`/api/tickerSummary/${props.ticker}`);

      try {
        const promiseResponse = await Promise.allSettled([
          quotePromiseObj,
          summaryPromiseObj,
        ]);
        const quote = promiseResponse[0].value?.data.result;
        const summary = promiseResponse[1].value?.data.result;

        if (!quote || !summary) {
          toggleSkeleton(false);
          return;
        }

        const { profile, detail, price } = summary;
        console.log("quote", quote);
        console.log("summary", summary);

        stock.value = {
          profile,
          detail,
          price: {
            ...price,
            ...quote,
            previousClose: quote.price.toFixed(2),
          },
        };

        if (price.quoteType === "Equity") {
          stock.value.financialData = await getFinancialData();
          console.log("financialData", stock.value.financialData);
        }

        toggleSkeleton(false);

        await nextTick();
        summaryProfileRef.value?.adjustSummaryHeight();
      } catch (error) {
        console.log("error", error);
      }
    })();

    async function getFinancialData() {
      const response = await http.get(`/api/financialData/${props.ticker}`);
      const financialData = response?.data.result;
      return financialData;
    }

    return {
      stock,
      isSkeletonLoading,
      summaryProfileRef,
      currentTab,
      isSummaryShow,
      regularMarketTime,
      marketState,
      currentTime,
      previousCloseChangePercent,
    };
  },
};
</script>