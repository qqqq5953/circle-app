<template>
  <TabSkeleton
    :tabs="tabs"
    :currentTab="currentTab"
    v-if="isWatchlistLoading"
  />

  <nav class="overflow-y-hidden h-16 lg:hidden" v-if="!isWatchlistLoading">
    <div class="flex gap-2.5 text-sm overflow-x-auto py-6" ref="navRefBelowLg">
      <button
        class="border rounded p-2 min-w-[96px] shrink-0 relative"
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
      <button
        class="shrink-0 text-blue-600 p-2 ml-3"
        @click="
          isModalOpen = true;
          clearInput();
        "
        v-if="!isWatchlistLoading"
      >
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
    <div class="flex gap-2.5 overflow-x-auto max-w-[85%] py-7" ref="navRefLg">
      <button
        class="
          border
          rounded
          p-2
          min-w-[96px]
          shrink-0
          relative
          last:mr-5
          hover:shadow hover:shadow-zinc-200
        "
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
    <button
      class="relative -ml-2 bg-white border py-2 px-3.5 rounded-full"
      @click="setScrolling(navRefLg, 'right')"
      v-if="navRefLg?.scrollWidth > navRefLg?.offsetWidth"
    >
      <i class="fa-solid fa-chevron-right"></i>
    </button>

    <button
      class="shrink-0 text-blue-500 py-6 ml-auto"
      @click="
        isModalOpen = true;
        clearInput();
      "
    >
      + Create
    </button>
  </nav>

  <!-- <div class="overflow-y-hidden h-16 hidden lg:block">
    <div
      class="flex gap-8 pt-6 pb-4 text-sm overflow-x-auto lg:overflow-x-visible"
      ref="navRefBelowLg"
    >
      <TabSkeleton
        :tabs="tabs"
        :currentTab="currentTab"
        v-if="isWatchlistLoading"
      />
      <nav class="lg:overflow-y-hidden lg:h-16 lg:max-w-[75%]" v-else>
        <div class="flex gap-2.5 lg:overflow-x-auto lg:py-4" ref="navRefLg">
          <button
            class="border rounded p-2 min-w-[96px] relative shrink-0"
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
        class="shrink-0 text-blue-600"
        @click="
          isModalOpen = true;
          clearInput();
        "
        v-if="!isWatchlistLoading"
      >
        + Create
      </button>
    </div>
  </div> -->
  <Teleport to="body">
    <InputModal
      v-if="isModalOpen"
      v-model:listName="inputListName"
      :confirmFunc="createWatchlist"
      :closeFunc="closeModal"
      :errorMessage="errorMessage"
      ref="inputModalRef"
    >
      <template #title>Add watchlist</template>
      <template #okButton>Add</template>
    </InputModal>
  </Teleport>
</template>

<script>
import { ref, watch, defineAsyncComponent } from "vue";
import useAxios from "@/composables/useAxios.js";
import TabSkeleton from "@/components/skeleton/TabSkeleton.vue";
import useWatchlistStore from "@/stores/watchlistStore.js";
import { storeToRefs } from "pinia";

export default {
  components: {
    TabSkeleton,
    InputModal: defineAsyncComponent(() =>
      import("@/components/InputModal.vue")
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
    const navRefBelowLg = ref(null);
    const navRefLg = ref(null);
    const errorMessage = ref([]);
    const { currentTab, tabs } = storeToRefs($store);

    const clearInput = () => (inputListName.value = null);

    const showCurrentTab = (tab) => $store.showCurrentTab(tab);

    const setTabs = (tab) => $store.setTabs(tab);

    const closeModal = () => {
      clearInput();
      isModalOpen.value = false;
    };

    const createWatchlist = () => {
      const { data, error, loading } = useAxios(
        `/api/createWatchlist`,
        "post",
        {
          listName: inputListName.value,
        }
      );

      watch(data, (newList) => {
        if (!newList.result) {
          errorMessage.value.push(newList.errorMessage);
        } else {
          setTabs(newList.result);
          showCurrentTab(newList.result);
          closeModal();
        }
      });
    };

    const { data, error, loading } = useAxios(`/api/getTabs`, "get");

    watch(data, (newData) => setTabs(newData.result));

    // 動態清除錯誤訊息
    watch(inputListName, () => errorMessage.value.pop());

    // 滾動效果
    watch(
      currentTab,
      (newTab) => {
        const indexOflastTab = tabs.value.length - 1;
        const isTabsNew = tabs.value[indexOflastTab] === newTab;

        if (isTabsNew) {
          setScrolling(navRefBelowLg.value, "right");
          setScrolling(navRefLg.value, "right");
        }

        if (newTab === "Watchlist") {
          setScrolling(navRefBelowLg.value, "left");
          setScrolling(navRefLg.value, "left");
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
      navRefBelowLg,
      navRefLg,
      inputListName,
      errorMessage,
      currentTab,
      tabs,

      createWatchlist,
      showCurrentTab,
      closeModal,
      clearInput,
      setScrolling,
    };
  },
};
</script>

<style>
</style>