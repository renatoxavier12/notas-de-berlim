import { useTranslation } from 'react-i18next'
import { EDICOES, formatEditionDate, getEditionCopy } from '../lib/site'

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
              <p>Passo os dias pensando em Du Bois, algoritmos e raça.</p>
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
              <p className="sobre-contato-label">Contato &amp; Redes</p>
              <p className="sobre-contato-nome">Renato Xavier</p>
              <a href="mailto:renatoxavier12@gmail.com" className="sobre-contato-link">
                renatoxavier12@gmail.com
              </a>
              <div className="sobre-contato-social">
                <a href="https://instagram.com/renatoxavierrr" target="_blank" rel="noopener noreferrer" className="sobre-contato-link">
                  Instagram
                </a>
                <a href="https://renatoxavier.substack.com" target="_blank" rel="noopener noreferrer" className="sobre-contato-link">
                  Substack
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
                className="edicao-card"
                onClick={() => {
                  setEdicaoAtiva(edicao)
                  setView('edicao')
                }}
              >
                <span className="edicao-numero">#{String(edicao.id).padStart(2, '0')}</span>
                <div className="edicao-info">
                  <h2>{editionCopy.titulo}</h2>
                  <p className="edicao-meta">{formatEditionDate(edicao.data, locale)} · {editionCopy.bairro}</p>
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
