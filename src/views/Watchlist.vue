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

    watch(latestSortRules, () => displayWatchlist(watchlistArr.value));

    async function showListOnAdding(addedTickerObj) {
      // resetResume();

      const cacheList = getCacheList(currentTab.value);
      const unorderedList = [...cacheList, addedTickerObj];

      setSkeletonTableRow({ list: unorderedList });

      const newList = displayWatchlist(unorderedList);
      return newList;
    }

    async function showListOnDeleting(deletedTickers) {
      // resetResume();

      const cacheList = getCacheList(currentTab.value);
      const unorderedList = [...cacheList].filter((item) => {
        return deletedTickers.indexOf(item.tempTicker) === -1;
      });

      setSkeletonTableRow({ list: unorderedList });

      const newList = displayWatchlist(unorderedList);
      return newList;
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
    const {
      updateList,
      fetchMarketData,
      checkMarketState,
      currentTab,
      checkUpdate,
    } = useUpdateList();

    watch(currentTab, () => loadWatchlist({ status: "switch" }));

    // status: init, switch, deleteTicker, addTicker
    async function loadWatchlist({ status, addedTickerObj, deletedTickers }) {
      console.log(`%c status:${status}`, "background:pink;color:black");
      setCurrentStatus(status);
      resetResume();

      // 檢查 list 沒內容時停止執行後續
      if (status === "init" || status === "switch") {
        const currentTabInfo = tabs.value.find(
          (tab) => tab.name === currentTab.value
        );

        if (currentTabInfo.listLength === 0) {
          watchlistArr.value = null;
          cachedList.value[currentTab.value] = setCacheList([]);
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
            console.log("第二次 switch cacheList", cacheList);

            watchlistArr.value = displayWatchlist(cacheList);

            await checkResumeFlow(watchlistArr.value);
            return; // 第二次 switch
          } else {
            console.log("第一次 switch");
            break; // 第一次 switch
          }
        }

        case "addTicker": {
          console.log(`%c addTicker`, "background:green; color:#efefef");

          const newList = await showListOnAdding(addedTickerObj);
          toggleLoadingEffect(false);

          isAllMarketClose.value = checkMarketState(newList);
          // if (!isAllMarketClose.value) await resumeFlow(newList);

          await resumeFlow(newList);

          return;
        }

        case "deleteTicker": {
          console.log(`%c deleteTicker`, "background:green; color:#efefef");

          const newList = await showListOnDeleting(deletedTickers);
          toggleLoadingEffect(false);

          isAllMarketClose.value = checkMarketState(newList);
          if (!isAllMarketClose.value) await resumeFlow(newList);

          return;
        }
      }

      try {
        toggleLoadingEffect(true);
        const tabName = currentTab.value;

        const watchlistRes = await http.get(`/api/tickers/${currentTab.value}`);
        const watchlist = watchlistRes.data.result;

        setSkeletonTableRow({ list: watchlist });

        const currentWatchlist = await updateList(watchlist, tabName);
        console.log("currentWatchlist", currentWatchlist);
        displayWatchlist(currentWatchlist, tabName);

        toggleLoadingEffect(false);

        await checkResumeFlow(currentWatchlist, tabName);
      } catch (error) {
        console.log("error", error);
      }
    }

    function displayWatchlist(watchlist = watchlistArr.value, tabName) {
      console.log("---------displayWatchlist---------");
      const orderedList = sortList(latestSortRules.value, watchlist);
      watchlistArr.value = orderedList;
      cachedList.value[tabName] = setCacheList(watchlist);

      // if (!isUpdate.value) btnMsg.value = "Latest price";
      btnMsg.value = "Latest price";
      return orderedList;
    }

    const isAllMarketClose = ref(true);

    async function checkResumeFlow(watchlist, tabName) {
      isAllMarketClose.value = checkMarketState(watchlist);
      console.log("isAllMarketClose", isAllMarketClose.value);
      if (!isAllMarketClose.value) await startTimer(watchlist, tabName);

      // await startTimer(watchlist);
    }

    // 自動倒數計時更新
    function startTimer(watchlist, tabName) {
      console.log(`%c startTimer ${tabName}`, "background:blue; color:#efefef");
      return new Promise((resolve, reject) => {
        timeoutId.value = setTimeout(async () => {
          await resumeFlow(watchlist, tabName);
          resolve();
        }, 5000);

        console.log("timeoutId after", timeoutId.value);
      });
    }

    const tabNameBeforeUpdate = ref(null);

    async function resumeFlow(watchlist, tabName) {
      console.log(
        `%c resumeFlow ${currentStatus.value}`,
        "background:red; color:#efefef"
      );

      const newMarketData = await fetchMarketData(watchlist);
      console.log("resumeFlow newMarketData", newMarketData);

      const [allPromises, currentWatchlist] = checkUpdate(
        newMarketData,
        watchlist,
        tabName
      );

      console.log("resumeFlow currentWatchlist", currentWatchlist);

      // 如果盤中價格尚未改變，重新倒數更新
      if (allPromises.length === 0) {
        console.log("盤中價格尚未改變，重新倒數更新");

        resetResume();
        setCurrentStatus(null);
        await checkResumeFlow(currentWatchlist, tabName);
        return;
      }

      tabNameBeforeUpdate.value = tabName;

      toUpdateTickers.value = [...allPromises];
      resumeList.value = [...currentWatchlist];
    }

    watch(
      toUpdateTickers,
      async (tickers) => {
        if (tickers.length === 0) return;
        console.log("watch 有新資料", tickers);
        console.log(`現在 currentStatus 為 ${currentStatus.value}`);

        /*
        在進行 resumeFlow 時剛好新增、刪除、switch，如果剛好有 newPm，此為新增或刪除前的資料，如沒擋掉則更新後還是會呈現舊資料，造成已刪除的資料呈現在畫面上
        */

        if (currentStatus.value !== "init" && currentStatus.value != null) {
          console.log("～～～～ 進判斷 ～～～～");

          setCurrentStatus(null);
          resetResume();
          // await checkResumeFlow(watchlistArr.value);
          return;
        }

        console.log("xxxx 沒進判斷 xxxx");

        btnMsg.value = "Update price";
        isUpdate.value = true;
      },
      { deep: true }
    );

    const updatedTickers = ref([]);

    async function clickUpdate() {
      if (toUpdateTickers.value.length === 0) return;

      toggleLoadingEffect(true);

      console.log("clickUpdate 資料更新中");
      btnMsg.value = "Updating...";
      isUpdate.value = false;
      updatedTickers.value.length = 0;

      const resolvedPromise = await Promise.allSettled(toUpdateTickers.value);

      displayWatchlist(resumeList.value, tabNameBeforeUpdate.value);
      toggleLoadingEffect(false);
      showUpdatedTickers(resolvedPromise);
      await checkResumeFlow(resumeList.value, tabNameBeforeUpdate.value);
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