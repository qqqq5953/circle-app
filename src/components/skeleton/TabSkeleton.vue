<template>
  <nav class="flex gap-2.5 lg:overflow-x-auto lg:max-w-[73%] animate-pulse">
    <div
      class="
        bg-gray-200
        opacity-70
        border
        rounded
        p-2
        w-24
        relative
        shrink-0
        text-center
      "
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