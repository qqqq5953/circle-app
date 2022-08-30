<template>
  <v-chart class="h-60" :option="option" />
</template>

<script>
import { use } from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import { LineChart } from "echarts/charts";
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
  LineChart,
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
      type: [Array, Object],
    },
  },
  setup(props) {
    const { xAxisData, seriesData } = props;
    console.log("ine chart props", props);

    const option = ref({
      tooltip: {
        trigger: "axis",
      },
      grid: {
        left: "3%",
        right: "4%",
        bottom: "3%",
        containLabel: true,
      },
      xAxis: {
        type: "category",
        boundaryGap: false,
        data: xAxisData,
      },
      yAxis: {
        type: "value",
      },
      series: [
        {
          name: "Price",
          type: "line",
          stack: "Total",
          data: seriesData,
          // smooth: true,
        },
      ],
    });

    watch(props, (newProps) => {
      const { xAxisData, seriesData } = newProps;

      option.value.xAxis.data = xAxisData;
      option.value.series[0].data = seriesData;
    });

    return { option };
  },
};
</script>
