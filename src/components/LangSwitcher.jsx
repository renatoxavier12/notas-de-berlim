import { useTranslation } from 'react-i18next'
import { normalizeLanguage } from '../i18n'

const LANGUAGES = [
  { code: 'pt', label: 'PT', name: 'Português' },
  { code: 'en', label: 'EN', name: 'English' },
  { code: 'de', label: 'DE', name: 'Deutsch' },
]

export default function LangSwitcher() {
  const { i18n } = useTranslation()
  const currentCode = normalizeLanguage(i18n.resolvedLanguage || i18n.language)

  function selectLanguage(code) {
    if (code === currentCode) return;

    const { pathname } = window.location;
    const parts = pathname.split('/').filter(p => p);
    const supportedLngs = i18n.options.supportedLngs || ['pt', 'en', 'de'];
    
    let basePath = pathname;
    if (supportedLngs.includes(parts[0])) {
      basePath = '/' + parts.slice(1).join('/');
    }

    const newPath = code === 'pt' ? (basePath === '/' ? '' : basePath) : `/${code}${basePath === '/' ? '' : basePath}`;
    window.location.href = newPath || '/';
  }

  return (
    <div className="lang-switcher" aria-label="Language switcher">
      {LANGUAGES.map(language => (
        <button
          key={language.code}
          type="button"
          className={`lang-switcher-btn ${language.code === currentCode ? 'active' : ''}`}
          onClick={() => selectLanguage(language.code)}
          aria-pressed={language.code === currentCode}
          title={language.name}
        >
          {language.label}
        </button>
      ))}
    </div>
  )
}
