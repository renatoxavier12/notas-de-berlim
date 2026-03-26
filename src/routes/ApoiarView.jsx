import { useTranslation } from 'react-i18next'

export default function ApoiarView({ setView }) {
  const { t } = useTranslation()

  return (
    <div className="apoiar-view">
      <div className="apoiar-inner">
        <button className="back-btn" onClick={() => setView('home')}>{t('about.back')}</button>

        <header className="apoiar-header">
          <p className="home-kicker">APOIAR O PROJETO</p>
          <h1 className="apoiar-title">Se este trabalho te acompanha, voce pode apoiar de forma simples.</h1>
        </header>

        <div className="apoiar-body">
          <p>Notas de Berlim é um projeto independente, sem anúncios e sem paywall. O apoio ajuda a manter o site no ar e dá fôlego para que novas edições continuem saindo com calma.</p>
          <p>Se voce quiser contribuir, me escreva. Eu te passo a melhor forma de apoio sem expor dados sensiveis aqui na pagina.</p>
        </div>

        <div className="apoiar-actions">
          <a
            href="mailto:renatoxavier12@gmail.com?subject=Apoio%20ao%20Notas%20de%20Berlim"
            className="apoiar-btn"
          >
            Escreva-me
          </a>
        </div>

        <p className="apoiar-note">Contato direto por e-mail.</p>
      </div>
    </div>
  )
}
