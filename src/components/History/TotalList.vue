<template>
  <div class="flex gap-x-1 relative">
    <span class="w-[22%]">{{ list.date }}</span>
    <span class="w-[24%] text-right">${{ list.totalCost }}</span>
    <span class="w-[15%] text-right">{{ list.totalShares }}</span>
    <span class="w-[24%] text-right">${{ list.totalMarketValue }}</span>
    <span class="w-[15%] text-right"></span>
    <span class="absolute right-2">
      <span>
        <i
          class="fa-solid fa-chevron-up"
          v-if="selectedDate.includes(list.date)"
        ></i>
        <i class="fa-solid fa-chevron-down" v-else></i> </span
    ></span>
  </div>
</template>

<script>
export default {
  props: {
    list: {
      type: Object,
    },
    selectedDate: {
      type: Array,
    },
  },
};
</script>