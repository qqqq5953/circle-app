<template>
  <div v-if="xAxisData && seriesData">
    <v-chart class="h-60" :option="option" autoresize />
  </div>
</template>

<script>
import { use } from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import { BarChart } from "echarts/charts";
import { GridComponent } from "echarts/components";
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
} from "echarts/components";
import VChart from "vue-echarts";
import { onUpdated, ref } from "vue";

use([
  CanvasRenderer,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  BarChart,
]);

export default {
  components: {
    VChart,
  },
  props: {
    xAxisData: {
      type: Array,
    },
    seriesData: {
      type: Array,
    },
  },
  setup(props) {
    const option = ref({
      series: null,
      xAxis: {
        type: "category",
        data: null,
        axisTick: {
          alignWithLabel: true,
        },
      },
      yAxis: [
        {
          type: "value",
          name: "billion",
          nameLocation: "center",
          nameGap: "30",
        },
      ],
      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "shadow",
        },
      },
      legend: {
        orient: "horizontal",
        top: "15",
        left: "center",
      },
      grid: {
        left: "8%",
        right: "8%",
        bottom: "0%",
        containLabel: true,
      },
      animation: false,
    });

    function initBarChart() {
      const { xAxisData, seriesData } = props;

      option.value.xAxis.data = xAxisData;
      option.value.series = seriesData.map((item) => item);
    }

    initBarChart();

    onUpdated(() => {
      initBarChart();
    });

    return { option };
  },
};
</script>