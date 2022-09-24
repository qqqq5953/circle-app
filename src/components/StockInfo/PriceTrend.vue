<template>
  <div class="relative w-full max-w-[99%]">
    <div class="absolute top-2 w-full">
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
        top-12
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
        :xAxisData="lineChartData[currentTab]?.xAxisData"
        :seriesData="lineChartData[currentTab]?.seriesData"
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
    const lineChartData = ref({});
    const priceRawMapData = ref({});

    const url_1Y = `/api/historicalPrice/${props.ticker}/?timespan=1Y`;
    const url_5Y = `/api/historicalPrice/${props.ticker}/?timespan=5Y`;
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

    http
      .get(url_1Y)
      .then((response) => {
        const priceMap = new Map(response.data.result.close);
        storePriceMap(priceMap, "1Y");
        getLineChartData(priceMap);

        return http.get(url_5Y);
      })
      .then((response) => {
        const priceMap = new Map(response.data.result.close);
        lineChartData.value["5Y"] = mappingLineChartData(priceMap, "5Y");
      });

    function getLineChartData(priceMap) {
      for (let i = 0; i < tabs.value.length - 1; i++) {
        const timespan = tabs.value[i];

        if (timespan !== "5D") {
          const startDate = startDateObj[timespan];
          lineChartData.value[timespan] = iteratePriceMapToLineChartData(
            priceMap,
            startDate
          );
        } else {
          lineChartData.value[timespan] = mappingLineChartData(
            priceMap,
            timespan
          );
        }
      }
    }

    function iteratePriceMapToLineChartData(priceMap, startDate) {
      const xAxisData = [];
      const seriesData = [];

      console.log("startDate", startDate.split("/")[2]);
      const endOfYear = startDate.split("/")[1] + startDate.split("/")[2];

      for (let [fullDate, price] of priceMap.entries()) {
        const [year, month, date] = fullDate.split("/");

        if (month + date === "1231") break;
        xAxisData.push(fullDate);
        seriesData.push(price);
        if (fullDate === startDate) break;
      }

      const currentTimespanLength = xAxisData.length;
      const oneYearTimespanLength = priceRawMapData.value["1Y"].size;
      const isStartDateExist = currentTimespanLength !== oneYearTimespanLength;

      if (currentTab.value !== "1Y" && !isStartDateExist) {
        const newStartDate = getNewStartDate(xAxisData, startDate);
        console.log("newStartDate", newStartDate);

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

    function storePriceMap(data, timespan) {
      priceRawMapData.value[timespan] = data;
    }

    const closeChange = computed(() => {
      if (!lineChartData.value[currentTab.value]) return;
      return calculateClose("change");
    });

    const closeChangePercent = computed(() => {
      if (!lineChartData.value[currentTab.value]) return;
      return calculateClose("change percent");
    });

    function calculateClose(closeType) {
      const { seriesData } = lineChartData.value[currentTab.value];
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

    watch(currentTab, (newTab) => emit("switchTab", newTab));

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