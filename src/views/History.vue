<template>
  <main class="px-4 md:p-10 mx-auto w-full">
    <HoldingTable>
      <template #table-title>
        <h3 class="font-semibold text-base text-blueGray-700">History</h3>
      </template>
      <template #thead-price>
        <th
          class="
            px-0
            py-3
            text-blueGray-500
            align-middle
            text-xs
            uppercase
            font-semibold
            text-center
          "
        >
          Price
        </th>
      </template>
      <template #tbody-price>
        <td
          class="
            border-t-0 border-l-0
            py-3
            px-5
            border-r-0
            text-xs
            whitespace-nowrap
            flex
            items-center
            sm:table-cell
          "
        >
          <span class="sm:hidden font-semibold mr-2">Price:</span>
          <p class="ml-auto text-center">1,200</p>
        </td>
      </template>
    </HoldingTable>

    <form
      @submit.prevent="add"
      class="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-4"
      novalidate
    >
      <div>
        <input
          type="text"
          class="
            block
            border-gray-600 border
            px-4
            py-3
            rounded-full
            w-full
            text-center
            lg:text-left
            invalid:outline-red-400 invalid:border-red-400 invalid:border
          "
          pattern="^[a-zA-Z\-?]{1,5}$"
          ref="tickerRef"
          placeholder="ticker"
          v-model="inputTicker"
        />
        <ErrorDisplay :errors="tickerError" />
      </div>

      <div>
        <input
          type="text"
          class="
            block
            border-gray-600 border
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
          v-model="inputCost"
        />
        <ErrorDisplay :errors="costError" />
      </div>

      <div>
        <input
          type="number"
          class="
            block
            border-gray-600 border
            px-4
            py-3
            rounded-full
            w-full
            text-center
            lg:text-left
            invalid:outline-red-400 invalid:border-red-400 invalid:border
          "
          ref="sharesRef"
          required
          placeholder="shares"
          min="0"
          step="0.01"
          v-model="inputShares"
        />
        <ErrorDisplay :errors="sharesError" />
      </div>
      <button
        type="submit"
        class="
          border-gray-600 border
          px-4
          py-3
          rounded-full
          text-center
          disabled:bg-gray-200
          disabled:text-gray-400
          disabled:cursor-not-allowed
        "
      >
        add
      </button>
    </form>
  </main>
</template>

<script>
import HoldingTable from "@/components/HoldingTable.vue";
import ErrorDisplay from "@/components/ErrorDisplay.vue";
// import Card from '@/components/Card.vue';
import {
  tickerValidation,
  isPositive,
  isEmpty,
  twoDecimal,
} from "@/modules/validators";
import { onMounted, ref, watch, watchEffect } from "vue";
export default {
  components: {
    HoldingTable,
    ErrorDisplay,
  },
  setup() {
    const tickerRef = ref(null);
    const costRef = ref(null);
    const sharesRef = ref(null);

    const inputTicker = ref(null);
    const inputCost = ref(null);
    const inputShares = ref(1);

    const tickerError = ref(null);
    const costError = ref(null);
    const sharesError = ref(null);

    function add() {
      console.log("tickerRef", tickerRef?.value.checkValidity());
      console.log("costRef", costRef?.value.checkValidity());
      console.log("sharesRef", sharesRef?.value.checkValidity());

      console.log(
        tickerRef?.value.checkValidity() &&
          costRef?.value.checkValidity() &&
          sharesRef?.value.checkValidity() &&
          inputTicker.value !== null &&
          inputCost.value !== null &&
          inputShares.value !== null
      );
    }

    onMounted(() => {
      watch(inputTicker, (newValue) => {
        const regex = /^[a-zA-Z\-?]{1,5}$/;
        const isPatternMatch = regex.test(newValue);

        tickerError.value = [tickerValidation, isEmpty].map((validator) =>
          validator(isPatternMatch, tickerRef.value, newValue)
        );

        // console.log("tickerError.value", tickerError.value);
      });

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

    return {
      tickerRef,
      costRef,
      sharesRef,

      inputTicker,
      inputCost,
      inputShares,

      tickerError,
      costError,
      sharesError,
      add,
    };
  },
};
</script>