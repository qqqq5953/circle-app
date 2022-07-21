<template>
  <div>
    <span
      class="
        leading-snug
        font-normal
        text-blueGray-300
        absolute
        bg-transparent
        rounded
        px-3
        py-3
      "
      ><i class="fas fa-search"></i
    ></span>
    <input
      type="text"
      placeholder="Search Ticker..."
      class="
        border-0
        pr-3
        pl-10
        py-3
        placeholder-blueGray-300
        text-blueGray-600
        bg-white
        rounded
        text-sm
        shadow
        outline-none
        focus:outline-none focus:ring
        w-full
      "
      autofocus
      v-model.trim="searchTicker"
      @focus="toggleSearchList(true)"
    />
  </div>
</template>

<script>
import { ref, watch } from "vue";
import axios from "axios";

export default {
  setup(props, { emit }) {
    const allPromises = [];
    const searchTicker = ref(null);
    const cacheInput = ref(new Map());
    const cacheValidTicker = ref(new Map());
    const tickerRule = /^[a-z\-?]{1,5}$/i;

    watch(searchTicker, async (newSearch, oldSearch) => {
      const oldLen = oldSearch?.length || 0;
      const newLen = newSearch?.length;
      const isTyping = newLen > oldLen;
      const isTickerMatch = tickerRule.test(newSearch);

      if (!isTickerMatch) {
        allPromises.length = 0;
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
        let deleteCount = 0;

        const response = await Promise.allSettled(allPromises);
        const results = response
          .map((item) => item.value.data.result)
          .filter((item) => {
            if (isTickerValid(item)) {
              setCacheValidTicker(item.ticker.toLowerCase(), item);
              return isTickerValid(item);
            } else {
              deleteCount++;
            }
          });
        const isGettingAllResults =
          results.length === allPromises.length - deleteCount;

        // 資料全部 load 完再一次呈現
        if (isGettingAllResults) return showValidTicker(newSearch);
      } catch (error) {
        console.log("error", error);
        toggleSearchListSkeleton(false);
      }
    };

    const deleteResponse = (newSearch) => showValidTicker(newSearch);

    const showValidTicker = (newSearch) => {
      toggleSearchListSkeleton(false);

      const validTickerObject = cacheValidTicker.value.get(newSearch);
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
    };
  },
};
</script>

<style>
</style>