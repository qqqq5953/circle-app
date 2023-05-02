<template>
  <div>
    <input
      type="text"
      class="border rounded p-2 w-full focus:outline-indigo-300/60"
      :value="listName"
      @input="$emit('update:listName', $event.target.value)"
      :ref="refName"
    />
  </div>
</template>

<script>
export default {
  props: {
    refName: {
      type: String,
    },
    listName: {
      type: String,
    },
  },
  emits: ["update:listName"],
  setup() {},
};
</script>