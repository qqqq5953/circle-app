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
      border
    "
  >
    <!-- head -->
    <div
      class="
        rounded-t
        px-4
        py-3
        border-0
        hidden
        md:flex md:items-center md:flex-wrap
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
          class="
            bg-gray-100
            border-b border-t
            sm:border-t-0
            md:border-t
            lg:border-t-0
            hidden
            sm:table-header-group
          "
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
                lg:w-1/4
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
                lg:w-1/5
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
                lg:w-[10%]
              "
            >
              Shares
            </th>
            <th class="px-4 py-3 md:hidden lg:block sm:w-[14%] lg:w-[12%]"></th>
          </tr>
        </thead>
        <tbody>
          <tr
            class="flex flex-col sm:table-row mx-2 mb-3 sm:m-0 rounded"
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
                sm:pr-0 sm:pl-4 sm:py-3.5
                text-xs
                sm:table-cell
              "
            >
              <div class="flex flex-col gap-y-2">
                <p
                  class="ticker-badge mx-auto lg:mx-0"
                  :class="item.latestInfo.style"
                >
                  {{ item.latestInfo.ticker }}
                </p>
                <p
                  class="
                    sm:hidden
                    lg:block
                    break-words
                    lg:break-normal lg:truncate lg:text-left
                  "
                >
                  {{ item.latestInfo.name }}
                </p>
              </div>
            </th>
            <!-- Profit / Loss -->
            <td
              class="
                holdingTable-table-cell
                sm:table-cell
                border-b
                sm:border-0
                flex
                items-center
                text-xs
              "
            >
              <span class="sm:hidden mr-2 text-slate-600">P / L:</span>
              <div class="ml-auto sm:ml-0 text-right sm:text-center">
                <div
                  class="
                    inline-block
                    sm:px-3 sm:py-2 sm:rounded
                    font-extrabold
                    sm:font-medium
                  "
                  :class="
                    item.trade.profitOrLossPercentage > 0
                      ? 'text-red-600 sm:bg-red-100/70'
                      : item.trade.profitOrLossPercentage < 0
                      ? 'text-green-700 sm:bg-green-100'
                      : 'text-slate-500 sm:bg-slate-200'
                  "
                >
                  <span
                    class="hidden sm:inline"
                    v-if="item.trade.profitOrLossPercentage !== 0"
                  >
                    <i
                      class="fas fa-arrow-up text-red-600"
                      v-if="item.trade.profitOrLossPercentage > 0"
                    ></i>
                    <i
                      class="fas fa-arrow-down text-green-700"
                      v-else-if="item.trade.profitOrLossPercentage < 0"
                    ></i>
                  </span>
                  <span v-else>--</span>
                  <span class="ml-1.5">
                    <span>{{
                      item.trade.profitOrLossPercentage < 0
                        ? item.trade.profitOrLossPercentage * -1
                        : item.trade.profitOrLossPercentage
                    }}</span>
                    %</span
                  >
                </div>
                <div
                  class="mt-0.5 font-medium"
                  :class="
                    item.trade.profitOrLossValue > 0
                      ? 'text-red-600'
                      : item.trade.profitOrLossValue < 0
                      ? 'text-green-700'
                      : 'text-slate-500'
                  "
                >
                  <!-- <span>{{ item.trade.profitOrLossValue }}</span> -->
                  <span v-if="item.trade.profitOrLossValue >= 0">
                    <span class="mr-px">+</span>
                    <span>{{ item.trade.profitOrLossValue }}</span>
                  </span>
                  <span v-else>
                    {{ item.trade.profitOrLossValue }}
                  </span>
                </div>
              </div>
            </td>
            <!-- Price -->
            <td
              class="
                holdingTable-table-cell
                sm:table-cell
                text-xs
                border-b
                sm:border-0
                flex
                items-center
              "
            >
              <span class="sm:hidden mr-2 text-slate-600">Price:</span>
              <p
                class="
                  ml-auto
                  text-right
                  sm:text-center
                  font-medium
                  sm:font-normal
                "
              >
                {{ item.trade.close }}
              </p>
            </td>
            <!-- Avg. Cost -->
            <td
              class="
                holdingTable-table-cell
                sm:table-cell
                text-xs
                border-b
                sm:border-0
                flex
                items-center
              "
            >
              <span class="sm:hidden mr-2 text-slate-600">Average Cost:</span>
              <p
                class="
                  ml-auto
                  text-right
                  sm:text-center
                  font-medium
                  sm:font-normal
                "
              >
                {{ item.trade.averageCost }}
              </p>
            </td>
            <!-- Shares -->
            <td
              class="
                holdingTable-table-cell
                sm:table-cell
                text-xs
                border-b
                sm:border-0
                flex
                items-center
              "
            >
              <span class="sm:hidden mr-2 text-slate-600">Share:</span>
              <p
                class="
                  ml-auto
                  text-right
                  sm:text-center
                  font-medium
                  sm:font-normal
                "
              >
                {{ item.trade.totalShares }}
              </p>
            </td>
            <td
              class="
                holdingTable-table-cell
                text-xs
                block
                sm:table-cell
                md:hidden
                lg:table-cell
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
                  sm:mx-auto
                  block
                "
                @click="openTradeModal(item.latestInfo)"
              >
                Buy
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import http from "../api/index";
export default {
  props: {
    holdingsTotalInfo: {
      type: Object,
    },
  },
  setup(_, { emit }) {
    const openTradeModal = (latestInfo) => {
      const { code, ticker, tempTicker, style } = latestInfo;
      const promiseObj = http.get(`/api/quote/${ticker}`);
      const obj = {
        open: true,
        promiseObj,
        code,
        tempTicker,
        style,
      };
      emit("openTradeModal", obj);
    };

    return {
      openTradeModal,
    };
  },
};
</script>
