<template>
  <li
    class="flex items-center gap-x-1 border-b last:border-none"
    v-bind="attrs"
    v-for="(item, index) in content"
    :key="index"
  >
    <span class="w-[25%] md:w-[15%]">
      <div class="ticker-badge" :class="item.style">{{ item.ticker }}</div>
    </span>
    <span class="w-[30%] ml-auto text-right md:ml-0">
      <span
        class="px-2 py-1 md:px-3 md:py-2 rounded font-medium break-words"
        :class="
          item.profitOrLossPercentage > 0
            ? 'text-red-600 bg-red-100/70'
            : item.profitOrLossPercentage < 0
            ? 'text-green-700 bg-green-100'
            : 'text-slate-500 bg-slate-200'
        "
      >
        <span v-if="item.profitOrLossPercentage !== 0">
          <i
            class="fas fa-arrow-up mr-px text-red-600"
            v-if="item.profitOrLossPercentage > 0"
          ></i>
          <i
            class="fas fa-arrow-down mr-px text-green-700"
            v-else-if="item.profitOrLossPercentage < 0"
          ></i>
        </span>
        <span v-else>--</span>
        {{
          item.profitOrLossPercentage < 0
            ? item.profitOrLossPercentage * -1
            : item.profitOrLossPercentage
        }}
        %
      </span>
    </span>

    <span class="w-[20%] text-right break-words">{{ item.cost }}</span>
    <span class="w-[20%] md:w-[15%] text-right break-words">{{
      item.shares
    }}</span>
    <span class="hidden md:inline md:w-[20%] text-right break-words">{{
      item.close
    }}</span>
    <span class="hidden md:inline md:w-[20%] text-right break-words">{{
      item.marketValueTWD
    }}</span>
  </li>
</template>

<script>
import { computed } from "vue";
export default {
  props: {
    list: {
      type: Object,
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