<template>
  <nav class="overflow-y-hidden h-16 lg:hidden">
    <div class="flex gap-2.5 text-sm overflow-x-auto py-6 animate-pulse">
      <button
        class="
          bg-gray-200
          opacity-70
          border
          rounded
          p-2
          min-w-[96px]
          relative
          shrink-0
          text-center
        "
        :class="{
          'after:absolute after:inset-x-0 after:bottom-0 after:h-1 after:bg-blue-500 after:rounded-b-lg':
            currentTab === tab,
        }"
        v-for="tab in tabs"
        :key="tab"
      >
        {{ tab }}
      </button>
      <button class="shrink-0 text-blue-600 p-2 ml-3">+ Create</button>
    </div>
  </nav>

  <nav
    class="
      text-sm
      hidden
      lg:flex lg:justify-between lg:items-center lg:h-14 lg:overflow-y-hidden
    "
  >
    <div class="flex gap-2.5 overflow-x-auto max-w-[85%] py-6 animate-pulse">
      <div
        class="
          bg-gray-200
          opacity-70
          border
          rounded
          p-2
          min-w-[96px]
          relative
          shrink-0
          text-center
        "
        :class="{
          'after:absolute after:inset-x-0 after:bottom-0 after:h-1 after:bg-blue-500 after:rounded-b-lg':
            currentTab === tab,
        }"
        v-for="tab in tabs"
        :key="tab"
      >
        {{ tab }}
      </div>
    </div>
  </nav>

  <!-- <nav class="overflow-y-hidden h-14 lg:max-w-[85%] text-sm">
    <div class="flex gap-2.5 overflow-x-auto animate-pulse py-6">
      <div
        class="
          bg-gray-200
          opacity-70
          border
          rounded
          p-2
          min-w-[96px]
          relative
          shrink-0
          text-center
        "
        :class="{
          'after:absolute after:inset-x-0 after:bottom-0 after:h-1 after:bg-blue-500 after:rounded-b-lg':
            currentTab === tab,
        }"
        v-for="tab in tabs"
        :key="tab"
      >
        {{ tab }}
      </div>
    </div>
  </nav> -->
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