<template>
  <div class="relative flex">
    <span class="absolute bg-transparent rounded px-3 py-3"
      ><i class="fas fa-search"></i
    ></span>
    <input
      class="
        pr-3
        pl-10
        py-3
        placeholder-blueGray-300
        text-sm
        bg-white
        rounded-l
        shadow
        focus:ring-blue-300/80 focus:ring-inset focus:ring-1 focus:outline-0
        grow
      "
      type="search"
      :maxlength="selectedCountry.maxLength"
      :placeholder="selectedCountry.placeholder"
      @focus="toggleSearchList(true)"
      v-model.trim="searchTicker"
      v-toUpperCase
      ref="searchTickerRef"
    />
    <button
      class="
        w-1/3
        max-w-[150px]
        flex
        items-center
        justify-between
        bg-zinc-50
        rounded-r
        py-2
        px-3
        text-xs
        font-medium
        shadow
      "
      @click="toggleDropdown"
    >
      <span>{{ selectedCountry.name }}</span>
      <i class="fa-solid fa-caret-down"></i>
    </button>
    <!-- dropdown -->
    <div
      class="
        absolute
        z-10
        top-full
        right-0
        w-1/3
        max-w-[150px]
        rounded
        border
        bg-white
        shadow
        mt-1
      "
      v-if="isDropdownOpen"
    >
      <button
        class="
          first:rounded-t
          last:rounded-b
          border-b
          last:border-0
          text-xs
          px-3
          py-2
          w-full
          text-left
        "
        :class="{
          'bg-slate-600 text-white': country.name === selectedCountry.name,
        }"
        v-for="country in countries"
        :key="country.id"
        @click="selectCountry(country)"
      >
        {{ country.name }}
      </button>
    </div>
  </div>
</template>

<script>
import { nextTick, ref, watch, watchEffect } from "vue";
import axios from "axios";

export default {
  directives: {
    toUpperCase: {
      updated(el) {
        el.value = el.value.toUpperCase();
      },
    },
  },
  setup(_, { emit }) {
    const allPromises = [];
    const searchTicker = ref(null);
    const cacheInput = ref(new Map());
    const cacheValidTicker = ref(new Map());

    // countries dropdown
    const searchTickerRef = ref(null);
    const isDropdownOpen = ref(false);
    const toggleDropdown = () => (isDropdownOpen.value = !isDropdownOpen.value);

    const countries = ref([
      { id: "us", name: "US Stocks", placeholder: "Ex: AAPL", maxLength: "5" },
      {
        id: "tw",
        name: "TW Stocks",
        placeholder: "Ex: 0050.TW",
        maxLength: "8",
      },
      {
        id: "uk",
        name: "UK Stocks",
        placeholder: "Ex: SHEL.L",
        maxLength: "6",
      },
      {
        id: "hk",
        name: "HK Stocks",
        placeholder: "Ex: 1299.HK",
        maxLength: "7",
      },
      {
        id: "ks",
        name: "KR Stocks",
        placeholder: "Ex: 005930.KS",
        maxLength: "9",
      },
      {
        id: "mf",
        name: "Mutual Funds",
        placeholder: "Ex: TRGIX",
        maxLength: "5",
      },
    ]);
    const selectedCountry = ref(countries.value[1]);

    function selectCountry(country) {
      selectedCountry.value = country;
      toggleDropdown();
    }

    function getMatchRules(newCountry) {
      let rule = null;

      switch (newCountry.id) {
        case "us":
          rule = /^[a-z\-?]{1,5}$/i;
          break;
        case "uk":
          rule = /^[a-z]{4}\.l$/i;
          break;
        case "tw":
          rule = /^\d{4,5}\.tw$/i;
          break;
        case "hk":
          rule = /^\d{4}\.hk$/i;
          break;
        case "ks":
          rule = /^\d{6}\.ks$/i;
          break;
        case "mf":
          rule = /^[a-z]{5}$/i;
          break;
        default:
          rule = /^[a-z\-?]{1,5}$/i;
          break;
      }

      return rule;
    }

    const matchRules = ref(null);

    watchEffect(
      () => {
        matchRules.value = getMatchRules(selectedCountry.value);
        searchTicker.value = "";
        searchTickerRef.value.focus();
      },
      { flush: "post" }
    );

    // search ticker
    watch(searchTicker, async (newSearch, oldSearch) => {
      const oldLen = oldSearch?.length || 0;
      const newLen = newSearch?.length;
      const isTyping = newLen > oldLen;
      const isTickerMatch = matchRules.value.test(newSearch);

      if (!isTickerMatch) {
        if (newSearch === "") {
          allPromises.length = 0;
        }
        emitSearchList(null);
        return;
      }

      toggleSearchList(true);

      const tickerObject = isTyping
        ? await typingResponse(newSearch)
        : deleteResponse(newSearch);

      emitSearchList(tickerObject);
    });

    const typingResponse = async (newSearch) => {
      const isInputNew = !cacheInput.value.has(newSearch);

      if (isInputNew) {
        setCacheInput(newSearch, newSearch);
        toggleSearchListSkeleton(true);
      }

      return isInputNew
        ? await getNewTicker(newSearch) // 第一次輸入
        : showValidTicker(newSearch); // 曾輸入過
    };

    const getNewTicker = async (newSearch) => {
      allPromises.push(axios.get(`/api/quote/${newSearch}`));

      try {
        let invalidCount = 0;

        const response = await Promise.allSettled(allPromises);
        const results = response
          .map((item) => item.value.data.result)
          .filter((item) => {
            if (isTickerValid(item)) {
              setCacheValidTicker(item.ticker.toLowerCase(), item);
              return isTickerValid(item);
            } else {
              invalidCount++;
            }
          });
        // console.log("results", results);

        const isGettingAllResults =
          results.length === allPromises.length - invalidCount;

        // 資料全部 load 完再一次呈現
        if (isGettingAllResults) {
          return showValidTicker(newSearch);
        }
      } catch (error) {
        console.log("error", error);
        toggleSearchListSkeleton(false);
      }
    };

    const deleteResponse = (newSearch) => showValidTicker(newSearch);

    const showValidTicker = (newSearch) => {
      toggleSearchListSkeleton(false);

      const validTickerObject = cacheValidTicker.value.get(
        newSearch.toLowerCase()
      );
      return validTickerObject;
    };

    const isTickerValid = (item) =>
      item?.name != null && item?.previousCloseChange !== "NaN";

    const setCacheValidTicker = (ticker, item) => {
      cacheValidTicker.value.set(ticker, item);
    };
    const setCacheInput = (ticker, item) => {
      cacheInput.value.set(ticker, item);
    };

    const toggleSearchListSkeleton = (isLoading) => {
      emit("toggleSearchListSkeleton", isLoading);
    };

    const toggleSearchList = (isFocus) => {
      emit("toggleSearchList", isFocus);
    };

    const emitSearchList = (tickerObject) => {
      emit("emitSearchList", tickerObject);
    };

    return {
      toggleSearchList,
      searchTicker,
      countries,
      selectedCountry,
      selectCountry,
      searchTickerRef,
      isDropdownOpen,
      toggleDropdown,
    };
  },
};
</script>

<style>
</style>