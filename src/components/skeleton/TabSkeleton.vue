<template>
  <nav class="flex gap-2.5 xl:overflow-x-auto animate-pulse">
    <div
      class="relative rounded bg-gray-200 opacity-70 p-2 w-24 text-center"
      :class="{
        'after:absolute after:inset-x-0 after:bottom-0 after:h-1 after:bg-blue-500':
          currentTab === tab,
      }"
      v-for="tab in tabs"
      :key="tab"
    >
      {{ tab }}
    </div>
  </nav>
</template>

<script>
export default {
  props: {
    tabs: {
      type: Array,
    },
    currentTab: {
      type: String,
    },
  },
};
</script>