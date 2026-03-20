const EDICOES = {
  '01': {
    titulo: 'Primeira Semana',
    descricao: 'Chegamos. O apartamento é Altbau, falta uma leiteira, e os alemães reciclam até o despertador.',
    capa: '/capa-01.jpg',
  },
}

const BOTS = [
  'facebookexternalhit', 'twitterbot', 'linkedinbot', 'whatsapp',
  'telegrambot', 'slackbot', 'discordbot', 'googlebot',
]

export default function handler(req, res) {
  const slug = req.query.slug || '01'
  const edicao = EDICOES[slug]
  const ua = (req.headers['user-agent'] || '').toLowerCase()
  const isBot = BOTS.some(b => ua.includes(b))

  if (!isBot) {
    return res.redirect(302, `/#edicao-${slug}`)
  }

  const base = 'https://notasdeberlim.com'
  const titulo = edicao ? `${edicao.titulo} — Notas de Berlim` : 'Notas de Berlim'
  const descricao = edicao ? edicao.descricao : 'Comida, bebida, cultura, ruas e vida em Kreuzberg.'
  const imagem = edicao?.capa ? `${base}${edicao.capa}` : `${base}/og.jpg`

  res.setHeader('Content-Type', 'text/html; charset=utf-8')
  res.setHeader('Cache-Control', 's-maxage=3600')
  return res.status(200).send(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${titulo}</title>
  <meta property="og:type" content="article" />
  <meta property="og:url" content="${base}/edicoes/${slug}" />
  <meta property="og:title" content="${titulo}" />
  <meta property="og:description" content="${descricao}" />
  <meta property="og:image" content="${imagem}" />
  <meta property="og:image:width" content="960" />
  <meta property="og:image:height" content="1280" />
  <meta property="og:locale" content="pt_BR" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${titulo}" />
  <meta name="twitter:description" content="${descricao}" />
  <meta name="twitter:image" content="${imagem}" />
  <meta http-equiv="refresh" content="0;url=${base}" />
</head>
<body></body>
</html>`)
}
