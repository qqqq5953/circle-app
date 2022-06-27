<template>
  <form
    @submit.prevent="addStock"
    class="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-4"
  >
    <div>
      <input
        type="text"
        class="
          form-input
          block
          px-4
          py-3
          rounded-full
          w-full
          text-center
          lg:text-left
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
    </div>

    <div>
      <input
        type="number"
        class="
          form-input
          block
          px-4
          py-3
          rounded-full
          w-full
          text-center
          lg:text-left
        "
        placeholder="cost"
        min="0"
        v-model.trim="stock.cost"
      />
      <small> 測試用 </small>
    </div>

    <div>
      <input
        type="number"
        class="
          form-input
          block
          px-4
          py-3
          rounded-full
          w-full
          text-center
          lg:text-left
        "
        placeholder="shares"
        min="0"
        v-model.trim="stock.shares"
      />
      <small> 測試用 </small>
    </div>
    <button
      type="submit"
      class="
        form-input
        px-4
        py-3
        rounded-full
        flex
        items-center
        justify-center
        gap-2
        disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed
      "
      :disabled="!stock.ticker || !validateMessage?.success || isValidating"
    >
      <span
        class="
          w-4
          h-4
          m-0.5
          rounded-full
          border-red-500 border-2 border-x-transparent
        "
        :class="{ 'animate-spin': isValidating }"
        v-if="isValidating"
      >
      </span>
      <span>add</span>
    </button>
    <div>toastMessage: {{ toastMessage }}</div>
  </form>
</template>

<script>
import { ref, watch } from "vue";
import axios from "axios";
import useAxios from "@/composables/useAxios.js";

export default {
  setup(props, { emit }) {
    const toastMessage = ref(null);
    const validateMessage = ref(null);
    const isValidating = ref(null);
    const allPromises = [];
    const stock = ref({
      ticker: null,
      cost: 200,
      shares: 1,
      date: Date.now(),
    });

    const addStock = async () => {
      if (!stock.value.ticker || !validateMessage.value?.success) return;

      const stockObj = {
        ...stock.value,
        ticker: stock.value.ticker.toUpperCase(),
      };

      const { data, error, loading } = useAxios(
        "/api/addStock",
        "post",
        stockObj
      );

      emit("isLoading", loading.value);

      watch([data, error], ([updateData, updateError]) => {
        updateHoldings(updateData, updateError);
      });
    };

    const updateHoldings = async (updateData, updateError) => {
      if (updateData.success) {
        const { data, ...rest } = useAxios("/api/getHoldings", "get", {});

        watch([data, ref(rest)], ([newData, newRest]) => {
          emit("updateHoldings", newData);
          emit("isLoading", newRest.loading);
          toastMessage.value = updateData.content;
        });
      } else {
        toastMessage.value = updateError.split(" ").splice(0, 4).join(" ");
      }
    };

    // ticker validation
    watch(
      () => stock.value.ticker,
      (newInput, oldInput) => {
        const oldLen = oldInput?.length || 0;
        const newLen = newInput?.length;

        isValidating.value = true;

        if (newLen > oldLen) {
          allPromises.push(axios.post(`/api/checkTicker`, stock.value));
        } else {
          allPromises.pop();
        }

        Promise.all(allPromises)
          .then((response) => {
            const promiseSize = allPromises.length - 1;
            const stock = response[promiseSize];
            validateMessage.value = stock?.data;
          })
          .catch((error) => {
            validateMessage.value = error;
          })
          .finally(() => {
            isValidating.value = false;
          });

        console.log("allPromises", allPromises);
      }
    );

    return {
      addStock,
      stock,
      validateMessage,
      isValidating,
      toastMessage,
    };
  },
};
</script>