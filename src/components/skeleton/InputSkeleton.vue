<template>
  <div class="flex items-start gap-4 animate-pulse">
    <div v-for="item in placeholders" :key="item" class="">
      <input
        class="
          form-input
          block
          px-4
          py-6
          rounded-full
          bg-gray-300
          w-full
          h-8
          mb-3
        "
        :placeholder="item"
      />
    </div>
    <button type="submit" class="form-input rounded-full px-4 py-3 bg-gray-300">
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
