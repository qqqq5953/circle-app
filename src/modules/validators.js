const tickerValidation = ({ isPatternMatch, ref, inputValue }) => {
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

const twoDecimal = ({ isPatternMatch, ref, inputValue }) => {
  ref.setCustomValidity('')

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

const isEmpty = ({ ref, inputValue }) => {
  // 只有當其他驗證為valid且input有值時才setCustomValidity，否會蓋掉其他驗證的invalid
  if (ref.checkValidity() && inputValue) {
    ref.setCustomValidity('')
    return ref.validationMessage
  }

  if (!inputValue) {
    ref.setCustomValidity('required field')
    return ref.validationMessage
  }
}

const isPositive = ({ ref, inputValue }) => {
  if (inputValue <= 0 && inputValue !== '') {
    ref?.setCustomValidity('value must greater than or equal to 0')
    return ref?.validationMessage
  }

  return null
}

const isValidDate = ({ isPatternMatch, ref, inputValue }) => {
  ref.setCustomValidity('')

  if (!isPatternMatch) {
    ref.setCustomValidity('Invalid date format')
  }

  if (inputValue === '') ref.setCustomValidity('Please select ticker first')

  const inputDate = new Date(inputValue)
  const isWeekend = [0, 6].includes(inputDate.getDay())
  if (isWeekend) {
    ref.setCustomValidity('Please select weekdays')
  }

  return ref.validationMessage
}

const isEmail = ({ isPatternMatch, ref, inputValue }) => {
  ref.setCustomValidity('')

  if (inputValue && !isPatternMatch) {
    ref.setCustomValidity('invalid format')
  }

  return ref.validationMessage
}

const isPassword = ({ isPatternMatch, ref, inputValue }) => {
  ref.setCustomValidity('')

  if (inputValue && !isPatternMatch) {
    ref.setCustomValidity('password must be at east six digit')
  }

  return ref.validationMessage
}

export {
  tickerValidation,
  isPositive,
  isEmpty,
  twoDecimal,
  isValidDate,
  isEmail,
  isPassword
}
