<template>
  <div class="md:container mx-auto w-full">
    <!-- Header -->
    <header class="relative bg-sky-600 pb-32 pt-10">
      <div class="px-4 md:px-10 mx-auto w-full outline-white">
        <Overview></Overview>
      </div>
    </header>
    <!-- 圖表區 -m-24-->
    <main class="px-4 md:px-10 mx-auto w-full -m-24">
      <!-- Charts -->
      <section class="flex flex-wrap">
        <!-- <LineChart></LineChart>
        <BarChart></BarChart> -->
      </section>
      <!-- Tables -->
      <section class="flex flex-wrap xl:mt-4">
        <div
          class="
            w-full
            xl:w-7/12
            mb-12
            xl:mb-0
            px-4
            md:px-0
            lg:px-4
            bg-gray-400
          "
        >
          <HoldingTable>
            <template #table-title>
              <h3 class="font-semibold text-base text-blueGray-700">
                Holdings
              </h3>
            </template>
            <template #see-all-btn>
              <div
                class="w-full px-4 max-w-full flex-1 text-right outline-black"
              >
                <router-link
                  :to="{ name: 'Holdings' }"
                  class="
                    bg-indigo-500
                    text-white
                    active:bg-indigo-600
                    text-xs
                    font-bold
                    uppercase
                    px-3
                    py-1
                    rounded
                    outline-none
                    focus:outline-none
                    mr-1
                  "
                  style="transition: all 0.15s ease"
                >
                  See all
                </router-link>
              </div>
            </template>
            <template #thead-price>
              <th
                class="
                  px-4
                  py-3
                  text-blueGray-500
                  align-middle
                  text-xs
                  uppercase
                  font-semibold
                  text-center
                  sm:text-right
                "
              >
                Price
              </th>
            </template>
            <template #tbody-price>
              <td
                class="
                  px-4
                  pt-5
                  pb-0
                  border-b border-gray-100
                  sm:border-0
                  text-xs
                  whitespace-nowrap
                  flex
                  items-center
                  sm:table-cell
                "
              >
                <span class="sm:hidden font-semibold mr-2">Price:</span>
                <p class="ml-auto text-right">1,200</p>
              </td>
            </template>
          </HoldingTable>
        </div>
        <div class="w-full xl:w-5/12 px-4 md:px-0 lg:px-4 bg-gray-300">
          <TopThreePerformace>
            <template #see-all-btn>
              <div
                class="
                  relative
                  w-full
                  px-4
                  max-w-full
                  flex-grow flex-1
                  text-right
                "
              >
                <router-link
                  :to="{ name: 'Holdings' }"
                  class="
                    bg-indigo-500
                    text-white
                    active:bg-indigo-600
                    text-xs
                    font-bold
                    uppercase
                    px-3
                    py-1
                    rounded
                    outline-none
                    focus:outline-none
                    mr-1
                    mb-1
                  "
                  style="transition: all 0.15s ease"
                >
                  See all
                </router-link>
              </div>
            </template>
          </TopThreePerformace>
        </div>
      </section>
    </main>
  </div>
</template>

<script>
import Overview from "@/components/Overview.vue";
// import LineChart from '@/components/LineChart.vue';
// import BarChart from '@/components/BarChart.vue';
import HoldingTable from "@/components/HoldingTable.vue";
import TopThreePerformace from "@/components/TopThreePerformace.vue";
export default {
  components: {
    Overview,
    // LineChart,
    // BarChart,
    HoldingTable,
    TopThreePerformace,
  },
};
</script>
