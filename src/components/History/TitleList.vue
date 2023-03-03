<template>
  <div class="flex items-end gap-x-1 text-slate-500 font-medium" v-bind="attrs">
    <span v-for="item in list" :key="item.name" :class="item.style">{{
      item.name
    }}</span>
  </div>
</template>

<script>
export default {
  inheritAttrs: false,
};
</script>

<script setup>
import { useAttrs } from "vue";

const props = defineProps({
  list: {
    type: Array,
  },
});

const attrs = useAttrs();
</script>