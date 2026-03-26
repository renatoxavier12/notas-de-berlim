import { useState } from 'react'

const PIX_KEY = '556945b8-d34c-4f62-83b5-eca24317b69c'

export default function ApoiarView({ setView }) {
  const [copied, setCopied] = useState(false)

  async function copiar() {
    try {
      await navigator.clipboard.writeText(PIX_KEY)
    } catch {
      const el = document.createElement('textarea')
      el.value = PIX_KEY
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
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
          <p>Manter isso vivo tem um custo pequeno em dinheiro e um custo grande em tempo. Se uma edição te fez sorrir, pensar, ou sentir curiosidade por um lugar que você nunca visitou, você pode retribuir com qualquer valor.</p>
          <p>Todo apoio vai direto para o projeto — hospedagem, domínio, e para que eu continue escrevendo sem transformar isso em obrigação.</p>
        </div>

        <button className="apoiar-btn" onClick={copiar}>
          {copied ? '✓ Chave PIX copiada!' : 'Copiar chave PIX'}
        </button>

        <p className="apoiar-note">Qualquer valor, uma única vez ou quando quiser.</p>
      </div>
    </div>
  )
}
