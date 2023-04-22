<template>
  <div class="relative">
    <input
      name="email"
      type="text"
      class="border border-slate-300 block px-4 py-3 rounded w-full text-sm text-left focus:outline-0 invalid:border-red-400 invalid:border valid:focus:outline-indigo-300/60 valid:focus:outline-2"
      ref="emailRef"
      placeholder="Example@gmail.com"
      v-model="inputValue"
    />
    <ErrorDisplay :errors="inputError" v-if="hasError" />
  </div>
</template>

<script>
import { ref, watch, defineAsyncComponent, computed } from "vue";
import { isEmpty, isEmail } from "@/modules/validators";
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
    const emailRef = ref(null);
    const regex = /^\S+@\S+[a-zA-Z]$/;
    const params = {
      validators: [isEmail, isEmpty],
      modelValue: props.modelValue,
      DOM: emailRef,
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

        emailRef.value.setCustomValidity(newErr);
        inputValidity.value.name = emailRef.value?.name;
        inputValidity.value.validity = emailRef.value?.checkValidity();
      }
    );

    watch(
      inputValidity,
      (newValidity) => emit("setInputValidity", newValidity),
      { deep: true }
    );

    return {
      emailRef,
      inputError,
      inputValue,
      hasError,
    };
  },
};
</script>

<style>
</style>