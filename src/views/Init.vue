<template>
  <main>
    <!-- trade modal -->
    <Teleport to="body">
      <InputModal
        :isFullPage="true"
        :isOpen="isModalOpen"
        :closeFunc="toggleModal"
        :confirmFunc="addStock"
        :isDisabled="!isAllValid"
      >
        <template #title>Trade Panel</template>
        <template #inputs>
          <TradePanel
            ref="newAddingRef"
            @setInputValidity="setInputValidity"
            v-show="!loading"
          />
        </template>
        <template #okButton>Trade</template>
      </InputModal>
    </Teleport>

    <section class="py-[20%] text-center">
      <button
        class="bg-indigo-700 text-white hover:bg-indigo-600 rounded-full px-3 py-1.5 text-xs"
        @click="toggleModal({ open: true, type: 'invest' })"
      >
        <span>+</span>
        <span class="mx-1">Make your first investment</span>
      </button>
    </section>
  </main>
</template>

<script>
import {
  ref,
  computed,
  defineAsyncComponent,
  inject,
  nextTick,
  onMounted,
} from "vue";
import TradePanel from "@/components/TradePanel.vue";
import { useClickPrevention } from "@/composables/useClickPrevention.js";
import useHoldingStore from "@/stores/holdingStore.js";
import useSearchStore from "@/stores/searchStore.js";
import { storeToRefs } from "pinia";
import http from "../api/index";
import { useRouter } from "vue-router";

export default {
  components: {
    TradePanel,
    InputModal: defineAsyncComponent(() =>
      import("@/components/InputModal.vue")
    ),
  },
  setup() {
    const $searchStore = useSearchStore();
    const { searchList } = storeToRefs($searchStore);
    const $holdingStore = useHoldingStore();
    const { stock } = storeToRefs($holdingStore);
    const { isClickDisabled, preventMultipleClicks } = useClickPrevention(3000);
    const setSnackbarMessage = inject("setSnackbarMessage");
    const router = useRouter();

    onMounted(async () => {
      searchList.value = null;
    });

    async function addStock() {
      if (!isAllValid.value || isClickDisabled.value) return;

      toggleModal({ open: false, type: "invest" });
      toggleSkeleton(true);
      preventMultipleClicks();

      try {
        const stockObj = {
          ...stock.value,
          ticker: stock.value.ticker,
          tempTicker: stock.value.tempTicker?.toUpperCase(),
          recordUnix: Date.now(),
        };
        const res = await http.post(`/api/stock`, stockObj);
        const { success, content, errorMessage } = res.data;

        if (success) {
          await updateHoldings(res.data);
        } else {
          toggleSkeleton(false);
          setSnackbarMessage({
            success,
            content,
            errorMessage,
          });
        }
      } catch (error) {
        setSnackbarMessage({
          success: false,
          content: error.toString(),
          result: null,
        });
      }
    }

    async function updateHoldings(newData) {
      console.log("updateHoldings newData", newData);
      const { ticker, cost, shares, tradeDate, recordUnix } = newData.result;
      const addDate = new Date(recordUnix);
      const result = {
        Ticker: ticker,
        Cost: cost,
        Shares: shares,
        "Trade date": tradeDate,
        "Record time": addDate.toLocaleString("zh-TW").replace(/\//g, "-"),
      };

      toggleSkeleton(false);
      setSnackbarMessage({ ...newData, result, routeName: "TradeResult" });
      router.replace({ name: "Overview" });
    }

    const loading = ref(false);
    function toggleSkeleton(isLoading) {
      loading.value = isLoading;
    }

    const isModalOpen = ref(false);
    const newAddingRef = ref(null);
    async function toggleModal(parmas) {
      const { open } = parmas;
      const style = open ? "overflow:hidden" : null;
      disableVerticalScrollbar(style);
      isModalOpen.value = open;

      if (!open) {
        //  disable 日期欄位
        const { inputDateRef } = newAddingRef.value.$refs;
        inputDateRef.dateRef.disabled = true;

        // 等關閉後再清空，否則 api 會傳失敗
        await nextTick();
        resetInput();
      }
    }

    function disableVerticalScrollbar(style) {
      document.querySelector("body").style = style;
    }

    function resetInput() {
      // 清空 cost 及 date(直接修改 inputValue 可同時修改驗證)
      Object.keys(newAddingRef.value.$refs).forEach((inputRef) => {
        newAddingRef.value.$refs[inputRef].inputValue =
          inputRef === "inputSharesRef" ? "1" : null;
      });

      // 清空已選的 ticker
      inputValidity.value.ticker = false;
      stock.value.ticker = null;

      // 清空 cost tradeDate(否則換頁後再回來無法清空)
      stock.value.cost = null;
      stock.value.tradeDate = null;
    }

    const isAllValid = computed(() => {
      return Object.values(inputValidity.value).every((item) => !!item);
    });

    const inputValidity = ref({
      ticker: null,
      cost: null,
      shares: true,
      date: null,
    });

    function setInputValidity(validityObj) {
      const { name, validity } = validityObj;
      inputValidity.value[name] = validity;
    }

    return {
      loading,
      isModalOpen,
      toggleModal,
      addStock,
      isAllValid,
      newAddingRef,
      inputValidity,
      setInputValidity,
    };
  },
};
</script>

<style>
</style>