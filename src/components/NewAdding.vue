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
import { ref, watch, computed } from "vue";
import useAxios from "@/composables/useAxios.js";
import InputCost from "@/components/forms/InputCost.vue";
import InputShares from "@/components/forms/InputShares.vue";
import ListSkeleton from "@/components/skeleton/ListSkeleton.vue";
import SearchBar from "@/components/SearchBar.vue";
import SearchList from "@/components/SearchList.vue";
import TickerInfo from "@/components/TickerInfo.vue";
import useWatchlistStore from "@/stores/watchlistStore.js";
import { storeToRefs } from "pinia";
import http from "../api/index";

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
    const $store = useWatchlistStore();
    const { isFocus, searchList, isSearchListLoading } = storeToRefs($store);

    const validateMessage = ref(null);

    const stock = ref({
      ticker: null,
      cost: null,
      shares: null,
      date: Date.now(),
    });

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

    const inputValidity = ref({
      ticker: null,
      cost: null,
      shares: null,
    });

    const isAllValid = computed(() =>
      Object.values(inputValidity.value).every((item) => !!item)
    );

    const getInputValidity = (validityObj) => {
      const { name, validity } = validityObj;
      inputValidity.value[name] = validity;
    };

    // ---------------

    function addStock() {
      if (!isAllValid.value) return;

      emit("closeModal");
      emit("isLoading", true);

      const stockObj = {
        ...stock.value,
        ticker: stock.value.ticker.toUpperCase(),
      };

      const { data, ...rest } = useAxios("/api/checkTicker", "post", stockObj);

      watch([data, ref(rest)], ([checkResponse, checkRest]) => {
        if (!checkResponse.success) {
          validateMessage.value = checkResponse;
          emit("toastMessage", checkResponse);
          emit("isLoading", checkRest.loading);
          return;
        }

        tickerConfirmed(stockObj);
      });
    }

    function tickerConfirmed(stockObj) {
      const { data, error } = useAxios("/api/addStock", "post", stockObj);

      watch([data, error], ([newData, newError]) => {
        console.log("newData", newData);
        console.log("newError", newError);
        updateHoldings(newData, newError);
      });
    }

    function updateHoldings(newData, newError) {
      if (newData.success) {
        const { data, ...rest } = useAxios("/api/getHoldings", "get", {});

        watch([data, ref(rest)], ([updateData, updateRest]) => {
          emit("updateHoldings", updateData);
          emit("isLoading", updateRest.loading);
          emit("toastMessage", newData);
        });
      } else {
        const error = newError.split(" ").splice(0, 4).join(" ");
        emit("toastMessage", error);
      }
    }

    // async function addStock() {
    //   if (!isAllValid.value) return;

    //   emit("closeModal");
    //   emit("isLoading", true);

    //   try {
    //     const stockObj = {
    //       ...stock.value,
    //       ticker: stock.value.ticker.toUpperCase(),
    //     };

    //     const res = await http.post(`/api/addStock`, stockObj);
    //     console.log("addStock res", res);

    //     await updateHoldings(res.data, res.data.errorMessage);
    //   } catch (error) {
    //     console.log("addStock error", error);
    //   }
    // }

    // async function updateHoldings(newData, errorMessage) {
    //   console.log("updateHoldings newData", newData);
    //   console.log("updateHoldings errorMessage", errorMessage);

    //   if (newData.success) {
    //     try {
    //       const res = await http.get(`/api/getHoldings`);

    //       console.log("updateHoldings res", res);

    //       emit("updateHoldings", res.data);
    //       emit("isLoading", false);
    //       emit("toastMessage", newData);
    //     } catch (error) {
    //       console.log("updateHoldings error", error);
    //     }
    //   } else {
    //     emit("toastMessage", errorMessage);
    //   }
    // }

    return {
      addStock,
      stock,
      validateMessage,

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