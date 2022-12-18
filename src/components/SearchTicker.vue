<template>
  <div class="relative w-full pb-14">
    <SearchBarSkeleton v-show="isWatchlistLoading" />
    <SearchBar v-show="!isWatchlistLoading" />

    <!-- 搜尋結果 -->
    <Transition>
      <div v-show="isFocus" class="absolute top-12 w-full bg-white">
        <ListSkeleton
          :tableContent="searchListSkeletonContent"
          v-show="isSearchListLoading"
        />
        <SearchList
          @loadWatchlist="loadWatchlist"
          v-show="!isSearchListLoading"
        />
        <div
          class="shadow-lg rounded bg-white px-4 py-3"
          v-if="searchList === undefined"
          v-show="!isSearchListLoading"
        >
          <i class="fa-solid fa-circle-exclamation"></i>
          <span class="ml-3">The ticker does not exist</span>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script>
import ListSkeleton from "@/components/skeleton/ListSkeleton.vue";
import SearchBarSkeleton from "@/components/skeleton/SearchBarSkeleton.vue";
import SearchList from "@/components/SearchList.vue";
import SearchBar from "@/components/SearchBar.vue";
import useWatchlistStore from "@/stores/watchlistStore.js";

export default {
  components: {
    SearchBar,
    SearchList,
    ListSkeleton,
    SearchBarSkeleton,
  },
  props: {
    isSearchListLoading: {
      type: Boolean,
    },
    isFocus: {
      type: Boolean,
    },
    isWatchlistLoading: {
      type: Boolean,
    },
    searchListSkeletonContent: {
      type: Object,
    },
    searchList: {
      type: Array,
    },
  },
  setup() {
    const $store = useWatchlistStore();
    const { loadWatchlist } = $store;
    // const {
    //   isSearchListLoading,
    //   isFocus,
    //   isWatchlistLoading,
    //   searchListSkeletonContent,
    //   searchList,
    // } = storeToRefs($store);

    return {
      // isSearchListLoading,
      // isFocus,
      // isWatchlistLoading,
      // searchListSkeletonContent,
      // searchList,
      loadWatchlist,
    };
  },
};
</script>