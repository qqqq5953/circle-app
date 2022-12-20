<template>
  <div class="rounded" :class="style">
    <TickerInfo :stockLists="searchList" :hasOptionalTd="true">
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
            <i class="fa-solid fa-check text-slate-600 text-lg md:text-xl"></i>
          </span>
        </div>
      </template>
    </TickerInfo>

    <div class="px-4 py-3 lg:px-8 lg:py-5" v-show="searchList === undefined">
      <i class="fa-solid fa-circle-exclamation"></i>
      <span class="ml-3">The ticker does not exist</span>
    </div>
  </div>
</template>

<script>
import { computed } from "vue";
import http from "../api/index";
import useWatchlistStore from "@/stores/watchlistStore.js";
import { storeToRefs } from "pinia";
import { useRouter } from "vue-router";
import TickerInfo from "@/components/TickerInfo.vue";

export default {
  components: { TickerInfo },
  props: {
    searchList: {
      type: Array,
    },
    style: {
      type: String,
      default: "shadow-lg bg-white",
    },
  },
  setup() {
    const $store = useWatchlistStore();
    const { searchList, isAddingProcess, watchlistArr, currentTab } =
      storeToRefs($store);
    const { loadWatchlist, setSkeletonTableRow, toggleLoadingEffect } = $store;
    const router = useRouter();

    const isTickerInCachedList = computed(() => {
      const tempTicker = searchList.value[0]?.tempTicker;
      const isInCachedList =
        watchlistArr.value
          .map((item) => item.tempTicker)
          .indexOf(tempTicker) !== -1;

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

    return {
      addToWatchlist,
      toInfoPage,
      isTickerInCachedList,
      isAddingProcess,
    };
  },
};
</script>