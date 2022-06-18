<template>
  <!-- h-full -->
  <div
    class="
      flex flex-col
      break-words
      w-full
      mb-6
      shadow-lg
      rounded
      bg-white
      border border-gray-100
    "
  >
    <!-- head -->
    <div class="rounded-t px-4 py-3 border-0 flex flex-wrap items-center">
      <div class="w-full px-1 max-w-full flex-1">
        <slot name="table-title"></slot>
      </div>
      <slot name="see-all-btn"></slot>
      <slot name="holding-table-btn"></slot>
    </div>

    <!-- body -->
    <div class="block w-full overflow-x-auto pb-5">
      <table class="w-full border-collapse">
        <thead
          class="bg-gray-100 border-t border-b hidden sm:table-header-group"
        >
          <tr>
            <!-- Stocks -->
            <th
              class="
                pl-6
                pr-0
                py-3
                text-blueGray-500
                align-middle
                text-xs
                uppercase
                font-semibold
                text-center
                sm:text-left
              "
            >
              Stocks
            </th>
            <!-- Profit / Loss -->
            <th
              class="
                px-4
                py-3
                text-blueGray-500
                align-middle
                text-xs
                uppercase
                font-semibold
                text-center
                sm:text-right
              "
            >
              Profit / Loss
            </th>
            <!-- Price -->
            <slot name="thead-price"></slot>
            <!-- Avg. Cost -->
            <th
              class="
                px-4
                py-3
                text-blueGray-500
                align-middle
                text-xs
                uppercase
                font-semibold
                text-center
                sm:text-right
              "
            >
              Avg. Cost
            </th>
            <!-- Shares -->
            <th
              class="
                px-4
                py-3
                text-blueGray-500
                align-middle
                text-xs
                uppercase
                font-semibold
                text-center
                sm:text-right
              "
            >
              Shares
            </th>
            <slot name="thead-trade"></slot>
          </tr>
        </thead>
        <tbody>
          <tr class="flex flex-col sm:table-row mx-2 mb-3 rounded">
            <!-- Stocks -->
            <th
              class="
                px-6
                pr-6
                pt-5
                pb-0
                text-xs
                whitespace-nowrap
                text-center
                sm:text-left
              "
            >
              <span class="mx-auto">argon</span>
            </th>
            <!-- Profit / Loss -->
            <td
              class="
                px-4
                pt-5
                pb-0
                border-b border-gray-100
                sm:border-0
                text-xs
                whitespace-nowrap
                flex
                items-center
                sm:table-cell
              "
            >
              <span class="sm:hidden font-semibold mr-2">P / L:</span>
              <div class="ml-auto text-right">
                <i class="fas fa-arrow-up mr-1"></i>
                <span>46,53%</span>
                <p class="mt-0.5">1,230</p>
              </div>
            </td>
            <!-- Price -->
            <slot name="tbody-price"></slot>
            <!-- Avg. Cost -->
            <td
              class="
                px-4
                pt-5
                pb-0
                border-b border-gray-100
                sm:border-0
                text-xs
                whitespace-nowrap
                flex
                items-center
                sm:table-cell
              "
            >
              <span class="sm:hidden font-semibold mr-2">Average Cost:</span>
              <p class="ml-auto text-right">13,000</p>
            </td>
            <!-- Shares -->
            <td
              class="
                px-4
                pt-5
                pb-0
                border-b border-gray-100
                sm:border-0
                text-xs
                whitespace-nowrap
                flex
                items-center
                sm:table-cell
              "
            >
              <span class="sm:hidden font-semibold mr-2">Share:</span>
              <p class="ml-auto text-right">1,200</p>
            </td>
            <slot name="tbody-trade"></slot>
          </tr>
          <!-- <tr class="flex flex-col sm:table-row mx-2 mb-3 rounded">
            <th
              class="
                px-6
                pr-6
                pt-5
                pb-0
                text-xs
                whitespace-nowrap
                text-center
                sm:text-left
              "
            >
              <span class="mx-auto">argon</span>
            </th>
            <td
              class="
                px-4
                pt-5
                pb-0
                border-b border-gray-100
                sm:border-0
                text-xs
                whitespace-nowrap
                flex
                items-center
                sm:table-cell
              "
            >
              <span class="sm:hidden font-semibold mr-2">P / L:</span>
              <div class="ml-auto text-right">
                <i class="fas fa-arrow-up mr-1"></i>
                <span>46,53%</span>
                <p class="mt-0.5">1,230</p>
              </div>
            </td>
            <slot name="tbody-price"></slot>
            <td
              class="
                px-4
                pt-5
                pb-0
                border-b border-gray-100
                sm:border-0
                text-xs
                whitespace-nowrap
                flex
                items-center
                sm:table-cell
              "
            >
              <span class="sm:hidden font-semibold mr-2">Average Cost:</span>
              <p class="ml-auto text-right">13,000</p>
            </td>
            <td
              class="
                px-4
                pt-5
                pb-0
                border-b border-gray-100
                sm:border-0
                text-xs
                whitespace-nowrap
                flex
                items-center
                sm:table-cell
              "
            >
              <span class="sm:hidden font-semibold mr-2">Share:</span>
              <p class="ml-auto text-right">1,200</p>
            </td>
            <slot name="tbody-trade"></slot>
          </tr> -->
        </tbody>
      </table>
    </div>
  </div>
</template>
