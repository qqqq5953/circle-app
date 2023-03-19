<template>
  <transition>
    <div
      v-if="isActivate"
      class="
        fixed
        right-6
        left-6
        bottom-6
        z-10
        sm:mx-auto sm:w-1/2
        md:w-1/3
        flex flex-col
        space-y-3
      "
    >
      <div
        class="
          flex
          items-center
          py-3
          px-6
          relative
          bg-indigo-700
          text-white text-sm
          shadow
          rounded
        "
        :class="{ 'border-b border-slate-200': message.errorMessage }"
        v-for="message in messages"
        :key="message.title"
      >
        <i
          class="fa-solid fa-square fa-xs"
          :class="message.status === false ? 'text-red-400' : 'text-green-400'"
        ></i>
        <div class="ml-4 tracking-wider font-semibold">
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
            class="
              px-2
              py-1.5
              rounded
              text-xs
              bg-gray-100
              text-indigo-700
              hover:bg-white
            "
            >View</router-link
          >
        </div>
        <a
          class="
            absolute
            right-2
            py-0.5
            px-2
            cursor-pointer
            hover:bg-gray-100/30 hover:rounded-full
          "
          :class="[
            message.errorMessage ? 'top-2 mt-px' : 'top-1/2 -translate-y-1/2',
          ]"
          href="#"
          @click.prevent="isActivate = false"
        >
          <i class="fa-solid fa-xmark fa-sm"></i>
        </a>
        <div class="text-xs py-3 px-6" v-if="message.errorMessage">
          {{ message.errorMessage }}
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
import { computed, ref, watch } from "vue";
export default {
  props: {
    barMessage: {
      type: Array,
    },
  },
  setup(props) {
    const isActivate = ref(false);
    const messages = computed(() => {
      return props.barMessage;
    });

    watch(
      () => props.barMessage,
      () => {
        isActivate.value = true;

        setTimeout(() => {
          isActivate.value = false;
          messages.value.pop();
        }, 10000);
      },
      { deep: true }
    );

    return {
      isActivate,
      messages,
    };
  },
};
</script>

<style scoped>
</style>