<template>
  <main
    class="flex flex-col space-y-10 px-4 md:p-10 mx-auto w-full max-w-[1200px]"
  >
    <!-- snackbar -->
    <Teleport to="body">
      <Snackbar :barMessage="notificationMessage">
        <template #btn="{ tradeResult }">
          <router-link
            :to="{
              name: 'TradeResult',
              params: {
                tradeResult: JSON.stringify(tradeResult),
              },
            }"
            class="
              px-2
              py-1.5
              rounded
              text-xs
              bg-gray-100
              text-indigo-700
              hover:bg-white
            "
            >View</router-link
          >
        </template>
      </Snackbar>
    </Teleport>

    <!-- trade modal -->
    <Teleport to="body">
      <InputModal
        :isFullPage="true"
        :isOpen="isModalOpen"
        :closeFunc="toggleModal"
        :confirmFunc="addStock"
        :isDisabled="!isAllValid"
      >
        <template #title>Trade Panel</template>
        <template #inputs>
          <TradePanel
            ref="newAddingRef"
            :tickerToBeTraded="tickerToBeTraded"
            :isBuyMore="isBuyMore"
            v-show="!loading"
          />
        </template>
        <template #okButton>Trade</template>
      </InputModal>
    </Teleport>

    <!-- totalStats -->
    <section class="px-4 md:px-0 lg:px-4 text-xs" v-if="holdings">
      <!-- skeleton -->
      <div class="flex items-center" v-if="loading">
        <div class="w-40 h-6 bg-gray-300 rounded"></div>
        <div class="w-[83px] h-6 bg-gray-300 rounded-full ml-auto"></div>
      </div>

      <!-- title -->
      <div class="flex items-center" v-if="!loading && totalStats">
        <h2 class="font-semibold text-lg inline">Total stats</h2>
        <p class="ml-1 pt-1 tracking-wider">(TWD)</p>
      </div>

      <!-- skeleton -->
      <div class="animate-pulse" v-if="!totalStats || !fxRates">
        <div class="text-right pt-1.5" v-if="fxRatesUsedTwoDecimals">
          <span class="w-28 h-3 bg-gray-300 rounded-full inline-block"></span>
        </div>
        <ul class="flex flex-wrap -m-1 md:-m-2 pt-1.5">
          <li class="w-1/2 p-1 sm:w-1/4 md:p-2" v-for="i in 4" :key="i">
            <div
              class="
                flex flex-col
                items-center
                justify-center
                gap-y-2
                bg-slate-100
                h-12
                w-full
                rounded
                shadow
              "
            >
              <div class="bg-gray-300 rounded-full w-2/3 h-3"></div>
              <div class="bg-gray-300 rounded-full w-2/3 h-3"></div>
            </div>
          </li>
        </ul>
      </div>

      <!-- stats -->
      <div v-if="totalStats && !loading">
        <TotalStats
          :fxRatesUsedTwoDecimals="fxRatesUsedTwoDecimals"
          :totalStats="totalStats"
        />
      </div>
    </section>

    <!-- Top 3 Performance -->
    <section class="px-4 md:px-0 lg:px-4">
      <div class="flex items-center mb-4">
        <div class="w-40 h-6 bg-gray-300 rounded" v-if="loading"></div>
        <h2
          class="font-semibold text-lg"
          v-if="!loading && topThreePerformance.length"
        >
          Top 3 Performance
        </h2>
      </div>
      <div class="sm:flex gap-3">
        <CardSkeleton v-if="loading" />
        <div
          class="sm:w-1/3"
          v-for="item in topThreePerformance"
          :key="item.latestInfo.ticker"
          v-else
        >
          <Card>
            <template #card-title>
              <h3 class="flex gap-x-3 items-center mb-2">
                <span class="ticker-badge" :class="item.latestInfo.style">
                  {{ item.latestInfo.ticker }}
                </span>
                <span class="font-bold text-xs truncate w-3/5 sm:w-auto">{{
                  item.latestInfo.name
                }}</span>
              </h3>
            </template>
            <template #card-sub-title>
              <div class="flex items-center gap-x-3">
                <p
                  class="font-medium px-2 py-1 lg:px-3 lg:py-2 rounded text-xs"
                  :class="
                    item.totalStats.profitOrLossPercentage > 0
                      ? 'text-red-600 bg-red-100/70'
                      : item.totalStats.profitOrLossPercentage < 0
                      ? 'text-green-700 bg-green-100'
                      : 'text-slate-500 bg-slate-200'
                  "
                >
                  <span v-if="item.totalStats.profitOrLossPercentage !== 0">
                    <i
                      class="fas fa-arrow-up mr-px text-red-600"
                      v-if="item.totalStats.profitOrLossPercentage > 0"
                    ></i>
                    <i
                      class="fas fa-arrow-down mr-px text-green-700"
                      v-else-if="item.totalStats.profitOrLossPercentage < 0"
                    ></i>
                  </span>
                  <span v-else>--</span>
                  {{
                    item.totalStats.profitOrLossPercentage < 0
                      ? item.totalStats.profitOrLossPercentage * -1
                      : item.totalStats.profitOrLossPercentage
                  }}
                  %
                </p>
                <p
                  class="text-xs font-medium"
                  :class="
                    item.totalStats.profitOrLossValue > 0
                      ? 'text-red-600'
                      : item.totalStats.profitOrLossValue < 0
                      ? 'text-green-700'
                      : 'text-slate-500'
                  "
                >
                  <span v-if="item.totalStats.profitOrLossValue >= 0">
                    <span>+$</span>
                    <span>{{ item.totalStats.profitOrLossValue }}</span>
                  </span>
                  <span v-else>
                    <span>-$</span>
                    <span>{{ item.totalStats.profitOrLossValue * -1 }}</span>
                  </span>
                </p>
                <router-link
                  class="hover:text-indigo-500 text-indigo-600 ml-auto block"
                  :to="{
                    name: 'TradeDetails',
                    params: {
                      holdings: JSON.stringify(item),
                    },
                  }"
                >
                  <span class="text-xs flex items-center gap-x-1">
                    <span class="sm:hidden">details</span>
                    <i class="fa-solid fa-chevron-right"></i
                  ></span>
                </router-link>
              </div>
            </template>
          </Card>
        </div>
      </div>
    </section>

    <!-- Holdings -->
    <section class="px-4 md:px-0 lg:px-4">
      <!-- skeleton -->
      <div class="flex items-center" v-if="loading">
        <div class="w-40 h-6 bg-gray-300 rounded"></div>
        <div class="w-[83px] h-6 bg-gray-300 rounded-full ml-auto"></div>
      </div>

      <div
        class="flex items-center justify-between mb-4"
        v-if="!loading && holdings"
      >
        <h2 class="font-semibold text-lg">Holdings</h2>
        <button
          class="
            border border-indigo-600
            text-indigo-600
            hover:bg-indigo-600 hover:text-white
            rounded-full
            font-semibold
            py-1
            text-xs
            w-[83px]
          "
          @click="toggleModal({ open: true, type: 'invest' })"
          v-if="holdings"
        >
          <span>+</span>
          <span class="mx-1">Invest</span>
        </button>
      </div>

      <TableSkeleton v-if="loading" />
      <NewTable1
        v-if="!loading && holdings"
        :holdings="holdings"
        @toggleModal="toggleModal"
      />

      <div class="pt-[40%] md:pt-[20%] text-center" v-if="!holdings">
        <button
          class="
            bg-indigo-700
            text-white
            hover:bg-indigo-600
            rounded-full
            px-3
            py-1.5
            text-xs
          "
          @click="toggleModal({ open: true, type: 'invest' })"
        >
          <span>+</span>
          <span class="mx-1">Make your first investment</span>
        </button>
      </div>
    </section>
  </main>
