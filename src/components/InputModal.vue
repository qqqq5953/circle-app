<template>
  <BaseModal :isFullPage="isFullPage" v-show="isOpen">
    <template #header>
      <h2 class="py-2 font-medium text-center text-xl md:text-2xl">
        <slot name="title"></slot>
      </h2>
    </template>
    <template #body>
      <slot name="inputs"></slot>
    </template>
    <template #footer>
      <div class="text-right">
        <button
          class="text-indigo-600 px-2 py-1.5 mr-2 rounded hover:bg-slate-100 focus:bg-slate-100 focus:outline-none"
          @click="closeModal"
        >
          Close
        </button>
        <button
          class="rounded px-2 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed focus:outline-none focus:bg-indigo-500"
          @click="confirmFunc"
          v-if="confirmFunc"
          :disabled="isDisabled"
        >
          <slot name="okButton"></slot>
        </button>
      </div>
    </template>
  </BaseModal>
</template>

<script>
import BaseModal from "@/components/BaseModal.vue";

export default {
  components: {
    BaseModal,
  },
  props: {
    closeFunc: {
      type: Function,
    },
    confirmFunc: {
      type: Function,
    },
    isDisabled: {
      type: Boolean,
    },
    isOpen: {
      type: Boolean,
      default: false,
    },
    isFullPage: {
      type: Boolean,
      default: false,
    },
  },
  setup(props) {
    function closeModal() {
      if (props.closeFunc) props.closeFunc({ open: false });
    }

    return {
      closeModal,
    };
  },
};
/* 
打開 buy
isBuyMore.value = true;
tickerToBeTraded.value = tickerInfo;
set validity true：ticker, date

關閉
清空欄位
tickerToBeTraded.value = null
validity 重設




*/
</script>

