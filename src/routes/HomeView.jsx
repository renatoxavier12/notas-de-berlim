import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { MapPinned } from 'lucide-react'
import { EDICOES, formatEditionRelativeDate, getEditionCopy, getEditionKiezes, normalizeEmail, setCookie } from '../lib/site'

function SubscribeForm() {
  const { t } = useTranslation()
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState(null)

  async function handleSubmit(event) {
    event.preventDefault()
    const normalizedEmail = normalizeEmail(email)
    if (!normalizedEmail) return
    setStatus('loading')

    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: normalizedEmail }),
      })

      if (response.ok) {
        setCookie('nb_email', normalizedEmail)
        setStatus('ok')
        setEmail('')
      } else {
        setStatus('error')
      }
    } catch {
      setStatus('error')
    }
  }

  return (
    <div className="subscribe-box">
      <p className="subscribe-label">{t('subscribe.label')}</p>
      {status === 'ok' ? (
        <p className="subscribe-success">{t('subscribe.success')}</p>
      ) : (
        <form className="subscribe-form" onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder={t('subscribe.placeholder')}
            value={email}
            onChange={event => setEmail(normalizeEmail(event.target.value))}
            className="subscribe-input"
            required
          />
          <button type="submit" className="subscribe-btn" disabled={status === 'loading'}>
            {status === 'loading' ? '...' : t('subscribe.submit')}
          </button>
        </form>
      )}
      {status === 'error' && (
        <p className="subscribe-error">{t('subscribe.error')}</p>
      )}
    </div>
  )
}

export default function HomeView({ setView, setEdicaoAtiva }) {
  const { t, i18n } = useTranslation()
  const [query, setQuery] = useState('')
  const [selectedKiez, setSelectedKiez] = useState('all')
  const locale = i18n.resolvedLanguage === 'de'
    ? 'de-DE'
    : i18n.resolvedLanguage === 'en'
      ? 'en-US'
      : 'pt-BR'
  const kiezes = getEditionKiezes(EDICOES)

  const filtered = EDICOES.filter(edicao => {
    const editionCopy = getEditionCopy(edicao, t)
    const normalizedQuery = query.toLowerCase()
    const matchesKiez = selectedKiez === 'all' || editionCopy.bairro.includes(selectedKiez)

    return matchesKiez && (
      !query ||
      editionCopy.titulo.toLowerCase().includes(normalizedQuery) ||
      (editionCopy.teaser || '').toLowerCase().includes(normalizedQuery) ||
      (editionCopy.bairro || '').toLowerCase().includes(normalizedQuery)
    )
  })

  return (
    <div className="home-view">
      <header className="home-header">
        <p className="home-kicker">{t('home.kicker')}</p>
        <h1 className="home-title">{t('home.title')}</h1>
        <p className="home-subtitle">
          {t('home.subtitle')}
        </p>
        <SubscribeForm />
      </header>

      <main className="home-main">
        <div className="archive-header">
          <p className="section-label">{t('home.editions')}</p>
          <div className="archive-tools">
            <input
              className="search-input"
              type="text"
              placeholder={t('home.searchPlaceholder')}
              value={query}
              onChange={event => setQuery(event.target.value)}
            />
            <div className="kiez-filter-row" aria-label={t('home.kiezLabel')}>
              <button
                type="button"
                className={`kiez-filter-chip ${selectedKiez === 'all' ? 'active' : ''}`}
                onClick={() => setSelectedKiez('all')}
              >
                {t('home.allKiezes')}
              </button>
              {kiezes.map(kiez => (
                <button
                  key={kiez}
                  type="button"
                  className={`kiez-filter-chip ${selectedKiez === kiez ? 'active' : ''}`}
                  onClick={() => setSelectedKiez(kiez)}
                >
                  {kiez}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="edicoes-grid">
          {filtered.length === 0 && (
            <p className="search-empty">{t('home.noResults')}</p>
          )}
          {filtered.map(edicao => {
            const editionCopy = getEditionCopy(edicao, t)

            return (
              <button
                key={edicao.id}
                className="edicao-card"
                onClick={() => {
                  setEdicaoAtiva(edicao)
                  setView('edicao')
                }}
              >
                <div className="card-image-wrap">
                  {edicao.capa
                    ? <img src={edicao.capa} alt={editionCopy.titulo} className="card-image" />
                    : <div className="card-image-placeholder" />
                  }
                </div>
                <div className="card-body">
                  <span className="card-tag">{editionCopy.bairro}</span>
                  <h2 className="card-title">{editionCopy.titulo}</h2>
                  <p className="card-meta-row">
                    <span>{formatEditionRelativeDate(edicao.data, locale)}</span>
                    <span className="card-meta-kiez">
                      <MapPinned size={13} strokeWidth={1.9} />
                      {editionCopy.bairro}
                    </span>
                  </p>
                  <p className="card-teaser">{editionCopy.teaser}</p>
                </div>
              </button>
            )
          })}
        </div>
      </main>
    </div>
  )
}
