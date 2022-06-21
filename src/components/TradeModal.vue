<template>
  <div class="modal w-1/2 rounded shadow overflow-hidden">
    <h3 class="modal-header bg-slate-700 text-white py-4 px-8">Trade</h3>
    <div class="modal-body py-14 px-8">
      <form
        @submit.prevent="addStock"
        class="flex flex-col gap-8 w-2/3 mx-auto"
      >
        <input
          type="text"
          class="form-input px-4 py-3 rounded-full"
          placeholder="ticker"
          pattern="^\w{1,5}$"
          ref="tickerRef"
          v-model.trim="stock.ticker"
        />
        <small :class="message?.success ? 'text-green-500' : 'text-red-500'">{{
          message?.content
        }}</small>
        <input
          type="number"
          class="form-input px-4 py-3 rounded-full"
          placeholder="cost"
          min="0"
          v-model.trim="stock.cost"
        />
        <input
          type="number"
          class="form-input px-4 py-3 rounded-full"
          placeholder="shares"
          min="0"
          v-model.trim="stock.shares"
        />
        <input
          type="submit"
          class="form-input px-4 py-3 rounded-full"
          value="add"
        />
      </form>
    </div>
  </div>
</template>


<script>
import { onMounted, ref, toRef, watch } from "vue";
import axios from "axios";

export default {
  props: ["stockToBeTraded"],
  setup(props, { emit }) {
    const stock = ref({
      ticker: null,
      cost: 300,
      shares: 20,
      date: Date.now(),
    });
    const tickerRef = ref(null);
    const stockToBeTraded = toRef(props, "stockToBeTraded");
    stock.value.ticker = stockToBeTraded.value;

    watch(props, (newValue) => {
      stock.value.ticker = newValue.stockToBeTraded;
      tickerRef.value.focus();
    });
    onMounted(() => {
      tickerRef.value.focus();
    });

    const message = ref(null);
    const addStock = async () => {
      const stockObj = {
        ...stock.value,
        ticker: stock.value.ticker.toUpperCase(),
      };
      const response = await axios.post("/api/addStock", stockObj);

      console.log("addStock= ", response.data);

      if (!response.data.success) {
        tickerRef.value.focus();
        message.value = response.data;
        return;
      }

      const obj = {
        open: false,
        success: response.data.success,
      };

      emit("fromTradeModalToHoldings", obj);
    };

    return { stock, message, tickerRef, stockToBeTraded, addStock };
  },
};
</script>