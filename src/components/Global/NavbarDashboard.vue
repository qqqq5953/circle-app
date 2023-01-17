<template>
  <!-- absolute top-0 left-0 z-10 -->
  <nav
    class="
      w-full
      bg-transparent
      md:flex-row md:flex-nowrap md:justify-start
      flex
      items-center
      p-4
      shadow
      bg-slate-500
    "
  >
    <div
      class="
        w-full
        mx-auto
        items-center
        flex
        justify-between
        md:flex-nowrap
        flex-wrap
        md:px-10
        px-4
      "
    >
      <!-- Brand -->
      <!-- <a
        class="
          text-white text-sm
          uppercase
          hidden
          lg:inline-block
          font-semibold
        "
        href="#"
        >CIRCLE</a
      > -->
      <!-- Form -->
      <form class="md:flex hidden lg:ml-auto mr-3">
        <div class="relative w-full">
          <span
            class="
              z-10
              h-full
              leading-snug
              font-normal
              text-center text-blueGray-300
              absolute
              bg-transparent
              rounded
              text-base
              px-3
              py-3
            "
            ><i class="fas fa-search"></i
          ></span>
          <input
            type="text"
            placeholder="In process..."
            class="
              border-0
              pr-3
              pl-10
              py-3
              placeholder-blueGray-300
              text-blueGray-600
              bg-white
              rounded
              text-sm
              shadow
              outline-none
              focus:outline-none focus:ring
              w-full
            "
          />
        </div>
      </form>
      <!-- <form class="flex justify-center">
        <div class="relative w-full">
          <span
            class="leading-snug font-normal text-blueGray-300 absolute bg-transparent rounded px-3 py-3"
            ><i class="fas fa-search"></i
          ></span>
          <input
            type="text"
            placeholder="Search here..."
            class="border-0 pr-3 pl-10 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow outline-none focus:outline-none focus:ring w-full"
          />
        </div>
      </form> -->
      <!-- User -->
      <ul class="flex-col md:flex-row list-none items-center hidden md:flex">
        <i class="fa-solid fa-bars fa-2x text-white"></i>
        <!-- <user-dropdown-component></user-dropdown-component> -->
      </ul>
    </div>
  </nav>
</template>

<script>
// import UserDropdownComponent from './UserDropdown.vue';
import { useRoute } from "vue-router";
export default {
  // components: {
  //   UserDropdownComponent
  // }
  setup() {
    const route = useRoute();

    return {
      route,
    };
  },
};
</script>
