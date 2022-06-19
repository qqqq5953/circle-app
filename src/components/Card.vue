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
    <div class="flex flex-wrap bg-blue-200">
      <div class="w-full pr-4 max-w-full flex-1 bg-green-100">
        <h5 class="text-blueGray-400 uppercase font-bold text-xs">
          {{ item.ticker }}
        </h5>
        <span class="font-semibold text-xl text-blueGray-700">
          {{ item.profitOrLossPercentage }} %
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
          bg-red-500
        "
      >
        <i class="far fa-chart-bar"></i>
      </div>
    </div>
    <!-- card-body -->
    <p class="flex text-sm text-blueGray-400 mt-4 bg-red-200">
      <span class="flex-shrink-0 text-emerald-500 mr-2">
        <i class="fas fa-arrow-up"></i> 3.48%
      </span>
      <span> Since last month</span>
    </p>
  </div>
</template>

<script>
import { ref, watch } from "vue";

export default {
  props: ["holdingsTotalInfo"],
  setup(props) {
    const holdingsTotalInfo = ref(null);
    const topThreePerformance = ref(null);

    const calculatePerformance = (holdings) => {
      const result = Object.values(holdings)
        .map((item) => {
          const obj = {};
          obj.ticker = item.symbol;
          obj.profitOrLossPercentage = item.profitOrLossPercentage;
          return obj;
        })
        .sort((a, b) => {
          return b.profitOrLossPercentage - a.profitOrLossPercentage;
        })
        .slice(0, 3);
      return result;
    };

    watch(props, (newValue) => {
      holdingsTotalInfo.value = newValue.holdingsTotalInfo;
      console.log("holdingsTotalInfo", holdingsTotalInfo.value);
      console.log(calculatePerformance(holdingsTotalInfo.value));
      topThreePerformance.value = calculatePerformance(holdingsTotalInfo.value);
    });

    return {
      holdingsTotalInfo,
      topThreePerformance,
    };
  },
};
</script>
