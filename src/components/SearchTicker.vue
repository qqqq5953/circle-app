<template>
  <div class="relative w-full pb-14">
    <SearchBarSkeleton v-show="isWatchlistLoading" />
    <SearchBar
      v-show="!isWatchlistLoading"
      @toggleSearchList="toggleSearchList"
      @toggleSearchListSkeleton="toggleSearchListSkeleton"
      @emitSearchList="getSearchList"
    />

    <!-- 搜尋結果 -->
    <Transition>
      <div v-show="isFocus" class="absolute top-12 w-full bg-white">
        <ListSkeleton
          :tableContent="searchListSkeletonContent"
          v-show="isSearchListLoading"
        />
        <SearchList
          :searchList="searchList"
          :isAddingProcess="isAddingProcess"
          @loadWatchlist="loadWatchlist"
          @setSkeletonTableRow="setSkeletonTableRow"
          @toggleLoadingEffect="toggleLoadingEffect"
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
export default {
  components: {
    SearchBar,
    SearchList,
    ListSkeleton,
    SearchBarSkeleton,
  },
  setup() {},
};
</script>