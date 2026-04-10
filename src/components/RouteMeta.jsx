import { Helmet } from 'react-helmet-async'
import { useTranslation } from 'react-i18next'
import { normalizeLanguage } from '../i18n'
import { absoluteUrl, DEFAULT_OG_IMAGE, formatEditionDate, getEditionCopy, SITE_URL, toIsoDate } from '../lib/site'

const AUTHOR_PROFILE_URL = `${SITE_URL}/sobre`
const AUTHOR_IMAGE_URL = `${SITE_URL}/euetiao.jpg`

const AUTHOR_STRUCTURED_DATA = {
  '@type': 'Person',
  '@id': `${AUTHOR_PROFILE_URL}#renato-xavier`,
  name: 'Renato Xavier',
  url: AUTHOR_PROFILE_URL,
  image: AUTHOR_IMAGE_URL,
  jobTitle: 'Postdoctoral researcher',
  affiliation: [
    {
      '@type': 'Organization',
      name: 'Ibero-Amerikanisches Institut Berlin',
      url: 'https://www.iai.spk-berlin.de/',
    },
    {
      '@type': 'Organization',
      name: 'CEBRAP',
      url: 'https://cebrap.org.br/',
    },
  ],
  knowsAbout: [
    'W.E.B. Du Bois',
    'Black international thought',
    'International Relations',
    'Political theory',
    'Race',
    'Algorithms',
  ],
  sameAs: [
    'https://bv.fapesp.br/pt/pesquisador/737373/renato-xavier-dos-santos/',
    'https://buscatextual.cnpq.br/buscatextual/visualizacv.do?metodo=apresentar&id=K4458372P6',
    'https://orcid.org/0000-0001-5136-7636',
    'https://scholar.google.com/citations?user=t8bM1p8AAAAJ&hl=pt-BR',
    'https://instagram.com/renatoxavierrr',
    'https://renatoxavier.substack.com',
  ],
}

function buildMeta(view, edicao, t) {
  const siteName = t('site.name')
  const siteDescription = t('site.description')

  if (view === 'edicao' && edicao) {
    const editionCopy = getEditionCopy(edicao, t)
    const description = editionCopy.teaser || siteDescription
    const image = absoluteUrl(edicao.ogImage || edicao.capa || '/og.jpg')
    const url = absoluteUrl(`/edicoes/${edicao.slug}`)
    const publishedAt = toIsoDate(edicao.data)
    return {
      title: `${editionCopy.titulo} | ${siteName}`,
      description,
      image,
      url,
      type: 'article',
      structuredData: {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: editionCopy.titulo,
        description,
        image: [image],
        mainEntityOfPage: url,
        url,
        datePublished: publishedAt,
        dateModified: publishedAt,
        articleSection: edicao.bairro,
        inLanguage: 'pt-BR',
        isAccessibleForFree: true,
        publisher: {
          '@type': 'Organization',
          name: siteName,
          url: SITE_URL,
        },
        author: AUTHOR_STRUCTURED_DATA,
      },
    }
  }

  if (view === 'mapa') {
    return {
      title: t('meta.mapTitle'),
      description: t('meta.mapDescription'),
      image: absoluteUrl('/hero.jpg'),
      url: absoluteUrl('/mapa'),
      type: 'website',
    }
  }

  if (view === 'sobre') {
    return {
      title: t('meta.aboutTitle'),
      description: t('meta.aboutDescription'),
      image: AUTHOR_IMAGE_URL,
      url: absoluteUrl('/sobre'),
      type: 'profile',
      structuredData: {
        '@context': 'https://schema.org',
        '@type': 'ProfilePage',
        '@id': `${AUTHOR_PROFILE_URL}#profile`,
        url: AUTHOR_PROFILE_URL,
        name: 'Renato Xavier | Notas de Berlim',
        description: t('meta.aboutDescription'),
        image: AUTHOR_IMAGE_URL,
        inLanguage: 'pt-BR',
        mainEntity: AUTHOR_STRUCTURED_DATA,
      },
    }
  }

  return {
    title: siteName,
    description: siteDescription,
    image: DEFAULT_OG_IMAGE,
    url: SITE_URL,
    type: 'website',
  }
}

export default function RouteMeta({ view, edicao }) {
  const { t, i18n } = useTranslation()
  const language = normalizeLanguage(i18n.resolvedLanguage || i18n.language)
  const meta = buildMeta(view, edicao, t)
  const ogLocale = language === 'de'
    ? 'de_DE'
    : language === 'en'
      ? 'en_US'
      : 'pt_BR'

  return (
    <Helmet prioritizeSeoTags>
      <title>{meta.title}</title>
      <meta name="description" content={meta.description} />
      <meta property="og:type" content={meta.type || 'website'} />
      <meta property="og:locale" content={ogLocale} />
      <meta property="og:site_name" content={t('site.name')} />
      <meta property="og:title" content={meta.title} />
      <meta property="og:description" content={meta.description} />
      <meta property="og:image" content={meta.image} />
      <meta property="og:url" content={meta.url} />
      {view === 'edicao' && edicao && (
        <meta property="article:published_time" content={toIsoDate(edicao.data) || formatEditionDate(edicao.data, 'pt-BR')} />
      )}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={meta.title} />
      <meta name="twitter:description" content={meta.description} />
      <meta name="twitter:image" content={meta.image} />
      <meta name="twitter:url" content={meta.url} />
      <link rel="canonical" href={meta.url} />
      {meta.structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(meta.structuredData).replace(/</g, '\\u003c')}
        </script>
      )}
    </Helmet>
  )
}
