/* global Buffer, process */

import { buildEmailContent, getEmailConfig } from '../src/lib/_email.js'

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

  const email = buildEmailContent(markdown, slug)
  const config = getEmailConfig()
  const listId = Number(process.env.BREVO_LIST_ID || 2)

  const campaignRes = await fetch('https://api.brevo.com/v3/emailCampaigns', {
    method: 'POST',
    headers: {
      'api-key': process.env.BREVO_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: `Notas de Berlim — ${email.title}`,
      subject: email.subject,
      sender: { name: config.fromName, email: config.fromEmail },
      type: 'classic',
      htmlContent: email.html,
      textContent: email.text,
      replyTo: config.replyToEmail,
      recipients: { listIds: [listId] },
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

  return res.status(200).json({ ok: true, campaignId: campaign.id, title: email.title })
}
