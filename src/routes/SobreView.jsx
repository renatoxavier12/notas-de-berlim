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

const IconKofi = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M5.5 1c0 0 .5 1-1 2s-1 2 0 3" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    <path d="M8.5 0c0 0 .5 1-1 2s-1 2 0 3" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    <path d="M11.5 1c0 0 .5 1-1 2s-1 2 0 3" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    <path d="M23.881 8.948c-.773-4.085-4.859-4.593-4.859-4.593H.724c-.304 0-.55.246-.55.55v15.82c0 .304.246.55.55.55h12.726c.304 0 .55-.246.55-.55v-2.035c3.546.109 4.812-1.449 5.069-2.25 1.479.059 4.393-.451 4.812-3.214.26-1.685-.021-3.278-.851-4.278zm-3.235 5.546c-.297 1.93-1.556 2.198-2.359 2.231V9.296c.553.053 2.129.231 2.584 1.449.25.669.155 2.172-.225 3.749z" />
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
              <a href="https://ko-fi.com/renatoxavier" target="_blank" rel="noopener noreferrer" className="sobre-link support-btn support-btn--yellow">
                <span style={{ display: 'flex' }}><IconKofi /></span>
                <span className="support-text">{t('about.support')}</span>
              </a>
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
