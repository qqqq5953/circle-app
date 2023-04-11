<template>
  <div
    class="flex flex-col flex-auto gap-y-4 p-4 rounded shadow-lg bg-white relative"
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
