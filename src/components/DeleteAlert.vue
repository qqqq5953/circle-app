<template>
  <BaseAlert>
    <template #header>
      <h2 class="text-xl lg:text-2xl break-words">
        <slot name="title"></slot>
      </h2>
    </template>
    <template #body>
      <p class="text-slate-500 font-light">
        <slot name="content"></slot>
      </p>
    </template>
    <template #footer>
      <div class="text-right">
        <button class="text-blue-600 px-2 py-1.5 mr-2" @click="closeFunc">
          Close
        </button>
        <button
          class="border rounded px-2 py-1.5 bg-blue-600 text-white"
          @click="confirmFunc"
        >
          Delete
        </button>
      </div>
    </template>
  </BaseAlert>
</template>

<script>
import BaseAlert from "@/components/BaseAlert.vue";

export default {
  components: { BaseAlert },
  props: {
    confirmFunc: Function,
    closeFunc: Function,
  },
  setup() {},
};
</script>