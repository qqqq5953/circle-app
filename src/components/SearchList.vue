<template>
  <div class="shadow-lg rounded bg-white" v-if="searchList?.length">
    <table class="w-full border-collapse table-fixed">
      <slot name="thead"></slot>
      <tbody>
        <tr
          class="hover:bg-slate-100 hover:cursor-pointer"
          v-for="item in searchList"
          :key="item.ticker"
          @click="toInfoPage(item.ticker, item.tempTicker)"
        >
          <th
            class="
              border-t-0 border-x-0
              py-3
              sm:py-4
              px-4
              lg:px-8
              text-xs text-left
              w-5/12
            "
          >
            <div class="flex flex-col md:flex-row md:items-center md:gap-x-3">
              <p
                class="
                  md:w-2/5
                  max-w-[80px]
                  px-1
                  py-1
                  shrink-0
                  rounded
                  text-white text-center
                  font-semibold
                  uppercase
                "
                :class="item.style"
              >
                {{ item.ticker }}
              </p>
              <p class="w-full md:w-3/5 mt-2 md:mt-0 truncate ...">
                {{ item.name }}
              </p>
            </div>
          </th>
          <td
            class="
              border-t-0 border-x-0
              py-3
              sm:py-4
              px-0
              lg:px-6
              text-xs text-center
              w-[12.5%]
              lg:w-auto
            "
          >
            <span>{{ item.price }}</span>
          </td>
          <td
            class="
              border-t-0 border-x-0
              py-3
              sm:py-4
              px-0
              lg:px-6
              text-xs
              font-medium
              w-3/12
              xl:w-auto
            "
          >
            <div class="flex m-auto">
              <div
                class="flex items-center gap-2 m-auto px-3 py-2 rounded"
                :class="
                  item.previousCloseChange > 0
                    ? 'text-red-600 bg-red-100'
                    : 'text-green-600 bg-green-100'
                "
              >
                <i
                  class="fas fa-arrow-up"
                  v-if="item.previousCloseChange > 0"
                ></i>
                <i class="fas fa-arrow-down" v-else></i>
                <span>{{
                  item.previousCloseChangePercent[0] === "-"
                    ? item.previousCloseChangePercent.slice(1)
                    : item.previousCloseChangePercent
                }}</span>
              </div>
            </div>
          </td>
          <td
            class="
              border-t-0 border-x-0
              py-3
              sm:py-4
              px-0
              lg:px-6
              text-xs text-center
              hidden
              lg:table-cell lg:w-auto
            "
          >
            <span
              :class="
                item.previousCloseChange > 0 ? 'text-red-600' : 'text-green-600'
              "
              >{{ item.previousCloseChange }}</span
            >
          </td>
          <td
            class="
              border-t-0 border-x-0
              py-3
              sm:py-4
              pr-3
              lg:pr-4
              text-xs text-center
              w-1/12
            "
          >
            <div v-if="isAddingProcess" class="lg:text-lg">
              <i class="fa-solid fa-spinner animate-spin"></i>
            </div>
            <div v-else>
              <a
                href="#"
                class="text-gray-300"
                @click.stop.prevent="addToWatchlist(item.ticker, item.name)"
                v-if="!isTickerInCachedList"
              >
                <i
                  class="fas fa-plus text-lg md:text-xl hover:text-blue-600"
                ></i>
              </a>
              <span v-else>
                <i
                  class="fa-solid fa-check text-slate-600 text-lg md:text-xl"
                ></i>
              </span>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import { useRouter } from "vue-router";
import useAxios from "@/composables/useAxios.js";
import { watch, computed } from "vue";
import useWatchlistStore from "@/stores/watchlistStore.js";
import { storeToRefs } from "pinia";

export default {
  props: {
    searchList: {
      type: Array,
      default: null,
    },
    isAddingProcess: {
      type: Boolean,
    },
  },
  setup(props, { emit }) {
    const $store = useWatchlistStore();
    const { currentTab, cachedList } = storeToRefs($store);
    const router = useRouter();

    const isTickerInCachedList = computed(() => {
      const ticker = props.searchList[0]?.tempTicker;
      const currentWatchlist = {
        ...cachedList.value[currentTab.value].currentWatchlist,
      };

      return currentWatchlist.hasOwnProperty(ticker);
    });

    function toInfoPage(ticker, tempTicker) {
      if (props.isAddingProcess) return;
      router.push({
        name: "stockInfo",
        params: { ticker, tempTicker },
      });
    }

    function addToWatchlist(ticker, name) {
      if (isTickerInCachedList.value) return;

      const tempTicker = ticker.includes(".") ? ticker.split(".")[0] : ticker;

      const id = ticker.includes(".")
        ? ticker.split(".")[1] + ticker.split(".")[0]
        : ticker;

      const { data, error, loading } = useAxios("/api/addToWatchlist", "post", {
        name,
        currentTab: $store.currentTab,
        searchList: { ...props.searchList[0], tempTicker, id },
      });

      watch(data, () => emit("loadWatchlist", { status: "addTicker" }));
    }

    return {
      isTickerInCachedList,
      addToWatchlist,
      toInfoPage,
    };
  },
};
</script>