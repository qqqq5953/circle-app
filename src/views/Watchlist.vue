<template>
  <main class="px-4 md:p-10 mx-auto w-full">
    <form class="flex justify-center">
      <div class="relative w-full">
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
        />
      </div>
    </form>

    <!-- 搜尋結果 -->
    <div class="overflow-y-auto h-64 shadow-lg rounded">
      <table class="mt-3 w-full border-collapse table-fixed">
        <tbody>
          <tr class="border-b">
            <th
              class="
                border-t-0 border-x-0
                py-3
                sm:py-4
                px-4
                lg:px-8
                text-xs text-left
                w-6/12
                lg:w-5/12
              "
            >
              <div
                class="
                  flex flex-col
                  lg:flex-row lg:justify-between lg:items-center
                "
              >
                <p
                  class="
                    font-semibold
                    mr-4
                    px-2
                    py-1
                    flex-shrink-0
                    self-start
                    bg-red-400
                    rounded
                    text-white
                    uppercase
                  "
                >
                  VTI
                </p>
                <p class="mt-2 lg:mt-0 flex-shrink truncate ...">
                  Vanguard Total Stock Market Index Fund ETF
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
                w-2/12
                lg:w-auto
              "
            >
              <span>$3,440</span>
            </td>
            <td
              class="
                border-t-0 border-x-0
                py-3
                sm:py-4
                px-0
                lg:px-6
                text-xs text-center
                w-3/12
                lg:w-auto
              "
            >
              <i class="fas fa-arrow-up text-emerald-500 mr-1"></i>
              <span>46.53%</span>
            </td>
          </tr>
          <tr class="border-b">
            <th
              class="
                border-t-0 border-x-0
                py-3
                sm:py-4
                px-4
                lg:px-8
                text-xs text-left
                w-6/12
                lg:w-5/12
              "
            >
              <div
                class="
                  flex flex-col
                  lg:flex-row lg:justify-between lg:items-center
                "
              >
                <p
                  class="
                    font-semibold
                    mr-4
                    px-2
                    py-1
                    flex-shrink-0
                    self-start
                    bg-red-400
                    rounded
                    text-white
                    uppercase
                  "
                >
                  VTI
                </p>
                <p class="mt-2 lg:mt-0 flex-shrink truncate ...">
                  Vanguard Total Stock Market Index Fund ETF
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
                w-2/12
                lg:w-auto
              "
            >
              <span>$3,440</span>
            </td>
            <td
              class="
                border-t-0 border-x-0
                py-3
                sm:py-4
                px-0
                lg:px-6
                text-xs text-center
                w-3/12
                lg:w-auto
              "
            >
              <i class="fas fa-arrow-up text-emerald-500 mr-1"></i>
              <span>46.53%</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- table -->
    <div
      class="
        flex flex-col
        break-words
        w-full
        my-6
        shadow-lg
        rounded
        border border-gray-100
      "
    >
      <!-- head -->
      <div class="rounded-t px-4 py-3 border-0 flex flex-wrap items-center">
        <div class="w-full px-4 max-w-full flex-1">
          <h3 class="font-semibold text-base text-blueGray-700">Watchlist</h3>
        </div>
        <slot name="see-all-btn"></slot>
      </div>

      <!-- body -->
      <div class="block w-full overflow-x-auto">
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
              <th
                class="
                  px-6
                  py-3
                  text-gray-700 text-center text-xs
                  uppercase
                  border-x-0
                  whitespace-nowrap
                  font-semibold
                  w-2/12
                  lg:w-auto
                "
              >
                Price
              </th>

              <th
                class="
                  px-6
                  py-3
                  text-gray-700 text-center text-xs
                  uppercase
                  border-x-0
                  whitespace-nowrap
                  font-semibold
                  w-3/12
                  lg:w-auto
                "
              >
                Change %
              </th>
              <th
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
              </th>
              <th class="w-1/12"></th>
            </tr>
          </thead>
          <tbody>
            <tr class="border-t">
              <th
                class="
                  border-t-0 border-x-0
                  py-3
                  sm:py-4
                  px-4
                  lg:px-8
                  text-xs text-left
                  w-6/12
                  lg:w-5/12
                "
              >
                <div
                  class="
                    flex flex-col
                    lg:flex-row lg:justify-between lg:items-center
                  "
                >
                  <p
                    class="
                      font-semibold
                      mr-4
                      px-2
                      py-1
                      flex-shrink-0
                      self-start
                      bg-red-400
                      rounded
                      text-white
                      uppercase
                    "
                  >
                    VTI
                  </p>
                  <p class="mt-2 lg:mt-0 flex-shrink truncate ...">
                    Vanguard Total Stock Market Index Fund ETF
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
                  w-2/12
                  lg:w-auto
                "
              >
                <span>$3,440</span>
              </td>
              <td
                class="
                  border-t-0 border-x-0
                  py-3
                  sm:py-4
                  px-0
                  lg:px-6
                  text-xs text-center
                  w-3/12
                  lg:w-auto
                "
              >
                <i class="fas fa-arrow-up text-emerald-500 mr-1"></i>
                <span>46.53%</span>
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
                <span>1,300</span>
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
                <a href="#" class="lg:text-lg text-gray-300">
                  <i class="fas fa-times"></i>
                </a>
              </td>
            </tr>
            <tr class="border-t">
              <th
                class="
                  border-t-0 border-x-0
                  py-3
                  sm:py-4
                  px-4
                  lg:px-8
                  text-xs text-left
                  w-6/12
                  lg:w-5/12
                "
              >
                <div
                  class="
                    flex flex-col
                    lg:flex-row lg:justify-between lg:items-center
                  "
                >
                  <p
                    class="
                      font-semibold
                      mr-4
                      px-2
                      py-1
                      flex-shrink-0
                      self-start
                      bg-red-400
                      rounded
                      text-white
                      uppercase
                    "
                  >
                    VTI
                  </p>
                  <p class="mt-2 lg:mt-0 flex-shrink truncate ...">
                    Vanguard Total Stock Market Index Fund ETF
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
                  w-2/12
                  lg:w-auto
                "
              >
                <span>$3,440</span>
              </td>
              <td
                class="
                  border-t-0 border-x-0
                  py-3
                  sm:py-4
                  px-0
                  lg:px-6
                  text-xs text-center
                  w-3/12
                  lg:w-auto
                "
              >
                <i class="fas fa-arrow-up text-emerald-500 mr-1"></i>
                <span>46.53%</span>
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
                <span>1,300</span>
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
                <a href="#" class="lg:text-lg text-gray-300">
                  <i class="fas fa-times"></i>
                </a>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <form
      @submit.prevent="add"
      class="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-4"
      novalidate
    >
      outside: {{ inputTicker1 }}
      <!-- <NewInputTicker
        v-model="inputTicker1"
        @getInputValidity="getInputValidity"
        ref="inputTickerRef1"
      /> -->
      <NewInputTicker
        :modelValue="inputTicker1"
        @input="inputTicker1 = $event.target.value"
        @getInputValidity="getInputValidity"
        ref="inputTickerRef1"
      />

      <!-- Vue3 文件寫法 -->
      <InputTicker
        v-model="inputTicker"
        @getInputValidity="getInputValidity"
        ref="inputTickerRef"
      />

      <InputCost
        v-model="inputCost"
        @getInputValidity="getInputValidity"
        ref="inputCostRef"
      />

      <InputShares
        v-model="inputShares"
        @getInputValidity="getInputValidity"
        ref="inputSharesRef"
      />

      <button
        type="submit"
        class="
          border-gray-600 border
          px-4
          py-3
          rounded-full
          text-center
          disabled:bg-gray-200
          disabled:text-gray-400
          disabled:cursor-not-allowed
        "
        :disabled="!checkFormValidity"
      >
        add
      </button>
      checkFormValidity: {{ checkFormValidity }}
    </form>
  </main>
