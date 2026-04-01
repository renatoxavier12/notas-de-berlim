import { useEffect, useLayoutEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { MapPinned } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { normalizeLanguage } from '../i18n'
import LOCATIONS from '../locations.json'
import { EDICOES, absoluteUrl, formatEditionDate, formatEditionNumber, formatEditionRelativeDate, getCookie, getEditionAroundReadings, getEditionCopy, getGlossaryTerms, getMarkdownForEdicao, normalizeEmail, readingTime, setCookie } from '../lib/site'

function EdicaoGate({ onUnlock }) {
  const { t } = useTranslation()
  const [email, setEmail] = useState(() => normalizeEmail(getCookie('nb_email')))
  const [status, setStatus] = useState(null)

  async function handleSubmit(event) {
    event.preventDefault()
    const normalizedEmail = normalizeEmail(email)
    if (!normalizedEmail) return
    setStatus('loading')

    try {
      const response = await fetch(`/api/check?email=${encodeURIComponent(normalizedEmail)}`)
      if (response.ok) {
        const data = await response.json()
        if (data.isSubscribed) {
          setCookie('nb_email', normalizedEmail)
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
        <p className="gate-label">{t('edition.freeLabel')}</p>
        <h2 className="gate-title">{t('edition.freeTitle')}</h2>
        <p className="gate-text">{t('edition.freeText')}</p>
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
            {status === 'loading' ? '...' : t('edition.access')}
          </button>
        </form>
        <p className="gate-note">{t('edition.freeNote')}</p>
        {status === 'not_subscribed' && (
          <p className="subscribe-error">
            {t('edition.emailMissing')} <a href="/" onClick={event => { event.preventDefault(); window.scrollTo(0, 0) }}>{t('edition.subscribeFirst')}</a>
          </p>
        )}
        {status === 'not_found' && (
          <p className="subscribe-error">{t('edition.emailNotFound')}</p>
        )}
        {status === 'error' && (
          <p className="subscribe-error">{t('subscribe.error')}</p>
        )}
      </div>
    </div>
  )
}

const IconLink = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </svg>
)

const IconX = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M18.9 2H22l-6.77 7.74L23 22h-6.1l-4.78-6.26L6.64 22H3.53l7.24-8.28L1 2h6.26l4.32 5.7L18.9 2Z" />
  </svg>
)

const IconBluesky = () => (
  <svg width="16" height="14" viewBox="0 0 64 57" fill="currentColor" aria-hidden="true">
    <path d="M13.2 4.4c7.3 5.5 15.2 16.6 18.8 24 3.6-7.4 11.5-18.5 18.8-24C56 1 64 .1 64 9.7c0 1.9-1.1 16-1.8 18.3-2.4 8.1-11.1 10.1-18.9 8.8 13.6 2.3 17.1 9.9 9.6 17.4-14.3 14.3-20.6-3.6-22.2-8.2-.3-.8-.4-1.2-.7-1.2s-.4.4-.7 1.2c-1.6 4.6-7.9 22.5-22.2 8.2-7.5-7.5-4-15.1 9.6-17.4-7.8 1.3-16.5-.7-18.9-8.8C1.1 25.7 0 11.6 0 9.7 0 .1 8 1 13.2 4.4Z" />
  </svg>
)

const IconLinkedIn = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M6.94 8.5H3.56V20h3.38V8.5ZM5.25 3C4.17 3 3.5 3.7 3.5 4.62c0 .9.65 1.62 1.71 1.62h.02c1.1 0 1.78-.72 1.78-1.62C6.99 3.7 6.35 3 5.27 3h-.02ZM20.5 13.02c0-3.53-1.89-5.17-4.42-5.17-2.04 0-2.95 1.13-3.46 1.92V8.5H9.24c.04.84 0 11.5 0 11.5h3.38v-6.42c0-.34.03-.68.13-.92.27-.68.88-1.39 1.9-1.39 1.34 0 1.88 1.03 1.88 2.53V20h3.38v-6.98Z" />
  </svg>
)

const IconFacebook = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M13.5 21v-8.1H16l.38-3.15H13.5V7.73c0-.91.24-1.53 1.54-1.53h1.65V3.38c-.29-.04-1.28-.12-2.43-.12-2.41 0-4.06 1.47-4.06 4.17v2.31H7.96v3.15h2.24V21h3.3Z" />
  </svg>
)

