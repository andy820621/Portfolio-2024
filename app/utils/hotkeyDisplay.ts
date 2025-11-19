export type HotkeyInput = string | { value?: string }

const keyLabelMap: Record<string, string> = {
  meta: '⌘',
  command: '⌘',
  cmd: '⌘',
  option: '⌥',
  alt: '⌥',
  control: 'Ctrl',
  ctrl: 'Ctrl',
  shift: '⇧',
  enter: '↵',
  return: '↵',
  tab: '⇥',
  escape: 'Esc',
  esc: 'Esc',
  space: 'Space',
  spacebar: 'Space',
  delete: '⌫',
  backspace: '⌫',
  up: '↑',
  down: '↓',
  left: '←',
  right: '→',
  pageup: 'PgUp',
  pagedown: 'PgDn',
}

export function normalizeHotkeyValue(input: HotkeyInput): string {
  return typeof input === 'string' ? input : input?.value || ''
}

export function getHotkeyDisplayValue(input: HotkeyInput): string {
  const rawValue = normalizeHotkeyValue(input).trim()

  if (!rawValue)
    return ''

  const normalizedValue = rawValue.toLowerCase()
  return keyLabelMap[normalizedValue] || rawValue.toUpperCase()
}
