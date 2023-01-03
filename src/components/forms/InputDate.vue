<template>
  <div>
    <input
      name="cost"
      type="date"
      class="
        border border-slate-300
        block
        px-4
        py-3
        rounded
        w-full
        text-sm text-center
        lg:text-left
        invalid:outline-red-400 invalid:border-red-400 invalid:border
        focus:ring-blue-300/60 focus:ring-inset focus:ring-2 focus:outline-0
      "
      ref="dateRef"
      placeholder="date"
      :max="today"
      v-model="inputValue"
    />
    <ErrorDisplay :errors="inputError" v-if="inputError.length" />
  </div>
</template>

<script>
import { ref, watch, defineAsyncComponent } from "vue";
import { isYYYYMMDD } from "@/modules/validators";
import useInputValidator from "@/composables/useInputValidator";
import useHoldingStore from "@/stores/holdingStore.js";
import { storeToRefs } from "pinia";

export default {
  components: {
    ErrorDisplay: defineAsyncComponent(() =>
      import("@/components/ErrorDisplay.vue")
    ),
  },
  props: {
    modelValue: {
      type: String,
    },
  },
  setup(props, { emit }) {
    const $store = useHoldingStore();
    const { today } = storeToRefs($store);
    const dateRef = ref(null);
    const regex = /^\d{4}\-(0[1-9]|1[0-2])\-(0[1-9]|[1-2][0-9]|3[0-1])$/;

    const params = {
      validators: [isYYYYMMDD],
      modelValue: props.modelValue,
      DOM: dateRef,
      regex,
    };

    const { inputError, inputValue, inputValidity } = useInputValidator(params);

    watch(
      () => props.modelValue,
      () => emit("getInputValidity", inputValidity.value)
    );

    return {
      dateRef,
      inputError,
      inputValue,
      today,
    };
  },
};
</script>

<style>
</style>