// In-memory rate limiter: 20 requests per IP per minute
const ipRequests = new Map()
const WINDOW_MS = 60 * 1000
const MAX_REQUESTS = 20

function isRateLimited(ip) {
  const now = Date.now()
  const record = ipRequests.get(ip)
  if (!record || now > record.resetAt) {
    ipRequests.set(ip, { count: 1, resetAt: now + WINDOW_MS })
    return false
  }
  record.count++
  return record.count > MAX_REQUESTS
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  const ip = (req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown').split(',')[0].trim()
  if (isRateLimited(ip)) {
    return res.status(429).json({ error: 'Too many requests.' })
  }

  const { email } = req.query
  if (!email || typeof email !== 'string' || email.length > 254 || !EMAIL_RE.test(email)) {
    return res.status(400).json({ error: 'Email inválido.' })
  }

  try {
    const brevoRes = await fetch(
      `https://api.brevo.com/v3/contacts/${encodeURIComponent(email)}`,
      { headers: { 'api-key': process.env.BREVO_API_KEY } }
    )

    if (brevoRes.ok) {
      const data = await brevoRes.json()
      const listId = Number(process.env.BREVO_LIST_ID)
      const isSubscribed = data.listIds && data.listIds.includes(listId)
      return res.status(200).json({ isSubscribed })
    } else {
      return res.status(200).json({ isSubscribed: false })
    }
  } catch {
    return res.status(500).json({ error: 'Internal server error' })
  }
}
