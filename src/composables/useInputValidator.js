import { ref, watch } from 'vue'

export default function ({
  modelValue,
  DOM,
  regex,
  replaceCharacter,
  validators
}) {
  const inputError = ref([])
  const inputValue = ref(modelValue)
  const inputValidity = ref({ name: null, validity: null })

  watch(inputValue, (newValue, oldValue) => {
    const isPatternMatch = regex.test(newValue)
    const newSubstr = oldValue || ''

    // 欄位 reset 為 null 時
    if (newValue === null) return resetErrorAndValidity()

    if (!isPatternMatch && replaceCharacter) {
      inputValue.value = newValue.replace(replaceCharacter, newSubstr)
    }

    inputError.value = validators.map((validator) =>
      validator({
        isPatternMatch,
        inputValue: newValue,
        ref: DOM.value
      })
    )

    inputValidity.value.name = DOM.value?.name
    inputValidity.value.validity = DOM.value?.checkValidity()
  })

  function resetErrorAndValidity() {
    inputValidity.value.name = DOM.value.name
    inputValidity.value.validity = false
    inputError.value.length = 0
    DOM.value.setCustomValidity('')
  }

  return {
    inputError,
    inputValue,
    inputValidity
  }
}
