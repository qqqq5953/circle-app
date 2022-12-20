<template>
  <table class="w-full border-collapse table-fixed">
    <slot name="thead"></slot>
    <tbody>
      <BaseTableRow
        :stockLists="stockLists"
        :updatedTickers="updatedTickers"
        :isMultiRows="true"
        :isUpdate="true"
        :toStockInfo="true"
      >
        <template #optional-td="{ ticker }" v-if="hasOptionalTd">
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
            <slot name="action-btn" :ticker="`${ticker}`"></slot>
          </td>
        </template>
      </BaseTableRow>
    </tbody>
  </table>
</template>

<script>
import { ref, inject } from "vue";
import BaseTableRow from "@/components/BaseTableRow.vue";
export default {
  components: { BaseTableRow },
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
    hasOptionalTd: {
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
    const hasRouterLink = ref(null);
    const injectParam = inject("toStockInfo", false);
    hasRouterLink.value = props.toStockInfo || injectParam;
    // console.log("props.toStockInfo", props.toStockInfo);
    // console.log("injectParam", injectParam);
    // console.log("hasRouterLink", hasRouterLink.value);

    return {
      hasRouterLink,
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