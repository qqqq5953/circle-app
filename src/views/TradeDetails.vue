<template>
  <div class="flex flex-col gap-4 p-2">
    <section>
      <h1 class="flex items-center gap-x-3 pb-2" v-if="basicInfo">
        <span class="ticker-badge" :class="basicInfo.style">
          {{ basicInfo.ticker }}
        </span>
        <span class="font-medium text-lg text-wrap"> {{ basicInfo.name }}</span>
      </h1>

      <ul>
        <li
          class="
            flex
            items-end
            gap-x-1.5
            py-2
            text-xs
            border-b
            font-semibold
            text-slate-800
          "
        >
          <div class="w-1/5">Today</div>
          <div class="w-[15%] text-right">Price</div>
          <div class="w-[15%] text-right">Total shares</div>
          <div class="grow text-right">P / L %</div>
        </li>
      </ul>

      <ul v-if="totalStats">
        <li
          class="
            flex
            items-center
            gap-x-1.5
            py-2
            text-xs
            border-b
            text-slate-800
          "
        >
          <div class="w-1/5">
            {{ new Date().toLocaleDateString("zh-TW").replace(/\//g, "-") }}
          </div>
          <div class="w-[15%] text-right">{{ totalStats.close }}</div>
          <div class="w-[15%] text-right">{{ totalStats.totalShares }}</div>
          <div class="grow text-right">
            <span
              class="inline-block px-3 py-2 rounded font-medium"
              :class="
                totalStats.profitOrLossPercentage > 0
                  ? 'text-red-600 bg-red-100/70'
                  : totalStats.profitOrLossPercentage < 0
                  ? 'text-green-700 bg-green-100'
                  : 'text-slate-500 bg-slate-200'
              "
            >
              <i
                class="fas fa-arrow-up text-red-700"
                v-if="totalStats.profitOrLossPercentage > 0"
              ></i>
              <i
                class="fas fa-arrow-down text-green-700"
                v-else-if="totalStats.profitOrLossPercentage < 0"
              ></i>
              <span v-else>--</span>
              <span class="ml-1">
                {{
                  totalStats.profitOrLossPercentage >= 0
                    ? `${totalStats.profitOrLossPercentage}`
                    : `${totalStats.profitOrLossPercentage * -1}`
                }}
              </span>
              %</span
            >
            <span
              class="inline-block px-1.5 py-px rounded font-medium"
              :class="
                totalStats.profitOrLossValue > 0
                  ? 'text-red-600'
                  : totalStats.profitOrLossValue < 0
                  ? 'text-green-700'
                  : 'text-slate-500'
              "
              >{{
                totalStats.profitOrLossValue > 0
                  ? `+$${totalStats.profitOrLossValue}`
                  : totalStats.profitOrLossValue < 0
                  ? `-$${totalStats.profitOrLossValue * -1}`
                  : `${totalStats.profitOrLossValue}`
              }}</span
            >
          </div>
        </li>
      </ul>
    </section>

    <section>
      <h2 class="text-lg font-medium pb-2">Trade Records</h2>
      <ul>
        <li
          class="
            flex
            items-end
            gap-x-1.5
            py-2
            text-xs
            border-b
            font-semibold
            text-slate-800
          "
        >
          <div class="w-1/5">Trade date</div>
          <div class="w-[15%] text-right">Cost</div>
          <div class="w-[15%] text-right">Shares</div>
          <div class="grow text-right">P / L %</div>
        </li>
      </ul>

      <ul>
        <li
          class="
            flex
            items-center
            gap-x-1.5
            py-2
            text-xs
            border-b
            text-slate-800
          "
          v-for="trade in tradeList"
          :key="trade.id"
        >
          <div class="w-1/5">{{ trade.tradeDate }}</div>
          <div class="w-[15%] text-right">{{ trade.cost }}</div>
          <div class="w-[15%] text-right">{{ trade.shares }}</div>
          <div class="grow text-right">
            <span
              class="inline-block px-1.5 py-px font-medium"
              :class="
                basicInfo.close > trade.cost
                  ? 'text-red-600'
                  : basicInfo.close < trade.cost
                  ? 'text-green-700'
                  : 'text-slate-500'
              "
            >
              <i
                class="fas fa-arrow-up mr-px text-red-700"
                v-if="basicInfo.close > trade.cost"
              ></i>
              <i class="fas fa-arrow-down mr-px text-green-700" v-else></i>
              {{ calculatePerformance("percent", trade.cost) }} %
            </span>
            <span
              class="inline-block px-1.5 py-px rounded font-light"
              :class="
                trade.cost < basicInfo.close
                  ? 'text-red-600'
                  : trade.cost > basicInfo.close
                  ? 'text-green-700'
                  : 'text-slate-500'
              "
            >
              {{ calculatePerformance("value", trade.cost) }}
            </span>
          </div>
        </li>
      </ul>
    </section>
  </div>
</template>

<script>
import { ref } from "vue";
import http from "../api/index";
export default {
  props: {
    holdings: Object,
  },
  setup(props) {
    const tradeList = ref(null);
    const basicInfo = ref(null);
    const totalStats = ref(null);

    http
      .get(`/api/tradeDetails/${props.holdings.latestInfo.ticker}`)
      .then((res) => {
        console.log(props.holdings);
        const { latestInfo, trade } = props.holdings;
        const { ticker, name, style, close } = latestInfo;
        basicInfo.value = { ticker, name, style, close };
        totalStats.value = trade;

        tradeList.value = res.data.result;

        console.log(tradeList.value);
      });

    function calculatePerformance(type, cost) {
      switch (type) {
        case "percent": {
          const percent = parseFloat(
            (((basicInfo.value.close - cost) * 100) / cost).toFixed(2)
          );
          if (percent >= 0) {
            return `${percent}`;
          } else {
            return `${percent * -1}`;
          }
        }
        case "value": {
          const value = parseFloat((basicInfo.value.close - cost).toFixed(2));
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

    return {
      tradeList,
      basicInfo,
      totalStats,
      calculatePerformance,
    };
  },
};
</script>

<style>
</style>