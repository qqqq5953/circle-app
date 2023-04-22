<template>
  <div>
    <!-- :isDisabled="!isAllValid" -->
    <InputModal
      :isFullPage="false"
      :isOpen="isModalOpen"
      :closeFunc="toggleModal"
      :confirmFunc="confirm"
      :isDisabled="!isAllValid"
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
            <p v-if="alreadySignUp">
              Don't have an account yet?
              <button
                class="underline text-indigo-600"
                @click="$emit('checkSignUp', false)"
              >
                Sign up
              </button>
            </p>
            <p v-else>
              Already have an account?

              <button
                class="underline text-indigo-600"
                @click="$emit('checkSignUp', true)"
              >
                Log in
              </button>
            </p>
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
  emits: ["toggleModal", "checkLogin", "checkSignUp"],
  setup(props, { emit }) {
    const inputValidity = ref({
      email: null,
      password: null,
    });

    function setInputValidity(validityObj) {
      const { name, validity } = validityObj;
      inputValidity.value[name] = validity;
    }

    const isAllValid = computed(() => {
      return Object.values(inputValidity.value).every((item) => !!item);
    });

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
      const endPoint = props.alreadySignUp ? "logIn" : "signUp";

      http
        .post(`/api/${endPoint}`, {
          email: form.value.email,
          password: form.value.password,
        })
        .then((res) => {
          console.log("res", res);
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
      form,
      formError,
      confirm,
      setInputValidity,
    };
  },
};
</script>