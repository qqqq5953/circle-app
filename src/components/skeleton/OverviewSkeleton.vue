<template>
  <div class="animate-pulse flex flex-col grow space-y-10 w-full">
    <div class="flex flex-col gap-y-10 lg:flex-row lg:justify-between">
      <!-- Pie chart -->
      <div
        class="relative grid place-items-center mb-5 -mx-6 h-72 lg:mx-0 lg:w-1/2"
      >
        <div
          class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-60 w-60 bg-gray-300 rounded-full"
        ></div>
        <div
          class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-40 w-40 bg-white rounded-full"
        ></div>
      </div>

      <!-- totalStats -->
      <div class="lg:w-1/2">
        <div class="text-right pt-1.5">
          <span class="w-28 h-3 bg-gray-300 rounded-full inline-block"></span>
        </div>
        <ul class="flex flex-wrap -m-1 md:-m-2 pt-1.5">
          <li
            class="w-1/2 p-1.5 sm:w-1/4 md:p-2 lg:w-1/2"
            v-for="i in 4"
            :key="i"
          >
            <div
              class="flex flex-col items-center justify-center gap-y-3 bg-gray-100 h-16 w-full rounded shadow p-2 md:p-3"
            >
              <div class="bg-gray-300 rounded-full w-2/3 h-3"></div>
              <div class="bg-gray-300 rounded-full w-2/3 h-3"></div>
            </div>
          </li>
        </ul>
      </div>
    </div>

    <!-- CardSkeleton -->
    <div>
      <div class="w-40 h-6 bg-gray-300 rounded mb-4"></div>
      <div class="flex flex-col gap-y-6 sm:gap-y-0 sm:flex-row sm:gap-x-3">
        <CardSkeleton />
      </div>
    </div>

    <!-- Holdings -->
    <div>
      <div class="flex justify-between pt-1.5">
        <span class="w-40 h-6 bg-gray-300 rounded mb-4"></span>
        <span class="w-16 h-6 bg-gray-300 rounded inline-block"></span>
      </div>
      <ListSkeleton :tableBody="{ tr: 3, th: 1, td: 3 }" />
    </div>
  </div>
</template>

<script>
import CardSkeleton from "@/components/skeleton/CardSkeleton.vue";
import ListSkeleton from "@/components/skeleton/ListSkeleton.vue";
export default {
  components: { CardSkeleton, ListSkeleton },
  setup() {},
};
</script>