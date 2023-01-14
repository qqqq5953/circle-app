<template>
  <div class="flex flex-col gap-4 py-2 px-4">
    <h1 class="text-center text-lg font-medium pb-2">
      {{ tradeResult.content }}
    </h1>
    <ul>
      <li
        class="
          flex
          items-center
          justify-between
          py-2
          text-xs
          border-b
          text-slate-800
        "
        v-for="(value, key) in tradeResult.result"
        :key="value"
      >
        <span>{{ key }}: </span>
        <span class="font-semibold">{{ value }}</span>
      </li>
    </ul>
    <div class="text-center">
      <router-link
        class="inline-block p-2 rounded bg-blue-600"
        :to="{ name: 'Holdings1' }"
        >View current holdings</router-link
      >
    </div>
  </div>
</template>

<script>
export default {
  props: {
    tradeResult: {
      type: Object,
    },
  },
  setup(props) {
    console.log("tradeResult", props.tradeResult);
  },
};
</script>