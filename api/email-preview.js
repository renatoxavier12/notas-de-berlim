/* global Buffer, process */

import { buildEmailContent } from '../src/lib/_email.js'

export default async function handler(req, res) {
  const { slug, secret } = req.query

  if (secret !== process.env.GITHUB_WEBHOOK_SECRET) {
    return res.status(401).send('Não autorizado')
  }

  if (!slug) return res.status(400).send('Parâmetro slug ausente')

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

  if (!ghRes.ok) return res.status(404).send('Edição não encontrada')

  const { content } = await ghRes.json()
  const markdown = Buffer.from(content, 'base64').toString('utf-8')
  const email = buildEmailContent(markdown, slug)

  res.setHeader('Content-Type', 'text/html')
  res.send(email.html)
}
