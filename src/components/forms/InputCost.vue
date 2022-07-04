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
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
    />
    <ErrorDisplay :errors="costError" />
  </div>
</template>

<script>
import ErrorDisplay from "@/components/ErrorDisplay.vue";
import { ref, watch } from "vue";
import { twoDecimal, isEmpty } from "@/modules/validators";

export default {
  components: { ErrorDisplay },
  props: ["modelValue"],
  setup(props, { emit }) {
    const costRef = ref(null);
    const costError = ref(null);

    watch(
      () => props.modelValue,
      (newValue) => {
        const regex =
          /^[0](\.\d{1,2})?$|^[1-9](\.\d{1,2})?$|^[1-9]\d*(\.\d{1,2})?$/;
        const replaceCharacter = /^0\d$|^\D$|^\d\w$/;
        const isPatternMatch = regex.test(newValue);

        if (!isPatternMatch) {
          emit("update:modelValue", newValue.replace(replaceCharacter, ""));
        }

        costError.value = [twoDecimal, isEmpty].map((validator) =>
          validator(isPatternMatch, costRef.value, newValue)
        );

        emit("getInputValidity", {
          name: costRef.value.name,
          validity: costRef.value.checkValidity(),
        });
      }
    );

    return {
      costRef,
      costError,
    };
  },
};
</script>

<style>
</style>