<template>
  <main class="px-4 md:p-10 mx-auto w-full relative">
    <div v-if="error" class="text-center text-2xl text-red-500">
      {{ error }}
    </div>
    <!-- <div>computedData:{{ computedData }}</div> -->
    <section class="px-4 md:px-0 lg:px-4">
      <div class="flex items-center mb-4">
        <h2 class="font-semibold text-lg">Top 3 Performance</h2>
        <span class="text-xs ml-auto">
          {{ lastMarketOpenDate }}
        </span>
      </div>
      <div class="lg:flex lg:justify-between gap-3">
        <CardSkeleton v-if="loading" />
        <Card1 :holdingsTotalInfo="data" v-else></Card1>
      </div>
    </section>
    <section class="mt-5 px-4 md:px-0 lg:px-4">
      <h2 class="font-semibold text-lg mb-4">Holdings</h2>
      <form @submit.prevent="addStock" class="flex items-start gap-4">
        <div>
          <input
            type="text"
            class="form-input block px-4 py-3 rounded-full"
            placeholder="ticker"
            pattern="^\w{1,5}$"
            ref="tickerRef"
            v-model.trim="stock.ticker"
          />
          <small :class="message?.success ? 'text-green-500' : 'text-red-500'">
            {{ message?.content || "無此標的" }}
          </small>
        </div>

        <div>
          <input
            type="number"
            class="form-input block px-4 py-3 rounded-full"
            placeholder="cost"
            min="0"
            v-model.trim="stock.cost"
          />
          <small> 測試用 </small>
        </div>

        <div>
          <input
            type="number"
            class="form-input block px-4 py-3 rounded-full"
            placeholder="shares"
            min="0"
            v-model.trim="stock.shares"
          />
          <small> 測試用 </small>
        </div>

        <input
          type="submit"
          class="form-input px-4 py-3 rounded-full"
          value="add"
        />
      </form>
      <TableSkeleton v-if="loading" />
      <NewTable1
        :holdingsTotalInfo="data"
        @openTradeModal="openTradeModal"
        v-else
      >
        <template #holding-table-btn>
          <button
            type="button"
            class="
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

    <Transition name="modal">
      <TradeModal
        v-if="isModalOpen"
        :stockToBeTraded="stockToBeTraded"
        @closeTradeModal="closeTradeModal"
      />
    </Transition>

    <div class="px-4 md:px-0 lg:px-4">
      <button type="button" class="border px-2 py-1" @click="getQuote">
        getQuote
      </button>
      <button type="button" class="border px-2 py-1" @click="getHistorical">
        getHistorical
      </button>
      <button type="button" class="border px-2 py-1" @click="getHolding">
        getHolding
      </button>
      <button type="button" class="border px-2 py-1" @click="execute">
        getHoldings
      </button>
      <br />
    </div>
  </main>
</template>

<script>
import HoldingTable from "@/components/HoldingTable.vue";
import NewTable1 from "@/components/NewTable1.vue";
import Card1 from "@/components/Card1.vue";
import CardSkeleton from "@/components/skeleton/CardSkeleton.vue";
import TableSkeleton from "@/components/skeleton/TableSkeleton.vue";
import { ref, toRef, defineAsyncComponent, computed, watch } from "vue";
import axios from "axios";
import useAxios from "@/composables/useAxios.js";

