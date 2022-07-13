<template>
  <main class="px-4 md:p-10 mx-auto w-full">
    <form class="flex justify-center mb-3">
      <div class="relative w-full">
        <span
          class="
            leading-snug
            font-normal
            text-blueGray-300
            absolute
            bg-transparent
            rounded
            px-3
            py-3
          "
          ><i class="fas fa-search"></i
        ></span>
        <input
          type="text"
          placeholder="Search Ticker..."
          class="
            border-0
            pr-3
            pl-10
            py-3
            placeholder-blueGray-300
            text-blueGray-600
            bg-white
            rounded
            text-sm
            shadow
            outline-none
            focus:outline-none focus:ring
            w-full
          "
          v-model.trim="searchTicker"
        />
      </div>
    </form>

    <!-- v-show="isWatchlistLoading"  -->
    <!-- v-show="!isWatchlistLoading" -->

    <!-- 搜尋結果 -->
    <ListSkeleton
      :tableContent="searchListSkeletonContent"
      v-show="isSearchListLoading"
    />
    <SearchList
      :result="searchList"
      @getWatchlist="getWatchlist"
      v-show="!isSearchListLoading"
    />

    <!-- table -->
    <ListSkeleton
      :tableContent="watchlistTableSkeletonContent"
      v-show="isWatchlistLoading"
    />
    <WatchlistTable
      :result="watchlist"
      @getWatchlist="getWatchlist"
      v-show="!isWatchlistLoading"
    />
  </main>
</template>

<script>
import { ref, watch } from "vue";
import axios from "axios";
import useAxios from "@/composables/useAxios.js";

import SearchList from "@/components/SearchList.vue";
import WatchlistTable from "@/components/WatchlistTable.vue";
import ListSkeleton from "@/components/skeleton/ListSkeleton.vue";
export default {
  components: { SearchList, WatchlistTable, ListSkeleton },
  setup() {
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

    const watchlist = ref(null);
    const isWatchlistLoading = ref(null);
    const isSearchListLoading = ref(null);

    const toggleWatchlistSkeleton = (isLoading) => {
      isWatchlistLoading.value = isLoading;
    };

    const toggleSearchListSkeleton = (isLoading) => {
      isSearchListLoading.value = isLoading;
    };

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

    function getWatchlist() {
      const { data, error, loading } = useAxios("/api/getWatchlist", "get");
      const allPromises = [];

      watch([data, loading], ([newData, newLoading]) => {
        for (let ticker in newData.result) {
          allPromises.push(axios.get(`/api/quote/${ticker}`));
        }

        // 刪除到最後一個時不會閃一下
        if (allPromises.length === 0) {
          toggleWatchlistSkeleton(false);
        } else {
          toggleWatchlistSkeleton(true);
        }

        watchlistTableSkeletonContent.value.tableBody.tr = allPromises.length;

        Promise.allSettled(allPromises)
          .then((res) => {
            watchlist.value = res.map((item) => item.value.data.result);
            toggleWatchlistSkeleton(newLoading);
          })
          .catch((error) => {
            console.log("error", error);
            toggleWatchlistSkeleton(newLoading);
          });
      });
    }

    getWatchlist();

    const searchList = ref([]);
    const searchTicker = ref(null);
    const allPromises = [];
    const cacheInput = ref(new Map());
    const cacheValidTicker = ref(new Map());
    const tickerRule = /^[a-z\-?]{1,5}$/i;

    watch(searchTicker, async (newSearch, oldSearch) => {
      const oldLen = oldSearch?.length || 0;
      const newLen = newSearch?.length;
      const isTyping = newLen > oldLen;
      const isTickerMatch = tickerRule.test(newSearch);
      const isOldSearchMatch = tickerRule.test(oldSearch);

      if (!isTickerMatch) {
        allPromises.length = 0;
        searchList.value = null;
        toggleSearchListSkeleton(false);
        return;
      }

      if (oldSearch && isOldSearchMatch) {
        cacheInput.value.set(oldSearch, oldSearch);
      }

      searchList.value = isTyping
        ? await typingResponse(newSearch)
        : deleteResponse(newSearch);
    });

    const typingResponse = async (newSearch) => {
      const isInputNew = !cacheInput.value.has(newSearch);

      if (isInputNew) toggleSearchListSkeleton(true);

      return isInputNew
        ? await getQuote(newSearch) // 第一次輸入
        : showValidTicker(newSearch); // 曾輸入過
    };

    const getQuote = async (newSearch) => {
      allPromises.push(axios.get(`/api/quote/${newSearch}`));

      try {
        let deleteCount = 0;

        const response = await Promise.allSettled(allPromises);
        const results = response
          .map((item) => item.value.data.result)
          .filter((item) => {
            if (isTickerValid(item)) {
              const ticker = item.ticker.toLowerCase();
              cacheValidTicker.value.set(ticker, item);
              return isTickerValid(item);
            } else {
              deleteCount++;
            }
          });
        const isGettingAllResults =
          results.length === allPromises.length - deleteCount;

        // 資料全部 load 完再一次呈現
        if (isGettingAllResults) return showValidTicker(newSearch);
      } catch (error) {
        console.log("error", error);
        toggleSearchListSkeleton(false);
      }
    };

    const deleteResponse = (newSearch) => showValidTicker(newSearch);

    const showValidTicker = (newSearch) => {
      const isInputValidTicker = cacheValidTicker.value.has(newSearch);

      toggleSearchListSkeleton(false);

      if (isInputValidTicker) {
        return [cacheValidTicker.value.get(newSearch)];
      }
    };

    const isTickerValid = (item) =>
      item?.name != null && item?.previousCloseChange !== "NaN";

    return {
      searchTicker,
      searchList,
      watchlist,
      getWatchlist,
      searchListSkeletonContent,
      watchlistTableSkeletonContent,
      isWatchlistLoading,
      isSearchListLoading,
    };
  },
};
</script>