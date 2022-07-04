<template>
  <div>
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
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
    />
    <ErrorDisplay :errors="tickerError" />
  </div>
</template>

<script>
import ErrorDisplay from "@/components/ErrorDisplay.vue";
import { nextTick, ref, watch } from "vue";
import { tickerValidation, isEmpty } from "@/modules/validators";

export default {
  components: { ErrorDisplay },
  props: ["modelValue", "validateMessage"],
  setup(props, { emit }) {
    const inputTicker = ref(null);
    const tickerError = ref(null);
    const tickerRef = ref(null);

    watch(
      () => props.modelValue,
      (newValue) => {
        const regex = /^[a-zA-Z\-?]{1,5}$/;
        const replaceCharacter = /^[\W+]$|^[\-+]$/;
        const isPatternMatch = regex.test(newValue);

        if (!isPatternMatch) {
          emit(
            "update:modelValue",
            newValue.toString().replace(replaceCharacter, "")
          );
        }

        tickerError.value = [tickerValidation, isEmpty].map((validator) =>
          validator(isPatternMatch, tickerRef.value, newValue)
        );

        emit("getInputValidity", {
          name: tickerRef.value.name,
          validity: tickerRef.value.checkValidity(),
        });

        // console.log("tickerError.value", tickerError.value);
      }
    );

    watch(
      () => props.validateMessage,
      (newObject) => {
        tickerRef.value.setCustomValidity(newObject.content);
        tickerError.value = newObject.content;
        nextTick(() => tickerRef.value.focus());
      }
    );

    return {
      tickerRef,
      inputTicker,
      tickerError,
    };
  },
};
</script>

<style>
</style>