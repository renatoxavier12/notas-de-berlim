import { useTranslation } from 'react-i18next'

export default function ApoiarView({ setView }) {
  const { t } = useTranslation()

  return (
    <div className="apoiar-view">
      <div className="apoiar-inner">
        <button className="back-btn" onClick={() => setView('home')}>{t('about.back')}</button>

        <header className="apoiar-header">
          <p className="home-kicker">APOIAR O PROJETO</p>
          <h1 className="apoiar-title">Se este trabalho te acompanha, você pode apoiar sem fricção.</h1>
        </header>

        <div className="apoiar-body">
          <p>Notas de Berlim é um projeto independente, sem anúncios e sem paywall. O apoio ajuda a manter o site no ar e dá fôlego para que novas edições continuem saindo com calma.</p>
          <p>Se você quiser contribuir, o caminho mais simples é pelo Ko-fi. É discreto, direto e não expõe dados sensíveis na página.</p>
        </div>

        <div className="apoiar-actions">
          <a
            href="https://ko-fi.com/renatoxavier"
            target="_blank"
            rel="noopener noreferrer"
            className="apoiar-btn"
          >
            Apoiar no Ko-fi
          </a>
          <a
            href="mailto:renatoxavier12@gmail.com?subject=Apoio%20ao%20Notas%20de%20Berlim"
            className="apoiar-link"
          >
            Prefere outro caminho? Fale comigo por e-mail.
          </a>
        </div>
      </div>
    </div>
  )
}
