import { useTranslation } from 'react-i18next'
import { EDICOES, formatEditionDate, formatEditionNumber, getEditionCopy } from '../lib/site'

const IconInstagram = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
)

const IconSubstack = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M22.539 8.242H1.46V5.406h21.079v2.836zM1.46 10.812V24L12 18.11 22.54 24V10.812H1.46zM22.54 0H1.46v2.836h21.079V0z" />
  </svg>
)

const IconMail = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
)

export default function SobreView({ setView, setEdicaoAtiva }) {
  const { t, i18n } = useTranslation()
  const locale = i18n.resolvedLanguage === 'de'
    ? 'de-DE'
    : i18n.resolvedLanguage === 'en'
      ? 'en-US'
      : 'pt-BR'

  return (
    <div className="sobre-view">
      <div className="sobre-inner">

        <div className="sobre-layout">

          {/* ── Texto principal ── */}
          <div className="sobre-main">
            <p className="home-kicker">O AUTOR</p>

            <div className="sobre-bio-lines">
              <p>Sou Renato Xavier,</p>
              <p>pesquisador e autor deste caderno.</p>
              <p>Uma das minhas paixões é cozinhar.</p>
              <br />
              <p>Moro em Berlim desde março de 2026,</p>
              <p>como visiting researcher no <em>Ibero-Amerikanisches Institut</em>, fellow da FAPESP.</p>
              <br />
              <p>Sou pesquisador associado do CEBRAP.</p>
              <p>Pesquiso W.E.B. Du Bois, algoritmos e raça.</p>
              <br />
              <p>Bia é minha parceira.</p>
              <p>Tião é nosso spitz alemão.</p>
              <p>A leiteira queimou.</p>
              <br />
              <p>Notas de Berlim é um caderno aberto, cheio de anotações.</p>
            </div>
          </div>

          {/* ── Sidebar: foto + contato ── */}
          <aside className="sobre-sidebar">
            <img
              src="/euetiao.jpg"
              alt="Renato Xavier e Tião"
              className="sobre-foto-circular"
            />
            <div className="sobre-contato">
              <p className="sobre-contato-label">Contato e redes</p>
              <p className="sobre-contato-nome">Renato Xavier</p>
              <div className="sobre-contato-social">
                <a href="https://instagram.com/renatoxavierrr" target="_blank" rel="noopener noreferrer" className="sobre-icon-link" aria-label="Instagram">
                  <IconInstagram />
                </a>
                <a href="https://renatoxavier.substack.com" target="_blank" rel="noopener noreferrer" className="sobre-icon-link" aria-label="Substack">
                  <IconSubstack />
                </a>
                <a href="mailto:renatoxavier12@gmail.com" className="sobre-icon-link" aria-label="Email">
                  <IconMail />
                </a>
              </div>
            </div>
          </aside>

        </div>

        {/* ── Edições publicadas ── */}
        <div className="sobre-edicoes">
          <p className="section-label">{t('about.published')}</p>
          {EDICOES.map(edicao => {
            const editionCopy = getEditionCopy(edicao, t)
            return (
              <button
                key={edicao.id}
                className="sobre-edicao-card"
                onClick={() => {
                  setEdicaoAtiva(edicao)
                  setView('edicao')
                }}
              >
                <span className="sobre-edicao-numero">{formatEditionNumber(edicao)}</span>
                <div className="sobre-edicao-info">
                  <h2>{editionCopy.titulo}</h2>
                  <p className="sobre-edicao-meta">{formatEditionDate(edicao.data, locale)} · {editionCopy.bairro}</p>
                </div>
                <span className="sobre-edicao-arrow">→</span>
              </button>
            )
          })}
        </div>

      </div>
    </div>
  )
}
