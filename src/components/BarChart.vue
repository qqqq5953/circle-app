<template>
  <v-chart class="h-60" :option="option" />
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
import { ref, watch, watchEffect } from "vue";

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
    const { xAxisData, seriesData } = props;

    const option = ref({
      series: seriesData.map((item) => item),
      xAxis: [
        {
          type: "category",
          data: xAxisData,
          axisTick: {
            alignWithLabel: true,
          },
        },
      ],
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
    });

    watch(props, (newProps) => {
      const { xAxisData, seriesData } = newProps;

      option.value.xAxis[0].data = xAxisData;
      option.value.series = seriesData;
    });

    return { option };
  },
};
</script>