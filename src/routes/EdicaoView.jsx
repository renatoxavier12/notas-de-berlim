import { useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import LOCATIONS from '../locations.json'
import { absoluteUrl, getCookie, getMarkdownForEdicao, readingTime, setCookie } from '../lib/site'

function EdicaoGate({ onUnlock }) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState(null)

  async function handleSubmit(event) {
    event.preventDefault()
    setStatus('loading')

    try {
      const response = await fetch(`/api/check?email=${encodeURIComponent(email)}`)
      if (response.ok) {
        const data = await response.json()
        if (data.isSubscribed) {
          setCookie('nb_email', email)
          onUnlock()
        } else {
          setStatus('not_subscribed')
        }
      } else {
        setStatus('not_found')
      }
    } catch {
      setStatus('error')
    }
  }

  return (
    <div className="edicao-gate">
      <div className="gate-inner">
        <p className="gate-label">CONTINUAR LENDO</p>
        <p className="gate-text">Esta edição é exclusiva para inscritos.</p>
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
            {status === 'loading' ? '...' : 'Acessar'}
          </button>
        </form>
        {status === 'not_subscribed' && (
          <p className="subscribe-error">Email não encontrado na lista. <a href="/" onClick={event => { event.preventDefault(); window.scrollTo(0, 0) }}>Inscreva-se</a> primeiro.</p>
        )}
        {status === 'not_found' && (
          <p className="subscribe-error">Email não encontrado. Inscreva-se na página inicial.</p>
        )}
        {status === 'error' && (
          <p className="subscribe-error">Algo deu errado. Tenta de novo.</p>
        )}
      </div>
    </div>
  )
}

const IconX = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
)

const IconWhatsApp = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
)

const IconTelegram = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
  </svg>
)

const IconLinkedIn = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
)

const IconLink = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </svg>
)

const IconHeart = ({ filled }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
)

function LikeButton({ slug }) {
  const key = `nb_like_${slug}`
  const [liked, setLiked] = useState(() => getCookie(key) === 'true')

  function toggle() {
    const next = !liked
    setLiked(next)
    setCookie(key, String(next))
  }

  return (
    <button className={`like-btn ${liked ? 'liked' : ''}`} onClick={toggle} title={liked ? 'Remover curtida' : 'Curtir'}>
      <IconHeart filled={liked} />
    </button>
  )
}

