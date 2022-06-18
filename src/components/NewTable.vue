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
            v-for="item in quote"
            :key="item"
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
              <span class="mx-auto">{{ item.symbol }}</span>
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
                <span
                  class="inline-block px-2 py-1 rounded"
                  :class="
                    item.profitOrLossPercentage > 0
                      ? 'text-green-700 bg-green-100'
                      : 'text-red-700 bg-red-100'
                  "
                >
                  <span v-if="item.profitOrLossPercentage !== 0">
                    <i
                      class="fas fa-arrow-up mr-1 text-green-700"
                      v-if="item.profitOrLossPercentage > 0"
                    ></i>
                    <i class="fas fa-arrow-down mr-1 text-red-700" v-else></i>
                  </span>
                  {{ item.profitOrLossPercentage }} %
                </span>
                <p class="mt-1">
                  {{ item.profitOrLossValue }}
                </p>
              </div>
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
              <p class="ml-auto text-right">{{ item.close }}</p>
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
              <p class="ml-auto text-right">
                {{ item.averageCost }}
              </p>
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
              <p class="ml-auto text-right">{{ item.totalShares }}</p>
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
              <button
                type="button"
                class="
                  border border-blue-900
                  rounded
                  px-2
                  py-1
                  hover:bg-blue-900 hover:text-white
                  ml-auto
                  block
                "
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

<script>
export default {
  props: ["quote"],
};
</script>
