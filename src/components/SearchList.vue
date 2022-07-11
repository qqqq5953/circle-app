<template>
  <div class="overflow-y-auto shadow-lg rounded" v-if="serachList?.length">
    <table class="mt-3 w-full border-collapse table-fixed">
      <slot name="thead"></slot>
      <tbody>
        <tr class="border-b" v-for="item in serachList" :key="item.ticker">
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
                {{ item.ticker }}
              </p>
              <p class="mt-2 lg:mt-0 flex-shrink truncate ...">
                {{ item.name }}
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
            <span>{{ item.price }}</span>
          </td>
          <td
            class="
              border-t-0 border-x-0
              py-3
              sm:py-4
              px-0
              lg:px-6
              text-xs
              w-3/12
              lg:w-auto
            "
          >
            <div
              class="flex items-center justify-center gap-2"
              :class="
                item.previousCloseChange > 0 ? 'text-green-600' : 'text-red-600'
              "
            >
              <i
                class="fas fa-arrow-up"
                v-if="item.previousCloseChange > 0"
              ></i>
              <i class="fas fa-arrow-down" v-else></i>
              <span>({{ item.previousCloseChangePercent }} %)</span>
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
            "
          >
            <span
              :class="
                item.previousCloseChange > 0 ? 'text-green-600' : 'text-red-600'
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
          >
            <a
              href="#"
              class="lg:text-lg text-gray-300"
              @click.prevent="addToWatchlist(item.ticker, item.name)"
            >
              <i class="fas fa-plus"></i>
            </a>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import useAxios from "@/composables/useAxios.js";
import { ref, watch, computed } from "vue";

export default {
  props: {
    result: {
      type: Array,
      default: null,
    },
  },
  setup(props, { emit }) {
    const serachList = computed(() => {
      if (!props.result?.length) return;

      const lastIndex = props.result.length - 1;
      const final = props.result[lastIndex];

      // console.log("props.result", props.result);
      // console.log("lastIndex", lastIndex);
      console.log("final", [final]);

      return [final];
    });

    function addToWatchlist(ticker, name) {
      const { data, error, loading } = useAxios("/api/addToWatchlist", "post", {
        ticker,
        name,
      });

      watch(data, (newData) => {
        console.log("addToWatchlist", newData);

        emit("getWatchlist");
      });
    }

    return {
      addToWatchlist,
      serachList,
    };
  },
};
</script>