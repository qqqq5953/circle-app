<template>
  <section class="border rounded p-3 text-sm">
    <h2 class="text-2xl mb-2">Profile</h2>
    <ul>
      <li class="relative pb-3">
        <input class="hidden peer" id="Summary" type="checkbox" />
        <label
          class="flex justify-between items-center text-slate-600 cursor-pointer peer-checked:[&>i]:rotate-180"
          for="Summary"
          @click="toggleProfileSummary"
        >
          <h3>Summary</h3>
          <i
            v-if="isChevronShow"
            class="fa-solid fa-chevron-down transition-transform duration-200 ease-in-out"
          ></i>
        </label>

        <div
          class="pt-2 font-light"
          :class="
            isSummaryShow || !isChevronShow
              ? 'h-auto overflow-visible'
              : 'h-[200px] lg:h-[120px] overflow-hidden'
          "
        >
          <p class="text-slate-600 font-extralight" ref="profileSummary">
            {{ stock.profile?.longBusinessSummary }}
          </p>
        </div>

        <div
          v-if="!isSummaryShow"
          class="absolute z-10 rounded w-full h-1 bottom-2.5"
          style="backdrop-filter: blur(1.5px)"
        ></div>
      </li>
      <template v-if="stock.price?.quoteType === 'Equity'">
        <li
          class="flex items-center justify-between py-3"
          :class="{ 'border-t': stock.price?.quoteType === 'Equity' }"
        >
          <span class="text-slate-600">Website</span>
          <span class="text-right font-medium">
            <a
              class="hover:underline text-blue-600"
              :href="stock.profile?.website"
              target="blank"
              >{{ stock.profile?.website.split("www.")[1] }}
            </a>
          </span>
        </li>
        <li class="flex items-center justify-between py-3 border-t">
          <span class="text-slate-600">Address</span>
          <span class="text-right font-medium">{{
            stock.profile?.address
          }}</span>
        </li>
        <li
          class="flex items-center justify-between py-3 border-t"
          v-if="stock.profile?.fullTimeEmployees"
        >
          <span class="text-slate-600">Employees</span>
          <span class="text-right font-medium">{{
            stock.profile?.fullTimeEmployees
          }}</span>
        </li>
      </template>
    </ul>
  </section>
</template>

<script>
import { ref, nextTick } from "vue";
export default {
  props: {
    stock: Object,
  },
  emits: ["toggleProfileSummary"],
  setup(_, { emit }) {
    const isChevronShow = ref(false);
    const isSummaryShow = ref(false);

    const profileSummary = ref(null);
    const profileSummaryHeight = ref(null);
    const profileSummaryMaxHeight = ref(200);

    const toggleProfileSummary = async () => {
      isSummaryShow.value = !isSummaryShow.value;
      await nextTick();
      emit("toggleProfileSummary", isSummaryShow.value);
    };

    function adjustSummaryHeight() {
      profileSummaryHeight.value = profileSummary.value?.offsetHeight;
      isChevronShow.value =
        profileSummary.value?.offsetHeight > profileSummaryMaxHeight.value;
    }

    return {
      isChevronShow,
      isSummaryShow,
      profileSummary,
      toggleProfileSummary,
      adjustSummaryHeight,
    };
  },
};
</script>