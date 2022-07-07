<template>
  <!-- h-full -->
  <div
    class="
      flex flex-col
      break-words
      w-full
      mb-6
      shadow-lg
      rounded
      bg-white
      border border-gray-100
      animate-pulse
    "
  >
    <!-- body -->
    <div class="block w-full overflow-x-auto">
      <table class="w-full border-collapse">
        <thead
          class="bg-gray-100 border-t border-b hidden sm:table-header-group"
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
          <tr
            class="flex flex-col sm:table-row mx-2 mb-3 rounded"
            v-for="item in tableContent.tableBody.tr"
            :key="item"
          >
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
              v-for="item in tableContent.tableBody.th"
              :key="item"
            >
              <p class="w-full h-3 bg-gray-300 rounded"></p>
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
              v-for="item in tableContent.tableBody.td"
              :key="item"
            >
              <span class="sm:hidden font-semibold mr-2">P / L:</span>
              <p class="w-full h-3 bg-gray-300 rounded"></p>
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