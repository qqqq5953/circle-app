<template>
  <div class="flex flex-col">
    <Login
      :isModalOpen="isModalOpen"
      :toggleModal="toggleModal"
      :alreadySignUp="alreadySignUp"
      @toggleModal="toggleModal"
      @toggleSignUp="toggleSignUp"
      @checkLogin="checkLogin"
      @setSnackbarMessage="setSnackbarMessage"
    />
    <Navbar
      :hasLogin="hasLogin"
      @toggleModal="toggleModal"
      @toggleSignUp="toggleSignUp"
      @checkLogin="checkLogin"
      @setSnackbarMessage="setSnackbarMessage"
    ></Navbar>
    <router-view
      class="flex flex-col justify-center grow space-y-10 pt-24 pb-10 px-6 md:px-16 md:pt-28 mx-auto w-full max-w-[1200px] container"
      :hasLogin="hasLogin"
      @toggleModal="toggleModal"
      @toggleSignUp="toggleSignUp"
    ></router-view>
    <Footer class="mt-10"></Footer>
  </div>
</template>

<script>
import { ref, defineAsyncComponent, inject } from "vue";
import http from "@/api";
import Navbar from "@/components/Global/Navbar.vue";

export default {
  components: {
    Navbar,
    Login: defineAsyncComponent(() => import("@/components/Login.vue")),
  },
  setup() {
    const setSnackbarMessage = inject("setSnackbarMessage");

    // modal
    const isModalOpen = ref(false);
    function toggleModal(params) {
      isModalOpen.value = params.open;
    }

    const alreadySignUp = ref(true);
    function toggleSignUp(val) {
      alreadySignUp.value = val;
    }

    function checkAuth() {
      http
        .post("/api/checkAuth")
        .then((res) => {
          console.log("checkAuth", res.data);
          checkLogin(res.data.result.hasLogin);
        })
        .catch((error) => {
          console.log("checkAuth error", error);
        });
    }
    checkAuth();

    const hasLogin = ref(null);
    function checkLogin(val) {
      console.log("checkLogin", val);
      hasLogin.value = val;
    }

    return {
      isModalOpen,
      alreadySignUp,
      toggleModal,
      toggleSignUp,
      checkLogin,
      hasLogin,
      setSnackbarMessage,
    };
  },
};
</script>
