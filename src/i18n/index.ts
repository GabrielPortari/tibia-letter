import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import pt from './locales/pt.json'
import en from './locales/en.json'
import es from './locales/es.json'
import pl from './locales/pl.json'

export const SUPPORTED_LANGS = ['pt', 'en', 'es', 'pl'] as const
export type SupportedLang = (typeof SUPPORTED_LANGS)[number]

export function detectLang(): SupportedLang {
  const saved = localStorage.getItem('i18n-lang') as SupportedLang | null
  if (saved && SUPPORTED_LANGS.includes(saved)) return saved
  const browser = navigator.language.split('-')[0] as SupportedLang
  if (SUPPORTED_LANGS.includes(browser)) return browser
  return 'en'
}

i18n.use(initReactI18next).init({
  resources: {
    pt: { translation: pt },
    en: { translation: en },
    es: { translation: es },
    pl: { translation: pl },
  },
  lng: detectLang(),
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
})

export default i18n
