export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', 'https://notasdeberlim.com')

  try {
    const listId = process.env.BREVO_LIST_ID
    const r = await fetch(`https://api.brevo.com/v3/contacts/lists/${listId}`, {
      headers: { 'api-key': process.env.BREVO_API_KEY },
    })
    if (!r.ok) return res.status(r.status).json({ error: 'Brevo error' })
    const data = await r.json()

    return res.status(200).json({
      total: data.totalSubscribers ?? 0,
      name: data.name ?? '',
    })
  } catch {
    return res.status(500).json({ error: 'Internal server error' })
  }
}
