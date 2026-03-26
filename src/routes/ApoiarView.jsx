export default function ApoiarView({ setView }) {
  return (
    <div className="apoiar-view">
      <div className="apoiar-inner">
        <button className="back-btn" onClick={() => setView('home')}>← Arquivo</button>

        <header className="apoiar-header">
          <p className="home-kicker">APOIAR O PROJETO</p>
          <h1 className="apoiar-title">Este projeto existe porque você lê.</h1>
        </header>

        <div className="apoiar-body">
          <p>Notas de Berlim não tem anúncios. Não tem paywall. Não tem algoritmo tentando te prender. É um caderno aberto — textos sobre viver em Berlim, escritos às pressas entre uma pesquisa e outra, entre um mercado e um U-Bahn.</p>
          <p>Manter isso vivo tem um custo pequeno em dinheiro e um custo grande em tempo. Se uma edição te fez sorrir, pensar, ou sentir curiosidade por um lugar que você nunca visitou, você pode retribuir com qualquer valor.</p>
          <p>Todo apoio vai direto para o projeto — hospedagem, domínio, e para que eu continue escrevendo sem transformar isso em obrigação.</p>
        </div>

        <a
          href="https://ko-fi.com/renatoxavier"
          target="_blank"
          rel="noopener noreferrer"
          className="apoiar-btn"
        >
          Apoiar via Ko-fi →
        </a>

        <p className="apoiar-note">Pagamento seguro via Ko-fi. Qualquer valor, uma única vez ou mensalmente.</p>
      </div>
    </div>
  )
}
