<template>
  <main class="px-4 md:p-10 mx-auto w-full xl:container">
    <!-- snackbar -->
    <Teleport to="body">
      <Snackbar :barMessage="notificationMessage">
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
              bg-gray-100
              text-indigo-700
              hover:bg-white
            "
            >View result</router-link
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

    <section class="px-4 md:px-0 lg:px-4">
      <div class="flex items-center mb-4" v-if="topThreePerformance.length">
        <h2 class="font-semibold text-lg">Top 3 Performance</h2>
        <span class="text-xs ml-auto">
          {{ lastMarketOpenDate }}
        </span>
      </div>
      <div class="sm:flex gap-3">
        <div
          class="sm:w-1/3"
          v-for="item in topThreePerformance"
          :key="item.ticker"
        >
          <CardSkeleton v-if="loading" />
          <Card v-else>
            <template #card-title>
              <h3 class="flex gap-x-3 items-center mb-2">
                <span class="ticker-badge" :class="item.style">
                  {{ item.ticker }}
                </span>
                <span class="font-bold text-xs truncate w-[45%] sm:w-auto">{{
                  item.name
                }}</span>
              </h3>
            </template>
            <template #card-sub-title>
              <div class="flex items-center gap-x-3">
                <p
                  class="font-bold px-2 py-1 rounded text-xs"
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
                    <span class="mr-px">+$</span>
                    <span>{{ item.profitOrLossValue }}</span>
                  </span>
                  <span v-else>
                    <span class="mr-0.5">-$</span>
                    <span>{{ item.profitOrLossValue * -1 }}</span>
                  </span>
                </p>
              </div>
            </template>
            <template #card-icon
              ><div
                class="
                  absolute
                  right-4
                  top-1/2
                  -translate-y-1/2
                  sm:hidden
                  flex
                  items-center
                  justify-center
                  w-12
                  h-12
                  shadow-lg
                  rounded-full
                  bg-slate-400
                  text-white text-center
                "
              >
                <i class="far fa-chart-bar"></i>
              </div>
            </template>
          </Card>
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
          @click="toggleModal({ open: true, type: 'invest' })"
          v-if="holdings"
        >
          <span>+</span>
          <span class="mx-1">Invest</span>
        </button>
      </div>

      <!-- totalStats -->
      <div class="mb-2 md:mb-4" v-if="totalStats">
        <ul class="flex flex-wrap -m-1 md:-m-2">
          <li
            class="w-1/2 p-1 md:w-1/4 md:p-2"
            :class="{
              'md:order-1': key === 'P / L',
              'md:order-2': key === 'P / L %',
              'md:order-3': key === 'Total cost',
              'md:order-4': key === 'Total value',
            }"
            v-for="(value, key) in totalStats"
            :key="key"
          >
            <div
              class="
                flex flex-col
                items-center
                bg-slate-100
                text-slate-700
                rounded
                shadow
                p-2
                lg:p-1.5
              "
            >
              <span
                class="font-medium text-sm md:text-base"
                :class="
                  value > 0 && (key === 'P / L' || key === 'P / L %')
                    ? 'text-red-600'
                    : value < 0 && (key === 'P / L' || key === 'P / L %')
                    ? 'text-green-700'
                    : null
                "
                >{{ key !== "P / L %" ? "$" : null }} {{ value }}
                {{ key === "P / L %" ? "%" : null }}</span
              >
              <span class="font-light text-xs">{{ key }}</span>
            </div>
          </li>
        </ul>
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

import { ref, defineAsyncComponent, computed, onMounted, watch } from "vue";
import useHoldingStore from "@/stores/holdingStore.js";
import useSearchStore from "@/stores/searchStore.js";
import { storeToRefs } from "pinia";
import http from "../api/index";

