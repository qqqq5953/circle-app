<template>
  <main class="px-4 md:p-10 mx-auto w-full">
    <div class="relative w-full pb-24">
      <SearchBar
        id="searchBar"
        @toggleSearchList="toggleSearchList"
        @toggleSearchListSkeleton="toggleSearchListSkeleton"
        @emitSearchList="getSearchList"
      />

      <!-- 搜尋結果 v-show="isFocus"-->
      <Transition>
        <div v-show="isFocus" class="mt-3 absolute top-12 w-full">
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

    <br />
    <br />
    <br />

    <nav class="flex border-b gap-0.5">
      <button
        class="border rounded-t p-3"
        :class="{ 'bg-blue-100': currentTab === tab }"
        v-for="tab in tabs"
        :key="tab"
        @click="currentTab = tab"
      >
        {{ tab }}
      </button>

      <div class="flex ml-auto py-1">
        <div class="relative">
          <div class="absolute -top-6 pl-6 text-red-500">
            <ErrorDisplay :errors="errorMessage" v-if="errorMessage.length" />
          </div>
          <input
            type="text"
            class="block border rounded-full pl-6 py-2"
            placeholder="add a tab"
            v-model="inputTab"
          />
        </div>
        <button class="border rounded-full px-3" @click="createTab">add</button>
      </div>
    </nav>
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

export default {
  components: {
    SearchBar,
    SearchList,
    WatchlistTable,
    ListSkeleton,
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

    const tabs = ref([]);
    const currentTab = ref("watchlist");
    const inputTab = ref("list");
    const errorMessage = ref([]);

    const createTab = () => {
      const isTabsExist = tabs.value.includes(inputTab.value);

      if (isTabsExist) {
        errorMessage.value.push("tab already exists");
        return;
      }

      const { data, error, loading } = useAxios(`/api/createTab`, "post", {
        inputTab: inputTab.value,
      });

      watch(data, (newData) => tabs.value.push(inputTab.value));
    };

    const getTabs = () => {
      const { data, error, loading } = useAxios(`/api/getTabs`, "get");
      watch(data, (newData) => tabs.value.push(...newData.result));
    };

    getTabs();

    watch(inputTab, () => {
      if (errorMessage.value.length) errorMessage.value.pop();
    });

    const loadWatchlist = (hasDelete = false) => {
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
    };

    const getWatchlist = async (allPromises) => {
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
    };

    loadWatchlist();

    watch(currentTab, () => loadWatchlist());

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

      tabs,
      currentTab,
      createTab,
      inputTab,
      errorMessage,
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