<template>
  <v-chart
    class="h-60"
    :option="isLoading ? defaultOption : option"
    :loading="isLoading"
    autoresize
  />
</template>

<script>
import { use, graphic } from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import { LineChart } from "echarts/charts";
import { GridComponent } from "echarts/components";
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  DatasetComponent,
} from "echarts/components";
import VChart from "vue-echarts";
import { computed, ref, watchEffect } from "vue";

use([
  CanvasRenderer,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  LineChart,
  DatasetComponent,
]);
export default {
  components: {
    VChart,
  },
  props: {
    source: {
      type: Object,
    },
    currentTab: {
      type: String,
    },
  },
  setup(props) {
    const defaultOption = ref({
      grid: {
        left: "0%",
        right: "0%",
        bottom: "3%",
      },
      xAxis: {
        data: null,
      },
      yAxis: {},
      series: [
        {
          name: "Price",
          type: "line",
          data: null,
        },
      ],
    });

    const option = ref({
      tooltip: {
        trigger: "axis",
      },
      grid: {
        left: "2%",
        right: null,
        bottom: "0%",
        containLabel: true,
      },
      xAxis: {
        type: "category",
        boundaryGap: false,
        data: null,
        axisLabel: {
          margin: 20,
          align: "center",
          showMinLabel: false,
          showMaxLabel: false,
        },
      },
      yAxis: {
        type: "value",
        max: null,
        min: null,
        minInterval: null,
      },
      dataset: {
        source: {},
      },
      series: [],
      animation: false,
    });

    const min768 = window.matchMedia("(min-width:768px)");

    const isLoading = computed(() => {
      return !props.source;
    });

    watchEffect(() => initLineChart());

    function initLineChart() {
      const { source, currentTab } = props;
      console.log("source", source);

      if (!source) return;

      setLineData(source);
      setSeries(source);
      // setYAxis(seriesData, currentTab);
      // setGraphColor(seriesData);
      // setZLevel(currentTab);
      setGrid(currentTab);
      setMinMaxLabel(currentTab);
      // setShowSymbol(currentTab);
    }

    function setYAxis(seriesData, currentTab) {
      const min = Math.min(...seriesData);
      const max = Math.max(...seriesData);
      const adjMin = Math.floor((min - 1) / 10) * 10;
      const adjMax = Math.ceil((max + 1) / 10) * 10;
      const isDifferenceLessThan10 = Math.abs(max - min) <= 10;

      option.value.yAxis.min = adjMin;
      option.value.yAxis.max = adjMax;
      option.value.yAxis.minInterval =
        currentTab === "5D" || isDifferenceLessThan10 ? 5 : 10;
    }

    function setGraphColor(seriesData) {
      const firstClosingPrice = seriesData[0];
      const lastClosingPrice = seriesData.at(-1);
      const isEndedHigher = firstClosingPrice < lastClosingPrice;

      const lineColor = {
        endHigher: "#dc2626",
        endLower: "#16a34a",
      };

      const endLineColor = isEndedHigher
        ? lineColor.endHigher
        : lineColor.endLower;

      option.value.series[0].itemStyle.color = endLineColor;
    }

    function setLineData(source) {
      option.value.dataset.source = source;
    }

    function setSeries(source) {
      const keys = Object.keys(source);

      for (let i = 0; i < keys.length; i++) {
        if (keys[i] === "date") continue;

        const obj = {
          name: keys[i],
          type: "line",
          itemStyle: {
            color: null,
          },
          showSymbol: true,
          zlevel: null,
        };
        option.value.series.push(obj);
      }

      console.log("series", option.value.series);
    }

    function setZLevel(currentTab) {
      option.value.series[0].zlevel =
        currentTab === "5D"
          ? 1
          : currentTab === "1M"
          ? 2
          : currentTab === "6M"
          ? 3
          : currentTab === "1Y"
          ? 4
          : 5;
    }

    function setGrid(currentTab) {
      option.value.grid.right = min768.matches
        ? "1%"
        : currentTab === "5D"
        ? "10%"
        : "1%";
    }

    function setMinMaxLabel(currentTab) {
      option.value.xAxis.axisLabel.showMinLabel =
        currentTab === "5D" && !min768.matches;

      option.value.xAxis.axisLabel.showMaxLabel =
        currentTab === "5D" && !min768.matches;
    }

    function setShowSymbol(currentTab) {
      option.value.series[0].showSymbol = currentTab === "5D";
    }

    return { option, defaultOption, isLoading };
  },
};
</script>
