import { useState, useEffect, useRef } from 'react'
import { inject } from '@vercel/analytics'
inject()

import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import ReactMarkdown from 'react-markdown'
import './App.css'
import LOCATIONS from './locations.json'

import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

const markdownFiles = import.meta.glob('./edicoes/*.md', { query: '?raw', import: 'default', eager: true })

function getCookie(name) {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'))
  return match ? decodeURIComponent(match[2]) : null
}

function setCookie(name, value, days = 365) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString()
  document.cookie = `${name}=${encodeURIComponent(value)};expires=${expires};path=/;SameSite=Lax`
}

function parseFrontmatter(raw) {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/)
  if (!match) return { meta: {}, content: raw }
  const meta = {}
  match[1].split('\n').forEach(line => {
    const colonIdx = line.indexOf(':')
    if (colonIdx === -1) return
    const key = line.slice(0, colonIdx).trim()
    const value = line.slice(colonIdx + 1).trim().replace(/^["']|["']$/g, '')
    if (key) meta[key] = value
  })
  return { meta, content: match[2].trim() }
}

const EDICOES = Object.entries(markdownFiles)
  .map(([path, raw]) => {
    const slug = path.replace('./edicoes/', '').replace('.md', '')
    const { meta } = parseFrontmatter(raw)
    return {
      id: meta.id ? parseInt(meta.id) : 0,
      slug,
      titulo: meta.title || slug,
      data: meta.data || '',
      bairro: meta.bairro || '',
      teaser: meta.teaser || '',
      capa: meta.capa || null,
    }
  })
  .sort((a, b) => a.id - b.id)

let DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
})
L.Marker.prototype.options.icon = DefaultIcon

const createStationIcon = (color) =>
  L.divIcon({
    className: 'custom-station-icon',
    html: `<div class="station-dot" style="border-color: ${color}"></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12],
  })

function MapRecenter({ coords }) {
  const map = useMap()
  useEffect(() => {
    map.setView(coords, 14)
  }, [coords, map])
  return null
}

function Nav({ view, setView }) {
  return (
    <nav className="site-nav">
      <button className="nav-logo" onClick={() => setView('home')}>
        Notas de Berlim
      </button>
      <div className="nav-links">
        <button
          className={view === 'home' || view === 'edicao' ? 'active' : ''}
          onClick={() => setView('home')}
        >
          Arquivo
        </button>
        <button
          className={view === 'mapa' ? 'active' : ''}
          onClick={() => setView('mapa')}
        >
          Mapa
        </button>
        <button
          className={view === 'sobre' ? 'active' : ''}
          onClick={() => setView('sobre')}
        >
          Sobre
        </button>
      </div>
    </nav>
  )
}

function SubscribeForm() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState(null) // null | 'loading' | 'ok' | 'error'

  async function handleSubmit(e) {
    e.preventDefault()
    if (!email) return
    setStatus('loading')

    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      if (res.ok) {
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
            onChange={(e) => setEmail(e.target.value)}
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

function readingTime(markdown) {
  const text = markdown.replace(/^---[\s\S]*?---\n?/, '').replace(/[#*`\[\]_]/g, '')
  const words = text.trim().split(/\s+/).length
  return `${Math.ceil(words / 200)} min`
}

function HomeView({ setView, setEdicaoAtiva }) {
  const [query, setQuery] = useState('')
  const filtered = EDICOES.filter(e =>
    !query ||
    e.titulo.toLowerCase().includes(query.toLowerCase()) ||
    (e.teaser || '').toLowerCase().includes(query.toLowerCase()) ||
    (e.bairro || '').toLowerCase().includes(query.toLowerCase())
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
            onChange={e => setQuery(e.target.value)}
          />
        </div>
        <div className="edicoes-list">
          {filtered.length === 0 && (
            <p className="search-empty">Nenhuma edição encontrada.</p>
          )}
          {filtered.map((e) => (
            <button
              key={e.id}
              className="edicao-card"
              onClick={() => {
                setEdicaoAtiva(e)
                setView('edicao')
              }}
            >
              <span className="edicao-numero">#{String(e.id).padStart(2, '0')}</span>
              <div className="edicao-info">
                <h3>{e.titulo}</h3>
                <p className="edicao-meta">
                  {e.data} · {e.bairro}
                </p>
                <p className="edicao-teaser">{e.teaser}</p>
              </div>
              <span className="edicao-arrow">→</span>
            </button>
          ))}
        </div>
      </main>
    </div>
  )
}

function EdicaoGate({ onUnlock }) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    setStatus('loading')
    try {
      const res = await fetch(`/api/check?email=${encodeURIComponent(email)}`)
      if (res.ok) {
        const data = await res.json()
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
            onChange={(e) => setEmail(e.target.value)}
            className="subscribe-input"
            required
          />
          <button type="submit" className="subscribe-btn" disabled={status === 'loading'}>
            {status === 'loading' ? '...' : 'Acessar'}
          </button>
        </form>
        {status === 'not_subscribed' && (
          <p className="subscribe-error">Email não encontrado na lista. <a href="/" onClick={e => { e.preventDefault(); window.scrollTo(0,0) }}>Inscreva-se</a> primeiro.</p>
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
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
)

const IconWhatsApp = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
)

const IconTelegram = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
  </svg>
)

const IconLinkedIn = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
)

