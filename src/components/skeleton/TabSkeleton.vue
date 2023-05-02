<template>
  <nav class="overflow-y-hidden h-16 lg:hidden">
    <div class="flex gap-2.5 text-sm overflow-x-auto py-6 animate-pulse">
      <button
        class="flex items-center bg-gray-200 opacity-70 border rounded p-2 min-w-[150px] relative shrink-0"
        :class="{
          'after:absolute after:inset-x-0 after:bottom-0 after:h-1 after:bg-indigo-500 after:rounded-b-lg':
            currentTab === tab.name,
        }"
        v-for="tab in tabs"
        :key="tab.name"
      >
        <i class="fa-solid fa-list-ul mr-2.5 bg-gray-300 rounded p-1"></i>
        <span>{{ tab.name }}</span>
        <span class="ml-auto text-slate-500 text-xs">{{ tab.listLength }}</span>
      </button>
    </div>
  </nav>

  <nav
    class="text-sm hidden lg:flex lg:items-center lg:h-14 lg:overflow-y-hidden"
  >
    <div
      class="flex gap-2.5 overflow-x-auto max-w-[85%] pt-10 pb-6 animate-pulse"
    >
      <div
        class="flex items-center bg-gray-200 opacity-70 border rounded p-2 min-w-[150px] relative shrink-0"
        :class="{
          'after:absolute after:inset-x-0 after:bottom-0 after:h-1 after:bg-indigo-500 after:rounded-b-lg':
            currentTab === tab.name,
        }"
        v-for="tab in tabs"
        :key="tab.name"
      >
        <i class="fa-solid fa-list-ul mr-2.5 bg-gray-300 rounded p-1"></i>
        <span>{{ tab.name }}</span>
        <span class="ml-auto text-slate-500 text-xs">{{ tab.listLength }}</span>
      </div>
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