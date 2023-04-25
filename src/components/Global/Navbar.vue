<template>
  <nav
    class="fixed top-0 z-10 w-full shadow-lg px-6 py-4 md:px-10"
    :class="isMenuShow ? 'bg-slate-50' : 'bg-slate-50/70 backdrop-blur-sm'"
  >
    <div class="flex items-center justify-between max-w-[1200px] mx-auto">
      <div
        class="inline-block uppercase font-semibold text-2xl text-indigo-700"
      >
        <router-link :to="{ name: 'Home' }">Circle</router-link>
      </div>

      <div class="hidden md:flex md:items-center md:gap-x-6">
        <ul class="hidden md:flex font-light">
          <li v-for="item in menu" :key="item.name">
            <router-link
              class="block px-4 group"
              :to="{ name: item.routeName }"
              v-if="item.routeName"
            >
              <span class="relative group-hover:text-indigo-500">
                {{ item.name }}
                <span
                  class="absolute top-full left-1/2 -translate-x-1/2 bg-indigo-500 hidden md:inline transition-all duration-300 mt-1 h-1 w-0 md:group-hover:w-full"
                ></span>
              </span>
            </router-link>
            <button
              class="block px-4 group"
              v-else-if="item.event"
              @click="item.event()"
            >
              <span class="relative group-hover:text-indigo-500">
                {{ item.name }}
                <span
                  class="absolute top-full left-1/2 -translate-x-1/2 bg-indigo-500 hidden md:inline transition-all duration-300 mt-1 h-1 w-0 md:group-hover:w-full"
                ></span>
              </span>
            </button>
          </li>
        </ul>
        <button
          class="inline-block rounded px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white"
          @click="handleGetStarted"
          v-if="!hasLogin"
        >
          Get started
        </button>

        <!-- dashboard -->
        <div class="relative" v-else>
          <button
            class="rounded px-3 py-1.5 hover:bg-slate-100 focus:bg-slate-100 group"
          >
            <span
              class="text-slate-800 hover:text-indigo-700 group-focus:text-indigo-700 font-medium"
              >Dashboard</span
            >
            <ul
              class="absolute inset-x-0 z-30 top-full mt-1 shadow rounded bg-white font-light transition-opacity duration-300 ease-in-out p-0 opacity-0 invisible h-0 group-focus-within:py-2 group-focus-within:opacity-100 group-focus-within:visible group-focus-within:h-auto"
            >
              <li
                class="flex gap-3 items-center px-3 py-1 cursor-pointer text-sm hover:text-indigo-700 hover:bg-slate-100"
                v-for="list in dashboard"
                :key="list.name"
              >
                <router-link :to="{ name: list.routeName }">{{
                  list.name
                }}</router-link>
              </li>
            </ul>
          </button>
        </div>
      </div>

      <!-- menu -->
      <div
        class="flex items-center gap-x-6 md:hidden"
        @click="isMenuShow = !isMenuShow"
      >
        <button
          class="inline-block rounded px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white"
          @click="handleGetStarted"
          v-if="!hasLogin"
        >
          Get started
        </button>

        <!-- dashboard -->
        <div class="relative" v-else>
          <button
            class="rounded px-3 py-1.5 hover:bg-slate-100 focus:bg-slate-100 group"
          >
            <span
              class="text-slate-800 hover:text-indigo-700 group-focus:text-indigo-700 font-medium"
              >Dashboard</span
            >
            <ul
              class="absolute inset-x-0 z-30 top-full mt-1 shadow rounded bg-white font-light transition-opacity duration-300 ease-in-out p-0 opacity-0 invisible h-0 group-focus-within:py-2 group-focus-within:opacity-100 group-focus-within:visible group-focus-within:h-auto"
            >
              <li
                class="flex gap-3 items-center px-3 py-1 cursor-pointer text-sm hover:text-indigo-700 hover:bg-slate-100"
                v-for="list in dashboard"
                :key="list.name"
              >
                <router-link :to="{ name: list.routeName }">{{
                  list.name
                }}</router-link>
              </li>
            </ul>
          </button>
        </div>

        <button ref="menuBtn" class="flex flex-col space-y-1 text-indigo-700">
          <span
            class="w-6 h-[3px] rounded bg-indigo-700 transition duration-500 ease-in-out"
            :class="{
              'rotate-45 translate-y-[7px]': isMenuShow,
            }"
          ></span>
          <span
            class="w-6 h-[3px] rounded bg-indigo-700 transition duration-500 ease-in-out"
            :class="{ 'opacity-0 ': isMenuShow }"
          ></span>
          <span
            class="w-6 h-[3px] rounded bg-indigo-700 transition duration-500 ease-in-out"
            :class="{
              '-rotate-45 -translate-y-[7px]': isMenuShow,
            }"
          ></span>
        </button>

        <ul
          ref="menuList"
          class="absolute z-50 mt-px top-full right-0 bg-slate-50 shadow-lg text-black text-xs py-1 w-full divide-y transition-all duration-300 ease-in-out"
          :class="{
            '-translate-y-5 opacity-0 invisible pointer-events-none':
              !isMenuShow,
          }"
        >
          <li class="text-center" v-for="item in menu" :key="item.name">
            <router-link
              class="block px-4 py-3"
              :to="{ name: item.routeName }"
              v-if="item.routeName"
            >
              {{ item.name }}
            </router-link>
            <button
              class="block px-4 py-3 w-full"
              v-else-if="item.event"
              @click="item.event()"
            >
              {{ item.name }}
            </button>
          </li>
        </ul>
      </div>
    </div>
  </nav>
