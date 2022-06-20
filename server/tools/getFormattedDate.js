const getFormattedDate = (num) => {
  const today = new Date()
  const dateBeforeToday = new Date(new Date().setDate(today.getDate() - num))
  const date = num === 0 ? today : dateBeforeToday

  console.log('dateBeforeToday', dateBeforeToday)

  const dd = String(date.getDate()).padStart(2, '0')
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const yyyy = date.getFullYear()
  return yyyy + '-' + mm + '-' + dd
}

module.exports = getFormattedDate
