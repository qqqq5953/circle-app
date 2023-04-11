<template>
  <div
    class="flex flex-col flex-auto p-4 rounded shadow-lg bg-white animate-pulse relative sm:w-1/3"
    v-for="i in 3"
    :key="i"
  >
    <div class="card-header flex flex-wrap mb-2">
      <div class="flex-1">
        <p class="rounded bg-gray-300 w-full h-4 mb-3"></p>
        <p class="rounded bg-gray-300 w-full h-4"></p>
      </div>
      <!-- <div
        class="
          text-white text-center
          inline-flex
          items-center
          justify-center
          w-12
          h-12
          ml-3
          shadow-lg
          rounded-full
          bg-slate-200
        "
      ></div> -->
    </div>
    <!-- <div class="card-body">
      <p class="rounded bg-gray-300 w-full h-3 mb-3"></p>
      <p class="rounded bg-gray-300 w-full h-3 mb-3"></p>
    </div> -->
  </div>
</template>