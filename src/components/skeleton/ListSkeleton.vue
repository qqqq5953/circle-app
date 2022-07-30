<template>
  <!-- h-full -->
  <div
    class="
      flex flex-col
      break-words
      w-full
      shadow-lg
      rounded
      bg-white
      border border-gray-100
      animate-pulse
    "
  >
    <!-- table title -->
    <slot name="table-title"></slot>

    <!-- body -->
    <div class="block w-full overflow-x-auto">
      <table class="w-full border-collapse">
        <thead
          class="bg-gray-100 border-t border-b hidden lg:table-header-group"
          v-if="tableContent.tableHead.hasTableHead"
        >
          <tr>
            <!-- Stocks -->
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
              {{ tableContent.tableHead.th }}
            </th>
            <td
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
              v-for="item in tableContent.tableHead.td"
              :key="item"
            >
              {{ item }}
            </td>

            <td class="px-4 py-3 md:hidden lg:block"></td>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in tableContent.tableBody.tr" :key="item">
            <th
              class="
                border-t-0 border-x-0
                py-3
                sm:py-5
                px-4
                lg:px-8
                text-xs text-left
                w-6/12
                lg:w-5/12
              "
              v-for="item in tableContent.tableBody.th"
              :key="item"
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
                    w-7
                    h-6
                    bg-gray-300
                    rounded
                    text-white
                  "
                ></p>
                <p class="w-full h-5 mt-2 lg:mt-0 bg-gray-300 rounded"></p>
              </div>
            </th>
            <td
              class="
                border-t-0 border-x-0
                py-3
                sm:py-5
                px-2
                lg:px-6
                text-xs text-center
                w-2/12
                lg:w-auto
              "
              v-for="item in tableContent.tableBody.td"
              :key="item"
            >
              <p class="w-full h-5 bg-gray-300 rounded"></p>
            </td>
            <td
              class="
                border-t-0 border-x-0
                py-3
                sm:py-5
                pr-3
                lg:pr-4
                text-xs text-center
                w-1/12
                hidden
                lg:table-cell
              "
            >
              <p class="w-full h-5 bg-gray-300 rounded"></p>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    tableContent: Object,
  },
  setup() {},
};
</script>