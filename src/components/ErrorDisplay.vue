<template>
  <small v-for="(error, index) in errors" :key="index">{{ error }}</small>
</template>

<script>
export default {
  props: ["errors"],
  setup(props) {},
};
</script>

<style>
</style>