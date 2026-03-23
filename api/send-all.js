function buildEmailHtml(markdown, slug) {
  const titleMatch = markdown.match(/^title:\s*["']?(.+?)["']?\s*$/m)
  const title = titleMatch ? titleMatch[1].trim() : 'Nova edição'
  const capaMatch = markdown.match(/^capa:\s*(.+)$/m)
  const capa = capaMatch ? capaMatch[1].trim() : null
  const body = markdown.replace(/^---[\s\S]*?---\n?/, '').trim()

  const htmlBody = body
    .split('\n\n')
    .map(p => p.trim())
    .filter(p => p !== '---')
    .slice(0, 3) 
    .map(p => {
      if (p.startsWith('#')) return `<h2 style="font-size:19px;margin:24px 0 12px;font-family:sans-serif;">${p.replace(/^#+\s*/, '')}</h2>`
      return `<p style="margin:0 0 16px;line-height:1.6;font-size:17px;">${p
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        .replace(/\n/g, '<br>')
      }</p>`
    })
    .join('\n')

  const edicaoUrl = `https://notasdeberlim.com/edicoes/${slug}`
  const capaHtml = capa
    ? `<div style="margin-bottom:32px;"><img src="https://notasdeberlim.com${capa}" alt="${title}" style="width:100%;max-width:600px;height:auto;display:block;border-radius:4px;"></div>`
    : ''

  return `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background-color:#ffffff;font-family:Georgia,serif;-webkit-font-smoothing:antialiased;">
  <div style="display:none;max-height:0;overflow:hidden;">
    Berlim, 2026. Notas sobre comida, cultura e a vida na capital alemã.
  </div>

  <div style="max-width:600px;margin:0 auto;padding:20px;color:#1a1a1a;">
    <header style="margin-bottom:32px;padding-bottom:12px;border-bottom:1px solid #eee;">
      <a href="https://notasdeberlim.com" style="color:#666;text-decoration:none;font-size:12px;text-transform:uppercase;letter-spacing:1px;font-family:sans-serif;">
        Notas de Berlim
      </a>
    </header>

    ${capaHtml}

    <h1 style="font-size:32px;font-weight:700;margin:0 0 24px;line-height:1.2;">${title}</h1>
    
    <div style="color:#222;">
      ${htmlBody}
    </div>

    <div style="margin-top:40px;padding:32px 0;border-top:1px solid #eee;text-align:center;">
      <a href="${edicaoUrl}" style="background-color:#F0D722;color:#000000;padding:14px 28px;text-decoration:none;font-weight:700;font-size:14px;border-radius:4px;display:inline-block;font-family:sans-serif;">
        LER EDIÇÃO COMPLETA
      </a>
    </div>

    <footer style="margin-top:40px;padding-top:20px;color:#888;font-size:12px;font-family:sans-serif;line-height:1.5;">
      <p>Você recebeu esta nota porque se inscreveu no site Notas de Berlim.</p>
      <p>Berlim, Alemanha.</p>
    </footer>
  </div>
</body>
</html>`
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { slug, secret } = req.query

  if (secret !== process.env.GITHUB_WEBHOOK_SECRET) {
    return res.status(401).json({ error: 'Não autorizado' })
  }

  if (!slug) return res.status(400).json({ error: 'Parâmetro slug ausente' })

  const file = `src/edicoes/${slug}.md`

  const ghRes = await fetch(
    `https://api.github.com/repos/renatoxavier12/notas-de-berlim/contents/${file}?t=${Date.now()}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
        Accept: 'application/vnd.github.v3+json',
      },
    }
  )

  if (!ghRes.ok) return res.status(404).json({ error: 'Edição não encontrada' })

  const { content } = await ghRes.json()
  const markdown = Buffer.from(content, 'base64').toString('utf-8')

  const titleMatch = markdown.match(/^title:\s*["']?(.+?)["']?\s*$/m)
  const title = titleMatch ? titleMatch[1].trim() : 'Nova edição'
  const htmlContent = buildEmailHtml(markdown, slug)

  const campaignRes = await fetch('https://api.brevo.com/v3/emailCampaigns', {
    method: 'POST',
    headers: {
      'api-key': process.env.BREVO_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: `Notas de Berlim — ${title}`,
      subject: title,
      sender: { name: 'Renato Xavier Notas de Berlim', email: 'renatoxavier12@gmail.com' },
      type: 'classic',
      htmlContent,
      recipients: { listIds: [2] },
    }),
  })

  const campaign = await campaignRes.json()

  if (!campaign.id) {
    return res.status(500).json({ error: 'Falha ao criar campanha', details: campaign })
  }

  await fetch(`https://api.brevo.com/v3/emailCampaigns/${campaign.id}/sendNow`, {
    method: 'POST',
    headers: { 'api-key': process.env.BREVO_API_KEY },
  })

  return res.status(200).json({ ok: true, campaignId: campaign.id, title })
}
