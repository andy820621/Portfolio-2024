import type { DateLike } from '~~/types/main'
import dayjs from 'dayjs'
import localizedFormat from 'dayjs/plugin/localizedFormat'
import { getNowDayjs } from '~/utils/dayjs'
import 'dayjs/locale/zh'
import 'dayjs/locale/en'

dayjs.extend(localizedFormat)

export function useFormatDate(date: MaybeRefOrGetter<DateLike>, onlyDate = true) {
  const { locale } = useI18n()

  return computed(() => {
    dayjs.locale(locale.value)

    const dateValue = dayjs(toValue(date))
    const now = getNowDayjs()

    if (onlyDate || dateValue.year() === now.year()) {
      if (locale.value === 'en') {
        return dateValue.format('MMM D')
      }
      else if (locale.value === 'zh') {
        return dateValue.format('M 月 D 日')
      }
      return dateValue.format('LL') // default
    }

    if (locale.value === 'zh')
      return dateValue.format('YYYY 年 M 月 D 日')
    return dateValue.format('LL')
  })
}
