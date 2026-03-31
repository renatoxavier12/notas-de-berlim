import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import ReactMarkdown from 'react-markdown'
import { DIARIO, getCookie, setCookie } from '../lib/site'

const IconHeart = ({ filled }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
)

function DiarioComments({ slug }) {
  const { t } = useTranslation()
  const [comments, setComments] = useState([])
  const [formData, setFormData] = useState({ name: '', text: '', honeypot: '' })
  const [status, setStatus] = useState(null)

  useEffect(() => {
    fetch(`/api/comments?slug=diario-${slug}`)
      .then(r => r.json())
      .then(data => setComments(Array.isArray(data) ? data : []))
      .catch(() => setComments([]))
  }, [slug])

  async function handleSubmit(e) {
    e.preventDefault()
    setStatus('loading')
    try {
      const r = await fetch(`/api/comments?slug=diario-${slug}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      if (r.ok) { setStatus('ok'); setFormData({ name: '', text: '', honeypot: '' }) }
      else setStatus('error')
    } catch { setStatus('error') }
  }

  return (
    <div className="diario-comments">
      {comments.length > 0 && (
        <div className="comments-list" style={{ marginBottom: 16 }}>
          {comments.map(c => (
            <div key={c.id} className="comment-item">
              <div className="comment-header">
                <span className="comment-author">{c.name}</span>
                <span className="comment-date">{new Date(c.timestamp).toLocaleDateString('pt-BR')}</span>
              </div>
              <p className="comment-text">{c.text}</p>
            </div>
          ))}
        </div>
      )}
      {status === 'ok' ? (
        <p className="comment-success">{t('edition.commentSuccess')}</p>
      ) : (
        <form className="comment-form" onSubmit={handleSubmit}>
          <input type="text" name="honeypot" style={{ display: 'none' }} value={formData.honeypot} onChange={e => setFormData({ ...formData, honeypot: e.target.value })} tabIndex="-1" autoComplete="off" />
          <input type="text" placeholder={t('edition.commentName')} className="comment-input-name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
          <textarea placeholder={t('edition.commentText')} className="comment-input-text" required value={formData.text} onChange={e => setFormData({ ...formData, text: e.target.value })} />
          <button type="submit" className="comment-submit-btn" disabled={status === 'loading'}>
            {status === 'loading' ? t('common.sending') : t('edition.sendComment')}
          </button>
        </form>
      )}
      {status === 'error' && <p className="comment-error">{t('edition.commentError')}</p>}
    </div>
  )
}

function youtubeId(url) {
  if (!url) return null
  const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/))([A-Za-z0-9_-]{11})/)
  return m ? m[1] : null
}

function youtubePoster(url) {
  const id = youtubeId(url)
  return id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : null
}

function isLocalVideo(url) {
  return typeof url === 'string' && url.startsWith('/')
}

function getDiarioKind(post) {
  if (post.video && (youtubeId(post.video) || isLocalVideo(post.video))) return 'Vídeo'
  if (post.foto) return 'Foto'
  return 'Nota'
}

function DiarioPost({ post }) {
  const likeKey = `nb_like_diario_${post.slug}`
  const [liked, setLiked] = useState(() => getCookie(likeKey) === 'true')
  const [showComments, setShowComments] = useState(false)
  const [videoOpen, setVideoOpen] = useState(false)
  const kind = getDiarioKind(post)
  const videoId = youtubeId(post.video)

  function toggleLike() {
    const next = !liked
    setLiked(next)
    setCookie(likeKey, String(next))
  }

  return (
    <article className="diario-post">
      <div className="diario-meta-row">
        <time className="diario-data">{post.data}</time>
        <span className="diario-kind">{kind}</span>
      </div>
      <div className="diario-texto">
        <ReactMarkdown>{post.content}</ReactMarkdown>
      </div>
      {post.foto && (
        <img src={post.foto} alt="" className="diario-foto" loading="lazy" />
      )}
      {post.video && videoId && (
        <div className={`diario-video${videoOpen ? ' is-open' : ''}`}>
          {!videoOpen && (
            <button
              type="button"
              className="diario-video-trigger"
              onClick={() => setVideoOpen(true)}
              aria-label="Reproduzir vídeo"
            >
              <div
                className="diario-video-backdrop"
                style={{ backgroundImage: `url(${youtubePoster(post.video)})` }}
              />
              <img
                src={youtubePoster(post.video)}
                alt=""
                className="diario-video-poster"
                loading="lazy"
              />
              <span className="diario-video-play" aria-hidden="true">Play</span>
            </button>
          )}
          {videoOpen && (
            <iframe
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`}
              title="Vídeo do Diário"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          )}
        </div>
      )}
      {post.video && isLocalVideo(post.video) && (
        <video
          className="diario-video-local"
          src={post.video}
          controls
          playsInline
          preload="metadata"
        />
      )}
      <div className="diario-actions">
        <button
          className={`diario-like${liked ? ' liked' : ''}`}
          onClick={toggleLike}
          aria-label={liked ? 'Remover curtida' : 'Curtir'}
        >
          <IconHeart filled={liked} />
          <span>{liked ? 'Curtido' : 'Curtir'}</span>
        </button>
        <button
          className="diario-comment-toggle"
          onClick={() => setShowComments(v => !v)}
        >
          {showComments ? 'Fechar' : 'Comentar'}
        </button>
      </div>
      {showComments && <DiarioComments slug={post.slug} />}
    </article>
  )
}

export default function DiarioView() {
  return (
    <div className="diario-view">
      <div className="diario-inner">
        <header className="diario-header">
          <div className="diario-kicker-row">
            <p className="home-kicker">BERLIM, 2026</p>
          </div>
          <h1 className="diario-titulo">Diário</h1>
          <p className="diario-subtitulo">Notas do dia em Berlim.</p>
        </header>
        <div className="diario-feed">
          {DIARIO.map(post => (
            <DiarioPost key={post.slug} post={post} />
          ))}
        </div>
      </div>
    </div>
  )
}
