<template>
  <!-- body -->
  <div class="mb-6 shadow-lg rounded bg-white border overflow-x-auto">
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
          <th class="px-4 py-3 sm:w-[14%] md:w-[12%] lg:block lg:w-[12%]"></th>
        </tr>
      </thead>
      <tbody>
        <tr
          class="flex flex-col rounded-t md:rounded-none sm:table-row px-2 pb-3 sm:p-0 border-b border-slate-200 last:border-none"
          v-for="item in holdings"
          :key="item"
        >
          <!-- Stocks -->
          <th
            class="px-2 pt-5 pb-0 text-xs sm:pr-0 sm:pl-4 sm:py-3.5 sm:table-cell"
          >
            <div class="flex flex-col gap-y-1.5">
              <p class="ticker-badge lg:mx-0" :class="item.latestInfo.style">
                {{ item.latestInfo.ticker }}
              </p>
              <p class="flex items-center px-1.5 gap-x-1.5">
                <span class="text-left truncate sm:hidden md:block">{{
                  item.latestInfo.name
                }}</span>
                <span
                  class="shrink-0 inline-block ml-auto px-2 py-1 rounded font-medium sm:hidden"
                  :class="
                    item.totalStats.profitOrLossPercentage > 0
                      ? 'text-red-600 bg-red-100/70'
                      : item.totalStats.profitOrLossPercentage < 0
                      ? 'text-green-700 bg-green-100'
                      : 'text-slate-500 bg-slate-200'
                  "
                >
                  <i
                    class="fas fa-arrow-up text-red-600"
                    v-if="item.totalStats.profitOrLossPercentage > 0"
                  ></i>
                  <i
                    class="fas fa-arrow-down text-green-700"
                    v-else-if="item.totalStats.profitOrLossPercentage < 0"
                  ></i>
                  <span v-else>--</span>
                  <span class="ml-1">
                    <span>{{
                      item.totalStats.profitOrLossPercentage < 0
                        ? item.totalStats.profitOrLossPercentage * -1
                        : item.totalStats.profitOrLossPercentage
                    }}</span>
                    %</span
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
                class="hidden sm:inline-block px-2 py-1 rounded font-medium lg:px-3 lg:py-2"
                :class="
                  item.totalStats.profitOrLossPercentage > 0
                    ? 'text-red-600 bg-red-100/70'
                    : item.totalStats.profitOrLossPercentage < 0
                    ? 'text-green-700 bg-green-100'
                    : 'text-slate-500 bg-slate-200'
                "
              >
                <i
                  class="fas fa-arrow-up text-red-600"
                  v-if="item.totalStats.profitOrLossPercentage > 0"
                ></i>
                <i
                  class="fas fa-arrow-down text-green-700"
                  v-else-if="item.totalStats.profitOrLossPercentage < 0"
                ></i>
                <span v-else>--</span>
                <span class="ml-1">
                  <span>{{
                    item.totalStats.profitOrLossPercentage < 0
                      ? item.totalStats.profitOrLossPercentage * -1
                      : item.totalStats.profitOrLossPercentage
                  }}</span>
                  %</span
                >
              </div>
              <div
                class="mt-1 font-medium"
                :class="
                  item.totalStats.profitOrLossValue > 0
                    ? 'text-red-600'
                    : item.totalStats.profitOrLossValue < 0
                    ? 'text-green-700'
                    : 'text-slate-500'
                "
              >
                <span v-if="item.totalStats.profitOrLossValue >= 0">
                  +${{ item.totalStats.profitOrLossValue }}
                </span>
                <span v-else>
                  -${{ item.totalStats.profitOrLossValue * -1 }}
                </span>
              </div>
            </div>
          </td>
          <!-- Price -->
          <td
            class="holdingTable-table-cell text-xs border-b flex items-center sm:table-cell sm:border-0"
          >
            <span class="sm:hidden mr-2 text-slate-600">Price:</span>
            <p
              class="ml-auto text-right sm:text-center font-medium sm:font-normal"
            >
              {{ item.latestInfo.close }}
            </p>
          </td>
          <!-- Avg. Cost -->
          <td
            class="holdingTable-table-cell text-xs border-b flex items-center sm:table-cell sm:border-0"
          >
            <span class="sm:hidden mr-2 text-slate-600">Average Cost:</span>
            <p
              class="ml-auto text-right font-medium sm:font-normal sm:text-center"
            >
              {{ item.totalStats.averageCost }}
            </p>
          </td>
          <!-- Shares -->
          <td
            class="holdingTable-table-cell text-xs border-b flex items-center sm:table-cell sm:border-0"
          >
            <span class="sm:hidden mr-2 text-slate-600">Share:</span>
            <p
              class="ml-auto text-right font-medium sm:text-center sm:font-normal"
            >
              {{ item.totalStats.totalShares }}
            </p>
          </td>
          <td class="holdingTable-table-cell text-xs block sm:table-cell">
            <div
              class="flex items-center gap-x-2 font-bold py-1 sm:gap-x-3 lg:justify-center"
            >
              <button
                class="border border-indigo-600 text-indigo-600 hover:bg-indigo-600 hover:text-white rounded px-2 py-1 block order-2 sm:order-1"
                type="button"
                @click="openBuyModal(item.latestInfo)"
              >
                Buy
              </button>
              <router-link
                class="hover:text-indigo-500 text-indigo-600 ml-auto rounded block order-1 sm:order-2 sm:border-none sm:hover:bg-transparent sm:ml-0 sm:text-black sm:hover:text-indigo-600"
                :to="{
                  name: 'TradeDetails',
                  query: {
                    tempTicker: item.latestInfo.tempTicker,
                  },
                }"
              >
                <span class="sm:hidden">More</span>
                <span class="hidden sm:inline">
                  <i class="fa-solid fa-chevron-right lg:fa-xl"></i>
                </span>
              </router-link>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
export default {
  props: {
    holdings: {
      type: Object,
    },
  },
  setup(_, { emit }) {
    const openBuyModal = (latestInfo) => {
      const { close: price, ...rest } = latestInfo;
      const parmas = {
        ...rest,
        price,
        open: true,
        type: "buy",
      };
      emit("toggleModal", parmas);
    };

    return {
      openBuyModal,
    };
  },
};
</script>
