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
      v-if="closeChange"
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
        :xAxisData="lineChartData?.xAxisData"
        :seriesData="lineChartData?.seriesData"
        :currentTab="currentTab"
      />
    </div>
  </div>
</template>

<script>
import { ref, computed, watch } from "vue";
import http from "@/api/index";
import Tabs from "@/components/Tabs.vue";
import LineChart from "@/components/LineChart.vue";

export default {
  components: {
    Tabs,
    LineChart,
  },
  props: {
    ticker: String,
  },
  emits: ["switchTab"],
  setup(props, { emit }) {
    const tabs = ref(["5D", "1M", "6M", "YTD", "1Y", "5Y"]);
    const currentTab = ref("5D");
    const lineChartData = ref(null);
    const priceRawMapData = ref({});

    const closeChange = computed(() => {
      if (!lineChartData.value) return;
      return calculateClose("change");
    });

    const closeChangePercent = computed(() => {
      if (!lineChartData.value) return;
      return calculateClose("change percent");
    });

    function calculateClose(closeType) {
      const { seriesData } = lineChartData.value;
      const firstClosingPrice = seriesData[0];
      const lastClosingPrice = seriesData[seriesData.length - 1];

      switch (closeType) {
        case "change":
          return (lastClosingPrice - firstClosingPrice).toFixed(2);
        case "change percent":
          return (
            ((lastClosingPrice - firstClosingPrice) * 100) /
            firstClosingPrice
          ).toFixed(2);
      }
    }

    http
      .get(`/api/historicalPrice/${props.ticker}/?timespan=1Y`)
      .then((result) => {
        const priceMap = new Map(result.data.result);
        storePriceMap(priceMap, "1Y");

        lineChartData.value = mappingLineChartData(priceMap, currentTab.value);

        return http.get(`/api/historicalPrice/${props.ticker}/?timespan=5Y`);
      })
      .then((result) => {
        const priceMap = new Map(result.data.result);
        storePriceMap(priceMap, "5Y");
      });

    function storePriceMap(data, timespan) {
      priceRawMapData.value[timespan] = data;
    }

    async function getLineChartData(priceMap) {
      const year = new Date().getFullYear();
      const month = new Date().getMonth() + 1;
      const date = new Date().getDate();
      const startDateObj = {
        ["1M"]: `${year}/${month - 1}/${date}`,
        ["6M"]: `${year}/${month - 6}/${date}`,
        ["YTD"]: `${year - 1}/12/31`,
        ["1Y"]: `${year - 1}/${month}/${date}`,
        ["5Y"]: `${year - 5}/${month}/${date}`,
      };
      let lineChartData = null;

      if (currentTab.value !== "5D") {
        const startDate = startDateObj[currentTab.value];
        lineChartData = iteratePriceMapToLineChartData(priceMap, startDate);
      } else {
        lineChartData = mappingLineChartData(priceMap, currentTab.value);
      }

      return lineChartData;
    }

    watch(currentTab, async (newTab) => {
      emit("switchTab", newTab);
      if (newTab !== "5Y") {
        lineChartData.value = await getLineChartData(
          priceRawMapData.value["1Y"]
        );
      } else {
        lineChartData.value = await getLineChartData(
          priceRawMapData.value["5Y"]
        );
      }
    });

    function iteratePriceMapToLineChartData(priceMap, startDate) {
      if (!priceMap) return;

      const xAxisData = [];
      const seriesData = [];

      for (let [key, value] of priceMap.entries()) {
        if (key === startDate) break;
        xAxisData.push(key);
        seriesData.push(value);
      }

      const currentTimespanLength = xAxisData.length;
      const totalTimespanLength = priceRawMapData.value["1Y"].size;
      const isStartDateExist = currentTimespanLength !== totalTimespanLength;

      if (currentTab.value !== "1Y" && !isStartDateExist) {
        const newStartDate = getNewStartDate(xAxisData, startDate);
        xAxisData.length = 0;
        seriesData.length = 0;

        for (let [key, value] of priceMap.entries()) {
          xAxisData.push(key);
          seriesData.push(value);
          if (key === newStartDate) break;
        }
      }

      return {
        xAxisData: xAxisData.reverse(),
        seriesData: seriesData.reverse(),
      };
    }

    function getNewStartDate(xAxisData, fullDate) {
      console.log("fullDate", fullDate);
      const [startYear, startMonth, startDate] = fullDate.split("/");
      let date = startDate;
      let month = startMonth;
      let year = startYear;
      let startIndex = -1;
      let newStartDate = null;

      while (startIndex === -1) {
        const startDate = `^${year}/${month}/${date}$`;
        const regex = new RegExp(startDate, "i");

        startIndex = xAxisData.findIndex((element) => element.match(regex));

        newStartDate = `${year}/${month}/${date}`;

        if (date <= 1) {
          date = 31;
          if (month <= 1) {
            month = 12;
            year--;
          } else {
            month--;
          }
        } else {
          date++;
        }
      }

      return newStartDate;
    }

    function mappingLineChartData(priceTrend, timespan) {
      const dataset =
        timespan === "5D"
          ? [...priceTrend].slice(0, 5).reverse()
          : [...priceTrend].reverse();
      const xAxisData = dataset.map((item) => item[0]);
      const seriesData = dataset.map((item) => item[1]);
      return { xAxisData, seriesData };
    }

    return {
      tabs,
      currentTab,
      lineChartData,
      closeChange,
      closeChangePercent,
    };
  },
};
</script>