</template>

<script>
import NewTable1 from "@/components/NewTable1.vue";
import Card from "@/components/Card.vue";
import CardSkeleton from "@/components/skeleton/CardSkeleton.vue";
import TableSkeleton from "@/components/skeleton/TableSkeleton.vue";
import InputSkeleton from "@/components/skeleton/InputSkeleton.vue";
import TradePanel from "@/components/TradePanel.vue";
import TotalStats from "@/components/Holdings/TotalStats.vue";

import { ref, defineAsyncComponent, computed, onMounted, nextTick } from "vue";
import useHoldingStore from "@/stores/holdingStore.js";
import useSearchStore from "@/stores/searchStore.js";
import { storeToRefs } from "pinia";
import http from "../api/index";

import formatNumber from "@/modules/formatNumber.js";

export default {
  components: {
    TotalStats,
    TradePanel,
    NewTable1,
    Card,
    CardSkeleton,
    TableSkeleton,
    InputSkeleton,
    Snackbar: defineAsyncComponent(() => import("@/components/Snackbar.vue")),
    InputModal: defineAsyncComponent(() =>
      import("@/components/InputModal.vue")
    ),
  },
  setup() {
    const $searchStore = useSearchStore();
    const { searchList } = storeToRefs($searchStore);
    const $holdingStore = useHoldingStore();
    const { notificationMessage, data, error, loading, stock, inputValidity } =
      storeToRefs($holdingStore);
    const { toggleSkeleton, activateNotification } = $holdingStore;

    // 跨頁面時重置 searchList
    onMounted(() => (searchList.value = null));

    // totalStats
    const codeToCurrencyMap = ref({
      tw: "TWD",
      us: "USDTWD",
      mf: "USDTWD",
      uk: "GBPTWD",
      hk: "HKDTWD",
      ks: "KRWTWD",
    });
    const fxRates = ref(null);
    const totalCodesInHoldings = ref([]);
    const fxRatesUsedTwoDecimals = computed(() => {
      if (!fxRates.value) return {};

      const { tw, ...restCode } = fxRates.value;
      const obj = {};

      for (let i = 0; i < totalCodesInHoldings.value.length; i++) {
        const code = totalCodesInHoldings.value[i];
        const currency = codeToCurrencyMap.value[code];
        const rate = +(+restCode[code]).toFixed(2);
        obj[currency] = rate;
      }

      return obj;
    });
    const totalStats = computed(() => {
      if (!data.value?.result || !fxRates.value) return {};
      totalCodesInHoldings.value.length = 0;
      const stats = getTotalStats();
      return stats;
    });

    function getTotalStats() {
      // 計算總成本、總市值
      const stats = Object.values(data.value.result).reduce(
        (obj, item) => {
          const { latestInfo, totalStats } = item;
          const { totalValue, totalCost } = totalStats;
          const { code } = latestInfo;
          const exchangeRate = fxRates.value[code];

          if (code !== "tw" && !totalCodesInHoldings.value.includes(code)) {
            totalCodesInHoldings.value.push(code);
          }

          obj["Total value"] += totalValue * parseFloat(exchangeRate);
          obj["Total cost"] += totalCost * parseFloat(exchangeRate);

          return obj;
        },
        { "Total cost": 0, "Total value": 0 }
      );

      // 計算總損益、總報酬率
      const totalValue = stats["Total value"];
      const totalCost = stats["Total cost"];
      stats["Total value"] = formatNumber({ number: totalValue });
      stats["Total cost"] = formatNumber({ number: totalCost });
      stats["P / L"] = formatNumber({
        number: totalValue - totalCost,
      });
      stats["P / L %"] = formatNumber({
        number: ((totalValue - totalCost) * 100) / totalCost,
      });

      return stats;
    }

    async function getExchangeRate(e) {
      const res = await http.get(`/api/fxRates`);
      fxRates.value = res.data.result;
    }

    getExchangeRate();

    // holdings
    const holdings = computed(() => {
      if (!data.value) return;
      return data.value?.result;
    });

    // addStock
    const isAllValid = computed(() => {
      return Object.values(inputValidity.value).every((item) => !!item);
    });

    async function addStock() {
      if (!isAllValid.value) return;

      toggleModal({ open: false, type: "invest" });
      toggleSkeleton(true);

      try {
        const stockObj = {
          ...stock.value,
          ticker: stock.value.ticker,
          tempTicker: stock.value.tempTicker?.toUpperCase(),
          recordUnix: Date.now(),
        };

        console.log("stockObj", stockObj);

        const res = await http.post(`/api/addStock`, stockObj);

        await updateHoldings(res.data);
      } catch (error) {
        console.log("addStock error", error);
        toggleSkeleton(false);
      }
    }

    async function updateHoldings(newData) {
      console.log("updateHoldings newData", newData);
      const { ticker, cost, shares, tradeDate, recordUnix } = newData.result;
      const addDate = new Date(recordUnix);
      const result = {
        Ticker: ticker,
        Cost: cost,
        Shares: shares,
        "Trade date": tradeDate,
        "Record time": addDate.toLocaleString("zh-TW").replace(/\//g, "-"),
      };

      if (newData.success) {
        try {
          const res = await http.get(`/api/holdings`);
          data.value = res.data;
        } catch (error) {
          console.log("updateHoldings error", error);
        }
      }

      toggleSkeleton(false);
      activateNotification({ ...newData, result });
    }

    // toggleModal
    const tickerToBeTraded = ref(null);
    const newAddingRef = ref(null);
    const isBuyMore = ref(null);
    const isModalOpen = ref(false);

    async function toggleModal(parmas) {
      const { open, type, ...tickerInfo } = parmas;
      const style = open ? "overflow:hidden" : null;
      disableVerticalScrollbar(style);
      isModalOpen.value = open;

      if (!open) {
        //  disable 日期欄位
        const { inputDateRef } = newAddingRef.value.$refs;
        inputDateRef.dateRef.disabled = true;

        // 等關閉後再清空，否則 api 會傳失敗
        await nextTick();
        resetInput();
        return;
      }

      if (type === "buy") {
        isBuyMore.value = true;
        tickerToBeTraded.value = tickerInfo;
      }
      if (type === "invest") {
        isBuyMore.value = false;
      }
    }

    function resetInput() {
      // 清空 cost 及 date(直接修改 inputValue 可同時修改驗證)
      Object.keys(newAddingRef.value.$refs).forEach((inputRef) => {
        newAddingRef.value.$refs[inputRef].inputValue =
          inputRef === "inputSharesRef" ? "1" : null;
      });

      // 清空已選的 ticker
      stock.value.ticker = null;
      inputValidity.value.ticker = false;

      // reset 要帶入 buy modal 的 tickerToBeTraded
      tickerToBeTraded.value = null;
    }

    function disableVerticalScrollbar(style) {
      document.querySelector("body").style = style;
    }

    // Card
    const topThreePerformance = computed(() => {
      return calculatePerformance(data.value?.result);
    });

    function calculatePerformance(holdings) {
      // return;
      if (!holdings) return [];

      return (
        Object.values(holdings)
          // .map((item) => {
          //   const { latestInfo, totalStats } = item;
          //   return {
          //     ticker: latestInfo.ticker,
          //     tempTicker: latestInfo.tempTicker,
          //     name: latestInfo.name,
          //     style: latestInfo.style,
          //     profitOrLossPercentage: totalStats.profitOrLossPercentage,
          //     profitOrLossValue: totalStats.profitOrLossValue,
          //   };
          // })
          .sort((a, b) => {
            return (
              b.totalStats.profitOrLossPercentage -
              a.totalStats.profitOrLossPercentage
            );
          })
          .slice(0, 3)
      );
    }

    return {
      topThreePerformance,
      data,
      loading,
      error,
      notificationMessage,

      isModalOpen,
      tickerToBeTraded,

      toggleModal,
      addStock,
      isAllValid,
      isBuyMore,
      newAddingRef,

      holdings,
      totalStats,
      fxRates,
      fxRatesUsedTwoDecimals,
      totalCodesInHoldings,
      getExchangeRate,
    };
  },
};
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.5s ease-in-out;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-to,
.modal-leave-from {
  opacity: 1;
}
</style>