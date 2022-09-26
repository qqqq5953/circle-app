<template>
  <BaseModal>
    <template #header>
      <h2 class="text-xl lg:text-2xl">
        <slot name="title"></slot>
      </h2>
    </template>
    <template #body>
      <div>
        <input
          type="text"
          class="border rounded p-2 w-full focus:outline-blue-600"
          :value="listName"
          @input="$emit('update:listName', $event.target.value)"
          ref="inputRef"
        />
        <ErrorDisplay :errors="errorMessage" v-if="errorMessage.length" />
      </div>
    </template>
    <template #footer>
      <div class="text-right">
        <button class="text-blue-600 p-2 mr-2" @click="closeFunc">Close</button>
        <button
          class="border rounded p-2 bg-blue-600 text-white"
          @click="confirmFunc"
        >
          <slot name="okButton"></slot>
        </button>
      </div>
    </template>
  </BaseModal>
</template>

<script>
import BaseModal from "@/components/BaseModal.vue";

import { ref, defineAsyncComponent } from "vue";

export default {
  components: {
    BaseModal,
    ErrorDisplay: defineAsyncComponent(() =>
      import("@/components/ErrorDisplay.vue")
    ),
  },
  props: {
    listName: {
      type: String,
    },
    errorMessage: {
      type: Array,
      default: [],
    },
    closeFunc: {
      type: Function,
    },
    confirmFunc: {
      type: Function,
    },
  },
  emits: ["update:listName", "closeModal"],
  setup() {
    const isModalOpen = ref(false);
    const inputRef = ref(false);

    return { isModalOpen, inputRef };
  },
};
</script>
