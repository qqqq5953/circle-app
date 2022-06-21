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
      animate-pulse
    "
  >
    <!-- head -->
    <div
      class="
        rounded-t
        px-4
        py-3
        border-0
        flex flex-wrap
        items-center
        hidden
        md:flex
        lg:hidden
      "
    ></div>

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
              Price
            </th>
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
            <th class="px-4 py-3 md:hidden lg:block"></th>
          </tr>
        </thead>
        <tbody>
          <tr
            class="flex flex-col sm:table-row mx-2 mb-3 rounded"
            v-for="i in 5"
            :key="i"
          >
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
              <p class="w-full h-3 bg-gray-300 rounded"></p>
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
              <p class="w-full h-3 bg-gray-300 rounded"></p>
            </td>
            <!-- Price -->
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
              <span class="sm:hidden font-semibold mr-2">Price:</span>
              <p class="w-full h-3 bg-gray-300 rounded"></p>
            </td>
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
              <p class="w-full h-3 bg-gray-300 rounded"></p>
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
              <p class="w-full h-3 bg-gray-300 rounded"></p>
            </td>
            <td
              class="
                px-4
                pt-5
                pb-0
                md:hidden
                lg:block
                text-xs
                block
                sm:table-cell
              "
            >
              <p class="w-full h-5 bg-gray-300 rounded"></p>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>