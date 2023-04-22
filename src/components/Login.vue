<template>
  <div>
    <!-- :isDisabled="!isAllValid" -->
    <InputModal
      :isFullPage="false"
      :isOpen="isModalOpen"
      :closeFunc="toggleModal"
      :confirmFunc="confirm"
      :isDisabled="isProcessing"
    >
      <template #title>
        {{ alreadySignUp ? "Log in" : "Sign up" }}
      </template>

      <template #inputs>
        <div class="space-y-8">
          <div class="space-y-2">
            <label class="text-slate-600" for="email">Email</label>
            <InputEmail
              :modelValue="form.email"
              :firebaseError="formError.email"
              @input="form.email = $event.target.value"
              @setInputValidity="setInputValidity"
              ref="inputEmailRef"
            />
          </div>
          <div class="space-y-2">
            <label class="text-slate-600" for="password">Password</label>
            <InputPassword
              :modelValue="form.password"
              :firebaseError="formError.password"
              @input="form.password = $event.target.value"
              @setInputValidity="setInputValidity"
              ref="inputPasswordRef"
            />
          </div>
          <div class="text-slate-600 text-sm font-light">
            {{
              alreadySignUp
                ? "Don't have an account yet?"
                : "Already have an account?"
            }}

            <button
              class="underline text-indigo-600 focus:outline-none focus:font-normal rounded"
              @click="
                alreadySignUp
                  ? $emit('toggleSignUp', false)
                  : $emit('toggleSignUp', true)
              "
            >
              {{ alreadySignUp ? "Sign up" : "Log in" }}
            </button>
          </div>
        </div>
      </template>
      <template #okButton>
        <div>
          {{ alreadySignUp ? "Log in" : "Create account" }}
        </div>
      </template>
    </InputModal>
  </div>
</template>

<script>
import { ref, defineAsyncComponent, computed, watch } from "vue";
import InputEmail from "@/components/forms/InputEmail.vue";
import InputPassword from "@/components/forms/InputPassword.vue";
import http from "@/api";
import { useClickPrevention } from "@/composables/useClickPrevention.js";

export default {
  components: {
    InputEmail,
    InputPassword,
    InputModal: defineAsyncComponent(() =>
      import("@/components/InputModal.vue")
    ),
  },
  props: {
    isModalOpen: Boolean,
    alreadySignUp: Boolean,
    toggleModal: Function,
  },
  emits: ["toggleModal", "checkLogin", "toggleSignUp"],
  setup(props, { emit }) {
    const { isClickDisabled, preventMultipleClicks } = useClickPrevention(3000);

    // validity
    const inputValidity = ref({
      email: null,
      password: null,
    });

    function setInputValidity(validityObj) {
      const { name, validity } = validityObj;
      inputValidity.value[name] = validity;
    }

    // loading
    const isAllValid = computed(() => {
      return Object.values(inputValidity.value).every((item) => !!item);
    });
    const isLoading = ref(false);
    const isProcessing = computed(() => {
      return !isAllValid.value || isLoading.value;
    });

    function toggleLoading(val) {
      isLoading.value = val;
    }

    // sign up
    const form = ref({
      email: "",
      password: "",
    });

    const formError = ref({
      email: "",
      password: "",
    });

    const hasLogin = ref(false);

    function confirm() {
      if (!isAllValid.value || isClickDisabled.value) return;
      preventMultipleClicks();
      toggleLoading(true);

      const endPoint = props.alreadySignUp ? "logIn" : "signUp";

      http
        .post(`/api/${endPoint}`, {
          email: form.value.email,
          password: form.value.password,
        })
        .then((res) => {
          console.log("confirm res", res);
          const { success, errorMessage, result } = res.data;
          const isEmailError = errorMessage?.includes("email");
          const isUserError = errorMessage?.includes("user");
          const isPasswordError = errorMessage
            ?.toLowerCase()
            .includes("password");

          if (success) {
            hasLogin.value = result.hasLogin;
            resetForm();
            emit("toggleModal", { open: false });
            emit("checkLogin", result.hasLogin);
          } else if (isEmailError || (isUserError && !isPasswordError)) {
            formError.value.email = errorMessage;
          } else if (isPasswordError) {
            formError.value.password = errorMessage;
          }
        })
        .catch((error) => {
          console.log("login error", error);
        })
        .finally(() => {
          toggleLoading(false);
        });
    }

    const inputEmailRef = ref(null);
    const inputPasswordRef = ref(null);

    function resetForm() {
      inputEmailRef.value.inputValue = null;
      inputPasswordRef.value.inputValue = null;
    }

    watch(
      () => props.alreadySignUp,
      () => {
        resetForm();
      }
    );

    return {
      inputEmailRef,
      inputPasswordRef,
      isAllValid,
      isProcessing,
      form,
      formError,
      confirm,
      setInputValidity,
    };
  },
};
</script>