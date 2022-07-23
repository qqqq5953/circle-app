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
    <div class="rounded-t py-3 border-0 flex flex-wrap items-center">
      <h3 class="font-semibold px-4">{{ currentTab }}</h3>

      <!-- dropdown -->
      <div
        class="relative ml-auto h-full w-2/3"
        v-if="currentTab !== 'watchlist'"
      >
        <button
          class="absolute top-0 right-2 px-3 rounded-full active:rounded-full"
          @click="toggleDropdown"
        >
          <i class="fa-solid fa-ellipsis-vertical"></i>
        </button>
        <Transition>
          <ul
            class="absolute right-0 -bottom-16 p-3 shadow rounded bg-white"
            v-show="isOpen"
          >
            <li>
              <button
                @click="
                  deleteWatchlist();
                  toggleDropdown();
                "
              >
                delete watchlist
              </button>
            </li>
          </ul>
        </Transition>
      </div>
    </div>

    <!-- body -->
    <div class="block w-full overflow-x-auto" v-if="watchlistDisplay">
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
          <tr
            class="border-t test"
            v-for="(item, index) in watchlistDisplay"
            :key="item.ticker"
            :id="index"
            ref="tickerRow"
          >
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
              <div class="flex m-auto">
                <div
                  class="flex items-center gap-2 m-auto px-3 py-2 rounded"
                  :class="
                    item.previousCloseChange > 0
                      ? 'text-red-600 bg-red-100'
                      : 'text-green-600 bg-green-100'
                  "
                >
                  <i
                    class="fas fa-arrow-up"
                    v-if="item.previousCloseChange > 0"
                  ></i>
                  <i class="fas fa-arrow-down" v-else></i>
                  <span class="">{{ item.previousCloseChangePercent }} %</span>
                </div>
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
                    ? 'text-red-600'
                    : 'text-green-600'
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
    watchlistDisplay: {
      type: Object,
    },
    currentTab: {
      type: String,
    },
  },
  setup(props, { emit }) {
    const tickerRow = ref(null);
    const isOpen = ref(false);

    const toggleDropdown = () => (isOpen.value = !isOpen.value);

    const emitCurrentTab = (tab) => emit("emitCurrentTab", tab);

    const deleteWatchlist = () => {
      const { data, error, loading } = useAxios("/api/deleteTab", "post", {
        currentTab: props.currentTab,
      });

      watch(data, (newData) => {
        console.log("deleteWatchlist", newData);

        const defaultTab = newData.result[0];
        emitCurrentTab(defaultTab);
      });
    };

    // show deleted ticker when added
    watch(
      () => props.watchlistDisplay,
      () => {
        if (!tickerRow.value) return;

        tickerRow.value.forEach((item) => {
          if (item.classList.contains("hidden")) {
            item.classList.remove("hidden");
          }
        });
      }
    );

    function deleteTicker(ticker) {
      const { data, error, loading } = useAxios(
        "/api/deleteFromWatchlist",
        "post",
        { ticker, currentTab: props.currentTab }
      );

      watch(data, (newData) => {
        console.log("deleteTicker", newData);

        const tickerRow = document.getElementById(ticker);
        tickerRow.classList.add("hidden");

        emit("loadWatchlist", true);
      });
    }

    return {
      tickerRow,
      deleteTicker,
      isOpen,
      toggleDropdown,
      deleteWatchlist,
    };
  },
};
</script>

<style scoped>
.v-enter-active,
.v-leave-active {
  transform: translateY(0);
  transition: opacity 0.1s ease, transform 0.1s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>