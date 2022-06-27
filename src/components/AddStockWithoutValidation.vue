<template>
  <form @submit.prevent="addStock" class="flex items-start gap-4">
    <div>
      <input
        type="text"
        class="form-input block px-4 py-3 rounded-full"
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
        class="form-input block px-4 py-3 rounded-full"
        placeholder="cost"
        min="0"
        v-model.trim="stock.cost"
      />
      <small> 測試用 </small>
    </div>

    <div>
      <input
        type="number"
        class="form-input block px-4 py-3 rounded-full"
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
        disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed
      "
      :disabled="!stock.ticker"
    >
      <span>add</span>
    </button>
    <div>toastMessage: {{ toastMessage }}</div>
  </form>
</template>

<script>
import { ref, watch } from "vue";
import useAxios from "@/composables/useAxios.js";

export default {
  setup(props, { emit }) {
    const toastMessage = ref(null);
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

        if (!validateMessage.value?.success) {
          toastMessage.value = "標的新增失敗";
          emit("isLoading", checkRest.loading);
          return;
        }

        tickerConfirmed(stockObj);
      });
    }

    function tickerConfirmed(stockObj) {
      const { data, error } = useAxios("/api/addStock", "post", stockObj);

      watch([data, error], ([updateData, updateError]) => {
        updateHoldings(updateData, updateError);
      });
    }

    function updateHoldings(updateData, updateError) {
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
    }

    return {
      addStock,
      stock,
      toastMessage,
      validateMessage,
    };
  },
};
</script>