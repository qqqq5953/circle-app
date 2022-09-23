<template>
  <div class="fixed inset-0 z-20 bg-slate-700/60">
    <div
      class="
        absolute
        top-1/2
        left-1/2
        -translate-x-1/2 -translate-y-1/2
        bg-white
        rounded
        p-5
        flex flex-wrap flex-col
        gap-4
        w-5/6
        md:w-1/2
        lg:w-1/3 lg:max-w-[33%]
      "
    >
      <slot name="header"></slot>
      <slot name="body"></slot>
      <slot name="footer"></slot>
    </div>
  </div>
</template>

<script>
export default {};
</script>