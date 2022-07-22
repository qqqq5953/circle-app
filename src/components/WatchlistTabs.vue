<template>
  <div class="flex gap-10 pb-3 py-5 text-sm overflow-x-scroll">
    <nav class="flex gap-2.5">
      <button
        class="border rounded p-2 w-24 relative"
        :class="{
          'after:absolute after:inset-x-0 after:bottom-0 after:h-1 after:bg-blue-500':
            currentTab === tab,
        }"
        v-for="tab in tabs"
        :key="tab"
        @click="
          handleClickTab(tab);
          emitCurrentTab(tab);
        "
      >
        {{ tab }}
      </button>
    </nav>

    <section
      class="
        flex
        justify-between
        gap-2
        ml-auto
        min-w-[50%]
        md:min-w-[30%]
        lg:min-w-0
        sm:w-1/3
      "
    >
      <div class="relative grow">
        <div class="absolute -top-5 text-red-500">
          <ErrorDisplay :errors="errorMessage" v-if="errorMessage.length" />
        </div>
        <input
          type="text"
          class="absolute inset-0 border rounded focus:outline-none px-4 py-2"
          placeholder="add a tab"
          v-model="inputTab"
        />
      </div>
      <button class="border rounded px-3" @click="createTab">add</button>
    </section>
  </div>
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
    const inputTab = ref(null);
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