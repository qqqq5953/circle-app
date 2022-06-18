<template>
  <!-- absolute top-0 left-0 z-10 -->
  <nav
    class="w-full bg-transparent md:flex-row md:flex-nowrap md:justify-start flex items-center p-4 bg-pink-300"
  >
    <div
      class="w-full mx-auto items-center flex justify-between md:flex-nowrap flex-wrap md:px-10 px-4 outline-black bg-purple-200"
    >
      <!-- Brand -->
      <a
        class="text-white text-sm uppercase hidden lg:inline-block font-semibold"
        href="https://www.creative-tim.com/learning-lab/tailwind-starter-kit#/dashboard"
        >分頁名稱</a
      >
      <!-- Form -->
      <form class="md:flex hidden lg:ml-auto mr-3">
        <div class="relative w-full">
          <span
            class="z-10 h-full leading-snug font-normal text-center text-blueGray-300 absolute bg-transparent rounded text-base px-3 py-3"
            ><i class="fas fa-search"></i
          ></span>
          <input
            type="text"
            placeholder="Search here..."
            class="border-0 pr-3 pl-10 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow outline-none focus:outline-none focus:ring w-full"
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
        user-dropdown-component
        <!-- <user-dropdown-component></user-dropdown-component> -->
      </ul>
    </div>
  </nav>
</template>

<script>
// import UserDropdownComponent from './UserDropdown.vue';
// export default {
//   components: {
//     UserDropdownComponent
//   }
// };
//
</script>