const IconLink = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
  </svg>
)

const IconHeart = ({ filled }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
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

function GiscusComments({ slug }) {
  const ref = useRef(null)

  useEffect(() => {
    if (!ref.current || ref.current.querySelector('iframe')) return
    const script = document.createElement('script')
    script.src = 'https://giscus.app/client.js'
    script.setAttribute('data-repo', 'renatoxavier12/notas-de-berlim')
    script.setAttribute('data-repo-id', 'R_kgDORsOcnA')
    script.setAttribute('data-category', 'General')
    script.setAttribute('data-category-id', 'DIC_kwDORsOcnM4C43ed')
    script.setAttribute('data-mapping', 'specific')
    script.setAttribute('data-term', slug)
    script.setAttribute('data-reactions-enabled', '0')
    script.setAttribute('data-emit-metadata', '0')
    script.setAttribute('data-input-position', 'bottom')
    script.setAttribute('data-theme', 'noborder_light')
    script.setAttribute('data-lang', 'pt')
    script.setAttribute('crossorigin', 'anonymous')
    script.async = true
    ref.current.appendChild(script)
  }, [slug])

  return (
    <div className="comments-section">
      <p className="share-label" style={{ marginBottom: 16 }}>COMENTÁRIOS</p>
      <div ref={ref} />
    </div>
  )
}

function ShareBar({ edicao }) {
  const [copied, setCopied] = useState(false)
  const canonicalUrl = `https://notasdeberlim.com/edicoes/${edicao.slug}`
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
      const el = document.createElement('textarea')
      el.value = canonicalUrl
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
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
            {redes.map(r => (
              <a key={r.label} href={r.href} target="_blank" rel="noopener noreferrer" className="share-icon-btn" title={r.label}>
                {r.icon}
              </a>
            ))}
            <button className={`share-icon-btn`} onClick={copiar} title="Copiar link" style={{ background: copied ? '#2ecc71' : '#555' }}>
              {copied
                ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                : <IconLink />
              }
            </button>
          </div>
        </div>
      </div>
      <GiscusComments slug={edicao.slug} />
    </div>
  )
}

function EdicaoView({ edicao, setView }) {
  const key = `./edicoes/${edicao.slug}.md`
  const raw = markdownFiles[key] || '_Conteúdo não encontrado._'
  const content = raw.replace(/^---[\s\S]*?---\n?/, '')

  const parts = content.split(/\n---\n/)
  const teaser = parts[0]
  const hasMore = parts.length > 1
  const rest = parts.slice(1).join('\n\n---\n\n')

  const [unlocked, setUnlocked] = useState(() => !!getCookie('nb_email'))

  return (
    <div className="edicao-view">
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
        {(unlocked || !hasMore) && <ShareBar edicao={edicao} />}
      </div>
    </div>
  )
}

