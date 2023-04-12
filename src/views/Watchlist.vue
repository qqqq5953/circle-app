<template>
  <main>
    <div class="relative w-full pb-14">
      <!-- keep-alive: switch tab 時 ticker 不會消失 -->
      <keep-alive>
        <SearchBar v-if="!isWatchlistLoading" />
      </keep-alive>
      <SearchBarSkeleton v-if="isWatchlistLoading" />

      <!-- 搜尋結果 -->
      <Transition>
        <div v-show="isFocus" class="absolute top-12 z-10 w-full">
          <ListSkeleton v-show="isSearchListLoading" />
          <SearchList
            v-show="!isSearchListLoading"
            :searchList="searchList"
            :hasOptionalTd="true"
          >
            <template #action-btn="{ ticker }">
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
                    class="fa-solid fa-check text-slate-600 text-lg md:text-xl"
                  ></i>
                </span>
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
      v-bind="watchlistTableSkeletonContent"
      v-show="isWatchlistLoading"
      ><template #table-title>
        <div
          class="rounded-t pl-4 lg:pl-8 py-3 flex flex-wrap items-center border-b"
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

    <WatchlistTable v-show="!isWatchlistLoading"> </WatchlistTable>
  </main>
</template>

<script>
import { watch, provide, onMounted, computed } from "vue";
import http from "../api/index";
import useSearchStore from "@/stores/searchStore.js";
import useWatchlistStore from "@/stores/watchlistStore.js";
import { storeToRefs } from "pinia";

import ListSkeleton from "@/components/skeleton/ListSkeleton.vue";
import SearchBarSkeleton from "@/components/skeleton/SearchBarSkeleton.vue";
import SearchList from "@/components/SearchList.vue";
import SearchBar from "@/components/SearchBar.vue";
import WatchlistNavbar from "@/components/Watchlist/WatchlistNavbar.vue";
import WatchlistTable from "@/components/Watchlist/WatchlistTable.vue";
import { useClickPrevention } from "@/composables/useClickPrevention.js";

export default {
  components: {
    SearchBarSkeleton,
    SearchList,
    SearchBar,
    ListSkeleton,
    WatchlistNavbar,
    WatchlistTable,
  },
  setup() {
    provide("toStockInfo", true);

    onMounted(() => {
      console.log("watchlist onMounted");
      currentTab.value = DEFAULT_TAB.value;
      searchList.value = null;
    });

    const $searchStore = useSearchStore();
    const { searchList, isFocus, isSearchListLoading } =
      storeToRefs($searchStore);

    const $watchlistStore = useWatchlistStore();
    const {
      watchlistTableSkeletonContent,
      isWatchlistLoading,
      latestSortRules,
      watchlistArr,
      changeCount,
      currentTab,
      DEFAULT_TAB,
      updatedTickers,
      isAddingProcess,
    } = storeToRefs($watchlistStore);

    const {
      setTabs,
      loadWatchlist,
      displayWatchlist,
      setSkeletonTableRow,
      toggleLoadingEffect,
    } = $watchlistStore;

    const { isClickDisabled, preventMultipleClicks } = useClickPrevention(2000);

    const isTickerInCachedList = computed(() => {
      const tempTicker = searchList.value[0]?.tempTicker;
      const isInCachedList =
        watchlistArr.value
          .map((item) => item.tempTicker)
          .indexOf(tempTicker) !== -1;

      return isInCachedList;
    });

    async function addToWatchlist(ticker) {
      if (isTickerInCachedList.value || isClickDisabled.value) return;

      setSkeletonTableRow({
        rows: watchlistArr.value.length + 1,
      });
      toggleLoadingEffect(true);
      preventMultipleClicks();

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
      isSearchListLoading,
      isFocus,
      isWatchlistLoading,
      searchList,
      currentTab,
      watchlistArr,
      watchlistTableSkeletonContent,
      updatedTickers,
      latestSortRules,
      loadWatchlist,
      displayWatchlist,

      addToWatchlist,
      isAddingProcess,
      isTickerInCachedList,
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