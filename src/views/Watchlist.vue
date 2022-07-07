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
          v-model="search"
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
    const search = ref(null);
    const watchlist = ref(null);
    const isWatchlistLoading = ref(null);
    const isSearchListLoading = ref(null);

    function getWatchlist() {
      const { data, error, loading } = useAxios("/api/getWatchlist", "get");

      isWatchlistLoading.value = loading.value;

      watch([data, loading], ([newData, newLoading]) => {
        console.log("result", newData.result);
        console.log("newLoading", newLoading);
        watchlist.value = newData.result;
        isWatchlistLoading.value = newLoading;
      });
    }

    getWatchlist();

    watch(search, (newInput, oldInput) => {
      isSearchListLoading.value = true;

      const oldLen = oldInput?.length || 0;
      const newLen = newInput?.length;

      if (newLen > oldLen) {
        allPromises.push(axios.get(`/api/quote/${newInput}`));
      } else {
        allPromises.pop();
      }

      if (!allPromises.length) {
        isSearchListLoading.value = false;
        searchList.value.length = 0;
        return;
      }

      console.log("allPromises", allPromises);

      // 動態增加 skeleton tr 數
      searchListSkeletonContent.value.tableBody.tr = allPromises.length;

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
            .map((item) => item.value.data.result)
            .filter((item) => {
              if (item.name === null || item.previousCloseChange === "NaN") {
                deleteCount++;
                return;
              }

              return item.name !== null && item.previousCloseChange !== "NaN";
            })
            .reverse();

          console.log("watch result", result);
          // console.log("deleteCount", deleteCount);
          // console.log("check length", result.length === allPromises.length);

          // 資料全部 load 完再一次呈現
          if (result.length === allPromises.length - deleteCount) {
            searchList.value = result;
            isSearchListLoading.value = false;
            console.log("-------finish loading------");
          }
        })
        .catch((error) => {
          console.log("error", error);
          isSearchListLoading.value = false;
        });
      // .finally(() => {
      //   isSearchListLoading.value = false;
      // });
    });

    return {
      search,
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