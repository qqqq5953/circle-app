<template>
  <form
    @submit.prevent="addStock"
    class="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-4"
  >
    <InputTicker
      :validateMessage="validateMessage"
      :modelValue="stock.ticker"
      @input="stock.ticker = $event.target.value"
      @setInputValidity="setInputValidity"
    >
      <small v-if="isValidating" class="flex items-center gap-2 py-1">
        <span
          class="
            w-4
            h-4
            m-0.5
            rounded-full
            border-red-500 border-2 border-x-transparent
          "
          :class="{ 'animate-spin': isValidating }"
        >
        </span>
        <span> ticker checking...</span>
      </small>
    </InputTicker>

    <InputCost
      :modelValue="stock.cost"
      @input="stock.cost = $event.target.value"
      @setInputValidity="setInputValidity"
    />

    <InputShares
      :modelValue="stock.shares"
      @input="stock.shares = $event.target.value"
      @setInputValidity="setInputValidity"
    />
    <button
      type="submit"
      class="
        px-4
        py-3
        rounded-full
        border
        disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed
      "
      :disabled="isDisabled"
    >
      add
    </button>
  </form>
</template>

<script>
import { ref, watch, computed } from "vue";
import axios from "axios";
import useAxios from "@/composables/useAxios.js";
import InputTicker from "@/components/forms/InputTicker.vue";
import InputCost from "@/components/forms/InputCost.vue";
import InputShares from "@/components/forms/InputShares.vue";

export default {
  components: {
    InputTicker,
    InputCost,
    InputShares,
  },
  setup(props, { emit }) {
    const stock = ref({
      ticker: null,
      cost: null,
      shares: null,
      date: Date.now(),
    });

    function addStock() {
      if (!checkFormValidity.value) return;

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

      watch([data, error], ([newData, newError]) => {
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

    // input validation
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

    const setInputValidity = (obj) => {
      inputValidity.value[obj.name] = obj.validity;
    };

    // button disabled binding
    const isValidating = ref(null);
    const isTickerExist = ref(null);
    const isDisabled = computed(() => {
      return (
        !checkFormValidity.value || !isTickerExist.value || isValidating.value
      );
    });

    // instant ticker check
    const allPromises = [];
    const validateMessage = ref(null);

    function instantTickerCheck(newInput, oldInput) {
      isValidating.value = true;

      const oldLen = oldInput?.length || 0;
      const newLen = newInput?.length;

      if (newLen > oldLen) {
        allPromises.push(axios.post(`/api/checkTicker`, stock.value));
      } else {
        allPromises.pop();
      }

      Promise.all(allPromises)
        .then((response) => {
          isTickerExist.value = null;

          const promiseSize = allPromises.length - 1;
          const stock = response[promiseSize];

          if (!stock?.data) return;

          if (stock?.data.success === true) {
            isTickerExist.value = true;
          } else {
            validateMessage.value = stock?.data;
            isTickerExist.value = false;
          }

          isValidating.value = false;
        })
        .catch((error) => {
          validateMessage.value = error;
          isValidating.value = false;
        });
    }

    watch(
      () => stock.value.ticker,
      (newInput, oldInput) => {
        const tickerRule = /[a-z\-?]/i;

        // clear allPromises when no input
        if (newInput === "") allPromises.length = 0;

        // prevent non-eng input
        if (!tickerRule.test(newInput)) return;

        instantTickerCheck(newInput, oldInput);

        console.log("allPromises", allPromises);
      }
    );

    return {
      addStock,
      stock,
      validateMessage,

      isValidating,
      isTickerExist,
      isDisabled,

      setInputValidity,
      checkFormValidity,
    };
  },
};
</script>