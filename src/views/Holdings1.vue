<template>
  <main class="px-4 md:p-10 mx-auto w-full relative">
    <Teleport to="body">
      <Toast class="fixed right-6 top-6 z-10" :toastMessage="toastMessage" />
    </Teleport>

    <!-- <button
      type="button"
      class="border px-2 py-1"
      @click="
        activateToast({
          success: true,
          content: '標的新增成功',
          result: { cost: 200, ticker: 'AAPL', shares: 20 },
        })
      "
    >
      activateToast
    </button> -->

    <section class="px-4 md:px-0 lg:px-4">
      <div class="flex items-center mb-4">
        <h2 class="font-semibold text-lg">Top 3 Performance</h2>
        <span class="text-xs ml-auto">
          {{ lastMarketOpenDate }}
        </span>
      </div>
      <div class="lg:flex lg:justify-between gap-3">
        <CardSkeleton v-if="loading" />
        <Card1 :holdingsTotalInfo="data.result" v-else></Card1>
      </div>
    </section>

    error:
    <div v-if="error" class="text-center text-2xl text-red-500">
      {{ error }}
    </div>

    <section class="mt-5 px-4 md:px-0 lg:px-4">
      <h2 class="font-semibold text-lg mb-4">Holdings</h2>

      <button @click="isModalOpen = true">open</button>
      <Teleport to="body">
        <InputModal v-if="isModalOpen" :closeFunc="closeModal">
          <template #title>Trade Panel</template>
          <template #inputs>
            <NewAdding
              @isLoading="toggleSkeleton"
              @updateHoldings="updateHoldings"
              @toastMessage="activateToast"
              v-show="!loading"
            />
          </template>
        </InputModal>
      </Teleport>

      <hr class="my-4" />

      <h2>NewAdding</h2>
      <InputSkeleton v-show="loading" />
      <NewAdding
        @isLoading="toggleSkeleton"
        @updateHoldings="updateHoldings"
        @toastMessage="activateToast"
        v-show="!loading"
      />

      <hr class="my-4" />

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

    <!-- <Transition name="modal">
      <TradeModal
        v-if="isModalOpen"
        :stockToBeTraded="stockToBeTraded"
        @closeTradeModal="closeTradeModal"
      />
    </Transition> -->

    <div class="px-4 md:px-0 lg:px-4">
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
import Toast from "@/components/Toast.vue";
import CardSkeleton from "@/components/skeleton/CardSkeleton.vue";
import TableSkeleton from "@/components/skeleton/TableSkeleton.vue";
import InputSkeleton from "@/components/skeleton/InputSkeleton.vue";

import NewAdding from "@/components/NewAdding.vue";
import InputModal from "@/components/InputModal.vue";

import { ref, defineAsyncComponent, computed } from "vue";
import axios from "axios";
import useAxios from "@/composables/useAxios.js";

export default {
  components: {
    HoldingTable,
    NewAdding,
    NewTable1,
    Card1,
    CardSkeleton,
    TableSkeleton,
    InputSkeleton,
    Toast,
    TradeModal: defineAsyncComponent(() =>
      import("@/components/TradeModal.vue")
    ),
    InputModal,
  },
  setup() {
    const closeModal = () => {
      // clearInput();
      isModalOpen.value = false;
    };

    const toastMessage = ref(null);
    const tickerRef = ref(null);
    const isModalOpen = ref(false);
    const stockToBeTraded = ref("");
    const stock = ref({
      ticker: "AAPL",
      cost: 100,
      shares: 1,
      date: Date.now(),
    });

    const { data, error, loading } = useAxios("/api/getHoldings", "get");

    const lastMarketOpenDate = computed(() => {
      // console.log("data.value", data.value);
      // console.log("error.value", error.value);
      // console.log("loading.value", loading.value);

      if (!data.value?.result) return;

      const tickers = [];
      for (let ticker in data.value?.result) {
        tickers.push(ticker);
      }

      return data.value?.result[tickers[0]].date.slice(0, 10);
    });

    const activateToast = (val) => (toastMessage.value = val);

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

    const updateHoldings = (val) => (data.value = val);

    const toggleSkeleton = (isLoading) => (loading.value = isLoading);

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

    return {
      data,
      loading,
      error,
      lastMarketOpenDate,
      toggleSkeleton,
      updateHoldings,
      activateToast,
      toastMessage,

      historicalQutoes,
      stock,
      getHistorical,
      tickerRef,
      openTradeModal,
      closeTradeModal,
      isModalOpen,
      stockToBeTraded,

      closeModal,
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