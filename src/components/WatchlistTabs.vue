<template>
  <nav class="flex border-b gap-0.5">
    <button
      class="border rounded-t p-3"
      :class="{ 'bg-blue-100': currentTab === tab }"
      v-for="tab in tabs"
      :key="tab"
      @click="
        handleClickTab(tab);
        emitCurrentTab(tab);
      "
    >
      {{ tab }}
    </button>

    <div class="flex ml-auto py-1">
      <div class="relative">
        <div class="absolute -top-6 pl-6 text-red-500">
          <ErrorDisplay :errors="errorMessage" v-if="errorMessage.length" />
        </div>
        <input
          type="text"
          class="block border rounded-full pl-6 py-2"
          placeholder="add a tab"
          v-model="inputTab"
        />
      </div>
      <button class="border rounded-full px-3" @click="createTab">add</button>
    </div>
  </nav>
</template>

<script>
import { ref, watch, defineAsyncComponent } from "vue";
import useAxios from "@/composables/useAxios.js";

export default {
  components: {
    ErrorDisplay: defineAsyncComponent(() =>
      import("@/components/ErrorDisplay.vue")
    ),
  },
  setup(props, { emit }) {
    const tabs = ref([]);
    const currentTab = ref("watchlist");
    const inputTab = ref("list");
    const errorMessage = ref([]);

    const handleClickTab = (tab) => {
      currentTab.value = tab;
    };

    const emitCurrentTab = (tab) => {
      emit("emitCurrentTab", tab);
    };

    const createTab = () => {
      const isTabsExist = tabs.value.includes(inputTab.value);

      if (isTabsExist) {
        errorMessage.value.push("tab already exists");
        return;
      }

      const { data, error, loading } = useAxios(`/api/createTab`, "post", {
        inputTab: inputTab.value,
      });

      watch(data, (newData) => tabs.value.push(inputTab.value));
    };

    const getTabs = () => {
      const { data, error, loading } = useAxios(`/api/getTabs`, "get");
      watch(data, (newData) => tabs.value.push(...newData.result));
    };

    getTabs();

    watch(inputTab, () => {
      if (errorMessage.value.length) errorMessage.value.pop();
    });

    return {
      createTab,
      handleClickTab,
      emitCurrentTab,
      tabs,
      currentTab,
      inputTab,
      errorMessage,
    };
  },
};
</script>

<style>
</style>