function SobreView({ setView, setEdicaoAtiva }) {
  return (
    <div className="sobre-view">
      <div className="sobre-inner">
        <button className="back-btn" onClick={() => setView('home')}>← Arquivo</button>

        <div className="sobre-hero">
          <div className="sobre-foto-placeholder">
            <span>Foto</span>
          </div>
          <div className="sobre-bio">
            <p className="home-kicker">O AUTOR</p>
            <h1 className="sobre-nome">Renato Xavier</h1>
            <p className="sobre-texto">
              Pós-doutorando CEBRAP/FAPESP e pesquisador visitante no Ibero-Amerikanisches Institut (IAI), em Berlim. Pesquisador de teoria política e relações internacionais, com foco em W.E.B. Du Bois, algoritmos e raça. Em março de 2026, chegamos a Kreuzberg: Bia, Tiãozinho (nosso spitz alemão) e eu. Com mala e sem leiteira.
            </p>
            <p className="sobre-texto">
              <em>Notas de Berlim</em> é um caderno aberto sem folhas.
            </p>
            <div className="sobre-links">
              <a href="https://renatoxavier.substack.com" target="_blank" rel="noopener noreferrer" className="sobre-link">Substack</a>
              <a href="https://www.iai.spk-berlin.de" target="_blank" rel="noopener noreferrer" className="sobre-link">IAI Berlin</a>
            </div>
          </div>
        </div>

        <div className="sobre-edicoes">
          <p className="section-label">EDIÇÕES PUBLICADAS</p>
          {EDICOES.map(e => (
            <button key={e.id} className="edicao-card" onClick={() => { setEdicaoAtiva(e); setView('edicao') }}>
              <span className="edicao-numero">#{String(e.id).padStart(2, '0')}</span>
              <div className="edicao-info">
                <h3>{e.titulo}</h3>
                <p className="edicao-meta">{e.data} · {e.bairro}</p>
              </div>
              <span className="edicao-arrow">→</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

function MapaView({ setView, setEdicaoAtiva }) {
  const [activeLocation, setActiveLocation] = useState(null)
  const [center, setCenter] = useState([52.501, 13.41])
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="mapa-view">
      <button
        className="mapa-toggle-btn"
        onClick={() => setSidebarOpen(o => !o)}
      >
        {sidebarOpen ? '✕ Fechar' : '☰ Locais'}
      </button>
      <div className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <header className="sidebar-header">
          <h1>Mapa</h1>
        </header>
        <div className="sidebar-content">
          <p style={{ fontSize: '13px', color: '#666', marginBottom: '16px' }}>
            Locais citados nas edições
          </p>
          {LOCATIONS.map((loc) => (
            <div
              key={loc.id}
              className="location-item"
              onClick={() => {
                setCenter(loc.coords)
                setActiveLocation(loc.id)
              }}
              style={activeLocation === loc.id ? { borderLeft: `8px solid ${loc.color}` } : {}}
            >
              {loc.imageUrl && (
                <img src={loc.imageUrl} alt={loc.name} className="location-img-thumb" referrerPolicy="no-referrer" />
              )}
              <h3>{loc.name}</h3>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
                <span className="u-line-tag" style={{ backgroundColor: loc.color }}>
                  {loc.line}
                </span>
                <span style={{ fontSize: '12px', color: '#888' }}>Berlim</span>
              </div>
              <p>{loc.description}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="map-container">
        <MapContainer
          center={center}
          zoom={13}
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          />
          {LOCATIONS.map((loc) => (
            <Marker
              key={loc.id}
              position={loc.coords}
              icon={createStationIcon(loc.color)}
              eventHandlers={{ click: () => setActiveLocation(loc.id) }}
            >
              <Popup>
                <div className="popup-title" style={{ backgroundColor: loc.color }}>
                  {loc.name}
                </div>
                <div className="popup-body">
                  {loc.imageUrl && (
                    <img src={loc.imageUrl} alt={loc.name} className="popup-img" referrerPolicy="no-referrer" />
                  )}
                  <p style={{ margin: '0 0 8px', fontSize: '13px' }}>{loc.description}</p>
                  <span style={{ fontWeight: 'bold', fontSize: '12px', color: '#888' }}>Linha {loc.line}</span>
                  {loc.edicaoId && (() => {
                    const edicao = EDICOES.find(e => e.id === loc.edicaoId)
                    return edicao ? (
                      <button
                        onClick={() => { setEdicaoAtiva(edicao); setView('edicao') }}
                        style={{
                          display: 'block', marginTop: '10px', width: '100%',
                          padding: '7px', background: '#111', color: 'white',
                          border: 'none', fontSize: '12px', fontWeight: 'bold',
                          cursor: 'pointer', textAlign: 'center'
                        }}
                      >
                        Ler edição #{String(edicao.id).padStart(2, '0')} →
                      </button>
                    ) : null
                  })()}
                </div>
              </Popup>
            </Marker>
          ))}
          <MapRecenter coords={center} />
        </MapContainer>
      </div>
    </div>
  )
}

function App() {
  const [view, setView] = useState('home')
  const [edicaoAtiva, setEdicaoAtiva] = useState(null)

  // Sincroniza a view inicial com a URL
  useEffect(() => {
    const path = window.location.pathname
    if (path.startsWith('/edicoes/')) {
      const slug = path.replace('/edicoes/', '')
      const edicao = EDICOES.find(e => e.slug === slug)
      if (edicao) {
        setEdicaoAtiva(edicao)
        setView('edicao')
      }
    } else if (path === '/mapa') {
      setView('mapa')
    } else if (path === '/sobre') {
      setView('sobre')
    }
  }, [])

  // Atalho secreto: pressionar A três vezes vai para /admin
  useEffect(() => {
    let count = 0
    let timer
    function handleKey(e) {
      if (e.key === 'a' || e.key === 'A') {
        count++
        clearTimeout(timer)
        timer = setTimeout(() => { count = 0 }, 800)
        if (count >= 3) {
          count = 0
          window.location.href = '/admin'
        }
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [])

  // Atualiza a URL quando a view muda
  useEffect(() => {
    let newPath = '/'
    if (view === 'edicao' && edicaoAtiva) newPath = `/edicoes/${edicaoAtiva.slug}`
    if (view === 'mapa') newPath = '/mapa'
    if (view === 'sobre') newPath = '/sobre'

    if (window.location.pathname !== newPath) {
      window.history.pushState({}, '', newPath)
    }
  }, [view, edicaoAtiva])

  return (
    <div className={`app-root view-${view}`}>
      <Nav view={view} setView={setView} />
      {view === 'home' && (
        <HomeView setView={setView} setEdicaoAtiva={setEdicaoAtiva} />
      )}
      {view === 'edicao' && edicaoAtiva && (
        <EdicaoView edicao={edicaoAtiva} setView={setView} />
      )}
      {view === 'mapa' && <MapaView setView={setView} setEdicaoAtiva={setEdicaoAtiva} />}
      {view === 'sobre' && <SobreView setView={setView} setEdicaoAtiva={setEdicaoAtiva} />}
    </div>
  )
}

export default App
