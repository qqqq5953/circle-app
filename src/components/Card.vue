<template>
  <div
    class="flex flex-col flex-auto gap-y-4 p-4 border rounded shadow-lg bg-white mb-2.5 xl:mb-0 relative h-full"
  >
    <!-- card-header -->
    <section class="flex flex-col space-y-2">
      <slot name="card-title"></slot>
      <slot name="card-sub-title"></slot>
    </section>
    <!-- card-body -->
    <slot name="card-body"></slot>
    <!-- icon -->
    <slot name="card-icon"></slot>
  </div>
</template>

<script>
import { computed } from "vue";
export default {
  setup() {},
};
</script>
