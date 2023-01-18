<template>
  <main class="px-4 md:p-10 mx-auto w-full relative">
    <Teleport to="body">
      <Toast v-if="isWeb" :toastMessage="notificationMessage">
        <template #btn>
          <router-link
            :to="{ name: 'History' }"
            class="
              inline-block
              px-2
              py-1.5
              rounded
              mt-3.5
              text-xs
              bg-blue-600
              text-white
              hover:bg-blue-500
            "
            >View records</router-link
          >
        </template>
      </Toast>

      <Snackbar v-if="!isWeb" :barMessage="notificationMessage">
        <template #btn>
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
              bg-blue-600
              text-white
              hover:bg-blue-500
            "
            >View details</router-link
          >
        </template>
      </Snackbar>
    </Teleport>

    <section class="px-4 md:px-0 lg:px-4">
      <div class="flex items-center mb-4">
        <h2 class="font-semibold text-lg">Top 3 Performance</h2>
        <span class="text-xs ml-auto">
          {{ lastMarketOpenDate }}
        </span>
      </div>
      <div class="lg:flex gap-3">
        <CardSkeleton v-if="loading" />
        <div
          class="lg:w-1/3"
          v-else
          v-for="item in topThreePerformance"
          :key="item.ticker"
        >
          <Card :cardData="item"></Card>
        </div>
      </div>
    </section>

    <section class="mt-5 px-4 md:px-0 lg:px-4">
      <div class="flex items-center justify-between mb-4">
        <h2 class="font-semibold text-lg">Holdings</h2>
        <button
          class="
            bg-blue-600
            text-white
            hover:bg-blue-500
            rounded-full
            px-2
            py-1
            text-xs
          "
          @click="toggleModal(true)"
        >
          <span>+</span>
          <span class="mx-1">Invest</span>
        </button>
      </div>

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
            <NewAdding
              :tickerToBeTraded="tickerToBeTraded"
              :isBuyMore="isBuyMore"
              v-show="!loading"
            />
          </template>
          <template #okButton>Trade</template>
        </InputModal>
      </Teleport>

      <TableSkeleton v-if="loading" />
      <NewTable1
        :holdingsTotalInfo="data.result"
        @openTradeModal="openTradeModal"
        v-else
      >
        <template #holding-table-btn>
          <button
            type="button"
            class="
              hidden
              md:block
              lg:hidden
              text-xs
              border border-blue-900
              rounded
              px-2
              py-1
              hover:bg-blue-900 hover:text-white
            "
          >
            Trade
          </button>
        </template>
      </NewTable1>
    </section>
  </main>
</template>

<script>
import HoldingTable from "@/components/HoldingTable.vue";
import NewTable1 from "@/components/NewTable1.vue";
import Card from "@/components/Card.vue";
import CardSkeleton from "@/components/skeleton/CardSkeleton.vue";
import TableSkeleton from "@/components/skeleton/TableSkeleton.vue";
import InputSkeleton from "@/components/skeleton/InputSkeleton.vue";
import NewAdding from "@/components/NewAdding.vue";

import { ref, defineAsyncComponent, computed, onMounted, watch } from "vue";
import useHoldingStore from "@/stores/holdingStore.js";
import useSearchStore from "@/stores/searchStore.js";
import { storeToRefs } from "pinia";
import http from "../api/index";

