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
        flex
        items-center
        gap-2
        max-w-fit
        text-xs
        py-3
        font-medium
      "
      :class="closeChange > 0 ? 'text-red-600' : 'text-green-600'"
    >
      <span
        class="rounded px-1.5 py-1"
        :class="closeChange > 0 ? 'bg-red-100' : 'bg-green-100'"
      >
        <i class="fas fa-arrow-up" v-if="closeChangePercent > 0"></i>
        <i class="fas fa-arrow-down" v-else></i>
        <span class="ml-1.5">{{ closeChangePercent }}%</span>
      </span>
      <span>
        <span v-if="closeChange > 0">+</span>
        <span>{{ closeChange }}</span>
      </span>
      <span>{{ currentTab }}</span>
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
      return props.priceTrend[currentTab.value]?.xAxisData;
    });
    const seriesData = computed(() => {
      return props.priceTrend[currentTab.value]?.seriesData;
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