const getFormattedDate = (num = 0, dateObj = new Date()) => {
  const dateBeforeToday = new Date(new Date().setDate(dateObj.getDate() - num))
  const date = num === 0 ? dateObj : dateBeforeToday

  const dd = String(date.getDate()).padStart(2, '0')
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const yyyy = date.getFullYear()
  return yyyy + '-' + mm + '-' + dd
}

module.exports = getFormattedDate