export default {
  components: {
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
    const { toggleSkeleton, activateNotification } = $holdingStore;

    // 跨頁面時重置 searchList
    onMounted(() => (searchList.value = null));

    const totalStats = computed(() => {
      if (!data.value) return;

      // 計算總成本、總市值
      const stats = Object.values(data.value.result).reduce(
        (obj, item) => {
          obj["Total value"] += item.totalStats.totalValue;
          obj["Total cost"] += item.totalStats.totalCost;
          return obj;
        },
        { "Total cost": 0, "Total value": 0 }
      );

      // 計算總損益、總報酬率
      stats["Total value"] = parseFloat(stats["Total value"].toFixed(2));
      stats["Total cost"] = parseFloat(stats["Total cost"].toFixed(2));
      stats["P / L"] = parseFloat(
        (stats["Total value"] - stats["Total cost"]).toFixed(2)
      );
      stats["P / L %"] = parseFloat(
        ((stats["P / L"] * 100) / stats["Total cost"]).toFixed(2)
      );

      return stats;
    });

    const holdings = computed(() => {
      if (!data.value) return;
      return data.value?.result;
    });

    // addStock
    const isAllValid = computed(() =>
      Object.values(inputValidity.value).every((item) => !!item)
    );

    const tradeResult = ref(null);

    async function addStock() {
      if (!isAllValid.value) return;

      toggleModal({ open: false, type: "invest" });
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
    }

    async function updateHoldings(newData, errorMessage) {
      console.log("updateHoldings newData", newData);
      if (!newData.success) return activateNotification(errorMessage);

      try {
        const res = await http.get(`/api/holdings`);
        data.value = res.data;
        console.log("res", res);

        const { ticker, cost, shares, tradeDate, recordUnix } = newData.result;
        const addDate = new Date(recordUnix);
        const result = {
          Ticker: ticker,
          Cost: cost,
          Shares: shares,
          "Trade date": tradeDate,
          "Record time": addDate.toLocaleString("zh-TW").replace(/\//g, "-"),
        };

        toggleSkeleton(false);

        activateNotification({ ...newData, result: null });
        tradeResult.value = { ...newData, result };
      } catch (error) {
        console.log("updateHoldings error", error);
      }
    }

    // toggleModal
    const tickerToBeTraded = ref(null);
    const isBuyMore = ref(null);
    const newAddingRef = ref(null);

    function toggleModal(parmas) {
      const { open, type, ...latestInfo } = parmas;
      const style = open ? "overflow:hidden" : null;
      disableVerticalScrollbar(style);
      if (!open) clearInvalidMessage();
      isModalOpen.value = open;

      if (type === "buy") {
        isBuyMore.value = true;
        tickerToBeTraded.value = latestInfo;
      }
    }

    function disableVerticalScrollbar(style) {
      document.querySelector("body").style = style;
    }

    function clearInvalidMessage() {
      const { inputCostRef, inputSharesRef } = newAddingRef.value.$refs;
      inputCostRef.costRef.setCustomValidity("");
      inputCostRef.inputError.length = 0;
      inputSharesRef.sharesRef.setCustomValidity("");
      inputSharesRef.inputError.length = 0;
    }

    // 清空 buy modal
    watch(isModalOpen, (newVal) => {
      if (!newVal) {
        isBuyMore.value = false;
        tickerToBeTraded.value = null;
      }
    });

    // Card
    const topThreePerformance = computed(() => {
      return calculatePerformance(data.value?.result);
    });

    function calculatePerformance(holdings) {
      // return;
      if (!holdings) return [];

      return Object.values(holdings)
        .map((item) => {
          const { latestInfo, totalStats } = item;
          return {
            ticker: latestInfo.ticker,
            name: latestInfo.name,
            style: latestInfo.style,
            profitOrLossPercentage: totalStats.profitOrLossPercentage,
            profitOrLossValue: totalStats.profitOrLossValue,
          };
        })
        .sort((a, b) => {
          return b.profitOrLossPercentage - a.profitOrLossPercentage;
        })
        .slice(0, 3);
    }

    return {
      topThreePerformance,
      data,
      loading,
      error,
      lastMarketOpenDate,
      notificationMessage,

      toggleModal,
      isModalOpen,
      tickerToBeTraded,

      toggleModal,
      addStock,
      isAllValid,
      isBuyMore,
      tradeResult,
      newAddingRef,

      holdings,
      totalStats,
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