import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { EDICOES, getEditionCopy } from '../lib/site'

function SubscribeForm() {
  const { t } = useTranslation()
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState(null)

  async function handleSubmit(event) {
    event.preventDefault()
    if (!email) return
    setStatus('loading')

    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      if (response.ok) {
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
            onChange={event => setEmail(event.target.value)}
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
  const { t } = useTranslation()
  const [query, setQuery] = useState('')
  const filtered = EDICOES.filter(edicao => {
    const editionCopy = getEditionCopy(edicao, t)
    const normalizedQuery = query.toLowerCase()

    return !query ||
      editionCopy.titulo.toLowerCase().includes(normalizedQuery) ||
      (editionCopy.teaser || '').toLowerCase().includes(normalizedQuery) ||
      (editionCopy.bairro || '').toLowerCase().includes(normalizedQuery)
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
          <input
            className="search-input"
            type="text"
            placeholder={t('home.searchPlaceholder')}
            value={query}
            onChange={event => setQuery(event.target.value)}
          />
        </div>
        <div className="edicoes-list">
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
                <span className="edicao-numero">#{String(edicao.id).padStart(2, '0')}</span>
                <div className="edicao-info">
                  <h2>{editionCopy.titulo}</h2>
                  <p className="edicao-meta">
                    {edicao.data} · {editionCopy.bairro}
                  </p>
                  <p className="edicao-teaser">{editionCopy.teaser}</p>
                </div>
                <span className="edicao-arrow">→</span>
              </button>
            )
          })}
        </div>
      </main>
    </div>
  )
}
