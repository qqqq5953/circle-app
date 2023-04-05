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
      class="relative top-12 flex items-center gap-2 max-w-fit text-xs py-3 font-medium"
      :class="closeChange > 0 ? 'text-red-600' : 'text-green-600'"
      v-if="closeChange"
    >
      <span
        class="rounded px-1.5 py-1"
        :class="closeChange > 0 ? 'bg-red-100' : 'bg-green-100'"
      >
        <i class="fas fa-arrow-up" v-if="closeChangePercent > 0"></i>
        <i class="fas fa-arrow-down" v-else></i>
        <span class="ml-1.5"
          >{{
            closeChangePercent > 0
              ? closeChangePercent
              : closeChangePercent * -1
          }}%</span
        >
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
import LineChart from "@/components/Charts/LineChart.vue";

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
    const adjustMonthObj = {
      0: 12,
      "-1": 11,
      "-2": 10,
      "-3": 9,
      "-4": 8,
      "-5": 7,
    };
    const startDateObj = {
      ["1M"]:
        month - 1 === 0
          ? `${year - 1}/12/${date}`
          : `${year}/${month - 1}/${date}`,
      ["6M"]:
        month - 6 <= 0
          ? `${year - 1}/${adjustMonthObj[`${month - 6}`]}/${date}`
          : `${year}/${month - 6}/${date}`,
      ["YTD"]: `${year - 1}/12/31`,
      ["1Y"]: `${year - 1}/${month}/${date}`,
      ["5Y"]: `${year - 5}/${month}/${date}`,
    };
    const timespan = ref(null);

    http
      .get(url_1Y)
      .then((response) => {
        if (!response) return;
        const priceMap = new Map(response.data.result.close);
        storePriceMap(priceMap, "1Y");
        getLineChartData(priceMap);

        return http.get(url_5Y);
      })
      .then((response) => {
        if (!response) return;
        const priceMap = new Map(response.data.result.close);
        lineChartData.value["5Y"] = mappingLineChartData(priceMap, "5Y");
      })
      .catch((err) => {
        console.log("err", err);
      });

    function storePriceMap(data, timespan) {
      priceRawMapData.value[timespan] = data;
    }

    function getLineChartData(priceMap) {
      // length -1 是為了排除 5Y
      for (let i = 0; i < tabs.value.length - 1; i++) {
        timespan.value = tabs.value[i];
        console.log(
          `%c timespan ${timespan.value}`,
          "background:blue;color:#efefef"
        );

        switch (timespan.value) {
          case "5D": {
            lineChartData.value[timespan.value] = mappingLineChartData(
              priceMap,
              timespan.value
            );
            break;
          }
          default: {
            const startDate = startDateObj[timespan.value];
            lineChartData.value[timespan.value] =
              iteratePriceMapToLineChartData(priceMap, startDate);
            break;
          }
        }
      }
    }

    function iteratePriceMapToLineChartData(priceMap, startDate) {
      console.log("startDate", startDate);

      const [_, m, d] = startDate.split("/");
      const isYTD = m + d === "1231";
      const xAxisData = [];
      const seriesData = [];

      for (let [fullDate, price] of priceMap.entries()) {
        // 找 YTD
        const [_, month, date] = fullDate.split("/");
        const isEndOfYear =
          isYTD && (month + date === "1231" || month + date === "1230");

        if (isEndOfYear) break;

        // YTD 以外
        xAxisData.push(fullDate);
        seriesData.push(price);
        if (fullDate === startDate) break;
      }

      const currentTimespanLength = xAxisData.length;
      const oneYearTimespanLength = priceRawMapData.value["1Y"].size;
      const isStartDateExist = currentTimespanLength !== oneYearTimespanLength;

      // 重新找開始日期
      if (timespan.value !== "1Y" && !isStartDateExist) {
        const newStartDate = getNewStartDate(xAxisData, startDate);
        xAxisData.length = 0;
        seriesData.length = 0;

        for (let [fullDate, price] of priceMap.entries()) {
          xAxisData.push(fullDate);
          seriesData.push(price);
          if (fullDate === newStartDate) break;
        }
      }

      return {
        xAxisData: xAxisData.reverse(),
        seriesData: seriesData.reverse(),
      };
    }

    function getNewStartDate(xAxisData, fullDate) {
      const [startYear, startMonth, startDate] = fullDate.split("/");
      let date = +startDate;
      let month = +startMonth;
      let year = +startYear;
      let startIndex = -1;
      let newStartDate = null;
      let i = 0;

      while (startIndex === -1) {
        const startDate = `^${year}/${month}/${date}$`;
        const regex = new RegExp(startDate, "i");

        startIndex = xAxisData.findIndex((element) => element.match(regex));

        newStartDate = xAxisData[startIndex - 1];

        if (date !== 1) {
          date--;
        } else {
          date = 31;
          if (month !== 1) {
            month--;
          } else {
            month = 12;
            year--;
          }
        }

        i++;

        if (i >= 1825) {
          console.log(`%c 大於 1825`, "background:pink;color:#efefef");
          break;
        }
      }
      console.log("------------------");
      console.log("result newStartDate", newStartDate);

      return newStartDate;
    }

    function mappingLineChartData(priceTrend, timespan) {
      // 註：五年資料區間各市場不一樣，因最新資料的日期不一樣
      const dataset =
        timespan === "5D"
          ? [...priceTrend].slice(0, 5).reverse()
          : [...priceTrend].reverse();
      const xAxisData = dataset.map((item) => item[0]);
      const seriesData = dataset.map((item) => item[1]);
      return { xAxisData, seriesData };
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
          return parseFloat((lastClosingPrice - firstClosingPrice).toFixed(2));
        case "change percent":
          const closePercent = (
            ((lastClosingPrice - firstClosingPrice) * 100) /
            firstClosingPrice
          ).toFixed(2);
          return parseFloat(closePercent);
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