import { Suspense, lazy, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import './App.css'
import LangSwitcher from './components/LangSwitcher'
import { normalizeLanguage } from './i18n'
import { findEdicaoBySlug, getCookie, setCookie } from './lib/site'
import RouteMeta from './components/RouteMeta'

const HomeView = lazy(() => import('./routes/HomeView'))
const EdicaoView = lazy(() => import('./routes/EdicaoView'))
const MapaView = lazy(() => import('./routes/MapaView'))
const SobreView = lazy(() => import('./routes/SobreView'))
const ApoiarView = lazy(() => import('./routes/ApoiarView'))

function Nav({ view, setView, dark, setDark }) {
  const { t } = useTranslation()

  return (
    <nav className="site-nav">
      <button className="nav-logo" onClick={() => setView('home')}>
        {t('site.name')}
      </button>
      <div className="nav-links">
        <button
          className={view === 'home' || view === 'edicao' ? 'active' : ''}
          onClick={() => setView('home')}
        >
          {t('nav.archive')}
        </button>
        <button
          className={view === 'mapa' ? 'active' : ''}
          onClick={() => setView('mapa')}
        >
          {t('nav.map')}
        </button>
        <button
          className={view === 'sobre' ? 'active' : ''}
          onClick={() => setView('sobre')}
        >
          {t('nav.about')}
        </button>
        <button
          className="nav-apoiar"
          onClick={() => setView('apoiar')}
        >
          Apoiar
        </button>
        <LangSwitcher />
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
    let count = 0
    let timer

    function handleKey(event) {
      if (event.key === 'a' || event.key === 'A') {
        count += 1
        clearTimeout(timer)
        timer = setTimeout(() => {
          count = 0
        }, 800)

        if (count >= 3) {
          count = 0
          window.location.href = '/admin'
        }
      }
    }

    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [])

  useEffect(() => {
    let newPath = '/'
    if (view === 'edicao' && edicaoAtiva) newPath = `/edicoes/${edicaoAtiva.slug}`
    if (view === 'mapa') newPath = '/mapa'
    if (view === 'sobre') newPath = '/sobre'
    if (view === 'apoiar') newPath = '/apoiar'

    if (window.location.pathname !== newPath) {
      window.history.pushState({}, '', newPath)
    }
  }, [view, edicaoAtiva])

  return (
    <div className={`app-root view-${view}`}>
      <RouteMeta view={view} edicao={edicaoAtiva} />
      <Nav view={view} setView={setView} dark={dark} setDark={setDark} />
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
      </Suspense>
    </div>
  )
}

export default App
