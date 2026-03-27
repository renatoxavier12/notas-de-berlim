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

  const slug = newEditions[0].replace('src/edicoes/', '').replace('.md', '')

  // Envio manual via /painel-x7k2/preview — não dispara automaticamente
  return res.status(200).json({ ok: true, slug, message: 'Edição detectada. Use /painel-x7k2/preview.html para enviar.' })
}
