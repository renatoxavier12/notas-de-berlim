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

  const slugs = []
  if (ghRes.ok) {
    const files = await ghRes.json()
    files
      .filter(f => f.name.endsWith('.md'))
      .forEach(f => slugs.push(f.name.replace('.md', '')))
  }

  const staticUrls = [
    { loc: 'https://notasdeberlim.com/', priority: '1.0', changefreq: 'weekly' },
    { loc: 'https://notasdeberlim.com/sobre', priority: '0.5', changefreq: 'monthly' },
    { loc: 'https://notasdeberlim.com/mapa', priority: '0.5', changefreq: 'monthly' },
  ]

  const edicaoUrls = slugs.map(slug => ({
    loc: `https://notasdeberlim.com/edicoes/${slug}`,
    priority: '0.8',
    changefreq: 'never',
  }))

  const allUrls = [...staticUrls, ...edicaoUrls]

  const urlEntries = allUrls.map(u => `
  <url>
    <loc>${u.loc}</loc>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>`

  res.setHeader('Content-Type', 'application/xml; charset=utf-8')
  res.setHeader('Cache-Control', 's-maxage=3600')
  res.send(xml)
}
