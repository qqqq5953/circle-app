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
      :updatedTicker="updatedTicker"
      @loadWatchlist="loadWatchlist"
      @toggleLoadingEffect="toggleLoadingEffect"
      @setSkeletonTableRow="setSkeletonTableRow"
      @sortList="displayWatchlist"
      v-show="!isWatchlistLoading"
    >
      <template #update-btn>
        <div class="text-xs text-slate-400">
          <button
            class="
              py-0.5
              px-1.5
              rounded
              border border-slate-400
              hover:bg-slate-400 hover:text-white
            "
            @click="clickUpdate"
            v-if="isUpdate"
          >
            {{ btnMsg }}
          </button>
          <div class="border border-white" v-else>{{ btnMsg }}</div>
        </div>
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

    http.get(`/api/watchlist`).then((res) => {
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
        watchlistTableSkeletonContent.value.tableBody.tr = list.length;
      }
    };

    const toggleLoadingEffect = (isActivate) => {
      toggleAddButtonSpinner(isActivate);
      toggleWatchlistSkeleton(isActivate);
    };

    // sort
    const latestSortRules = ref({
      category: "previousCloseChangePercent",
      direction: "descending",
    });

    function sortList(sortRules, watchlist) {
      const orderedList = [...watchlist].sort((a, b) =>
        showSortResult(sortRules, { a, b })
      );
      return orderedList;
    }

    function showSortResult(sortRules, { a, b }) {
      const { category, direction } = sortRules;

      latestSortRules.value.category = category;
      latestSortRules.value.direction = direction;

      const rulesMap = {
        tempTicker_descending: () => {
          if (a[category] > b[category]) return -1;
          if (a[category] < b[category]) return 1;
          return 0;
        },
        tempTicker_ascending: () => {
          if (a[category] < b[category]) return -1;
          if (a[category] > b[category]) return 1;
          return 0;
        },
        price_descending: b[category] - a[category],
        price_ascending: a[category] - b[category],
        previousCloseChange_descending: b[category] - a[category],
        previousCloseChange_ascending: a[category] - b[category],
        previousCloseChangePercent_descending: b[category] - a[category],
        previousCloseChangePercent_ascending: a[category] - b[category],
      };

      const rule = `${category}_${direction}`;
      const sortResult = rulesMap[rule];

      switch (typeof sortResult) {
        case "number": {
          return sortResult;
        }
        case "function": {
          return sortResult();
        }
        default:
          return 0;
      }
    }

    async function showListOnAdding(payload) {
      resetResume();

      const cacheList = getCacheList(currentTab.value);
      const unorderedList = [...cacheList];
      unorderedList.push(payload);

      setSkeletonTableRow({ list: unorderedList });

      const newList = displayWatchlist(latestSortRules.value, unorderedList);
      return newList;
    }

    async function showListOnDeleting(payload) {
      resetResume();

      const cacheList = getCacheList(currentTab.value);
      const unorderedList = [...cacheList].filter((item) => {
        return payload.indexOf(item.tempTicker) === -1;
      });

      setSkeletonTableRow({ list: unorderedList });

      const newList = displayWatchlist(latestSortRules.value, unorderedList);
      return newList;
    }

    function resetResume() {
      resumePromises.value.length = 0;
      resumeList.value = null;
      isUpdate.value = false;
      clearTimeout(timeoutId.value);
    }

    const isUpdate = ref(false);
    const btnMsg = ref("Latest price");
    const resumePromises = ref([]);
    const resumeList = ref(null);
    const timeoutId = ref(null);
    const globalStatus = ref(null);

    // status: init, switch, deleteTicker, addTicker
    async function loadWatchlist({ status, payload }) {
      globalStatus.value = status;

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
        case "switch": {
          const cachedTabs = Object.keys(cachedList.value);
          const isInCachedTabs = cachedTabs.includes(currentTab.value);

          if (isInCachedTabs) {
            const cacheList = getCacheList(currentTab.value);

            watchlistDisplay.value = displayWatchlist(
              latestSortRules.value,
              cacheList
            );

            await checkResumeFlow(watchlistDisplay.value);
            return; // 第二次 switch
          } else {
            break; // 第一次 switch
          }
        }

        case "addTicker": {
          console.log(`%c addTicker`, "background:green; color:#efefef");

          const newList = await showListOnAdding(payload);
          toggleLoadingEffect(false);

          isAllMarketClose.value = checkMarketState(newList);
          if (!isAllMarketClose.value) await resumeFlow(newList);

          return;
        }

        case "deleteTicker": {
          console.log(`%c deleteTicker`, "background:green; color:#efefef");

          const newList = await showListOnDeleting(payload);
          toggleLoadingEffect(false);

          isAllMarketClose.value = checkMarketState(newList);
          if (!isAllMarketClose.value) await resumeFlow(newList);

          return;
        }
      }

      try {
        toggleLoadingEffect(true);

        const tempRes = await http.get(`/api/tickers/${currentTab.value}`);
        const watchlist = tempRes.data.result;

        setSkeletonTableRow({ list: watchlist });

        const currentWatchlist = await updateList(watchlist);
        displayWatchlist(latestSortRules.value, currentWatchlist);

        toggleLoadingEffect(false);

        await checkResumeFlow(currentWatchlist);
      } catch (error) {
        console.log("error", error);
      }
    }

    async function updateList(watchlist) {
      const newMarketData = await fetchMarketData(watchlist);
      console.log("updateList newMarketData", newMarketData);
      const [allPromises, currentWatchlist] = checkUpdate(
        newMarketData,
        watchlist
      );

      console.log("updateList currentWatchlist", currentWatchlist);

      if (allPromises.length !== 0) await updateMarketData(allPromises);
      return currentWatchlist;
    }

    async function fetchMarketData(watchlist) {
      const listPromises = watchlist.map((item) => {
        return http.get(`/api/latestMarketData/${item.ticker}`);
      });

      try {
        const res = await Promise.allSettled(listPromises);
        const newMarketData = res.map((item) => item.value.data.result);
        return newMarketData;
      } catch (error) {
        console.log("error", error);
      }
    }

    function checkUpdate(newMarketData, watchlist) {
      const newList = [...watchlist];
      const allPromises = [];

      for (let i = 0; i < watchlist.length; i++) {
        const item = watchlist[i];
        const { price } = item;
        const {
          currentPrice,
          previousCloseChange,
          previousCloseChangePercent,
          marketState,
        } = newMarketData[i];

        if (price === currentPrice) continue;

        const newItem = {
          ...item,
          price: currentPrice,
          previousCloseChange,
          previousCloseChangePercent,
          marketState,
        };

        newList[i] = newItem;

        allPromises.push(
          http.put(`/api/ticker/${currentTab.value}/${item.tempTicker}`, {
            newItem,
          })
        );
      }

      return [allPromises, newList];
    }

    async function updateMarketData(allPromises) {
      await Promise.allSettled(allPromises);
    }

    function displayWatchlist(sortRules, watchlist = watchlistDisplay.value) {
      latestSortRules.value = sortRules;

      const orderedList = sortList(sortRules, watchlist);
      watchlistDisplay.value = orderedList;
      cachedList.value[currentTab.value] = setCacheList(watchlist);
      console.log(
        "displayWatchlist cachedList",
        cachedList.value[currentTab.value].currentWatchlist
      );

      if (!isUpdate.value) btnMsg.value = "Latest price";

      return orderedList;
    }

    const isAllMarketClose = ref(true);

    async function checkResumeFlow(watchlist) {
      // resetResume();

      isAllMarketClose.value = checkMarketState(watchlist);
      console.log("isAllMarketClose", isAllMarketClose.value);
      if (!isAllMarketClose.value) {
        await startTimer(watchlist);
      }
    }

    // 自動倒數計時更新
    function checkMarketState(watchlist) {
      const marketStateIdx = watchlist.findIndex(
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
      if (isAllMarketClose.value) {
        resumePromises.value.length = 0;
        resumeList.value = null;
        return;
      }

      console.log(
        `%c resumeFlow ${globalStatus.value}`,
        "background:red; color:#efefef"
      );

      const newMarketData = await fetchMarketData(watchlist);
      console.log("resumeFlow newMarketData", newMarketData);

      const [allPromises, currentWatchlist] = checkUpdate(
        newMarketData,
        watchlist
      );

      console.log("resumeFlow currentWatchlist", currentWatchlist);

      // 如果盤中價格尚未改變，重新倒數更新
      if (allPromises.length === 0) {
        console.log("盤中價格尚未改變，重新倒數更新");
        await checkResumeFlow(currentWatchlist);
        return;
      }

      resumePromises.value = [...allPromises];
      resumeList.value = [...currentWatchlist];
    }

    watch(
      resumePromises,
      async (newPm) => {
        if (newPm.length === 0) return;
        console.log("有新資料", newPm);

        /*
        在進行 resumeFlow 時剛好新增或刪除，如果剛好有 newPm，此為新增或刪除前的資料，如沒擋掉則更新後還是會呈現舊資料，造成已刪除的資料呈現在畫面上
        */

        if (
          globalStatus.value === "deleteTicker" ||
          globalStatus.value === "addTicker"
        ) {
          globalStatus.value = null;

          resetResume();
          await checkResumeFlow(watchlistDisplay.value);
          return;
        }

        btnMsg.value = "Update price";
        isUpdate.value = true;
      },
      { deep: true }
    );

    const updatedTicker = ref([]);

    async function clickUpdate() {
      if (resumePromises.value.length === 0) return;

      toggleLoadingEffect(true);

      console.log("資料更新中");
      btnMsg.value = "Updating...";
      isUpdate.value = false;
      updatedTicker.value.length = 0;

      const resolvePromise = await Promise.allSettled(resumePromises.value);
      resolvePromise.forEach((item) => {
        console.log("更新的股票", item.value.data.result);
        updatedTicker.value.push(item.value.data.result);
      });

      resumePromises.value.length = 0;

      displayWatchlist(latestSortRules.value, resumeList.value);
      toggleLoadingEffect(false);
      await checkResumeFlow(resumeList.value);
    }

    function getCacheList(currentTab) {
      const cacheList = Object.values({
        ...cachedList.value[currentTab]?.currentWatchlist,
      });

      return cacheList;
    }

    function setCacheList(currentWatchlist) {
      const cacheList = {
        isEmpty: !!currentWatchlist,
        currentWatchlist,
      };

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
      isUpdate,
      btnMsg,

      displayWatchlist,
      updatedTicker,
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