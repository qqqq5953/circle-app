<template>
  <div
    v-if="isActivate"
    class="
      fixed
      right-6
      left-6
      top-6
      z-10
      sm:ml-auto sm:w-2/5
      md:w-1/3
      lg:max-w-[350px]
      rounded
      border
      shadow
      bg-white
      text-slate-600 text-sm
    "
    :class="{
      'animate-fade-in': isFadeIn,
      'animate-fade-out': isFadeOut,
    }"
  >
    <div class="flex items-center border-b border-slate-200 py-2 px-6">
      <i
        class="fa-solid fa-square fa-xs"
        :class="
          toastMessage.status === false || error
            ? 'text-red-400'
            : 'text-green-400'
        "
      ></i>
      <span class="ml-4 font-semibold tracking-wider">{{
        toastMessage.title
      }}</span>
      <a href="#" @click.prevent="closeToast(true)" class="ml-auto">
        <i class="fa-solid fa-xmark fa-sm"></i>
      </a>
    </div>

    <div class="pt-4 pb-5 px-6 flex flex-wrap" v-if="toastMessage.result">
      <ul class="w-full">
        <li
          class="flex py-0.5"
          v-for="(item, index) in toastMessage.result"
          :key="index"
        >
          <span class="tracking-wide">{{ index }} : </span>
          <span class="ml-auto font-medium">{{ item }}</span>
        </li>
      </ul>
      <p v-if="error">error: {{ error }}</p>
      <div class="w-full text-right">
        <slot name="btn"></slot>
      </div>
    </div>
  </div>
</template>

<script>
import { computed, ref, watch } from "vue";
export default {
  props: {
    toastMessage: {
      type: [String, Object],
    },
  },
  setup(props) {
    let toastOutTimer;
    const isFadeIn = ref(false);
    const isFadeOut = ref(false);
    const isActivate = ref(false);
    const error = ref(null);

    const toastMessage = computed(() => {
      let obj;

      if (typeof props.toastMessage === "object") {
        obj = {
          status: props.toastMessage?.success,
          title: props.toastMessage?.content,
          result: props.toastMessage?.result,
        };
      } else {
        // error passed from AddStock.vue is of string type
        obj = {
          status: false,
          title: props.toastMessage,
          result: null,
        };
      }

      return obj;
    });

    watch(toastMessage, () => {
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
      toastMessage,
      isFadeIn,
      isFadeOut,
      isActivate,
      error,
      closeToast,
    };
  },
};
</script>