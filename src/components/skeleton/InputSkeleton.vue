<template>
  <div
    class="
      flex flex-col
      gap-6
      lg:flex-row lg:items-start lg:gap-4
      animate-pulse
    "
  >
    <div v-for="item in placeholders" :key="item" class="">
      <input
        class="
          block
          px-4
          py-6
          rounded-full
          bg-gray-300
          w-full
          h-8
          mb-3
          focus:outline-0
        "
        disabled
        :placeholder="item"
      />
    </div>
    <button type="submit" class="rounded-full px-4 py-3 bg-gray-300" disabled>
      add
    </button>
  </div>
</template>

<script>
import { ref } from "@vue/reactivity";
export default {
  setup() {
    const placeholders = ref(["ticker", "cost", "shares"]);

    return { placeholders };
  },
};
</script>
