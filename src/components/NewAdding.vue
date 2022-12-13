<template>
  <form @submit.prevent="addStock" novalidate class="flex flex-col gap-6">
    <!-- <InputTicker
      :validateMessage="validateMessage"
      :modelValue="stock.ticker"
      @input="stock.ticker = $event.target.value"
      @getInputValidity="getInputValidity"
    /> -->
    <SearchBar />

    <InputCost
      :modelValue="stock.cost"
      @input="stock.cost = $event.target.value"
      @getInputValidity="getInputValidity"
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
import InputTicker from "@/components/forms/InputTicker.vue";
import InputCost from "@/components/forms/InputCost.vue";
import InputShares from "@/components/forms/InputShares.vue";
import SearchBar from "@/components/SearchBar.vue";

export default {
  components: {
    InputTicker,
    InputCost,
    InputShares,
    SearchBar,
  },
  setup(_, { emit }) {
    const validateMessage = ref(null);

    const stock = ref({
      ticker: null,
      cost: null,
      shares: null,
      date: Date.now(),
    });

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

    function addStock() {
      if (!isAllValid.value) return;

      const stockObj = {
        ...stock.value,
        ticker: stock.value.ticker.toUpperCase(),
      };

      const { data, ...rest } = useAxios("/api/checkTicker", "post", stockObj);

      emit("isLoading", rest.loading.value);

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

    return {
      addStock,
      stock,
      validateMessage,

      getInputValidity,
      isAllValid,
    };
  },
};
</script>