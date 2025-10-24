import dayjs from 'dayjs'
import isToday from 'dayjs/plugin/isToday.js'
import timezone from 'dayjs/plugin/timezone.js'
import utc from 'dayjs/plugin/utc.js'
import weekOfYear from 'dayjs/plugin/weekOfYear.js'

dayjs.extend(weekOfYear)
dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.extend(isToday)

// 將時間轉換為本地時區
export function getNowDayjs(time?: number) {
  return dayjs(time).tz()
}

// 將 getNowDayjs 結果轉換為 JavaScript Date 對象，最後返回其 UTC 字符串表示
export function getNowDayjsString(time?: number) {
  return getNowDayjs(time).toDate().toUTCString()
}

// 將 getNowDayjs 結果轉換為 JavaScript Date 對象，最後返回其毫秒時間戳。
export function getNowStamp(time?: number) {
  return getNowDayjs(time).toDate().getTime()
}

export function getSitemapDateFormat(time?: number) {
  return getNowDayjs(time).format('YYYY-MM-DD')
}
