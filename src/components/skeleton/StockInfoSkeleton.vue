<template>
  <div class="flex flex-col gap-4 px-4 md:p-10 mx-auto w-full animate-pulse">
    <header>
      <h2 class="w-full lg:w-1/6 h-6 bg-gray-300 rounded mb-3"></h2>
      <div class="flex items-center gap-3 border-t pt-3">
        <span
          class="w-1/4 lg:w-1/6 h-8 bg-gray-300 rounded"
          v-for="item in 3"
          :key="item"
        ></span>
      </div>
    </header>

    <main class="flex flex-col lg:flex-row gap-6">
      <div class="lg:w-2/3 h-48 border"></div>

      <aside class="lg:w-1/3 flex flex-col gap-6">
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

        <!-- Profile -->
        <section class="border rounded p-3">
          <h2 class="mb-2">Profile</h2>
          <ul>
            <li class="pb-3 border-b">
              <div class="flex justify-between items-center">
                <h3>Summary</h3>
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
              class="
                flex
                items-center
                justify-between
                py-2
                border-b
                last:border-0
              "
              v-for="item in 3"
              :key="item"
            >
              <span class="w-1/4 h-3 bg-gray-300 rounded"></span>
              <span class="w-1/4 h-3 bg-gray-300 rounded"></span>
            </li>
          </ul>
        </section>
      </aside>
    </main>
  </div>
</template>