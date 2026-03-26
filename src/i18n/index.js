import i18n from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { initReactI18next } from 'react-i18next'
import de from './de.json'
import en from './en.json'
import pt from './pt.json'

export function normalizeLanguage(language) {
  return (language || 'pt').toLowerCase().split('-')[0]
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      pt: { translation: pt },
      en: { translation: en },
      de: { translation: de },
    },
    fallbackLng: 'pt',
    supportedLngs: ['pt', 'en', 'de'],
    load: 'languageOnly',
    cleanCode: true,
    nonExplicitSupportedLngs: true,
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'notas-language',
    },
    react: {
      useSuspense: false,
    },
  })

export default i18n
