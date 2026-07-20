import { lazy, Suspense } from 'react'
import AuthGate from './components/AuthGate'
import LoadingIntro from './components/LoadingIntro'
import Hero from './components/Hero'
import ProposalSection from './components/ProposalSection'
import CounterSection from './components/CounterSection'
import MainLetter from './components/MainLetter'
import StoryTimeline from './components/StoryTimeline'
const UniverseSection = lazy(() => import('./components/UniverseSection'))
import MonthlyLetters from './components/MonthlyLetters'
import OpenWhenSection from './components/OpenWhenSection'
import PlaylistSection from './components/PlaylistSection'
import ReasonsSection from './components/ReasonsSection'
import ImportantDatesSection from './components/ImportantDatesSection'
import BlackHoleGallerySection from './components/BlackHoleGallerySection'
import FutureDreamsSection from './components/FutureDreamsSection'
import PromisesSection from './components/PromisesSection'
import DistanceMapSection from './components/DistanceMapSection'
const CentroUniversoSection = lazy(() => import('./components/CentroUniversoSection'))
import SceneMusicController from './components/SceneMusicController'
import SceneModeController from './components/SceneModeController'
import BackToTop from './components/BackToTop'
import Footer from './components/Footer'

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
        <StoryTimeline timeline={timeline} />
        <Suspense fallback={<div className="section" />}>
          <UniverseSection universe={universe} />
        </Suspense>
        <MonthlyLetters letters={monthlyLetters} />
        <OpenWhenSection cards={openWhen} />
        <PlaylistSection playlist={playlist} />
        <ReasonsSection reasons={reasons} />
        <ImportantDatesSection dates={importantDates} />
        <BlackHoleGallerySection items={blackHoleGallery} />
        <FutureDreamsSection dreams={futureDreams} />
        <PromisesSection promises={promises} />
        <DistanceMapSection />
        <Suspense fallback={<div className="section"><div className="section-title"><span className="small-pill">Cargando...</span></div></div>}>
          <CentroUniversoSection />
        </Suspense>
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




