export const SITE_URL = 'https://notasdeberlim.com'
export const SITE_NAME = 'Notas de Berlim'
export const SITE_DESCRIPTION = 'Comida, drink, Kultur. Vida em Berlim.'
export const DEFAULT_OG_IMAGE = `${SITE_URL}/og.jpg`

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
  const text = markdown.replace(/^---[\s\S]*?---\n?/, '').replace(/[#*`\[\]_]/g, '')
  const words = text.trim().split(/\s+/).length
  return `${Math.ceil(words / 200)} min`
}

export function absoluteUrl(path = '/') {
  if (path.startsWith('http://') || path.startsWith('https://')) return path
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`
}

export function getEditionCopy(edicao, t) {
  return {
    titulo: t(`editions.${edicao.slug}.title`, { defaultValue: edicao.titulo }),
    teaser: t(`editions.${edicao.slug}.teaser`, { defaultValue: edicao.teaser }),
    bairro: t(`editions.${edicao.slug}.bairro`, { defaultValue: edicao.bairro }),
    data: t(`editions.${edicao.slug}.date`, { defaultValue: edicao.data }),
  }
}
