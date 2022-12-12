<template>
  <BaseModal>
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
        <button class="text-blue-600 px-2 py-1.5 mr-2" @click="closeFunc">
          Close
        </button>
        <button
          class="border rounded px-2 py-1.5 bg-blue-600 text-white"
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
  },
  emits: ["closeModal"],
  // setup() {
  //   const refName = ref("inputRef");

  //   return { refName };
  // },
};
</script>