export default {
  components: {
    HoldingTable,
    NewAdding,
    NewTable1,
    Card,
    CardSkeleton,
    TableSkeleton,
    InputSkeleton,
    Toast: defineAsyncComponent(() => import("@/components/Toast.vue")),
    Snackbar: defineAsyncComponent(() => import("@/components/Snackbar.vue")),
    InputModal: defineAsyncComponent(() =>
      import("@/components/InputModal.vue")
    ),
  },
  setup() {
    const $searchStore = useSearchStore();
    const { searchList } = storeToRefs($searchStore);

    const $holdingStore = useHoldingStore();
    const {
      notificationMessage,
      isModalOpen,
      data,
      error,
      loading,
      lastMarketOpenDate,
      stock,
      inputValidity,
    } = storeToRefs($holdingStore);

    const { toggleModal, toggleSkeleton, activateNotification } = $holdingStore;

    onMounted(() => {
      console.log("holdings onMounted");
      searchList.value = null;
    });

    const isAllValid = computed(() =>
      Object.values(inputValidity.value).every((item) => !!item)
    );

    const isWeb = ref(window.matchMedia("(min-width:768px)").matches);

    const addStock = async () => {
      if (!isAllValid.value) return;

      toggleModal(false);
      toggleSkeleton(true);

      try {
        const stockObj = {
          ...stock.value,
          ticker: stock.value.ticker,
          tempTicker: stock.value.tempTicker.toUpperCase(),
          recordUnix: Date.now(),
        };

        console.log("stockObj", stockObj);

        const res = await http.post(`/api/addStock`, stockObj);

        await updateHoldings(res.data, res.data.errorMessage);
      } catch (error) {
        console.log("addStock error", error);
      }
    };

    const tradeResult = ref(null);

    const updateHoldings = async (newData, errorMessage) => {
      console.log("updateHoldings newData", newData);
      if (!newData.success) return activateNotification(errorMessage);

      try {
        const res = await http.get(`/api/getHoldings`);
        data.value = res.data;
        console.log("res", res);

        const { latestInfo, tradeInfo } = newData.result;
        const { ticker } = latestInfo;
        const { cost, shares, tradeDate } = tradeInfo;
        const addDate = new Date(tradeInfo.recordUnix);
        const result = {
          Ticker: ticker,
          Cost: cost,
          Shares: shares,
          "Trade date": tradeDate,
          "Record time": addDate.toLocaleString("zh-TW").replace(/\//g, "-"),
        };

        toggleSkeleton(false);

        if (isWeb.value) {
          // toast
          activateNotification({ ...newData, result });
        } else {
          // snackbar
          activateNotification({ ...newData, result: null });
          tradeResult.value = { ...newData, result };
        }
      } catch (error) {
        console.log("updateHoldings error", error);
      }
    };

    const tickerToBeTraded = ref(null);
    const isBuyMore = ref(null);

    const openTradeModal = async (obj) => {
      const { open, ...latestInfo } = obj;
      isModalOpen.value = open;
      isBuyMore.value = true;
      tickerToBeTraded.value = latestInfo;

      console.log("tickerToBeTraded.value", tickerToBeTraded.value);
    };

    watch(isModalOpen, (newVal) => {
      if (!newVal) {
        isBuyMore.value = false;
        tickerToBeTraded.value = null;
      }
    });

    const historicalQutoes = ref(null);
    const getHistorical = async () => {
      const period = "d"; // 月資料都是從第一天開始
      const dateStart = 30;
      const dateEnd = 29;
      const response = await axios.get(
        `/api/historicalHolding/${period}/${dateStart}/${dateEnd}`
      );
      console.log("getHistorical= ", response.data);
      historicalQutoes.value = response.data;
      return response.data;
    };

    // Card
    const topThreePerformance = computed(() => {
      if (!data.value) return;
      return calculatePerformance(data.value.result);
    });

    const calculatePerformance = (holdings) => {
      if (!holdings) return;

      return Object.values(holdings)
        .map((item) => {
          const { latestInfo, trade } = item;
          return {
            ticker: latestInfo.ticker,
            style: latestInfo.style,
            profitOrLossPercentage: trade.profitOrLossPercentage,
            profitOrLossValue: trade.profitOrLossValue,
          };
        })
        .sort((a, b) => {
          return b.profitOrLossPercentage - a.profitOrLossPercentage;
        })
        .slice(0, 3);
    };

    return {
      topThreePerformance,
      data,
      loading,
      error,
      lastMarketOpenDate,
      notificationMessage,

      historicalQutoes,
      getHistorical,
      openTradeModal,
      isModalOpen,
      tickerToBeTraded,

      toggleModal,
      addStock,
      isAllValid,
      isBuyMore,
      tradeResult,
      isWeb,
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