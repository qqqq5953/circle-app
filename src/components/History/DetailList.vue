<template>
  <li
    class="flex items-end gap-x-1"
    v-bind="attrs"
    v-for="(item, index) in content"
    :key="index"
  >
    <span class="w-[22%]">{{ item.ticker }}</span>
    <span class="w-[24%] text-right">${{ item.cost }}</span>
    <span class="w-[15%] text-right">{{ item.shares }}</span>
    <span class="w-[24%] text-right">${{ item.value }}</span>
    <span class="w-[15%] text-right">{{ item.profitOrLossPercentage }} %</span>
    <span class="w-[8%] text-right hidden"></span>
  </li>
</template>

<script>
import { computed } from "vue";
export default {
  props: {
    list: {
      type: Array,
    },
  },
  inheritAttrs: false,
  setup(props, { attrs }) {
    const content = computed(() => {
      if (!props.list) return {};
      return props.list;
    });

    return { content, attrs };
  },
};
</script>