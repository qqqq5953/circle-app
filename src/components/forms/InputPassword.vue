<template>
  <div class="relative">
    <input
      name="password"
      type="password"
      class="border border-slate-300 block px-4 py-3 rounded w-full text-sm text-left focus:outline-0 invalid:border-red-400 invalid:border valid:focus:outline-indigo-300/60 valid:focus:outline-2"
      ref="passwordRef"
      placeholder="Password must be at least 6 digit"
      v-model="inputValue"
    />
    <ErrorDisplay :errors="inputError" v-if="hasError" />
  </div>
</template>

<script>
import { ref, watch, defineAsyncComponent, computed } from "vue";
import { isPassword, isEmpty } from "@/modules/validators";
import useInputValidator from "@/composables/useInputValidator";

export default {
  components: {
    ErrorDisplay: defineAsyncComponent(() =>
      import("@/components/ErrorDisplay.vue")
    ),
  },
  props: {
    modelValue: String,
    firebaseError: String,
  },
  setup(props, { emit }) {
    const passwordRef = ref(null);
    const regex = /^\w{6,}$/;
    const params = {
      validators: [isPassword, isEmpty],
      modelValue: props.modelValue,
      DOM: passwordRef,
      regex,
    };

    const { inputError, inputValue, inputValidity } = useInputValidator(params);

    const hasError = computed(() =>
      inputError.value.some((error) => error !== "")
    );

    watch(
      () => props.firebaseError,
      (newErr) => {
        inputError.value.length = 0;
        inputError.value.push(newErr);
        passwordRef.value.setCustomValidity(newErr);
        inputValidity.value.name = passwordRef.value?.name;
        inputValidity.value.validity = passwordRef.value?.checkValidity();
      }
    );

    watch(
      inputValidity,
      (newValidity) => emit("setInputValidity", newValidity),
      { deep: true }
    );

    return {
      passwordRef,
      inputError,
      inputValue,
      hasError,
    };
  },
};
</script>

<style>
</style>