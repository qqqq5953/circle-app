<template>
  <form
    @submit.prevent="addStock"
    novalidate
    class="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-4"
  >
    <div>
      <input
        type="text"
        class="
          block
          border
          px-4
          py-3
          rounded-full
          w-full
          text-center
          lg:text-left
          invalid:outline-red-400 invalid:border-red-400 invalid:border
        "
        placeholder="ticker"
        pattern="^\w{1,5}$"
        ref="tickerRef"
        v-model.trim="stock.ticker"
      />
      <small
        :class="{ 'text-red-500': !validateMessage?.success }"
        v-if="!validateMessage?.success"
      >
        {{ validateMessage?.content }}
      </small>
      <ErrorDisplay :errors="tickerError" />
    </div>

    <div>
      <input
        type="number"
        class="
          block
          border
          px-4
          py-3
          rounded-full
          w-full
          text-center
          lg:text-left
          invalid:outline-red-400 invalid:border-red-400 invalid:border
        "
        ref="costRef"
        placeholder="cost"
        min="0"
        step="0.01"
        v-model.trim="stock.cost"
      />
      <ErrorDisplay :errors="costError" />
    </div>

    <div>
      <input
        type="number"
        class="
          block
          border
          px-4
          py-3
          rounded-full
          w-full
          text-center
          lg:text-left
          invalid:outline-red-400 invalid:border-red-400 invalid:border
        "
        ref="sharesRef"
        placeholder="shares"
        min="0"
        step="0.01"
        v-model.trim="stock.shares"
      />
      <ErrorDisplay :errors="sharesError" />
    </div>
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
      :disabled="!stock.ticker"
    >
      add
    </button>
  </form>
</template>

<script>
import { ref, watch, onMounted } from "vue";
import useAxios from "@/composables/useAxios.js";
import ErrorDisplay from "@/components/ErrorDisplay.vue";
import {
  tickerValidation,
  isPositive,
  isEmpty,
  twoDecimal,
} from "@/modules/validators";
export default {
  components: {
    ErrorDisplay,
  },
  setup(props, { emit }) {
    const tickerRef = ref(null);
    const costRef = ref(null);
    const sharesRef = ref(null);

    const inputTicker = ref(null);
    const inputCost = ref(null);
    const inputShares = ref(1);

    const tickerError = ref(null);
    const costError = ref(null);
    const sharesError = ref(null);

    const validateMessage = ref(null);
    const stock = ref({
      ticker: null,
      cost: 200,
      shares: 1,
      date: Date.now(),
    });

    onMounted(() => {
      watch(
        () => stock.value.ticker,
        (newValue) => {
          const regex = /^[a-zA-Z\-?]{1,5}$/;
          const isPatternMatch = regex.test(newValue);

          tickerError.value = [tickerValidation, isEmpty].map((validator) =>
            validator(isPatternMatch, tickerRef.value, newValue)
          );

          // console.log("tickerError.value", tickerError.value);
        }
      );

      watch(inputCost, (newValue) => {
        const regex =
          /^[0](\.\d{1,2})?$|^[1-9](\.\d{1,2})?$|^[1-9]\d*(\.\d{1,2})?$/;
        const replaceCharacter = /^0\d$|^\D$|^\d\w$/;
        const isPatternMatch = regex.test(newValue);
        console.log("===============");
        console.log("newValue", newValue);

        if (!isPatternMatch) {
          inputCost.value = newValue.toString().replace(replaceCharacter, "");
        }

        costError.value = [twoDecimal, isEmpty].map((validator) =>
          validator(isPatternMatch, costRef.value, newValue)
        );

        console.log("costError.value", costError.value);
      });

      watch(inputShares, (newValue) => {
        const regex =
          /^[0](\.\d{1,2})?$|^[1-9](\.\d{1,2})?$|^[1-9]\d*(\.\d{1,2})?$/;
        const replaceCharacter = /^0\d$|^\D$|^\d\w$/;
        const isPatternMatch = regex.test(newValue);

        if (!isPatternMatch) {
          inputShares.value = newValue.toString().replace(replaceCharacter, "");
        }

        sharesError.value = [twoDecimal, isPositive, isEmpty].map((validator) =>
          validator(isPatternMatch, sharesRef.value, newValue)
        );

        console.log("sharesRef.value", sharesError.value);
      });
    });

    function addStock() {
      if (!stock.value.ticker) return;

      const stockObj = {
        ...stock.value,
        ticker: stock.value.ticker.toUpperCase(),
      };

      const { data, ...rest } = useAxios("/api/checkTicker", "post", stockObj);

      emit("isLoading", rest.loading.value);

      watch([data, ref(rest)], ([checkResponse, checkRest]) => {
        validateMessage.value = checkResponse;

        if (!checkResponse.success) {
          emit("toastMessage", checkResponse);
          emit("isLoading", checkRest.loading);
          return;
        }

        tickerConfirmed(stockObj);
      });
    }

    function tickerConfirmed(stockObj) {
      const { data, error } = useAxios("/api/addStock", "post", stockObj);

      watch([data, error], ([updateData, updateError]) => {
        console.log("updateData", updateData);
        updateHoldings(updateData, updateError);
      });
    }

    function updateHoldings(updateData, updateError) {
      if (updateData.success) {
        const { data, ...rest } = useAxios("/api/getHoldings", "get", {});

        watch([data, ref(rest)], ([newData, newRest]) => {
          emit("updateHoldings", newData);
          emit("isLoading", newRest.loading);
          emit("toastMessage", updateData);
        });
      } else {
        const error = updateError.split(" ").splice(0, 4).join(" ");
        emit("toastMessage", error);
      }
    }

    return {
      addStock,
      stock,
      validateMessage,

      tickerRef,
      costRef,
      sharesRef,

      inputTicker,
      inputCost,
      inputShares,

      tickerError,
      costError,
      sharesError,
    };
  },
};
</script>