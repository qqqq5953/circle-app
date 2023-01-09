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
      lg:w-1/5
      rounded
      bg-slate-600
      text-gray-200
      opacity-50
    "
    :class="{
      'animate-toast-in': isToastIn,
      'animate-toast-out': isToastOut,
    }"
  >
    <div class="flex items-center border-b border-slate-200 py-2 px-8">
      <i
        class="fa-solid fa-square fa-xs"
        :class="
          toastMessage.status === false || error
            ? 'text-red-400'
            : 'text-green-400'
        "
      ></i>
      <span class="ml-4 text-xs">{{ toastMessage.title }}</span>
      <a href="#" @click.prevent="closeToast(true)" class="ml-auto">
        <i class="fa-solid fa-xmark fa-sm"></i>
      </a>
    </div>

    <div class="py-3 px-8" v-if="toastMessage.result">
      <ul v-for="(item, index) in toastMessage.result" :key="item.ticker">
        <li class="flex">
          <span class="font-bold tracking-wide">{{ index }} : </span>
          <span class="ml-auto">{{ item }}</span>
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
    toastMessage: {
      type: [String, Object],
    },
  },
  setup(props) {
    let toastOutTimer;
    const isToastIn = ref(false);
    const isToastOut = ref(false);
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
      activateToast(1, 10000);
      deactivateToast(11000);
    });

    watch(isActivate, (newVal) => {
      if (!newVal) clearTimeout(toastOutTimer);
    });

    const activateToast = async (inMilisecond, outMilisecond) => {
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
        isToastOut.value = false;
        isActivate.value = false;
      }, milisecond);
    };

    const toastIn = (ms) => {
      return new Promise((resolve) => {
        setTimeout(() => {
          isToastIn.value = true;
          resolve();
        }, ms);
      });
    };

    const toastOut = (ms) => {
      return new Promise((resolve) => {
        toastOutTimer = setTimeout(() => {
          isToastIn.value = false;
          isToastOut.value = true;
          resolve();
        }, ms);
      });
    };

    const closeToast = (isClose) => {
      isToastOut.value = false;
      isToastIn.value = false;
      isActivate.value = !isClose;
    };

    return {
      toastMessage,
      isToastIn,
      isToastOut,
      isActivate,
      error,
      closeToast,
    };
  },
};
</script>