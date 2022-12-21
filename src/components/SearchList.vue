<template>
  <div class="rounded" :class="style">
    <TickerInfo :stockLists="searchList" :hasOptionalTd="hasOptionalTd">
      <template #action-btn="{ ticker }">
        <slot name="action-btn" :ticker="`${ticker}`"></slot>
      </template>
    </TickerInfo>

    <div class="px-4 py-3 lg:px-8 lg:py-5" v-show="searchList === undefined">
      <i class="fa-solid fa-circle-exclamation"></i>
      <span class="ml-3">The ticker does not exist</span>
    </div>
  </div>
</template>

<script>
import TickerInfo from "@/components/TickerInfo.vue";

export default {
  components: { TickerInfo },
  props: {
    searchList: {
      type: Array,
      // default() {
      //   return [];
      // },
    },
    style: {
      type: String,
      default: "shadow-lg bg-white",
    },
    hasOptionalTd: {
      type: Boolean,
      default: false,
    },
  },
};
</script>