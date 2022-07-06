<template>
  <div>
    <input
      name="shares"
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
      ref="sharesRef"
      placeholder="shares"
      min="0"
      step="0.01"
      v-model="inputValue"
    />
    <ErrorDisplay :errors="inputError" />
  </div>
</template>

<script>
import ErrorDisplay from "@/components/ErrorDisplay.vue";
import useInputValidator from "@/composables/useInputValidator";
import { ref, watch } from "vue";
import { twoDecimal, isEmpty } from "@/modules/validators";

export default {
  components: { ErrorDisplay },
  props: {
    modelValue: String,
  },
  setup(props, { emit }) {
    const sharesRef = ref(null);
    const regex = /^0\.0[1-9]$|^0\.[1-9]\d?$|^[1-9]\d*(\.\d{1,2})?$/;
    const replaceCharacter = /^\d*[^\d^\.]$|^\d*\.\d*\D+$|^0\d$/;

    const { inputError, inputValue, inputValidity } = useInputValidator(
      props.modelValue,
      sharesRef,
      regex,
      replaceCharacter,
      [twoDecimal, isEmpty]
    );

    watch(
      () => props.modelValue,
      () => {
        emit("getInputValidity", inputValidity.value);
      }
    );

    return {
      sharesRef,
      inputError,
      inputValue,
    };
  },
};
</script>

<style>
</style>