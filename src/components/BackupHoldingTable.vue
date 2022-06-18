<template>
  <div class="flex flex-col break-words w-full mb-6 shadow-lg rounded bg-white">
    <!-- head -->
    <div class="rounded-t px-4 py-3 border-0 flex flex-wrap items-center">
      <div class="w-full px-1 max-w-full flex-1">
        <slot name="table-title"></slot>
      </div>
      <slot name="see-all-btn"></slot>
    </div>

    <!-- body -->
    <div class="block w-full overflow-x-auto">
      <table class="w-full border-collapse">
        <thead
          class="bg-gray-100 border-t border-b hidden sm:table-header-group"
        >
          <tr>
            <th
              class="px-6 py-3 text-blueGray-500 align-middle text-xs uppercase font-semibold text-center md:text-left"
            >
              Stocks
            </th>
            <th
              class="px-4 md:px-0 py-3 text-blueGray-500 align-middle text-xs uppercase font-semibold text-center md:text-right"
            >
              P / L%
            </th>
            <th
              class="px-0 py-3 text-blueGray-500 align-middle text-xs uppercase font-semibold text-center md:text-right"
            >
              P / L
            </th>
            <slot name="thead-price"></slot>
            <th
              class="px-4 py-3 text-blueGray-500 align-middle text-xs uppercase font-semibold text-center md:text-right"
            >
              Avg. Cost
            </th>
            <th
              class="px-4 py-3 text-blueGray-500 align-middle text-xs uppercase font-semibold text-center md:text-right"
            >
              Shares
            </th>
            <th class=""></th>
          </tr>
        </thead>
        <tbody>
          <tr class="flex flex-col sm:table-row mx-2 mb-3 rounded">
            <th
              class="border-t-0 border-x-0 py-3 px-6 text-xs whitespace-nowrap text-center md:text-left"
            >
              <span class="mx-auto">argon</span>
            </th>
            <td
              class="border-t-0 border-x-0 py-3 px-0 text-xs whitespace-nowrap flex items-center sm:table-cell"
            >
              <span class="sm:hidden font-semibold mr-2">P / L%:</span>
              <div class="ml-auto text-center md:text-right">
                <i class="fas fa-arrow-up mr-1"></i>
                <span>46,53%</span>
              </div>
            </td>
            <td
              class="border-t-0 border-x-0 py-3 px-4 text-xs whitespace-nowrap flex items-center sm:table-cell"
            >
              <span class="sm:hidden font-semibold mr-2">P / L:</span>
              <p class="ml-auto text-center">argon</p>
            </td>
            <slot name="tbody-price"></slot>
            <td
              class="border-t-0 border-x-0 py-3 px-4 text-xs whitespace-nowrap flex items-center sm:table-cell"
            >
              <span class="sm:hidden font-semibold mr-2">Avg. Cost:</span>
              <p class="ml-auto text-center">13,000</p>
            </td>
            <td
              class="border-t-0 border-x-0 py-3 px-4 text-xs whitespace-nowrap flex items-center sm:table-cell"
            >
              <span class="sm:hidden font-semibold mr-2">Share:</span>
              <p class="ml-auto text-center">1,200</p>
            </td>
            <td
              class="border-t-0 border-x-0 py-3 px-4 text-xs whitespace-nowrap flex items-center text-center sm:table-cell"
            >
              <button
                type="button"
                class="border border-blue-900 rounded px-2 py-1 hover:bg-blue-900 hover:text-white"
              >
                Trade
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
