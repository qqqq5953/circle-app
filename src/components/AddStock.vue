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
      <!-- <small :class="message?.success ? 'text-green-500' : 'text-red-500'">
            {{ message?.content || "無此標的" }}
          </small> -->
      <p
        :class="formValidation?.success ? '' : 'text-red-500'"
        v-if="!formValidation?.success"
      >
        {{ formValidation?.content }}
      </p>
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
        disabled:bg-green-300
      "
    >
      <!-- :disabled="!stock.ticker || isValidating" -->
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
    <div>updateMessage: {{ updateMessage }}</div>
  </form>
</template>

<script>
import { ref, watch, watchEffect } from "vue";
import axios from "axios";
import useAxios from "@/composables/useAxios.js";

export default {
  setup(props, { emit }) {
    const updateMessage = ref(null);

    const updateHoldings = async (
      updateResponse,
      updateLoading,
      errorMesssage
    ) => {
      if (!updateResponse.success) {
        updateMessage.value = errorMesssage.split(" ").splice(0, 4).join(" ");
      } else {
        const response = await axios.get(`/api/getHoldings`);
        emit("updateHoldings", response.data.data);
        updateMessage.value = updateResponse.content;
      }

      emit("isLoading", updateLoading);
    };

    const stock = ref({
      ticker: null,
      cost: 200,
      shares: 1,
      date: Date.now(),
    });

    const addStock = async () => {
      console.log("click");
      if (!stock.value.ticker) return;

      const stockObj = {
        ...stock.value,
        ticker: stock.value.ticker.toUpperCase(),
      };

      const {
        data: response,
        error: errorMesssage,
        loading: isLoading,
      } = useAxios("/api/addStock", "post", stockObj);

      console.log("isLoading first change");
      emit("isLoading", isLoading.value);

      watch([response, isLoading], ([newResponse, newIsLoading]) => {
        updateHoldings(newResponse, newIsLoading, errorMesssage.value);
      });
    };

    const formValidation = ref(null);
    const isValidating = ref(null);
    const allPromises = [];
    watchEffect(async () => {
      /*  
        清空 input 後，再次輸入前先清空 allPromises
        否則 allPromises 會太肥
        */
      if (!stock.value.ticker) return (allPromises.length = 0);

      allPromises.push(axios.post(`/api/checkTicker/${stock.value.ticker}`));
      console.log("allPromises", allPromises);

      isValidating.value = true;

      Promise.all(allPromises)
        .then((res) => {
          const promiseSize = allPromises.length - 1;
          const result = res[promiseSize];
          formValidation.value = result?.data;
          console.log("result.data", result?.data);
          if (formValidation.value?.content) allPromises.length = 0;
        })
        .catch((error) => {
          console.log("check error", error);
          // formValidation.value = error;
        })
        .finally(() => {
          isValidating.value = false;
        });
    });

    return {
      addStock,
      stock,
      formValidation,
      isValidating,
      updateMessage,
    };
  },
};
</script>