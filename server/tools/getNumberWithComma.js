const numberWithCommas = (number) => {
  if (!number) return null
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

module.exports = numberWithCommas
