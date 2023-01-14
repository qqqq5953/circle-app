<template>
  <ul>
    <li
      class="flex items-center gap-x-1.5 py-2 text-xs border-b text-slate-800"
      v-for="item in list"
      :key="item.id"
    >
      <div class="w-1/5">{{ item.date }}</div>
      <div class="w-[15%] text-right">{{ item.price }}</div>
      <div class="w-[15%] text-right">{{ item.shares }}</div>
      <div class="grow text-right">
        <slot name="diff-percent" :price="item.price"></slot>
      </div>
      <div class="grow text-right">
        <slot name="diff-value" :price="item.price"></slot>
      </div>
      <div class="grow text-right hidden sm:block">
        <slot name="totlal-value"></slot>
      </div>
    </li>
  </ul>
</template>

<script>
export default {
  props: {
    list: {
      type: Array,
    },
  },
};
</script>