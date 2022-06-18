<template>
  <nav
    class="
      md:left-0
      md:block
      md:fixed
      md:top-0
      md:bottom-0
      md:overflow-y-auto
      md:flex-row
      md:flex-nowrap
      md:overflow-hidden
      shadow-xl
      bg-green-100
      flex flex-wrap
      items-center
      justify-between
      relative
      md:w-56
      z-10
      py-4
      px-6
    "
  >
    <div
      class="
        md:flex-col md:items-stretch md:min-h-full md:flex-nowrap
        px-0
        flex flex-wrap
        items-center
        justify-between
        w-full
        mx-auto
        bg-blue-200
      "
    >
      <!-- Toggler -->
      <button
        class="
          cursor-pointer
          text-black
          opacity-50
          md:hidden
          px-3
          py-1
          text-xl
          leading-none
          bg-transparent
          rounded
          border border-solid border-transparent
        "
        type="button"
        v-on:click="toggleCollapseShow('bg-white m-2 py-3 px-6')"
      >
        <i class="fas fa-bars"></i>
      </button>
      <!-- Brand -->
      <a
        class="
          md:block
          text-left
          md:pb-2
          text-blueGray-600
          mr-0
          inline-block
          whitespace-nowrap
          text-sm
          uppercase
          font-bold
          p-4
          px-0
        "
        href="javascript:void(0)"
      >
        Circle
      </a>
      <!-- User -->
      <ul class="md:hidden items-center flex flex-wrap list-none">
        <li class="inline-block relative">
          notification-dropdown-component
          <!-- <notification-dropdown-component></notification-dropdown-component> -->
        </li>
        <li class="inline-block relative">
          user-dropdown-component
          <!-- <user-dropdown-component></user-dropdown-component> -->
        </li>
      </ul>
      <!-- Collapse:yellow -->
      <div
        class="
          md:flex
          md:flex-col
          md:items-stretch
          md:opacity-100
          md:relative
          md:mt-4
          md:shadow-none
          shadow
          absolute
          top-0
          left-0
          right-0
          z-40
          overflow-y-auto overflow-x-hidden
          h-auto
          items-center
          flex-1
          rounded
          bg-yellow-100
        "
        v-bind:class="collapseShow"
      >
        <!-- Collapse header -->
        <div
          class="
            md:min-w-full md:hidden
            block
            pb-4
            mb-4
            border-b border-solid border-blueGray-200
          "
        >
          <div class="flex flex-wrap">
            <div class="w-6/12">
              <a
                class="
                  md:block
                  text-left
                  md:pb-2
                  text-blueGray-600
                  mr-0
                  inline-block
                  whitespace-nowrap
                  text-sm
                  uppercase
                  font-bold
                  p-4
                  px-0
                "
                href="javascript:void(0)"
              >
                Circle
              </a>
            </div>
            <div class="w-6/12 flex justify-end">
              <button
                type="button"
                class="
                  cursor-pointer
                  text-black
                  opacity-50
                  md:hidden
                  px-3
                  py-1
                  text-xl
                  leading-none
                  bg-transparent
                  rounded
                  border border-solid border-transparent
                "
                @click="toggleCollapseShow('hidden')"
              >
                <i class="fas fa-times"></i>
              </button>
            </div>
          </div>
        </div>
        <!-- Form -->
        <form class="mt-6 mb-4 md:hidden">
          <div class="mb-3 pt-0">
            <input
              type="text"
              placeholder="Search"
              class="
                px-3
                py-2
                h-12
                border border-solid border-pink-500
                placeholder-blueGray-300
                text-blueGray-600
                bg-white
                rounded
                text-base
                leading-snug
                shadow-none
                outline-none
                focus:outline-none
                w-full
                font-normal
              "
            />
          </div>
        </form>
        <!-- Navigation -->
        <ul
          class="
            md:flex-col md:min-w-full
            flex flex-col
            list-none
            outline-black
          "
        >
          <li class="items-center">
            <router-link
              :to="{ name: 'Portfolio' }"
              @click="toggleCollapseShow('hidden')"
              class="hover:text-pink-600 text-xs uppercase py-3 font-bold block"
              href="#/dashboard"
              ><i class="fas fa-tv opacity-75 mr-2 text-sm"></i>
              Portfolio</router-link
            >
          </li>
          <li class="items-center">
            <router-link
              :to="{ name: 'Holdings' }"
              @click="toggleCollapseShow('hidden')"
              class="
                text-blueGray-700
                hover:text-pink-600
                text-xs
                uppercase
                py-3
                font-bold
                block
              "
              href="#/dashboard"
              ><i class="fas fa-tv opacity-75 mr-2 text-sm"></i>
              Holdings</router-link
            >
          </li>
          <li class="items-center">
            <router-link
              :to="{ name: 'History' }"
              @click="toggleCollapseShow('hidden')"
              class="
                text-blueGray-700
                hover:text-blueGray-500
                text-xs
                uppercase
                py-3
                font-bold
                block
              "
              href="#/landing"
              ><i class="fas fa-newspaper text-blueGray-400 mr-2 text-sm"></i>
              History</router-link
            >
          </li>
          <li class="items-center">
            <router-link
              :to="{ name: 'Watchlist' }"
              @click="toggleCollapseShow('hidden')"
              class="
                text-blueGray-700
                hover:text-blueGray-500
                text-xs
                uppercase
                py-3
                font-bold
                block
              "
              href="#/login"
              ><i class="fas fa-fingerprint text-blueGray-400 mr-2 text-sm"></i>
              Watchlist</router-link
            >
          </li>
        </ul>
        <!-- Divider -->
        <hr class="my-4 md:min-w-full" />
      </div>
    </div>
  </nav>
</template>

<script>
// import NotificationDropdownComponent from './NotificationDropdown.vue';
// import UserDropdownComponent from './UserDropdown.vue';
export default {
  data() {
    return {
      collapseShow: "hidden",
    };
  },
  methods: {
    toggleCollapseShow(classes) {
      this.collapseShow = classes;
    },
  },
  // components: {
  //   NotificationDropdownComponent,
  //   UserDropdownComponent
  // }
};
</script>
