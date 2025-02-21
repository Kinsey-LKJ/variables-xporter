import 'server-only'
import type { Dictionaries, Dictionary, Locale } from './i18n-config'
import { allLanguages } from './i18n-config'

export const dictionaries = allLanguages.reduce((acc, locale) => ({
  ...acc,
  [locale]: () => import(`./${locale}.json`),
}), {} as Dictionaries)

export async function getDictionary(locale: Locale): Promise<Dictionary> {
  const dictionaryFn = dictionaries[locale as keyof Dictionaries]
  
  if (!dictionaryFn) {
    throw new Error(`Dictionary not found for locale: ${locale}`)
  }

  const { default: dictionary } = await dictionaryFn()
  return dictionary
}

// export function getDirection(locale: Locale): 'ltr' | 'rtl' {
//   return locale === 'es' ? 'rtl' : 'ltr'
// }
