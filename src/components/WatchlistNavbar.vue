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
        @click="showCurrentTab(tab)"
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
import { useWatchlistStore } from "@/stores/watchlistStore.js";
import { storeToRefs } from "pinia";

export default {
  components: {
    TabSkeleton,
    ErrorDisplay: defineAsyncComponent(() =>
      import("@/components/ErrorDisplay.vue")
    ),
  },
  props: {
    isWatchlistLoading: {
      type: Boolean,
    },
  },
  setup() {
    const $store = useWatchlistStore();

    const inputTab = ref(null);
    const errorMessage = ref([]);
    const { currentTab, tabs } = storeToRefs($store);

    const clearInput = () => (inputTab.value = null);

    const showCurrentTab = (tab) => {
      console.log("showCurrentTab in navbar");
      $store.showCurrentTab(tab);
    };

    const setTabs = (tab) => {
      $store.setTabs(tab);
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

      watch(data, (newTab) => {
        console.log("createTab", newTab);

        setTabs(newTab.result);
        showCurrentTab(newTab.result);
        clearInput();
      });
    };

    const fetchAndSetTabs = () => {
      console.log("getTabs");
      const { data, error, loading } = useAxios(`/api/getTabs`, "get");
      watch(data, (newData) => {
        setTabs(newData.result);
      });
    };

    fetchAndSetTabs();

    watch(inputTab, () => {
      if (errorMessage.value.length) errorMessage.value.pop();
    });

    return {
      createTab,
      showCurrentTab,
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