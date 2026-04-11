import { useState, useEffect, useRef } from 'react'
import { EDICOES } from '../lib/site'
import '../admin.css'

const SERIES = [
  { value: 'desvios', label: 'Desvios' },
  { value: 'particulas-do-dia', label: 'Partículas do dia' },
  { value: '__default__', label: 'Semanas' },
]

function todayPT() {
  return new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })
}

function slugify(str) {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

function nextId() {
  const ids = EDICOES.map(e => e.id).filter(Boolean)
  return ids.length ? Math.max(...ids) + 1 : 1
}

function nextNumero(serie) {
  if (!serie || serie === '__default__') return null
  const nums = EDICOES.filter(e => e.serie === serie).map(e => e.numero).filter(Boolean)
  return nums.length ? Math.max(...nums) + 1 : 1
}

function buildFrontmatter({ id, title, data, bairro, teaser, capa, serie, numero }) {
  const lines = ['---', `id: ${id}`, `title: ${title}`, `data: ${data}`]
  if (bairro) lines.push(`bairro: ${bairro}`)
  lines.push(`teaser: ${teaser}`)
  if (capa) lines.push(`capa: ${capa}`)
  if (serie && serie !== '__default__') {
    lines.push(`serie: ${serie}`)
    if (numero) lines.push(`numero: ${numero}`)
  }
  lines.push('---')
  return lines.join('\n')
}

// ── Login ─────────────────────────────────────────────────

function LoginScreen({ onLogin }) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError(false)
    // Validate password against API
    try {
      const res = await fetch('/api/admin-publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, slug: '__check__', markdown: '' }),
      })
      // 400 = missing slug/markdown but password ok, 401 = wrong password
      if (res.status === 401) {
        setError(true)
      } else {
        onLogin(password)
      }
    } catch {
      setError(true)
    }
    setLoading(false)
  }

  return (
    <div className="admin-login">
      <div className="admin-login-inner">
        <p className="admin-login-site">NOTAS DE BERLIM</p>
        <h1 className="admin-login-title">ADMIN</h1>
        <form onSubmit={handleSubmit} className="admin-login-form">
          <input
            type="password"
            placeholder="senha"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className={`admin-login-input${error ? ' error' : ''}`}
            autoFocus
          />
          {error && <p className="admin-login-error">Senha incorreta.</p>}
          <button type="submit" className="admin-btn-primary" disabled={loading}>
            {loading ? 'Verificando…' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  )
}

// ── Editor ────────────────────────────────────────────────

