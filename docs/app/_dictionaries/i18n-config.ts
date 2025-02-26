import type ChineseLocale from './zh.json'
import lingoI18nConfig from '../../../i18n.json'

const locales = lingoI18nConfig.locale.targets
const defaultLocale = lingoI18nConfig.locale.source
export const allLanguages = [defaultLocale, ...locales]

export const i18n = {
  defaultLocale: defaultLocale,
  locales: allLanguages
} as const

export type Locale = (typeof i18n)['locales'][number]

export type Dictionary = typeof ChineseLocale

export type Dictionaries = Record<
  Locale,
  () => Promise<{ default: Dictionary }>
>
