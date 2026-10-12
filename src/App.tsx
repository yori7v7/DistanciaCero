import { lazy, Suspense, useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import scenes from './data/scenes.json'
import { CENTRO_VISIBLE_KEY, readScenePreference, resolveSceneId } from './utils/sceneSelection'
import AuthGate from './components/AuthGate'
import ErrorBoundary from './components/ErrorBoundary'
import LoadingIntro from './components/LoadingIntro'
import Hero from './components/Hero'
import ProposalSection from './components/ProposalSection'
import CounterSection from './components/CounterSection'
import MainLetter from './components/MainLetter'

// ─── Lazy-loaded heavy sections (3D, gallery, physics) ───
const UniverseSection = lazy(() => import('./components/UniverseSection'))
const StoryTimeline = lazy(() => import('./components/StoryTimeline'))
const MonthlyLetters = lazy(() => import('./components/MonthlyLetters'))
const OpenWhenSection = lazy(() => import('./components/OpenWhenSection'))
const PlaylistSection = lazy(() => import('./components/PlaylistSection'))
const ReasonsSection = lazy(() => import('./components/ReasonsSection'))
const BlackHoleGallerySection = lazy(() => import('./components/BlackHoleGallerySection'))
const CentroUniversoSection = lazy(() => import('./components/CentroUniversoSection'))
const EntrelazadosSection = lazy(() => import('./components/EntrelazadosSection'))

// ─── Light sections (eager, render fast) ───
import ImportantDatesSection from './components/ImportantDatesSection'
import FutureDreamsSection from './components/FutureDreamsSection'
import PromisesSection from './components/PromisesSection'
import DistanceMapSection from './components/DistanceMapSection'
import SceneMusicController from './components/SceneMusicController'
import SceneModeController from './components/SceneModeController'
import BackToTop from './components/BackToTop'
import Footer from './components/Footer'

// ─── Shared Suspense skeleton ───
const SectionSkeleton = ({ sectionId }: { sectionId: string }) => (
  <section id={sectionId} className="section section-placeholder" aria-busy="true">
    <div className="small-pill animate-pulse" style={{ opacity: 0.5 }}>
      <span>Cargando sección...</span>
    </div>
  </section>
)

import timeline from './data/timeline.json'
import universe from './data/universe.json'
import monthlyLetters from './data/monthlyLetters.json'
import openWhen from './data/openWhen.json'
import playlist from './data/playlist.json'
import reasons from './data/reasons.json'
import importantDates from './data/importantDates.json'
import blackHoleGallery from './data/blackHoleGallery.json'
import futureDreams from './data/futureDreams.json'
import promises from './data/promises.json'

function App() {
  const location = useLocation()
  const scene = scenes.find(item => item.id === resolveSceneId(location.hash))!
  const [visitedSections, setVisitedSections] = useState(() => new Set(scene.sectionIds))
  const [centroVisible, setCentroVisible] = useState(() => readScenePreference(CENTRO_VISIBLE_KEY) === 'true')
  const mountedSections = new Set([...visitedSections, ...scene.sectionIds])
  if (centroVisible) mountedSections.add('centro-universo')

  useEffect(() => {
    setVisitedSections(previous => new Set([...previous, ...scene.sectionIds]))
  }, [scene])

  useEffect(() => {
    const onSceneChange = (event: CustomEvent<{ centroVisible?: boolean }>) => {
      if (event.detail?.centroVisible === undefined) return
      setCentroVisible(event.detail.centroVisible)
      if (event.detail.centroVisible) setVisitedSections(previous => new Set([...previous, 'centro-universo']))
    }
    window.addEventListener('distancia-cero-scene-change', onSceneChange)
    return () => window.removeEventListener('distancia-cero-scene-change', onSceneChange)
  }, [])

  return (
    <AuthGate>
    <div className="app">
      <LoadingIntro />

      <div className="background-orbs">
        <span className="orb orb-pink"></span>
        <span className="orb orb-red"></span>
        <span className="orb orb-soft"></span>
      </div>

      <div className="energy-lines"></div>
      <div className="stars-layer"></div>

      <SceneMusicController />
      <main>
        <Hero />
        <ProposalSection />
        <CounterSection />
        <MainLetter />
        {mountedSections.has('historia') && <ErrorBoundary sectionId="historia" fallbackLabel="No se pudo cargar el Diario."><Suspense fallback={<SectionSkeleton sectionId="historia" />}><StoryTimeline timeline={timeline as any} /></Suspense></ErrorBoundary>}
        {mountedSections.has('universo') && <ErrorBoundary sectionId="universo" fallbackLabel="No se pudo cargar el Universo 3D."><Suspense fallback={<SectionSkeleton sectionId="universo" />}><UniverseSection universe={universe as any} /></Suspense></ErrorBoundary>}
        {mountedSections.has('entrelazados') && <ErrorBoundary sectionId="entrelazados" fallbackLabel="No se pudo cargar Entrelazados."><Suspense fallback={<SectionSkeleton sectionId="entrelazados" />}><EntrelazadosSection /></Suspense></ErrorBoundary>}
        {mountedSections.has('cartas') && <ErrorBoundary sectionId="cartas" fallbackLabel="No se pudieron cargar las Cartas Mensuales."><Suspense fallback={<SectionSkeleton sectionId="cartas" />}><MonthlyLetters letters={monthlyLetters as any} /></Suspense></ErrorBoundary>}
        {mountedSections.has('abrir-cuando') && <ErrorBoundary sectionId="abrir-cuando" fallbackLabel="No se pudieron cargar las cartas Abrir Cuando."><Suspense fallback={<SectionSkeleton sectionId="abrir-cuando" />}><OpenWhenSection cards={openWhen as any} /></Suspense></ErrorBoundary>}
        {mountedSections.has('playlist') && <ErrorBoundary sectionId="playlist" fallbackLabel="No se pudo cargar la Playlist."><Suspense fallback={<SectionSkeleton sectionId="playlist" />}><PlaylistSection playlist={playlist as any} /></Suspense></ErrorBoundary>}
        {mountedSections.has('razones') && <ErrorBoundary sectionId="razones" fallbackLabel="No se pudieron cargar las Razones."><Suspense fallback={<SectionSkeleton sectionId="razones" />}><ReasonsSection reasons={reasons as any} /></Suspense></ErrorBoundary>}
        <ImportantDatesSection dates={importantDates as any} />
        {mountedSections.has('galeria-agujero-negro') && <ErrorBoundary sectionId="galeria-agujero-negro" fallbackLabel="No se pudo cargar la Galería."><Suspense fallback={<SectionSkeleton sectionId="galeria-agujero-negro" />}><BlackHoleGallerySection items={blackHoleGallery as any} /></Suspense></ErrorBoundary>}
        <FutureDreamsSection dreams={futureDreams as any} />
        <PromisesSection promises={promises as any} />
        <DistanceMapSection />
        {mountedSections.has('centro-universo') && <ErrorBoundary sectionId="centro-universo" fallbackLabel="No se pudo cargar el Centro del Universo."><Suspense fallback={<SectionSkeleton sectionId="centro-universo" />}><CentroUniversoSection /></Suspense></ErrorBoundary>}
      </main>

      <SceneModeController />
      <BackToTop />
      <Footer />
    </div>
    </AuthGate>
  )
}

export default App
