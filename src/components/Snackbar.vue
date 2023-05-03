<template>
  <Transition name="bar">
    <div
      class="fixed right-6 left-6 bottom-6 z-10 mx-auto sm:w-1/2 max-w-[400px] flex flex-col space-y-3"
      v-if="messages.length !== 0"
    >
      <div
        class="py-2 px-6 relative text-slate-700 shadow-md bg-white text-xs rounded-full border"
        :class="
          message.status === false ? 'border-red-400' : 'border-green-400'
        "
        v-for="message in messages"
        :key="message.title"
      >
        <div class="flex items-center">
          <i
            class="fa-solid fa-square fa-xs"
            :class="
              message.status === false ? 'text-red-400' : 'text-green-400'
            "
          ></i>
          <div
            class="tracking-wider font-semibold"
            :class="message.routeName ? 'ml-4' : 'mx-4'"
          >
            {{ message.title }}
          </div>
          <div
            class="ml-auto mr-4 text-xs shrink-0 rounded"
            v-if="message.routeName"
          >
            <router-link
              :to="{
                name: message.routeName,
                params: {
                  tradeResult: JSON.stringify(message),
                },
              }"
              class="px-2 py-1 rounded text-xs hover:bg-gray-100/70"
              >view</router-link
            >
          </div>
          <button
            class="ml-auto mr-4 text-xs shrink-0 rounded px-2 py-1 hover:bg-slate-100/70"
            v-if="message.errorMessage"
            @click="toAlert(message.errorMessage)"
          >
            details
          </button>
        </div>
        <a
          class="absolute right-2 grid place-items-center h-6 w-6 cursor-pointer hover:bg-gray-200/30 hover:rounded-full top-1/2 -translate-y-1/2"
          href="#"
          @click.prevent="closeBar(message.id)"
        >
          <i class="fa-solid fa-xmark fa-sm"></i>
        </a>
      </div>
    </div>
  </Transition>

  <BaseAlert v-show="isOpen && alertMsg">
    <template #header>
      <h2 class="text-xl lg:text-2xl break-words">Error</h2>
    </template>
    <template #body>
      <p class="text-slate-500 font-light">{{ alertMsg }}</p>
    </template>
    <template #footer>
      <div class="text-right">
        <button
          class="text-indigo-600 px-2 py-1.5 mr-2 rounded hover:bg-slate-100 focus:bg-slate-100 focus:outline-none"
          @click="isOpen = false"
        >
          Close
        </button>
      </div>
    </template>
  </BaseAlert>
</template>

<script>
import { ref, watch } from "vue";
import { storeToRefs } from "pinia";
import useApiStore from "@/stores/apiStore.js";
import BaseAlert from "@/components/BaseAlert.vue";

export default {
  components: { BaseAlert },
  props: {
    barMessage: {
      type: Object,
    },
  },
  setup(props) {
    const messages = ref([]);
    const $store = useApiStore();
    const { axiosMessages } = storeToRefs($store);
    const isOpen = ref(false);

    watch(axiosMessages, (newMessage) => {
      if (newMessage) activateBar(newMessage);
    });

    watch(
      () => props.barMessage,
      (newMessage) => {
        if (newMessage) activateBar(newMessage);
      }
    );

    function activateBar(msg) {
      const timer = setTimeout(() => {
        closeBar(msg.id);
      }, 10000);
      messages.value.unshift({ ...msg, timer });
    }

    function closeBar(id) {
      const idx = messages.value.findIndex((message) => message.id === id);
      const [message] = messages.value.splice(idx, 1);
      // snackbar 消失之際 message 已消失但畫面仍可以按打叉會
      if (!message) return;
      clearTimeout(message.timer);
    }

    const alertMsg = ref(null);
    function toAlert(msg) {
      isOpen.value = true;
      alertMsg.value = msg;
    }

    return {
      messages,
      closeBar,
      isOpen,
      toAlert,
      alertMsg,
    };
  },
};
</script>

<style scoped>
.bar-enter-active,
.bar-leave-active {
  transition: opacity 0.5s ease-in-out;
}

.bar-enter-from,
.bar-leave-to {
  opacity: 0;
}

.bar-enter-to,
.bar-leave-from {
  opacity: 1;
}
</style>