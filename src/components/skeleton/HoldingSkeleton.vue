<template>
  <div class="animate-pulse flex flex-col grow space-y-10 w-full">
    <!-- totalStats -->
    <div class="">
      <div class="w-40 h-6 bg-gray-300 rounded"></div>
      <div class="text-right pt-1.5">
        <span class="w-28 h-3 bg-gray-300 rounded-full inline-block"></span>
      </div>
      <ul class="flex flex-wrap -m-1 md:-m-2 pt-1.5">
        <li class="w-1/2 p-1 sm:w-1/4 md:p-2" v-for="i in 4" :key="i">
          <div
            class="flex flex-col items-center justify-center gap-y-2 bg-gray-100 h-12 w-full rounded shadow"
          >
            <div class="bg-gray-300 rounded-full w-2/3 h-3"></div>
            <div class="bg-gray-300 rounded-full w-2/3 h-3"></div>
          </div>
        </li>
      </ul>
    </div>

    <!-- Holdings -->
    <section class="">
      <div class="flex items-center mb-4">
        <div class="w-40 h-6 bg-gray-300 rounded"></div>
        <div class="w-[83px] h-6 bg-gray-300 rounded-full ml-auto"></div>
      </div>

      <!-- table -->
      <div class="shadow-lg rounded bg-white border overflow-x-auto">
        <table class="w-full border-collapse table-fixed">
          <thead
            class="bg-slate-100 text-slate-700 border-b border-t sm:border-t-0 hidden sm:table-header-group"
          >
            <tr>
              <!-- Stocks -->
              <th
                class="pl-6 pr-0 py-3 sm:pr-0 sm:pl-4 align-middle font-semibold text-xs text-left sm:w-1/5 md:w-1/4 lg:w-[30%]"
              >
                Stocks
              </th>
              <!-- Profit / Loss -->
              <th
                class="px-4 py-3 sm:px-0 sm:py-3.5 align-middle text-xs font-semibold text-center sm:w-1/4 md:w-[18%]"
              >
                Profit / Loss
              </th>
              <!-- Price -->
              <th
                class="px-4 py-3 text-blueGray-500 align-middle text-xs font-semibold text-center sm:w-[13%]"
              >
                Price
              </th>
              <!-- Avg. Cost -->
              <th
                class="px-4 py-3 text-blueGray-500 align-middle text-xs font-semibold text-center sm:w-[15%]"
              >
                Avg. Cost
              </th>
              <!-- Shares -->
              <th
                class="px-4 py-3 text-blueGray-500 align-middle text-xs font-semibold text-center sm:w-[13%] lg:w-[10%]"
              >
                Shares
              </th>
              <th
                class="px-4 py-3 sm:w-[14%] md:w-[12%] lg:block lg:w-[12%]"
              ></th>
            </tr>
          </thead>
          <tbody>
            <tr
              class="flex flex-col rounded-t md:rounded-none sm:table-row px-2 pb-3 sm:p-0 border-b border-slate-200 last:border-none"
              v-for="i in 3"
              :key="i"
            >
              <!-- Stocks -->
              <th
                class="px-2 pt-5 pb-0 text-xs sm:pr-0 sm:pl-4 sm:py-3.5 sm:table-cell"
              >
                <div class="flex flex-col gap-y-3">
                  <p class="lg:mx-0 w-[85px] h-6 bg-gray-300 rounded-full"></p>
                  <p class="flex items-center gap-x-1.5">
                    <span
                      class="text-left sm:hidden md:block w-40 h-4 bg-gray-300 rounded"
                    ></span>
                    <span
                      class="shrink-0 inline-block ml-auto mr-2 sm:hidden w-16 h-6 bg-gray-300 rounded"
                    >
                    </span>
                  </p>
                </div>
              </th>
              <!-- Profit / Loss -->
              <td
                class="holdingTable-table-cell border-b flex items-center text-xs sm:table-cell sm:border-0"
              >
                <span class="sm:hidden mr-2 text-slate-600">P / L:</span>
                <div class="ml-auto text-right sm:ml-0 sm:text-center">
                  <div
                    class="hidden sm:inline-block sm:mt-1 w-16 h-4 bg-gray-300 rounded"
                  ></div>
                  <div
                    class="sm:hidden mt-1 w-16 h-4 bg-gray-300 rounded"
                  ></div>
                </div>
              </td>
              <!-- Price -->
              <td
                class="holdingTable-table-cell text-xs border-b flex items-center sm:table-cell sm:border-0"
              >
                <span class="sm:hidden mr-2 text-slate-600">Price:</span>
                <p
                  class="ml-auto sm:mx-auto text-right sm:text-center w-16 h-4 bg-gray-300 rounded"
                ></p>
              </td>
              <!-- Avg. Cost -->
              <td
                class="holdingTable-table-cell text-xs border-b flex items-center sm:table-cell sm:border-0"
              >
                <span class="sm:hidden mr-2 text-slate-600">Average Cost:</span>
                <p
                  class="ml-auto sm:mx-auto text-right sm:text-center w-16 h-4 bg-gray-300 rounded"
                ></p>
              </td>
              <!-- Shares -->
              <td
                class="holdingTable-table-cell text-xs border-b flex items-center sm:table-cell"
              >
                <span class="sm:hidden mr-2 text-slate-600">Share:</span>
                <p
                  class="ml-auto sm:mx-auto text-right sm:text-center w-16 h-4 bg-gray-300 rounded"
                ></p>
              </td>
              <td class="holdingTable-table-cell text-xs block sm:table-cell">
                <div
                  class="flex items-center gap-x-2 py-1 sm:gap-x-3 lg:justify-center"
                >
                  <div
                    class="order-2 sm:hidden w-10 h-6 bg-gray-300 rounded"
                  ></div>
                  <div
                    class="ml-auto order-1 sm:ml-0 w-10 h-6 bg-gray-300 rounded"
                  ></div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>