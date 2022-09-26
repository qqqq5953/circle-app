<template>
  <TabSkeleton
    :tabs="tabs"
    :currentTab="currentTab"
    v-if="isWatchlistLoading"
  />

  <nav class="overflow-y-hidden h-16 lg:hidden" v-if="!isWatchlistLoading">
    <div class="flex gap-2.5 text-sm overflow-x-auto py-6" ref="navBelowLgRef">
      <button
        class="
          flex
          items-center
          border
          rounded
          p-2
          min-w-[150px]
          shrink-0
          relative
          text-slate-700
          hover:shadow hover:shadow-slate-300
          focus:shadow-none
        "
        :class="{
          'after:absolute after:inset-x-0 after:bottom-0 after:h-1 after:bg-blue-500 after:rounded-b-lg':
            currentTab === tab.name,
        }"
        v-for="tab in tabs"
        :key="tab.name"
        @click="showCurrentTab(tab.name)"
      >
        <i
          class="
            fa-solid fa-list-ul
            mr-2.5
            p-1
            text-slate-500
            bg-gray-100
            rounded
          "
        ></i>
        <span class="mr-5">{{ tab.name }}</span>
        <span class="ml-auto text-slate-500 text-xs">{{ tab.listLength }}</span>
      </button>
      <button class="shrink-0 text-blue-600 p-2 ml-3" @click="openCreateModal">
        + Create
      </button>
    </div>
  </nav>

  <nav
    class="
      text-sm
      hidden
      lg:flex lg:items-center lg:h-14 lg:overflow-y-hidden
      relative
    "
    v-if="!isWatchlistLoading"
  >
    <div
      class="flex gap-2.5 overflow-x-auto max-w-[85%] pt-10 pb-6 pr-8"
      ref="navLgRef"
    >
      <button
        class="
          flex
          items-center
          border
          rounded
          p-2
          min-w-[150px]
          shrink-0
          relative
          text-slate-700
          hover:shadow hover:shadow-slate-300
          focus:shadow-none
        "
        :class="{
          'after:absolute after:inset-x-0 after:bottom-0 after:h-1 after:bg-blue-500 after:rounded-b-lg':
            currentTab === tab.name,
        }"
        v-for="tab in tabs"
        :key="tab.name"
        @click="showCurrentTab(tab.name)"
      >
        <i
          class="
            fa-solid fa-list-ul
            mr-2.5
            p-1
            text-slate-500
            bg-gray-100
            rounded
          "
        ></i>
        <span class="mr-5">{{ tab.name }}</span>
        <span class="ml-auto text-slate-500 text-xs">{{ tab.listLength }}</span>
      </button>
    </div>
    <button
      class="
        relative
        -ml-6
        bg-white
        border
        py-2
        px-3.5
        rounded-full
        hover:shadow hover:shadow-slate-300
      "
      @click="setScrolling(navLgRef, 'right')"
      v-if="navLgRef?.scrollWidth > navLgRef?.offsetWidth"
    >
      <i class="fa-solid fa-chevron-right"></i>
    </button>

    <button
      class="shrink-0 text-blue-500 py-6 ml-auto"
      @click="openCreateModal"
    >
      + Create
    </button>
  </nav>

  <Teleport to="body">
    <InputModal
      v-if="isModalOpen"
      v-model:listName.trim="inputListName"
      :confirmFunc="createWatchlist"
      :closeFunc="closeModal"
      :errorMessage="errorMessage"
      ref="inputModalRef"
    >
      <template #title>Create watchlist</template>
      <template #okButton>Create</template>
    </InputModal>
  </Teleport>
</template>

<script>
import { ref, watch, nextTick } from "vue";
import useAxios from "@/composables/useAxios.js";
import TabSkeleton from "@/components/skeleton/TabSkeleton.vue";
import InputModal from "@/components/InputModal.vue";
import useWatchlistStore from "@/stores/watchlistStore.js";
import { storeToRefs } from "pinia";

export default {
  components: {
    TabSkeleton,
    InputModal,
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
    const navBelowLgRef = ref(null);
    const navLgRef = ref(null);
    const inputModalRef = ref(null);
    const errorMessage = ref([]);
    const { currentTab, tabs } = storeToRefs($store);

    const clearInput = () => (inputListName.value = null);
    const clearErrorMessage = () => errorMessage.value.pop();

    const showCurrentTab = (tab) => $store.showCurrentTab(tab);

    const setTabs = (tab) => $store.setTabs(tab);

    const closeModal = () => {
      clearInput();
      isModalOpen.value = false;
    };

    const createWatchlist = () => {
      if (errorMessage.value.length) clearErrorMessage();

      const { data, error, loading } = useAxios(
        `/api/createWatchlist`,
        "post",
        {
          listName: inputListName.value,
        }
      );

      watch(data, (newList) => {
        if (!newList.success) {
          errorMessage.value.push(newList.errorMessage);
        } else {
          const { newTab, tabsInfo } = newList.result;
          setTabs(tabsInfo);
          showCurrentTab(newTab);
          closeModal();
        }
      });
    };

    async function openCreateModal() {
      isModalOpen.value = true;
      await nextTick();
      clearInput();
      inputModalRef.value.inputRef.focus();
    }

    const { data, error, loading } = useAxios(`/api/getTabs`, "get");

    watch(data, (newData) => setTabs(newData.result));

    // 動態清除錯誤訊息
    watch(inputListName, () => clearErrorMessage());

    // 滾動效果
    watch(
      currentTab,
      (newTab) => {
        const indexOflastTab = tabs.value.length - 1;
        const isTabsNew = tabs.value[indexOflastTab].name === newTab;

        if (isTabsNew) {
          setScrolling(navBelowLgRef.value, "right");
          setScrolling(navLgRef.value, "right");
        }

        if (newTab === "Watchlist") {
          setScrolling(navBelowLgRef.value, "left");
          setScrolling(navLgRef.value, "left");
        }
      },
      {
        flush: "post",
      }
    );

    function setScrolling(DOM, direction) {
      if (!DOM) return;

      DOM.scroll({
        left: direction === "left" ? -1 : DOM.scrollWidth,
        behavior: "smooth",
      });
    }

    return {
      isModalOpen,
      navBelowLgRef,
      navLgRef,
      inputModalRef,
      inputListName,
      errorMessage,
      currentTab,
      tabs,

      createWatchlist,
      openCreateModal,
      showCurrentTab,
      closeModal,
      setScrolling,
    };
  },
};
</script>

<style>
</style>