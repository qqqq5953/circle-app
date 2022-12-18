<template>
  <main class="flex flex-col gap-3 px-4 md:p-10 mx-auto w-full">
    <!-- <SearchTicker
      :isWatchlistLoading="isWatchlistLoading"
      :isSearchListLoading="isSearchListLoading"
      :isFocus="isFocus"
      :loadWatchlist="loadWatchlist"
      :searchList="searchList"
      :searchListSkeletonContent="searchListSkeletonContent"
    /> -->

    <div class="relative w-full pb-14">
      <SearchBarSkeleton v-show="isWatchlistLoading" />
      <SearchBar v-show="!isWatchlistLoading" />

      <!-- 搜尋結果 -->
      <Transition>
        <div v-show="isFocus" class="absolute top-12 w-full bg-white">
          <ListSkeleton
            v-show="isSearchListLoading"
            :tableContent="searchListSkeletonContent"
          />
          <SearchList v-show="!isSearchListLoading" :searchList="searchList">
            <template #to-info-page="{ ticker, tempTicker }">
              <button
                class="absolute w-full h-full"
                @click="toInfoPage(ticker, tempTicker)"
              ></button>
            </template>
            <template #add-btn="{ ticker }">
              <div>
                <div v-if="isAddingProcess" class="lg:text-lg">
                  <i class="fa-solid fa-spinner animate-spin"></i>
                </div>
                <div v-else>
                  <a
                    href="#"
                    class="text-gray-300 inline-block py-1 hover:text-blue-600"
                    @click.stop.prevent="addToWatchlist(ticker)"
                    v-if="!isTickerInCachedList"
                  >
                    <i class="fas fa-plus text-lg md:text-xl"></i>
                  </a>
                  <span v-else>
                    <i
                      class="
                        fa-solid fa-check
                        text-slate-600 text-lg
                        md:text-xl
                      "
                    ></i>
                  </span>
                </div>
              </div>
            </template>
          </SearchList>
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
      :watchlistArr="watchlistArr"
      :updatedTickers="updatedTickers"
      @loadWatchlist="loadWatchlist"
      @sortList="(n) => (latestSortRules = n)"
      v-show="!isWatchlistLoading"
    >
    </WatchlistTable>
  </main>
</template>

<script>
import { ref, computed, watch } from "vue";
import http from "../api/index";
import useWatchlistStore from "@/stores/watchlistStore.js";
import { storeToRefs } from "pinia";
import { useRouter } from "vue-router";

import ListSkeleton from "@/components/skeleton/ListSkeleton.vue";
import SearchBarSkeleton from "@/components/skeleton/SearchBarSkeleton.vue";
import SearchTicker from "@/components/SearchTicker.vue";
import SearchList from "@/components/SearchList.vue";
import SearchBar from "@/components/SearchBar.vue";
import WatchlistNavbar from "@/components/Watchlist/WatchlistNavbar.vue";
import WatchlistTable from "@/components/Watchlist/WatchlistTable.vue";

export default {
  components: {
    SearchBarSkeleton,
    SearchList,
    SearchBar,
    SearchTicker,
    ListSkeleton,
    WatchlistNavbar,
    WatchlistTable,
  },
  setup() {
    const $store = useWatchlistStore();
    const {
      searchList,
      searchListSkeletonContent,
      watchlistTableSkeletonContent,
      isSearchListLoading,
      isFocus,
      isWatchlistLoading,
      isAddingProcess,
      latestSortRules,
      watchlistArr,
      changeCount,
      currentTab,
      updatedTickers,
    } = storeToRefs($store);

    const {
      setTabs,
      loadWatchlist,
      displayWatchlist,
      setSkeletonTableRow,
      toggleLoadingEffect,
    } = $store;

    const router = useRouter();

    const isTickerInCachedList = computed(() => {
      const tempTicker = searchList.value[0]?.tempTicker;
      const isInCachedList = watchlistArr.value
        ? watchlistArr.value
            .map((item) => item.tempTicker)
            .indexOf(tempTicker) !== -1
        : false;

      return isInCachedList;
    });

    function toInfoPage(ticker, tempTicker) {
      if (isAddingProcess.value) return;
      router.push({
        name: "stockInfo",
        params: { ticker, tempTicker },
      });
    }

    async function addToWatchlist(ticker) {
      if (isTickerInCachedList.value) return;

      setSkeletonTableRow({
        rows: watchlistArr.value.length + 1,
      });
      toggleLoadingEffect(true);

      try {
        const tempTicker = ticker.includes(".") ? ticker.split(".")[0] : ticker;
        const tickerItem = {
          ...searchList.value[0],
          tempTicker,
        };
        await http.post(`/api/ticker/${currentTab.value}`, {
          tickerItem,
        });

        loadWatchlist({
          status: "addTicker",
          params: tickerItem,
        });
      } catch (error) {
        console.log("error", error);
      }
    }

    // ----------------------

    http.get(`/api/watchlist`).then((res) => {
      setTabs(res.data.result);
      loadWatchlist({ status: "init" });
    });

    watch(latestSortRules, () =>
      displayWatchlist(watchlistArr.value, currentTab.value)
    );

    watch(currentTab, () => {
      changeCount.value = 0;
      loadWatchlist({ status: "switch" });
    });

    return {
      addToWatchlist,
      isTickerInCachedList,
      toInfoPage,

      isSearchListLoading,
      isFocus,
      isWatchlistLoading,
      isAddingProcess,
      searchList,
      searchListSkeletonContent,
      currentTab,
      watchlistArr,
      watchlistTableSkeletonContent,
      updatedTickers,
      latestSortRules,
      loadWatchlist,
      displayWatchlist,
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