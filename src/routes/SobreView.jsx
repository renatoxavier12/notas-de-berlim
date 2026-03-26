import { useTranslation } from 'react-i18next'
import { EDICOES, getEditionCopy } from '../lib/site'

const IconInstagram = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
)

const IconSubstack = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M22.539 8.242H1.46V5.406h21.079v2.836zM1.46 10.812V24L12 18.11 22.54 24V10.812H1.46zM22.54 0H1.46v2.836h21.079V0z" />
  </svg>
)

const IconMail = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
)

const IconSupport = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 21s-6.5-4.35-9-8.19C.78 9.39 2.16 5 6.26 5c2.24 0 3.62 1.24 4.4 2.48C11.44 6.24 12.82 5 15.06 5c4.1 0 5.48 4.39 3.26 7.81C18.5 16.65 12 21 12 21z" />
  </svg>
)

export default function SobreView({ setView, setEdicaoAtiva }) {
  const { t } = useTranslation()

  return (
    <div className="sobre-view">
      <div className="sobre-inner">
        <button className="back-btn" onClick={() => setView('home')}>{t('about.back')}</button>

        <div className="sobre-hero">
          <div className="sobre-foto-placeholder">
            <img src="/euetiao.jpg" alt={t('about.photoAlt')} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div className="sobre-bio">
            <p className="home-kicker">{t('about.kicker')}</p>
            <h1 className="sobre-nome">{t('about.name')}</h1>
            <p className="sobre-texto">
              {t('about.bio1')}
            </p>
            <p className="sobre-texto">
              <em>{t('about.bio2')}</em>
            </p>
            <div className="sobre-links">
              <div className="social-group">
                <a href="https://instagram.com/renatoxavierrr" target="_blank" rel="noopener noreferrer" className="sobre-link" aria-label="Instagram">
                  <span style={{ display: 'flex' }}><IconInstagram /></span>
                </a>
                <a href="https://renatoxavier.substack.com" target="_blank" rel="noopener noreferrer" className="sobre-link" aria-label="Substack">
                  <span style={{ display: 'flex' }}><IconSubstack /></span>
                </a>
                <a href="mailto:renatoxavier12@gmail.com" className="sobre-link" aria-label="Contato">
                  <span style={{ display: 'flex' }}><IconMail /></span>
                </a>
              </div>
              <button type="button" onClick={() => setView('apoiar')} className="sobre-link support-btn support-btn--yellow">
                <span style={{ display: 'flex' }}><IconSupport /></span>
                <span className="support-text">{t('about.support')}</span>
              </button>
            </div>
          </div>
        </div>

        <div className="sobre-edicoes">
          <p className="section-label">{t('about.published')}</p>
          {EDICOES.map(edicao => {
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
                  <p className="edicao-meta">{edicao.data} · {editionCopy.bairro}</p>
                </div>
                <span className="edicao-arrow">→</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
