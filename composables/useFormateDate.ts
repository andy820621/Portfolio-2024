import type { DateLike } from '~/types/main'

export function useFormatDate(date: MaybeRefOrGetter<DateLike>, onlyDate = true) {
  const now = useNow()

  return computed(() => {
    const dateValue = toValue(date)
    const formatStr = onlyDate || (dateValue && new Date(dateValue).getFullYear() === now.value.getFullYear())
      ? 'MMM D'
      : 'MMM D, YYYY'

    return useDateFormat(date, formatStr).value
  })
}