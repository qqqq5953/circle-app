const getISODate = (dateObj) => {
  dateObj = dateObj || new Date()
  const dd = String(dateObj.getDate()).padStart(2, '0')
  const mm = String(dateObj.getMonth() + 1).padStart(2, '0')
  const yyyy = dateObj.getFullYear()
  return yyyy + '-' + mm + '-' + dd
}

module.exports = getISODate
