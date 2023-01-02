<template>
  <div
    class="
      flex flex-col flex-auto
      break-words
      bg-white
      rounded
      p-4
      mb-6
      xl:mb-0
      shadow-lg
      border border-gray-100
    "
    v-for="item in topThreePerformance"
    :key="item.ticker"
  >
    <!-- card-header -->
    <div class="flex flex-wrap">
      <div class="flex-1">
        <p class="ticker-badge mb-2" :class="item.style">
          {{ item.ticker }}
        </p>
        <span
          class="font-semibold px-2 py-1 rounded"
          :class="
            item.profitOrLossPercentage > 0
              ? 'text-red-600'
              : item.profitOrLossPercentage < 0
              ? 'text-green-700'
              : 'text-slate-500'
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
        </span>
        <span
          class="text-xs"
          :class="
            item.profitOrLossValue > 0
              ? 'text-red-600'
              : item.profitOrLossValue < 0
              ? 'text-green-700'
              : 'text-slate-500'
          "
        >
          <span v-if="item.profitOrLossValue >= 0">
            <span class="mr-px">$</span>
            <span>{{ item.profitOrLossValue }}</span>
          </span>
          <span v-else>
            <span class="mr-px">-$</span>
            <span>{{ item.profitOrLossValue * -1 }}</span>
          </span>
        </span>
      </div>
      <div
        class="
          text-white text-center
          inline-flex
          items-center
          justify-center
          w-12
          h-12
          ml-3
          shadow-lg
          rounded-full
          bg-gray-300
        "
      >
        <i class="far fa-chart-bar"></i>
      </div>
    </div>
    <!-- card-body -->
    <p class="flex text-sm mt-4">
      <span
        class="flex-shrink-0 inline-block px-2 py-1 mr-4 rounded"
        :class="
          item.monthlyGrowth > 0
            ? 'text-green-700 bg-green-100'
            : 'text-red-700 bg-red-100'
        "
      >
        <span v-if="item.monthlyGrowth !== 0">
          <i
            class="fas fa-arrow-up mr-1 text-green-700"
            v-if="item.monthlyGrowth > 0"
          ></i>
          <i class="fas fa-arrow-down mr-1 text-red-700" v-else></i>
        </span>
        {{ item.monthlyGrowth }} %
      </span>
      <span> Since last month</span>
    </p>
  </div>
</template>

<script>
import { computed } from "vue";
export default {
  props: {
    holdingsTotalInfo: {
      type: Object,
    },
  },
  setup(props) {
    const topThreePerformance = computed(() =>
      calculatePerformance(props.holdingsTotalInfo)
    );

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
    };
  },
};

// export default {
//   props: ["holdingsTotalInfo", "historicalQutoes"],
//   setup(props) {
//     const calculateTopPerformance = (nowHoldings, pastHoldings, topNumber) => {
//       console.log("nowHoldings", nowHoldings);
//       console.log("pastHoldings", pastHoldings);
//       if (nowHoldings == null || pastHoldings == null) return;

//       const performance = Object.entries(nowHoldings)
//         .map((holding) => {
//           const [ticker, quote] = holding;
//           const pastQuote = pastHoldings[ticker];

//           const lastMonthClose = pastQuote.close;
//           const averageCost = quote.averageCost;
//           const monthlyGrowth = parseFloat(
//             (((lastMonthClose - averageCost) * 100) / averageCost).toFixed(2)
//           );

//           const obj = {
//             ticker,
//             monthlyGrowth,
//             profitOrLossPercentage: quote.profitOrLossPercentage,
//           };

//           return obj;
//         })
//         .sort((a, b) => {
//           return b.profitOrLossPercentage - a.profitOrLossPercentage;
//         })
//         .slice(0, topNumber);
//       return performance;
//     };

//     const holdingsTotalInfo = toRef(props, "holdingsTotalInfo");
//     const topThreePerformance = ref(null);

//     watch(
//       () => props.historicalQutoes,
//       (newValue) => {
//         const holdingsTotalInfoLastMonth = newValue;

//         topThreePerformance.value = calculateTopPerformance(
//           holdingsTotalInfo.value,
//           holdingsTotalInfoLastMonth,
//           3
//         );
//       }
//     );

//     return {
//       holdingsTotalInfo,
//       topThreePerformance,
//     };
//   },
// };
</script>
