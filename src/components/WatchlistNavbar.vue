<template>
  <div
    class="flex gap-10 pb-3 py-5 text-sm overflow-x-auto lg:overflow-x-visible"
  >
    <TabSkeleton
      :tabs="tabs"
      :currentTab="currentTab"
      v-if="isWatchlistLoading"
    />

    <nav class="flex gap-2.5 lg:overflow-x-auto lg:max-w-[70%]" v-else>
      <button
        class="border rounded p-2 w-24 relative shrink-0"
        :class="{
          'after:absolute after:inset-x-0 after:bottom-0 after:h-1 after:bg-blue-500':
            currentTab === tab,
        }"
        v-for="tab in tabs"
        :key="tab"
        @click="
          showCurrentTab(tab);
          emitCurrentTab(tab);
        "
      >
        {{ tab }}
      </button>
    </nav>

    <section
      class="flex justify-between gap-2 ml-auto min-w-[50%] lg:min-w-[30%]"
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
      <button class="border rounded px-3" @click="createTab()">add</button>
    </section>
  </div>
</template>

<script>
import { ref, watch, defineAsyncComponent } from "vue";
import useAxios from "@/composables/useAxios.js";
import TabSkeleton from "@/components/skeleton/TabSkeleton.vue";

export default {
  components: {
    TabSkeleton,
    ErrorDisplay: defineAsyncComponent(() =>
      import("@/components/ErrorDisplay.vue")
    ),
  },
  props: {
    defaultTab: {
      type: String,
    },
    isWatchlistLoading: {
      type: Boolean,
    },
  },
  setup(props, { emit }) {
    const tabs = ref([]);
    const currentTab = ref(null);
    const inputTab = ref(null);
    const errorMessage = ref([]);

    const clearInput = () => (inputTab.value = null);
    const showCurrentTab = (tab) => (currentTab.value = tab);
    const emitCurrentTab = (tab) => emit("emitCurrentTab", tab);

    const createTab = () => {
      const isTabsExist = tabs.value.includes(inputTab.value);

      if (isTabsExist) {
        errorMessage.value.push("tab already exists");
        return;
      }

      const { data, error, loading } = useAxios(`/api/createTab`, "post", {
        inputTab: inputTab.value,
      });

      watch(data, (newTab) => {
        console.log("createTab", newTab);

        tabs.value.push(newTab.result);
        showCurrentTab(newTab).result;
        emitCurrentTab(newTab.result);
        clearInput();
      });
    };

    const getTabs = () => {
      const { data, error, loading } = useAxios(`/api/getTabs`, "get");
      watch(data, (newData) => {
        console.log("getTabs", newData);
        tabs.value.length = 0;
        tabs.value.push(...newData.result);
      });
    };

    getTabs();
    showCurrentTab(props.defaultTab);

    watch(
      () => props.defaultTab,
      (newTab) => {
        console.log("newTab", newTab);
        getTabs();
        showCurrentTab(newTab);
      }
    );

    watch(inputTab, () => {
      if (errorMessage.value.length) errorMessage.value.pop();
    });

    return {
      createTab,
      showCurrentTab,
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