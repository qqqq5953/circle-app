<template>
  <div class="flex flex-col gap-8 sm:gap-6 lg:gap-8">
    <div class="relative w-full pb-16 md:pb-10 mb-6" v-if="!isBuyMore">
      <SearchBar />

      <!-- 搜尋結果 -->
      <Transition>
        <div v-show="isFocus" class="absolute top-14 w-full bg-white">
          <ListSkeleton v-show="isSearchListLoading" />
          <SearchList
            v-show="!isSearchListLoading"
            :searchList="searchList"
            :hasOptionalTd="true"
          >
            <template #action-btn="{ ticker }">
              <div>
                <a
                  href="#"
                  class="text-gray-300 inline-block py-1 hover:text-blue-600"
                  @click.stop.prevent="selectTicker"
                  v-if="ticker !== stock.ticker"
                >
                  <i class="fas fa-plus text-lg md:text-xl"></i>
                </a>
                <span v-else>
                  <i
                    class="fa-solid fa-check text-slate-600 text-lg md:text-xl"
                  ></i>
                </span>
              </div>
            </template>
          </SearchList>
        </div>
      </Transition>
    </div>

    <div v-if="isBuyMore && !tickerToBeTraded">
      <ListSkeleton v-show="!tickerToBeTraded" />
    </div>
    <div v-else-if="stock.ticker">
      <TickerInfo
        class="outline outline-1 outline-slate-300 rounded shadow"
        :stockLists="stockLists"
      />
    </div>

    <InputCost
      :modelValue="stock.cost"
      @input="stock.cost = $event.target.value"
      @setInputValidity="setInputValidity"
      ref="inputCostRef"
    />

    <InputShares
      :modelValue="stock.shares"
      @input="stock.shares = $event.target.value"
      @setInputValidity="setInputValidity"
      ref="inputSharesRef"
    />
    <InputDate
      :modelValue="stock.tradeDate"
      @input="stock.tradeDate = $event.target.value"
      @setInputValidity="setInputValidity"
      :code="code"
      ref="inputDateRef"
    />
  </div>
</template>

<script>
import { nextTick, ref, watch, computed } from "vue";
import useSearchStore from "@/stores/searchStore.js";
import useHoldingStore from "@/stores/holdingStore.js";
import { storeToRefs } from "pinia";

import InputCost from "@/components/forms/InputCost.vue";
import InputShares from "@/components/forms/InputShares.vue";
import InputDate from "@/components/forms/InputDate.vue";
import ListSkeleton from "@/components/skeleton/ListSkeleton.vue";
import SearchBar from "@/components/SearchBar.vue";
import SearchList from "@/components/SearchList.vue";
import TickerInfo from "@/components/TickerInfo.vue";

