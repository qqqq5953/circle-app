<template>
  <ul>
    <li
      class="flex items-center gap-x-1.5 py-2 text-xs border-b"
      :class="fontWeight"
      v-for="item in list"
      :key="item.id"
    >
      <div class="w-1/5">{{ item.date }}</div>
      <div class="w-[12%] text-right">{{ item.price }}</div>
      <div class="w-[22%] flex items-center justify-end sm:gap-x-1">
        <span
          class="rounded-full w-5 h-5 text-center pt-0.5 mx-auto sm:mx-0"
          :class="{ 'bg-indigo-100': item.status }"
          >{{
            item.status === "buy" ? "B" : item.status === "sell" ? "S" : null
          }}</span
        >
        <span class="break-words w-1/2 md:w-[40%] xl:w-1/4 text-right">{{
          item.shares
        }}</span>
      </div>
      <div class="w-1/5 grow text-right">
        <slot name="diff-percent" :price="item.price"></slot>
      </div>
      <div class="w-[15%] grow text-right">
        <slot name="diff-value" :price="item.price"></slot>
      </div>
      <div class="w-[15%] grow text-right hidden sm:block">
        <slot name="totlal-value" :value="item.value"></slot>
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
    fontWeight: {
      type: String,
      default: "font-normal",
    },
  },
};
</script>