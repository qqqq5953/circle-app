<template>
  <main class="px-4 md:p-10 mx-auto w-full">
    <form class="flex justify-center">
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

    <!-- 搜尋結果 -->
    <SearchList :result="searchList" @getWatchlist="getWatchlist" />

    <!-- table -->
    <WatchlistTable :result="watchlist" @getWatchlist="getWatchlist" />
  </main>
</template>

<script>
import { ref, watch } from "vue";
import axios from "axios";
import useAxios from "@/composables/useAxios.js";

import SearchList from "@/components/SearchList.vue";
import WatchlistTable from "@/components/WatchlistTable.vue";
export default {
  components: { SearchList, WatchlistTable },
  setup() {
    const allPromises = [];
    const searchList = ref([]);
    const search = ref(null);

    const watchlist = ref(null);

    function getWatchlist() {
      const { data, error, loading } = useAxios("/api/getWatchlist", "get");

      watch(data, (newData) => {
        console.log("watchist", newData.result);
        watchlist.value = newData.result;
      });
    }

    getWatchlist();

    watch(search, (newInput, oldInput) => {
      const oldLen = oldInput?.length || 0;
      const newLen = newInput?.length;

      if (newLen > oldLen) {
        allPromises.push(axios.get(`/api/quote/${newInput}`));
      } else {
        allPromises.pop();
      }

      if (!allPromises.length) return (searchList.value.length = 0);

      console.log("allPromises", allPromises);

      Promise.allSettled(allPromises)
        .then((response) => {
          // const promiseSize = allPromises.value.length - 1;
          // const stock = response[promiseSize];
          // if (!stock?.data) return;
          // searchList.value = [stock.value.data.result];

          // searchList.value = [
          //   response.map((item) => item.value.data.result).reverse()[0],
          // ];

          searchList.value = response
            .map((item) => item.value.data.result)
            .filter(
              (item) => item.name !== null && item.previousCloseChange !== "NaN"
            )
            .reverse();

          console.log("watch searchList", searchList.value);
        })
        .catch((error) => {
          console.log("error", error);
        });
    });

    return {
      search,
      searchList,
      watchlist,
      getWatchlist,
    };
  },
};
</script>