export default {
  components: {
    InputCost,
    InputShares,
    InputDate,
    ListSkeleton,
    SearchBar,
    SearchList,
    TickerInfo,
  },
  props: {
    tickerToBeTraded: {
      type: Object,
    },
    isBuyMore: {
      type: Boolean,
      default: false,
    },
  },
  setup(props, { emit }) {
    const $searchStore = useSearchStore();
    const { searchList, isFocus, isSearchListLoading } =
      storeToRefs($searchStore);
    const $holdingStore = useHoldingStore();
    const { stock, holidaysRes } = storeToRefs($holdingStore);

    const inputCostRef = ref(null);
    const inputSharesRef = ref(null);
    const inputDateRef = ref(null);
    const stockLists = ref([]);

    function setInputValidity(validityObj) {
      emit("setInputValidity", validityObj);
    }
    const code = ref("");
    async function selectTicker() {
      const [tickerInfo] = searchList.value;

      if (stockLists.value.length) stockLists.value.pop();
      await fillInputData(tickerInfo);
    }

    async function fillInputData(tickerInfo) {
      stockLists.value.push(tickerInfo);
      stock.value = {
        ...stock.value,
        ...tickerInfo,
      };

      await nextTick();

      const countryCode = tickerInfo.code.toUpperCase();
      code.value = countryCode;

      const maxDate = getMaxInputDate(countryCode);
      stock.value.tradeDate = maxDate;
      inputDateRef.value.inputValue = maxDate;
      inputDateRef.value.$refs.dateRef.max = maxDate;
      inputDateRef.value.$refs.dateRef.disabled = false;
      inputCostRef.value.$refs.costRef.focus();

      setInputValidity({ name: "ticker", validity: true });
    }

    function getMaxInputDate(code) {
      const maxDate = {
        TW: getTWMaxDate,
        US: getUSMaxDate,
      };

      return maxDate[code](code);
    }

    function getTWMaxDate(code) {
      const now = new Date();
      const twUpdateTime = new Date();
      twUpdateTime.setHours(13);
      twUpdateTime.setMinutes(30);
      let maxDate;

      if (now.getDay() === 6) {
        // 星期六
        maxDate = getMaxDate(code, 1);
      } else if (now.getDay() === 0) {
        // 星期日
        maxDate = getMaxDate(code, 2);
      } else if (now.getTime() >= twUpdateTime.getTime()) {
        // 平日 超過一點半 選今天
        console.log("平日 超過一點半 選今天");
        maxDate = getMaxDate(code);
      } else if (now.getDay() === 1) {
        // 星期一 早於一點半 選上週五
        maxDate = getMaxDate(code, 3);
      } else {
        // 星期二到五 早於一點半 選前一天
        maxDate = getMaxDate(code, 1);
      }

      return maxDate;
    }

    function getUSMaxDate(code) {
      const now = new Date();
      const usUpdateTime = new Date();
      usUpdateTime.setHours(5);
      usUpdateTime.setMinutes(0);
      let maxDate;

      if (now.getDay() === 6) {
        // 星期六
        console.log("星期六");
        if (now.getTime() >= usUpdateTime.getTime()) {
          // 超過零晨五點 選星期五
          console.log("超過零晨五點 選星期五");
          maxDate = getMaxDate(code, 1);
        } else {
          // 早於零晨五點 選星期四
          console.log("早於零晨五點 選星期四");
          maxDate = getMaxDate(code, 2);
        }
      } else if (now.getDay() === 0) {
        // 星期日
        console.log("星期日");
        maxDate = getMaxDate(code, 2);
      } else if (now.getDay() === 1) {
        // 星期一
        console.log("星期一");
        maxDate = getMaxDate(code, 3);
      } else if (now.getTime() >= usUpdateTime.getTime()) {
        // 星期二到五 超過零晨五點 選昨天
        console.log("星期二到五 超過零晨五點 選昨天");
        maxDate = getMaxDate(code, 1);
      } else if (now.getDay() === 2) {
        // 星期二 早於零晨五點 選上週五
        console.log("星期二 早於零晨五點 選上週五");
        maxDate = getMaxDate(code, 4);
      } else {
        // 星期三到五 早於零晨五點 選前天
        console.log("星期三到五 早於零晨五點 選前天");
        maxDate = getMaxDate(code, 2);
      }

      return maxDate;
    }

    function getMaxDate(code, multiplier = 0) {
      const ISODate = getISODate(multiplier);
      const finaldMaxDate = checkHoliday(code, ISODate, multiplier);

      return finaldMaxDate;
    }

    function getISODate(multiplier = 0) {
      const now = new Date();
      const adjustedDate = new Date(now.getTime() - 86400000 * multiplier);
      const yyyy = adjustedDate.getFullYear();
      const mm = String(adjustedDate.getMonth() + 1).padStart(2, "0");
      const dd = String(adjustedDate.getDate()).padStart(2, "0");
      return yyyy + "-" + mm + "-" + dd;
    }

    const holidays = computed(() => {
      if (!holidaysRes.value.result) return;
      return holidaysRes.value.result;
    });

    function checkHoliday(code, maxDate, multiplier) {
      let adjustedMaxDate = maxDate;
      let backwardDay = multiplier;
      let hasHoliday = true;

      while (hasHoliday) {
        const holiday = holidays.value[code][adjustedMaxDate];
        if (holiday) {
          backwardDay++;
          adjustedMaxDate = getISODate(backwardDay);
        } else {
          hasHoliday = false;
        }
      }

      console.log("adjustedMaxDate", adjustedMaxDate);

      return adjustedMaxDate;
    }

    // 開關 buy modal
    watch(
      () => props.tickerToBeTraded,
      async (tickerInfo) => {
        stockLists.value.length = 0;

        // 打開 buy modal
        if (tickerInfo) {
          await fillInputData(tickerInfo);
          return;
        }

        // 關閉 buy modal
        if (searchList.value) {
          searchList.value.length = 0;
        }
      }
    );

    return {
      stock,
      setInputValidity,

      searchList,
      isSearchListLoading,
      isFocus,

      selectTicker,
      inputCostRef,
      inputSharesRef,
      inputDateRef,
      stockLists,
      code,
    };
  },
};
</script>