import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import ReactMarkdown from 'react-markdown'
import { normalizeLanguage } from '../i18n'
import LOCATIONS from '../locations.json'
import { absoluteUrl, getCookie, getEditionCopy, getMarkdownForEdicao, readingTime, setCookie } from '../lib/site'

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

function TranslationFallbackNotice() {
  const { t } = useTranslation()

  return (
    <div className="translation-fallback-note">
      <p className="share-label">{t('edition.translationOriginalLabel')}</p>
      <p>{t('edition.translationFallback')}</p>
    </div>
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
          <LikePillButton slug={edicao.slug} />
        </div>
        <p className="sidebar-meta-note">{copied ? t('edition.copiedLink') : t('edition.copyHint')}</p>
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

export default function EdicaoView({ edicao, setView }) {
  const { t, i18n } = useTranslation()
  const language = normalizeLanguage(i18n.resolvedLanguage || i18n.language)
  const raw = getMarkdownForEdicao(edicao.slug)
  const content = raw.replace(/^---[\s\S]*?---\n?/, '')
  const parts = content.split(/\n---\n/)
  const teaser = parts[0]
  const hasMore = parts.length > 1
  const rest = parts.slice(1).join('\n\n---\n\n')
  const editionCopy = getEditionCopy(edicao, t)
  const [unlocked, setUnlocked] = useState(() => !!getCookie('nb_email'))
  const [translations, setTranslations] = useState({})
  const [translationStatus, setTranslationStatus] = useState('idle')

  const targetLanguage = language === 'de' ? 'DE' : language === 'en' ? 'EN' : 'PT'
  const translatedContent = targetLanguage === 'PT' ? null : translations[targetLanguage] || null

  useEffect(() => {
    let cancelled = false

    async function translateText(text, section) {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: `${edicao.slug}-${section}`,
          targetLang: targetLanguage,
          text,
        }),
      })

      const data = await response.json()
      if (!response.ok || !data.translation) {
        throw new Error(data.error || 'Translation failed')
      }

      return data.translation
    }

    async function translateEdition() {
      if (targetLanguage === 'PT') {
        setTranslationStatus('idle')
        return
      }

      const shouldTranslateFull = unlocked || !hasMore
      const needsVisibleTranslation = shouldTranslateFull
        ? !translatedContent?.full
        : !translatedContent?.teaser

      if (!needsVisibleTranslation) {
        setTranslationStatus('success')
        return
      }

      setTranslationStatus('loading')

      try {
        const next = { ...translatedContent }

        if (shouldTranslateFull) {
          next.full = await translateText(content, 'full')
        } else {
          next.teaser = await translateText(teaser, 'teaser')
        }

        if (!cancelled) {
          setTranslations(current => ({ ...current, [targetLanguage]: next }))
          setTranslationStatus('success')
        }
      } catch {
        if (!cancelled) {
          setTranslationStatus('error')
        }
      }
    }

    translateEdition()

    return () => {
      cancelled = true
    }
  }, [content, edicao.slug, hasMore, rest, targetLanguage, t, teaser, translatedContent, unlocked])

  const shouldShowTranslatedVersion = targetLanguage !== 'PT'
  const translatedTeaser = translatedContent?.teaser || null
  const translatedFull = translatedContent?.full || null
  const visibleLoading = shouldShowTranslatedVersion && translationStatus === 'loading'

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
            <span className="card-tag">{editionCopy.bairro}</span>
            <h1 className="edition-hero-title">{editionCopy.titulo}</h1>
          </div>
        </div>
      )}

      <div className="edition-reading-layout">
        <aside className="edition-sidebar">
          <SidebarShare edicao={edicao} setView={setView} />
        </aside>

        <div className="edition-body">
          {!edicao.capa && (
            <header className="edicao-header">
              <span className="edicao-numero-big">#{String(edicao.id).padStart(2, '0')}</span>
              <h1>{editionCopy.titulo}</h1>
              <p className="edicao-meta">
                {editionCopy.data} · {editionCopy.bairro} · {readingTime(content)}
              </p>
            </header>
          )}
          {edicao.capa && (
            <p className="edicao-meta edition-meta-row">
              #{String(edicao.id).padStart(2, '0')} · {editionCopy.data} · {readingTime(content)}
            </p>
          )}
          <article className="edicao-content">
            {shouldShowTranslatedVersion && (unlocked || !hasMore) ? (
              visibleLoading && !translatedFull ? (
                <p className="translation-loading">{t('edition.translateLoading')}</p>
              ) : translatedFull ? (
                <ReactMarkdown>{translatedFull}</ReactMarkdown>
              ) : (
                <>
                  <TranslationFallbackNotice />
                  <ReactMarkdown>{content}</ReactMarkdown>
                </>
              )
            ) : shouldShowTranslatedVersion ? (
              visibleLoading && !translatedTeaser ? (
                <p className="translation-loading">{t('edition.translateLoading')}</p>
              ) : translatedTeaser ? (
                <ReactMarkdown>{translatedTeaser}</ReactMarkdown>
              ) : (
                <>
                  <TranslationFallbackNotice />
                  <ReactMarkdown>{teaser}</ReactMarkdown>
                </>
              )
            ) : (
              <>
                <ReactMarkdown>{teaser}</ReactMarkdown>
                {hasMore && !unlocked && <EdicaoGate onUnlock={() => setUnlocked(true)} />}
                {hasMore && unlocked && <ReactMarkdown>{rest}</ReactMarkdown>}
              </>
            )}
            {shouldShowTranslatedVersion && hasMore && !unlocked && <EdicaoGate onUnlock={() => setUnlocked(true)} />}
          </article>
          {(unlocked || !hasMore) && (
            <>
              {LOCATIONS.some(location => location.edicaoId === edicao.id) && (
                <button className="mapa-link-btn" onClick={() => setView('mapa')}>
                  {t('edition.mapLink')}
                </button>
              )}
              <CustomComments slug={edicao.slug} />
            </>
          )}
        </div>
      </div>
    </div>
  )
}
