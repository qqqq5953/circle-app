<template>
  <div
    v-if="isActivate"
    class="
      fixed
      right-6
      left-6
      bottom-6
      z-10
      shadow
      rounded
      bg-indigo-700
      text-white text-sm
      sm:mx-auto sm:w-1/2
      md:w-1/3
      lg:w-2/5
    "
    :class="{
      'animate-fade-in': isFadeIn,
      'animate-fade-out': isFadeOut,
    }"
  >
    <div
      class="flex items-center py-3 px-6"
      :class="{ 'border-b border-slate-200': message.result }"
    >
      <i
        class="fa-solid fa-square fa-xs"
        :class="
          message.status === false || error ? 'text-red-400' : 'text-green-400'
        "
      ></i>
      <div class="mx-4 tracking-wider">
        <span class="font-semibold">{{ message.title }}</span>
        <div class="text-xs mt-1" v-if="message.errorMessage">
          {{ message.errorMessage }}
        </div>
      </div>
      <div class="ml-auto text-xs" v-if="message.result && !error">
        <slot name="btn" :tradeResult="message"></slot>
      </div>
      <div class="ml-4" v-if="error">{{ error }}</div>
      <a href="#" @click.prevent="closeToast(true)" class="ml-auto">
        <i class="fa-solid fa-xmark fa-sm"></i>
      </a>
    </div>
  </div>
</template>

<script>
import { computed, ref, watch } from "vue";
export default {
  props: {
    barMessage: {
      type: Object,
    },
  },
  setup(props) {
    const isFadeIn = ref(false);
    const isFadeOut = ref(false);
    const isActivate = ref(false);
    const error = ref(null);

    const message = computed(() => {
      if (!props.barMessage) return;

      const { success, content, errorMessage, result } = props.barMessage;

      return {
        status: success,
        title: content,
        errorMessage,
        result,
      };

      // let obj;
      // if (typeof props.barMessage === "object") {
      //   obj = {
      //     status: props.barMessage?.success,
      //     title: props.barMessage?.content,
      //     errorMessage: props.barMessage?.errorMessage,
      //     result: props.barMessage?.result,
      //   };
      // } else {
      //   // error passed from AddStock.vue is of string type
      //   obj = {
      //     status: false,
      //     title: props.barMessage,
      //     result: null,
      //   };
      // }

      // return obj;
    });

    let toastOutTimer;
    const toastOut = (ms) => {
      return new Promise((resolve) => {
        toastOutTimer = setTimeout(() => {
          isFadeIn.value = false;
          isFadeOut.value = true;
          resolve();
        }, ms);
      });
    };

    const toastIn = (ms) => {
      return new Promise((resolve) => {
        setTimeout(() => {
          isFadeIn.value = true;
          resolve();
        }, ms);
      });
    };

    const activateNotification = async (inMilisecond, outMilisecond) => {
      try {
        isActivate.value = true;
        await toastIn(inMilisecond);
        await toastOut(outMilisecond);
      } catch (error) {
        error.value = error;
        console.log("error", error);
      }
    };

    const deactivateToast = (milisecond) => {
      setTimeout(() => {
        isFadeOut.value = false;
        isActivate.value = false;
      }, milisecond);
    };

    const closeToast = (isClose) => {
      isFadeOut.value = false;
      isFadeIn.value = false;
      isActivate.value = !isClose;
    };

    watch(message, () => {
      activateNotification(1, 1000000);
      deactivateToast(1100000);
    });

    watch(isActivate, (newVal) => {
      if (!newVal) clearTimeout(toastOutTimer);
    });

    return {
      message,
      isFadeIn,
      isFadeOut,
      isActivate,
      error,
      closeToast,
    };
  },
};
</script>