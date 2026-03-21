export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  if (req.query.secret !== process.env.GITHUB_WEBHOOK_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const { ref, commits } = req.body

  if (ref !== 'refs/heads/main') {
    return res.status(200).json({ ok: true, skipped: 'not main' })
  }

  const newEditions = (commits || [])
    .flatMap(c => c.added || [])
    .filter(f => f.startsWith('src/edicoes/') && f.endsWith('.md'))

  if (newEditions.length === 0) {
    return res.status(200).json({ ok: true, skipped: 'no new editions' })
  }

  const file = newEditions[0]
  const slug = file.replace('src/edicoes/', '').replace('.md', '')

  const ghRes = await fetch(
    `https://api.github.com/repos/renatoxavier12/notas-de-berlim/contents/${file}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
        Accept: 'application/vnd.github.v3+json',
      },
    }
  )

  if (!ghRes.ok) return res.status(500).json({ error: 'Failed to fetch file' })

  const { content } = await ghRes.json()
  const markdown = Buffer.from(content, 'base64').toString('utf-8')

  const titleMatch = markdown.match(/^title:\s*["']?(.+?)["']?\s*$/m)
  const title = titleMatch ? titleMatch[1].trim() : 'Nova edição'
  const body = markdown.replace(/^---[\s\S]*?---\n?/, '').trim()

  const htmlBody = body
    .split('\n\n')
    .map(p => p.trim())
    .filter(Boolean)
    .map(p => {
      if (p.startsWith('#')) return `<h2>${p.replace(/^#+\s*/, '')}</h2>`
      return `<p>${p
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        .replace(/\n/g, '<br>')
      }</p>`
    })
    .join('\n')

  const edicaoUrl = `https://notasdeberlim.com/edicoes/${slug}`

  const htmlContent = `
    <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; color: #0a0a0a;">
      <div style="border-top: 4px solid #F0D722; padding-top: 24px; margin-bottom: 32px;">
        <a href="https://notasdeberlim.com" style="font-family: monospace; font-size: 12px; color: #666; text-decoration: none; text-transform: uppercase; letter-spacing: 2px;">Notas de Berlim</a>
      </div>
      <h1 style="font-size: 28px; font-weight: bold; margin-bottom: 32px; line-height: 1.3;">${title}</h1>
      ${htmlBody}
      <div style="margin-top: 40px; padding-top: 24px; border-top: 1px solid #e0e0e0;">
        <a href="${edicaoUrl}" style="background: #F0D722; color: #0a0a0a; padding: 12px 24px; text-decoration: none; font-weight: bold; font-family: monospace;">Ler no site →</a>
      </div>
    </div>
  `

  const campaignRes = await fetch('https://api.brevo.com/v3/emailCampaigns', {
    method: 'POST',
    headers: {
      'api-key': process.env.BREVO_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: `Notas de Berlim — ${title}`,
      subject: title,
      sender: { name: 'Renato Xavier', email: 'renatoxavier12@gmail.com' },
      type: 'classic',
      htmlContent,
      recipients: { listIds: [2] },
    }),
  })

  const campaign = await campaignRes.json()

  if (!campaign.id) {
    return res.status(500).json({ error: 'Failed to create campaign', details: campaign })
  }

  await fetch(`https://api.brevo.com/v3/emailCampaigns/${campaign.id}/sendNow`, {
    method: 'POST',
    headers: { 'api-key': process.env.BREVO_API_KEY },
  })

  return res.status(200).json({ ok: true, campaignId: campaign.id, title })
}
