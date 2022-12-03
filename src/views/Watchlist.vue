<template>
  <main
    class="flex flex-col gap-3 px-4 md:p-10 mx-auto w-full"
    @click="clickOutsideClose($event)"
  >
    <div class="relative w-full pb-14" v-show="!isWatchlistLoading">
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
            @setSkeletonTableRow="setSkeletonTableRow"
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
      :watchlistArr="watchlistArr"
      :updatedTickers="updatedTickers"
      @loadWatchlist="loadWatchlist"
      @toggleLoadingEffect="toggleLoadingEffect"
      @setSkeletonTableRow="setSkeletonTableRow"
      @sortList="(n) => (latestSortRules = n)"
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
import useUpdateList from "@/composables/useUpdateList.js";
import useSort from "@/composables/useSort.js";
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
    const { tabs, cachedList } = storeToRefs($store);

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
    http.get(`/api/watchlist`).then((res) => {
      $store.setTabs(res.data.result);
      loadWatchlist({ status: "init" });
    });

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
    const watchlistArr = ref(null);

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
    const { sortList, latestSortRules } = useSort();

    watch(latestSortRules, () =>
      displayWatchlist(watchlistArr.value, currentTab.value)
    );

    function showListOnTickersChanged(params, status) {
      const cacheList = getCacheList(currentTab.value);
      let unorderedList = null;

      switch (status) {
        case "addTicker": {
          console.log(`%c addTicker`, "background:green; color:#efefef");
          unorderedList = [...cacheList, params];
          break;
        }
        case "deleteTicker": {
          console.log(`%c deleteTicker`, "background:green; color:#efefef");
          unorderedList = [...cacheList].filter(
            (item) => params.indexOf(item.tempTicker) === -1
          );
          setSkeletonTableRow({ list: unorderedList });
          break;
        }
        default: {
          console.log(`%c 意外發生`, "background:green; color:#efefef");
          break;
        }
      }

      console.log(`%c toggleLoadingEffect`, "background:pink; color:white");

      toggleLoadingEffect(false);

      return unorderedList;
    }

    function resetResume() {
      console.log(
        `%c resetResume ${timeoutId.value}`,
        "background:orange; color:black"
      );
      clearTimeout(timeoutId.value);
      toUpdateTickers.value.length = 0;
      resumeList.value.length = 0;
      isUpdate.value = false;
    }

    const isUpdate = ref(false);
    const btnMsg = ref("Latest price");
    const toUpdateTickers = ref([]);
    const resumeList = ref([]);
    const timeoutId = ref(null);
    const currentStatus = ref(null);
    const changeCount = ref(0);
    const {
      updateList,
      fetchMarketData,
      checkMarketState,
      updateMarketData,
      isUpdateError,
      currentTab,
    } = useUpdateList();

    watch(currentTab, () => {
      changeCount.value = 0;
      loadWatchlist({ status: "switch" });
    });

    function getStatusChanged(status) {
      let statusChanged = "";

      if (status === "addTicker" || status === "deleteTicker") {
        changeCount.value++;
        statusChanged = status + changeCount.value;
      } else {
        statusChanged = status;
      }

      console.log(
        `%c statusChanged:${statusChanged}`,
        "background:pink;color:black"
      );

      return statusChanged;
    }

    async function useCacheData(params, tabName, status, statusChanged) {
      console.log("useCacheData params", params);

      let isUseCache = false;

      switch (status) {
        case "init": {
          break;
        }
        case "switch": {
          const cachedTabs = Object.keys(cachedList.value);
          const isInCachedTabs = cachedTabs.includes(tabName);
          if (!isInCachedTabs) break;

          isUseCache = true;

          const cacheList = getCacheList(tabName);
          console.log("第二次 switch cacheList", cacheList);

          displayWatchlist(cacheList, tabName);
          isAllMarketClose.value = checkMarketState(cacheList);

          // if (!isAllMarketClose.value) {
          //   await checkResumeFlow(cacheList, tabName, statusChanged);
          // }

          await checkResumeFlow(cacheList, tabName, statusChanged);

          break;
        }
        default: {
          isUseCache = true;

          const unorderedList = showListOnTickersChanged(params, status);
          console.log("useCacheData unorderedList", unorderedList);

          displayWatchlist(unorderedList, tabName);

          if (unorderedList.length === 0) break;

          isAllMarketClose.value = checkMarketState(unorderedList);

          // if (!isAllMarketClose.value) {
          //   await checkResumeFlow(unorderedList, tabName, statusChanged);
          // }

          await checkResumeFlow(unorderedList, tabName, statusChanged);

          break;
        }
      }

      return isUseCache;
    }

    // status: init, switch, deleteTicker, addTicker
    async function loadWatchlist({ status, params }) {
      console.log(">>>loadWatchlist params<<<", params);
      const statusChanged = getStatusChanged(status);
      const tabName = currentTab.value;

      setCurrentStatus(statusChanged);
      resetResume();

      // 檢查 list 為空時停止往下執行
      if (status === "init" || status === "switch") {
        const currentTabInfo = tabs.value.find((tab) => tab.name === tabName);

        if (currentTabInfo.listLength === 0) {
          watchlistArr.value = null;
          cachedList.value[tabName] = setCacheList([]);
          return;
        }
      }

      // 用 cache
      const isUseCache = await useCacheData(
        params,
        tabName,
        status,
        statusChanged
      );
      console.log("isUseCache", isUseCache);
      if (isUseCache) return;

      console.log("沒用 cache");

      try {
        toggleLoadingEffect(true);

        const watchlistRes = await http.get(`/api/tickers/${tabName}`);
        const watchlist = watchlistRes.data.result;
        console.log("watchlist", watchlist);

        setSkeletonTableRow({ list: watchlist });

        const newList = await updateList(watchlist, tabName);
        displayWatchlist(newList, tabName);

        toggleLoadingEffect(false);

        await checkResumeFlow(newList, tabName, statusChanged);
      } catch (error) {
        console.log("error", error);
      }
    }

    function displayWatchlist(watchlist = watchlistArr.value, tabName) {
      console.log(
        `||| displayWatchlist ||| tabName:${tabName}, currentTab:${currentTab.value}`
      );

      if (tabName !== currentTab.value) {
        console.log("displayWatchlist tab 有衝突");
        return;
      }

      const orderedList = sortList(latestSortRules.value, watchlist);

      watchlistArr.value = orderedList;
      cachedList.value[tabName] = setCacheList(watchlist);

      // if (!isUpdate.value) btnMsg.value = "Latest price";
      btnMsg.value = "Latest price";
      return orderedList;
    }

    const isAllMarketClose = ref(true);

    async function checkResumeFlow(watchlist, tabName, status) {
      console.log("---------checkResumeFlow---------");

      isAllMarketClose.value = checkMarketState(watchlist);
      console.log("isAllMarketClose", isAllMarketClose.value);
      // if (!isAllMarketClose.value) await startTimer(watchlist, tabName, status);

      await startTimer(watchlist, tabName, status);
    }

    // 自動倒數計時更新
    function startTimer(watchlist, tabName, status) {
      console.log(`%c startTimer ${tabName}`, "background:blue; color:#efefef");
      return new Promise((resolve, reject) => {
        timeoutId.value = setTimeout(async () => {
          await resumeFlow(watchlist, tabName, status);
          resolve();
        }, 5000);

        // console.log("timeoutId after", timeoutId.value);
      });
    }

    const updatedTickers = ref([]);

    async function resumeFlow(watchlist, tabName, status) {
      updatedTickers.value.length = 0;

      console.log(
        `%c resumeFlow ${currentStatus.value}`,
        "background:red; color:#efefef"
      );

      const newMarketData = await fetchMarketData(watchlist);
      // console.log("resumeFlow newMarketData", newMarketData);

      const hasLostData = newMarketData.indexOf(null) !== -1;
      if (hasLostData) {
        console.log("遺失資料了！！！");

        await checkResumeFlow(newList, currentTab.value, currentStatus.value);
        return;
      }

      const [toUpdateTickers, newList] = resumeFlowCheckUpdate(
        newMarketData,
        watchlist
      );

      const hasUpdateData = toUpdateTickers.length !== 0;
      const isCurrentTab = tabName === currentTab.value;
      const isCurrentStatus = status === currentStatus.value;

      console.log(`status:${status}, currentStatus:${currentStatus.value}`);
      console.log(`tabName:${tabName}, currentTab:${currentTab.value}`);

      // 重新倒數更新 tab 有衝突
      if (!hasUpdateData && !isCurrentTab) {
        console.log(`重新倒數更新 tab 有衝突`);
        return;
      }

      if (!hasUpdateData && !isCurrentStatus) {
        console.log(`重新倒數更新 status 有衝突`);
        return;
      }

      // 盤中價格尚未改變，重新倒數更新
      if (!hasUpdateData) {
        console.log("盤中價格尚未改變，重新倒數更新");
        // setCurrentStatus(null);
        await checkResumeFlow(newList, tabName, status);
        return;
      }

      // resumeFlow tab 有衝突
      if (!isCurrentTab) {
        console.log(`resumeFlow tab 有衝突`);
        return;
      }

      if (!isCurrentStatus) {
        console.log(`resumeFlow status 有衝突`);
        return;
      }

      console.log("！！！！！全過！！！！！");

      const allPromises = toUpdateTickers.map((obj) => {
        const url = `/api/ticker/${currentTab.value}/${obj.tempTicker}`;
        return http.put(url, { newItem: obj.newItem });
      });

      console.log("更新至資料庫");

      const updatedTickersArr = await updateMarketData(allPromises);
      console.log("resumeFlow updatedTickersArr", updatedTickersArr);

      showUpdatedTickers(updatedTickersArr);
      displayWatchlist(newList, currentTab.value);
      await checkResumeFlow(newList, currentTab.value, currentStatus.value);
    }

    function resumeFlowCheckUpdate(newMarketData, watchlist) {
      const newList = [...watchlist];
      const toUpdateTickers = [];

      for (let i = 0; i < watchlist.length; i++) {
        const { price, tempTicker } = watchlist[i];
        // if (price === newMarketData[i].price) continue;

        newList[i] = { ...watchlist[i], ...newMarketData[i] };

        if (isUpdateError(newList[i], newMarketData[i])) continue;

        console.log("都沒錯");

        toUpdateTickers.push({ tempTicker, newItem: newMarketData[i] });
      }

      console.log("R toUpdateTickers", toUpdateTickers);

      return [toUpdateTickers, newList];
    }

    function showUpdatedTickers(resolvedPromise) {
      updatedTickers.value = resolvedPromise.map(
        (item) => item.value.data.result
      );
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

    function setCurrentStatus(status) {
      currentStatus.value = status;
    }

    function clickUpdate() {}

    // async function clickUpdate() {
    //   if (toUpdateTickers.value.length === 0) return;

    //   toggleLoadingEffect(true);

    //   console.log("clickUpdate 資料更新中");
    //   btnMsg.value = "Updating...";
    //   isUpdate.value = false;
    //   updatedTickers.value.length = 0;

    //   const updatePromise = toUpdateTickers.value.map((obj) => {
    //     const url = `/api/ticker/${currentTab.value}/${obj.tempTicker}`;
    //     return http.put(url, { newItem: obj.newData });
    //   });

    //   const resolvedPromise = await Promise.allSettled(updatePromise);

    //   displayWatchlist(resumeList.value);
    //   toggleLoadingEffect(false);
    //   showUpdatedTickers(resolvedPromise);
    //   await checkResumeFlow(resumeList.value);
    // }

    // async function resumeFlow(watchlist) {
    //   console.log(
    //     `%c resumeFlow ${currentStatus.value}`,
    //     "background:red; color:#efefef"
    //   );

    //   const newMarketData = await fetchMarketData(watchlist);
    //   console.log("resumeFlow newMarketData", newMarketData);

    //   const newList = [...watchlist];
    //   const tempTickers = [];

    //   for (let i = 0; i < watchlist.length; i++) {
    //     const { price, tempTicker } = watchlist[i];
    //     // if (price === newMarketData[i].price) continue

    //     newList[i] = { ...watchlist[i], ...newMarketData[i] };

    //     tempTickers.push({ tempTicker, newData: newMarketData[i] });
    //   }

    //   console.log("resumeFlow newList", newList);

    //   // 如果盤中價格尚未改變，重新倒數更新
    //   if (tempTickers.length === 0) {
    //     console.log("盤中價格尚未改變，重新倒數更新");

    //     resetResume();
    //     setCurrentStatus(null);
    //     await checkResumeFlow(newList);
    //     return;
    //   }

    //   toUpdateTickers.value = [...tempTickers];
    //   resumeList.value = [...newList];
    // }

    //     watch(
    //   toUpdateTickers,
    //   async (tickers) => {
    //     if (tickers.length === 0) return;
    //     console.log("watch 有新資料", tickers);
    //     console.log(`現在 currentStatus 為 ${currentStatus.value}`);

    //     /*
    //     在進行 resumeFlow 時剛好新增、刪除、switch，如果剛好有 newPm，此為新增或刪除前的資料，如沒擋掉則更新後還是會呈現舊資料，造成已刪除的資料呈現在畫面上
    //     */

    //     if (currentStatus.value !== "init" && currentStatus.value != null) {
    //       console.log("～～～～ 進判斷 ～～～～");

    //       setCurrentStatus(null);
    //       resetResume();
    //       // await checkResumeFlow(watchlistArr.value);
    //       return;
    //     }

    //     console.log("xxxx 沒進判斷 xxxx");

    //     btnMsg.value = "Update price";
    //     isUpdate.value = true;
    //   },
    //   { deep: true }
    // );

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
      watchlistArr,
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
      updatedTickers,
      latestSortRules,
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