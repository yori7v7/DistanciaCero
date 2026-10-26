import { useState, useEffect, useRef } from 'react'
import SectionTitle from './SectionTitle'
import LocalIdentitySelector from './LocalIdentitySelector'
import useCrudCollection from './centro-universo/useCrudCollection'
import type { CrudCollectionAPI } from './centro-universo/useCrudCollection'
import CrudEditorPanel from './centro-universo/CrudEditorPanel'
import SimulationBanner from './centro-universo/SimulationBanner'
import LetterStatsPanel from './centro-universo/LetterStatsPanel'
import BackupPanel from './centro-universo/BackupPanel'
import GeneralSettingsPanel from './centro-universo/GeneralSettingsPanel'
import { BookOpen, Edit2, Power, Trash2 } from 'lucide-react'
import {
  cmsCollections,
  cmsPanelOrder,
  cmsSelectorOrder,
} from './centro-universo/cmsCollections'
import type { CrudAction, CrudFilter } from './centro-universo/cmsCollections'
import type { CollectionName } from '../types/content'
import { getScrollBehavior } from '../utils/motion'
import {
  getSimulationUnlocked,
  isMonthlyLetterOpened,
  isOpenWhenLetterOpened,
  setMonthlyLetterOpened,
  setOpenWhenLetterOpened,
  setSimulationUnlocked,
  migrateLegacyLettersIfNeeded,
  notifyContentUpdated,
} from '../services/contentService'

const crudActions: { id: CrudAction; label: string; icon: typeof BookOpen }[] = [
  { id: 'originals', label: 'Originales', icon: BookOpen },
  { id: 'local', label: 'Tus creaciones', icon: Edit2 },
]

function getLetterStats(crud: CrudCollectionAPI, isOpened: (id: string | number) => boolean) {
  const items = [...crud.visibleBaseItems.filter(item => !item.isHidden), ...crud.localItems]
  const unlocked = items.filter(item => !item.locked).length
  return {
    total: items.length,
    opened: items.filter(item => isOpened(item.id)).length,
    unlocked,
    locked: items.length - unlocked,
  }
}

