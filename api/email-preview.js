function buildEmailHtml(markdown, slug) {
  const titleMatch = markdown.match(/^title:\s*["']?(.+?)["']?\s*$/m)
  const title = titleMatch ? titleMatch[1].trim() : 'Nova edição'
  const body = markdown.replace(/^---[\s\S]*?---\n?/, '').trim()

  const htmlBody = body
    .split('\n\n')
    .map(p => p.trim())
    .filter(Boolean)
    .map(p => {
      if (p.startsWith('#')) return `<h2 style="font-size:20px;margin:32px 0 12px;">${p.replace(/^#+\s*/, '')}</h2>`
      return `<p style="margin:0 0 20px;line-height:1.7;">${p
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        .replace(/\n/g, '<br>')
      }</p>`
    })
    .join('\n')

  const edicaoUrl = `https://notasdeberlim.com/edicoes/${slug}`

  return `<!doctype html>
<html>
<head><meta charset="utf-8"><title>${title}</title></head>
<body style="margin:0;padding:0;background:#f5f5f5;">
  <div style="font-family:Georgia,serif;max-width:600px;margin:40px auto;padding:40px;background:#fff;color:#0a0a0a;">
    <div style="border-top:4px solid #F0D722;padding-top:24px;margin-bottom:32px;">
      <a href="https://notasdeberlim.com" style="font-family:monospace;font-size:12px;color:#666;text-decoration:none;text-transform:uppercase;letter-spacing:2px;">Notas de Berlim</a>
    </div>
    <h1 style="font-size:28px;font-weight:bold;margin:0 0 32px;line-height:1.3;">${title}</h1>
    ${htmlBody}
    <div style="margin-top:40px;padding-top:24px;border-top:1px solid #e0e0e0;">
      <a href="${edicaoUrl}" style="background:#F0D722;color:#0a0a0a;padding:12px 24px;text-decoration:none;font-weight:bold;font-family:monospace;display:inline-block;">Ler no site →</a>
    </div>
    <div style="margin-top:40px;font-family:monospace;font-size:11px;color:#999;">
      Você recebe este email porque se inscreveu em notasdeberlim.com
    </div>
  </div>
</body>
</html>`
}

export default async function handler(req, res) {
  const { slug, secret } = req.query

  if (secret !== process.env.GITHUB_WEBHOOK_SECRET) {
    return res.status(401).send('Não autorizado')
  }

  if (!slug) return res.status(400).send('Parâmetro slug ausente')

  const file = `src/edicoes/${slug}.md`

  const ghRes = await fetch(
    `https://api.github.com/repos/renatoxavier12/notas-de-berlim/contents/${file}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
        Accept: 'application/vnd.github.v3+json',
      },
    }
  )

  if (!ghRes.ok) return res.status(404).send('Edição não encontrada')

  const { content } = await ghRes.json()
  const markdown = Buffer.from(content, 'base64').toString('utf-8')
  const html = buildEmailHtml(markdown, slug)

  res.setHeader('Content-Type', 'text/html')
  res.send(html)
}
