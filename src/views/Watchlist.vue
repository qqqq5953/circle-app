<template>
  <main class="flex flex-col gap-4 px-4 md:p-10 mx-auto w-full">
    <div class="relative w-full pb-20">
      <SearchBar
        id="searchBar"
        @toggleSearchList="toggleSearchList"
        @toggleSearchListSkeleton="toggleSearchListSkeleton"
        @emitSearchList="getSearchList"
      />

      <!-- 搜尋結果 -->
      <Transition>
        <div v-show="isFocus" class="absolute top-12 z-10 w-full bg-white">
          <ListSkeleton
            :tableContent="searchListSkeletonContent"
            v-show="isSearchListLoading"
          />
          <SearchList
            :searchList="searchList"
            :watchlistInDB="watchlistInDB"
            :isAddingProcess="isAddingProcess"
            :currentTab="currentTab"
            @loadWatchlist="loadWatchlist"
            @toggleWatchlistSkeleton="toggleWatchlistSkeleton"
            @toggleAddButtonSpinner="toggleAddButtonSpinner"
            v-show="!isSearchListLoading"
          />
        </div>
      </Transition>
    </div>

    <!-- tabs -->
    <WatchlistTabs @emitCurrentTab="handleClickTab" />

    <!-- table -->
    <ListSkeleton
      :tableContent="watchlistTableSkeletonContent"
      v-show="isWatchlistLoading"
      ><template #table-title>
        <div class="rounded-t px-4 py-3 border-0 flex flex-wrap items-center">
          <div class="w-full px-4 max-w-full flex-1">
            <h3 class="font-semibold text-base text-blueGray-700">Watchlist</h3>
          </div>
        </div>
      </template>
    </ListSkeleton>
    <WatchlistTable
      :result="watchlistDisplay"
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
import WatchlistTable from "@/components/WatchlistTable.vue";
import ListSkeleton from "@/components/skeleton/ListSkeleton.vue";
import SearchBar from "@/components/SearchBar.vue";
import WatchlistTabs from "@/components/WatchlistTabs.vue";

export default {
  components: {
    SearchBar,
    SearchList,
    WatchlistTable,
    ListSkeleton,
    WatchlistTabs,
    ErrorDisplay: defineAsyncComponent(() =>
      import("@/components/ErrorDisplay.vue")
    ),
  },
  setup() {
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
      if (!tickerObject) return (searchList.value = null);
      searchList.value = [tickerObject];
    };

    function hasParentElement(event, element) {
      return event.target.closest(element);
    }

    document.addEventListener("click", (e) => {
      const isAddButtonCLick = e.target.nodeName === "I";
      const isInputFocus = e.target.nodeName === "INPUT";
      const isNavClick = hasParentElement(e, "nav");
      const isSearchBarFocus =
        isInputFocus && hasParentElement(e, "#searchBar");

      if (isAddButtonCLick) return;
      if (!isSearchBarFocus && !isNavClick) isFocus.value = false;
      if (isSearchBarFocus) isFocus.value = true;
    });

    // tabs
    const currentTab = ref("watchlist");
    const handleClickTab = (tab) => {
      currentTab.value = tab;
    };

    watch(currentTab, () => loadWatchlist());

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
    const watchlistInDB = ref(null);

    const toggleWatchlistSkeleton = (isLoading) => {
      isWatchlistLoading.value = isLoading;
    };

    const toggleAddButtonSpinner = (isLoading) => {
      isAddingProcess.value = isLoading;
    };

    function loadWatchlist(hasDelete = false) {
      const { data, error, loading } = useAxios(
        `/api/getWatchlist/${currentTab.value}`,
        "get"
      );

      toggleAddButtonSpinner(loading.value);

      watch([data, loading], async ([newData, newLoading]) => {
        const allPromises = [];

        for (let ticker in newData.result) {
          allPromises.push(axios.get(`/api/quote/${ticker}`));
        }

        // 刪除到最後一個時不會閃一下
        if (allPromises.length !== 0 && !hasDelete) {
          toggleWatchlistSkeleton(true);
        }

        watchlistTableSkeletonContent.value.tableBody.tr = allPromises.length;

        const result = await getWatchlist(allPromises);

        if (!hasDelete) watchlistDisplay.value = result;
        watchlistInDB.value = result;

        toggleAddButtonSpinner(newLoading);
        toggleWatchlistSkeleton(newLoading);
      });
    }

    async function getWatchlist(allPromises) {
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

    loadWatchlist();

    return {
      searchListSkeletonContent,
      searchList,
      toggleSearchList,
      isSearchListLoading,
      isFocus,
      getSearchList,
      toggleSearchListSkeleton,

      loadWatchlist,
      watchlistDisplay,
      watchlistInDB,
      watchlistTableSkeletonContent,
      isWatchlistLoading,
      isAddingProcess,
      toggleAddButtonSpinner,
      toggleWatchlistSkeleton,

      currentTab,
      handleClickTab,
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