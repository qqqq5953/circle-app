<template>
  <div class="overflow-hidden h-8">
    <div
      class="
        flex
        gap-x-1.5
        md:gap-x-5
        overflow-x-auto
        pb-4
        text-sm
        md:justify-start
      "
      :class="{ 'justify-between': isJustifyBetween }"
    >
      <button
        class="relative pt-1.5 pb-2 rounded shrink-0 text-xs font-medium"
        :class="[width, currentTab === tab ? clickTabStyle : unclickTabStyle]"
        :style="[maxWidth]"
        v-for="tab in tabs"
        :key="tab"
        @click="switchTab(tab)"
      >
        {{ tab }}
      </button>
    </div>
  </div>
</template>

<script>
import { computed, ref } from "vue";

export default {
  props: {
    tabs: Array,
    currentTabProps: String,
    width: String,
    maxWidth: String,
    isJustifyBetween: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["switchTab"],
  setup(props, { emit }) {
    const currentTab = ref(props.currentTabProps);

    const clickTabStyle = computed(() => {
      return "after:absolute after:inset-x-0 after:bottom-0 after:h-1 after:bg-blue-500 after:rounded-b-lg text-blue-500 bg-blue-50";
    });
    const unclickTabStyle = computed(() => {
      return "text-slate-500";
    });

    function switchTab(tab) {
      currentTab.value = tab;
      emit("switchTab", currentTab.value);
    }

    return {
      currentTab,
      clickTabStyle,
      unclickTabStyle,
      switchTab,
    };
  },
};
</script>

