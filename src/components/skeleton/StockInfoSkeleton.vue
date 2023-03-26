<template>
  <div class="flex flex-col gap-4 mx-auto w-full animate-pulse">
    <header class="w-full">
      <h2 class="w-1/3 lg:w-28 h-6 md:h-8 bg-gray-300 rounded mb-3"></h2>
      <div
        class="flex flex-col md:flex-row md:items-center gap-1.5 md:gap-5 border-t py-2.5 md:pt-4"
      >
        <!-- price -->
        <span class="w-1/3 lg:w-28 h-9 bg-gray-300 rounded"></span>
        <!-- change -->
        <div class="flex items-center gap-3 pt-1 md:pt-0">
          <span
            class="w-16 h-7 bg-gray-300 rounded"
            v-for="item in 2"
            :key="item"
          ></span>
        </div>
      </div>
      <!-- time -->
      <div class="flex flex-col gap-2">
        <span
          class="w-full md:w-1/2 h-3 bg-gray-300 rounded"
          v-for="item in 2"
          :key="item"
        ></span>
      </div>
    </header>

    <main class="grid gap-4 lg:gap-4 lg:grid-cols-3">
      <!-- priceTrend -->
      <div class="pb-5 lg:col-start-1 lg:col-end-4 xl:col-end-3">
        <div class="relative w-full">
          <!-- tabs -->
          <div class="absolute top-0 w-full">
            <div class="flex gap-x-1.5 md:gap-x-5 md:justify-start pb-4">
              <span
                class="w-12 h-7 bg-gray-300 rounded shrink-0"
                v-for="item in 6"
                :key="item"
              ></span>
            </div>
          </div>

          <div class="relative top-11 w-1/3 lg:w-28 h-7"></div>

          <!-- line chart -->
          <div class="h-60 bg-gray-300 rounded relative top-2 w-full"></div>
        </div>
      </div>

      <!-- SummaryDetail -->
      <div class="lg:col-start-3 lg:row-start-2 lg:row-end-3 xl:row-start-1">
        <section class="border rounded p-3">
          <div class="flex flex-wrap gap-1 my-2">
            <span
              class="rounded-full border px-3 py-1 h-7 w-1/6 bg-slate-100"
              v-for="item in 3"
              :key="item"
            ></span>
          </div>
          <ul>
            <li
              class="flex items-center justify-between py-3 border-b"
              v-for="item in 6"
              :key="item"
            >
              <span class="w-1/4 h-3 bg-gray-300 rounded"></span>
              <span class="w-1/4 h-3 bg-gray-300 rounded"></span>
            </li>
          </ul>
        </section>
      </div>

      <div
        class="rounded bg-gray-300 p-3 flex flex-col gap-8 h-72 lg:h-auto lg:col-start-1 lg:col-end-3 lg:row-start-2 lg:row-end-4 xl:row-start-2 xl:row-end-4"
      ></div>

      <!-- Profile -->
      <div class="lg:col-start-3 lg:row-start-3 lg:row-end-4">
        <section class="border rounded p-3">
          <h2 class="mb-2 w-1/2 h-3 bg-gray-300 rounded"></h2>
          <ul>
            <li class="pb-3 border-b">
              <div class="flex justify-between items-center">
                <h3 class="mb-2 w-1/2 h-3 bg-gray-300 rounded"></h3>
                <span class="text-slate-600">
                  <i class="fa-solid fa-chevron-down"></i>
                </span>
              </div>

              <div class="flex flex-col gap-3 pt-2">
                <p
                  class="w-full h-3 bg-gray-300 rounded"
                  v-for="item in 4"
                  :key="item"
                ></p>
              </div>
            </li>
            <li
              class="flex items-center justify-between py-2 border-b last:border-0"
              v-for="item in 3"
              :key="item"
            >
              <span class="w-1/4 h-3 bg-gray-300 rounded"></span>
              <span class="w-1/4 h-3 bg-gray-300 rounded"></span>
            </li>
          </ul>
        </section>
      </div>
    </main>
  </div>
</template>