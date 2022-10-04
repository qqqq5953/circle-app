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
    const setTabs = (tab) => $store.setTabs(tab);
    const { data, error, loading } = useAxios(`/api/getTabs`, "get");

    watch(data, (newData) => {
      setTabs(newData.result);
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
        tr: 1,
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

    const setSkeletonTableRow = (rowNumber) => {
      watchlistTableSkeletonContent.value.tableBody.tr = rowNumber;
    };

    const toggleLoadingEffect = (isActivate) => {
      toggleAddButtonSpinner(isActivate);
      toggleWatchlistSkeleton(isActivate);
    };

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

      toggleLoadingEffect(true);

      const allTabs = Object.keys(cachedList.value);
      const isCurrentTabInTabs = allTabs.includes(currentTab.value);

      // switch 時用 cache
      if (status === "switch" && isCurrentTabInTabs) {
        watchlistDisplay.value = getCacheList(currentTab.value);

        toggleLoadingEffect(false);
        return;
      }

      const { data, error, loading } = useAxios(
        `/api/getWatchlist/${currentTab.value}`,
        "get"
      );

      watch([data], async ([newData]) => {
        // 不用這個功能，固定顯示五列即可
        const currentWatchlist = newData.result;
        const rows = currentWatchlist
          ? Object.keys(currentWatchlist)?.length
          : 0;
        setSkeletonTableRow(rows);

        watchlistDisplay.value = currentWatchlist;
        cachedList.value[currentTab.value] = setCacheList(currentWatchlist);

        toggleLoadingEffect(false);
      });
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