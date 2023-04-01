<template>
  <div class="absolute flex space-x-2">
    <small
      class="text-red-500"
      v-for="(error, index) in errorDisplay"
      :key="index"
      >{{ error }}</small
    >
  </div>
</template>

<script>
import { computed } from "vue";
export default {
  props: ["errors"],
  setup(props) {
    const errorDisplay = computed(() => {
      return props.errors.filter((error) => error);
    });

    return {
      errorDisplay,
    };
  },
};
</script>