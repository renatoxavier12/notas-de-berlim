export default async function handler(req, res) {
  const ghRes = await fetch(
    'https://api.github.com/repos/renatoxavier12/notas-de-berlim/contents/src/edicoes',
    {
      headers: {
        Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
        Accept: 'application/vnd.github.v3+json',
      },
    }
  )

  if (!ghRes.ok) return res.status(500).send('Erro ao buscar edições')

  const files = await ghRes.json()
  const mdFiles = files.filter(f => f.name.endsWith('.md'))

  const editions = await Promise.all(
    mdFiles.map(async f => {
      const r = await fetch(f.download_url)
      const markdown = await r.text()

      const get = (key) => {
        const m = markdown.match(new RegExp(`^${key}:\\s*["']?(.+?)["']?\\s*$`, 'm'))
        return m ? m[1].trim() : ''
      }

      return {
        slug: f.name.replace('.md', ''),
        title: get('title'),
        teaser: get('teaser'),
        data: get('data'),
        id: parseInt(get('id')) || 0,
      }
    })
  )

  editions.sort((a, b) => b.id - a.id)

  const escape = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

  const items = editions.map(e => `
    <item>
      <title>${escape(e.title)}</title>
      <link>https://notasdeberlim.com/edicoes/${e.slug}</link>
      <description>${escape(e.teaser)}</description>
      <guid isPermaLink="true">https://notasdeberlim.com/edicoes/${e.slug}</guid>
      <pubDate>${e.data}</pubDate>
    </item>`).join('\n')

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Notas de Berlim</title>
    <link>https://notasdeberlim.com</link>
    <description>Comida, bebida, cultura, ruas e vida em Kreuzberg.</description>
    <language>pt-BR</language>
    <atom:link href="https://notasdeberlim.com/api/feed" rel="self" type="application/rss+xml"/>
    ${items}
  </channel>
</rss>`

  res.setHeader('Content-Type', 'application/rss+xml; charset=utf-8')
  res.setHeader('Cache-Control', 's-maxage=3600')
  res.send(rss)
}