function EditorScreen({ password }) {
  const id = nextId()
  const [title, setTitle] = useState('')
  const [bairro, setBairro] = useState('')
  const [serie, setSerie] = useState('desvios')
  const [numero, setNumero] = useState(() => nextNumero('desvios') ?? '')
  const [data, setData] = useState(todayPT)
  const [teaser, setTeaser] = useState('')
  const [capa, setCapa] = useState('')
  const [body, setBody] = useState('')
  const [tab, setTab] = useState('write') // 'write' | 'preview'
  const [status, setStatus] = useState(null) // null | 'publishing' | 'ok' | 'error'
  const [errorMsg, setErrorMsg] = useState('')
  const [autoTeaser, setAutoTeaser] = useState(true)
  const textareaRef = useRef(null)

  // Auto-generate teaser from first paragraph
  useEffect(() => {
    if (!autoTeaser) return
    const first = body.split(/\n\n/)[0]?.replace(/[*_`#[\]]/g, '').trim() ?? ''
    if (first) setTeaser(first.slice(0, 160))
  }, [body, autoTeaser])

  // Auto-update numero when serie changes
  useEffect(() => {
    setNumero(nextNumero(serie) ?? '')
  }, [serie])

  const slug = slugify(title) || 'nova-edicao'

  const markdown = buildFrontmatter({ id, title, data, bairro, teaser, capa, serie, numero }) + '\n\n' + body

  async function handlePublish() {
    if (!title.trim()) return setErrorMsg('Título obrigatório.')
    if (!body.trim()) return setErrorMsg('Texto obrigatório.')
    setErrorMsg('')
    setStatus('publishing')
    try {
      const res = await fetch('/api/admin-publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, slug, markdown }),
      })
      const json = await res.json()
      if (!res.ok) {
        setErrorMsg(json.error || 'Erro ao publicar.')
        setStatus('error')
      } else {
        setStatus('ok')
      }
    } catch {
      setErrorMsg('Erro de conexão.')
      setStatus('error')
    }
  }

  function insertAtCursor(prefix, suffix = '') {
    const el = textareaRef.current
    if (!el) return
    const start = el.selectionStart
    const end = el.selectionEnd
    const selected = body.slice(start, end)
    const newBody = body.slice(0, start) + prefix + selected + suffix + body.slice(end)
    setBody(newBody)
    setTimeout(() => {
      el.focus()
      el.setSelectionRange(start + prefix.length, start + prefix.length + selected.length)
    }, 0)
  }

  return (
    <div className="admin-editor">
      {/* ── Top bar ── */}
      <header className="admin-header">
        <span className="admin-header-logo">NdB <span className="admin-header-tag">ADMIN</span></span>
        <div className="admin-header-actions">
          {status === 'ok' && <span className="admin-status-ok">✓ Publicado</span>}
          {status === 'error' && <span className="admin-status-error">✗ Erro</span>}
          <button
            className="admin-btn-primary"
            onClick={handlePublish}
            disabled={status === 'publishing'}
          >
            {status === 'publishing' ? 'Publicando…' : 'Publicar'}
          </button>
        </div>
      </header>

      {errorMsg && <div className="admin-error-bar">{errorMsg}</div>}

      {/* ── Metadata ── */}
      <section className="admin-meta">
        <input
          className="admin-input admin-input-title"
          placeholder="Título"
          value={title}
          onChange={e => setTitle(e.target.value)}
        />
        <div className="admin-meta-row">
          <input
            className="admin-input"
            placeholder="Bairro / Kiez"
            value={bairro}
            onChange={e => setBairro(e.target.value)}
          />
          <input
            className="admin-input"
            placeholder="Data"
            value={data}
            onChange={e => setData(e.target.value)}
          />
        </div>
        <div className="admin-meta-row">
          <select
            className="admin-select"
            value={serie}
            onChange={e => setSerie(e.target.value)}
          >
            {SERIES.map(s => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
          {serie && serie !== '__default__' && (
            <input
              className="admin-input admin-input-short"
              placeholder="#"
              type="number"
              value={numero}
              onChange={e => setNumero(e.target.value)}
            />
          )}
          <input
            className="admin-input"
            placeholder="/capa-00.jpg"
            value={capa}
            onChange={e => setCapa(e.target.value)}
          />
        </div>
        <div className="admin-teaser-row">
          <textarea
            className="admin-input admin-teaser"
            placeholder="Teaser"
            value={teaser}
            rows={2}
            onChange={e => { setAutoTeaser(false); setTeaser(e.target.value) }}
          />
        </div>
        <div className="admin-slug-preview">
          notasdeberlim.com/edicoes/<strong>{slug}</strong>
        </div>
      </section>

      {/* ── Tabs ── */}
      <div className="admin-tabs">
        <button
          className={`admin-tab${tab === 'write' ? ' active' : ''}`}
          onClick={() => setTab('write')}
        >
          Escrever
        </button>
        <button
          className={`admin-tab${tab === 'preview' ? ' active' : ''}`}
          onClick={() => setTab('preview')}
        >
          Preview
        </button>
        {tab === 'write' && (
          <div className="admin-toolbar">
            <button className="admin-tool" onClick={() => insertAtCursor('**', '**')} title="Negrito">B</button>
            <button className="admin-tool admin-tool-italic" onClick={() => insertAtCursor('*', '*')} title="Itálico">I</button>
            <button className="admin-tool" onClick={() => insertAtCursor('\n---\n')} title="Separador">—</button>
          </div>
        )}
      </div>

      {/* ── Body ── */}
      {tab === 'write' ? (
        <textarea
          ref={textareaRef}
          className="admin-body"
          placeholder="Escreva aqui…"
          value={body}
          onChange={e => setBody(e.target.value)}
          spellCheck
        />
      ) : (
        <div className="admin-preview">
          {body.split('\n\n').map((para, i) => (
            <p key={i}>{para.replace(/\*\*(.+?)\*\*/g, '$1').replace(/\*(.+?)\*/g, '$1')}</p>
          ))}
        </div>
      )}

      {/* ── Slug footer ── */}
      {status === 'ok' && (
        <div className="admin-success">
          <p>Publicado em <strong>/edicoes/{slug}</strong>. Deploy em andamento no Vercel.</p>
          <a href={`/edicoes/${slug}`} className="admin-btn-secondary">Ver edição →</a>
        </div>
      )}
    </div>
  )
}

// ── Root ──────────────────────────────────────────────────

export default function AdminView() {
  const [password, setPassword] = useState(() => sessionStorage.getItem('admin_pw') || null)

  function handleLogin(pw) {
    sessionStorage.setItem('admin_pw', pw)
    setPassword(pw)
  }

  if (!password) return <LoginScreen onLogin={handleLogin} />
  return <EditorScreen password={password} />
}
