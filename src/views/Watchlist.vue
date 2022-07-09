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

    function getWatchlist(isInitWhenPageLoading = true) {
      const { data, error, loading } = useAxios("/api/getWatchlist", "get");

      // 刪除到最後一個時不會閃一下（但其他刪除時便不會 loading）
      if (isInitWhenPageLoading) {
        console.log("isInitWhenPageLoading", isInitWhenPageLoading);
        toggleWatchlistSkeleton(loading.value);
      }

      const temp = loading.value;

      watch([data, loading], async ([newData, newLoading]) => {
        if (newData.result == null) {
          watchlist.value = null;
          toggleWatchlistSkeleton(false);
          return;
        }

        const allPromises = [];
        const tickers = Object.keys(newData.result);

        for (let i = 0; i < tickers.length; i++) {
          allPromises.push(axios.get(`/api/quote/${tickers[i]}`));
        }

        Promise.allSettled(allPromises)
          .then((res) => {
            watchlist.value = res.map((item) => item.value.data.result);
            toggleWatchlistSkeleton(newLoading);
          })
          .catch((error) => {
            console.log("error", error);
          });
      });
    }

    // getWatchlist();

    function toggleWatchlistSkeleton(isLoading) {
      isWatchlistLoading.value = isLoading;
    }

    function toggleSearchListSkeleton(isLoading) {
      isSearchListLoading.value = isLoading;
    }

    let tempArr = [];
    const oldSearchObj = {};
    const deletedObj = {};

    function checkInputStatus(newSearch, oldSearch) {
      const oldLen = oldSearch?.length || 0;
      const newLen = newSearch?.length;
      const isTyping = newLen > oldLen;
      const tickerRule = /[a-z\-?]/i;
      console.log("oldSearch", oldSearch);
      console.log("newSearch", newSearch);

      if (!tickerRule.test(newSearch)) return;

      if (!isTyping) {
        tempArr = allPromises.slice(0, newLen);
        // 將刪除的 ticker 加入 deletedObj
        deletedObj[oldSearch] = oldSearch;
        return;
      }

      const oldSearchTickers = Object.keys(oldSearchObj);
      const deletedTickers = Object.keys(deletedObj);
      const isDeletedObjEmpty = deletedTickers.length === 0;
      const isTickerDeleted = deletedObj.hasOwnProperty(newSearch);

      // 刪除後新增：清空舊陣列
      if (!isDeletedObjEmpty && !isTickerDeleted) {
        const deleteIdx = [];

        // 清空 oldSearchObj（被刪掉的 ticker）
        for (let i = 0; i < oldSearchTickers.length; i++) {
          const oldTicker = oldSearchTickers[i];

          if (deletedTickers.includes(oldTicker)) {
            delete oldSearchObj[oldTicker];
            deleteIdx.push(i);
          }
        }

        // clear allPromises
        const deleteStartIdx = deleteIdx[0];
        const deleteEndIdx = deleteIdx[deleteIdx.length - 1];
        allPromises.splice(deleteStartIdx, deleteEndIdx);

        // clear deletedObj
        for (let ticker in deletedObj) {
          if (deletedObj.hasOwnProperty(ticker)) {
            delete deletedObj[ticker];
          }
        }
      }

      if (
        tempArr.length === allPromises.length ||
        !oldSearchObj.hasOwnProperty(newSearch)
      ) {
        // 輸入尚未存在 ticker
        console.log("尚未存在---------");
        allPromises.push(axios.get(`/api/quote/${newSearch}`));
        tempArr = allPromises;
      } else {
        // 輸入已存在 ticker
        console.log("已存在 ticker-----------");
        tempArr = allPromises.slice(0, newLen);
      }

      console.log("hasOwnProperty", oldSearchObj.hasOwnProperty(newSearch));
    }

    function checkInputExist(input) {
      if (input === "") {
        console.log("清空");
        isSearchListLoading.value = false;
        searchList.value = null;
        allPromises.length = 0;
        tempArr.length = 0;

        for (let ticker in oldSearchObj) {
          if (oldSearchObj.hasOwnProperty(ticker)) {
            delete oldSearchObj[ticker];
          }
        }
        console.log("allPromises", allPromises);
        console.log("tempArr", tempArr);
        console.log("oldSearchObj", oldSearchObj);
        // console.log("deletedObj", deletedObj);
        return;
      }
      console.log("allPromises", allPromises);
      console.log("tempArr", tempArr);
      console.log("oldSearchObj", oldSearchObj);
      // console.log("deletedObj", deletedObj);
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
      Promise.allSettled(tempArr)
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
          if (result.length === tempArr.length - deleteCount) {
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
      if (oldSearch) {
        oldSearchObj[oldSearch] = oldSearch;
      }
      // deletedObj[newSearch] = newSearch;

      // console.log("oldSearchObj", oldSearchObj);
      // console.log("deletedObj", deletedObj);

      toggleSearchListSkeleton(true);
      checkInputStatus(newSearch, oldSearch);
      checkInputExist(newSearch);
      // addSkeletonTableRow();
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