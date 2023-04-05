<template>
  <section>
    <h2 class="text-2xl mb-2">Revenue and Earnings</h2>
    <Tabs
      :tabs="tabs_Earnings"
      :currentTabProps="currentTab_Earnings"
      width="w-1/4"
      max-width="max-width:96px"
      @switchTab="(val) => (currentTab_Earnings = val)"
    />
    <component :is="currentTab_Earnings" v-bind="barData"></component>
  </section>
</template>

<script>
import { ref, computed } from "vue";
import Tabs from "@/components/Tabs.vue";
import Quarterly from "@/components/Charts/BarChart.vue";
import Yearly from "@/components/Charts/BarChart.vue";

export default {
  components: { Tabs, Quarterly, Yearly },
  props: {
    earnings: Object,
  },
  setup(props) {
    function getEarningsAndRevenue(frequency = "quarterly") {
      const BILLION = 1000000000;
      const { financialsChart } = props.earnings;

      const earnings = financialsChart[frequency].map((item) =>
        parseFloat((item.earnings / BILLION).toFixed(2))
      );
      const revenue = financialsChart[frequency].map((item) =>
        parseFloat((item.revenue / BILLION).toFixed(2))
      );

      const barSeries1 = {
        name: "Revenue",
        data: revenue,
        type: "bar",
        itemStyle: {
          color: "#3b82f6",
          borderRadius: [3, 3, 0, 0],
        },
        barWidth: 22,
        emphasis: {
          itemStyle: {
            color: "#1d4ed8",
          },
          focus: "series",
          blurScope: "coordinateSystem",
        },
      };

      const barSeries2 = {
        name: "Earnings",
        data: earnings,
        type: "bar",
        itemStyle: {
          color: "#fbbf24",
          borderRadius: [3, 3, 0, 0],
        },
        barWidth: 22,
        emphasis: {
          itemStyle: {
            color: "#f59e0b",
          },
          focus: "series",
          blurScope: "coordinateSystem",
        },
      };

      return [barSeries1, barSeries2];
    }

    function getDate(frequency = "quarterly") {
      const { financialsChart } = props.earnings;
      return financialsChart[frequency].map((item) => item.date);
    }

    function getBarChartData(frequency) {
      return {
        xAxisData: getDate(frequency),
        seriesData: getEarningsAndRevenue(frequency),
      };
    }

    const tabs_Earnings = ref(["Quarterly", "Yearly"]);
    const currentTab_Earnings = ref("Quarterly");
    const barData = computed(() => {
      if (!props.earnings) return;

      if (currentTab_Earnings.value === "Quarterly") {
        return getBarChartData("quarterly");
      } else if (currentTab_Earnings.value === "Yearly") {
        return getBarChartData("yearly");
      }
    });

    return {
      tabs_Earnings,
      currentTab_Earnings,
      barData,
    };
  },
};
</script>