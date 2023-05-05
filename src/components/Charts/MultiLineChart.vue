<template>
  <v-chart
    class="h-60"
    :option="isLoading ? defaultOption : option"
    :loading="isLoading"
    autoresize
  />
</template>

<script>
import * as echarts from "echarts/core";
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

echarts.use([
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
      legend: {
        data: ["Asset Value"],
      },
      grid: {
        left: "2%",
        right: "2%",
        bottom: "0%",
        containLabel: true,
      },
      xAxis: {
        type: "category",
        boundaryGap: false,
        axisLabel: {
          margin: 20,
          align: "center",
          interval: 4,
          showMinLabel: true,
          showMaxLabel: false,
          hideOverlap: true,
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

    const isLoading = computed(() => {
      return !props.source;
    });

    watchEffect(() => initLineChart());

    function initLineChart() {
      const { source } = props;
      if (!source) return;

      setLineData(source);
      setSeries(source);
      setGraphColor(source);
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
          areaStyle: {
            opacity: 0.5,
            color: null,
          },
          showSymbol: true,
          zlevel: null,
        };
        option.value.series.push(obj);
      }
    }

    function setGraphColor(source) {
      const firstClosingPrice = source["Asset Value"][0];
      const lastClosingPrice =
        source["Asset Value"][source["Asset Value"].length - 1];
      const isEndedHigher = firstClosingPrice < lastClosingPrice;

      const lineColor = {
        endHigher: "#dc2626",
        endLower: "#16a34a",
      };

      const areaColor = {
        endHigher: createAreaColor("#ef4444", "#fef2f2"),
        endLower: createAreaColor("#22c55e", "#f0fdf4"),
      };

      const endLineColor = isEndedHigher
        ? lineColor.endHigher
        : lineColor.endLower;
      const endAreaColor = isEndedHigher
        ? areaColor.endHigher
        : areaColor.endLower;

      option.value.series[0].itemStyle.color = endLineColor;
      if (source.date.length === 1) return;
      option.value.series[0].areaStyle.color =
        new echarts.graphic.LinearGradient(0, 0, 0, 1, endAreaColor);
    }

    function createAreaColor(offsetColor0, offsetColor1) {
      return [
        {
          offset: 0,
          color: offsetColor0,
        },
        {
          offset: 1,
          color: offsetColor1,
        },
      ];
    }

    return { option, defaultOption, isLoading };
  },
};
</script>
