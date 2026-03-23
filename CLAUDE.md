# CLAUDE.md — Notas de Berlim

---

## Projeto

Blog pessoal sobre a experiência de viver em Berlim. Caderno de notas sobre o dia a dia — comida, bairros, cultura, detalhes da vida real.

**Stack:** React + Vite, Vercel, markdown para conteúdo.

---

## Infraestrutura

- **Domínio:** notasdeberlim.com — configurado e funcionando
- **Deploy:** automático via Vercel no push do GitHub (`main`)
- **Ko-fi:** integrado (`ko-fi.com/renatoxavier`) — aguardando aprovação do Stripe para ativar pagamentos
- **Comentários:** sistema customizado implementado
- **Analytics:** Vercel Analytics

---

## Conteúdo

Textos em `src/edicoes/*.md` com frontmatter:

```
---
id: 1
title: Título
data: 14 de março de 2026
bairro: Kreuzberg / Wrangelkiez
teaser: Frase de abertura curta.
capa: /capa-01.jpg
---
```

Para publicar novo texto: criar arquivo `.md` em `src/edicoes/`, adicionar imagem de capa em `public/` se houver, fazer push.

---

## Design

- Amarelo `#F0D722` como único acento — usado em labels tipo "BERLIM, 2026", "O AUTOR", "EDIÇÕES"
- Ícones sociais neutros (preto), botão Apoie-me em amarelo com hover invertido
- Modo escuro disponível
- Tipografia editorial, sem cores de marca externas nos ícones

---

## Identidade

Tom: pessoal, direto, sem firula acadêmica. Primeira pessoa. Detalhes concretos do cotidiano.
