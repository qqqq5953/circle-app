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
    <div
      class="rounded-t pl-4 lg:pl-8 py-3 flex flex-wrap items-center border-b"
      :class="{ 'border-b': watchlistDisplay }"
    >
      <h3 class="font-semibold">{{ currentTab }}</h3>

      <!-- dropdown -->
      <div
        class="relative ml-auto h-full w-2/3"
        v-if="currentTab?.toLowerCase() !== 'watchlist'"
      >
        <button
          class="absolute top-0 right-2 px-3 rounded-full active:rounded-full"
          @click="toggleDropdown"
        >
          <i class="fa-solid fa-ellipsis-vertical"></i>
        </button>
        <Transition>
          <ul
            class="absolute right-0 -bottom-28 p-3 shadow rounded bg-white"
            v-show="isDropdownOpen"
            @click="toggleDropdown"
          >
            <li
              class="flex gap-3 items-center py-1 cursor-pointer"
              v-for="list in dropdownMenu"
              :key="list.name"
              @click="list.onClick"
            >
              <i :class="list.icon"></i>
              <span>{{ list.name }}</span>
            </li>
          </ul>
        </Transition>
      </div>
    </div>

    <Teleport to="body">
      <div v-if="isModalOpen" class="fixed inset-0 z-20 bg-slate-700/60">
        <div
          class="
            absolute
            top-1/2
            left-1/2
            -translate-x-1/2 -translate-y-1/2
            bg-white
            rounded
            p-5
            flex flex-wrap flex-col
            gap-4
            w-2/3
            lg:w-1/3
          "
        >
          <h2 class="text-xl lg:text-2xl">Rename watchlist</h2>
          <input
            type="text"
            class="border rounded p-2 w-full"
            v-model="newListName"
            ref="inputRename"
          />
          <div class="text-right">
            <button class="text-blue-600 p-2 mr-2" @click="isModalOpen = false">
              Close
            </button>
            <button
              class="border rounded p-2 bg-blue-600 text-white"
              @click="
                renameWatchlist();
                isModalOpen = false;
              "
            >
              Rename
            </button>
          </div>
        </div>
      </div>
    </Teleport>

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
                w-[12.5%]
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
                xl:w-auto
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
            class="hover:bg-slate-100 hover:cursor-pointer"
            v-for="(item, index) in watchlistDisplay"
            :key="item.ticker"
            @click="toInfoPage(item.ticker)"
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
                w-5/12
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
                w-[12.5%]
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
                xl:w-auto
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
                  <span class=""
                    >{{ Math.abs(item.previousCloseChangePercent) }} %</span
                  >
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
                class="text-gray-300"
                @click.stop.prevent="deleteTicker(item.ticker)"
              >
                <i
                  class="
                    fa-solid fa-xmark
                    text-lg
                    md:text-xl
                    hover:text-blue-600
                  "
                ></i>
              </a>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import { useRouter } from "vue-router";
import { ref, watch, nextTick } from "vue";
import { storeToRefs } from "pinia";
import useAxios from "@/composables/useAxios.js";
import useWatchlistStore from "@/stores/watchlistStore.js";
import useStockInfoStore from "@/stores/stockInfoStore.js";

export default {
  props: {
    watchlistDisplay: {
      type: Object,
    },
  },
  setup(props, { emit }) {
    const $watchlistStore = useWatchlistStore();
    const $stockInfoStore = useStockInfoStore();

    const router = useRouter();

    const tickerRow = ref(null);
    const isDropdownOpen = ref(false);
    const dropdownMenu = ref([
      {
        name: "delete",
        onClick: [deleteWatchlist],
        icon: "fa-regular fa-trash-can",
      },
      {
        name: "rename",
        onClick: [openRenameModal],
        icon: "fa-regular fa-pen-to-square",
      },
    ]);
    const isModalOpen = ref(false);
    const newListName = ref(null);
    const inputRename = ref(null);
    const { currentTab } = storeToRefs($watchlistStore);

    function toInfoPage(ticker) {
      router.push({
        name: "stockInfo",
        params: { ticker },
      });
    }

    const showCurrentTab = (tab) => {
      $watchlistStore.showCurrentTab(tab);
    };

    const toggleDropdown = () => (isDropdownOpen.value = !isDropdownOpen.value);

    const setTabs = (tab) => {
      $watchlistStore.setTabs(tab);
    };

    function deleteWatchlist() {
      const { data, error, loading } = useAxios(
        "/api/deleteWatchlist",
        "post",
        {
          currentTab: $watchlistStore.currentTab,
        }
      );

      watch(data, (newData) => {
        setTabs(newData.result);
        showCurrentTab($watchlistStore.DEFAULT_TAB);
      });
    }

    function renameWatchlist() {
      if ($watchlistStore.currentTab === newListName.value) return;
      const { data, error, loading } = useAxios("/api/editTab", "post", {
        oldTab: $watchlistStore.currentTab,
        newTab: newListName.value,
      });

      watch(data, (newData) => {
        const { newTab, allTabs } = newData.result;
        showCurrentTab(newTab);
        setTabs(allTabs);
      });
    }

    async function openRenameModal() {
      isModalOpen.value = true;
      newListName.value = $watchlistStore.currentTab;
      await nextTick();
      inputRename.value.select();
    }

    function deleteTicker(ticker) {
      const { data, error, loading } = useAxios(
        "/api/deleteFromWatchlist",
        "post",
        { ticker, currentTab: $watchlistStore.currentTab }
      );

      watch(data, (newData) => {
        const tickerRow = document.getElementById(ticker);
        tickerRow.classList.add("hidden");

        emit("loadWatchlist", true);
      });
    }

    watch(currentTab, (newTab) => {
      isDropdownOpen.value = false;
    });

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

    return {
      isDropdownOpen,
      isModalOpen,
      tickerRow,
      currentTab,
      dropdownMenu,
      inputRename,
      newListName,

      toggleDropdown,
      openRenameModal,
      deleteTicker,
      deleteWatchlist,
      renameWatchlist,

      toInfoPage,
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