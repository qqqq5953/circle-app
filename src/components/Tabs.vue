<template>
  <div class="flex gap-2 text-sm">
    <button
      class="relative py-2 rounded w-16 shrink-0"
      v-for="tab in tabs"
      :key="tab"
      @click="switchTab(tab)"
      :class="{
        'after:absolute after:inset-x-0 after:bottom-0 after:h-1 after:bg-blue-500 after:rounded-b-lg text-blue-500':
          currentTab === tab,
        'text-slate-700': currentTab !== tab,
      }"
    >
      {{ tab }}
    </button>
  </div>

  <!-- <component :is="currentTab" v-bind="barData"></component> -->
</template>

<script>
import { ref } from "vue";

export default {
  props: {
    tabs: Array,
    currentTabProps: String,
  },
  emits: ["switchTab"],
  setup(props, { emit }) {
    const currentTab = ref(props.currentTabProps);

    function switchTab(tab) {
      currentTab.value = tab;
      emit("switchTab", currentTab.value);
    }

    return {
      currentTab,
      switchTab,
    };
  },
};
</script>