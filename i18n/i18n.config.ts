import en_json from './locales/en.json'
import zh_json from './locales/zh.json'

export default defineI18nConfig(() => ({
  locale: 'en',
  messages: {
    en: en_json,
    zh: zh_json,
  },
}))
