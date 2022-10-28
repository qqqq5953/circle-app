<template>
  <main
    class="flex flex-col gap-3 px-4 md:p-10 mx-auto w-full"
    @click="clickOutsideClose($event)"
  >
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
    >
      <template #update-btn>
        <button
          class="
            py-0.5
            px-1.5
            block
            text-xs
            rounded
            border border-slate-400
            text-slate-400
            hover:bg-slate-400 hover:text-white
            disabled:border
            disabled:px-0
            disabled:border-white
            disabled:bg-white
            disabled:text-slate-400
          "
          @click="clickUpdate"
          :disabled="isDisabled"
        >
          {{ msg }}
        </button>
      </template>
    </WatchlistTable>
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

    const clickOutsideClose = (e) => {
      const isAddButtonClick = e.target.nodeName === "I";
      const isInputFocus = e.target.nodeName === "INPUT";
      const isNavClick = hasParentElement(e, "nav");
      const isSearchBarFocus =
        isInputFocus && hasParentElement(e, "#searchBar");

      if (isAddButtonClick) return;
      if (!isSearchBarFocus && !isNavClick) isFocus.value = false;
      if (isSearchBarFocus) isFocus.value = true;
    };

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
      showNewList(orderedList);
    }

    function showListOnDeleting(payload) {
      let newList = null;
      const cacheList = getCacheList(currentTab.value);

      for (let i = 0; i < payload.length; i++) {
        const ticker = payload[i];
        const { [ticker]: _, ...rest } = newList || cacheList;
        newList = rest;
      }

      showNewList(newList);
    }

    const isDisabled = ref(true);
    const msg = ref("Latest price");
    const resumePromises = ref([]);
    const resumeList = ref(null);
    const timeoutId = ref(null);

    function resetResume() {
      resumePromises.value.length = 0;
      resumeList.value = null;
      isDisabled.value = true;
      clearTimeout(timeoutId.value);
    }

    // status: init, switch, deleteTicker, addTicker
    async function loadWatchlist({ status, payload }) {
      resetResume();

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
            checkResumeFlow(watchlistDisplay.value);
            return; // 第二次 switch
          } else {
            break; // 第一次 switch
          }

        case "addTicker": {
          showListOnAdding(payload);
          toggleLoadingEffect(false);
          checkResumeFlow(watchlistDisplay.value);
          return;
        }

        case "deleteTicker": {
          showListOnDeleting(payload);
          toggleLoadingEffect(false);
          checkResumeFlow(watchlistDisplay.value);
          return;
        }
      }
      toggleLoadingEffect(true);

      try {
        const tempRes = await http.get(`/api/watchlist/${currentTab.value}`);
        const watchlist = tempRes.data.result;

        setSkeletonTableRow({ list: watchlist });

        const currentWatchlist = await updateList(watchlist);
        showNewList(currentWatchlist);

        toggleLoadingEffect(false);

        await checkResumeFlow(currentWatchlist);
      } catch (error) {
        console.log("error", error);
      }
    }

    async function updateList(watchlist) {
      const tempTickers = Object.keys(watchlist);
      const newMarketData = await fetchMarketData(tempTickers, watchlist);
      console.log("updateList newMarketData", newMarketData);
      const [allPromises, currentWatchlist] = checkUpdate(
        tempTickers,
        newMarketData,
        watchlist
      );

      console.log("updateList currentWatchlist", currentWatchlist);

      if (allPromises.length !== 0) await updateMarketData(allPromises);
      return currentWatchlist;
    }

    async function fetchMarketData(tempTickers, watchlist) {
      const listPromises = tempTickers.map((tempTicker) => {
        const ticker = watchlist[tempTicker].ticker;
        return http.get(`/api/latestMarketData/${ticker}`);
      });

      try {
        const res = await Promise.allSettled(listPromises);
        const newMarketData = res.map((item) => item.value.data.result);
        return newMarketData;
      } catch (error) {
        console.log("error", error);
      }
    }

    function checkUpdate(tempTickers, newMarketData, watchlist) {
      let newList = null;
      const allPromises = [];

      for (let i = 0; i < tempTickers.length; i++) {
        const tempTicker = tempTickers[i];
        const listItem = watchlist[tempTicker];
        const { price } = listItem;
        const {
          currentPrice,
          previousCloseChange,
          previousCloseChangePercent,
          marketState,
        } = newMarketData[i];

        if (price === currentPrice) continue;

        const newItem = {
          ...listItem,
          price: currentPrice,
          previousCloseChange,
          previousCloseChangePercent,
          marketState,
        };

        newList = {
          ...newList,
          [tempTicker]: newItem,
        };

        allPromises.push(
          http.put(`/api/watchlist/${currentTab.value}/${tempTicker}`, {
            newItem,
          })
        );
      }

      const currentWatchlist = newList
        ? { ...watchlist, ...newList }
        : watchlist;

      return [allPromises, currentWatchlist];
    }

    async function updateMarketData(allPromises) {
      await Promise.allSettled(allPromises);
    }

    function showNewList(watchlist) {
      console.log("showNewList watchlist", watchlist);
      watchlistDisplay.value = watchlist;
      cachedList.value[currentTab.value] = setCacheList(watchlist);
      msg.value = "Latest price";
    }

    async function checkResumeFlow(watchlist) {
      const isAllMarketClose = checkMarketState(watchlist);
      console.log("isAllMarketClose", isAllMarketClose);
      if (!isAllMarketClose) await startTimer(watchlist);
    }

    // 自動倒數計時更新
    function checkMarketState(watchlist) {
      const marketStateIdx = Object.values(watchlist).findIndex(
        (item) => item.marketState === "REGULAR"
      );
      const isAllMarketClose = marketStateIdx === -1;
      return isAllMarketClose;
    }

    function startTimer(watchlist) {
      console.log(
        `%c startTimer ${currentTab.value}`,
        "background:blue; color:#efefef"
      );
      return new Promise((resolve, reject) => {
        timeoutId.value = setTimeout(async () => {
          await resumeFlow(watchlist);
          resolve();
        }, 5000);
      });
    }

    async function resumeFlow(watchlist) {
      console.log(
        `%c resumeFlow ${currentTab.value}`,
        "background:red; color:#efefef"
      );

      const tempTickers = Object.keys(watchlist);
      const newMarketData = await fetchMarketData(tempTickers, watchlist);
      console.log("resumeFlow newMarketData", newMarketData);

      const [allPromises, currentWatchlist] = checkUpdate(
        tempTickers,
        newMarketData,
        watchlist
      );

      // 如果盤中價格尚未改變，重新倒數更新
      if (allPromises.length === 0) {
        console.log("盤中價格尚未改變，重新倒數更新");
        checkResumeFlow(currentWatchlist);
        return;
      }

      resumePromises.value = [...allPromises];
      resumeList.value = { ...currentWatchlist };
    }

    watch(
      resumePromises,
      (newPm) => {
        if (newPm.length === 0) return;
        console.log("有新資料", newPm);
        msg.value = "Update price";
        isDisabled.value = false;
      },
      { deep: true }
    );

    async function clickUpdate() {
      if (resumePromises.value.length === 0) return;

      // 有新資料
      toggleLoadingEffect(true);

      console.log("資料更新中");
      msg.value = "Updating...";
      isDisabled.value = true;

      await Promise.allSettled(resumePromises.value);
      resumePromises.value.length = 0;

      const currentWatchlist = resumeList.value
        ? { ...watchlistDisplay.value, ...resumeList.value }
        : watchlistDisplay.value;

      showNewList(currentWatchlist);

      toggleLoadingEffect(false);

      await checkResumeFlow(currentWatchlist);
    }

    function getCacheList(currentTab) {
      const cacheList = {
        ...cachedList.value[currentTab]?.currentWatchlist,
      };

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

      clickOutsideClose,
      clickUpdate,
      isDisabled,
      msg,
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