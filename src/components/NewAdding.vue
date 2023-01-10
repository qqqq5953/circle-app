<template>
  <div class="flex flex-col gap-6">
    <div class="relative w-full pb-14 mb-6" v-if="!isBuyMore">
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
            <template #action-btn>
              <div>
                <a
                  href="#"
                  class="text-gray-300 inline-block py-1 hover:text-blue-600"
                  @click.stop.prevent="selectTicker"
                >
                  <i class="fas fa-plus text-lg md:text-xl"></i>
                </a>
              </div>
            </template>
          </SearchList>
        </div>
      </Transition>
    </div>

    <div v-if="isBuyMore && !stockToBeTraded">
      <ListSkeleton v-show="!stockToBeTraded" />
    </div>
    <div v-else-if="stock.ticker">
      <TickerInfo
        class="outline outline-1 outline-slate-300 rounded shadow"
        :stockLists="stockLists"
      />
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
    <InputDate
      :modelValue="stock.date"
      @input="stock.date = $event.target.value"
      @getInputValidity="getInputValidity"
    />
  </div>
</template>

<script>
import { ref, watch } from "vue";
import useSearchStore from "@/stores/searchStore.js";
import useHoldingStore from "@/stores/holdingStore.js";
import { storeToRefs } from "pinia";

import InputCost from "@/components/forms/InputCost.vue";
import InputShares from "@/components/forms/InputShares.vue";
import InputDate from "@/components/forms/InputDate.vue";
import ListSkeleton from "@/components/skeleton/ListSkeleton.vue";
import SearchBar from "@/components/SearchBar.vue";
import SearchList from "@/components/SearchList.vue";
import TickerInfo from "@/components/TickerInfo.vue";

export default {
  components: {
    InputCost,
    InputShares,
    InputDate,
    ListSkeleton,
    SearchBar,
    SearchList,
    TickerInfo,
  },
  props: {
    stockToBeTraded: {
      type: Object,
    },
    isBuyMore: {
      type: Boolean,
      default: false,
    },
  },
  setup(props) {
    const $searchStore = useSearchStore();
    const { searchList, isFocus, isSearchListLoading } =
      storeToRefs($searchStore);

    const $holdingStore = useHoldingStore();
    const { stock, inputValidity } = storeToRefs($holdingStore);

    const inputCostRef = ref(null);
    const stockLists = ref([]);

    const selectTicker = () => {
      const [tickerInfo] = searchList.value;

      if (stockLists.value.length) stockLists.value.pop();
      stockLists.value.push(tickerInfo);
      inputCostRef.value.$refs.costRef.focus();

      stock.value = {
        ...stock.value,
        ...tickerInfo,
      };

      getInputValidity({ name: "ticker", validity: true });
    };

    const getInputValidity = (validityObj) => {
      const { name, validity } = validityObj;
      inputValidity.value[name] = validity;
    };

    watch(
      () => props.stockToBeTraded,
      (tickerInfo) => {
        stockLists.value.length = 0;

        if (!tickerInfo) {
          stock.value.ticker = null;

          if (searchList.value) {
            searchList.value.length = 0;
          }
          return;
        }

        inputCostRef.value.$refs.costRef.focus();
        inputCostRef.value.$refs.costRef.select();

        stockLists.value.push(tickerInfo);
        stock.value = {
          ...stock.value,
          ...tickerInfo,
        };

        getInputValidity({ name: "ticker", validity: true });
      }
    );

    return {
      stock,
      getInputValidity,

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