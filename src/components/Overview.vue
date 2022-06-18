<template>
  <div class="flex flex-wrap">
    <!-- Rate of Return Since last month-->
    <div class="w-full lg:w-6/12 xl:w-3/12 px-4 md:px-0 lg:px-4">
      <div
        class="flex flex-col flex-auto break-words bg-white rounded p-4 mb-6 xl:mb-0 shadow-lg"
      >
        <div class="flex flex-wrap">
          <div class="relative w-full pr-4 max-w-full flex-1">
            <h5 class="text-blueGray-400 uppercase font-bold text-xs">
              Total Return
            </h5>
            <span class="font-semibold text-xl text-blueGray-700"> 5% </span>
          </div>
          <div
            class="text-white ml-4 p-3 text-center inline-flex items-center justify-center w-12 h-12 shadow-lg rounded-full bg-gray-400"
          >
            <i class="fas fa-chart-line"></i>
          </div>
        </div>
        <p class="flex text-sm text-blueGray-400 mt-4">
          <span class="flex-shrink-0 text-emerald-500 mr-2">
            <i class="fas fa-arrow-up"></i> 1.48%
          </span>
          <span class="whitespace-nowrap"> Since last month </span>
        </p>
      </div>
    </div>
    <!-- Profit & Loss-->
    <div class="w-full lg:w-6/12 xl:w-3/12 px-4 md:px-0 lg:px-4">
      <div
        class="flex flex-col flex-auto break-words bg-white rounded p-4 mb-6 xl:mb-0 shadow-lg"
      >
        <div class="flex flex-wrap">
          <div class="relative w-full pr-4 max-w-full flex-1">
            <h5 class="text-blueGray-400 uppercase font-bold text-xs">
              Profit / Loss
            </h5>
            <span class="font-semibold text-xl text-blueGray-700"> 5% </span>
          </div>
          <div
            class="text-white ml-4 p-3 text-center inline-flex items-center justify-center w-12 h-12 shadow-lg rounded-full bg-gray-500"
          >
            <i class="fas fa-chart-line"></i>
          </div>
        </div>
        <p class="flex text-sm text-blueGray-400 mt-4">
          <span class="flex-shrink-0 text-emerald-500 mr-2">
            <i class="fas fa-arrow-up"></i> 1.48%
          </span>
          <span> Since last month </span>
        </p>
      </div>
    </div>
    <!-- Market Value -->
    <div class="w-full lg:w-6/12 xl:w-3/12 px-4 md:px-0 lg:px-4">
      <div
        class="flex flex-col flex-auto break-words bg-white rounded p-4 mb-6 xl:mb-0 shadow-lg"
      >
        <div class="flex flex-wrap">
          <div class="relative w-full pr-4 max-w-full flex-1">
            <h5 class="text-blueGray-400 uppercase font-bold text-xs">
              Market Value
            </h5>
            <span class="font-semibold text-xl text-blueGray-700"> 5% </span>
          </div>
          <div
            class="text-white ml-4 p-3 text-center inline-flex items-center justify-center w-12 h-12 shadow-lg rounded-full bg-gray-600"
          >
            <i class="fas fa-chart-line"></i>
          </div>
        </div>
        <p class="flex text-sm text-blueGray-400 mt-4">
          <span class="flex-shrink-0 text-emerald-500 mr-2">
            <i class="fas fa-arrow-up"></i> 1.48%
          </span>
          <span> Since yesterday </span>
        </p>
      </div>
    </div>
    <!-- Total Cost 未確定-->
    <div class="w-full lg:w-6/12 xl:w-3/12 px-4 md:px-0 lg:px-4">
      <div
        class="flex flex-col flex-auto break-words bg-white rounded p-4 mb-6 xl:mb-0 shadow-lg"
      >
        <div class="flex flex-wrap">
          <div class="relative w-full pr-4 max-w-full flex-1">
            <h5 class="text-blueGray-400 uppercase font-bold text-xs">
              Total Cost
            </h5>
            <span class="font-semibold text-xl text-blueGray-700"> 5% </span>
          </div>
          <div
            class="text-white ml-4 p-3 text-center inline-flex items-center justify-center w-12 h-12 shadow-lg rounded-full bg-gray-700"
          >
            <i class="fas fa-chart-line"></i>
          </div>
        </div>
        <p class="flex text-sm text-blueGray-400 mt-4">
          <span class="flex-shrink-0 text-emerald-500 mr-2">
            <i class="fas fa-arrow-up"></i> 1.48%
          </span>
          <span> 未確定 </span>
        </p>
      </div>
    </div>
  </div>
</template>
