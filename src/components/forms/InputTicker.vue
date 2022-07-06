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
      maxlength="5"
      placeholder="ticker"
      v-model="inputValue"
    />
    <ErrorDisplay :errors="inputError" v-if="inputError.length" />
    <slot></slot>
  </div>
</template>

<script>
import { nextTick, ref, watch, defineAsyncComponent } from "vue";
import useInputValidator from "@/composables/useInputValidator";
import { tickerValidation, isEmpty } from "@/modules/validators";

export default {
  components: {
    ErrorDisplay: defineAsyncComponent(() =>
      import("@/components/ErrorDisplay.vue")
    ),
  },
  props: {
    modelValue: String,
    validateMessage: Object,
  },
  setup(props, { emit }) {
    const tickerRef = ref(null);
    const regex = /^[a-z\-?]{1,5}$/i;
    const replaceCharacter = /^[a-z]+[^a-z]+$|^[^a-z]+$|^[\-+]$/i;

    const { inputError, inputValue, inputValidity } = useInputValidator(
      props.modelValue,
      tickerRef,
      regex,
      replaceCharacter,
      [tickerValidation, isEmpty]
    );

    watch(
      () => props.modelValue,
      () => {
        emit("getInputValidity", inputValidity.value);
      }
    );

    watch(
      () => props.validateMessage,
      (newObject) => {
        // console.log("validity: false");

        // emit("getInputValidity", { name: "ticker", validity: false });
        tickerRef.value.setCustomValidity(newObject.content);
        inputError.value = newObject.content;

        nextTick(() => tickerRef.value.focus());
      }
    );

    return {
      tickerRef,
      inputError,
      inputValue,
    };
  },
};
</script>

<style>
</style>