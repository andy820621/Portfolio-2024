import type { Composer } from 'vue-i18n'

declare module 'vue' {
  interface ComponentCustomProperties {
    $t: Composer['t']
    $rt: Composer['rt']
    $d: Composer['d']
    $n: Composer['n']
    $tm: Composer['tm']
    $te: Composer['te']
    $i18n: Composer
  }
}

export {}
