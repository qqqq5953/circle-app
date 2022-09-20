<template>
  <div class="overflow-y-hidden h-20">
    <div
      class="
        flex
        gap-10
        pt-6
        pb-4
        text-sm
        overflow-x-auto
        lg:overflow-x-visible
      "
      ref="navbarRef"
    >
      <TabSkeleton
        :tabs="tabs"
        :currentTab="currentTab"
        v-if="isWatchlistLoading"
      />
      <nav class="lg:overflow-y-hidden lg:h-20 lg:max-w-[75%]" v-else>
        <div class="flex gap-2.5 lg:overflow-x-auto py-2 lg:py-4" ref="navRef">
          <button
            class="border rounded p-2 w-24 relative shrink-0"
            :class="{
              'after:absolute after:inset-x-0 after:bottom-0 after:h-1 after:bg-blue-500 after:rounded-b-lg':
                currentTab === tab,
            }"
            v-for="tab in tabs"
            :key="tab"
            @click="showCurrentTab(tab)"
          >
            {{ tab }}
          </button>
        </div>
      </nav>

      <button
        class="ml-auto shrink-0 text-blue-600"
        @click="toggleModal(true)"
        v-if="!isWatchlistLoading"
      >
        + Add watchlist
      </button>

      <Teleport to="body">
        <div v-if="isModalOpen" class="fixed inset-0 z-20 bg-slate-700/60">
          <div
            class="
              absolute
              top-1/2
              left-1/2
              -translate-x-1/2 -translate-y-1/2
              bg-white
              rounded
              p-5
              flex flex-wrap flex-col
              gap-4
              w-2/3
              lg:w-1/3
            "
          >
            <h2 class="text-xl lg:text-2xl">Add watchlist</h2>
            <div>
              <input
                type="text"
                class="border rounded focus:outline-none px-4 py-4 w-full"
                placeholder="add a tab"
                v-model="inputListName"
              />
              <div class="text-red-500">
                <ErrorDisplay
                  :errors="errorMessage"
                  v-if="errorMessage.length"
                />
              </div>
            </div>
            <div class="text-right">
              <button
                class="text-blue-600 p-2 mr-2"
                @click="toggleModal(false)"
              >
                Close
              </button>
              <button
                class="border rounded p-2 bg-blue-600 text-white"
                @click="createTab()"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      </Teleport>
    </div>
  </div>
</template>

<script>
import { ref, watch, defineAsyncComponent, nextTick } from "vue";
import useAxios from "@/composables/useAxios.js";
import TabSkeleton from "@/components/skeleton/TabSkeleton.vue";
import useWatchlistStore from "@/stores/watchlistStore.js";
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

    const isModalOpen = ref(false);
    const inputListName = ref(null);
    const navbarRef = ref(null);
    const navRef = ref(null);
    const errorMessage = ref([]);
    const { currentTab, tabs } = storeToRefs($store);

    const clearInput = () => (inputListName.value = null);

    const showCurrentTab = (tab) => {
      $store.showCurrentTab(tab);
    };

    const setTabs = (tab) => {
      $store.setTabs(tab);
    };

    const toggleModal = (isOpen) => {
      if (!isOpen) clearInput();
      isModalOpen.value = isOpen;
    };

    const createTab = () => {
      const isTabsExist = tabs.value.includes(inputListName.value);

      if (isTabsExist) {
        errorMessage.value.push("tab already exists");
        return;
      }

      if (inputListName.value == null) {
        errorMessage.value.push("input must not be empty");
        return;
      }

      const { data, error, loading } = useAxios(
        `/api/createWatchlist`,
        "post",
        {
          listName: inputListName.value,
        }
      );

      watch(data, (newTab) => {
        setTabs(newTab.result);
        showCurrentTab(newTab.result);
        toggleModal(false);
      });
    };

    const fetchAndSetTabs = () => {
      const { data, error, loading } = useAxios(`/api/getTabs`, "get");
      watch(data, (newData) => {
        setTabs(newData.result);
      });
    };

    fetchAndSetTabs();

    watch(currentTab, async (newTab) => {
      const IndexOflastItem = tabs.value.length - 1;
      const isTabsNew = tabs.value[IndexOflastItem] === newTab;

      await nextTick();

      if (isTabsNew) {
        navRef.value.scroll({
          left: navRef.value.scrollWidth,
          behavior: "smooth",
        });
      }

      if (newTab === "Watchlist") {
        navbarRef.value.scroll({
          left: -1,
          behavior: "smooth",
        });

        navRef.value.scroll({
          left: -1,
          behavior: "smooth",
        });
      }
    });

    watch(inputListName, () => {
      if (errorMessage.value.length) errorMessage.value.pop();
    });

    return {
      isModalOpen,
      navbarRef,
      navRef,
      inputListName,
      errorMessage,
      currentTab,
      tabs,

      createTab,
      showCurrentTab,
      toggleModal,
    };
  },
};
</script>

<style>
</style>