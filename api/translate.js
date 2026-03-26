const translationCache = new Map()
const ipRequests = new Map()
const WINDOW_MS = 60 * 1000
const MAX_REQUESTS = 10
const ALLOWED_TARGETS = new Set(['EN', 'DE'])

function getProvider() {
  const deepLApiKey = process.env.DEEPL_API_KEY || process.env.VITE_DEEPL_API_KEY
  const openAIApiKey = process.env.OPENAI_API_KEY

  if (deepLApiKey) {
    return { name: 'deepl', apiKey: deepLApiKey }
  }

  if (openAIApiKey) {
    return { name: 'openai', apiKey: openAIApiKey }
  }

  return null
}

async function translateWithDeepL(apiKey, text, targetLang) {
  const body = new URLSearchParams({
    text,
    source_lang: 'PT-BR',
    target_lang: targetLang,
    preserve_formatting: '1',
  })

  const apiUrl = process.env.DEEPL_API_URL || 'https://api.deepl.com/v2/translate'
  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      Authorization: `DeepL-Auth-Key ${apiKey}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body,
  })

  const data = await response.json()
  if (!response.ok) {
    throw new Error(data.message || 'DeepL translation failed.')
  }

  const translation = data.translations?.[0]?.text
  if (!translation) {
    throw new Error('Empty DeepL translation.')
  }

  return translation
}

async function translateWithOpenAI(apiKey, text, targetLang) {
  const targetLanguageName = targetLang === 'DE' ? 'German' : 'English'
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: process.env.OPENAI_TRANSLATION_MODEL || 'gpt-4o-mini',
      temperature: 0.2,
      messages: [
        {
          role: 'system',
          content: `Translate Brazilian Portuguese text into ${targetLanguageName}. Preserve markdown, paragraph breaks, punctuation, and tone. Return only the translated text.`,
        },
        {
          role: 'user',
          content: text,
        },
      ],
    }),
  })

  const data = await response.json()
  if (!response.ok) {
    throw new Error(data.error?.message || 'OpenAI translation failed.')
  }

  const translation = data.choices?.[0]?.message?.content?.trim()
  if (!translation) {
    throw new Error('Empty OpenAI translation.')
  }

  return translation
}

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

  const provider = getProvider()
  if (!provider) {
    return res.status(500).json({ error: 'Translation provider not configured.' })
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
    const translation = provider.name === 'deepl'
      ? await translateWithDeepL(provider.apiKey, normalizedText, targetLang)
      : await translateWithOpenAI(provider.apiKey, normalizedText, targetLang)

    translationCache.set(cacheKey, translation)
    return res.status(200).json({ translation, cached: false, provider: provider.name })
  } catch (error) {
    return res.status(500).json({ error: error instanceof Error ? error.message : 'Internal server error' })
  }
}
