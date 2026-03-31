import { Suspense, lazy, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import './App.css'
import { normalizeLanguage } from './i18n'
import { EDICOES, findEdicaoBySlug, getCookie, setCookie } from './lib/site'
import RouteMeta from './components/RouteMeta'

const HomeView = lazy(() => import('./routes/HomeView'))
const EdicaoView = lazy(() => import('./routes/EdicaoView'))
const MapaView = lazy(() => import('./routes/MapaView'))
const SobreView = lazy(() => import('./routes/SobreView'))
const ApoiarView = lazy(() => import('./routes/ApoiarView'))
const DiarioView = lazy(() => import('./routes/DiarioView'))

function Nav({ view, edicaoAtiva, setView, dark, setDark }) {
  const { t } = useTranslation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  function navigate(nextView) {
    setView(nextView)
    setMobileMenuOpen(false)
  }

  function openEdition(ed) {
    if (!ed || ed.slug === edicaoAtiva?.slug) return
    setView('edicao')
    window.history.pushState({}, '', `/edicoes/${ed.slug}`)
    window.dispatchEvent(new PopStateEvent('popstate'))
    setMobileMenuOpen(false)
  }

  useEffect(() => {
    setMobileMenuOpen(false)
  }, [view])

  return (
    <nav className={`site-nav ${mobileMenuOpen ? 'menu-open' : ''}`}>
      <button className="nav-logo" onClick={() => navigate('home')}>
        {t('site.name')}
      </button>
      {view === 'edicao' && edicaoAtiva && (
        <div className="nav-timeline">
          {EDICOES.map(ed => (
            <button
              key={ed.slug}
              className={`nav-timeline-dot${ed.slug === edicaoAtiva.slug ? ' current' : ''}`}
              onClick={() => openEdition(ed)}
              title={ed.titulo}
              aria-label={ed.titulo}
              aria-current={ed.slug === edicaoAtiva.slug ? 'page' : undefined}
            >
              {ed.id}
            </button>
          ))}
        </div>
      )}
      <button
        type="button"
        className="nav-mobile-toggle"
        aria-label={mobileMenuOpen ? t('map.closeList') : t('map.openList')}
        aria-expanded={mobileMenuOpen}
        onClick={() => setMobileMenuOpen(open => !open)}
      >
        <span />
        <span />
        <span />
      </button>
      <div className={`nav-links ${mobileMenuOpen ? 'nav-links-open' : ''}`}>
        <button
          className={view === 'home' || view === 'edicao' ? 'active' : ''}
          onClick={() => navigate('home')}
        >
          {t('nav.archive')}
        </button>
        <button
          className={view === 'mapa' ? 'active' : ''}
          onClick={() => navigate('mapa')}
        >
          {t('nav.map')}
        </button>
        <button
          className={view === 'sobre' ? 'active' : ''}
          onClick={() => navigate('sobre')}
        >
          {t('nav.about')}
        </button>
        <button
          className={view === 'diario' ? 'active' : ''}
          onClick={() => navigate('diario')}
        >
          Diário
        </button>
        <button
          className="nav-apoiar"
          onClick={() => navigate('apoiar')}
        >
          Apoiar
        </button>
        <button
          className="nav-theme-toggle"
          onClick={() => setDark(value => !value)}
          aria-label={dark ? t('nav.themeLight') : t('nav.themeDark')}
        >
          {dark ? '☀' : '☽'}
        </button>
      </div>
    </nav>
  )
}

function routeStateFromPath(pathname) {
  if (pathname.startsWith('/edicoes/')) {
    const slug = pathname.replace('/edicoes/', '')
    const edicao = findEdicaoBySlug(slug)
    if (edicao) {
      return { view: 'edicao', edicao }
    }
  }

  if (pathname === '/mapa') return { view: 'mapa', edicao: null }
  if (pathname === '/sobre') return { view: 'sobre', edicao: null }
  if (pathname === '/apoiar') return { view: 'apoiar', edicao: null }
  if (pathname === '/diario') return { view: 'diario', edicao: null }
  return { view: 'home', edicao: null }
}

function LoadingFallback() {
  const { t } = useTranslation()
  return <div className="page-loading">{t('common.loading')}</div>
}

function App() {
  const { i18n } = useTranslation()
  const initialRoute = routeStateFromPath(window.location.pathname)
  const [view, setView] = useState(initialRoute.view)
  const [edicaoAtiva, setEdicaoAtiva] = useState(initialRoute.edicao)
  const [dark, setDark] = useState(() => getCookie('theme') === 'dark')
  const language = normalizeLanguage(i18n.language);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light')
    setCookie('theme', dark ? 'dark' : 'light')
  }, [dark])

  useEffect(() => {
    const htmlLang = language === 'de'
      ? 'de-DE'
      : language === 'en'
        ? 'en'
        : 'pt-BR';

    document.documentElement.lang = htmlLang
  }, [language])

  useEffect(() => {
    function handlePopState() {
      const route = routeStateFromPath(window.location.pathname)
      setView(route.view)
      setEdicaoAtiva(route.edicao)
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  useEffect(() => {
    let newPath = '/'
    if (view === 'edicao' && edicaoAtiva) newPath = `/edicoes/${edicaoAtiva.slug}`
    if (view === 'mapa') newPath = '/mapa'
    if (view === 'sobre') newPath = '/sobre'
    if (view === 'apoiar') newPath = '/apoiar'
    if (view === 'diario') newPath = '/diario'

    if (window.location.pathname !== newPath) {
      window.history.pushState({}, '', newPath)
    }
  }, [view, edicaoAtiva])

  return (
    <div className={`app-root view-${view}`}>
      <RouteMeta view={view} edicao={edicaoAtiva} />
      <Nav view={view} edicaoAtiva={edicaoAtiva} setView={setView} dark={dark} setDark={setDark} />
      <Suspense fallback={<LoadingFallback />}>
        {view === 'home' && (
          <HomeView setView={setView} setEdicaoAtiva={setEdicaoAtiva} />
        )}
        {view === 'edicao' && edicaoAtiva && (
          <EdicaoView edicao={edicaoAtiva} setView={setView} />
        )}
        {view === 'mapa' && (
          <MapaView setView={setView} setEdicaoAtiva={setEdicaoAtiva} />
        )}
        {view === 'sobre' && (
          <SobreView setView={setView} setEdicaoAtiva={setEdicaoAtiva} />
        )}
        {view === 'apoiar' && (
          <ApoiarView setView={setView} />
        )}
        {view === 'diario' && (
          <DiarioView />
        )}
      </Suspense>
    </div>
  )
}

export default App
