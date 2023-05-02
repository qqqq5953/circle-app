<template>
  <nav
    class="fixed top-0 z-10 w-full shadow-lg px-6 py-4 md:px-10"
    :class="isShow ? 'bg-slate-50' : 'bg-slate-50/70 backdrop-blur-sm'"
  >
    <div class="flex items-center justify-between max-w-[1200px] mx-auto">
      <div
        class="inline-block uppercase font-semibold text-2xl text-indigo-700"
      >
        <router-link :to="{ name: 'Home' }">Circle</router-link>
      </div>

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

      <!-- menu -->
      <div class="md:hidden" @click="isShow = !isShow">
        <button ref="menuBtn" class="flex flex-col space-y-1 text-indigo-700">
          <span
            class="w-6 h-[3px] rounded bg-indigo-700 transition duration-500 ease-in-out"
            :class="{
              'rotate-45 translate-y-[7px]': isShow,
            }"
          ></span>
          <span
            class="w-6 h-[3px] rounded bg-indigo-700 transition duration-500 ease-in-out"
            :class="{ 'opacity-0 ': isShow }"
          ></span>
          <span
            class="w-6 h-[3px] rounded bg-indigo-700 transition duration-500 ease-in-out"
            :class="{
              '-rotate-45 -translate-y-[7px]': isShow,
            }"
          ></span>
        </button>
        <ul
          ref="menuList"
          class="absolute z-50 mt-px top-full right-0 bg-slate-50 shadow-lg text-black text-xs py-1 w-full divide-y transition-all duration-300 ease-in-out"
          :class="{
            '-translate-y-5 opacity-0 invisible pointer-events-none': !isShow,
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
import { onMounted, ref } from "vue";
import http from "@/api";
import { useClickPrevention } from "@/composables/useClickPrevention.js";
import { useRouter } from "vue-router";

export default {
  setup(_, { emit }) {
    const isShow = ref(false);
    const menuBtn = ref(false);
    const menuList = ref(false);
    const menu = ref([
      {
        name: "Overview",
        routeName: "Overview",
      },
      {
        name: "Holdings",
        routeName: "Holdings",
      },
      {
        name: "History",
        routeName: "History",
      },
      {
        name: "Watchlist",
        routeName: "Watchlist",
      },
      {
        name: "Log out",
        routeName: "",
        event: logOut,
      },
    ]);

    onMounted(() => clickOutsideToggle());

    function clickOutsideToggle() {
      document.addEventListener("click", (e) => {
        if (
          !menuBtn.value?.contains(e.target) &&
          !menuList.value?.contains(e.target)
        ) {
          isShow.value = false;
        }
      });
    }

    const { isClickDisabled, preventMultipleClicks } = useClickPrevention(3000);
    const router = useRouter();

    function logOut() {
      if (isClickDisabled.value) return;
      preventMultipleClicks();

      http
        .post("/api/logOut")
        .then((res) => {
          emit("setSnackbarMessage", {
            success: res.data.success,
            content: res.data.content,
            result: null,
          });
          if (res.data.success) router.replace({ name: "Intro" });
        })
        .catch((error) => {
          emit("setSnackbarMessage", {
            success: false,
            content: error.message,
            result: null,
          });
        });
    }

    return {
      menuBtn,
      menuList,
      isShow,
      menu,
      clickOutsideToggle,
    };
  },
};
</script>