const IconStories = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="3.25" />
    <circle cx="17.6" cy="6.4" r="1" fill="currentColor" stroke="none" />
  </svg>
)

const IconHeart = ({ filled }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
)

const IconBookmark = ({ filled }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1z" />
  </svg>
)

function LikePillButton({ slug }) {
  const { t } = useTranslation()
  const key = `nb_like_${slug}`
  const [liked, setLiked] = useState(() => getCookie(key) === 'true')

  function toggle() {
    const next = !liked
    setLiked(next)
    setCookie(key, String(next))
  }

  return (
    <button className={`edition-side-button edition-side-button-like ${liked ? 'active' : ''}`} onClick={toggle} title={liked ? t('edition.unlike') : t('edition.like')}>
      <span className="icon"><IconHeart filled={liked} /></span>
    </button>
  )
}

function CustomComments({ slug }) {
  const { t, i18n } = useTranslation()
  const language = normalizeLanguage(i18n.resolvedLanguage || i18n.language)
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

  const locale = language === 'de' ? 'de-DE' : language === 'en' ? 'en-US' : 'pt-BR'

  return (
    <div className="comments-section">
      <p className="share-label" style={{ marginBottom: 24 }}>{t('edition.comments')}</p>
      {comments.length > 0 ? (
        <div className="comments-list">
          {comments.map(comment => (
            <div key={comment.id} className="comment-item">
              <div className="comment-header">
                <span className="comment-author">{comment.name}</span>
                <span className="comment-date">
                  {new Date(comment.timestamp).toLocaleDateString(locale)}
                </span>
              </div>
              <p className="comment-text">{comment.text}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="comments-empty">{t('edition.firstComment')}</p>
      )}

      <div className="comment-form-container">
        <p className="share-label" style={{ marginTop: 40, marginBottom: 16 }}>{t('edition.leaveComment')}</p>
        {status === 'ok' ? (
          <p className="comment-success">{t('edition.commentSuccess')}</p>
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
              placeholder={t('edition.commentName')}
              className="comment-input-name"
              value={formData.name}
              onChange={event => setFormData({ ...formData, name: event.target.value })}
            />
            <textarea
              placeholder={t('edition.commentText')}
              className="comment-input-text"
              required
              value={formData.text}
              onChange={event => setFormData({ ...formData, text: event.target.value })}
            />
            <button type="submit" className="comment-submit-btn" disabled={status === 'loading'}>
              {status === 'loading' ? t('common.sending') : t('edition.sendComment')}
            </button>
          </form>
        )}
        {status === 'error' && <p className="comment-error">{t('edition.commentError')}</p>}
      </div>
    </div>
  )
}

function TextHighlight({ slug }) {
  const [tooltip, setTooltip] = useState(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    function onSelect() {
      const sel = window.getSelection()
      const text = sel?.toString().trim()
      if (!text || text.length < 15) { setTooltip(null); return }
      const rect = sel.getRangeAt(0).getBoundingClientRect()
      setTooltip({ text, x: rect.left + rect.width / 2, y: rect.top })
      setCopied(false)
    }
    function onMouseDown(e) {
      if (!e.target.closest('.highlight-tooltip')) setTooltip(null)
    }
    document.addEventListener('mouseup', onSelect)
    document.addEventListener('touchend', onSelect)
    document.addEventListener('mousedown', onMouseDown)
    return () => {
      document.removeEventListener('mouseup', onSelect)
      document.removeEventListener('touchend', onSelect)
      document.removeEventListener('mousedown', onMouseDown)
    }
  }, [slug])

  if (!tooltip) return null

  async function share() {
    const url = absoluteUrl(`/edicoes/${slug}`)
    const shareText = `"${tooltip.text}"\n\n— ${url}`
    try {
      await navigator.clipboard.writeText(shareText)
    } catch {
      const el = document.createElement('textarea')
      el.value = shareText
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
    }
    setCopied(true)
    setTimeout(() => { setTooltip(null); setCopied(false) }, 2000)
  }

  return (
    <div className="highlight-tooltip" style={{ left: tooltip.x, top: tooltip.y }}>
      <button onClick={share}>
        {copied ? '✓ Copiado' : '✦ Copiar trecho'}
      </button>
    </div>
  )
}

function ReadingProgress() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const root = document.getElementById('root')
    if (!root) return

    function update() {
      const total = root.scrollHeight - root.clientHeight
      setProgress(total > 0 ? Math.min(100, (root.scrollTop / total) * 100) : 0)
    }

    root.addEventListener('scroll', update, { passive: true })
    return () => root.removeEventListener('scroll', update)
  }, [])

  return <div className="reading-progress-bar" style={{ width: `${progress}%` }} />
}

