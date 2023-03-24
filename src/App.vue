<template>
  <router-view class="h-screen" />
  <Snackbar :barMessage="message" />
</template>

<script>
import Snackbar from "@/components/Snackbar.vue";
import { ref, provide } from "vue-demi";
export default {
  components: { Snackbar },
  setup() {
    const message = ref({});

    function setSnackbarMessage(msg) {
      const { success, content, errorMessage, result, routeName } = msg;
      message.value = {
        status: success,
        title: content,
        errorMessage,
        result,
        routeName,
        id: Date.now() + Math.random(),
      };
    }

    provide("setSnackbarMessage", setSnackbarMessage);

    return { message };
  },
};
</script>

<style>
* {
  -webkit-tap-highlight-color: transparent;
}
</style>