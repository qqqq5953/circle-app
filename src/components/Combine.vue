<template>
  <form
    @submit.prevent="addStock"
    novalidate
    class="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-4"
  >
    <InputTicker
      ref="inputTickerRef"
      :validateMessage="validateMessage"
      :modelValue="stock.ticker"
      @input="stock.ticker = $event.target.value"
      @getInputValidity="getInputValidity"
    />

    <InputCost
      ref="inputCostRef"
      :modelValue="stock.cost"
      @input="stock.cost = $event.target.value"
      @getInputValidity="getInputValidity"
    />

    <InputShares
      ref="inputSharesRef"
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
        disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed
      "
      :disabled="!checkFormValidity"
    >
      add
    </button>
  </form>
</template>

<script>
import { ref, watch, computed } from "vue";
import useAxios from "@/composables/useAxios.js";
import ErrorDisplay from "@/components/ErrorDisplay.vue";
import InputTicker from "@/components/forms/InputTicker.vue";
import InputCost from "@/components/forms/InputCost.vue";
import InputShares from "@/components/forms/InputShares.vue";

export default {
  components: {
    ErrorDisplay,
    InputTicker,
    InputCost,
    InputShares,
  },
  setup(props, { emit }) {
    const inputTickerRef = ref(null);
    const inputCostRef = ref(null);
    const inputSharesRef = ref(null);
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

    const checkFormValidity = computed(() => {
      for (let i in inputValidity.value) {
        if (!inputValidity.value[i]) return false;
      }
      return true;
    });

    const getInputValidity = (obj) =>
      (inputValidity.value[obj.name] = obj.validity);

    function addStock() {
      if (!checkFormValidity.value) return;

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
      checkFormValidity,

      inputTickerRef,
      inputCostRef,
      inputSharesRef,
    };
  },
};
</script>