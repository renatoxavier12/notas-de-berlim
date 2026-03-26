import { useTranslation } from 'react-i18next'

const LANGUAGES = ['pt', 'en', 'de']

export default function LangSwitcher() {
  const { i18n } = useTranslation()

  return (
    <div className="lang-switcher" aria-label="Language switcher">
      {LANGUAGES.map(language => (
        <button
          key={language}
          type="button"
          className={i18n.resolvedLanguage === language ? 'active' : ''}
          onClick={() => i18n.changeLanguage(language)}
        >
          {language.toUpperCase()}
        </button>
      ))}
    </div>
  )
}
