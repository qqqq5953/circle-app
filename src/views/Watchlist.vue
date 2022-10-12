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

    <button class="bg-red-100 max-w-fit" @click="deleteTest">
      delete test
    </button>

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
        tr: 5,
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

    const setSkeletonTableRow = (tickers) => {
      const rows = tickers ? Object.keys(tickers)?.length : 0;
      watchlistTableSkeletonContent.value.tableBody.tr = rows;
    };

    const toggleLoadingEffect = (isActivate) => {
      toggleAddButtonSpinner(isActivate);
      toggleWatchlistSkeleton(isActivate);
    };

    function deleteTest() {
      http.put(`/api/watchlist/${currentTab.value}/us/A`).then((res) => {
        console.log("res", res);
      });
      // const str = JSON.stringify(["A", "AA", "AAA"]);
      // http.delete(`/api/tempList/${currentTab.value}/${str}`).then((res) => {
      //   console.log("res", res);
      // });
    }

    // status: init, switch, deleteTicker, addTicker
    async function loadWatchlist({ status }) {
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

      const allTabs = Object.keys(cachedList.value);
      const isCurrentTabInTabs = allTabs.includes(currentTab.value);

      // switch 時用 cache
      if (status === "switch" && isCurrentTabInTabs) {
        watchlistDisplay.value = getCacheList(currentTab.value);
        return;
      }

      toggleLoadingEffect(true);

      try {
        const tempRes = await http.get(`/api/watchlist/${currentTab.value}`);
        const watchlistTickers = tempRes.data.result;

        // init 無法正確顯示，其餘可以
        setSkeletonTableRow(watchlistTickers);

        const currentWatchlist = await getCurrentWatchlist(watchlistTickers);

        console.log("watchlistTickers", watchlistTickers);
        console.log("currentWatchlist", currentWatchlist);

        watchlistDisplay.value = currentWatchlist;
        cachedList.value[currentTab.value] = setCacheList(currentWatchlist);

        toggleLoadingEffect(false);
      } catch (error) {
        console.log("error", error);
      }
    }

    async function getCurrentWatchlist(watchlistTickers) {
      if (!watchlistTickers) return null;

      // const hasNewPrice = await checkNewPrice1(watchlistTickers);
      // console.log("hasNewPrice", hasNewPrice);

      // const currentWatchlist = hasNewPrice
      //   ? await updateList(watchlistTickers)
      //   : watchlistTickers;

      // const hasNewPrice1 = await checkNewPrice(watchlistTickers);
      // console.log("hasNewPrice1", hasNewPrice1);

      const currentWatchlist = await checkNewPrice(watchlistTickers);

      return currentWatchlist;
    }

    async function checkNewPrice(watchlistTickers) {
      const listPromises = [];

      // fetch new price
      for (const tempTicker in watchlistTickers) {
        const ticker = watchlistTickers[tempTicker].ticker;
        listPromises.push(http.get(`/api/previousClose/${ticker}`));
      }
      const res = await Promise.allSettled(listPromises);

      const currentPrices = res.map((item) => item.value.data.result);

      const result = [];

      let i = 0;

      // compare price with loop
      for (const tempTicker in watchlistTickers) {
        const listItem = watchlistTickers[tempTicker];
        const { price, code } = listItem;
        const currentPrice = currentPrices[i];

        if (price !== currentPrice) {
          const newItem = {
            ...listItem,
            price: parseFloat(currentPrice.toFixed(2)),
          };
          console.log("newItem", newItem);

          const res = await http.put(
            `/api/watchlist/${currentTab.value}/${code}/${tempTicker}`,
            { newItem }
          );
          console.log("res", res.data.result);

          result.push(res.data.result);
        }

        i++;
      }

      console.log("result", result);

      return result.length !== 0 ? result.pop() : watchlistTickers;
    }

    async function updateList1() {}

    async function updateList(watchlistTickers) {
      console.log("updateList");
      const tempTickers = Object.keys(watchlistTickers);
      const allPromises = tempTickers.map((tempTicker) => {
        const ticker = watchlistTickers[tempTicker].ticker;
        return http.get(`/api/quote/${ticker}`);
      });

      try {
        const response = await Promise.allSettled(allPromises);
        const updatedList = response
          .map((item) => item.value.data.result)
          .reduce((obj, item, i) => {
            const tempTicker = tempTickers[i];
            const { code, id, style } = watchlistTickers[tempTicker];
            const newItem = { ...item, code, id, style, tempTicker };

            return {
              ...obj,
              [tempTicker]: newItem,
            };
          }, {});

        for (let tempTicker in updatedList) {
          const listItem = updatedList[tempTicker];
          await http.post("/api/addToWatchlist", {
            name: listItem.name,
            currentTab: currentTab.value,
            watchlist: listItem,
          });
        }

        return updatedList;
      } catch (error) {
        console.log("error", error);
        toggleWatchlistSkeleton(false);
      }
    }

    async function checkNewPrice1(watchlistTickers) {
      const firstTempTicker = Object.keys(watchlistTickers)[0];
      const firstTicker = watchlistTickers[firstTempTicker].ticker;
      const closeRes = await http.get(`/api/previousClose/${firstTicker}`);
      const prevClose = closeRes.data.result;
      const dbClose = watchlistTickers[firstTempTicker].price;
      console.log("firstTicker", firstTicker);
      console.log("prevClose", prevClose);
      console.log("dbClose", dbClose);

      return prevClose !== dbClose;
    }

    function getCacheList(currentTab) {
      const cacheList = {
        ...cachedList.value[currentTab].currentWatchlist,
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

      loadWatchlist,
      watchlistDisplay,
      watchlistTableSkeletonContent,
      isWatchlistLoading,
      isAddingProcess,
      toggleAddButtonSpinner,
      toggleWatchlistSkeleton,

      currentTab,

      deleteTest,
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