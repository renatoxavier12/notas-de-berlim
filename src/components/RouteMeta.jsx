import { Helmet } from 'react-helmet-async'
import { absoluteUrl, DEFAULT_OG_IMAGE, SITE_DESCRIPTION, SITE_NAME, SITE_URL } from '../lib/site'

function buildMeta(view, edicao) {
  if (view === 'edicao' && edicao) {
    const description = edicao.teaser || SITE_DESCRIPTION
    const image = absoluteUrl(edicao.capa || '/og.jpg')
    const url = absoluteUrl(`/edicoes/${edicao.slug}`)
    return {
      title: `${edicao.titulo} | ${SITE_NAME}`,
      description,
      image,
      url,
    }
  }

  if (view === 'mapa') {
    return {
      title: `Mapa | ${SITE_NAME}`,
      description: 'Locais citados nas edições de Notas de Berlim em um mapa interativo.',
      image: absoluteUrl('/hero.jpg'),
      url: absoluteUrl('/mapa'),
    }
  }

  if (view === 'sobre') {
    return {
      title: `Sobre | ${SITE_NAME}`,
      description: 'Conheça o autor e acompanhe as edições publicadas de Notas de Berlim.',
      image: DEFAULT_OG_IMAGE,
      url: absoluteUrl('/sobre'),
    }
  }

  return {
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    image: DEFAULT_OG_IMAGE,
    url: SITE_URL,
  }
}

export default function RouteMeta({ view, edicao }) {
  const meta = buildMeta(view, edicao)

  return (
    <Helmet prioritizeSeoTags>
      <title>{meta.title}</title>
      <meta name="description" content={meta.description} />
      <meta property="og:type" content="website" />
      <meta property="og:locale" content="pt_BR" />
      <meta property="og:site_name" content={SITE_NAME} />
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
