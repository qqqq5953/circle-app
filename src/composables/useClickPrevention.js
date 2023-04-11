import { ref } from 'vue'

export function useClickPrevention(delay = 1000) {
  const isClickDisabled = ref(false)

  function preventMultipleClicks() {
    isClickDisabled.value = true
    setTimeout(() => {
      isClickDisabled.value = false
    }, delay)
  }

  return {
    isClickDisabled,
    preventMultipleClicks
  }
}
