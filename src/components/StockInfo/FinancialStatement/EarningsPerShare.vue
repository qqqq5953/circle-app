<template>
  <section>
    <h2 class="text-2xl">Earnings per share</h2>
    <BarChart :xAxisData="epsQuarterlyDate" :seriesData="epsQuarterly" />
  </section>
</template>

<script>
import BarChart from "@/components/Charts/BarChart.vue";
import { ref } from "vue";

export default {
  components: { BarChart },
  props: {
    financialData: Object,
  },
  setup(props) {
    const epsQuarterlyDate = ref(null);
    const epsQuarterly = ref(null);
    const { earnings } = props.financialData;

    epsQuarterly.value = getEPS(earnings);
    epsQuarterlyDate.value = getDate(earnings);

    function getEPS(earnings) {
      const { earningsChart } = earnings;
      const { currentQuarterEstimate, quarterly } = earningsChart;

      const estimateEPS = {
        value: currentQuarterEstimate,
        itemStyle: {
          color: "#bfdbfe",
          borderType: "dashed",
        },
        label: {
          show: true,
          position: "top",
        },
      };

      const quarterlyEPS = [...quarterly.map((item) => item.actual)];

      if (currentQuarterEstimate) {
        quarterlyEPS.push(estimateEPS);
      }

      const barSeries1 = {
        name: "EPS",
        data: quarterlyEPS,
        type: "bar",
        itemStyle: {
          color: "#3b82f6",
          borderRadius: [3, 3, 0, 0],
        },
        barWidth: 22,
        emphasis: {
          itemStyle: {
            color: "#1d4ed8",
            borderType: "dashed",
          },
          focus: "series",
          blurScope: "coordinateSystem",
        },
      };

      return [barSeries1];
    }

    function getDate(earnings) {
      const { earningsChart } = earnings;
      const {
        currentQuarterEstimateDate,
        currentQuarterEstimateYear,
        currentQuarterEstimate,
      } = earningsChart;

      const currentQuarterEstimateFullDate =
        currentQuarterEstimateDate + currentQuarterEstimateYear + "(e)";
      const currentQuarterDate = earningsChart.quarterly.map(
        (item) => item.date
      );

      return currentQuarterEstimate
        ? [...currentQuarterDate, currentQuarterEstimateFullDate]
        : currentQuarterDate;
    }

    return {
      epsQuarterly,
      epsQuarterlyDate,
    };
  },
};
</script>