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
    const watchlistTableSkeletonContent = ref({
      tableHead: {
        hasTableHead: true,
        th: "Stocks",
        td: ["Price", "Change %", "Change"],
      },
      tableBody: {
        hasTableBody: true,
        tr: 4,
        th: 1,
        td: 3,
      },
    });
    const watchlist = ref(null);
    const isWatchlistLoading = ref(null);
    const isSearchListLoading = ref(null);

    function getWatchlist() {
      const { data, error, loading } = useAxios("/api/getWatchlist", "get");

      toggleWatchlistSkeleton(loading.value);

      watch([data, loading], ([newData, newLoading]) => {
        console.log("result", newData.result);
        watchlist.value = newData.result;
        toggleWatchlistSkeleton(newLoading);
      });
    }

    // getWatchlist();

    const toggleWatchlistSkeleton = (isLoading) => {
      isWatchlistLoading.value = isLoading;
    };

    const toggleSearchListSkeleton = (isLoading) => {
      isSearchListLoading.value = isLoading;
    };

    const searchList = ref([]);
    const searchTicker = ref(null);
    const allPromises = [];
    const cacheInput = {};
    const cacheValidTicker = {};
    const tickerRule = /^[a-z\-?]{1,5}$/i;
    watch(searchTicker, async (newSearch, oldSearch) => {
      const oldLen = oldSearch?.length || 0;
      const newLen = newSearch?.length;
      const isTyping = newLen > oldLen;
      const isTickerMatch = tickerRule.test(newSearch);
      const isOldSearchMatch = tickerRule.test(oldSearch);

      console.log("***************** start *****************");
      console.log("oldSearch", oldSearch);
      console.log("newSearch", newSearch);

      if (!isTickerMatch) {
        console.log("都不符合！！！！");
        toggleSearchListSkeleton(false);

        allPromises.length = 0;
        searchList.value = null;
        return;
      }

      if (oldSearch && isOldSearchMatch) cacheInput[oldSearch] = oldSearch;

      if (isTyping) {
        searchList.value = await typingResponse(newSearch);
      } else {
        searchList.value = deleteResponse(newSearch, oldSearch);
      }

      console.log("cacheInput", cacheInput);
      console.log("cacheValidTicker", cacheValidTicker);
    });

    const typingResponse = async (newSearch) => {
      const isInputNew = !cacheInput.hasOwnProperty(newSearch);

      if (!isInputNew) {
        // 曾輸入過
        return showValidTicker(newSearch);
      } else {
        // 第一次輸入
        toggleSearchListSkeleton(true);
        return await getQuote(newSearch);
      }
    };

    const getQuote = async (newSearch) => {
      allPromises.push(axios.get(`/api/quote/${newSearch}`));

      console.log("allPromises", allPromises);

      try {
        let deleteCount = 0;

        const response = await Promise.allSettled(allPromises);
        const result = response
          .map((item) => item.value.data.result)
          .filter((item) => {
            if (isTickerValid(item)) {
              const ticker = item.ticker.toLowerCase();
              cacheValidTicker[ticker] = item;
              return isTickerValid(item);
            } else {
              deleteCount++;
            }
          });

        console.log("cacheValidTicker", cacheValidTicker);
        console.log("watch result", result);

        // 資料全部 load 完再一次呈現
        if (result.length === allPromises.length - deleteCount) {
          console.log("-------finish loading------");
          toggleSearchListSkeleton(false);
          return showValidTicker(newSearch);
        }
      } catch (error) {
        console.log("error", error);
        toggleSearchListSkeleton(false);
      }
    };

    const deleteResponse = (newSearch, oldSearch) => {
      console.log("=========刪除=========");

      return showValidTicker(newSearch);
    };

    const showValidTicker = (newSearch) => {
      const isInputValidTicker = cacheValidTicker.hasOwnProperty(newSearch);

      if (isInputValidTicker) {
        console.log("showValidTicker", cacheValidTicker[newSearch]);
        toggleSearchListSkeleton(false);
        return [cacheValidTicker[newSearch]];
      }
    };

    const clearCache = (mainObj, compareObj = mainObj) => {
      for (let tickers in mainObj) {
        if (compareObj.hasOwnProperty(tickers)) {
          delete mainObj[tickers];
        }
      }
    };

    const isTickerValid = (item) => {
      return (
        item != null && item.name != null && item.previousCloseChange !== "NaN"
      );
    };

    function addSkeletonTableRow() {
      searchListSkeletonContent.value.tableBody.tr = allPromises.length;
    }

    function checkInputStatus(isTyping, ticker) {
      const tickerRule = /[a-z\-?]/i;

      if (isTyping && tickerRule.test(ticker)) {
        allPromises.push(axios.get(`/api/quote/${ticker}`));
      } else {
        allPromises.pop();
      }

      console.log("allPromises", allPromises);
    }

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