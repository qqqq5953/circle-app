<template>
  <div class="flex flex-col">
    <NavbarDashboard></NavbarDashboard>
    <router-view
      class="flex flex-col justify-center grow space-y-10 pt-24 pb-10 px-6 md:px-16 md:pt-28 mx-auto w-full max-w-[1200px] container"
    ></router-view>
    <Footer class="mt-10"></Footer>
  </div>
</template>
<script>
import NavbarDashboard from "@/components/Global/NavbarDashboard.vue";
export default {
  components: {
    NavbarDashboard,
  },
};
</script>
