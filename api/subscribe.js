// In-memory rate limiter: 5 requests per IP per minute
const ipRequests = new Map()
const WINDOW_MS = 60 * 1000
const MAX_REQUESTS = 5

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

function normalizeEmail(email) {
  return typeof email === 'string' ? email.trim().toLowerCase() : ''
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const ip = (req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown').split(',')[0].trim()
  if (isRateLimited(ip)) {
    return res.status(429).json({ error: 'Too many requests. Tente de novo em alguns minutos.' })
  }

  const email = normalizeEmail(req.body?.email)
  if (!email || email.length > 254 || !EMAIL_RE.test(email)) {
    return res.status(400).json({ error: 'Email inválido.' })
  }

  try {
    const brevoRes = await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': process.env.BREVO_API_KEY,
      },
      body: JSON.stringify({
        email,
        listIds: [Number(process.env.BREVO_LIST_ID)],
        updateEnabled: true,
      }),
    })

    if (brevoRes.ok || brevoRes.status === 204) {
      // Notifica o autor por email
      await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'api-key': process.env.BREVO_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sender: { name: 'Notas de Berlim', email: 'renatoxavier12@gmail.com' },
          to: [{ email: 'renatoxavier12@gmail.com' }],
          subject: 'Novo inscrito no Notas de Berlim',
          htmlContent: `<p style="font-family:monospace;">Novo inscrito: <strong>${email}</strong></p>`,
        }),
      }).catch(() => {})

      return res.status(200).json({ success: true })
    } else {
      const data = await brevoRes.json()
      return res.status(brevoRes.status).json(data)
    }
  } catch {
    return res.status(500).json({ error: 'Internal server error' })
  }
}
