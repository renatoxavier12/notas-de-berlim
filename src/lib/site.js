export const SITE_URL = 'https://notasdeberlim.com'
export const SITE_NAME = 'Notas de Berlim'
export const SITE_DESCRIPTION = 'Comida, drink, Kultur. Vida em Berlim.'
export const DEFAULT_OG_IMAGE = `${SITE_URL}/og.jpg`

const PT_MONTHS = {
  janeiro: 0,
  fevereiro: 1,
  marco: 2,
  março: 2,
  abril: 3,
  maio: 4,
  junho: 5,
  julho: 6,
  agosto: 7,
  setembro: 8,
  outubro: 9,
  novembro: 10,
  dezembro: 11,
}

export const BERLINER_GLOSSARY = [
  {
    term: 'Altbau',
    description: 'Prédio antigo, geralmente do fim do século XIX ou começo do XX, com pé-direito alto e detalhes originais.',
    pattern: /\baltbau\b/i,
  },
  {
    term: 'Restmüll',
    description: 'Categoria de lixo residual, aquilo que não entra na reciclagem comum.',
    pattern: /\brestmüll\b/i,
  },
  {
    term: 'Späti',
    description: 'Pequeno comércio de bairro, aberto até mais tarde, que vende de tudo um pouco.',
    pattern: /\bspäti(s|fy)?\b/i,
  },
  {
    term: 'Apotheke',
    description: 'Farmácia em alemão.',
    pattern: /\bapotheke\b/i,
  },
  {
    term: 'Anmeldung',
    description: 'Registro oficial de endereço na cidade, uma das primeiras burocracias de quem chega em Berlim.',
    pattern: /\banmeldung\b/i,
  },
  {
    term: 'Döner',
    description: 'Sanduíche clássico de rua em Berlim, com pão, salada e carne assada no espeto.',
    pattern: /\bdöner\b/i,
  },
]

const EDITION_AROUND_READINGS = {
  'terceira-semana': [
    {
      title: 'Jorge Luis Borges, "El tiempo"',
      meta: 'Borges oral, 1979',
      note: 'Conferência que atravessa esta edição: tempo, memória, sucessão e a estranheza do presente.',
    },
  ],
}

const markdownFiles = import.meta.glob('../edicoes/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
})

export function getCookie(name) {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'))
  return match ? decodeURIComponent(match[2]) : null
}

export function setCookie(name, value, days = 365) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString()
  document.cookie = `${name}=${encodeURIComponent(value)};expires=${expires};path=/;SameSite=Lax`
}

export function normalizeEmail(email) {
  return typeof email === 'string' ? email.trim().toLowerCase() : ''
}

export function parseFrontmatter(raw) {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/)
  if (!match) return { meta: {}, content: raw }

  const meta = {}
  match[1].split('\n').forEach(line => {
    const colonIdx = line.indexOf(':')
    if (colonIdx === -1) return
    const key = line.slice(0, colonIdx).trim()
    const value = line.slice(colonIdx + 1).trim().replace(/^["']|["']$/g, '')
    if (key) meta[key] = value
  })

  return { meta, content: match[2].trim() }
}

export const EDICOES = Object.entries(markdownFiles)
  .map(([path, raw]) => {
    const slug = path.replace('../edicoes/', '').replace('.md', '')
    const { meta } = parseFrontmatter(raw)
    return {
      id: meta.id ? parseInt(meta.id, 10) : 0,
      slug,
      titulo: meta.title || slug,
      data: meta.data || '',
      bairro: meta.bairro || '',
      teaser: meta.teaser || '',
      capa: meta.capa || null,
    }
  })
  .sort((a, b) => b.id - a.id)

export function findEdicaoBySlug(slug) {
  return EDICOES.find(edicao => edicao.slug === slug) || null
}

export function getMarkdownForEdicao(slug) {
  return markdownFiles[`../edicoes/${slug}.md`] || '_Conteúdo não encontrado._'
}

export function readingTime(markdown) {
  const text = markdown.replace(/^---[\s\S]*?---\n?/, '').replace(/[#*`[\]_]/g, '')
  const words = text.trim().split(/\s+/).length
  return `${Math.ceil(words / 200)} min`
}

export function absoluteUrl(path = '/') {
  if (path.startsWith('http://') || path.startsWith('https://')) return path
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`
}

export function parseEditionDate(dateString) {
  if (!dateString) return null
  const match = dateString.trim().match(/^(\d{1,2})\s+de\s+(.+?)\s+de\s+(\d{4})$/i)
  if (!match) return null

  const day = parseInt(match[1], 10)
  const rawMonth = match[2].trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  const month = PT_MONTHS[rawMonth]
  const year = parseInt(match[3], 10)

  if (Number.isNaN(day) || Number.isNaN(year) || month == null) return null
  return new Date(year, month, day, 12, 0, 0)
}

export function formatEditionDate(dateString, locale = 'pt-BR') {
  const parsed = parseEditionDate(dateString)
  if (!parsed) return dateString

  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(parsed)
}

export function formatEditionRelativeDate(dateString, locale = 'pt-BR', relativeWindowDays = 6) {
  const parsed = parseEditionDate(dateString)
  if (!parsed) return dateString

  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const target = new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate())
  const diffDays = Math.round((today - target) / 86400000)

  if (diffDays < 0 || diffDays > relativeWindowDays) {
    return formatEditionDate(dateString, locale)
  }

  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' })
  return rtf.format(-diffDays, 'day')
}

export function getEditionKiez(bairro = '') {
  const parts = bairro.split('/').map(part => part.trim()).filter(Boolean)
  return parts[parts.length - 1] || bairro
}

export function getEditionKiezes(edicoes) {
  return [...new Set(edicoes.map(edicao => getEditionKiez(edicao.bairro)).filter(Boolean))]
}

export function toIsoDate(dateString) {
  const parsed = parseEditionDate(dateString)
  return parsed ? parsed.toISOString() : null
}

export function getGlossaryTerms(markdown = '') {
  return BERLINER_GLOSSARY.filter(entry => entry.pattern.test(markdown))
}

export function getEditionAroundReadings(slug) {
  return EDITION_AROUND_READINGS[slug] || []
}

export function getEditionCopy(edicao, t) {
  return {
    titulo: t(`editions.${edicao.slug}.title`, { defaultValue: edicao.titulo }),
    teaser: t(`editions.${edicao.slug}.teaser`, { defaultValue: edicao.teaser }),
    bairro: t(`editions.${edicao.slug}.bairro`, { defaultValue: edicao.bairro }),
    data: t(`editions.${edicao.slug}.date`, { defaultValue: edicao.data }),
  }
}
