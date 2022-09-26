<template>
  <div
    class="
      flex flex-col
      break-words
      w-full
      shadow-lg
      rounded
      border border-gray-100
    "
  >
    <!-- table title -->
    <div
      class="rounded-t pl-4 lg:pl-8 py-3 flex items-center border-b"
      :class="{ 'border-b': watchlistDisplay }"
    >
      <h3 class="font-semibold truncate ...">
        {{ currentTab }}
      </h3>

      <!-- dropdown -->
      <div
        class="relative ml-auto h-full w-1/5"
        v-if="currentTab?.toLowerCase() !== 'watchlist'"
      >
        <button
          class="absolute top-0 right-2 px-3 rounded-full active:rounded-full"
          @click="toggleDropdown"
        >
          <i class="fa-solid fa-ellipsis-vertical"></i>
        </button>
        <Transition>
          <ul
            class="absolute right-0 -bottom-28 p-3 shadow rounded bg-white"
            v-show="isDropdownOpen"
            @click="toggleDropdown"
          >
            <li
              class="flex gap-3 items-center py-1 cursor-pointer"
              v-for="list in dropdownMenu"
              :key="list.name"
              @click="list.onClick"
            >
              <i :class="list.icon"></i>
              <span>{{ list.name }}</span>
            </li>
          </ul>
        </Transition>
      </div>
    </div>

    <Teleport to="body">
      <InputModal
        v-if="isModalOpen"
        v-model:listName.trim="newListName"
        :errorMessage="errorMessage"
        :confirmFunc="renameWatchlist"
        :closeFunc="
          () => {
            isModalOpen = false;
          }
        "
        ref="inputModalRef"
      >
        <template #title>Rename watchlist</template>
        <template #okButton>Rename</template>
      </InputModal>
    </Teleport>

    <Teleport to="body">
      <Alert v-if="isAlertOpen">
        <template #header>
          <h2 class="text-xl lg:text-2xl break-all">
            Delete "{{ currentTab }}"
          </h2>
        </template>
        <template #body>
          <p class="text-slate-500 font-light">
            {{ Object.keys(watchlistDisplay).length }} items will be deleted.
          </p>
        </template>
        <template #footer>
          <div class="text-right">
            <button class="text-blue-600 p-2 mr-2" @click="isAlertOpen = false">
              Close
            </button>
            <button
              class="border rounded p-2 bg-blue-600 text-white"
              @click="
                deleteWatchlist();
                isAlertOpen = false;
              "
            >
              Delete
            </button>
          </div>
        </template>
      </Alert>
    </Teleport>

    <!-- body -->
    <div class="block w-full overflow-x-auto" v-if="watchlistDisplay">
      <table class="w-full border-collapse table-fixed">
        <thead
          class="bg-gray-100 border-t border-b hidden lg:table-header-group"
        >
          <tr>
            <th
              class="
                px-6
                py-3
                text-gray-700 text-center text-xs
                uppercase
                border-x-0
                whitespace-nowrap
                font-semibold
                w-6/12
                lg:w-5/12
              "
            >
              Stocks
            </th>
            <td
              class="
                px-6
                py-3
                text-gray-700 text-center text-xs
                uppercase
                border-x-0
                whitespace-nowrap
                font-semibold
                w-[12.5%]
                lg:w-auto
              "
            >
              Price
            </td>
            <td
              class="
                px-6
                py-3
                text-gray-700 text-center text-xs
                uppercase
                border-x-0
                whitespace-nowrap
                font-semibold
                w-3/12
                xl:w-auto
              "
            >
              Change %
            </td>
            <td
              class="
                px-6
                py-3
                text-gray-700 text-center text-xs
                uppercase
                border-x-0
                whitespace-nowrap
                font-semibold
                hidden
                lg:table-cell lg:w-auto
              "
            >
              Change
            </td>
            <td class="w-1/12"></td>
          </tr>
        </thead>
        <tbody>
          <tr
            class="hover:bg-slate-100 hover:cursor-pointer"
            v-for="(item, index) in watchlistDisplay"
            :key="item.ticker"
            @click="toInfoPage(item.ticker)"
            :id="index"
            ref="tickerRows"
          >
            <th
              class="
                border-t-0 border-x-0
                py-3
                sm:py-4
                px-4
                lg:px-8
                text-xs text-left
                w-5/12
              "
            >
              <div class="flex flex-col md:flex-row md:items-center md:gap-x-3">
                <p
                  class="
                    w-1/2
                    md:w-2/5
                    max-w-[70px]
                    px-1
                    py-1
                    flex-shrink-0
                    bg-red-400
                    rounded
                    text-white text-center
                    font-semibold
                    uppercase
                  "
                >
                  {{ item.ticker }}
                </p>
                <p class="w-1/2 md:w-3/5 mt-2 md:mt-0 truncate ...">
                  {{ item.name }}
                </p>
              </div>
            </th>
            <td
              class="
                border-t-0 border-x-0
                py-3
                sm:py-4
                px-0
                lg:px-6
                text-xs text-center
                w-[12.5%]
                lg:w-auto
              "
            >
              <span>{{ item.price }}</span>
            </td>
            <td
              class="
                border-t-0 border-x-0
                py-3
                sm:py-4
                px-0
                lg:px-6
                text-xs text-center
                font-medium
                w-3/12
                xl:w-auto
              "
            >
              <div class="flex m-auto">
                <div
                  class="flex items-center gap-2 m-auto px-3 py-2 rounded"
                  :class="
                    item.previousCloseChange > 0
                      ? 'text-red-600 bg-red-100'
                      : 'text-green-600 bg-green-100'
                  "
                >
                  <i
                    class="fas fa-arrow-up"
                    v-if="item.previousCloseChange > 0"
                  ></i>
                  <i class="fas fa-arrow-down" v-else></i>
                  <span class=""
                    >{{ Math.abs(item.previousCloseChangePercent) }} %</span
                  >
                </div>
              </div>
            </td>
            <td
              class="
                border-t-0 border-x-0
                py-3
                sm:py-4
                px-0
                lg:px-6
                text-xs text-center
                hidden
                lg:table-cell lg:w-auto
              "
            >
              <span
                :class="
                  item.previousCloseChange > 0
                    ? 'text-red-600'
                    : 'text-green-600'
                "
                >{{ item.previousCloseChange }}</span
              >
            </td>
            <td
              class="
                border-t-0 border-x-0
                py-3
                sm:py-4
                pr-3
                lg:pr-4
                text-xs text-center
                w-1/12
              "
            >
              <a
                href="#"
                class="text-gray-300"
                @click.stop.prevent="deleteTicker(item.ticker)"
              >
                <i
                  class="
                    fa-solid fa-xmark
                    text-lg
                    md:text-xl
                    hover:text-blue-600
                  "
                ></i>
              </a>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import { useRouter } from "vue-router";
