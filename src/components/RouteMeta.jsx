import { Helmet } from 'react-helmet-async'
import { useTranslation } from 'react-i18next'
import { normalizeLanguage } from '../i18n'
import { absoluteUrl, DEFAULT_OG_IMAGE, formatEditionDate, getEditionCopy, SITE_URL, toIsoDate } from '../lib/site'

function buildMeta(view, edicao, t) {
  const siteName = t('site.name')
  const siteDescription = t('site.description')

  if (view === 'edicao' && edicao) {
    const editionCopy = getEditionCopy(edicao, t)
    const description = editionCopy.teaser || siteDescription
    const image = absoluteUrl(edicao.capa || '/og.jpg')
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
        author: {
          '@type': 'Person',
          name: 'Renato Xavier',
        },
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
      image: DEFAULT_OG_IMAGE,
      url: absoluteUrl('/sobre'),
      type: 'website',
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