function SidebarShare({ edicao, setView }) {
  const { t } = useTranslation()
  const [copied, setCopied] = useState(false)
  const saveKey = `nb_save_${edicao.slug}`
  const [saved, setSaved] = useState(() => getCookie(saveKey) === 'true')
  const canonicalUrl = absoluteUrl(`/edicoes/${edicao.slug}`)

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

  function toggleSaved() {
    const next = !saved
    setSaved(next)
    setCookie(saveKey, String(next))
  }

  return (
    <div className="edition-sidebar-share">
      <div className="sidebar-share-block">
        <p className="share-label">{t('edition.share')}</p>
        <div className="sidebar-share-row">
          <button className={`edition-side-button ${copied ? 'active' : ''}`} onClick={copiar} title={t('edition.copyLink')}>
            {copied ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            ) : (
              <IconLink />
            )}
          </button>
          <button className={`edition-side-button ${saved ? 'active' : ''}`} onClick={toggleSaved} title={saved ? t('edition.unsave') : t('edition.save')}>
            <IconBookmark filled={saved} />
          </button>
          <LikePillButton slug={edicao.slug} />
        </div>
        <p className="sidebar-meta-note">
          {copied ? t('edition.copiedLink') : saved ? t('edition.savedHint') : t('edition.copyHint')}
        </p>
      </div>

      <div className="sidebar-support-card">
        <p className="share-label">{t('edition.supportLabel')}</p>
        <p className="sidebar-support-text">{t('edition.supportText')}</p>
        <button type="button" className="sidebar-support-link" onClick={() => setView('apoiar')}>
          {t('edition.supportAction')}
        </button>
      </div>
    </div>
  )
}

