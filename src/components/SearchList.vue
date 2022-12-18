<template>
  <div class="shadow-lg rounded bg-white">
    <table class="w-full border-collapse table-fixed">
      <tbody>
        <tr
          class="hover:bg-slate-100"
          v-for="item in searchList"
          :key="item.ticker"
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
            <div
              class="
                flex flex-col
                md:flex-row md:items-center md:gap-x-3
                hover:cursor-pointer
                relative
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
              <div class="absolute w-full h-full">
                <slot
                  name="to-info-page"
                  :ticker="`${item.ticker}`"
                  :tempTicker="`${item.tempTicker}`"
                ></slot>
              </div>
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
              text-xs
              font-medium
              w-3/12
              xl:w-auto
            "
          >
            <div class="flex m-auto">
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
                "
                :class="
                  item.previousCloseChange > 0
                    ? 'text-red-600 bg-red-100/70'
                    : 'text-green-700 bg-green-100'
                "
              >
                <i
                  class="fas fa-arrow-up"
                  v-if="item.previousCloseChange > 0"
                ></i>
                <i class="fas fa-arrow-down" v-else></i>
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
              sm:py-4
              px-0
              lg:px-6
              text-xs text-center
              hidden
              lg:table-cell lg:w-auto
              font-medium
            "
          >
            <span
              :class="
                item.previousCloseChange > 0 ? 'text-red-600' : 'text-green-700'
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
            <slot name="add-btn" :ticker="`${item.ticker}`"></slot>
          </td>
        </tr>
      </tbody>
    </table>
    <div class="px-4 py-3 lg:px-8 lg:py-5" v-show="searchList === undefined">
      <i class="fa-solid fa-circle-exclamation"></i>
      <span class="ml-3">The ticker does not exist</span>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    searchList: {
      type: Array,
    },
  },
};
</script>