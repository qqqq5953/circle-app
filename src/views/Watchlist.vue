<template>
  <main class="flex flex-col gap-3 px-4 md:p-10 mx-auto w-full">
    <div class="relative w-full pb-14">
      <SearchBar
        id="searchBar"
        @toggleSearchList="toggleSearchList"
        @toggleSearchListSkeleton="toggleSearchListSkeleton"
        @emitSearchList="getSearchList"
      />

      <!-- 搜尋結果 -->
      <Transition>
        <div v-show="isFocus" class="absolute top-12 w-full bg-white">
          <ListSkeleton
            :tableContent="searchListSkeletonContent"
            v-show="isSearchListLoading"
          />
          <SearchList
            :searchList="searchList"
            :isAddingProcess="isAddingProcess"
            @loadWatchlist="loadWatchlist"
            @toggleWatchlistSkeleton="toggleWatchlistSkeleton"
            @toggleAddButtonSpinner="toggleAddButtonSpinner"
            v-show="!isSearchListLoading"
          />
          <div
            class="shadow-lg rounded bg-white px-4 py-3"
            v-if="searchList === undefined"
            v-show="!isSearchListLoading"
          >
            <i class="fa-solid fa-circle-exclamation"></i>
            <span class="ml-3">The ticker does not exist</span>
          </div>
        </div>
      </Transition>
    </div>

    <!-- tabs -->
    <WatchlistNavbar
      :isWatchlistLoading="isWatchlistLoading"
      :isDeletingTicker="isDeletingTicker"
    />

    <!-- table -->
    <ListSkeleton
      :tableContent="watchlistTableSkeletonContent"
      v-show="isWatchlistLoading"
      ><template #table-title>
        <div
          class="
            rounded-t
            pl-4
            lg:pl-8
            py-3
            flex flex-wrap
            items-center
            border-b
          "
        >
          <h3 class="font-semibold">
            {{ currentTab }}
          </h3>
          <div
            class="relative ml-auto h-full w-2/3"
            v-if="currentTab?.toLowerCase() !== 'watchlist'"
          >
            <div class="absolute top-0 right-2 px-3">
              <i class="fa-solid fa-ellipsis-vertical"></i>
            </div>
          </div>
        </div>
      </template>
    </ListSkeleton>

    <WatchlistTable
      :watchlistDisplay="watchlistDisplay"
      @loadWatchlist="loadWatchlist"
      @toggleAddButtonSpinner="toggleAddButtonSpinner"
      @toggleWatchlistSkeleton="toggleWatchlistSkeleton"
      v-show="!isWatchlistLoading"
    />
  </main>
</template>

<script>
import { ref, watch, defineAsyncComponent } from "vue";
import axios from "axios";
import useAxios from "@/composables/useAxios.js";

import SearchList from "@/components/SearchList.vue";
import WatchlistTable from "@/components/Watchlist/WatchlistTable.vue";
import ListSkeleton from "@/components/skeleton/ListSkeleton.vue";
import SearchBar from "@/components/SearchBar.vue";
import WatchlistNavbar from "@/components/Watchlist/WatchlistNavbar.vue";

import useWatchlistStore from "@/stores/watchlistStore.js";
import { storeToRefs } from "pinia";

