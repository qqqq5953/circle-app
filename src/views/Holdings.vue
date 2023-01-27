<template>
  <main class="px-4 md:p-10 mx-auto w-full max-w-[1200px]">
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
                    <span class="mr-px">+$</span>
                    <span>{{ item.totalStats.profitOrLossValue }}</span>
                  </span>
                  <span v-else>
                    <span class="mr-0.5">-$</span>
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

    <section class="mt-8 px-4 md:px-0 lg:px-4">
      <div class="flex items-center justify-between mb-4">
        <div class="w-40 h-6 bg-gray-300 rounded" v-if="loading"></div>
        <h2 class="font-semibold text-lg" v-if="!loading && holdings">
          Holdings
        </h2>
        <button
          class="
            bg-indigo-600
            text-white
            hover:bg-indigo-500
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
            class="w-1/2 p-1 sm:w-1/4 md:p-2"
            :class="{
              'sm:order-1': key === 'P / L',
              'sm:order-2': key === 'P / L %',
              'sm:order-3': key === 'Total cost',
              'sm:order-4': key === 'Total value',
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
      stock,
      inputValidity,
    } = storeToRefs($holdingStore);
    const { toggleSkeleton, activateNotification } = $holdingStore;

    function goto(ref) {}

    // 跨頁面時重置 searchList
    onMounted(() => (searchList.value = null));

    const totalStats = computed(() => {
      if (!data.value?.result) return;

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
      goto,
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