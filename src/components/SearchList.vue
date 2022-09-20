<template>
  <div class="shadow-lg rounded bg-white" v-if="searchList?.length">
    <table class="w-full border-collapse table-fixed">
      <slot name="thead"></slot>
      <tbody>
        <tr
          class="hover:bg-slate-100 hover:cursor-pointer"
          v-for="item in searchList"
          :key="item.ticker"
          @click="toInfoPage(item.ticker)"
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
            <div class="flex flex-col md:flex-row md:items-center">
              <p
                class="
                  font-semibold
                  mr-4
                  px-2
                  py-1
                  flex-shrink-0
                  self-start
                  bg-red-400
                  rounded
                  text-white
                  uppercase
                "
              >
                {{ item.ticker }}
              </p>
              <p class="mt-2 md:mt-0 flex-shrink truncate ...">
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
                <span class=""
                  >{{ Math.abs(item.previousCloseChangePercent) }} %</span
                >
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
                v-if="!isTickerInWatchlistDB"
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
import useStockInfoStore from "@/stores/stockInfoStore.js";

export default {
  props: {
    searchList: {
      type: Array,
      default: null,
    },
    watchlistInDB: {
      type: Object,
    },
    isAddingProcess: {
      type: Boolean,
    },
  },
  setup(props, { emit }) {
    const $watchlistStore = useWatchlistStore();
    const $stockInfoStore = useStockInfoStore();
    const router = useRouter();

    const isTickerInWatchlistDB = computed(() => {
      const watchlistInDB = props.watchlistInDB;
      const ticker = props.searchList[0]?.ticker;

      if (!watchlistInDB) return;
      return watchlistInDB.hasOwnProperty(ticker);
    });

    function toInfoPage(ticker) {
      router.push({
        name: "stockInfo",
        params: { ticker },
      });
    }

    function addToWatchlist(ticker, name) {
      if (isTickerInWatchlistDB.value) return;

      const { data, error, loading } = useAxios("/api/addToWatchlist", "post", {
        ticker,
        name,
        currentTab: $watchlistStore.currentTab,
      });

      watch([data, loading], () => {
        console.log("SEARCHLIST");
        emit("loadWatchlist");
      });
    }

    return {
      isTickerInWatchlistDB,
      addToWatchlist,
      toInfoPage,
    };
  },
};
</script>