export default {
  components: {
    SearchBar,
    SearchList,
    WatchlistTable,
    ListSkeleton,
    WatchlistNavbar,
    ErrorDisplay: defineAsyncComponent(() =>
      import("@/components/ErrorDisplay.vue")
    ),
  },
  setup() {
    const $store = useWatchlistStore();

    // searchList section
    const searchListSkeletonContent = ref({
      tableHead: {
        hasTableHead: false,
        th: null,
        td: null,
      },
      tableBody: {
        hasTableBody: true,
        tr: 1,
        th: 1,
        td: 3,
      },
    });
    const searchList = ref([]);
    const isSearchListLoading = ref(null);
    const isFocus = ref(null);

    const toggleSearchListSkeleton = (isLoading) => {
      isSearchListLoading.value = isLoading;
    };

    const toggleSearchList = (focus) => {
      isFocus.value = focus;
    };

    const getSearchList = (tickerObject) => {
      searchList.value =
        tickerObject === undefined // 無搜尋結果
          ? undefined
          : tickerObject === null // 輸入不符格式
          ? null
          : [tickerObject];
    };

    const hasParentElement = (event, element) => event.target.closest(element);

    document.addEventListener("click", (e) => {
      const isAddButtonClick = e.target.nodeName === "I";
      const isInputFocus = e.target.nodeName === "INPUT";
      const isNavClick = hasParentElement(e, "nav");
      const isSearchBarFocus =
        isInputFocus && hasParentElement(e, "#searchBar");

      if (isAddButtonClick) return;
      if (!isSearchBarFocus && !isNavClick) isFocus.value = false;
      if (isSearchBarFocus) isFocus.value = true;
    });

    // tabs
    const { tabs, currentTab, cachedList, deleteCount, tempTime } =
      storeToRefs($store);
    watch(currentTab, () => loadWatchlist({ status: "switch" }));

    // watchlist section
    const watchlistTableSkeletonContent = ref({
      tableHead: {
        hasTableHead: true,
        th: "Stocks",
        td: ["Price", "Change %", "Change"],
      },
      tableBody: {
        hasTableBody: true,
        tr: 1,
        th: 1,
        td: 3,
      },
    });
    const isWatchlistLoading = ref(null);
    const isDeletingTicker = ref(null);
    const isAddingProcess = ref(false);
    const watchlistDisplay = ref(null);

    const toggleWatchlistSkeleton = (isLoading) => {
      isWatchlistLoading.value = isLoading;
    };

    const toggleTabSkeleton = (isLoading) => {
      isDeletingTicker.value = isLoading;
    };

    const toggleAddButtonSpinner = (isLoading) => {
      isAddingProcess.value = isLoading;
    };

    const setSkeletonTableRow = (rowNumber) => {
      watchlistTableSkeletonContent.value.tableBody.tr = rowNumber;
    };

    // function wrap(watchlistTickers, loadStatus) {
    //   const finalDelay = loadStatus !== "deleteTicker" ? 1000 : 1000;
    //   const updateWatchlist = debounce(async (watchlistTickers) => {
    //     const currentWatchlist = await getCurrentWatchlist(watchlistTickers);

    //     cachedList.value[currentTab.value] = {
    //       isEmpty: Object.keys(currentWatchlist).length === 0,
    //       currentWatchlist,
    //     };

    //     console.log("loadStatus", loadStatus);
    //     console.log("currentWatchlist", currentWatchlist);

    //     if (loadStatus !== "deleteTicker") {
    //       watchlistDisplay.value = currentWatchlist;
    //     }

    //     toggleTabSkeleton(false);
    //     toggleAddButtonSpinner(false);
    //   }, finalDelay);

    //   updateWatchlist(watchlistTickers);
    // }

    const DEBOUNCE_DELAY = 1000;

    function reset() {
      toggleTabSkeleton(false);
      toggleAddButtonSpinner(false);
      tempTime.value.length = 0;
      deleteCount.value = 0;
    }

    function debounce(cb, delay = DEBOUNCE_DELAY) {
      let timeout;

      return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
          cb(...args);
        }, delay);
      };
    }

    const updateWatchlist = debounce(async (watchlistTickers) => {
      const currentWatchlist = await getCurrentWatchlist(watchlistTickers);

      cachedList.value[currentTab.value] = {
        isEmpty: Object.keys(currentWatchlist).length === 0,
        currentWatchlist,
      };

      const end = tempTime.value[tempTime.value.length - 1];
      const start = tempTime.value[0];
      const diff = end - start;
      const isConsecutiveClick = diff <= DEBOUNCE_DELAY;

      console.log(`%c diff ${diff}`, "background:#666; color:#efefef");

      if (isConsecutiveClick) {
        console.log(`%c 連續點擊`, "background:red; color:#efefef");
        reset();
      } else {
        console.log(`%c 慢速點擊`, "background:red; color:#efefef");
        if (deleteCount.value !== 0) {
          deleteCount.value--;
          console.log(
            `%c 執行完 deleteCount ${deleteCount.value}`,
            "background:red; color:#efefef"
          );
        }
        if (deleteCount.value === 0) {
          reset();
        }
      }
    });

    // status: init, switch, deleteTicker, addTicker
    async function loadWatchlist({ status }) {
      console.log(`%c${status}`, "background:#f50; color:#333");
      const isTabsRendered = tabs.value.length !== 0;
      const isInitOrSwitch = status === "init" || status === "switch";

      // 檢查 list 沒內容時停止執行後續
      if (isTabsRendered && isInitOrSwitch) {
        const currentTabInfo = tabs.value.find((tab) => {
          return tab.name === currentTab.value;
        });

        if (currentTabInfo.listLength === 0) {
          watchlistDisplay.value = {};
          cachedList.value[currentTab.value] = {
            isEmpty: true,
            currentWatchlist: {},
          };
          console.log("if 加入", cachedList.value[currentTab.value]);

          return;
        }
      }

      toggleAddButtonSpinner(true);

      if (status !== "deleteTicker") {
        toggleWatchlistSkeleton(true);
      } else {
        toggleTabSkeleton(true);
      }

      const allTabs = Object.keys(cachedList.value);
      const isCurrentTabInTabs = allTabs.includes(currentTab.value);

      // switch 時用 cache
      if (status === "switch" && isCurrentTabInTabs) {
        const currentWatchlist = {
          ...cachedList.value[currentTab.value].currentWatchlist,
        };
        console.log(`%c switch 時用 cache`, "background:yellow; color:#333");
        console.log("currentWatchlist", currentWatchlist);

        watchlistDisplay.value = currentWatchlist;
        toggleAddButtonSpinner(false);
        return;
      }

      const { data, error, loading } = useAxios(
        `/api/getWatchlist/${currentTab.value}`,
        "get"
      );

      watch([data, loading], async ([newData, newLoading]) => {
        // 如果載入的 tab 沒內容則後面不用打 api

        const watchlistTickers = newData.result;
        const rows = watchlistTickers
          ? Object.keys(watchlistTickers)?.length
          : 0;
        setSkeletonTableRow(rows);

        if (status !== "deleteTicker") {
          const currentWatchlist = await getCurrentWatchlist(watchlistTickers);

          console.log("currentWatchlist", currentWatchlist);

          cachedList.value[currentTab.value] = {
            isEmpty: Object.keys(currentWatchlist).length === 0,
            currentWatchlist,
          };

          watchlistDisplay.value = currentWatchlist;
          toggleTabSkeleton(false);
          toggleAddButtonSpinner(false);
        } else {
          updateWatchlist(watchlistTickers);
        }

        // updateWatchlist(watchlistTickers);
        // wrap(watchlistTickers, status);
      });
    }

    loadWatchlist({ status: "init" });

    async function getCurrentWatchlist(watchlistTickers) {
      const allPromises = [];

      for (let ticker in watchlistTickers) {
        allPromises.push(axios.get(`/api/quote/${ticker}`));
      }

      try {
        const response = await Promise.allSettled(allPromises);
        return response
          .map((item) => item.value.data.result)
          .reduce((obj, item) => {
            return {
              ...obj,
              [item.ticker]: item,
            };
          }, {});
      } catch (error) {
        console.log("error", error);
        toggleWatchlistSkeleton(false);
      }
    }

    return {
      searchListSkeletonContent,
      searchList,
      isSearchListLoading,
      isFocus,
      getSearchList,
      toggleSearchList,
      toggleSearchListSkeleton,

      loadWatchlist,
      watchlistDisplay,
      watchlistTableSkeletonContent,
      isWatchlistLoading,
      isDeletingTicker,
      isAddingProcess,
      toggleAddButtonSpinner,
      toggleWatchlistSkeleton,

      currentTab,
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