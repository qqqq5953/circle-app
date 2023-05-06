<template>
  <div>
    <input
      name="date"
      type="date"
      class="appearance-none border border-slate-300 block px-4 py-3 rounded w-full text-sm text-center focus:outline-0 invalid:border-red-400 invalid:border valid:focus:outline-blue-300/60 valid:focus:outline-2"
      min="2022-01-01"
      ref="dateRef"
      disabled
      v-model="inputValue"
    />
    <ErrorDisplay :errors="inputError" v-if="hasError" />
    inputValue null:{{ inputValue === null }}
    <br />
    inputValue string :{{ inputValue === "" }}
  </div>
</template>

<script>
import { ref, watch, defineAsyncComponent, computed } from "vue";
import { isValidDate } from "@/modules/validators";
import useInputValidator from "@/composables/useInputValidator";
import useHoldingStore from "@/stores/holdingStore.js";
import { storeToRefs } from "pinia";

export default {
  components: {
    ErrorDisplay: defineAsyncComponent(() =>
      import("@/components/ErrorDisplay.vue")
    ),
  },
  props: {
    modelValue: {
      type: String,
    },
    code: {
      type: String,
    },
  },
  setup(props, { emit }) {
    const dateRef = ref(null);
    const regex = /^\d{4}\-(0[1-9]|1[0-2])\-(0[1-9]|[1-2][0-9]|3[0-1])$/;

    const params = {
      validators: [isValidDate],
      modelValue: props.modelValue,
      DOM: dateRef,
      regex,
    };

    const { inputError, inputValue, inputValidity } = useInputValidator(params);

    const hasError = computed(() =>
      inputError.value.some((error) => error !== "")
    );

    watch(
      inputValidity,
      (newValidity) => emit("setInputValidity", newValidity),
      { deep: true }
    );

    // 檢查國定假日
    const $holdingStore = useHoldingStore();
    const { holidaysRes } = storeToRefs($holdingStore);
    const countryHolidays = computed(() => {
      if (!holidaysRes.value.result || !props.code) return;
      return holidaysRes.value.result[props.code];
    });

    watch(inputValue, (inputDate) => {
      if (!inputDate) return;

      try {
        setLessThanMinErrorMsg(inputDate);
        setHolidayErrorMsg(inputDate);
        setExceedMaxErrorMsg(inputDate);
      } catch (error) {
        // 第一次打開 TradePanel 時 countryHolidays.value 還沒好
        let count = 0;
        const timeId = setInterval(() => {
          if (countryHolidays.value || count === 10) {
            setHolidayErrorMsg(inputDate);
            clearInterval(timeId);
          }
          count++;
        }, 500);
      }
    });

    function setExceedMaxErrorMsg(isoDate) {
      const selectedUnix = new Date(isoDate).getTime();
      const maxDate = new Date(dateRef.value.max).getTime();
      if (selectedUnix > maxDate) {
        setErrorMsg("Must not select date after today");
      }
    }

    function setLessThanMinErrorMsg(isoDate) {
      const year = new Date(isoDate).getFullYear();
      if (year !== 2023) {
        setErrorMsg("Year must be 2023");
      }
    }

    function setHolidayErrorMsg(isoDate) {
      if (!countryHolidays.value) return;
      const hasHoliday = countryHolidays.value[isoDate];
      if (!hasHoliday) return;

      const day = new Date(isoDate).getDay();
      const isWeekend = [0, 6].includes(day);
      if (isWeekend) return;
      setErrorMsg("Must not select national holiday");
    }

    function setErrorMsg(msg) {
      dateRef.value.setCustomValidity(msg);
      inputValidity.value.name = dateRef.value?.name;
      inputValidity.value.validity = false;
      inputError.value.length = 0;
      inputError.value.push(msg);
    }

    return {
      dateRef,
      inputError,
      inputValue,
      hasError,
    };
  },
};
</script>

<style scoped>
input[type="date"] {
  appearance: none;
  -webkit-appearance: none;
}
</style>