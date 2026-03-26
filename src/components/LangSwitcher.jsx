import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { normalizeLanguage } from '../i18n'

const LANGUAGES = [
  { code: 'pt', label: 'PT', name: 'Português' },
  { code: 'en', label: 'EN', name: 'English' },
  { code: 'de', label: 'DE', name: 'Deutsch' },
]

export default function LangSwitcher() {
  const { i18n } = useTranslation()
  const [open, setOpen] = useState(false)
  const rootRef = useRef(null)
  const currentCode = normalizeLanguage(i18n.resolvedLanguage || i18n.language)
  const currentLanguage = LANGUAGES.find(language => language.code === currentCode) || LANGUAGES[0]

  function selectLanguage(code) {
    if (code !== currentCode) {
      i18n.changeLanguage(code)
    }
    setOpen(false)
  }

  useEffect(() => {
    function handlePointerDown(event) {
      if (!rootRef.current?.contains(event.target)) {
        setOpen(false)
      }
    }

    function handleEscape(event) {
      if (event.key === 'Escape') {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [])

  return (
    <div className={`lang-switcher ${open ? 'open' : ''}`} aria-label="Language switcher" ref={rootRef}>
      <button
        type="button"
        className="lang-switcher-trigger"
        onClick={() => setOpen(value => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
        title={currentLanguage.name}
      >
        <span>{currentLanguage.label}</span>
      </button>

      {open && (
        <div className="lang-switcher-menu" role="menu">
          {LANGUAGES.filter(language => language.code !== currentCode).map(language => (
            <button
              key={language.code}
              type="button"
              className="lang-switcher-option"
              onClick={() => selectLanguage(language.code)}
              role="menuitem"
            >
              {language.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
