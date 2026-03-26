import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

const LANGUAGES = [
  { code: 'pt', label: 'PT', name: 'Português' },
  { code: 'en', label: 'EN', name: 'English' },
  { code: 'de', label: 'DE', name: 'Deutsch' },
]

export default function LangSwitcher() {
  const { i18n } = useTranslation()
  const [open, setOpen] = useState(false)
  const rootRef = useRef(null)
  const currentLanguage = LANGUAGES.find(language => language.code === i18n.resolvedLanguage) || LANGUAGES[0]

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

  function selectLanguage(code) {
    i18n.changeLanguage(code)
    setOpen(false)
  }

  return (
    <div className={`lang-switcher ${open ? 'open' : ''}`} aria-label="Language switcher" ref={rootRef}>
      <button
        type="button"
        className="lang-switcher-trigger"
        onClick={() => setOpen(value => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <span>{currentLanguage.label}</span>
        <span className="lang-switcher-caret">·</span>
      </button>

      {open && (
        <div className="lang-switcher-menu" role="menu">
          {LANGUAGES.map(language => (
            <button
              key={language.code}
              type="button"
              className={language.code === currentLanguage.code ? 'active' : ''}
              onClick={() => selectLanguage(language.code)}
              role="menuitem"
            >
              <span className="lang-switcher-code">{language.label}</span>
              <span className="lang-switcher-name">{language.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
