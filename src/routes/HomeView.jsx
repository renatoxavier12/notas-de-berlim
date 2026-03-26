import { useState } from 'react'
import { EDICOES } from '../lib/site'

function SubscribeForm() {
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
      <p className="subscribe-label">RECEBA POR EMAIL</p>
      {status === 'ok' ? (
        <p className="subscribe-success">Inscrito. Até a próxima edição.</p>
      ) : (
        <form className="subscribe-form" onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="seu@email.com"
            value={email}
            onChange={event => setEmail(event.target.value)}
            className="subscribe-input"
            required
          />
          <button type="submit" className="subscribe-btn" disabled={status === 'loading'}>
            {status === 'loading' ? '...' : 'Assinar'}
          </button>
        </form>
      )}
      {status === 'error' && (
        <p className="subscribe-error">Algo deu errado. Tenta de novo.</p>
      )}
    </div>
  )
}

export default function HomeView({ setView, setEdicaoAtiva }) {
  const [query, setQuery] = useState('')
  const filtered = EDICOES.filter(edicao =>
    !query ||
    edicao.titulo.toLowerCase().includes(query.toLowerCase()) ||
    (edicao.teaser || '').toLowerCase().includes(query.toLowerCase()) ||
    (edicao.bairro || '').toLowerCase().includes(query.toLowerCase())
  )

  return (
    <div className="home-view">
      <header className="home-header">
        <p className="home-kicker">BERLIM, 2026</p>
        <h1 className="home-title">Notas de Berlim</h1>
        <p className="home-subtitle">
          Comida, drink, Kultur. Vida em Berlim.
        </p>
        <SubscribeForm />
      </header>

      <main className="home-main">
        <div className="archive-header">
          <p className="section-label">EDIÇÕES</p>
          <input
            className="search-input"
            type="text"
            placeholder="Buscar..."
            value={query}
            onChange={event => setQuery(event.target.value)}
          />
        </div>
        <div className="edicoes-list">
          {filtered.length === 0 && (
            <p className="search-empty">Nenhuma edição encontrada.</p>
          )}
          {filtered.map(edicao => (
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
                <h2>{edicao.titulo}</h2>
                <p className="edicao-meta">
                  {edicao.data} · {edicao.bairro}
                </p>
                <p className="edicao-teaser">{edicao.teaser}</p>
              </div>
              <span className="edicao-arrow">→</span>
            </button>
          ))}
        </div>
      </main>
    </div>
  )
}
