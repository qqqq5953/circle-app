import { ref, watch } from 'vue'

export default function (modelValue, DOM, regex, replaceCharacter, validators) {
  const inputError = ref([])
  const inputValue = ref(modelValue)
  const inputValidity = ref({ name: null, validity: null })

  watch(inputValue, (newValue) => {
    const isPatternMatch = regex.test(newValue)

    if (!isPatternMatch) {
      inputValue.value = newValue.replace(replaceCharacter, '')
    }

    inputError.value = validators.map((validator) =>
      validator(isPatternMatch, DOM.value, newValue)
    )

    inputValidity.value.name = DOM.value?.name
    inputValidity.value.validity = DOM.value?.checkValidity()
  })

  return {
    inputError,
    inputValue,
    inputValidity
  }
}
