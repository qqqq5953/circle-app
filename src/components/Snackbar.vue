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
      bg-white
      border-slate-300 border
      text-slate-600 text-sm
      sm:mx-auto sm:w-1/2
      md:w-1/3
      lg:w-1/5
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
      <span class="ml-4 font-semibold tracking-wider">{{ message.title }}</span>
      <div class="ml-auto text-xs">
        <slot name="btn"></slot>
      </div>
      <a href="#" @click.prevent="closeToast(true)" class="ml-4">
        <i class="fa-solid fa-xmark fa-sm"></i>
      </a>
    </div>

    <div class="pt-4 pb-5 px-6 flex flex-wrap" v-if="message.result">
      <ul class="w-full pb-3">
        <li
          class="flex py-0.5"
          v-for="(item, index) in message.result"
          :key="index"
        >
          <span class="tracking-wide">{{ index }} : </span>
          <span class="ml-auto font-medium">{{ item }}</span>
        </li>
      </ul>
      <p v-if="error">error: {{ error }}</p>
    </div>
  </div>
</template>

<script>
import { computed, ref, watch } from "vue";
export default {
  props: {
    barMessage: {
      type: [String, Object],
    },
  },
  setup(props) {
    let toastOutTimer;
    const isFadeIn = ref(false);
    const isFadeOut = ref(false);
    const isActivate = ref(false);
    const error = ref(null);

    const message = computed(() => {
      let obj;

      if (typeof props.barMessage === "object") {
        obj = {
          status: props.barMessage?.success,
          title: props.barMessage?.content,
          result: props.barMessage?.result,
        };
      } else {
        // error passed from AddStock.vue is of string type
        obj = {
          status: false,
          title: props.barMessage,
          result: null,
        };
      }

      return obj;
    });

    watch(message, () => {
      activateNotification(1, 1000000);
      deactivateToast(1100000);
    });

    watch(isActivate, (newVal) => {
      if (!newVal) clearTimeout(toastOutTimer);
    });

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

    const toastIn = (ms) => {
      return new Promise((resolve) => {
        setTimeout(() => {
          isFadeIn.value = true;
          resolve();
        }, ms);
      });
    };

    const toastOut = (ms) => {
      return new Promise((resolve) => {
        toastOutTimer = setTimeout(() => {
          isFadeIn.value = false;
          isFadeOut.value = true;
          resolve();
        }, ms);
      });
    };

    const closeToast = (isClose) => {
      isFadeOut.value = false;
      isFadeIn.value = false;
      isActivate.value = !isClose;
    };

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