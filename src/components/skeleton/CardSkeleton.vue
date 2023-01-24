<template>
  <div
    class="
      flex flex-col flex-auto
      break-words
      bg-white
      rounded
      p-4
      mb-6
      xl:mb-0
      shadow-lg
      border border-gray-100
      animate-pulse
    "
    v-for="i in 1"
    :key="i"
  >
    <div class="card-header flex flex-wrap mb-3">
      <div class="flex-1">
        <p class="rounded bg-gray-300 w-full h-4 mb-3"></p>
        <p class="rounded bg-gray-300 w-full h-4"></p>
      </div>
      <div
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
          bg-red-500
        "
      ></div>
    </div>
    <div class="card-body">
      <p class="rounded bg-gray-300 w-full h-3 mb-3"></p>
      <p class="rounded bg-gray-300 w-full h-3 mb-3"></p>
    </div>
  </div>
</template>