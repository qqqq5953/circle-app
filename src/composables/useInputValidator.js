import { ref, watch } from 'vue'

export default function (modelValue, DOM, regex, replaceCharacter, validators) {
  const inputError = ref(null)
  const inputTicker = ref(modelValue)
  const emitObj = ref({ name: null, validity: null })

  watch(inputTicker, (newValue) => {
    const isPatternMatch = regex.test(newValue)

    if (!isPatternMatch) {
      inputTicker.value = newValue.replace(replaceCharacter, '')
    }

    inputError.value = validators.map((validator) =>
      validator(isPatternMatch, DOM.value, newValue)
    )

    emitObj.value.name = DOM.value?.name
    emitObj.value.validity = DOM.value?.checkValidity()
  })

  return {
    inputError,
    inputTicker,
    emitObj
  }
}
