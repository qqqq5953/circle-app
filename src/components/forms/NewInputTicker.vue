<template>
  <div>
    inside:{{ inputTicker }}
    <input
      name="ticker"
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
      ref="tickerRef"
      placeholder="ticker"
      v-model="inputTicker"
    />
    <!-- <ErrorDisplay :errors="tickerError" /> -->
    <ErrorDisplay :errors="inputError" />
    <br />
  </div>
</template>

<script>
import ErrorDisplay from "@/components/ErrorDisplay.vue";
import useInputValidator from "@/composables/useInputValidator";
import { nextTick, ref, watch } from "vue";
import { tickerValidation, isEmpty } from "@/modules/validators";

export default {
  components: { ErrorDisplay },
  props: ["modelValue", "validateMessage"],
  setup(props, { emit }) {
    const tickerError = ref(null);
    const tickerRef = ref(null);
    const regex = /^[a-zA-Z\-?]{1,5}$/;
    const replaceCharacter = /^[a-z]+[^a-z]+$|^[^a-z]+$|^[\-+]$/i;

    const { inputError, inputTicker, emitObj } = useInputValidator(
      props.modelValue,
      tickerRef,
      regex,
      replaceCharacter,
      [tickerValidation, isEmpty]
    );

    watch(inputTicker, () => {
      emit("getInputValidity", emitObj.value);
    });

    watch(
      () => props.validateMessage,
      (newObject) => {
        tickerRef.value.setCustomValidity(newObject.content);
        inputError.value = newObject.content;
        // tickerError.value = newObject.content;
        nextTick(() => tickerRef.value.focus());
      }
    );

    return {
      tickerRef,
      tickerError,
      inputError,
      inputTicker,
    };
  },
};
</script>

<style>
</style>