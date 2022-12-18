<template>
  <div class="flex flex-col break-words w-full rounded border">
    <div class="py-3 flex flex-col gap-1">
      <section
        class="
          relative
          flex
          items-center
          justify-between
          rounded-t
          px-4
          lg:px-8
        "
      >
        <h3 class="text-xl font-semibold truncate w-3/4">
          {{ currentTab }}
        </h3>

        <!-- delete -->
        <div
          class="absolute right-4 top-0 my-1 flex gap-2"
          v-if="deleteArr.length"
        >
          <label
            for="selectAll"
            class="
              rounded
              px-2
              py-px
              border border-slate-500
              bg-white
              text-slate-600 text-xs
              flex
              items-center
            "
          >
            <span v-if="deleteArrLength === listLength">Undo</span>
            <span v-else>Select all</span>
          </label>
          <input
            id="selectAll"
            class="hidden"
            type="checkbox"
            v-model="selectAll"
          />
          <button
            class="
              rounded
              px-2
              py-px
              border border-slate-500
              text-slate-600 text-xs
              font-semibold
            "
            @click="openAlert($event, 'deleteTicker')"
          >
            Delete
          </button>
        </div>

        <!-- setting -->
        <div
          class="absolute right-2"
          v-if="!deleteArr.length && currentTab?.toLowerCase() !== 'watchlist'"
        >
          <button class="px-3 h-full" @click="toggleDropdown">
            <i class="fa-solid fa-ellipsis-vertical"></i>
          </button>
          <Transition>
            <ul
              class="
                absolute
                -right-2
                z-30
                top-full
                mt-2
                p-3
                shadow
                rounded
                bg-white
              "
              v-if="isDropdownOpen"
              @click="toggleDropdown"
            >
              <li
                class="flex gap-3 items-center py-1 cursor-pointer text-sm"
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
      </section>

      <!-- sort -->
      <section
        class="flex justify-between items-center pl-4 pr-2 lg:pl-8"
        v-if="listLength"
      >
        <div class="relative flex flex-grow justify-end items-center">
          <button
            class="
              flex
              justify-between
              space-x-2
              px-2
              py-1
              rounded-full
              text-xs text-blue-500
            "
            :class="{ 'focus:bg-blue-50': isSortMenuOpen }"
            @click="isSortMenuOpen = true"
            @blur="isSortMenuOpen = false"
          >
            <span>
              <i
                class="fa-solid fa-arrow-up"
                v-if="selectedDirection === 'ascending'"
              ></i>
              <i class="fa-solid fa-arrow-down" v-else></i>
            </span>
            <span
              >Sort by
              <span class="font-bold">{{ selectedDisplayName }}</span></span
            >
          </button>
          <Transition>
            <div
              class="
                absolute
                top-full
                -right-2
                z-20
                w-3/4
                max-w-[184px]
                mt-2
                text-sm
                rounded
                border-2 border-blue-50
                bg-white
              "
              v-if="isSortMenuOpen"
              @click="isSortMenuOpen = false"
            >
              <ul>
                <li
                  class="
                    flex
                    gap-3
                    items-center
                    py-2
                    px-3
                    hover:bg-blue-50
                    cursor-pointer
                  "
                  :class="{
                    'text-blue-500 font-semibold pointer-events-none cursor-auto':
                      selectedSortCategory === item.category,
                  }"
                  v-for="(item, key) in sortMenu"
                  :key="item.category"
                  @click="onClickSort({ key, category: item.category })"
                >
                  <i class="w-1/12" :class="item.icon"></i>
                  <span>{{ key }}</span>
                </li>
              </ul>
              <ul class="border-t-2 border-blue-50">
                <li
                  class="
                    flex
                    gap-3
                    items-center
                    py-2
                    px-3
                    hover:bg-blue-50
                    cursor-pointer
                  "
                  :class="{
                    'text-blue-500 font-semibold pointer-events-none cursor-auto':
                      selectedDirection === item.direction,
                  }"
                  v-for="(item, key) in sortDirection"
                  :key="item.direction"
                  @click="onClickSort({ direction: item.direction })"
                >
                  <i class="w-1/12" :class="item.icon"></i>
                  <span>{{ key }}</span>
                </li>
              </ul>
            </div>
          </Transition>
        </div>
      </section>
    </div>

    <Teleport to="body">
      <InputModal
        v-if="isModalOpen"
        :confirmFunc="renameWatchlist"
        :closeFunc="
          () => {
            isModalOpen = false;
          }
        "
      >
        <template #title>Rename watchlist</template>
        <template #inputs>
          <div>
            <BaseInput
              ref="baseInputRef"
              refName="renamelistRef"
              v-model:listName.trim="newListName"
            />
            <ErrorDisplay :errors="errorMessage" v-if="errorMessage.length" />
          </div>
        </template>
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
    <div class="block w-full overflow-x-auto" v-if="watchlistArr">
      <table class="w-full border-collapse table-fixed">
        <thead class="bg-gray-100 border-y hidden lg:table-header-group">
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
            class="hover:bg-slate-100 border-t"
            :class="{
              'update-animation': tickersArr.indexOf(item.tempTicker) !== -1,
            }"
            v-for="item in watchlistArr"
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
                    min-w-[81px]
                  "
                  :class="
                    item.previousCloseChange > 0
                      ? 'text-red-600 bg-red-100/70'
                      : item.previousCloseChange < 0
                      ? 'text-green-700 bg-green-100'
                      : 'text-slate-500 bg-slate-200'
                  "
                >
                  <i
                    class="fas fa-arrow-up"
                    v-if="item.previousCloseChange > 0"
                  ></i>
                  <i
                    class="fas fa-arrow-down"
                    v-if="item.previousCloseChange < 0"
                  ></i>
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
                    : item.previousCloseChange < 0
                    ? 'text-green-700'
                    : 'text-slate-500'
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
              <label :for="item.ticker">
                <i
                  class="
                    fa-solid fa-square-check
                    text-lg text-slate-500
                    hover:text-blue-600 hover:cursor-pointer
                    md:text-xl
                  "
                  v-if="deleteArr.includes(item.ticker)"
                ></i>
                <i
                  class="
                    fa-regular fa-square
                    text-lg text-slate-500
                    hover:text-blue-600 hover:cursor-pointer
                    md:text-xl
                  "
                  v-else
                ></i>
              </label>
              <input
                class="hidden"
                :id="item.ticker"
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
import { ref, watch, nextTick, defineAsyncComponent, computed } from "vue";
import { storeToRefs } from "pinia";
import http from "@/api/index";
import useWatchlistStore from "@/stores/watchlistStore.js";
import InputModal from "@/components/InputModal.vue";
import BaseInput from "@/components/BaseInput.vue";
import DeleteAlert from "@/components/DeleteAlert.vue";
import useSort from "@/composables/useSort.js";

