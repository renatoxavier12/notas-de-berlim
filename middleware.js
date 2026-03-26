/* global process */

export const config = {
  matcher: ['/edicoes/:slug*'],
}

function toIsoDate(dateString) {
  const match = dateString.match(/^(\d{1,2})\s+de\s+(.+?)\s+de\s+(\d{4})$/i)
  if (!match) return ''

  const months = {
    janeiro: 0,
    fevereiro: 1,
    marco: 2,
    março: 2,
    abril: 3,
    maio: 4,
    junho: 5,
    julho: 6,
    agosto: 7,
    setembro: 8,
    outubro: 9,
    novembro: 10,
    dezembro: 11,
  }

  const month = months[match[2].trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')]
  if (month == null) return ''

  return new Date(Number(match[3]), month, Number(match[1]), 12, 0, 0).toISOString()
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
    const bairro = esc(get('bairro') || 'Berlim')
    const published = get('data')
    const publishedIso = toIsoDate(published)
    const capa = get('capa')
    const image = capa ? `https://notasdeberlim.com${capa}` : 'https://notasdeberlim.com/og.jpg'
    const pageUrl = `https://notasdeberlim.com/edicoes/${slug}`
    const jsonLd = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: get('title') || 'Notas de Berlim',
      description: get('teaser') || 'Comida, bebida, cultura, ruas e vida em Kreuzberg.',
      image: [image],
      url: pageUrl,
      mainEntityOfPage: pageUrl,
      articleSection: get('bairro') || 'Berlim',
      inLanguage: 'pt-BR',
      isAccessibleForFree: true,
      datePublished: publishedIso || undefined,
      dateModified: publishedIso || undefined,
      author: {
        '@type': 'Person',
        name: 'Renato Xavier',
      },
      publisher: {
        '@type': 'Organization',
        name: 'Notas de Berlim',
        url: 'https://notasdeberlim.com',
      },
    }).replace(/</g, '\\u003c')

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
  <meta property="article:section" content="${bairro}">
  ${publishedIso ? `<meta property="article:published_time" content="${publishedIso}">` : ''}
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${title} — Notas de Berlim">
  <meta name="twitter:description" content="${teaser}">
  <meta name="twitter:image" content="${image}">
  <script type="application/ld+json">${jsonLd}</script>
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
