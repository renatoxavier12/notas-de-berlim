export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', 'https://notasdeberlim.com')

  // Proteção: verificar secret do admin
  const secret = req.headers['x-admin-secret'] || req.query.secret
  if (secret !== process.env.GITHUB_WEBHOOK_SECRET) {
    return res.status(401).json({ error: 'Não autorizado' })
  }

  try {
    const listId = process.env.BREVO_LIST_ID
    const apiKey = process.env.BREVO_API_KEY

    const [listRes, contactsRes] = await Promise.all([
      fetch(`https://api.brevo.com/v3/contacts/lists/${listId}`, {
        headers: { 'api-key': apiKey },
      }),
      fetch(`https://api.brevo.com/v3/contacts?listIds=${listId}&limit=100&sort=desc`, {
        headers: { 'api-key': apiKey },
      }),
    ])

    if (!listRes.ok) return res.status(listRes.status).json({ error: 'Brevo error' })

    const listData = await listRes.json()
    const contactsData = contactsRes.ok ? await contactsRes.json() : { contacts: [] }

    return res.status(200).json({
      total: listData.totalSubscribers ?? 0,
      contacts: (contactsData.contacts ?? []).map(c => ({
        email: c.email,
        createdAt: c.createdAt,
      })),
    })
  } catch {
    return res.status(500).json({ error: 'Internal server error' })
  }
}
