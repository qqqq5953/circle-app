<template>
  <main>
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
            :inputValidity="inputValidity"
            @setInputValidity="setInputValidity"
            v-show="!loading"
          />
        </template>
        <template #okButton>Trade</template>
      </InputModal>
    </Teleport>

    <HoldingSkeleton v-if="loading" />

    <!-- totalStats -->
    <section v-if="!loading && holdings">
      <!-- title -->
      <div class="flex items-center">
        <h2 class="font-semibold text-lg inline">Total stats</h2>
        <p class="ml-1 pt-1 tracking-wider text-xs">(TWD)</p>
      </div>

      <!-- stats -->
      <div>
        <TotalStats
          :fxRates="fxRates"
          :totalStats="totalStats"
          :latestInfo="latestInfo"
        />
      </div>
    </section>

    <!-- Holdings -->
    <section v-if="!loading">
      <div class="flex items-center justify-between mb-4" v-if="holdings">
        <h2 class="font-semibold text-lg">Holdings</h2>
        <button
          class="border border-indigo-600 text-indigo-600 hover:bg-indigo-600 hover:text-white rounded-full font-bold py-1 text-xs w-[83px]"
          @click="toggleModal({ open: true, type: 'invest' })"
          v-if="holdings"
        >
          <span>+</span>
          <span class="mx-1">Invest</span>
        </button>
      </div>

      <HoldingsTable
        v-if="holdings"
        :holdings="holdings"
        @toggleModal="toggleModal"
      />

      <div class="py-[20%] text-center" v-if="!holdings">
        <button
          class="bg-indigo-700 text-white hover:bg-indigo-600 rounded-full px-3 py-1.5 text-xs"
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
import HoldingsTable from "@/components/HoldingsTable.vue";
import HoldingSkeleton from "@/components/skeleton/HoldingSkeleton.vue";
import TradePanel from "@/components/TradePanel.vue";
import TotalStats from "@/components/Holdings/TotalStats.vue";

import {
  ref,
  defineAsyncComponent,
  computed,
  onMounted,
  nextTick,
  inject,
} from "vue";
import useHoldingStore from "@/stores/holdingStore.js";
import useSearchStore from "@/stores/searchStore.js";
import { storeToRefs } from "pinia";
import http from "../api/index";

export default {
  components: {
    TotalStats,
    TradePanel,
    HoldingsTable,
    HoldingSkeleton,
    InputModal: defineAsyncComponent(() =>
      import("@/components/InputModal.vue")
    ),
  },
  setup() {
    const $searchStore = useSearchStore();
    const { searchList } = storeToRefs($searchStore);
    const $holdingStore = useHoldingStore();
    const { stock } = storeToRefs($holdingStore);
    const setSnackbarMessage = inject("setSnackbarMessage");

    // 跨頁面時重置 searchList
    onMounted(async () => {
      searchList.value = null;
    });

    // call api
    const loading = ref(false);
    const error = ref(null);
    const holdings = ref(null);
    const fxRates = ref({});
    const totalStats = ref({});
    const latestInfo = ref({});

    (async () => {
      toggleSkeleton(true);

      try {
        const updateRes = await http.get("/api/checkUpdateInfoAndStats");
        const { holdingLatestInfo } = updateRes.data.result;

        const result = await Promise.allSettled([
          http.get("/api/holdings"),
          http.get("/api/fxRates"),
          http.get("/api/totalStats"),
        ]);

        const [holdingsObj, fxRatesObj, stats] = result.map(
          (item) => item.value.data.result
        );

        holdings.value = holdingsObj;
        fxRates.value = fxRatesObj;
        totalStats.value = stats.totalStats;
        latestInfo.value = holdingLatestInfo;
      } catch (error) {
        error.value = error.message;
      } finally {
        toggleSkeleton(false);
      }
    })();

    function toggleSkeleton(isLoading) {
      loading.value = isLoading;
    }

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

        const res = await http.post(`/api/stock`, stockObj);

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
      setSnackbarMessage({ ...newData, result, routeName: "TradeResult" });
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
      inputValidity.value.ticker = false;
      stock.value.ticker = null;

      // 清空 cost tradeDate(否則換頁後再回來無法清空)
      stock.value.cost = null;
      stock.value.tradeDate = null;

      // reset 要帶入 buy modal 的 tickerToBeTraded
      tickerToBeTraded.value = null;
    }

    function disableVerticalScrollbar(style) {
      document.querySelector("body").style = style;
    }

    const inputValidity = ref({
      ticker: null,
      cost: null,
      shares: true,
      date: null,
    });

    function setInputValidity(validityObj) {
      const { name, validity } = validityObj;
      inputValidity.value[name] = validity;
    }

    return {
      loading,
      error,

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
      latestInfo,

      inputValidity,
      setInputValidity,
    };
  },
};
</script>