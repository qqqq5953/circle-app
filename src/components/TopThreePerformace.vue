<template>
  <div
    class="flex flex-col min-w-0 break-words w-full mb-6 shadow-lg rounded bg-white h-full"
  >
    <div class="rounded-t mb-0 px-4 py-3 border-0">
      <div class="flex flex-wrap items-center">
        <div class="relative w-full px-1 max-w-full flex-grow flex-1">
          <h3 class="font-semibold text-base text-blueGray-700">
            Top 3 performance
          </h3>
        </div>
        <slot name="see-all-btn"></slot>
      </div>
    </div>
    <div class="block w-full overflow-x-auto pb-5">
      <table class="items-center w-full bg-transparent border-collapse">
        <thead class="bg-gray-100 border-t border-b">
          <tr>
            <th
              class="pl-6 py-3 text-xs uppercase whitespace-nowrap font-semibold text-left"
            >
              Stocks
            </th>
            <th
              class="px-4 py-3 text-xs uppercase whitespace-nowrap font-semibold text-right"
            >
              P / L%
            </th>
            <th
              class="px-4 py-3 text-xs uppercase whitespace-nowrap font-semibold text-right"
            >
              Shares
            </th>
            <th
              class="pr-6 py-3 text-xs uppercase whitespace-nowrap font-semibold text-right"
            >
              Pct. %
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th
              class="pt-7 pb-0 pl-6 border-t-0 border-x-0 text-xs whitespace-nowrap text-left"
            >
              <span>argon</span>
            </th>
            <td
              class="pt-7 pb-0 px-4 border-t-0 border-x-0 text-xs whitespace-nowrap text-right"
            >
              1,480
            </td>
            <td
              class="pt-7 pb-0 px-4 border-t-0 border-x-0 text-xs whitespace-nowrap text-right"
            >
              1,200
            </td>
            <td
              class="pt-7 pb-0 pr-6 border-t-0 border-x-0 text-xs whitespace-nowrap text-right"
            >
              60%
            </td>
          </tr>
          <tr>
            <th
              class="pt-7 pb-0 pl-6 border-t-0 border-x-0 text-xs whitespace-nowrap text-left"
            >
              <span>argon</span>
            </th>
            <td
              class="pt-7 pb-0 px-4 border-t-0 border-x-0 text-xs whitespace-nowrap text-right"
            >
              1,480
            </td>
            <td
              class="pt-7 pb-0 px-4 border-t-0 border-x-0 text-xs whitespace-nowrap text-right"
            >
              1,200
            </td>
            <td
              class="pt-7 pb-0 pr-6 border-t-0 border-x-0 text-xs whitespace-nowrap text-right"
            >
              60%
            </td>
          </tr>
          <tr>
            <th
              class="pt-7 pb-0 pl-6 border-t-0 border-x-0 text-xs whitespace-nowrap text-left"
            >
              <span>argon</span>
            </th>
            <td
              class="pt-7 pb-0 px-4 border-t-0 border-x-0 text-xs whitespace-nowrap text-right"
            >
              1,480
            </td>
            <td
              class="pt-7 pb-0 px-4 border-t-0 border-x-0 text-xs whitespace-nowrap text-right"
            >
              1,200
            </td>
            <td
              class="pt-7 pb-0 pr-6 border-t-0 border-x-0 text-xs whitespace-nowrap text-right"
            >
              60%
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
