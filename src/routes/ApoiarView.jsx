import { useState } from 'react'
import { PIX_KEY, PIX_LABEL, SUPPORT_BANK, SUPPORT_RECEIVER } from '../lib/supportConfig'

export default function ApoiarView({ setView }) {
  const [copyStatus, setCopyStatus] = useState('idle')

  async function handleCopyPix() {
    try {
      await navigator.clipboard.writeText(PIX_KEY)
      setCopyStatus('copied')
    } catch {
      setCopyStatus('error')
    }
  }

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
          <p>Manter isso vivo tem um custo pequeno em dinheiro e um custo grande em tempo. Se uma edição te fez sorrir, pensar, ou sentir curiosidade por um lugar que você nunca visitou, você pode retribuir com qualquer valor, sem assinatura e sem cadastro.</p>
          <p>Todo apoio vai direto para o projeto — hospedagem, domínio, e para que eu continue escrevendo sem transformar isso em obrigação.</p>
        </div>

        <div className="apoiar-pix-box">
          <p className="apoiar-pix-label">{PIX_LABEL}</p>
          <code className="apoiar-pix-key">{PIX_KEY}</code>
        </div>

        <button type="button" onClick={handleCopyPix} className="apoiar-btn">
          Apoie-me
        </button>

        <p className="apoiar-note">
          {copyStatus === 'copied' ? 'Chave copiada.' : copyStatus === 'error' ? 'Nao foi possivel copiar automaticamente. Copie a chave manualmente.' : `Contribuicao destinada a ${SUPPORT_RECEIVER}, via ${SUPPORT_BANK}.`}
        </p>
      </div>
    </div>
  )
}
