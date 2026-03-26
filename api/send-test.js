/* global Buffer, process */

import { buildEmailContent, getEmailConfig } from '../src/lib/_email.js'

export default async function handler(req, res) {
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

  const sendRes = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'api-key': process.env.BREVO_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      sender: { name: config.fromName, email: config.fromEmail },
      to: [{ email: config.testToEmail, name: config.testToName }],
      replyTo: { email: config.replyToEmail, name: config.fromName },
      subject: email.subject,
      htmlContent: email.html,
      textContent: email.text,
    }),
  })

  if (!sendRes.ok) {
    const err = await sendRes.json()
    return res.status(500).json({ error: 'Falha ao enviar', details: err })
  }

  return res.status(200).json({ ok: true, message: `Teste enviado para ${config.testToEmail}` })
}
