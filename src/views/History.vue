<template>
  <main class="px-4 md:p-10 mx-auto w-full">
    <HoldingTable>
      <template #table-title>
        <h3 class="font-semibold text-base text-blueGray-700">History</h3>
      </template>
      <template #thead-price>
        <th
          class="
            px-0
            py-3
            text-blueGray-500
            align-middle
            text-xs
            uppercase
            font-semibold
            text-center
          "
        >
          Price
        </th>
      </template>
      <template #tbody-price>
        <td
          class="
            border-t-0 border-l-0
            py-3
            px-5
            border-r-0
            text-xs
            whitespace-nowrap
            flex
            items-center
            sm:table-cell
          "
        >
          <span class="sm:hidden font-semibold mr-2">Price:</span>
          <p class="ml-auto text-center">1,200</p>
        </td>
      </template>
    </HoldingTable>
  </main>
</template>

<script>
import HoldingTable from "@/components/HoldingTable.vue";
// import Card from '@/components/Card.vue';
export default {
  components: {
    HoldingTable,
  },
};
</script>
