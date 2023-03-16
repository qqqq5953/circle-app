const formatNumber = ({
  number,
  locales = 'en-US',
  signDisplay = 'auto',
  currency = 'USD',
  decimal = 2
}) => {
  const twoDecimal = parseFloat(number.toFixed(decimal))

  return new Intl.NumberFormat(locales, {
    signDisplay,
    currency
  }).format(twoDecimal)
}

export default formatNumber
