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
      class="relative rounded-t pl-4 lg:pl-8 py-3 flex items-center border-b"
      :class="{ 'border-b': watchlistDisplay }"
    >
      <h3 class="font-semibold truncate w-3/4">
        {{ currentTab }}
      </h3>

      <!-- dropdown -->
      <div class="absolute right-2" v-if="deleteArr.length">
        <button
          class="text-xs bg-white rounded px-2 py-1.5 border"
          @click="openAlert($event, 'deleteTicker')"
        >
          DELETE
        </button>
      </div>
      <div class="ml-auto h-full w-1/5" v-else>
        <div class="relative" v-if="currentTab?.toLowerCase() !== 'watchlist'">
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
      <DeleteAlert
        v-if="isAlertOpen"
        :confirmFunc="switchAlert"
        :closeFunc="closeAlert"
      >
        <template #title>
          <div v-html="alertTitle"></div>
        </template>
        <template #content>{{ alertContent }}</template>
      </DeleteAlert>
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
            <td
              class="border-t-0 border-x-0 py-3 sm:py-4 pr-3 lg:pr-4 w-1/12"
            ></td>
          </tr>
        </thead>
        <tbody>
          <tr
            class="hover:bg-slate-100"
            v-for="item in watchlistDisplay"
            :key="item.tempTicker"
            :id="item.id"
            ref="tickerRowsRef"
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
              <router-link
                class="
                  flex flex-col
                  md:flex-row md:items-center md:gap-x-3
                  hover:cursor-pointer
                "
                :to="{
                  name: 'stockInfo',
                  params: { ticker: item.ticker, tempTicker: item.tempTicker },
                }"
              >
                <p
                  class="
                    md:w-2/5
                    max-w-[80px]
                    px-1
                    py-1
                    shrink-0
                    rounded-full
                    text-white text-center
                    font-semibold
                    uppercase
                  "
                  :class="item.style"
                >
                  {{ item.ticker }}
                </p>
                <p class="w-full md:w-3/5 mt-2 md:mt-0 truncate ...">
                  {{ item.name }}
                </p>
              </router-link>
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
                <!-- 'text-white bg-pink-500'
                      'text-white bg-teal-400' -->

                <!-- 'text-red-600 bg-red-100'
                      'text-green-700 bg-green-200/60' -->
                <div
                  class="
                    flex
                    items-center
                    gap-2
                    m-auto
                    px-3
                    py-2
                    rounded
                    font-medium
                  "
                  :class="
                    item.previousCloseChange > 0
                      ? 'text-red-600 bg-red-100/70'
                      : 'text-green-700 bg-green-100'
                  "
                >
                  <i
                    class="fas fa-arrow-up"
                    v-if="item.previousCloseChange > 0"
                  ></i>
                  <i class="fas fa-arrow-down" v-else></i>
                  <span class=""
                    >{{
                      item.previousCloseChangePercent[0] === "-"
                        ? item.previousCloseChangePercent.slice(1)
                        : item.previousCloseChangePercent
                    }}
                    %</span
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
                font-medium
              "
            >
              <!-- 'text-pink-500'
            'text-teal-400' -->
              <!-- 'text-red-600'
            'text-green-700' -->
              <span
                :class="
                  item.previousCloseChange > 0
                    ? 'text-red-600'
                    : 'text-green-700'
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
              @click.stop
            >
              <label
                :for="item.name"
                @click.stop="toggleChecked(item.tempTicker)"
              >
                <i
                  class="
                    fa-solid fa-square-check
                    text-lg
                    md:text-xl
                    hover:text-blue-600
                  "
                  v-if="item.isDelete"
                ></i>
                <i
                  class="
                    fa-regular fa-square
                    text-lg
                    md:text-xl
                    hover:text-blue-600
                  "
                  v-else
                ></i>
              </label>
              <input
                class="hidden"
                :id="item.name"
                :value="item.ticker"
                type="checkbox"
                v-model="deleteArr"
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import { useRouter } from "vue-router";
import { ref, watch, nextTick, defineAsyncComponent, computed } from "vue";
import { storeToRefs } from "pinia";
import http from "@/api/index";
import useAxios from "@/composables/useAxios.js";
import useWatchlistStore from "@/stores/watchlistStore.js";
import InputModal from "@/components/InputModal.vue";
import DeleteAlert from "@/components/DeleteAlert.vue";

