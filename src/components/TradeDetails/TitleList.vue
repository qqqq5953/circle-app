<template>
  <ul>
    <li
      class="
        flex
        items-end
        gap-x-1.5
        py-2
        text-xs
        border-b
        font-semibold
        text-slate-500
      "
    >
      <div v-for="title in titles" :key="title.name" :class="title.style">
        {{ title.name }}
      </div>
    </li>
  </ul>
</template>

<script>
export default {
  props: {
    titles: {
      type: Array,
    },
  },
};
</script>