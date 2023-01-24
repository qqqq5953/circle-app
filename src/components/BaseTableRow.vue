<template>
  <tr
    :class="{
      'border-t': isMultiRows,
      'update-animation': isUpdate && enableUpdate(item.tempTicker),
      'hover:bg-slate-100': hasRouterLink,
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
        lg:pl-8 lg:pr-0
        text-xs text-left
        w-5/12
      "
    >
      <router-link
        v-if="hasRouterLink"
        :class="hasRouterLink ? 'hover:cursor-pointer' : 'hover:cursor-auto'"
        :to="routeParam(item.ticker)"
      >
        <TickerAndName
          :style="item.style"
          :ticker="item.ticker"
          :name="item.name"
        />
      </router-link>
      <TickerAndName
        v-else
        :style="item.style"
        :ticker="item.ticker"
        :name="item.name"
      />
    </th>
    <td class="watchlistTable-table-cell text-right py-3 md:w-[10%] lg:w-auto">
      <span class="mr-px">$</span>
      <span>{{ new Intl.NumberFormat("en").format(item.price) }}</span>
    </td>
    <td
      class="
        watchlistTable-table-cell
        font-medium
        w-[30%]
        md:w-1/6
        lg:w-1/5
        xl:w-1/6
      "
    >
      <div class="flex m-auto">
        <div
          class="flex items-center gap-2 mx-auto md:mr-0 px-3 py-2 rounded"
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
        watchlistTable-table-cell
        px-3
        text-right
        font-medium
        hidden
        md:table-cell md:w-[12%]
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
        >{{ item.previousCloseChange }}1</span
      >
    </td>
    <slot name="optional-td" :ticker="`${item.ticker}`"></slot>
  </tr>
</template>

<script setup>
import { ref, inject, watch, h } from "vue";

const props = defineProps({
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
});

const TickerAndName = (props) => {
  const Ticker = h(
    "p",
    {
      class: `ticker-badge ${props.style}`,
      style: props.ticker.length >= 9 ? "font-size:10px" : null,
    },
    props.ticker
  );
  const Name = h("p", { class: "md:grow mt-2 md:mt-0 truncate" }, props.name);

  return h(
    "div",
    {
      class: "flex flex-col md:flex-row md:items-center md:gap-x-3",
    },
    [Ticker, Name]
  );
};

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

const routeParam = (ticker) => {
  return {
    name: hasRouterLink.value ? "StockInfo" : "Holdings1",
    params: { ticker },
  };
};

// export default {
//   props: {
//     toStockInfo: {
//       type: Boolean,
//       default: false,
//     },
//     isMultiRows: {
//       type: Boolean,
//       default: false,
//     },
//     isUpdate: {
//       type: Boolean,
//       default: false,
//     },
//     updatedTickers: {
//       type: Array,
//       default() {
//         return [];
//       },
//     },
//     stockLists: {
//       type: Array,
//     },
//   },
//   setup(props) {
//     const render = () => {
//       return h("p", [], "test");
//     };

//     const updatedTarget = ref([]);

//     const enableUpdate = (tempTicker) => {
//       return updatedTarget.value.indexOf(tempTicker) !== -1;
//     };

//     watch(
//       () => props.updatedTickers,
//       (ticker) => {
//         updatedTarget.value = ticker;
//         setTimeout(() => {
//           updatedTarget.value.length = 0;
//         }, 1000);
//       },
//       { deep: true }
//     );

//     const hasRouterLink = ref(null);
//     const injectParam = inject("toStockInfo", false);
//     hasRouterLink.value = props.toStockInfo || injectParam;

//     const routeParam = (ticker) => {
//       return {
//         name: hasRouterLink.value ? "StockInfo" : "Holdings1",
//         params: { ticker },
//       };
//     };

//     return {
//       hasRouterLink,
//       enableUpdate,
//       routeParam,
//       render,
//     };
//   },
// };
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