export default {
  components: {
    HoldingTable,
    NewTable1,
    Card1,
    CardSkeleton,
    TableSkeleton,
    TradeModal: defineAsyncComponent(() =>
      import("@/components/TradeModal.vue")
    ),
  },
  setup() {
    const message = ref(null);
    const tickerRef = ref(null);
    const isModalOpen = ref(false);
    const stockToBeTraded = ref("");
    const stock = ref({
      ticker: "AAPL",
      cost: 100,
      shares: 5,
      date: Date.now(),
    });

    const openTradeModal = (obj) => {
      const { open, ticker } = obj;
      isModalOpen.value = open;
      stockToBeTraded.value = ticker;
      // tickerRef.value.focus();
    };

    const closeTradeModal = async (obj) => {
      const { open, success } = obj;
      isModalOpen.value = open;
      // if (success) await getHoldings();
      // await updateData(success);
    };

    const { data, error, loading } = useAxios("/api/getHoldings", "get", {});

    // const computedData = computed(() => {
    //   console.log("computedData", data.value);
    //   return data.value;
    // });

    const lastMarketOpenDate = computed(() => {
      // console.log("data.value", data.value);
      // console.log("error.value", error.value);
      console.log("loading.value", loading.value);

      if (!data.value) return;

      const tickers = [];
      for (let ticker in data.value) {
        tickers.push(ticker);
      }

      return data.value[tickers[0]].date.slice(0, 10);
    });

    const updateHoldings = async (isSuccess, updateResponse) => {
      message.value = updateResponse;

      if (!isSuccess) {
        error.value = updateResponse.errorMessage
          .split(" ")
          .splice(0, 4)
          .join(" ");
      } else {
        const response = await axios.get(`/api/getHoldings`);
        data.value = response.data;
      }
    };

    const toggleSkeleton = (val) => {
      loading.value = val;
    };

    const addStock = async () => {
      const stockObj = {
        ...stock.value,
        ticker: stock.value.ticker.toUpperCase(),
      };

      const {
        data: res,
        error: errorMesssage,
        loading: isLoading,
      } = useAxios("/api/addStock", "post", stockObj);

      toggleSkeleton(isLoading.value);

      watch(res, (newResponse) => {
        updateHoldings(message?.value?.success, newResponse);
      });

      watch(isLoading, (newValue) => {
        toggleSkeleton(newValue);
      });
    };

    const historicalQutoes = ref(null);
    const getHistorical = async () => {
      const period = "d"; // 月資料都是從第一天開始
      const dateStart = 30;
      const dateEnd = 29;
      const response = await axios.get(
        `/api/historical/${period}/${dateStart}/${dateEnd}`
      );
      console.log("getHistorical= ", response.data);
      historicalQutoes.value = response.data;
      return response.data;
    };

    return {
      data,
      loading,
      error,
      lastMarketOpenDate,

      // computedData,

      historicalQutoes,
      stock,
      message,
      getHistorical,
      addStock,
      tickerRef,
      openTradeModal,
      closeTradeModal,
      isModalOpen,
      stockToBeTraded,
    };
  },
};
// export default {
//   components: {
//     HoldingTable,
//     NewTable,
//     Card,
//   },
//   data() {
//     return {
//       holdingsTotalInfo: null,
//       regularMarketPrice: null,
//       stock: {
//         ticker: "AAPL",
//         cost: "130",
//         shares: "10",
//         date: Date.now(),
//       },
//       test: null,
//     };
//   },
//   methods: {
//     getQuote() {
//       this.axios.get("/api/quote").then((res) => {
//         console.log("getQuote= ", res.data);
//       });
//     },
//     getHistorical() {
//       this.axios.get("/api/historical").then((res) => {
//         console.log("getHistorical= ", res.data);
//         // this.quote = res.data;

//         // this.quote = res.data;
//       });
//     },
//     getHolding() {
//       this.axios.get(`/api/getHolding/${this.ticker}`).then((res) => {
//         console.log("getHolding= ", res.data);
//       });
//     },
//     async getHoldings() {
//       const response = await this.axios.get(`/api/getHoldings`);
//       console.log("getHoldings= ", response.data);
//       this.holdingsTotalInfo = response.data;
//     },
//     addStock() {
//       this.axios.post("/api/addStock", this.stock).then((res) => {
//         console.log("addStock= ", res);
//         // this.msg = res;
//       });
//     },
//     addTest() {
//       this.test = "testttttt";
//     },
//     addTest1() {
//       this.test = "another testttttt";
//     },
//   },
//   created() {
//     // this.getHoldings();
//   },
// };
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