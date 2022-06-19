<template>
  <main class="px-4 md:p-10 mx-auto w-full">
    <section class="px-4 md:px-0 lg:px-4">
      <h2 class="mb-4 font-semibold text-lg">Top 3 Performance</h2>
      <div class="lg:flex lg:justify-between gap-3">
        <Card :holdingsTotalInfo="holdingsTotalInfo"></Card>
      </div>
    </section>
    <section class="mt-5 px-4 md:px-0 lg:px-4">
      <h2 class="mb-4 font-semibold text-lg">Holdings</h2>
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
      <NewTable :holdingsTotalInfo="holdingsTotalInfo">
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
      </NewTable>
    </section>

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
      <button type="button" class="border px-2 py-1" @click="getHoldings">
        getHoldings
      </button>
      <br />

      <input
        type="text"
        class="form-input px-4 py-3 rounded-full"
        placeholder="ticker"
        v-model="stock.ticker"
      />
      <input
        type="text"
        class="form-input px-4 py-3 rounded-full"
        placeholder="cost"
        v-model="stock.cost"
      />
      <input
        type="text"
        class="form-input px-4 py-3 rounded-full"
        placeholder="shares"
        v-model="stock.shares"
      />
      <input
        type="submit"
        class="form-input px-4 py-3 rounded-full"
        value="submit"
        @click="setHoldings"
      />
    </div>

    <!-- <div class="w-full xl:w-6/12 px-4 bg-gray-300">
      <TopThreePerformace></TopThreePerformace>
    </div> -->
    <!-- <HoldingTable></HoldingTable>
    <TopThreePerformace></TopThreePerformace>
    <HoldingTable></HoldingTable>
    <TopThreePerformace></TopThreePerformace>
    <HoldingTable></HoldingTable>
    <TopThreePerformace></TopThreePerformace>
    <HoldingTable></HoldingTable>
    <TopThreePerformace></TopThreePerformace> -->
  </main>
</template>

<script>
import HoldingTable from "@/components/HoldingTable.vue";
import NewTable from "@/components/NewTable.vue";
// import TopThreePerformace from '@/components/TopThreePerformace.vue';
import Card from "@/components/Card.vue";
import { ref } from "vue";
import axios from "axios";

export default {
  components: {
    HoldingTable,
    NewTable,
    Card,
  },
  setup() {
    const holdingsTotalInfo = ref(null);
    const regularMarketPrice = ref(null);
    const stock = ref({
      ticker: null,
      cost: null,
      shares: null,
      date: Date.now(),
    });

    const getHoldings = async () => {
      const response = await axios.get(`/api/getHoldings`);
      holdingsTotalInfo.value = response.data;
      console.log("getHoldings= ", response.data);
    };

    const setHoldings = async () => {
      const response = await axios.post("/api/setHoldings", stock.value);
      console.log("setHoldings= ", response.data);
      await getHoldings();
    };

    getHoldings();

    return {
      holdingsTotalInfo,
      regularMarketPrice,
      stock,
      getHoldings,
      setHoldings,
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
//     setHoldings() {
//       this.axios.post("/api/setHoldings", this.stock).then((res) => {
//         console.log("setHoldings= ", res);
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