export default {
  components: {
    InputModal,
    Alert: defineAsyncComponent(() => import("@/components/BaseAlert.vue")),
    DeleteAlert,
  },
  props: {
    watchlistDisplay: {
      type: Object,
      default: {},
    },
  },
  setup(props, { emit }) {
    const $store = useWatchlistStore();
    const router = useRouter();
    const { currentTab } = storeToRefs($store);

    const setTabs = (tab) => $store.setTabs(tab);
    const showCurrentTab = (tab) => $store.showCurrentTab(tab);

    // delete alert
    const isAlertOpen = ref(false);
    const alertTitle = ref('<span class="bg-red-300">test</span>');
    const alertContent = ref(null);
    const alertAction = ref(null);

    const switchAlert = () => {
      switch (alertAction.value) {
        case "deleteWatchlist":
          deleteWatchlist();
          break;

        case "deleteTicker":
          deleteTicker();
          break;
      }
    };

    const openAlert = (e, action = "deleteWatchlist") => {
      isAlertOpen.value = true;
      alertAction.value = action;

      switch (action) {
        case "deleteWatchlist":
          alertTitle.value = `Delete "${currentTab.value}"`;
          alertContent.value = `${calculateListItems.value} items will be deleted.`;
          break;

        case "deleteTicker":
          let tickers = "";

          for (const tempTicker in props.watchlistDisplay) {
            const tickerObj = props.watchlistDisplay[tempTicker];
            if (deleteArr.value.indexOf(tickerObj.ticker) !== -1) {
              tickers += `<span class="max-w-fit px-2 rounded ${tickerObj.style} text-white text-base">${tickerObj.ticker}</span>`;
            }
          }

          alertTitle.value = `<div class="flex items-center gap-2 flex-wrap">Delete ${tickers}</div>`;

          alertContent.value = `${deleteArr.value.length} items will be deleted.`;
          break;
      }
    };

    const closeAlert = () => (isAlertOpen.value = false);

    // Modal & dropdown menu
    const isDropdownOpen = ref(false);
    const isModalOpen = ref(false);
    const inputModalRef = ref(null);
    const newListName = ref(null);
    const errorMessage = ref([]);

    const calculateListItems = computed(() => {
      return props.watchlistDisplay
        ? Object.keys(props.watchlistDisplay).length
        : 0;
    });

    const clearErrorMessage = () => errorMessage.value.pop();

    const toggleDropdown = () => (isDropdownOpen.value = !isDropdownOpen.value);

    const openRenameModal = async () => {
      isModalOpen.value = true;
      newListName.value = $store.currentTab;
      await nextTick();
      inputModalRef.value.inputRef.select();
    };

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

    const deleteWatchlist = async () => {
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
        closeAlert();
      });

      // try {
      //   const res = await http.post("/api/deleteWatchlist", {
      //     currentTab: $store.currentTab,
      //   });

      //   setTabs(res.data.result);
      //   showCurrentTab($store.DEFAULT_TAB);
      //   closeAlert();
      // } catch (error) {
      //   console.log("error", error);
      // }
    };

    const renameWatchlist = () => {
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
          setTabs(tabsInfo);
          showCurrentTab(newTab);
        }
      });
    };

    // delete ticker
    const deleteArr = ref([]);
    const tickerRowsRef = ref(null);

    const toggleChecked = (ticker) => {
      props.watchlistDisplay[ticker].isDelete =
        !props.watchlistDisplay[ticker].isDelete;
    };

    const deleteTicker = async () => {
      if (deleteArr.value.length === 0) return;

      const keys = Object.keys(props.watchlistDisplay).length;
      const rows = keys - deleteArr.value.length;

      emit("toggleLoadingEffect", true);
      emit("setSkeletonTableRow", { rows });
      closeAlert();

      const deleteInfoArr = deleteArr.value.map((ticker) =>
        ticker.includes(".") ? ticker.split(".")[0] : ticker
      );

      try {
        await http.delete(
          `/api/deleteFromWatchlist/${$store.currentTab}/${JSON.stringify(
            deleteInfoArr
          )}`
        );

        emit("loadWatchlist", {
          status: "deleteTicker",
          payload: deleteInfoArr,
        });
      } catch (error) {
        console.log("error", error);
      }
    };

    const clearDeleteArr = () => (deleteArr.value.length = 0);

    // 新增後tab顯示個數
    watch(
      () => props.watchlistDisplay,
      () => {
        if (!tickerRowsRef.value) return;

        // const shownRows = tickerRowsRef.value.filter((item) => {
        //   // show deleted ticker when added
        //   if (item.classList.contains("hidden")) {
        //     item.classList.remove("hidden");
        //   }
        //   return !item.classList.contains("hidden");
        // });
        // $store.setTabsInfo(currentTab.value, shownRows.length);

        $store.setTabsInfo(currentTab.value, tickerRowsRef.value.length);

        clearDeleteArr();
      },
      {
        flush: "post",
      }
    );

    // 動態清除錯誤訊息
    watch(newListName, () => clearErrorMessage());

    watch(currentTab, () => {
      isDropdownOpen.value = false;
      clearDeleteArr();
    });

    return {
      isDropdownOpen,
      isModalOpen,
      isAlertOpen,
      tickerRowsRef,
      currentTab,
      dropdownMenu,
      inputModalRef,
      newListName,
      errorMessage,

      toggleDropdown,
      openRenameModal,
      deleteTicker,
      deleteWatchlist,
      renameWatchlist,

      deleteArr,
      toggleChecked,
      calculateListItems,

      switchAlert,
      alertTitle,
      alertContent,
      openAlert,
      closeAlert,
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