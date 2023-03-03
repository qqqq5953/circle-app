<template>
  <div class="flex flex-col gap-4 py-2 px-3 max-w-[1000px] w-full mx-auto">
    <section>
      <h1 class="flex items-center gap-x-3 pb-2" v-if="basicInfo">
        <span class="ticker-badge" :class="basicInfo.style">
          {{ basicInfo.ticker }}
        </span>
        <span class="font-medium text-lg text-wrap"> {{ basicInfo.name }}</span>
      </h1>

      <TitleList :titles="titles_Total" />
      <ContentList
        :list="totalStats"
        fontWeight="font-medium"
        v-if="totalStats"
      >
        <template #diff-percent>
          <span
            class="inline-block px-2 py-1 rounded"
            :class="
              totalStats[0].profitOrLossPercentage > 0
                ? 'text-red-600 bg-red-100/70'
                : totalStats[0].profitOrLossPercentage < 0
                ? 'text-green-700 bg-green-100'
                : 'text-slate-500 bg-slate-200'
            "
          >
            <i
              class="fas fa-arrow-up text-red-600"
              v-if="totalStats[0].profitOrLossPercentage > 0"
            ></i>
            <i
              class="fas fa-arrow-down text-green-700"
              v-else-if="totalStats[0].profitOrLossPercentage < 0"
            ></i>
            <span v-else>--</span>
            <span class="ml-1">
              {{
                totalStats[0].profitOrLossPercentage >= 0
                  ? `${totalStats[0].profitOrLossPercentage}`
                  : `${totalStats[0].profitOrLossPercentage * -1}`
              }}%
            </span>
          </span>
        </template>
        <template #diff-value>
          <span
            class="inline-block"
            :class="
              totalStats[0].profitOrLossValue > 0
                ? 'text-red-600'
                : totalStats[0].profitOrLossValue < 0
                ? 'text-green-700'
                : 'text-slate-500'
            "
            >{{
              totalStats[0].profitOrLossValue > 0
                ? `+$${totalStats[0].profitOrLossValue}`
                : totalStats[0].profitOrLossValue < 0
                ? `-$${totalStats[0].profitOrLossValue * -1}`
                : `${totalStats[0].profitOrLossValue}`
            }}</span
          >
        </template>
        <template #totlal-value="{ value }">
          <span>${{ value }}</span>
        </template>
      </ContentList>
    </section>

    <section>
      <h2 class="text-lg font-medium pb-2">Trade Records</h2>
      <TitleList :titles="titles_Records" />
      <ContentList :list="tradeList" fontWeight="font-light">
        <template #diff-percent="{ price }">
          <span
            class="inline-block font-medium"
            :class="
              basicInfo.price > price
                ? 'text-red-600'
                : basicInfo.price < price
                ? 'text-green-700'
                : 'text-slate-500'
            "
          >
            <i
              class="fas fa-arrow-up text-red-600"
              v-if="basicInfo.price > price"
            ></i>
            <i
              class="fas fa-arrow-down text-green-700"
              v-else-if="basicInfo.price < price"
            ></i>
            <span v-else>--</span>
            <span class="ml-1">
              {{ calculatePerformance("percent", price) }} %
            </span>
          </span>
        </template>
        <template #diff-value="{ price }">
          <span
            class="inline-block"
            :class="
              basicInfo.price > price
                ? 'text-red-600'
                : basicInfo.price < price
                ? 'text-green-700'
                : 'text-slate-500'
            "
          >
            {{ calculatePerformance("value", price) }}
          </span>
        </template>
        <template #totlal-value="{ value }">
          <span>${{ value }}</span>
        </template>
      </ContentList>
    </section>
  </div>
</template>

<script>
import { ref } from "vue";
import http from "../api/index";
import TitleList from "@/components/TradeDetails/TitleList.vue";
import ContentList from "@/components/TradeDetails/ContentList.vue";

export default {
  components: {
    TitleList,
    ContentList,
  },
  props: {
    holdings: Object,
  },
  setup(props) {
    const basicInfo = ref(null);
    const totalStats = ref(null);
    const tradeList = ref(null);

    http
      .get(`/api/tradeDetails/${props.holdings.latestInfo.tempTicker}`)
      .then((res) => {
        const { latestInfo, totalStats: stats } = props.holdings;
        const { ticker, name, style, close } = latestInfo;

        basicInfo.value = { ticker, name, style, price: close };
        totalStats.value = [stats].map((item) => {
          const { totalShares, profitOrLossPercentage, profitOrLossValue } =
            item;
          return {
            id: Date.now(),
            price: close,
            shares: totalShares,
            date: new Date().toLocaleDateString("zh-TW").replace(/\//g, "-"),
            value: close * totalShares,
            profitOrLossPercentage,
            profitOrLossValue,
          };
        });
        tradeList.value = res.data.result.map((trade) => {
          const { id, cost, shares, status, tradeDate } = trade;
          return {
            id,
            shares,
            status,
            price: cost,
            date: tradeDate,
            value: close * shares,
          };
        });
      });

    function calculatePerformance(type, cost) {
      switch (type) {
        case "percent": {
          const percent = parseFloat(
            (((basicInfo.value.price - cost) * 100) / cost).toFixed(2)
          );
          if (percent >= 0) {
            return `${percent}`;
          } else {
            return `${percent * -1}`;
          }
        }
        case "value": {
          const value = parseFloat((basicInfo.value.price - cost).toFixed(2));
          if (value > 0) {
            return `+$${value}`;
          } else if (value < 0) {
            return `-$${value * -1}`;
          } else {
            return `${value}`;
          }
        }
      }
    }

    const titles_Total = ref([
      {
        name: "Today",
        style: "w-1/5",
      },
      {
        name: "Price",
        style: "w-[12%] text-right",
      },
      {
        name: "Total shares",
        style: "w-[22%] text-right",
      },
      {
        name: "P / L %",
        style: "w-1/5 grow text-right",
      },
      {
        name: "P / L",
        style: "w-[15%] grow text-right",
      },
      {
        name: "Value",
        style: "w-[15%] hidden sm:block grow text-right",
      },
    ]);

    const titles_Records = ref([
      {
        name: "Trade date",
        style: "w-1/5",
      },
      {
        name: "Cost",
        style: "w-[12%] text-right",
      },
      {
        name: "Shares",
        style: "w-[22%] text-right",
      },
      {
        name: "P / L %",
        style: "w-1/5 grow text-right",
      },
      {
        name: "P / L",
        style: "w-[15%] grow text-right",
      },
      {
        name: "Value",
        style: "w-[15%] hidden sm:block grow text-right",
      },
    ]);

    return {
      tradeList,
      basicInfo,
      totalStats,
      calculatePerformance,
      titles_Total,
      titles_Records,
    };
  },
};
</script>

<style>
</style>