<template>
  <Sidebar></Sidebar>
  <div class="md:ml-56 h-screen flex flex-col">
    <NavbarDashboard></NavbarDashboard>
    <router-view class="flex-grow outline-black"></router-view>
    <Footer class="mt-48"></Footer>
  </div>
</template>
<script>
import Sidebar from "@/components/Global/Sidebar.vue";
import NavbarDashboard from "@/components/Global/NavbarDashboard.vue";
export default {
  components: {
    NavbarDashboard,
    Sidebar,
  },
};
</script>
