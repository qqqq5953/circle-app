<template>
  <div>
    <input
      name="cost"
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
      v-model="inputValue"
    />
    <ErrorDisplay :errors="inputError" v-if="inputError.length" />
  </div>
</template>

<script>
import { ref, watch, defineAsyncComponent } from "vue";
import { twoDecimal, isEmpty } from "@/modules/validators";
import useInputValidator from "@/composables/useInputValidator";

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
    const costRef = ref(null);
    const regex = /^0\.0[1-9]$|^0\.[1-9]\d?$|^[1-9]\d*(\.\d{1,2})?$/;
    const replaceCharacter = /^\d*[^\d^\.]$|^\d*\.\d*\D+$|^0\d$/;

    const { inputError, inputValue, inputValidity } = useInputValidator(
      props.modelValue,
      costRef,
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
      costRef,
      inputError,
      inputValue,
    };
  },
};
</script>

<style>
</style>