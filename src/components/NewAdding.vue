<template>
  <form @submit.prevent="addStock" novalidate class="flex flex-col gap-6">
    <div class="relative w-full pb-14 mb-6">
      <SearchBar />

      <!-- 搜尋結果 -->
      <Transition>
        <div v-show="isFocus" class="absolute top-12 w-full bg-white">
          <ListSkeleton v-show="isSearchListLoading" />
          <SearchList
            v-show="!isSearchListLoading"
            :searchList="searchList"
            :hasOptionalTd="true"
          >
            <template #action-btn="{ ticker }">
              <div>
                <a
                  href="#"
                  class="text-gray-300 inline-block py-1 hover:text-blue-600"
                  @click.stop.prevent="selectTicker(ticker)"
                >
                  <i class="fas fa-plus text-lg md:text-xl"></i>
                </a>
              </div>
            </template>
          </SearchList>
        </div>
      </Transition>
    </div>

    <div class="border border-slate-300 rounded shadow" v-if="stock.ticker">
      <TickerInfo :stockLists="stockLists" />
    </div>

    <InputCost
      :modelValue="stock.cost"
      @input="stock.cost = $event.target.value"
      @getInputValidity="getInputValidity"
      ref="inputCostRef"
    />

    <InputShares
      :modelValue="stock.shares"
      @input="stock.shares = $event.target.value"
      @getInputValidity="getInputValidity"
    />

    <button
      type="submit"
      class="
        px-4
        py-3
        rounded-full
        text-center
        border
        disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed
      "
      :disabled="!isAllValid"
    >
      add
    </button>

    isAllValid:{{ isAllValid }}
  </form>
</template>

<script>
import { ref, computed } from "vue";
import useWatchlistStore from "@/stores/watchlistStore.js";
import useHoldingStore from "@/stores/holdingStore.js";
import { storeToRefs } from "pinia";
import http from "../api/index";

import InputCost from "@/components/forms/InputCost.vue";
import InputShares from "@/components/forms/InputShares.vue";
import ListSkeleton from "@/components/skeleton/ListSkeleton.vue";
import SearchBar from "@/components/SearchBar.vue";
import SearchList from "@/components/SearchList.vue";
import TickerInfo from "@/components/TickerInfo.vue";

export default {
  components: {
    InputCost,
    InputShares,
    ListSkeleton,
    SearchBar,
    SearchList,
    TickerInfo,
  },
  setup(_, { emit }) {
    const $watchlistStore = useWatchlistStore();
    const { isFocus, searchList, isSearchListLoading } =
      storeToRefs($watchlistStore);

    const $holdingStore = useHoldingStore();
    const { stock } = storeToRefs($holdingStore);
    const { activateToast, updateHoldings, toggleSkeleton } = $holdingStore;

    const inputValidity = ref({
      ticker: null,
      cost: null,
      shares: null,
    });

    const isAllValid = computed(() =>
      Object.values(inputValidity.value).every((item) => !!item)
    );

    const inputCostRef = ref(null);
    const stockLists = ref([]);

    const selectTicker = (ticker) => {
      inputCostRef.value.$refs.costRef.focus();
      stock.value.ticker = ticker;

      if (stockLists.value.length) {
        stockLists.value.pop();
      }
      stockLists.value.push(...searchList.value);

      getInputValidity({ name: "ticker", validity: true });
    };

    const getInputValidity = (validityObj) => {
      const { name, validity } = validityObj;
      inputValidity.value[name] = validity;
    };

    const addStock = async () => {
      if (!isAllValid.value) return;

      emit("closeModal");
      toggleSkeleton(true);

      try {
        const stockObj = {
          ...stock.value,
          ticker: stock.value.ticker.toUpperCase(),
        };

        const res = await http.post(`/api/addStock`, stockObj);
        console.log("addStock res", res);

        await updateHoldings1(res.data, res.data.errorMessage);
      } catch (error) {
        console.log("addStock error", error);
      }
    };

    const updateHoldings1 = async (newData, errorMessage) => {
      console.log("updateHoldings newData", newData);
      console.log("updateHoldings errorMessage", errorMessage);

      if (newData.success) {
        try {
          const res = await http.get(`/api/getHoldings`);

          updateHoldings(res.data);
          toggleSkeleton(false);
          activateToast(newData);
        } catch (error) {
          console.log("updateHoldings error", error);
        }
      } else {
        activateToast(errorMessage);
      }
    };

    return {
      addStock,
      stock,

      getInputValidity,
      isAllValid,

      searchList,
      isSearchListLoading,
      isFocus,

      selectTicker,
      inputCostRef,
      stockLists,
    };
  },
};
</script>