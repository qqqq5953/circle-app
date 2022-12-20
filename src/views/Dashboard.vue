<template>
  <div>
    <Sidebar></Sidebar>
    <div class="lg:ml-56 flex flex-col">
      <NavbarDashboard></NavbarDashboard>
      <router-view class="flex-grow"></router-view>
      <Footer class="mt-48"></Footer>
    </div>
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
