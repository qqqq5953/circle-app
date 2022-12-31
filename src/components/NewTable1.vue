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
    <div
      class="
        rounded-t
        px-4
        py-3
        border-0
        flex flex-wrap
        items-center
        md:flex
        lg:hidden
      "
    >
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
                sm:pr-0 sm:pl-4
                align-middle
                uppercase
                font-semibold
                text-xs text-center
                sm:w-1/5
              "
            >
              Stocks
            </th>
            <!-- Profit / Loss -->
            <th
              class="
                px-4
                py-3
                sm:px-0 sm:py-3.5
                align-middle
                text-xs
                uppercase
                font-semibold
                text-center
                sm:w-1/4
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
                sm:w-[13%]
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
                sm:w-[15%]
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
                sm:w-[13%]
              "
            >
              Shares
            </th>
            <th class="px-4 py-3 md:hidden lg:block sm:w-[14%]"></th>
          </tr>
        </thead>
        <tbody>
          <tr
            class="flex flex-col sm:table-row mx-2 mb-3 sm:m-0 rounded border"
            v-for="item in holdingsTotalInfo"
            :key="item"
          >
            <!-- Stocks -->
            <th
              class="
                px-6
                pr-6
                pt-5
                pb-0
                text-xs text-center
                sm:pr-0 sm:pl-4 sm:py-3.5 sm:w-1/5
              "
            >
              <div
                class="
                  mx-auto
                  max-w-[85px]
                  px-1
                  py-1
                  shrink-0
                  rounded-full
                  text-white text-center
                  font-semibold
                  uppercase
                "
                :class="item.latestInfo.style"
              >
                {{ item.latestInfo.ticker }}
              </div>
            </th>
            <!-- Profit / Loss -->
            <td
              class="
                px-4
                pt-5
                pb-0
                sm:px-0 sm:py-3.5
                border-b border-gray-100
                sm:border-0
                text-xs
                flex
                items-center
                sm:table-cell sm:w-1/4
              "
            >
              <span class="sm:hidden font-semibold mr-2">P / L:</span>
              <div class="ml-auto text-right sm:text-center">
                <span
                  class="inline-block px-2 py-1 rounded"
                  :class="
                    item.trade.profitOrLossPercentage > 0
                      ? 'text-red-600 bg-red-100/70'
                      : item.trade.profitOrLossPercentage < 0
                      ? 'text-green-700 bg-green-100'
                      : 'text-slate-500 bg-slate-200'
                  "
                >
                  <span v-if="item.trade.profitOrLossPercentage !== 0">
                    <i
                      class="fas fa-arrow-up mr-1 text-red-600"
                      v-if="item.trade.profitOrLossPercentage > 0"
                    ></i>
                    <i
                      class="fas fa-arrow-down mr-1 text-green-700"
                      v-else-if="item.trade.profitOrLossPercentage < 0"
                    ></i>
                  </span>
                  <span v-else>--</span>
                  {{ item.trade.profitOrLossPercentage }} %
                </span>
                <p
                  class="mt-1"
                  :class="
                    item.trade.profitOrLossPercentage > 0
                      ? 'text-red-600'
                      : item.trade.profitOrLossPercentage < 0
                      ? 'text-green-700'
                      : 'text-slate-500'
                  "
                >
                  <span class="mr-px">$</span>
                  <span>{{ item.trade.profitOrLossValue }}</span>
                </p>
              </div>
            </td>
            <!-- Price -->
            <td
              class="
                px-4
                pt-5
                pb-0
                sm:px-0 sm:py-3.5
                border-b border-gray-100
                sm:border-0
                text-xs
                flex
                items-center
                sm:table-cell sm:w-[13%]
              "
            >
              <span class="sm:hidden font-semibold mr-2">Price:</span>
              <p class="ml-auto text-right sm:text-center">
                {{ item.trade.close }}
              </p>
            </td>
            <!-- Avg. Cost -->
            <td
              class="
                px-4
                pt-5
                pb-0
                sm:px-0 sm:py-3.5
                border-b border-gray-100
                sm:border-0
                text-xs
                flex
                items-center
                sm:table-cell sm:w-[15%]
              "
            >
              <span class="sm:hidden font-semibold mr-2">Average Cost:</span>
              <p class="ml-auto text-right sm:text-center">
                {{ item.trade.averageCost }}
              </p>
            </td>
            <!-- Shares -->
            <td
              class="
                px-4
                pt-5
                pb-0
                sm:px-0 sm:py-3.5
                border-b border-gray-100
                sm:border-0
                text-xs
                flex
                items-center
                sm:table-cell sm:w-[13%]
              "
            >
              <span class="sm:hidden font-semibold mr-2">Share:</span>
              <p class="ml-auto text-right sm:text-center">
                {{ item.trade.totalShares }}
              </p>
            </td>
            <td
              class="
                px-4
                pt-5
                pb-0
                sm:pl-0 sm:py-3.5
                block
                sm:table-cell
                md:hidden
                lg:block
                text-xs
                sm:w-[14%]
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
                @click="openTradeModal(item.trade.ticker)"
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
  props: {
    holdingsTotalInfo: {
      type: Object,
    },
  },
  setup(props, { emit }) {
    const openTradeModal = (ticker) => {
      const obj = {
        open: true,
        ticker,
      };
      emit("openTradeModal", obj);
    };

    return {
      openTradeModal,
    };
  },
};
</script>
