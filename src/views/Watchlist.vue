<template>
  <main class="px-4 md:p-10 mx-auto w-full">
    <form class="flex justify-center">
      <div class="relative w-full">
        <span
          class="
            leading-snug
            font-normal
            text-blueGray-300
            absolute
            bg-transparent
            rounded
            px-3
            py-3
          "
          ><i class="fas fa-search"></i
        ></span>
        <input
          type="text"
          placeholder="Search Ticker..."
          class="
            border-0
            pr-3
            pl-10
            py-3
            placeholder-blueGray-300
            text-blueGray-600
            bg-white
            rounded
            text-sm
            shadow
            outline-none
            focus:outline-none focus:ring
            w-full
          "
          v-model="search"
        />
      </div>
    </form>

    <!-- 搜尋結果 -->
    <WatchlistTable :searchList="searchList">
      <template #button>
        <a href="#" class="lg:text-lg text-gray-300">
          <i class="fas fa-plus"></i>
        </a>
      </template>
    </WatchlistTable>

    <!-- table -->
    <div
      class="
        flex flex-col
        break-words
        w-full
        my-6
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

      <WatchlistTable :searchList="searchList">
        <template #thead>
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
              <th
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
              </th>

              <th
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
              </th>
              <th
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
              </th>
              <th class="w-1/12"></th>
            </tr>
          </thead>
        </template>
        <template #button>
          <a href="#" class="lg:text-lg text-gray-300">
            <i class="fas fa-cross"></i>
          </a>
        </template>
      </WatchlistTable>

      <!-- body -->
      <!-- <div class="block w-full overflow-x-auto">
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
              <th
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
              </th>

              <th
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
              </th>
              <th
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
              </th>
              <th class="w-1/12"></th>
            </tr>
          </thead>
          <tbody>
            <tr class="border-t">
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
                    VTI
                  </p>
                  <p class="mt-2 lg:mt-0 flex-shrink truncate ...">
                    Vanguard Total Stock Market Index Fund ETF
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
                <span>$3,440</span>
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
                <i class="fas fa-arrow-up text-emerald-500 mr-1"></i>
                <span>46.53%</span>
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
                <span>1,300</span>
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
                <a href="#" class="lg:text-lg text-gray-300">
                  <i class="fas fa-times"></i>
                </a>
              </td>
            </tr>
            <tr class="border-t">
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
                    VTI
                  </p>
                  <p class="mt-2 lg:mt-0 flex-shrink truncate ...">
                    Vanguard Total Stock Market Index Fund ETF
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
                <span>$3,440</span>
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
                <i class="fas fa-arrow-up text-emerald-500 mr-1"></i>
                <span>46.53%</span>
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
                <span>1,300</span>
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
                <a href="#" class="lg:text-lg text-gray-300">
                  <i class="fas fa-times"></i>
                </a>
              </td>
            </tr>
          </tbody>
        </table>
      </div> -->
    </div>
  </main>
</template>

<script>
import { ref, watch } from "vue";
import axios from "axios";
import WatchlistTable from "@/components/WatchlistTable.vue";
export default {
  components: { WatchlistTable },
  setup() {
    const allPromises = [];
    const searchList = ref([]);
    const search = ref(null);

    watch(search, (newInput, oldInput) => {
      const oldLen = oldInput?.length || 0;
      const newLen = newInput?.length;

      if (newLen > oldLen) {
        allPromises.push(axios.get(`/api/quote/${newInput}`));
      } else {
        allPromises.pop();
      }

      if (!allPromises.length) return (searchList.value.length = 0);

      console.log("allPromises", allPromises);

      Promise.allSettled(allPromises)
        .then((response) => {
          // const promiseSize = allPromises.value.length - 1;
          // const stock = response[promiseSize];
          // if (!stock?.data) return;
          // searchList.value = [stock.value.data.result];

          // searchList.value = [
          //   response.map((item) => item.value.data.result).reverse()[0],
          // ];

          searchList.value = response
            .map((item) => item.value.data.result)
            .filter(
              (item) => item.name !== null && item.previousCloseChange !== "NaN"
            )
            .reverse();

          console.log("watch searchList", searchList.value);
        })
        .catch((error) => {
          console.log("error", error);
        });
    });

    return {
      search,
      searchList,
    };
  },
};
</script>