export default {
  components: {
    InputModal,
    BaseInput,
    DeleteAlert,
    Alert: defineAsyncComponent(() => import("@/components/BaseAlert.vue")),
    ErrorDisplay: defineAsyncComponent(() =>
      import("@/components/ErrorDisplay.vue")
    ),
  },
  props: {
    watchlistArr: {
      type: Array,
      default: [],
    },
    updatedTickers: {
      type: Array,
      default: [],
    },
  },
  setup(props, { emit }) {
    const tickersArr = ref([]);

    watch(
      () => props.updatedTickers,
      (n) => {
        tickersArr.value = n;
        setTimeout(() => {
          tickersArr.value.length = 0;
        }, 1000);
      },
      { deep: true }
    );

    const $store = useWatchlistStore();
    const { tabs, currentTab, DEFAULT_TAB } = storeToRefs($store);
    const {
      setTabs,
      setTabsInfo,
      showCurrentTab,
      toggleLoadingEffect,
      setSkeletonTableRow,
      renameCacheList,
    } = $store;
    const listLength = computed(() => {
      if (!props.watchlistArr) return;
      return props.watchlistArr.length;
    });

    // sort
    const {
      sortMenu,
      sortDirection,
      selectedDisplayName,
      selectedSortCategory,
      selectedDirection,
      isSortMenuOpen,
      toggleSortMenu,
      onClickSort,
    } = useSort(emit);

    // alert
    const isAlertOpen = ref(false);
    const alertTitle = ref('<span class="bg-red-300">error</span>');
    const alertContent = ref(null);
    const alertAction = ref(null);

    const switchAlert = () => {
      switch (alertAction.value) {
        case "deleteWatchlist": {
          deleteWatchlist();
          break;
        }

        case "deleteTicker": {
          deleteTicker();
          break;
        }
      }
    };

    const openAlert = (e, action = "deleteWatchlist") => {
      isAlertOpen.value = true;
      alertAction.value = action;

      switch (action) {
        case "deleteWatchlist": {
          alertTitle.value = `Delete "${currentTab.value}"`;

          alertContent.value = `${listLength.value || 0} ${
            listLength.value > 1 ? "items" : "item"
          } will be deleted.`;
          break;
        }

        case "deleteTicker": {
          const tickers = props.watchlistArr
            .filter(
              (tickerObj) => deleteArr.value.indexOf(tickerObj.ticker) !== -1
            )
            .map(
              (tickerObj) =>
                `<span class="max-w-fit px-2 rounded ${tickerObj.style} text-white text-base">${tickerObj.ticker}</span>`
            )
            .join("");

          alertTitle.value = `<div class="flex items-center gap-2 flex-wrap">Delete ${tickers}</div>`;

          alertContent.value = `${deleteArrLength.value} ${
            deleteArrLength.value > 1 ? "items" : "item"
          } will be deleted.`;
          break;
        }
      }
    };

    const closeAlert = () => (isAlertOpen.value = false);

    // Modal & dropdown menu
    const isDropdownOpen = ref(false);
    const isModalOpen = ref(false);
    const baseInputRef = ref(null);
    const newListName = ref(null);
    const errorMessage = ref([]);

    const clearErrorMessage = () => errorMessage.value.pop();

    const toggleDropdown = () => (isDropdownOpen.value = !isDropdownOpen.value);

    const openRenameModal = async () => {
      isModalOpen.value = true;
      newListName.value = currentTab.value;
      await nextTick();
      baseInputRef.value.$refs.renamelistRef.select();
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
      try {
        const res = await http.delete(`/api/watchlist/${currentTab.value}`);

        setTabs(res.data.result);
        showCurrentTab(DEFAULT_TAB.value);
        closeAlert();
      } catch (error) {
        console.log("error", error);
      }
    };

    const renameWatchlist = async () => {
      if (errorMessage.value.length) clearErrorMessage();
      if (!newListName.value) {
        errorMessage.value.push("Input must not be empty");
        baseInputRef.value.$refs.renamelistRef.select();
        return;
      }

      const isNewTab =
        tabs.value.findIndex((tab) => tab.name === newListName.value) === -1;

      if (isNewTab) {
        renameCacheList({
          oldName: currentTab.value,
          newName: newListName.value,
        });
      }

      const res = await http.put(
        `/api/watchlist/${currentTab.value}/${newListName.value}`
      );

      if (!res.data.success) {
        errorMessage.value.push(res.data.errorMessage);
        baseInputRef.value.$refs.renamelistRef.select();
      } else {
        isModalOpen.value = false;
        const { newName, tabsInfo } = res.data.result;
        setTabs(tabsInfo);
        showCurrentTab(newName);
      }
    };

    // delete ticker
    const tickerRowsRef = ref(null);
    const deleteArr = ref([]);
    const deleteArrLength = computed({
      get() {
        return deleteArr.value.length;
      },
      set(newLength) {
        deleteArr.value.length = newLength;
      },
    });
    const selectAll = computed({
      get() {
        return deleteArrLength.value === listLength.value;
      },
      set(allTickers) {
        if (allTickers) {
          deleteArr.value = props.watchlistArr.map(
            (tickerObj) => tickerObj.ticker
          );
        } else {
          deleteArr.value = [];
        }
      },
    });

    const deleteTicker = async () => {
      const rows = listLength.value - deleteArrLength.value;

      toggleLoadingEffect(true);
      setSkeletonTableRow({ rows });
      closeAlert();

      const deletedTickers = deleteArr.value.map((ticker) =>
        ticker.includes(".") ? ticker.split(".")[0] : ticker
      );

      console.log("deletedTickers", deletedTickers);

      try {
        await http.delete(
          `/api/ticker/${currentTab.value}/${JSON.stringify(deletedTickers)}`
        );

        emit("loadWatchlist", {
          status: "deleteTicker",
          params: deletedTickers,
        });

        clearDeleteArr();
      } catch (error) {
        console.log("error", error);
      }
    };

    const clearDeleteArr = () => (deleteArrLength.value = 0);

    // 新增後tab顯示個數
    watch(
      () => props.watchlistArr,
      () => {
        if (!tickerRowsRef.value) return;

        setTabsInfo(currentTab.value, tickerRowsRef.value.length);

        // clearDeleteArr();
      },
      {
        flush: "post",
      }
    );

    // 動態清除錯誤訊息
    watch(newListName, () => clearErrorMessage());

    watch(currentTab, () => {
      isDropdownOpen.value = false;
      isSortMenuOpen.value = false;
      clearDeleteArr();
    });

    return {
      isDropdownOpen,
      isModalOpen,
      isAlertOpen,
      tickerRowsRef,
      currentTab,
      dropdownMenu,
      newListName,
      errorMessage,
      listLength,

      toggleDropdown,
      openRenameModal,
      deleteTicker,
      deleteWatchlist,
      renameWatchlist,

      deleteArr,
      deleteArrLength,
      selectAll,

      switchAlert,
      alertTitle,
      alertContent,
      openAlert,
      closeAlert,

      sortMenu,
      sortDirection,
      onClickSort,
      selectedDisplayName,
      selectedSortCategory,
      selectedDirection,
      isSortMenuOpen,
      toggleSortMenu,

      tickersArr,

      baseInputRef,
    };
  },
};
</script>

<style scoped>
.update-animation {
  animation: ping 1500ms ease-in-out 1;
}

@keyframes ping {
  0% {
    background-color: rgb(233, 233, 233);
  }
  100% {
    opacity: 70%;
    background-color: white;
  }
}

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