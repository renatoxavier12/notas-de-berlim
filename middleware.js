export const config = {
  matcher: ['/edicoes/:slug*'],
}

export default async function middleware(request) {
  const url = new URL(request.url)
  const slug = url.pathname.replace('/edicoes/', '').split('/')[0]
  if (!slug) return

  const ua = request.headers.get('user-agent') || ''
  const isCrawler = /bot|crawl|spider|facebot|twitterbot|whatsapp|telegram|linkedinbot|slackbot|discordbot|prerender|googlebot/i.test(ua)
  if (!isCrawler) return

  try {
    const ghRes = await fetch(
      `https://api.github.com/repos/renatoxavier12/notas-de-berlim/contents/src/edicoes/${slug}.md`,
      {
        headers: {
          Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
          Accept: 'application/vnd.github.v3+json',
        },
      }
    )
    if (!ghRes.ok) return

    const data = await ghRes.json()
    const markdown = atob(data.content.replace(/\n/g, ''))

    const get = key => {
      const m = markdown.match(new RegExp(`^${key}:\\s*["']?(.+?)["']?\\s*$`, 'm'))
      return m ? m[1].trim() : ''
    }

    const esc = s => s
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')

    const title = esc(get('title') || 'Notas de Berlim')
    const teaser = esc(get('teaser') || 'Comida, bebida, cultura, ruas e vida em Kreuzberg.')
    const capa = get('capa')
    const image = capa ? `https://notasdeberlim.com${capa}` : 'https://notasdeberlim.com/og.jpg'
    const pageUrl = `https://notasdeberlim.com/edicoes/${slug}`

    const html = `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>${title} — Notas de Berlim</title>
  <meta name="description" content="${teaser}">
  <meta property="og:type" content="article">
  <meta property="og:url" content="${pageUrl}">
  <meta property="og:title" content="${title} — Notas de Berlim">
  <meta property="og:description" content="${teaser}">
  <meta property="og:image" content="${image}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:locale" content="pt_BR">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${title} — Notas de Berlim">
  <meta name="twitter:description" content="${teaser}">
  <meta name="twitter:image" content="${image}">
  <meta http-equiv="refresh" content="0; url=${pageUrl}">
</head>
<body>
  <h1>${title}</h1>
  <p>${teaser}</p>
  <p><a href="${pageUrl}">Ler no Notas de Berlim →</a></p>
</body>
</html>`

    return new Response(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=3600',
      },
    })
  } catch {
    return
  }
}
