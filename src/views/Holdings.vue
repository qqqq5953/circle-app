<template>
  <main class="px-4 md:p-10 mx-auto w-full relative">
    <section class="px-4 md:px-0 lg:px-4">
      <div class="flex items-center mb-4">
        <h2 class="font-semibold text-lg">Top 3 Performance</h2>
        <span class="text-xs ml-auto">
          {{ lastMarketOpenDate }}
        </span>
      </div>
      <div class="lg:flex lg:justify-between gap-3">
        <CardSkeleton v-if="holdingsTotalInfo == null" />
        <Card :holdingsTotalInfo="holdingsTotalInfo" v-else></Card>
      </div>
    </section>
    <section class="mt-5 px-4 md:px-0 lg:px-4">
      <h2 class="font-semibold text-lg mb-4">Holdings</h2>
      <!-- <HoldingTable>
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
              hidden
              md:block
              lg:hidden
            "
          >
            Trade
          </button>
        </template>
        <template #thead-price>
          <th
            class="
              px-4
              py-3
              text-blueGray-500
              align-middle
              text-xs
              uppercase
              font-semibold
              text-center
              sm:text-right
            "
          >
            Price
          </th>
        </template>
        <template #tbody-price>
          <td
            class="
              px-4
              pt-5
              pb-0
              border-b border-gray-100
              sm:border-0
              text-xs
              whitespace-nowrap
              flex
              items-center
              sm:table-cell
            "
          >
            <span class="sm:hidden font-semibold mr-2">Price:</span>
            <p class="ml-auto text-right">{{ regularMarketPrice }}</p>
          </td>
        </template>
        <template #thead-trade>
          <th class="px-4 py-3 md:hidden lg:block"></th>
        </template>
        <template #tbody-trade>
          <td
            class="
              px-4
              pt-5
              pb-0
              md:hidden
              lg:block
              text-xs
              block
              sm:table-cell
            "
          >
            <button
              type="button"
              class="
                border border-blue-900
                rounded
                px-2
                py-1
                hover:bg-blue-900 hover:text-white
                ml-auto
                block
              "
            >
              Trade
            </button>
          </td>
        </template>
      </HoldingTable> -->

      <TableSkeleton v-if="holdingsTotalInfo == null" />
      <NewTable
        :holdingsTotalInfo="holdingsTotalInfo"
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
      </NewTable>
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

      <form @submit.prevent="addStock">
        <input
          type="text"
          class="form-input px-4 py-3 rounded-full"
          placeholder="ticker"
          pattern="^\w{1,5}$"
          ref="tickerRef"
          v-model.trim="stock.ticker"
        />
        <small :class="message?.success ? 'text-green-500' : 'text-red-500'">{{
          message?.content
        }}</small>
        <input
          type="number"
          class="form-input px-4 py-3 rounded-full"
          placeholder="cost"
          min="0"
          v-model.trim="stock.cost"
        />
        <input
          type="number"
          class="form-input px-4 py-3 rounded-full"
          placeholder="shares"
          min="0"
          v-model.trim="stock.shares"
        />
        <input
          type="submit"
          class="form-input px-4 py-3 rounded-full"
          value="add"
        />
      </form>
    </div>
  </main>
</template>

<script>
import HoldingTable from "@/components/HoldingTable.vue";
import NewTable from "@/components/NewTable.vue";
import Card from "@/components/Card.vue";
import CardSkeleton from "@/components/skeleton/CardSkeleton.vue";
import TableSkeleton from "@/components/skeleton/TableSkeleton.vue";
import { ref, defineAsyncComponent } from "vue";
import axios from "axios";
import useAxios from "@/composables/useAxios.js";

export default {
  components: {
    HoldingTable,
    NewTable,
    Card,
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
      await updateData(success);
    };

    const holdingsTotalInfo = ref(null);
    const getHoldings = async () => {
      const response = await axios.get(`/api/getHoldings`);
      holdingsTotalInfo.value = response.data;
      console.log("getHoldings= ", response.data);
      return response.data;
    };

    const getHoldings1 = () => {
      const { data, error, loading } = useAxios("/api/getHoldings", "get", {});
      holdingsTotalInfo.value = data;
    };

    const lastMarketOpenDate = ref("");
    const getLastMarketOpenDate = () => {
      const tickers = [];
      for (let ticker in holdingsTotalInfo.value) {
        tickers.push(ticker);
      }
      lastMarketOpenDate.value = holdingsTotalInfo.value[tickers[0]].date.slice(
        0,
        10
      );
    };

    const stock = ref({
      ticker: null,
      cost: 300,
      shares: 20,
      date: Date.now(),
    });
    const updateData = async (isSuccess) => {
      if (isSuccess) await getHoldings();
    };
    const addStock = async () => {
      const stockObj = {
        ...stock.value,
        ticker: stock.value.ticker.toUpperCase(),
      };
      const response = await axios.post("/api/addStock", stockObj);
      message.value = response.data;
      console.log("addStock= ", response.data);

      // if (response.data.success) await getHoldings();
      await updateData(message.value.success);
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

    const execute = async () => {
      // Promise.all([getHoldings(), getHistorical()]).then((res) => {
      //   console.log("res", res);
      //   holdingsTotalInfo.value = res[0];
      //   historicalQutoes.value = res[1];
      // });
      await getHoldings();
      getLastMarketOpenDate();
    };
    execute();

    return {
      holdingsTotalInfo,
      historicalQutoes,
      lastMarketOpenDate,
      stock,
      message,
      getHoldings,
      getHistorical,
      addStock,
      tickerRef,
      openTradeModal,
      closeTradeModal,
      isModalOpen,
      stockToBeTraded,
      execute,
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