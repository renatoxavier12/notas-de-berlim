/* global process, Buffer */

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { password, slug, markdown } = req.body

  if (!password || password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Senha incorreta' })
  }

  if (!slug || !markdown) {
    return res.status(400).json({ error: 'slug e markdown são obrigatórios' })
  }

  const path = `src/edicoes/${slug}.md`
  const token = process.env.GITHUB_TOKEN
  const repo = 'renatoxavier12/notas-de-berlim'

  // Check if file already exists
  const checkRes = await fetch(
    `https://api.github.com/repos/${repo}/contents/${path}`,
    { headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github.v3+json' } }
  )

  let sha = null
  if (checkRes.ok) {
    const existing = await checkRes.json()
    sha = existing.sha
  }

  const content = Buffer.from(markdown, 'utf-8').toString('base64')

  const titleMatch = markdown.match(/^title:\s*(.+)$/m)
  const title = titleMatch ? titleMatch[1].trim() : slug

  const body = {
    message: sha
      ? `Atualiza "${title}" via admin`
      : `Publica "${title}" via admin`,
    content,
    branch: 'main',
    ...(sha ? { sha } : {}),
  }

  const ghRes = await fetch(
    `https://api.github.com/repos/${repo}/contents/${path}`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    }
  )

  if (!ghRes.ok) {
    const err = await ghRes.json()
    return res.status(500).json({ error: 'Falha ao publicar no GitHub', details: err })
  }

  return res.status(200).json({ ok: true, slug, sha: sha ? 'updated' : 'created' })
}
