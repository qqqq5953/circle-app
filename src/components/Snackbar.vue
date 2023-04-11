<template>
  <Transition name="bar">
    <div
      v-if="messages.length !== 0"
      class="fixed right-6 left-6 bottom-6 z-10 sm:mx-auto sm:w-1/2 max-w-[400px] flex flex-col space-y-3"
    >
      <div
        class="py-3 px-6 relative text-slate-100 bg-indigo-600 text-xs shadow-md shadow-indigo-200 rounded"
        :class="{ 'border-b border-slate-200': message.errorMessage }"
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
          <div class="ml-auto mr-4 text-xs shrink-0" v-if="message.routeName">
            <router-link
              :to="{
                name: message.routeName,
                params: {
                  tradeResult: JSON.stringify(message),
                },
              }"
              class="px-2 py-1.5 rounded text-xs bg-gray-100 text-indigo-700 hover:bg-white"
              >View</router-link
            >
          </div>
        </div>
        <div class="text-xs pt-3 px-6" v-if="message.errorMessage">
          {{ message.errorMessage }}
        </div>
        <a
          class="absolute right-2 grid place-items-center h-6 w-6 cursor-pointer hover:bg-gray-100/30 hover:rounded-full"
          :class="[
            message.errorMessage ? 'top-2 mt-px' : 'top-1/2 -translate-y-1/2',
          ]"
          href="#"
          @click.prevent="closeBar(message.id)"
        >
          <i class="fa-solid fa-xmark fa-sm"></i>
        </a>
      </div>
    </div>
  </Transition>
</template>

<script>
import { ref, watch } from "vue";
import { storeToRefs } from "pinia";
import useApiStore from "@/stores/apiStore.js";

export default {
  props: {
    barMessage: {
      type: Object,
    },
  },
  setup(props) {
    const messages = ref([]);
    const $store = useApiStore();
    const { axiosMessages } = storeToRefs($store);

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
      }, 60000);
      messages.value.unshift({ ...msg, timer });
    }

    function closeBar(id) {
      const idx = messages.value.findIndex((message) => message.id === id);
      const [message] = messages.value.splice(idx, 1);
      // snackbar 消失之際 message 已消失但畫面仍可以按打叉會
      if (!message) return;
      clearTimeout(message.timer);
    }

    return {
      messages,
      closeBar,
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