import { ref, watch, nextTick, defineAsyncComponent } from "vue";
import { storeToRefs } from "pinia";
import useAxios from "@/composables/useAxios.js";
import useWatchlistStore from "@/stores/watchlistStore.js";
import InputModal from "@/components/InputModal.vue";

export default {
  components: {
    InputModal,
    Alert: defineAsyncComponent(() => import("@/components/Alert.vue")),
  },
  props: {
    watchlistDisplay: {
      type: Object,
    },
    watchlistInDB: {
      type: Object,
    },
  },
  setup(props, { emit }) {
    const $store = useWatchlistStore();
    const router = useRouter();

    const tickerRows = ref(null);
    const isDropdownOpen = ref(false);
    const dropdownMenu = ref([
      {
        name: "delete",
        onClick: [openAlert],
        icon: "fa-regular fa-trash-can",
      },
      {
        name: "rename",
        onClick: [openRenameModal],
        icon: "fa-regular fa-pen-to-square",
      },
    ]);
    const isModalOpen = ref(false);
    const isAlertOpen = ref(false);
    const newListName = ref(null);
    const inputModalRef = ref(null);
    const errorMessage = ref([]);
    const { currentTab } = storeToRefs($store);

    const clearErrorMessage = () => errorMessage.value.pop();

    const showCurrentTab = (tab) => $store.showCurrentTab(tab);

    const setTabs = (tab) => $store.setTabs(tab);

    const toggleDropdown = () => (isDropdownOpen.value = !isDropdownOpen.value);

    function toInfoPage(ticker) {
      router.push({
        name: "stockInfo",
        params: { ticker },
      });
    }

    function openAlert() {
      isAlertOpen.value = true;
    }

    function deleteWatchlist() {
      const { data, error, loading } = useAxios(
        "/api/deleteWatchlist",
        "post",
        {
          currentTab: $store.currentTab,
        }
      );

      watch(data, (newData) => {
        setTabs(newData.result);
        showCurrentTab($store.DEFAULT_TAB);
      });
    }

    function renameWatchlist() {
      if (errorMessage.value.length) clearErrorMessage();

      const { data, error, loading } = useAxios("/api/editTab", "post", {
        oldTab: $store.currentTab,
        newTab: newListName.value,
      });

      watch(data, (newList) => {
        if (!newList.success) {
          errorMessage.value.push(newList.errorMessage);
          inputModalRef.value.inputRef.select();
        } else {
          isModalOpen.value = false;
          const { newTab, tabsInfo } = newList.result;
          showCurrentTab(newTab);
          setTabs(tabsInfo);
        }
      });
    }

    async function openRenameModal() {
      isModalOpen.value = true;
      newListName.value = $store.currentTab;
      await nextTick();
      inputModalRef.value.inputRef.select();
    }

    function deleteTicker(ticker) {
      const { data, error, loading } = useAxios(
        "/api/deleteFromWatchlist",
        "post",
        { ticker, currentTab: $store.currentTab }
      );

      watch(data, (newData) => {
        const tickerRow = document.getElementById(ticker);
        tickerRow.classList.add("hidden");

        emit("loadWatchlist", true);
      });
    }

    watch(currentTab, () => (isDropdownOpen.value = false));

    // 動態清除錯誤訊息
    watch(newListName, () => clearErrorMessage());

    // 新增後顯示個數
    watch(
      () => props.watchlistDisplay,
      () => {
        if (!tickerRows.value) return;

        const shownRows = tickerRows.value.filter((item) => {
          // show deleted ticker when added
          if (item.classList.contains("hidden")) {
            item.classList.remove("hidden");
          }
          return !item.classList.contains("hidden");
        });

        $store.setTabsInfo(currentTab.value, shownRows.length);
      },
      {
        flush: "post",
      }
    );

    // 刪除後顯示個數
    watch(
      () => props.watchlistInDB,
      () => {
        if (!tickerRows.value) return;

        const shownRows = tickerRows.value.filter(
          (row) => !row.classList.contains("hidden")
        );

        $store.setTabsInfo(currentTab.value, shownRows.length);
      },
      {
        flush: "post",
      }
    );

    return {
      isDropdownOpen,
      isModalOpen,
      isAlertOpen,
      tickerRows,
      currentTab,
      dropdownMenu,
      inputModalRef,
      newListName,
      errorMessage,

      toggleDropdown,
      openRenameModal,
      openAlert,
      deleteTicker,
      deleteWatchlist,
      renameWatchlist,

      toInfoPage,
    };
  },
};
</script>

<style scoped>
.v-enter-active,
.v-leave-active {
  transform: translateY(0);
  transition: opacity 0.1s ease, transform 0.1s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>