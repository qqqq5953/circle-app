const tickerValidation = (isPatternMatch, ref, inputValue) => {
  const maxLength = ref.maxLength

  // 清空錯誤訊息
  ref.setCustomValidity('')

  // 空值的驗證要給 isEmpty 做
  if (!isPatternMatch && inputValue === '') return null

  // 有 maxlength 擋掉時
  if (!isPatternMatch && maxLength !== -1) {
    ref.setCustomValidity("ticker doesn't match specific pattern")
  }

  //  沒有 maxlength 擋掉時
  if (!isPatternMatch && maxLength === -1) {
    ref.setCustomValidity(
      "ticker doesn't match specific pattern or must contain 5 letters at most"
    )
  }

  return ref.validationMessage
}

const twoDecimal = (isPatternMatch, ref, inputValue) => {
  ref.setCustomValidity('')

  if (isPatternMatch) return

  if (!isPatternMatch && inputValue[inputValue.length - 1] === '.') {
    // 最後一位為小數點
    ref.setCustomValidity('input incomplete')
  } else if (
    !isPatternMatch &&
    (inputValue === '0' || inputValue === '0.0' || inputValue === '0.00')
  ) {
    // 輸入為 0
    ref.setCustomValidity('must greater than 0')
  } else if (!isPatternMatch && inputValue !== '') {
    // 輸入超過兩位小數
    ref.setCustomValidity('only accept 2 decimal places at most')
  }

  return ref.validationMessage
}

const isEmpty = (isPatternMatch, ref, inputValue) => {
  // console.log('空值', ref.validity.valueMissing)

  if (inputValue !== '') return null

  // console.log('required field')

  ref.setCustomValidity('required field')
  const validationMessage = ref.validationMessage
  return validationMessage
}

const isPositive = (isPatternMatch, ref, inputValue) => {
  if (inputValue <= 0 && inputValue !== '') {
    ref?.setCustomValidity('value must greater than or equal to 0')
    return ref?.validationMessage
  }

  return null
}

export { tickerValidation, isPositive, isEmpty, twoDecimal }
