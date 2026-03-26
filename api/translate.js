const translationCache = new Map()
const ipRequests = new Map()
const WINDOW_MS = 60 * 1000
const MAX_REQUESTS = 10
const ALLOWED_TARGETS = new Set(['EN', 'DE'])

function isRateLimited(ip) {
  const now = Date.now()
  const record = ipRequests.get(ip)
  if (!record || now > record.resetAt) {
    ipRequests.set(ip, { count: 1, resetAt: now + WINDOW_MS })
    return false
  }

  record.count += 1
  return record.count > MAX_REQUESTS
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const ip = (req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown').split(',')[0].trim()
  if (isRateLimited(ip)) {
    return res.status(429).json({ error: 'Too many requests.' })
  }

  const apiKey = process.env.DEEPL_API_KEY || process.env.VITE_DEEPL_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: 'DeepL API key not configured.' })
  }

  const { slug, text, targetLang } = req.body || {}
  if (!slug || !text || typeof slug !== 'string' || typeof text !== 'string') {
    return res.status(400).json({ error: 'Invalid payload.' })
  }

  if (!ALLOWED_TARGETS.has(targetLang)) {
    return res.status(400).json({ error: 'Invalid target language.' })
  }

  const normalizedText = text.trim()
  if (!normalizedText || normalizedText.length > 45000) {
    return res.status(400).json({ error: 'Invalid text length.' })
  }

  const cacheKey = `${slug}:${targetLang}:${normalizedText.length}`
  if (translationCache.has(cacheKey)) {
    return res.status(200).json({ translation: translationCache.get(cacheKey), cached: true })
  }

  try {
    const body = new URLSearchParams({
      text: normalizedText,
      source_lang: 'PT-BR',
      target_lang: targetLang,
      preserve_formatting: '1',
    })

    const deepLResponse = await fetch('https://api-free.deepl.com/v2/translate', {
      method: 'POST',
      headers: {
        Authorization: `DeepL-Auth-Key ${apiKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body,
    })

    const data = await deepLResponse.json()
    if (!deepLResponse.ok) {
      return res.status(deepLResponse.status).json({ error: data.message || 'Translation failed.' })
    }

    const translation = data.translations?.[0]?.text
    if (!translation) {
      return res.status(500).json({ error: 'Empty translation.' })
    }

    translationCache.set(cacheKey, translation)
    return res.status(200).json({ translation, cached: false })
  } catch {
    return res.status(500).json({ error: 'Internal server error' })
  }
}
