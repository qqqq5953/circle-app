<template>
  <div class="relative w-full max-w-[99%]">
    <div class="absolute top-0 w-full z-10">
      <Tabs
        :tabs="tabs"
        :current-tab-props="currentTab"
        :is-justify-between="true"
        width="w-12"
        @switchTab="(val) => (currentTab = val)"
      />
    </div>
    <div
      class="
        relative
        top-11
        max-w-fit
        border-[1.5px]
        rounded
        px-2
        py-1.5
        text-xs
        font-medium
      "
      :class="
        closeChange > 0
          ? 'text-red-600 border-red-600'
          : 'text-green-600 border-green-600'
      "
    >
      <span>
        <span class="text-slate-500 mr-px">(</span>
        <i class="fas fa-arrow-up" v-if="closeChangePercent > 0"></i>
        <i class="fas fa-arrow-down" v-else></i>
        {{ closeChangePercent }}%
        <span class="text-slate-500 ml-px">)</span>
      </span>
      <span class="ml-1.5">
        <span v-if="closeChange > 0">+</span>
        <span>{{ closeChange }}</span>
      </span>
    </div>
    <div class="relative top-2 w-full">
      <LineChart
        :xAxisData="xAxisData"
        :seriesData="seriesData"
        :currentTab="currentTab"
      />
    </div>
  </div>
</template>

<script>
import { ref, computed, watch } from "vue";
import Tabs from "@/components/Tabs.vue";
import LineChart from "@/components/LineChart.vue";

export default {
  components: {
    Tabs,
    LineChart,
  },
  props: {
    priceTrend: Object,
    closeChange: String,
    closeChangePercent: String,
  },
  emits: ["switchTab"],
  setup(props, { emit }) {
    const tabs = ref(["5D", "1M", "6M", "YTD", "1Y", "5Y"]);
    const currentTab = ref("5D");

    const xAxisData = computed(() => {
      return props.priceTrend[currentTab.value].xAxisData;
    });
    const seriesData = computed(() => {
      return props.priceTrend[currentTab.value].seriesData;
    });

    watch(currentTab, () => {
      emit("switchTab", currentTab.value);
    });

    return {
      tabs,
      currentTab,
      xAxisData,
      seriesData,
    };
  },
};
</script>