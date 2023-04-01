<template>
  <div class="fixed inset-0 z-50 bg-slate-700/60">
    <div
      class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col gap-6 sm:w-2/3 lg:max-w-[600px] sm:h-auto sm:rounded overflow-auto bg-white p-5"
      :class="isFullPage ? 'w-full h-screen' : 'w-5/6 h-auto'"
    >
      <slot name="header"></slot>
      <slot name="body"></slot>
      <slot name="footer"></slot>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    isFullPage: {
      type: Boolean,
      default: false,
    },
  },
};
</script>