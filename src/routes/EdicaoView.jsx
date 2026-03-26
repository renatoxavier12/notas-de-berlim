import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { MapPinned } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { normalizeLanguage } from '../i18n'
import LOCATIONS from '../locations.json'
import { EDICOES, absoluteUrl, formatEditionDate, formatEditionRelativeDate, getCookie, getEditionAroundReadings, getEditionCopy, getGlossaryTerms, getMarkdownForEdicao, readingTime, setCookie } from '../lib/site'

function EdicaoGate({ onUnlock }) {
  const { t } = useTranslation()
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
        <p className="gate-label">{t('edition.freeLabel')}</p>
        <h2 className="gate-title">{t('edition.freeTitle')}</h2>
        <p className="gate-text">{t('edition.freeText')}</p>
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

const IconX = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M18.9 2H22l-6.77 7.73L23 22h-6.11l-4.78-6.27L6.62 22H3.5l7.24-8.28L1 2h6.27l4.32 5.7zM17.8 20h1.72L6.34 3.9H4.49z" />
  </svg>
)

const IconBluesky = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 10.84c-1.33-2.59-4.96-6.62-8.32-8.99C2.6 1.1 1 1.58 1 3.57c0 .4.23 3.35.38 3.83.5 1.68 2.33 2.11 3.95 1.83-2.83.49-3.55 2.13-1.99 3.77 2.97 3.13 4.26-.79 4.6-1.79.06-.18.09-.26.16-.26s.1.08.16.26c.34 1 1.63 4.92 4.6 1.79 1.56-1.64.84-3.28-1.99-3.77 1.62.28 3.45-.15 3.95-1.83.15-.48.38-3.43.38-3.83 0-1.99-1.6-2.47-2.68-1.72C16.96 4.22 13.33 8.25 12 10.84z" />
  </svg>
)

const IconLinkedIn = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M4.98 3.5A2.48 2.48 0 1 1 5 8.46a2.48 2.48 0 0 1-.02-4.96M3 9h4v12H3zm7 0h3.83v1.71h.05c.53-1 1.84-2.06 3.78-2.06C21.2 8.65 22 10.96 22 13.96V21h-4v-6.16c0-1.47-.03-3.36-2.05-3.36-2.05 0-2.37 1.6-2.37 3.25V21h-4z" />
  </svg>
)

const IconFacebook = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M13.5 22v-8h2.7l.4-3h-3.1V9.1c0-.87.25-1.46 1.5-1.46H16.7V5.02C16.4 4.98 15.38 4.9 14.2 4.9c-2.46 0-4.15 1.5-4.15 4.26V11H7.3v3h2.75v8z" />
  </svg>
)

const IconStories = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="4" y="3" width="16" height="18" rx="4" />
    <circle cx="12" cy="12" r="3.5" />
    <path d="M8.2 6.7h.01M15.8 6.7h.01" />
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
    <button className={`btn-like-pill ${liked ? 'liked' : ''}`} onClick={toggle} title={liked ? t('edition.unlike') : t('edition.like')}>
      <span className="icon"><IconHeart filled={liked} /></span>
      <span className="count">{liked ? t('edition.liked') : t('edition.like')}</span>
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
          <button className={`mini-btn-circle ${copied ? 'copied' : ''}`} onClick={copiar} title={t('edition.copyLink')}>
            {copied ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            ) : (
              <IconLink />
            )}
          </button>
          <button className={`mini-btn-circle ${saved ? 'saved' : ''}`} onClick={toggleSaved} title={saved ? t('edition.unsave') : t('edition.save')}>
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

  if (!nextEdition && !previousEdition) return null

  function openEdition(target) {
    if (!target) return
    setView('edicao')
    window.history.pushState({}, '', `/edicoes/${target.slug}`)
    window.dispatchEvent(new PopStateEvent('popstate'))
  }

  return (
    <div className="edition-pager">
      <p className="share-label">{t('edition.moreLabel')}</p>
      <div className="edition-pager-grid">
        <button
          type="button"
          className={`edition-pager-card ${!previousEdition ? 'is-empty' : ''}`}
          onClick={() => openEdition(previousEdition)}
          disabled={!previousEdition}
        >
          {previousEdition && (
            <>
              {previousEdition.capa && <img src={previousEdition.capa} alt={previousEdition.titulo} className="edition-pager-image" />}
              <span className="edition-pager-direction">{t('edition.previous')}</span>
              <span className="edition-pager-title">{previousEdition.titulo}</span>
            </>
          )}
        </button>
        <button
          type="button"
          className={`edition-pager-card ${!nextEdition ? 'is-empty' : ''}`}
          onClick={() => openEdition(nextEdition)}
          disabled={!nextEdition}
        >
          {nextEdition && (
            <>
              {nextEdition.capa && <img src={nextEdition.capa} alt={nextEdition.titulo} className="edition-pager-image" />}
              <span className="edition-pager-direction">{t('edition.next')}</span>
              <span className="edition-pager-title">{nextEdition.titulo}</span>
            </>
          )}
        </button>
      </div>
    </div>
  )
}

export default function EdicaoView({ edicao, setView }) {
  const { t, i18n } = useTranslation()
  const raw = getMarkdownForEdicao(edicao.slug)
  const content = raw.replace(/^---[\s\S]*?---\n?/, '')
  const parts = content.split(/\n---\n/)
  const teaser = parts[0]
  const hasMore = parts.length > 1
  const rest = parts.slice(1).join('\n\n---\n\n')
  const editionCopy = getEditionCopy(edicao, t)
  const [unlocked, setUnlocked] = useState(() => !!getCookie('nb_email'))
  const locale = i18n.resolvedLanguage === 'de'
    ? 'de-DE'
    : i18n.resolvedLanguage === 'en'
      ? 'en-US'
      : 'pt-BR'
  const relativeDate = formatEditionRelativeDate(edicao.data, locale)
  const absoluteDate = formatEditionDate(edicao.data, locale)
  const glossaryTerms = getGlossaryTerms(content)
  const aroundReadings = getEditionAroundReadings(edicao.slug)
  const hasMap = LOCATIONS.some(location => location.edicaoId === edicao.id)

  return (
    <div className="edicao-view">
      <ReadingProgress />
      <div className="edition-topbar">
        <button className="back-btn" onClick={() => setView('home')}>
          {t('edition.back')}
        </button>
      </div>

      {edicao.capa && (
        <div className="edition-hero" style={{ backgroundImage: `url(${edicao.capa})` }}>
          <div className="edition-hero-content">
            <p className="edition-hero-kicker">{relativeDate}</p>
            <h1 className="edition-hero-title">{editionCopy.titulo}</h1>
            <div className="edition-hero-meta">
              <span className="edition-kiez-detail">
                <MapPinned size={14} strokeWidth={2} />
                {editionCopy.bairro}
              </span>
              <span>{absoluteDate}</span>
            </div>
          </div>
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
              <span className="edicao-numero-big">#{String(edicao.id).padStart(2, '0')}</span>
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
              #{String(edicao.id).padStart(2, '0')} · {relativeDate} · {readingTime(content)}
            </p>
          )}
          <article className="edicao-content">
            <>
              <ReactMarkdown>{teaser}</ReactMarkdown>
              {hasMore && !unlocked && <EdicaoGate onUnlock={() => setUnlocked(true)} />}
              {hasMore && unlocked && <ReactMarkdown>{rest}</ReactMarkdown>}
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
