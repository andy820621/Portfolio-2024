import dayjs from 'dayjs'
import type { DateLike } from '~/types/main'

export function useFormatDate(date: MaybeRefOrGetter<DateLike>, onlyDate = true) {
  return computed(() => {
    const dateValue = dayjs(toValue(date))
    const now = dayjs()

    if (onlyDate || dateValue.year() === now.year())
      return dateValue.format('MMM D')
    return dateValue.format('MMM D, YYYY')
  })
}
