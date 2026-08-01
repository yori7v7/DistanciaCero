import { lazy, Suspense } from 'react'
import AuthGate from './components/AuthGate'
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
const SectionSkeleton = () => (
  <div className="section" style={{ minHeight: '200px', display: 'grid', placeItems: 'center' }}>
    <div className="small-pill animate-pulse" style={{ opacity: 0.5 }}>
      <span>Cargando sección...</span>
    </div>
  </div>
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

      <main>
        <Hero />
        <ProposalSection />
        <CounterSection />
        <MainLetter />
        <Suspense fallback={<SectionSkeleton />}><StoryTimeline timeline={timeline as any} /></Suspense>
        <Suspense fallback={<SectionSkeleton />}><UniverseSection universe={universe as any} /></Suspense>
        <Suspense fallback={<SectionSkeleton />}><MonthlyLetters letters={monthlyLetters as any} /></Suspense>
        <Suspense fallback={<SectionSkeleton />}><OpenWhenSection cards={openWhen as any} /></Suspense>
        <Suspense fallback={<SectionSkeleton />}><PlaylistSection playlist={playlist as any} /></Suspense>
        <Suspense fallback={<SectionSkeleton />}><ReasonsSection reasons={reasons as any} /></Suspense>
        <ImportantDatesSection dates={importantDates as any} />
        <Suspense fallback={<SectionSkeleton />}><BlackHoleGallerySection items={blackHoleGallery as any} /></Suspense>
        <FutureDreamsSection dreams={futureDreams as any} />
        <PromisesSection promises={promises as any} />
        <DistanceMapSection />
        <Suspense fallback={<SectionSkeleton />}><CentroUniversoSection /></Suspense>
      </main>

      <SceneModeController />
        <SceneMusicController />
      <BackToTop />
      <Footer />
    </div>
    </AuthGate>
  )
}

export default App