function CustomComments({ slug }) {
  const [comments, setComments] = useState([])
  const [formData, setFormData] = useState({ name: '', text: '', honeypot: '' })
  const [status, setStatus] = useState(null)

  useEffect(() => {
    fetch(`/api/comments?slug=${slug}`)
      .then(response => response.json())
      .then(data => setComments(Array.isArray(data) ? data : []))
      .catch(() => setComments([]))
  }, [slug])

  async function handleSubmit(event) {
    event.preventDefault()
    setStatus('loading')

    try {
      const response = await fetch(`/api/comments?slug=${slug}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setStatus('ok')
        setFormData({ name: '', text: '', honeypot: '' })
      } else {
        setStatus('error')
      }
    } catch {
      setStatus('error')
    }
  }

  return (
    <div className="comments-section">
      <p className="share-label" style={{ marginBottom: 24 }}>COMENTÁRIOS</p>
      {comments.length > 0 ? (
        <div className="comments-list">
          {comments.map(comment => (
            <div key={comment.id} className="comment-item">
              <div className="comment-header">
                <span className="comment-author">{comment.name}</span>
                <span className="comment-date">
                  {new Date(comment.timestamp).toLocaleDateString('pt-BR')}
                </span>
              </div>
              <p className="comment-text">{comment.text}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="comments-empty">Seja o primeiro a comentar.</p>
      )}

      <div className="comment-form-container">
        <p className="share-label" style={{ marginTop: 40, marginBottom: 16 }}>DEIXE UM COMENTÁRIO</p>
        {status === 'ok' ? (
          <p className="comment-success">Obrigado! Seu comentário foi enviado para moderação e aparecerá em breve.</p>
        ) : (
          <form className="comment-form" onSubmit={handleSubmit}>
            <input
              type="text"
              name="honeypot"
              style={{ display: 'none' }}
              value={formData.honeypot}
              onChange={event => setFormData({ ...formData, honeypot: event.target.value })}
              tabIndex="-1"
              autoComplete="off"
            />
            <input
              type="text"
              placeholder="Seu nome (opcional)"
              className="comment-input-name"
              value={formData.name}
              onChange={event => setFormData({ ...formData, name: event.target.value })}
            />
            <textarea
              placeholder="Escreva sua nota..."
              className="comment-input-text"
              required
              value={formData.text}
              onChange={event => setFormData({ ...formData, text: event.target.value })}
            />
            <button type="submit" className="comment-submit-btn" disabled={status === 'loading'}>
              {status === 'loading' ? 'Enviando...' : 'Enviar Comentário'}
            </button>
          </form>
        )}
        {status === 'error' && <p className="comment-error">Erro ao enviar. Tente novamente.</p>}
      </div>
    </div>
  )
}

function ShareBar({ edicao }) {
  const [copied, setCopied] = useState(false)
  const canonicalUrl = absoluteUrl(`/edicoes/${edicao.slug}`)
  const pageUrl = encodeURIComponent(canonicalUrl)
  const text = encodeURIComponent(`"${edicao.titulo}" — Notas de Berlim`)

  const redes = [
    { label: 'X', icon: <IconX />, href: `https://twitter.com/intent/tweet?text=${text}&url=${pageUrl}` },
    { label: 'WhatsApp', icon: <IconWhatsApp />, href: `https://wa.me/?text=${text}%20${pageUrl}` },
    { label: 'Telegram', icon: <IconTelegram />, href: `https://t.me/share/url?url=${pageUrl}&text=${text}` },
    { label: 'LinkedIn', icon: <IconLinkedIn />, href: `https://www.linkedin.com/sharing/share-offsite/?url=${pageUrl}` },
  ]

  async function copiar() {
    try {
      await navigator.clipboard.writeText(canonicalUrl)
    } catch {
      const element = document.createElement('textarea')
      element.value = canonicalUrl
      document.body.appendChild(element)
      element.select()
      document.execCommand('copy')
      document.body.removeChild(element)
    }

    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="share-bar">
      <div className="share-row">
        <LikeButton slug={edicao.slug} />
        <div className="share-links">
          <p className="share-label">COMPARTILHAR</p>
          <div className="share-icons">
            {redes.map(rede => (
              <a key={rede.label} href={rede.href} target="_blank" rel="noopener noreferrer" className="share-icon-btn" title={rede.label}>
                {rede.icon}
              </a>
            ))}
            <button className="share-icon-btn" onClick={copiar} title="Copiar link" style={{ background: copied ? '#2ecc71' : '#555' }}>
              {copied ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : (
                <IconLink />
              )}
            </button>
          </div>
        </div>
      </div>
      <CustomComments slug={edicao.slug} />
    </div>
  )
}

function ReadingProgress() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    function update() {
      const element = document.documentElement
      const scrolled = element.scrollTop || document.body.scrollTop
      const total = element.scrollHeight - element.clientHeight
      setProgress(total > 0 ? Math.min(100, (scrolled / total) * 100) : 0)
    }

    window.addEventListener('scroll', update, { passive: true })
    return () => window.removeEventListener('scroll', update)
  }, [])

  return <div className="reading-progress-bar" style={{ width: `${progress}%` }} />
}

export default function EdicaoView({ edicao, setView }) {
  const raw = getMarkdownForEdicao(edicao.slug)
  const content = raw.replace(/^---[\s\S]*?---\n?/, '')
  const parts = content.split(/\n---\n/)
  const teaser = parts[0]
  const hasMore = parts.length > 1
  const rest = parts.slice(1).join('\n\n---\n\n')
  const [unlocked, setUnlocked] = useState(() => !!getCookie('nb_email'))

  return (
    <div className="edicao-view">
      <ReadingProgress />
      <div className="edicao-view-inner">
        <button className="back-btn" onClick={() => setView('home')}>
          ← Arquivo
        </button>
        {edicao.capa && (
          <img src={edicao.capa} alt={edicao.titulo} className="edicao-capa" />
        )}
        <header className="edicao-header">
          <span className="edicao-numero-big">#{String(edicao.id).padStart(2, '0')}</span>
          <h1>{edicao.titulo}</h1>
          <p className="edicao-meta">
            {edicao.data} · {edicao.bairro} · {readingTime(content)}
          </p>
        </header>
        <article className="edicao-content">
          <ReactMarkdown>{teaser}</ReactMarkdown>
          {hasMore && !unlocked && <EdicaoGate onUnlock={() => setUnlocked(true)} />}
          {hasMore && unlocked && <ReactMarkdown>{rest}</ReactMarkdown>}
        </article>
        {(unlocked || !hasMore) && (
          <>
            {LOCATIONS.some(location => location.edicaoId === edicao.id) && (
              <button className="mapa-link-btn" onClick={() => setView('mapa')}>
                Ver lugares desta edição no mapa →
              </button>
            )}
            <ShareBar edicao={edicao} />
          </>
        )}
      </div>
    </div>
  )
}
