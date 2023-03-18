const formatNumber = ({
  number,
  locales = 'en-US',
  signDisplay = 'auto',
  style = 'currency',
  currency = 'USD'
}) => {
  return new Intl.NumberFormat(locales, {
    signDisplay,
    style,
    currency
  }).format(number)
}

export default formatNumber