</template>

<script>
import { computed, onMounted, ref } from "vue";
import Login from "@/components/Login.vue";
import http from "@/api";
import { useClickPrevention } from "@/composables/useClickPrevention.js";

export default {
  components: { Login },
  props: {
    hasLogin: Boolean,
  },
  emits: ["toggleModal", "toggleSignUp", "checkLogin", "setSnackbarMessage"],
  setup(props, { emit }) {
    const menu = computed(() => {
      return [
        {
          name: "About",
          routeName: "About",
        },
        {
          name: "Solution",
          routeName: "Solution",
        },
        {
          name:
            props.hasLogin === null
              ? ""
              : props.hasLogin === true
              ? "Log out"
              : "Log in",
          routeName: "",
          event: toggleLogInAndOut,
        },
      ];
    });
    const dashboard = ref([
      {
        name: "Overview",
        routeName: "Overview",
      },
      {
        name: "Holdings",
        routeName: "Holdings1",
      },
      {
        name: "History",
        routeName: "History",
      },
      {
        name: "Watchlist",
        routeName: "Watchlist",
      },
    ]);
    const { isClickDisabled, preventMultipleClicks } = useClickPrevention(3000);

    onMounted(() => clickOutsideToggle());

    function toggleLogInAndOut() {
      if (props.hasLogin) {
        logOut();
      } else {
        logIn();
      }
    }

    function logIn() {
      emit("toggleModal", { open: true });
      emit("toggleSignUp", true);
    }

    function logOut() {
      if (isClickDisabled.value) return;
      preventMultipleClicks();

      http
        .post("/api/logOut")
        .then((res) => {
          emit("checkLogin", res.data.result.hasLogin);
          emit("setSnackbarMessage", {
            success: res.data.success,
            content: res.data.content,
            result: null,
          });
        })
        .catch((error) => {
          emit("setSnackbarMessage", {
            success: false,
            content: error.message,
            result: null,
          });
        });
    }

    // menu
    const isMenuShow = ref(false);
    const menuBtn = ref(false);
    const menuList = ref(false);
    function clickOutsideToggle() {
      document.addEventListener("click", (e) => {
        if (
          !menuBtn.value?.contains(e.target) &&
          !menuList.value?.contains(e.target)
        ) {
          isMenuShow.value = false;
        }
      });
    }

    function handleGetStarted() {
      emit("toggleModal", { open: true });
      emit("toggleSignUp", false);
    }

    return {
      menu,
      menuBtn,
      menuList,
      isMenuShow,
      dashboard,
      clickOutsideToggle,
      handleGetStarted,
    };
  },
};
</script>