function GlossaryCard({ terms }) {
  const { t } = useTranslation()
  if (!terms.length) return null

  return (
    <div className="sidebar-glossary-card">
      <p className="share-label">{t('edition.glossaryLabel')}</p>
      <div className="glossary-list">
        {terms.map(item => (
          <div key={item.term} className="glossary-item">
            <p className="glossary-term">{item.term}</p>
            <p className="glossary-description">{item.description}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function AroundReadingsCard({ items }) {
  const { t } = useTranslation()
  if (!items.length) return null

  return (
    <div className="sidebar-reading-card">
      <p className="share-label">{t('edition.aroundReadingsLabel')}</p>
      <div className="reading-list">
        {items.map(item => (
          <div key={item.title} className="reading-item">
            <p className="reading-title">{item.title}</p>
            {item.meta && <p className="reading-meta">{item.meta}</p>}
            {item.note && <p className="reading-note">{item.note}</p>}
          </div>
        ))}
      </div>
    </div>
  )
}

function EditionShareStrip({ edicao, title, setView, hasMap }) {
  const { t } = useTranslation()
  const canonicalUrl = absoluteUrl(`/edicoes/${edicao.slug}`)
  const shareText = `${title} — ${canonicalUrl}`
  const shareTargets = [
    {
      key: 'x',
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`,
      label: 'X',
      icon: <IconX />,
    },
    {
      key: 'bluesky',
      href: `https://bsky.app/intent/compose?text=${encodeURIComponent(shareText)}`,
      label: 'Bluesky',
      icon: <IconBluesky />,
    },
    {
      key: 'linkedin',
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(canonicalUrl)}`,
      label: 'LinkedIn',
      icon: <IconLinkedIn />,
    },
    {
      key: 'facebook',
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(canonicalUrl)}`,
      label: 'Facebook',
      icon: <IconFacebook />,
    },
  ]

  async function shareToStories() {
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

    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: shareText,
          url: canonicalUrl,
        })
        return
      } catch {
        return
      }
    }

    window.open('https://www.instagram.com/', '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="edition-actions-strip">
      <p className="share-label edition-actions-label">{t('edition.shareEndLabel')}</p>
      {hasMap && (
        <button className="edition-map-inline" onClick={() => setView('mapa')}>
          {t('edition.mapLinkShort')}
        </button>
      )}
      <div className="edition-share-icons" aria-label={t('edition.shareElsewhere')}>
        {shareTargets.map(target => (
          <a
            key={target.key}
            href={target.href}
            className="edition-share-icon"
            target="_blank"
            rel="noreferrer"
            title={target.label}
            aria-label={target.label}
          >
            {target.icon}
          </a>
        ))}
        <button
          type="button"
          className="edition-share-icon edition-share-icon-story"
          onClick={shareToStories}
          title={t('edition.instagramStories')}
          aria-label={t('edition.instagramStories')}
        >
          <IconStories />
        </button>
      </div>
    </div>
  )
}

function EditionPager({ edicao, setView }) {
  const { t } = useTranslation()
  const currentIndex = EDICOES.findIndex(item => item.slug === edicao.slug)
  const nextEdition = currentIndex > 0 ? EDICOES[currentIndex - 1] : null
  const previousEdition = currentIndex >= 0 && currentIndex < EDICOES.length - 1 ? EDICOES[currentIndex + 1] : null
  const availableCount = Number(Boolean(previousEdition)) + Number(Boolean(nextEdition))

  if (!nextEdition && !previousEdition) return null

  function openEdition(target) {
    if (!target) return
    document.activeElement?.blur()
    setView('edicao')
    window.history.pushState({}, '', `/edicoes/${target.slug}`)
    window.dispatchEvent(new PopStateEvent('popstate'))
  }

  return (
    <div className="edition-pager">
      <p className="share-label">{t('edition.moreLabel')}</p>
      <div className={`edition-pager-grid ${availableCount === 1 ? 'single-item' : ''}`}>
        {previousEdition && (
          <button
            type="button"
            className="edition-pager-card"
            onClick={() => openEdition(previousEdition)}
          >
            {previousEdition.capa && <img src={previousEdition.capa} alt={previousEdition.titulo} className="edition-pager-image" />}
            <span className="edition-pager-direction">{t('edition.previous')}</span>
            <span className="edition-pager-title">{previousEdition.titulo}</span>
          </button>
        )}
        {nextEdition && (
          <button
            type="button"
            className="edition-pager-card"
            onClick={() => openEdition(nextEdition)}
          >
            {nextEdition.capa && <img src={nextEdition.capa} alt={nextEdition.titulo} className="edition-pager-image" />}
            <span className="edition-pager-direction">{t('edition.next')}</span>
            <span className="edition-pager-title">{nextEdition.titulo}</span>
          </button>
        )}
      </div>
    </div>
  )
}

export default function EdicaoView({ edicao, setView }) {
  const { t, i18n } = useTranslation()
  useEffect(() => {
    const root = document.getElementById('root')
    if (root) root.scrollTop = 0
  }, [edicao.slug])

  const raw = getMarkdownForEdicao(edicao.slug)
  const content = raw.replace(/^---[\s\S]*?---\n?/, '')
  const parts = content.split(/\n---\n/)
  const teaser = parts[0]
  const hasMore = parts.length > 1
  const rest = parts.slice(1).join('\n\n---\n\n')
  const editionCopy = getEditionCopy(edicao, t)
  const [unlocked, setUnlocked] = useState(() => !!getCookie('nb_email'))
  const [checkingAccess, setCheckingAccess] = useState(() => {
    if (!hasMore) return false
    if (getCookie('nb_email')) return false
    const params = new URLSearchParams(window.location.search)
    return !!normalizeEmail(params.get('email'))
  })
  const locale = i18n.resolvedLanguage === 'de'
    ? 'de-DE'
    : i18n.resolvedLanguage === 'en'
      ? 'en-US'
      : 'pt-BR'
  const relativeDate = formatEditionRelativeDate(edicao.data, locale)
  const absoluteDate = formatEditionDate(edicao.data, locale)
  const displayNumber = formatEditionNumber(edicao)
  const glossaryTerms = getGlossaryTerms(content)
  const aroundReadings = getEditionAroundReadings(edicao.slug)
  const hasMap = LOCATIONS.some(location => location.edicaoId === edicao.id)

  useLayoutEffect(() => {
    const root = document.getElementById('root')
    if (root) root.scrollTop = 0
  }, [edicao.slug])

  useEffect(() => {
    let cancelled = false
    const params = new URLSearchParams(window.location.search)
    const emailFromUrl = normalizeEmail(params.get('email'))

    if (!hasMore || unlocked || !emailFromUrl) return

    async function validateAccess() {
      setCheckingAccess(true)

      try {
        const response = await fetch(`/api/check?email=${encodeURIComponent(emailFromUrl)}`)

        if (!response.ok || cancelled) return

        const data = await response.json()
        if (data.isSubscribed) {
          setCookie('nb_email', emailFromUrl)
          if (!cancelled) setUnlocked(true)
        }
      } catch {
        // Fall back to the manual gate if validation fails.
      } finally {
        params.delete('email')
        const cleanQuery = params.toString()
        const cleanUrl = `${window.location.pathname}${cleanQuery ? `?${cleanQuery}` : ''}${window.location.hash}`
        window.history.replaceState({}, '', cleanUrl)
        if (!cancelled) setCheckingAccess(false)
      }
    }

    validateAccess()

    return () => {
      cancelled = true
    }
  }, [hasMore, unlocked, edicao.slug])

  return (
    <div className="edicao-view">
      <ReadingProgress />
      <TextHighlight slug={edicao.slug} />
      {edicao.capa ? (
        <div className="edition-hero" style={{ backgroundImage: `url(${edicao.capa})` }}>
          <button className="back-btn back-btn-hero" onClick={() => setView('home')}>
            {t('edition.back')}
          </button>
          <div className="edition-hero-content">
            <p className="edition-hero-kicker">{relativeDate}</p>
            <h1 className="edition-hero-title">{editionCopy.titulo}</h1>
            <div className="edition-hero-meta">
              <span className="edition-kiez-detail">
                <MapPinned size={14} strokeWidth={2} />
                {editionCopy.bairro}
              </span>
              <span className="edition-hero-meta-divider" aria-hidden="true">·</span>
              <span>{absoluteDate}</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="edition-topbar">
          <button className="back-btn" onClick={() => setView('home')}>
            {t('edition.back')}
          </button>
        </div>
      )}

      <div className="edition-reading-layout">
        <aside className="edition-sidebar">
          <SidebarShare edicao={edicao} setView={setView} />
          <AroundReadingsCard items={aroundReadings} />
          <GlossaryCard terms={glossaryTerms} />
        </aside>

        <div className="edition-body">
          {!edicao.capa && (
            <header className="edicao-header">
              <span className="edicao-numero-big">{displayNumber}</span>
              <h1>{editionCopy.titulo}</h1>
              <div className="edition-meta-stack">
                <p className="edicao-meta">{relativeDate} · {readingTime(content)}</p>
                <p className="edition-kiez-detail">
                  <MapPinned size={14} strokeWidth={2} />
                  {editionCopy.bairro} · {absoluteDate}
                </p>
              </div>
            </header>
          )}
          {edicao.capa && (
            <p className="edicao-meta edition-meta-row">
              {displayNumber} <span className="edition-meta-divider" aria-hidden="true">·</span> {relativeDate} <span className="edition-meta-divider" aria-hidden="true">·</span> {readingTime(content)}
            </p>
          )}
          <article className="edicao-content">
            <>
              <ReactMarkdown >{teaser}</ReactMarkdown>
              {hasMore && checkingAccess && <p className="translation-loading">{t('common.loading')}</p>}
              {hasMore && !unlocked && !checkingAccess && <EdicaoGate onUnlock={() => setUnlocked(true)} />}
              {hasMore && unlocked && <ReactMarkdown >{rest}</ReactMarkdown>}
            </>
          </article>
          {(unlocked || !hasMore) && (
            <>
              <EditionShareStrip edicao={edicao} title={editionCopy.titulo} setView={setView} hasMap={hasMap} />
              <EditionPager edicao={edicao} setView={setView} />
              <CustomComments slug={edicao.slug} />
            </>
          )}
        </div>
      </div>
    </div>
  )
}
