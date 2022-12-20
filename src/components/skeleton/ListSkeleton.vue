<template>
  <!-- h-full -->
  <div
    class="
      flex flex-col
      break-words
      w-full
      shadow-lg
      rounded
      border border-gray-100
      animate-pulse
    "
  >
    <!-- table title -->
    <slot name="table-title"></slot>

    <!-- body -->
    <div class="block w-full overflow-x-auto">
      <table class="w-full border-collapse">
        <tbody class="bg-white">
          <tr v-for="tr in tableBody.tr" :key="tr">
            <th
              class="
                border-t-0 border-x-0
                py-3
                sm:py-4
                px-3
                lg:px-8
                text-xs text-left
                w-5/12
                lg:w-5/12
              "
              v-for="th in tableBody.th"
              :key="th"
            >
              <div class="flex flex-col md:flex-row md:items-center md:gap-x-3">
                <p
                  class="
                    md:w-2/5
                    max-w-[80px]
                    px-1
                    py-1
                    shrink-0
                    rounded-full
                    bg-gray-300
                    h-6
                  "
                ></p>
                <p
                  class="w-full md:w-3/5 h-4 mt-2 md:mt-0 bg-gray-300 rounded"
                ></p>
              </div>
            </th>
            <td
              class="
                border-t-0 border-x-0
                py-3
                sm:py-4
                px-2
                lg:px-6
                text-xs text-center
                w-2/12
                lg:w-auto
              "
              v-for="td in tableBody.td"
              :key="td"
            >
              <p class="w-full h-5 bg-gray-300 rounded"></p>
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
    tableBody: {
      type: Object,
      default() {
        return { tr: 1, th: 1, td: 3 };
      },
    },
  },
};
</script>