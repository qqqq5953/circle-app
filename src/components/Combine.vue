<template>
  <form
    @submit.prevent="addStock"
    novalidate
    class="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-4"
  >
    <NewInputTicker
      :modelValue="stock.ticker"
      @input="stock.ticker = $event.target.value"
      @getInputValidity="getInputValidity"
      ref="inputTickerRef"
    />
    <!-- <InputTicker
      v-model.trim="stock.ticker"
      :validateMessage="validateMessage"
      @getInputValidity="getInputValidity"
      ref="inputTickerRef"
    /> -->

    <InputCost
      v-model.trim="stock.cost"
      @getInputValidity="getInputValidity"
      ref="inputCostRef"
    />

    <InputShares
      v-model.trim="stock.shares"
      @getInputValidity="getInputValidity"
      ref="inputSharesRef"
    />

    <button
      type="submit"
      class="
        form-input
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
import NewInputTicker from "@/components/forms/NewInputTicker.vue";
import InputCost from "@/components/forms/InputCost.vue";
import InputShares from "@/components/forms/InputShares.vue";

export default {
  components: {
    ErrorDisplay,
    NewInputTicker,
    InputTicker,
    InputCost,
    InputShares,
  },
  setup(props, { emit }) {
    const inputTickerRef = ref(null);
    const inputCostRef = ref(null);
    const inputSharesRef = ref(null);

    const tickerError = ref(null);
    const costError = ref(null);
    const sharesError = ref(null);

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

    const getInputValidity = (obj) =>
      (inputValidity.value[obj.name] = obj.validity);

    const checkFormValidity = computed(() => {
      console.log("inputValidity", inputValidity.value);
      for (let i in inputValidity.value) {
        if (!inputValidity.value[i]) return false;
      }
      return true;
    });

    function addStock() {
      console.log("stock", stock);

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
        // updateHoldings(newData, newError);
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

      tickerError,
      costError,
      sharesError,
    };
  },
};
</script>