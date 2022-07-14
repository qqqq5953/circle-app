<template>
  <div
    class="
      flex flex-col
      break-words
      w-full
      shadow-lg
      rounded
      border border-gray-100
    "
  >
    <!-- table title -->
    <div class="rounded-t px-4 py-3 border-0 flex flex-wrap items-center">
      <div class="w-full px-4 max-w-full flex-1">
        <h3 class="font-semibold text-base text-blueGray-700">Watchlist</h3>
      </div>
    </div>

    <!-- body -->
    <div class="block w-full overflow-x-auto" v-if="result">
      <table class="w-full border-collapse table-fixed">
        <thead
          class="bg-gray-100 border-t border-b hidden lg:table-header-group"
        >
          <tr>
            <th
              class="
                px-6
                py-3
                text-gray-700 text-center text-xs
                uppercase
                border-x-0
                whitespace-nowrap
                font-semibold
                w-6/12
                lg:w-5/12
              "
            >
              Stocks
            </th>
            <td
              class="
                px-6
                py-3
                text-gray-700 text-center text-xs
                uppercase
                border-x-0
                whitespace-nowrap
                font-semibold
                w-2/12
                lg:w-auto
              "
            >
              Price
            </td>
            <td
              class="
                px-6
                py-3
                text-gray-700 text-center text-xs
                uppercase
                border-x-0
                whitespace-nowrap
                font-semibold
                w-3/12
                lg:w-auto
              "
            >
              Change %
            </td>
            <td
              class="
                px-6
                py-3
                text-gray-700 text-center text-xs
                uppercase
                border-x-0
                whitespace-nowrap
                font-semibold
                hidden
                lg:table-cell lg:w-auto
              "
            >
              Change
            </td>
            <td class="w-1/12"></td>
          </tr>
        </thead>
        <tbody>
          <tr class="border-t" v-for="item in result" :key="item.ticker">
            <th
              class="
                border-t-0 border-x-0
                py-3
                sm:py-4
                px-4
                lg:px-8
                text-xs text-left
                w-6/12
                lg:w-5/12
              "
            >
              <div
                class="
                  flex flex-col
                  lg:flex-row lg:justify-between lg:items-center
                "
              >
                <p
                  class="
                    font-semibold
                    mr-4
                    px-2
                    py-1
                    flex-shrink-0
                    self-start
                    bg-red-400
                    rounded
                    text-white
                    uppercase
                  "
                >
                  {{ item.ticker }}
                </p>
                <p class="mt-2 lg:mt-0 flex-shrink truncate ...">
                  {{ item.name }}
                </p>
              </div>
            </th>
            <td
              class="
                border-t-0 border-x-0
                py-3
                sm:py-4
                px-0
                lg:px-6
                text-xs text-center
                w-2/12
                lg:w-auto
              "
            >
              <span>{{ item.price }}</span>
            </td>
            <td
              class="
                border-t-0 border-x-0
                py-3
                sm:py-4
                px-0
                lg:px-6
                text-xs text-center
                w-3/12
                lg:w-auto
              "
            >
              <div
                class="flex items-center justify-center gap-2"
                :class="
                  item.previousCloseChange > 0
                    ? 'text-green-600'
                    : 'text-red-600'
                "
              >
                <i
                  class="fas fa-arrow-up"
                  v-if="item.previousCloseChange > 0"
                ></i>
                <i class="fas fa-arrow-down" v-else></i>
                <span>({{ item.previousCloseChangePercent }} %)</span>
              </div>
            </td>
            <td
              class="
                border-t-0 border-x-0
                py-3
                sm:py-4
                px-0
                lg:px-6
                text-xs text-center
                hidden
                lg:table-cell lg:w-auto
              "
            >
              <span
                :class="
                  item.previousCloseChange > 0
                    ? 'text-green-600'
                    : 'text-red-600'
                "
                >{{ item.previousCloseChange }}</span
              >
            </td>
            <td
              class="
                border-t-0 border-x-0
                py-3
                sm:py-4
                pr-3
                lg:pr-4
                text-xs text-center
                w-1/12
              "
            >
              <a
                href="#"
                class="lg:text-lg text-gray-300"
                @click.prevent="deleteTicker(item.ticker)"
              >
                <i class="fas fa-times"></i>
              </a>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import useAxios from "@/composables/useAxios.js";
import { ref, watch } from "vue";

export default {
  props: {
    result: [Array, Object],
  },
  setup(props, { emit }) {
    function deleteTicker(ticker) {
      const { data, error, loading } = useAxios(
        "/api/deleteFromWatchlist",
        "post",
        { ticker }
      );

      watch(data, (newData) => {
        console.log("deleteTicker", newData);
        emit("getWatchlist");
      });
    }

    return {
      deleteTicker,
    };
  },
};
</script>