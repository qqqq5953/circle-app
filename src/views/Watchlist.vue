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
          v-model="searchTicker"
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
    const allPromises = [];
    const searchList = ref([]);
    const searchTicker = ref(null);
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

    getWatchlist();

    function toggleWatchlistSkeleton(isLoading) {
      isWatchlistLoading.value = isLoading;
    }

    function toggleSearchListSkeleton(isLoading) {
      isSearchListLoading.value = isLoading;
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

    function checkInputExist(input) {
      if (input === "") {
        isSearchListLoading.value = false;
        allPromises.length = 0;
        searchList.value = null;
        return;
      }
    }

    function isTickerExist(item) {
      return (
        item != null && item.name != null && item.previousCloseChange !== "NaN"
      );
    }

    function addSkeletonTableRow() {
      searchListSkeletonContent.value.tableBody.tr = allPromises.length;
    }

    function getQuote() {
      Promise.allSettled(allPromises)
        .then((response) => {
          // const promiseSize = allPromises.length - 1;
          // console.log("promiseSize", promiseSize);

          // const stock = response[promiseSize];
          // if (!stock?.data) return;
          // searchList.value = [stock.value.data.result];

          // searchList.value = [
          //   response.map((item) => item.value.data.result).reverse()[0],
          // ];
          let deleteCount = 0;

          const result = response
            .reverse()
            .map((item) => item.value.data.result)
            .filter((item) => {
              if (!isTickerExist(item)) {
                deleteCount++;
              } else {
                return isTickerExist(item);
              }
            });

          console.log("watch result", result);

          // 資料全部 load 完再一次呈現
          if (result.length === allPromises.length - deleteCount) {
            searchList.value = result;
            toggleSearchListSkeleton(false);

            console.log("-------finish loading------");
          }
        })
        .catch((error) => {
          console.log("error", error);
          toggleSearchListSkeleton(false);
        });
    }

    watch(searchTicker, (newSearch, oldSearch) => {
      const oldLen = oldSearch?.length || 0;
      const newLen = newSearch?.length;
      const isTyping = newLen > oldLen;

      toggleSearchListSkeleton(true);
      checkInputStatus(isTyping, newSearch);
      checkInputExist(newSearch);
      addSkeletonTableRow();
      getQuote();
    });

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