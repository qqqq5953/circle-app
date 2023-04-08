const getISODate = require('../../tools/getISODate')
const firebaseDb = require('../../firebase/index.js')
const holidaysRef = firebaseDb.ref('/holidays/')

async function scheduleNextUpdateStock() {
  const holidaySnapshot = await holidaysRef.once('value')
  const holiday = holidaySnapshot.val()

  const now = new Date()
  const nextUpdate = new Date(now)
  nextUpdate.setSeconds(0)
  nextUpdate.setMilliseconds(0)

  const dayOfWeek = now.getDay()
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    nextUpdate.setDate(nextUpdate.getDate() + ((7 - dayOfWeek + 1) % 7))
    nextUpdate.setHours(13)
    nextUpdate.setMinutes(30)
    console.log('今天是假日，下次更新為', nextUpdate.toLocaleString())

    // 檢查下週一是否為假日
    const nextUpdateISODate = getISODate(nextUpdate)
    const isNextUpdateTWHoliday = holiday['TW'][nextUpdateISODate]
    const isNextUpdateUSHoliday = holiday['US'][nextUpdateISODate]

    if (isNextUpdateTWHoliday && isNextUpdateUSHoliday) {
      // 重設為星期二 13:30
      nextUpdate.setDate(nextUpdate.getDate() + 1)
      nextUpdate.setHours(13)
      nextUpdate.setMinutes(30)
      console.log('下週一台美股皆休市，重設為', nextUpdate.toLocaleString())
    }
    if (isNextUpdateTWHoliday) {
      // 重設為最近的美股更新時間
      nextUpdate.setDate(nextUpdate.getDate() + 1)
      nextUpdate.setHours(5)
      nextUpdate.setMinutes(0)
      console.log('下週一台股休市，重設為', nextUpdate.toLocaleString())
    }
    if (isNextUpdateUSHoliday) {
      // 重設為最近的台股更新時間(為13:30所以不用重設)
      console.log('下週一美股休市，最近的台股更新時間為 13:30 所以不用重設')
    }

    return nextUpdate.getTime()
  }

  console.log('今天是平日')

  const year = now.getFullYear()
  const month = now.getMonth()
  const date = now.getDate()
  const usUpdateThreshold = new Date(year, month, date, 5, 0, 0)
  const twUpdateThreshold = new Date(year, month, date, 13, 30, 0)
  const startOfDay = new Date(year, month, date, 0, 0, 0)
  const endOfDay = new Date(year, month, date, 23, 59, 59)
  const ISODate = getISODate(now)

  const isTodayTWHoliday = holiday['TW'][ISODate]
  const isTodayUSHoliday = holiday['US'][ISODate]
  console.log('isTodayTWHoliday', isTodayTWHoliday)
  console.log('isTodayUSHoliday', isTodayUSHoliday)

  // 現在介於 00:00 到 5:00，設為今日 5:00
  if (
    now.getTime() >= startOfDay.getTime() &&
    now.getTime() <= usUpdateThreshold.getTime()
  ) {
    nextUpdate.setDate(nextUpdate.getDate())
    nextUpdate.setHours(5)
    nextUpdate.setMinutes(0)
    console.log('下次更新設為今日清晨5點')
  }

  // 現在介於 5:00 到 13:30，設為今日 13:30
  if (
    now.getTime() >= usUpdateThreshold.getTime() &&
    now.getTime() <= twUpdateThreshold.getTime()
  ) {
    nextUpdate.setDate(nextUpdate.getDate())
    nextUpdate.setHours(13)
    nextUpdate.setMinutes(30)
    console.log('下次更新設為今日下午一點半')

    if (isTodayTWHoliday) {
      nextUpdate.setDate(nextUpdate.getDate() + 1)
      nextUpdate.setHours(5)
      nextUpdate.setMinutes(0)
      console.log('但是因今日台股休市，改設隔日清晨5點')
    }
  }

  // 現在介於 13:30 到 24:00，設為明日 5:00
  if (
    now.getTime() >= twUpdateThreshold.getTime() &&
    now.getTime() <= endOfDay.getTime()
  ) {
    nextUpdate.setDate(nextUpdate.getDate() + 1)
    nextUpdate.setHours(5)
    nextUpdate.setMinutes(0)
    console.log('下次更新設為隔日凌晨5點')

    if (isTodayUSHoliday) {
      nextUpdate.setDate(nextUpdate.getDate() + 1)
      nextUpdate.setHours(13)
      nextUpdate.setMinutes(30)
      console.log('但是因今日美股休市，改設隔日 13:30')

      if (nextUpdate.getDay() === 0 || nextUpdate.getDay() === 6) {
        console.log('但隔日是，下次更新為下週一 13:30')
        nextUpdate.setDate(nextUpdate.getDate() + ((7 - dayOfWeek + 1) % 7))
        nextUpdate.setHours(13)
        nextUpdate.setMinutes(30)
        console.log(
          'nextUpdateTime',
          new Date(nextUpdate.getTime()).toLocaleString()
        )
      }
    }
  }

  console.log('now', now.toLocaleString())
  console.log('nextUpdate', nextUpdate.toLocaleString())
  return nextUpdate.getTime()

  // // Check if it's a weekend day
  // const dayOfWeek = nextUpdate.getDay()
  // const isNextUpdateWeekend = dayOfWeek === 0 || dayOfWeek === 6

  // const holiday = holidaySnapshot.val()
  // if (dayOfWeek === 0 || dayOfWeek === 6) {
  //   console.log('下次更新是假日，重設為下週一')
  //   nextUpdate.setDate(nextUpdate.getDate() + ((7 - dayOfWeek + 1) % 7))
  // } else {
  //   console.log('下次更新是平日')
  // }

  // const nextUpdateTime = nextUpdate.getTime()
  // console.log('nextUpdateTime', new Date(nextUpdateTime).toLocaleString())
}

module.exports = scheduleNextUpdateStock