function CentroUniversoSection() {
  const [isSimUnlocked, setIsSimUnlocked] = useState(getSimulationUnlocked)
  const [crudNotice, setCrudNotice] = useState<CrudCollectionAPI['notice']>(null)
  const [, setLetterProgressVersion] = useState(0)
  const [activeCrudModule, setActiveCrudModule] = useState<CollectionName>('monthlyLetters')
  const [activeCrudAction, setActiveCrudAction] = useState<CrudAction>('originals')
  const [activeCrudFilter, setActiveCrudFilter] = useState<CrudFilter>('all')
  const editorScrollTimerRef = useRef<number | null>(null)

  // Keep hooks explicit and unconditional; only their static definitions are shared.
  const reasonsCrud = useCrudCollection(
    'reasons', cmsCollections.reasons.defaultData, cmsCollections.reasons, cmsCollections.reasons.options,
  )
  const promisesCrud = useCrudCollection(
    'promises', cmsCollections.promises.defaultData, cmsCollections.promises, cmsCollections.promises.options,
  )
  const importantDatesCrud = useCrudCollection(
    'importantDates', cmsCollections.importantDates.defaultData, cmsCollections.importantDates, cmsCollections.importantDates.options,
  )
  const futureDreamsCrud = useCrudCollection(
    'futureDreams', cmsCollections.futureDreams.defaultData, cmsCollections.futureDreams, cmsCollections.futureDreams.options,
  )
  const playlistCrud = useCrudCollection(
    'playlist', cmsCollections.playlist.defaultData, cmsCollections.playlist, cmsCollections.playlist.options,
  )
  const timelineCrud = useCrudCollection(
    'timeline', cmsCollections.timeline.defaultData, cmsCollections.timeline, cmsCollections.timeline.options,
  )
  const blackHoleCrud = useCrudCollection(
    'blackHoleGallery', cmsCollections.blackHoleGallery.defaultData, cmsCollections.blackHoleGallery, cmsCollections.blackHoleGallery.options,
  )
  const monthlyLettersCrud = useCrudCollection(
    'monthlyLetters', cmsCollections.monthlyLetters.defaultData, cmsCollections.monthlyLetters, cmsCollections.monthlyLetters.options,
  )
  const openWhenLettersCrud = useCrudCollection(
    'openWhenLetters', cmsCollections.openWhenLetters.defaultData, cmsCollections.openWhenLetters, cmsCollections.openWhenLetters.options,
  )

  const crudByCollection: Record<CollectionName, CrudCollectionAPI> = {
    reasons: reasonsCrud,
    promises: promisesCrud,
    importantDates: importantDatesCrud,
    futureDreams: futureDreamsCrud,
    playlist: playlistCrud,
    timeline: timelineCrud,
    blackHoleGallery: blackHoleCrud,
    monthlyLetters: monthlyLettersCrud,
    openWhenLetters: openWhenLettersCrud,
  }

  useEffect(() => {
    setIsSimUnlocked(getSimulationUnlocked())

    // Un fallo de almacenamiento conserva los datos legibles y permite reintentar.
    try {
      if (migrateLegacyLettersIfNeeded()) notifyContentUpdated('letters')
    } catch (error) {
      setCrudNotice({
        message: error instanceof Error ? error.message : 'No se pudo completar la migración de cartas.',
        type: 'error',
      })
    }

    Object.values(crudByCollection).forEach(crud => crud.loadData())
  }, [])

  useEffect(() => {
    const refreshLetterProgress = () => {
      setIsSimUnlocked(getSimulationUnlocked())
      setLetterProgressVersion((value) => value + 1)
    }
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') refreshLetterProgress()
    }

    window.addEventListener('focus', refreshLetterProgress)
    window.addEventListener('distancia-cero-scene-change', refreshLetterProgress)
    window.addEventListener('distancia-cero-content-updated', refreshLetterProgress)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      window.removeEventListener('focus', refreshLetterProgress)
      window.removeEventListener('distancia-cero-scene-change', refreshLetterProgress)
      window.removeEventListener('distancia-cero-content-updated', refreshLetterProgress)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  useEffect(() => () => {
    if (editorScrollTimerRef.current !== null) window.clearTimeout(editorScrollTimerRef.current)
  }, [])

  const monthlyStats = getLetterStats(monthlyLettersCrud, isMonthlyLetterOpened)
  const openWhenStats = getLetterStats(openWhenLettersCrud, isOpenWhenLetterOpened)

  const toggleSimulation = () => {
    setSimulationUnlocked(!getSimulationUnlocked())
    notifyContentUpdated('letters')
  }

  const handleReset = () => {
    if (
      window.confirm(
        '¿Seguro que quieres borrar el progreso de lectura de las cartas? Esto no afectará las cartas creadas ni la música.'
      )
    ) {
      // Reset base and local reading progress without changing letter content.
      cmsCollections.monthlyLetters.defaultData.forEach(letter => setMonthlyLetterOpened(String(letter.id), false))
      cmsCollections.openWhenLetters.defaultData.forEach(letter => setOpenWhenLetterOpened(String(letter.id), false))
      monthlyLettersCrud.localItems.forEach(letter => setMonthlyLetterOpened(String(letter.id), false))
      openWhenLettersCrud.localItems.forEach(letter => setOpenWhenLetterOpened(String(letter.id), false))
      setSimulationUnlocked(false)
      notifyContentUpdated('letters')
    }
  }

  const cancelEditorScroll = () => {
    if (editorScrollTimerRef.current !== null) {
      window.clearTimeout(editorScrollTimerRef.current)
      editorScrollTimerRef.current = null
    }
  }

  const resetCrudEditingState = () => {
    Object.values(crudByCollection).forEach(crud => {
      crud.resetForm()
      crud.resetBaseForm()
    })
  }

  const handleCrudModuleChange = (moduleId: CollectionName) => {
    cancelEditorScroll()
    resetCrudEditingState()
    setActiveCrudModule(moduleId)
    setActiveCrudFilter('all')
  }

  const handleCrudActionChange = (actionId: CrudAction) => {
    cancelEditorScroll()
    resetCrudEditingState()
    setActiveCrudAction(actionId)
    setActiveCrudFilter(actionId === 'local' ? 'local' : 'all')
  }

  const handleCrudFilterClick = (filter: CrudFilter) => {
    cancelEditorScroll()
    setActiveCrudFilter(filter)
    setActiveCrudAction(filter === 'local' ? 'local' : 'originals')
  }

  const handleLetterStatsNavigate = (moduleId: string) => {
    if (moduleId !== 'monthlyLetters' && moduleId !== 'openWhenLetters') return
    handleCrudModuleChange(moduleId)
    handleCrudActionChange('local')
    const editorPanelId = cmsCollections[moduleId].editorPanelId
    editorScrollTimerRef.current = window.setTimeout(() => {
      editorScrollTimerRef.current = null
      document.getElementById(editorPanelId)?.scrollIntoView({ behavior: getScrollBehavior(), block: 'start' })
    }, 150)
  }

  const renderGalleryImageUpload = (inputId: string, setImage: (value: string) => void) => (
    <div className="editor-field">
      <label htmlFor={inputId}>Subir imagen desde archivo</label>
      <input id={inputId} type="file" accept="image/*" className="control-btn" style={{ width: '100%' }}
        onChange={(event) => {
          const file = event.target.files?.[0]
          if (!file) return
          if (!file.type.startsWith('image/')) { alert('Selecciona un archivo de imagen válido.'); return }
          if (file.size > 2 * 1024 * 1024) { alert('La imagen supera 2 MB.'); return }
          const reader = new FileReader()
          reader.onload = () => { setImage(String(reader.result || '')) }
          reader.readAsDataURL(file)
        }}
      />
    </div>
  )

  return (
    <section id="centro-universo" className="section centro-universo-section">
      <SectionTitle
        eyebrow="Panel de Control"
        title="Centro del Universo"
        text="Rinconcito de administración local y depuración."
      />

      <SimulationBanner isSimUnlocked={isSimUnlocked} onToggle={toggleSimulation} />

      <LetterStatsPanel
        monthlyStats={monthlyStats}
        openWhenStats={openWhenStats}
        onNavigate={handleLetterStatsNavigate}
      />

      <div className="control-actions">
        <button
          className={`control-btn ${isSimUnlocked ? 'active-sim' : 'inactive-sim'}`}
          onClick={toggleSimulation}
          type="button"
        >
          <Power size={18} />
          {isSimUnlocked ? 'Desactivar Modo Prueba' : 'Activar Modo Prueba'}
        </button>

        <button className="control-btn reset-btn" onClick={handleReset} type="button">
          <Trash2 size={18} />
          Resetear Progreso
        </button>
      </div>

      <LocalIdentitySelector />
      <GeneralSettingsPanel />
      <BackupPanel />

      <div className="crud-central-shell">
        <div className="crud-selector-block">
          <h3>¿Qué quieres editar?</h3>
          <div className="crud-selector-grid">
            {cmsSelectorOrder.map(collectionName => {
              const config = cmsCollections[collectionName]
              const Icon = config.selectorIcon
              return (
                <button
                  className={`crud-selector-btn ${activeCrudModule === collectionName ? 'active' : ''}`}
                  key={collectionName}
                  aria-pressed={activeCrudModule === collectionName}
                  onClick={() => handleCrudModuleChange(collectionName)}
                  type="button"
                >
                  <Icon size={18} />
                  <span>{config.selectorLabel}</span>
                </button>
              )
            })}
          </div>
        </div>

        <div className="crud-selector-block">
          <h3>¿Qué quieres hacer?</h3>
          <div className="crud-selector-grid compact">
            {crudActions.map(action => {
              const ActionIcon = action.icon
              return (
                <button
                  className={`crud-selector-btn ${activeCrudAction === action.id ? 'active' : ''}`}
                  key={action.id}
                  aria-pressed={activeCrudAction === action.id}
                  onClick={() => handleCrudActionChange(action.id)}
                  type="button"
                >
                  <ActionIcon size={16} />
                  <span>{action.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {crudNotice && (
        <div className={`crud-notice ${crudNotice.type}`} role={crudNotice.type === 'error' ? 'alert' : 'status'}>
          <span>{crudNotice.message}</span>
          <button type="button" onClick={() => setCrudNotice(null)} aria-label="Cerrar aviso">
            ×
          </button>
        </div>
      )}

      {cmsPanelOrder.map(collectionName => {
        const config = cmsCollections[collectionName]
        return (
          <CrudEditorPanel
            key={collectionName}
            collectionLabel={config.collectionLabel}
            collectionName={collectionName}
            activeCrudModule={activeCrudModule}
            activeCrudAction={activeCrudAction}
            activeCrudFilter={activeCrudFilter}
            onCrudFilterClick={handleCrudFilterClick}
            crud={crudByCollection[collectionName]}
            fields={config.fields}
            listFields={config.listFields}
            editorPanelId={config.editorPanelId}
            baseEditorPanelId={config.baseEditorPanelId}
            localFormExtras={collectionName === 'blackHoleGallery'
              ? renderGalleryImageUpload('blackHoleGallery-local-image-file', value => blackHoleCrud.setFormValue('image', value))
              : undefined}
            baseFormExtras={collectionName === 'blackHoleGallery'
              ? renderGalleryImageUpload('blackHoleGallery-base-image-file', value => blackHoleCrud.setBaseFormValue('image', value))
              : undefined}
          />
        )
      })}
    </section>
  )
}

export default CentroUniversoSection
