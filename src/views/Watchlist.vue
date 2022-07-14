<template>
  <main class="px-4 md:p-10 mx-auto w-full">
    <div class="relative w-full pb-24">
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
        autofocus
        v-model.trim="searchTicker"
        @focus="toggleSearchList(true)"
      />

      <!-- 搜尋結果 v-show="isFocus"-->
      <Transition>
        <div v-show="isFocus" class="mt-3 absolute top-12 w-full">
          <ListSkeleton
            :tableContent="searchListSkeletonContent"
            v-show="isSearchListLoading"
          />
          <SearchList
            :searchResult="searchList"
            :watchlist="watchlist"
            :isAddingProcess="isAddingProcess"
            @getWatchlist="getWatchlist"
            @toggleAddButton="toggleAddButton"
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
        tr: 1,
        th: 1,
        td: 3,
      },
    });
    const watchlist = ref(null);
    const isWatchlistLoading = ref(null);
    const isSearchListLoading = ref(null);
    const isAddingProcess = ref(false);
    const isFocus = ref(null);

    document.addEventListener("click", (e) => {
      if (e.target.nodeName === "I") return;
      isFocus.value = e.target.nodeName === "INPUT" ? true : false;
    });

    const toggleSearchList = (onFocus) => {
      isFocus.value = onFocus;
    };

    const toggleWatchlistSkeleton = (isLoading) => {
      isWatchlistLoading.value = isLoading;
    };

    const toggleSearchListSkeleton = (isLoading) => {
      isSearchListLoading.value = isLoading;
    };

    const toggleAddButton = (isLoading) => {
      isAddingProcess.value = isLoading;
    };

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
            watchlist.value = res
              .map((item) => item.value.data.result)
              .reduce((obj, item) => {
                return {
                  ...obj,
                  [item.ticker]: item,
                };
              }, {});

            toggleAddButton(newLoading);
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
      isFocus.value = true;

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
      isAddingProcess,
      toggleAddButton,
      toggleSearchList,
      isFocus,
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