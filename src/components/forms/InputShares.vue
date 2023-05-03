<template>
  <div>
    <input
      name="shares"
      type="text"
      class="border border-slate-300 block px-4 py-3 rounded w-full text-sm text-center focus:outline-0 invalid:border-red-400 invalid:border valid:focus:outline-blue-300/60 valid:focus:outline-2"
      ref="sharesRef"
      placeholder="shares"
      min="0"
      step="0.01"
      v-model="inputValue"
    />
    <ErrorDisplay :errors="inputError" v-if="hasError" />
  </div>
</template>

<script>
import useInputValidator from "@/composables/useInputValidator";
import { ref, watch, defineAsyncComponent, computed } from "vue";
import { twoDecimal, isEmpty } from "@/modules/validators";

export default {
  components: {
    ErrorDisplay: defineAsyncComponent(() =>
      import("@/components/ErrorDisplay.vue")
    ),
  },
  props: {
    modelValue: String,
  },
  setup(props, { emit }) {
    const sharesRef = ref(null);
    const regex = /^0\.0[1-9]$|^0\.[1-9]\d?$|^[1-9]\d*(\.\d{1,2})?$/;
    const replaceCharacter = /^\d*[^\d^\.]$|^\d*\.\d*\D+$|^0\d$/;
    const params = {
      validators: [twoDecimal, isEmpty],
      modelValue: props.modelValue,
      DOM: sharesRef,
      regex,
      replaceCharacter,
    };

    const { inputError, inputValue, inputValidity } = useInputValidator(params);

    const hasError = computed(() =>
      inputError.value.some((error) => error !== "")
    );

    watch(
      inputValidity,
      (newValidity) => emit("setInputValidity", newValidity),
      { deep: true }
    );

    return {
      sharesRef,
      inputError,
      inputValue,
      hasError,
    };
  },
};
</script>

<style>
</style>