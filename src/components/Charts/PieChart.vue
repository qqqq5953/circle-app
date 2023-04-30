<template>
  <v-chart
    class="h-[360px]"
    :class="{ 'animate-pulse': isLoading }"
    :option="isLoading ? defaultOption : option"
    autoresize
  />
</template>

<script>
import { use } from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import { PieChart } from "echarts/charts";
import { TooltipComponent, LegendComponent } from "echarts/components";
import { LabelLayout } from "echarts/features";
import VChart from "vue-echarts";
import { computed, nextTick, ref, watchEffect } from "vue";

use([TooltipComponent, LegendComponent, PieChart, CanvasRenderer, LabelLayout]);

export default {
  components: {
    VChart,
  },
  props: {
    seriesData: {
      type: Array,
    },
  },
  setup(props) {
    const isLoading = computed(() => {
      return props.seriesData.length === 0;
    });
    const defaultOption = ref({
      animation: false,
      series: [
        {
          bottom: "0%",
          type: "pie",
          radius: ["42%", "70%"],
          avoidLabelOverlap: true,
          itemStyle: {
            borderRadius: 4,
            borderColor: "#fff",
            borderWidth: 1.5,
            color: "#d1d5db",
          },
          label: {
            show: false,
          },
          data: [
            { value: 1000, name: "" },
            { value: 1000, name: "" },
            { value: 1000, name: "" },
          ],
        },
      ],
    });

    const option = ref({
      tooltip: {
        trigger: "item",
        // formatter(param) {
        //   return `${param.name}: ${param.value}$ / ${param.percent}%`;
        // },
      },
      legend: {
        bottom: "0%",
        left: "center",
      },
      color: [
        "#4338ca", // Indigo
        "#1e40af", // Blue
        "#0369a1", // Sky
        "#0e7490", // Cyan
        "#0d9488", // Teal
        "#eab308", // Yellow
        "#ea580c", // Orange
        "#dc2626", // Red
        "#db2777", // Pink
        "#a21caf", // Fuchsia
        "#6d28d9", // Violet
      ],
      series: [
        {
          bottom: "25%",
          // name: "Portfolio",
          type: "pie",
          radius: ["42%", "70%"],
          avoidLabelOverlap: true,
          itemStyle: {
            borderRadius: 4,
            borderColor: "#fff",
            borderWidth: 1.5,
          },
          label: {
            show: true,
            formatter(param) {
              return param.percent + "%";
            },
          },
          labelLine: {
            length: 5,
            length2: 5,
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 14,
              fontWeight: "bold",
            },
          },
          data: null,
        },
      ],
    });

    watchEffect(async () => initPieChart());

    function initPieChart() {
      if (props.seriesData.length === 0) return;

      nextTick().then(() => setItemStyle());
      setSeriesData(props.seriesData);
      setPosition("5%");

      if (props.seriesData.length <= 4) {
        setLabel();
        setPosition("0%");
      }
    }
    function setSeriesData(seriesData) {
      option.value.series[0].data = seriesData;
    }

    function setItemStyle() {
      option.value.series[0].itemStyle.color = null;
    }

    function setPosition(fromBottom) {
      option.value.series[0].bottom = fromBottom;
    }

    function setLabel() {
      option.value.series[0].label.position = "inside";
      option.value.series[0].label.lineHeight = 15;
      option.value.series[0].label.color = "#efefef";
      option.value.series[0].label.textBorderColor = "#3730a3";
      option.value.series[0].label.textBorderWidth = 2;
      option.value.series[0].label.textBorderType = "solid";
      option.value.series[0].label.formatter = (param) => {
        return param.name + "\n" + param.percent + "%";
      };
    }

    return { option, defaultOption, isLoading };
  },
};
</script>