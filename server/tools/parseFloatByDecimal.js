const parseFloatByDecimal = (float, decimal) => {
  return decimal ? parseFloat(float.toFixed(decimal)) : parseFloat(float)
}

module.exports = parseFloatByDecimal
