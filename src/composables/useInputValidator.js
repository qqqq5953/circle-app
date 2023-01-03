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

    if (!isPatternMatch && replaceCharacter) {
      inputValue.value = newValue.replace(replaceCharacter, newSubstr)
    }

    inputError.value = validators.map((validator) =>
      validator({ isPatternMatch, inputValue: newValue, ref: DOM.value })
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
