<template>
  <router-view class="h-screen" />
  <Snackbar :barMessage="messages" />
</template>

<script>
import Snackbar from "@/components/Snackbar.vue";
import { ref, provide } from "vue-demi";
export default {
  components: { Snackbar },
  setup() {
    const messages = ref([]);

    function setSnackbarMessage(msg) {
      const { success, content, errorMessage, result, routeName } = msg;
      messages.value.unshift({
        status: success,
        title: content,
        errorMessage,
        result,
        routeName,
      });
    }

    provide("setSnackbarMessage", setSnackbarMessage);

    return { messages };
  },
};
</script>

<style>
* {
  -webkit-tap-highlight-color: transparent;
}
</style>