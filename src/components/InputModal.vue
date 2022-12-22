<template>
  <BaseModal :isFullPage="isFullPage" v-if="isOpen">
    <template #header>
      <h2 class="text-xl lg:text-2xl">
        <slot name="title"></slot>
      </h2>
    </template>
    <template #body>
      <slot name="inputs"></slot>
    </template>
    <template #footer>
      <div class="text-right">
        <button class="text-blue-600 px-2 py-1.5 mr-2" @click="closeModal">
          Close
        </button>
        <button
          class="
            border
            rounded
            px-2
            py-1.5
            bg-blue-600
            text-white
            disabled:bg-gray-200
            disabled:text-gray-400
            disabled:cursor-not-allowed
          "
          @click="confirmFunc"
          v-if="confirmFunc"
          :disabled="isDisabled"
        >
          <slot name="okButton"></slot>
        </button>
      </div>
      {{ closeFunc === undefined }}
      <br />
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
      if (props.closeFunc) props.closeFunc(false);
    }

    return {
      closeModal,
    };
  },
};
</script>
