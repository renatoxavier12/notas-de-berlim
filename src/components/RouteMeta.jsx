import { Helmet } from 'react-helmet-async'
import { useTranslation } from 'react-i18next'
import { absoluteUrl, DEFAULT_OG_IMAGE, getEditionCopy, SITE_URL } from '../lib/site'

function buildMeta(view, edicao, t) {
  const siteName = t('site.name')
  const siteDescription = t('site.description')

  if (view === 'edicao' && edicao) {
    const editionCopy = getEditionCopy(edicao, t)
    const description = editionCopy.teaser || siteDescription
    const image = absoluteUrl(edicao.capa || '/og.jpg')
    const url = absoluteUrl(`/edicoes/${edicao.slug}`)
    return {
      title: `${editionCopy.titulo} | ${siteName}`,
      description,
      image,
      url,
    }
  }

  if (view === 'mapa') {
    return {
      title: t('meta.mapTitle'),
      description: t('meta.mapDescription'),
      image: absoluteUrl('/hero.jpg'),
      url: absoluteUrl('/mapa'),
    }
  }

  if (view === 'sobre') {
    return {
      title: t('meta.aboutTitle'),
      description: t('meta.aboutDescription'),
      image: DEFAULT_OG_IMAGE,
      url: absoluteUrl('/sobre'),
    }
  }

  return {
    title: siteName,
    description: siteDescription,
    image: DEFAULT_OG_IMAGE,
    url: SITE_URL,
  }
}

export default function RouteMeta({ view, edicao }) {
  const { t, i18n } = useTranslation()
  const meta = buildMeta(view, edicao, t)
  const ogLocale = i18n.resolvedLanguage === 'de'
    ? 'de_DE'
    : i18n.resolvedLanguage === 'en'
      ? 'en_US'
      : 'pt_BR'

  return (
    <Helmet prioritizeSeoTags>
      <title>{meta.title}</title>
      <meta name="description" content={meta.description} />
      <meta property="og:type" content="website" />
      <meta property="og:locale" content={ogLocale} />
      <meta property="og:site_name" content={t('site.name')} />
      <meta property="og:title" content={meta.title} />
      <meta property="og:description" content={meta.description} />
      <meta property="og:image" content={meta.image} />
      <meta property="og:url" content={meta.url} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={meta.title} />
      <meta name="twitter:description" content={meta.description} />
      <meta name="twitter:image" content={meta.image} />
      <meta name="twitter:url" content={meta.url} />
      <link rel="canonical" href={meta.url} />
    </Helmet>
  )
}
