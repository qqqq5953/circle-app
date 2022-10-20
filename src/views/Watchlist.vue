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
            @toggleLoadingEffect="toggleLoadingEffect"
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
    <WatchlistNavbar :isWatchlistLoading="isWatchlistLoading" />

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
      @toggleLoadingEffect="toggleLoadingEffect"
      @setSkeletonTableRow="setSkeletonTableRow"
      v-show="!isWatchlistLoading"
    />
  </main>
</template>

<script>
import { ref, watch, defineAsyncComponent } from "vue";
import http from "../api/index";

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
    const { tabs, currentTab, cachedList } = storeToRefs($store);

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
      switch (tickerObject) {
        case undefined:
          searchList.value = undefined; // 無搜尋結果
          break;
        case null:
          searchList.value = null; // 輸入不符格式
          break;
        default:
          const { code, ticker } = tickerObject;
          const tempTicker =
            code !== "us" || code !== "mf" ? ticker.split(".")[0] : ticker;

          searchList.value = [{ ...tickerObject, tempTicker }];
      }
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
    const setTabs = (tab) => $store.setTabs(tab);

    http.get(`/api/getTabs`).then((res) => {
      setTabs(res.data.result);
      loadWatchlist({ status: "init" });
    });

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
        tr: 0,
        th: 1,
        td: 3,
      },
    });
    const isWatchlistLoading = ref(null);
    const isAddingProcess = ref(false);
    const watchlistDisplay = ref(null);

    const toggleWatchlistSkeleton = (isLoading) => {
      isWatchlistLoading.value = isLoading;
    };

    const toggleAddButtonSpinner = (isLoading) => {
      isAddingProcess.value = isLoading;
    };

    const setSkeletonTableRow = ({ list, rows }) => {
      if (!list) {
        watchlistTableSkeletonContent.value.tableBody.tr = rows;
      } else {
        watchlistTableSkeletonContent.value.tableBody.tr =
          Object.keys(list).length;
      }
    };

    const toggleLoadingEffect = (isActivate) => {
      toggleAddButtonSpinner(isActivate);
      toggleWatchlistSkeleton(isActivate);
    };

    function showListOnAdding(payload) {
      const cacheList = getCacheList(currentTab.value);
      const unorderedList = { ...payload, ...cacheList };
      const orderedList = Object.keys(unorderedList)
        .sort()
        .reduce((obj, key) => {
          obj[key] = unorderedList[key];
          return obj;
        }, {});

      setSkeletonTableRow({ list: orderedList });

      watchlistDisplay.value = orderedList;
      cachedList.value[currentTab.value] = setCacheList(orderedList);
    }

    function showListOnDeleting(payload) {
      let newList = null;
      const cacheList = getCacheList(currentTab.value);

      for (let i = 0; i < payload.length; i++) {
        const ticker = payload[i];
        const { [ticker]: _, ...rest } = newList || cacheList;
        newList = rest;
      }

      watchlistDisplay.value = newList;
      cachedList.value[currentTab.value] = setCacheList(newList);
    }

    // status: init, switch, deleteTicker, addTicker
    async function loadWatchlist({ status, payload }) {
      // 檢查 list 沒內容時停止執行後續
      if (status === "init" || status === "switch") {
        const currentTabInfo = tabs.value.find(
          (tab) => tab.name === currentTab.value
        );

        if (currentTabInfo.listLength === 0) {
          watchlistDisplay.value = null;
          cachedList.value[currentTab.value] = setCacheList(null);
          return;
        }
      }

      // 用 cache
      switch (status) {
        case "switch":
          const allTabs = Object.keys(cachedList.value);
          const isCurrentTabInTabs = allTabs.includes(currentTab.value);

          if (isCurrentTabInTabs) {
            watchlistDisplay.value = getCacheList(currentTab.value);
            return; // 第二次 switch
          } else {
            break; // 第一次 switch
          }

        case "addTicker": {
          showListOnAdding(payload);
          toggleLoadingEffect(false);
          return;
        }

        case "deleteTicker": {
          showListOnDeleting(payload);
          toggleLoadingEffect(false);
          return;
        }
      }
      toggleLoadingEffect(true);

      try {
        const tempRes = await http.get(`/api/watchlist/${currentTab.value}`);
        const watchlist = tempRes.data.result;

        setSkeletonTableRow({ list: watchlist });

        const tempTickers = Object.keys(watchlist);
        const newPrices = await fetchNewPrices(tempTickers, watchlist);
        const currentWatchlist = await updateList(
          newPrices,
          tempTickers,
          watchlist
        );

        console.log("watchlist", watchlist);

        watchlistDisplay.value = currentWatchlist;
        cachedList.value[currentTab.value] = setCacheList(currentWatchlist);

        toggleLoadingEffect(false);
      } catch (error) {
        console.log("error", error);
      }
    }

    async function updateList(newPrices, tempTickers, watchlist) {
      const start = performance.now();

      // check new price
      const allPromises = [];
      let newList = null;
      for (let i = 0; i < tempTickers.length; i++) {
        const tempTicker = tempTickers[i];
        const listItem = watchlist[tempTicker];
        const { price } = listItem;
        const {
          currentPrice,
          previousCloseChange,
          previousCloseChangePercent,
        } = newPrices[i];

        if (price === currentPrice) continue;

        const newItem = {
          ...listItem,
          price: currentPrice,
          previousCloseChange,
          previousCloseChangePercent,
        };

        allPromises.push(
          http.put(`/api/watchlist/${currentTab.value}/${tempTicker}`, {
            newItem,
          })
        );

        newList = {
          ...newList,
          [tempTicker]: newItem,
        };
      }

      if (allPromises.length !== 0) await Promise.allSettled(allPromises);

      return newList ? { ...watchlist, ...newList } : watchlist;
    }

    async function fetchNewPrices(tempTickers, watchlist) {
      const listPromises = tempTickers.map((temTicker) => {
        const ticker = watchlist[temTicker].ticker;
        return http.get(`/api/latestPrice/${ticker}`);
      });
      try {
        const res = await Promise.allSettled(listPromises);
        const newPrices = res.map((item) => item.value.data.result);
        return newPrices;
      } catch (error) {
        console.log("error", error);
      }
    }

    function getCacheList(currentTab) {
      const cacheList = {
        ...cachedList.value[currentTab]?.currentWatchlist,
      };

      for (let ticker in cacheList) {
        if (cacheList[ticker].isDelete === true) {
          cacheList[ticker].isDelete = false;
        }
      }

      return {
        ...cacheList,
      };
    }

    function setCacheList(currentWatchlist) {
      const cacheList = {
        isEmpty: true,
        currentWatchlist,
      };

      if (currentWatchlist) {
        cacheList.isEmpty = Object.keys(currentWatchlist).length === 0;
      }

      return cacheList;
    }

    return {
      searchListSkeletonContent,
      searchList,
      isSearchListLoading,
      isFocus,
      getSearchList,
      toggleSearchList,
      toggleSearchListSkeleton,

      currentTab,
      loadWatchlist,
      watchlistDisplay,
      watchlistTableSkeletonContent,
      isWatchlistLoading,
      isAddingProcess,
      toggleLoadingEffect,
      setSkeletonTableRow,
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