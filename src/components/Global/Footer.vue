<template>
  <footer class="relative bg-slate-100/50 pt-8 pb-6">
    <div
      class="bottom-auto top-0 left-0 right-0 w-full absolute pointer-events-none overflow-hidden -mt-20"
      style="height: 80px"
    >
      <svg
        class="absolute bottom-0 overflow-hidden"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
        version="1.1"
        viewBox="0 0 2560 100"
        x="0"
        y="0"
      >
        <polygon
          class="text-slate-100/50 fill-current"
          points="2560 0 2560 100 0 100"
        ></polygon>
      </svg>
    </div>
    <section class="container mx-auto px-6 md:px-16">
      <div class="">
        <h4 class="text-3xl font-semibold">Circle</h4>
        <p class="text-gray-600 pt-2 pb-8">
          Simplifies investment management by providing an intuitive platform to
          create diversified portfolios and track market trends.
        </p>

        <div class="flex">
          <div class="w-1/2">
            <h5 class="font-semibold pb-3">Company</h5>
            <ul class="space-y-3 text-gray-600">
              <li>
                <router-link :to="{ name: 'About' }">About</router-link>
              </li>
              <li>
                <router-link :to="{ name: 'Solution' }">Solution</router-link>
              </li>
            </ul>
          </div>

          <div class="w-1/2">
            <h5 class="font-semibold pb-3">Social media</h5>
            <ul class="space-y-3 text-gray-600">
              <li>
                <button
                  class="bg-white text-blue-400 shadow-lg h-10 w-10 grid place-items-center rounded-full"
                  type="button"
                >
                  <i class="flex fab fa-twitter"></i>
                </button>
              </li>
              <li>
                <button
                  class="bg-white text-blue-600 shadow-lg h-10 w-10 grid place-items-center rounded-full"
                  type="button"
                >
                  <i class="flex fab fa-facebook-square"></i>
                </button>
              </li>
              <li>
                <button
                  class="bg-white text-blue-400 shadow-lg h-10 w-10 grid place-items-center rounded-full"
                  type="button"
                >
                  <i class="flex fab fa-telegram"></i>
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <hr class="my-6 border-gray-400" />
      <div
        class="flex flex-wrap items-center md:justify-between justify-center"
      >
        <div class="w-full md:w-4/12 px-4 mx-auto text-center">
          <div class="text-xs text-gray-600 py-1">
            Copyright © 2023 Circle
            <span>Andy Hsieh</span>
          </div>
        </div>
      </div>
    </section>
  </footer>
</template>
