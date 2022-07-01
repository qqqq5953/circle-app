<template>
  <form
    @submit.prevent="addStock"
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
          invalid:outline-red-400
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
          block
          border
          px-4
          py-3
          rounded-full
          w-full
          text-center
          lg:text-left
          invalid:outline-red-400
        "
        placeholder="cost"
        min="0"
        step="0.01"
        v-model.trim="stock.cost"
      />
      <small> 測試用 </small>
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
          invalid:outline-red-400
        "
        placeholder="shares"
        min="0"
        step="0.01"
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
import { ref, watch } from "vue";
import useAxios from "@/composables/useAxios.js";

export default {
  setup(props, { emit }) {
    const validateMessage = ref(null);
    const stock = ref({
      ticker: "ALLL",
      cost: 200,
      shares: 1,
      date: Date.now(),
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
    };
  },
};
</script>