</template>

<script>
import InputTicker from "@/components/forms/InputTicker.vue";
import NewInputTicker from "@/components/forms/NewInputTicker.vue";
import InputCost from "@/components/forms/InputCost.vue";
import InputShares from "@/components/forms/InputShares.vue";
import { ref, computed } from "vue";
export default {
  components: { NewInputTicker, InputTicker, InputCost, InputShares },
  setup() {
    const inputTicker1 = ref(null);
    const inputTicker = ref(null);
    const inputCost = ref(null);
    const inputShares = ref(null);

    const inputTickerRef1 = ref(null);
    const inputTickerRef = ref(null);
    const inputCostRef = ref(null);
    const inputSharesRef = ref(null);

    const inputValidity = ref({
      ticker: null,
      cost: null,
      shares: null,
    });

    const getInputValidity = (obj) => {
      inputValidity.value[obj.name] = obj.validity;
    };
    const checkFormValidity = computed(() => {
      console.log("inputValidity", inputValidity.value);

      for (let i in inputValidity.value) {
        if (!inputValidity.value[i]) return false;
      }
      return true;
    });

    function add() {
      const tickerValidity = inputTickerRef.value.tickerRef.checkValidity();
      const costValidity = inputCostRef.value.costRef.checkValidity();
      const sharesValidity = inputSharesRef.value.sharesRef.checkValidity();

      console.log("tickerValidity", tickerValidity);
      console.log("costValidity", costValidity);
      console.log("sharesValidity", sharesValidity);

      console.log(
        "final",
        tickerValidity &&
          costValidity &&
          sharesValidity &&
          inputTicker.value !== null &&
          inputCost.value !== null &&
          inputShares.value !== null
      );
    }

    return {
      add,

      getInputValidity,
      checkFormValidity,

      inputTickerRef1,
      inputTickerRef,
      inputCostRef,
      inputSharesRef,

      inputTicker1,
      inputTicker,
      inputCost,
      inputShares,
    };
  },
};
</script>