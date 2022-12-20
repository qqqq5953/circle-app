<template>
  <tr
    class="hover:bg-slate-100"
    :class="{
      'border-t': isMultiRows,
      'update-animation': isUpdate && enableUpdate(item.tempTicker),
    }"
    v-for="item in stockLists"
    :key="item.ticker"
  >
    <th
      class="
        border-t-0 border-x-0
        py-3
        sm:py-3.5
        px-4
        lg:px-8
        text-xs text-left
        w-5/12
      "
    >
      <router-link
        class="flex flex-col md:flex-row md:items-center md:gap-x-3"
        :class="hasRouterLink ? 'hover:cursor-pointer' : 'hover:cursor-auto'"
        :to="
          hasRouterLink
            ? {
                name: 'stockInfo',
                params: {
                  ticker: item.ticker,
                  tempTicker: item.tempTicker,
                },
              }
            : {}
        "
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
        sm:py-3.5
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
        sm:py-3.5
        px-0
        lg:px-6
        text-xs
        font-medium
        w-3/12
        xl:w-auto
      "
    >
      <div class="flex m-auto">
        <div
          class="flex items-center gap-2 m-auto px-3 py-2 rounded font-medium"
          :class="
            item.previousCloseChange > 0
              ? 'text-red-600 bg-red-100/70'
              : item.previousCloseChange < 0
              ? 'text-green-700 bg-green-100'
              : 'text-slate-500 bg-slate-200'
          "
        >
          <i class="fas fa-arrow-up" v-if="item.previousCloseChange > 0"></i>
          <i
            class="fas fa-arrow-down"
            v-else-if="item.previousCloseChange < 0"
          ></i>
          <span v-else>--</span>
          <span
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
        sm:py-3.5
        px-0
        text-xs text-center
        hidden
        lg:table-cell lg:w-auto
        font-medium
      "
    >
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
    <slot name="optional-td" :ticker="`${item.ticker}`"></slot>
  </tr>
</template>

<script>
import { ref, inject, watch } from "vue";
export default {
  props: {
    toStockInfo: {
      type: Boolean,
      default: false,
    },
    isMultiRows: {
      type: Boolean,
      default: false,
    },
    isUpdate: {
      type: Boolean,
      default: false,
    },
    updatedTickers: {
      type: Array,
      default() {
        return [];
      },
    },
    stockLists: {
      type: Array,
    },
  },
  setup(props) {
    const updatedTarget = ref([]);

    const enableUpdate = (tempTicker) => {
      return updatedTarget.value.indexOf(tempTicker) !== -1;
    };

    watch(
      () => props.updatedTickers,
      (ticker) => {
        updatedTarget.value = ticker;
        setTimeout(() => {
          updatedTarget.value.length = 0;
        }, 1000);
      },
      { deep: true }
    );

    const hasRouterLink = ref(null);
    const injectParam = inject("toStockInfo", false);
    hasRouterLink.value = props.toStockInfo || injectParam;
    // console.log("props.toStockInfo", props.toStockInfo);
    // console.log("injectParam", injectParam);
    // console.log("hasRouterLink", hasRouterLink.value);

    return {
      hasRouterLink,
      enableUpdate,
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
</style>
