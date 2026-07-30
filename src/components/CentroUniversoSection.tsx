import { useState, useEffect } from 'react'
import SectionTitle from './SectionTitle'
import LocalIdentitySelector from './LocalIdentitySelector'
import useCrudCollection from './centro-universo/useCrudCollection'
import CrudEditorPanel from './centro-universo/CrudEditorPanel'
import SimulationBanner from './centro-universo/SimulationBanner'
import LetterStatsPanel from './centro-universo/LetterStatsPanel'
import BackupPanel from './centro-universo/BackupPanel'
import { Trash2, Power, Edit2, Heart, Star, Calendar, Sparkles, Camera, Music, Mail, BookOpen } from 'lucide-react'
import monthlyLettersData from '../data/monthlyLetters.json'
import openWhenData from '../data/openWhen.json'
import reasonsData from '../data/reasons.json'
import promisesData from '../data/promises.json'
import importantDatesData from '../data/importantDates.json'
import futureDreamsData from '../data/futureDreams.json'
import timelineData from '../data/timeline.json'
import blackHoleGalleryData from '../data/blackHoleGallery.json'
import playlistData from '../data/playlist.json'
import {
  getSimulationUnlocked,
  isMonthlyLetterOpened,
  isOpenWhenLetterOpened,
  setMonthlyLetterOpened,
  setOpenWhenLetterOpened,
  setSimulationUnlocked,
  migrateLegacyLettersIfNeeded
} from '../services/contentService'
import {
  detailsToText,
  textToDetails,
  parseTimelineDateForInput,
  normalizeTimelineDateForStorage
} from '../utils/helpers'

function CentroUniversoSection() {
  const [isSimUnlocked, setIsSimUnlocked] = useState(false)
  const [crudNotice, setCrudNotice] = useState(null)
  const [, setLetterProgressVersion] = useState(0)
  const [activeCrudModule, setActiveCrudModule] = useState('monthlyLetters')
  const [activeCrudAction, setActiveCrudAction] = useState('originals')
  const [activeCrudFilter, setActiveCrudFilter] = useState('all')

  // --- Refactored collections using useCrudCollection ---
  const reasonsFields = [
    { name: 'title', label: 'Título de la razón', required: true, placeholder: 'Ej. Razón 101' },
    { name: 'text', label: 'Texto de la razón', required: true, type: 'textarea', rows: 4, placeholder: 'Escribe una nueva razón para que flote en la sección.' }
  ]
  const reasonsCrud = useCrudCollection('reasons', reasonsData, {
    fields: reasonsFields,
    idPrefix: 'local-reason-'
  })

  const promisesFields = [
    { name: 'title', label: 'Título', required: true, placeholder: 'Ej. Promesa #1' },
    { name: 'text', label: 'Texto', required: true, type: 'textarea', rows: 4, placeholder: 'Escribe la promesa...' },
    { name: 'tag', label: 'Tag', placeholder: 'Ej. eterna, diaria, viaje' }
  ]
  const promisesCrud = useCrudCollection('promises', promisesData, {
    fields: promisesFields,
    idPrefix: 'local-promise-'
  })

  const importantDatesFields = [
    { name: 'date', label: 'Fecha', type: 'date' },
    { name: 'title', label: 'Título', required: true, placeholder: 'Ej. Primer beso' },
    { name: 'description', label: 'Descripción', type: 'textarea', rows: 3, placeholder: '¿Qué pasó ese día?' },
    { name: 'tag', label: 'Tag', placeholder: 'Ej. aniversario, viaje' }
  ]
  const importantDatesCrud = useCrudCollection('importantDates', importantDatesData, {
    fields: importantDatesFields,
    idPrefix: 'local-date-'
  })

  const futureDreamsFields = [
    { name: 'category', label: 'Categoría', placeholder: 'Ej. Viajes, Hogar, Aventuras' },
    { name: 'title', label: 'Título', required: true, placeholder: 'Ej. Viaje a Japón' },
    { name: 'description', label: 'Descripción', type: 'textarea', rows: 3, placeholder: 'Describe el sueño...' }
  ]
  const futureDreamsCrud = useCrudCollection('futureDreams', futureDreamsData, {
    fields: futureDreamsFields,
    idPrefix: 'local-dream-'
  })

  const playlistFields = [
    { name: 'title', label: 'Título', required: true, placeholder: 'Ej. Nuestra canción' },
    { name: 'artist', label: 'Artista', placeholder: 'Nombre del artista' },
    { name: 'description', label: 'Descripción', type: 'textarea', rows: 3, placeholder: '¿Por qué es especial?' },
    { name: 'sourceType', label: 'Tipo', type: 'select', options: [{value:'local',label:'Local'},{value:'external',label:'Enlace externo'}] },
    { name: 'src', label: 'URL o archivo', placeholder: '/audio/cancion.mp3' },
    { name: 'link', label: 'Enlace', placeholder: 'https://...' },
    { name: 'tag', label: 'Tag', placeholder: 'Ej. romántica, bailable' }
  ]
  const playlistCrud = useCrudCollection('playlist', playlistData, {
    fields: playlistFields,
    idPrefix: 'local-song-'
  })

  const timelineFields = [
    { name: 'chapter', label: 'Capítulo', required: true, placeholder: 'Ej. Capítulo I' },
    { name: 'date', label: 'Fecha', required: true, placeholder: 'YYYY-MM-DD o "15 de enero de 2026"' },
    { name: 'title', label: 'Título', required: true, placeholder: 'Nombre del momento' },
    { name: 'subtitle', label: 'Subtítulo', placeholder: 'Una frase que lo acompañe' },
    { name: 'description', label: 'Descripción', required: true, type: 'textarea', rows: 4, placeholder: 'Cuenta la historia...' },
    { name: 'quote', label: 'Cita', type: 'textarea', rows: 2, placeholder: 'Una frase especial' },
    { name: 'details', label: 'Detalles', type: 'textarea', rows: 3, placeholder: 'Uno por línea' },
    { name: 'mood', label: 'Mood', placeholder: 'Ej. romántico, aventura, nostalgia' }
  ]
  const timelineCrud = useCrudCollection('timeline', timelineData, {
    fields: timelineFields,
    idPrefix: 'local-timeline-'
  }, {
    transformForStorage: (item) => ({
      ...item,
      date: normalizeTimelineDateForStorage(item.date),
      details: textToDetails(String(item.details || '')),
    }),
    transformForEdit: (item) => ({
      ...item,
      date: parseTimelineDateForInput(item.date),
      details: detailsToText(item.details),
    })
  })

  const blackHoleFields = [
    { name: 'date', label: 'Fecha', placeholder: 'YYYY-MM-DD o "15 de enero de 2026"' },
    { name: 'title', label: 'Título', required: true, placeholder: 'Nombre del recuerdo' },
    { name: 'description', label: 'Descripción', type: 'textarea', rows: 3, placeholder: '¿Qué pasó ese día?' },
    { name: 'image', label: 'Imagen (base64 o URL)', type: 'textarea', rows: 2, placeholder: 'Pega una URL o usa el botón de subir archivo' },
    { name: 'alt', label: 'Texto alternativo', placeholder: 'Describe la imagen' },
    { name: 'tag', label: 'Tag', placeholder: 'Ej. foto, concierto, viaje' },
    { name: 'videoUrl', label: 'Video URL', placeholder: 'https://...' }
  ]
  const blackHoleCrud = useCrudCollection('blackHoleGallery', blackHoleGalleryData, {
    fields: blackHoleFields,
    idPrefix: 'local-blackhole-'
  })

  // ─── Cartas (migradas de storage legacy) ───
  const monthlyLettersFields = [
    { name: 'month', label: 'Mes', placeholder: 'Ej. Enero 2024' },
    { name: 'title', label: 'Título', required: true, placeholder: 'Título de la carta' },
    { name: 'preview', label: 'Vista previa', type: 'textarea', rows: 2, placeholder: 'Un breve adelanto...' },
    { name: 'content', label: 'Contenido', required: true, type: 'textarea', rows: 6, placeholder: 'Escribe la carta (un párrafo por línea)' },
    { name: 'tag', label: 'Etiqueta', placeholder: 'Ej. aniversario, San Valentín' },
    { name: 'locked', label: 'Bloqueada', type: 'select', options: [{ value: '', label: 'Desbloqueada' }, { value: 'true', label: 'Bloqueada' }] }
  ]
  const monthlyLettersCrud = useCrudCollection('monthlyLetters', monthlyLettersData, {
    fields: monthlyLettersFields,
    idPrefix: 'local-monthly-'
  }, {
    transformForStorage: (item) => ({
      ...item,
      content: textToDetails(String(item.content || '')),
      locked: item.locked === 'true' || item.locked === true
    }),
    transformForEdit: (item) => ({
      ...item,
      content: Array.isArray(item.content) ? item.content.join('\n') : String(item.content || ''),
      locked: item.locked ? 'true' : ''
    })
  })

  const openWhenLettersFields = [
    { name: 'mood', label: 'Mood', placeholder: 'Ej. Cuando extrañes nuestros viajes' },
    { name: 'title', label: 'Título', required: true, placeholder: 'Título de la carta' },
    { name: 'preview', label: 'Vista previa', type: 'textarea', rows: 2, placeholder: 'Un breve adelanto...' },
    { name: 'content', label: 'Contenido', required: true, type: 'textarea', rows: 6, placeholder: 'Escribe la carta (un párrafo por línea)' },
    { name: 'tag', label: 'Etiqueta', placeholder: 'Ej. nostalgia, futuro' },
    { name: 'locked', label: 'Bloqueada', type: 'select', options: [{ value: '', label: 'Desbloqueada' }, { value: 'true', label: 'Bloqueada' }] }
  ]
  const openWhenLettersCrud = useCrudCollection('openWhenLetters', openWhenData, {
    fields: openWhenLettersFields,
    idPrefix: 'local-openwhen-'
  }, {
    transformForStorage: (item) => ({
      ...item,
      content: textToDetails(String(item.content || '')),
      locked: item.locked === 'true' || item.locked === true
    }),
    transformForEdit: (item) => ({
      ...item,
      content: Array.isArray(item.content) ? item.content.join('\n') : String(item.content || ''),
      locked: item.locked ? 'true' : ''
    })
  })

  const crudModules = [
    { id: 'monthlyLetters', label: 'Cartas', icon: Mail },
    { id: 'openWhenLetters', label: 'Abrir cuando', icon: BookOpen },
    { id: 'reasons', label: 'Razones', icon: Heart },
    { id: 'promises', label: 'Promesas', icon: Star },
    { id: 'importantDates', label: 'Fechas', icon: Calendar },
    { id: 'futureDreams', label: 'Sueños', icon: Sparkles },
    { id: 'timeline', label: 'Historia', icon: BookOpen },
    { id: 'blackHoleGallery', label: 'Galería', icon: Camera },
    { id: 'playlist', label: 'Música', icon: Music }
  ]
  // Simplified: only 2 actions — originals or yours (create is inside "yours" tab)
  const crudActions = [
    { id: 'originals', label: 'Originales', icon: BookOpen },
    { id: 'local', label: 'Tus creaciones', icon: Edit2 }
  ]
  useEffect(() => {
    setIsSimUnlocked(getSimulationUnlocked())

    // Migrar cartas de storage legacy → estándar (solo una vez)
    migrateLegacyLettersIfNeeded()

    reasonsCrud.loadData()
    promisesCrud.loadData()
    monthlyLettersCrud.loadData()
    openWhenLettersCrud.loadData()
    importantDatesCrud.loadData()
    futureDreamsCrud.loadData()
    timelineCrud.loadData()
    blackHoleCrud.loadData()
    playlistCrud.loadData()
  }, [])

  useEffect(() => {
    if (!crudNotice) return undefined

    const timer = window.setTimeout(() => {
      setCrudNotice(null)
    }, 3600)

    return () => window.clearTimeout(timer)
  }, [crudNotice])

  useEffect(() => {
    const refreshLetterProgress = () => {
      setLetterProgressVersion((value) => value + 1)
    }
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        refreshLetterProgress()
      }
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

  // ─── Datos derivados de cartas (ahora desde useCrudCollection) ───
  const visibleBaseMonthly = monthlyLettersCrud.visibleBaseItems
  const visibleBaseOpenWhen = openWhenLettersCrud.visibleBaseItems
  const activeBaseMonthly = visibleBaseMonthly.filter((l: any) => !l.isHidden)
  const activeBaseOpenWhen = visibleBaseOpenWhen.filter((c: any) => !c.isHidden)
  const editedBaseMonthlyCount = monthlyLettersCrud.editedBaseCount
  const hiddenBaseMonthlyCount = monthlyLettersCrud.hiddenBaseCount
  const editedBaseOpenWhenCount = openWhenLettersCrud.editedBaseCount
  const hiddenBaseOpenWhenCount = openWhenLettersCrud.hiddenBaseCount

  const localMonthly = monthlyLettersCrud.localItems
  const localOpenWhen = openWhenLettersCrud.localItems

  const totalMonthly = activeBaseMonthly.length + localMonthly.length
  const openedMonthly = activeBaseMonthly.filter((l: any) => isMonthlyLetterOpened(l.id)).length +
    localMonthly.filter((l: any) => isMonthlyLetterOpened(l.id)).length
  const unlockedMonthly = activeBaseMonthly.filter((l: any) => !l.locked).length +
    localMonthly.filter((l: any) => !l.locked).length
  const lockedMonthly = totalMonthly - unlockedMonthly

  const totalOpenWhen = activeBaseOpenWhen.length + localOpenWhen.length
  const openedOpenWhen = activeBaseOpenWhen.filter((c: any) => isOpenWhenLetterOpened(c.id)).length +
    localOpenWhen.filter((c: any) => isOpenWhenLetterOpened(c.id)).length
  const unlockedOpenWhen = activeBaseOpenWhen.filter((c: any) => !c.locked).length +
    localOpenWhen.filter((c: any) => !c.locked).length
  const lockedOpenWhen = totalOpenWhen - unlockedOpenWhen

  const editedBaseTimelineCount = timelineCrud.editedBaseCount
  const hiddenBaseTimelineCount = timelineCrud.hiddenBaseCount
  const visibleBaseTimelinePages = timelineCrud.visibleBaseItems
  const editedBaseBlackHoleGalleryCount = blackHoleCrud.editedBaseCount
  const hiddenBaseBlackHoleGalleryCount = blackHoleCrud.hiddenBaseCount
  const visibleBaseBlackHoleGallery = blackHoleCrud.visibleBaseItems
  const filterBaseItemsByCrudFilter = (items) => {
    if (activeCrudFilter === 'base') return items.filter((item) => !item.isHidden && !item.isOverridden)
    if (activeCrudFilter === 'edited') return items.filter((item) => item.isOverridden)
    if (activeCrudFilter === 'hidden') return items.filter((item) => item.isHidden)
    return items
  }
  const getNormalBaseCount = (items) => items.filter((item) => !item.isHidden && !item.isOverridden).length
  const filteredBaseMonthly = filterBaseItemsByCrudFilter(visibleBaseMonthly)
  const filteredBaseOpenWhen = filterBaseItemsByCrudFilter(visibleBaseOpenWhen)
  const filteredBaseTimelinePages = filterBaseItemsByCrudFilter(visibleBaseTimelinePages)
  const filteredBaseBlackHoleGallery = filterBaseItemsByCrudFilter(visibleBaseBlackHoleGallery)

  const toggleSimulation = () => {
    if (isSimUnlocked) {
      setSimulationUnlocked(false)
    } else {
      setSimulationUnlocked(true)
    }
    window.location.reload()
  }


  const dispatchContentUpdate = (collection) => {
    window.dispatchEvent(
      new CustomEvent('distancia-cero-content-updated', {
        detail: { collection }
      })
    )
  }

  const showCrudNotice = (message, type = "success") => {
    setCrudNotice({ message, type })
  }















































  const buildPlaylistPatch = ({
    title,
    artist,
    description,
    sourceType,
    src,
    link,
    tag
  }) => ({
    title: title.trim(),
    artist: artist.trim(),
    description: description.trim(),
    sourceType,
    src: src.trim(),
    link: link.trim(),
    tag: tag.trim(),
    updatedAt: new Date().toISOString()
  })

  const isPlaylistFormValid = ({ title, description, sourceType, src, link }) => {
    if (!title.trim() || !description.trim()) return false
    if (sourceType === 'local') return Boolean(src.trim())
    if (sourceType === 'external') return Boolean(link.trim())
    return false
  }

















  const handleReset = () => {
    if (
      window.confirm(
        '¿Seguro que quieres borrar el progreso de lectura de las cartas? Esto no afectará las cartas creadas ni la música.'
      )
    ) {
      // Clear progress keys for JSON letters
      monthlyLettersData.forEach((l) => {
        setMonthlyLetterOpened(String(l.id), false)
      })
      openWhenData.forEach((c: any) => {
        setOpenWhenLetterOpened(String(c.id), false)
      })
      // Clear progress keys for Local letters
      localMonthly.forEach((l) => {
        setMonthlyLetterOpened(String(l.id), false)
      })
      localOpenWhen.forEach((c) => {
        setOpenWhenLetterOpened(String(c.id), false)
      })
      setSimulationUnlocked(false)
      window.location.reload()
    }
  }

  const resetCrudEditingState = (nextModule = activeCrudModule) => {
    reasonsCrud.resetForm()
    reasonsCrud.resetBaseForm()
    promisesCrud.resetForm()
    promisesCrud.resetBaseForm()
    monthlyLettersCrud.resetForm()
    monthlyLettersCrud.resetBaseForm()
    openWhenLettersCrud.resetForm()
    openWhenLettersCrud.resetBaseForm()
    importantDatesCrud.resetForm()
    importantDatesCrud.resetBaseForm()
    futureDreamsCrud.resetForm()
    futureDreamsCrud.resetBaseForm()
    timelineCrud.resetForm()
    timelineCrud.resetBaseForm()
    blackHoleCrud.resetForm()
    blackHoleCrud.resetBaseForm()
    playlistCrud.resetForm()
    playlistCrud.resetBaseForm()
  }

  const handleCrudModuleChange = (moduleId) => {
    resetCrudEditingState(moduleId)
    setActiveCrudModule(moduleId)
    setActiveCrudFilter('all')
  }

  const handleCrudActionChange = (actionId) => {
    resetCrudEditingState()
    setActiveCrudAction(actionId)
    setActiveCrudFilter(actionId === 'local' ? 'local' : 'all')
  }

  const handleCrudFilterClick = (filter) => {
    setActiveCrudFilter(filter)
    setActiveCrudAction(filter === 'local' ? 'local' : 'originals')
  }

  return (
    <section id="centro-universo" className="section centro-universo-section">
      <SectionTitle
        eyebrow="Panel de Control"
        title="Centro del Universo"
        text="Rinconcito de administración local y depuración."
      />

      <SimulationBanner isSimUnlocked={isSimUnlocked} onToggle={toggleSimulation} />

      {/* Statistics Cards */}
      <LetterStatsPanel
        monthlyStats={{ total: totalMonthly, opened: openedMonthly, unlocked: unlockedMonthly, locked: lockedMonthly }}
        openWhenStats={{ total: totalOpenWhen, opened: openedOpenWhen, unlocked: unlockedOpenWhen, locked: lockedOpenWhen }}
        onNavigate={(moduleId) => {
          const editorMap: Record<string, string> = {
            monthlyLetters: 'local-monthly-editor',
            openWhenLetters: 'local-openwhen-editor',
          }
          handleCrudModuleChange(moduleId)
          handleCrudActionChange('local')
          setTimeout(() => {
            const el = document.getElementById(editorMap[moduleId] || '')
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
          }, 150)
        }}
      />

      {/* Global Actions */}
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

      <BackupPanel />

      <div className="crud-central-shell">
        <div className="crud-selector-block">
          <h3>¿Qué quieres editar?</h3>
          <div className="crud-selector-grid">
            {crudModules.map((module) => {
              const Icon = module.icon
              return (
              <button
                className={`crud-selector-btn ${activeCrudModule === module.id ? 'active' : ''}`}
                key={module.id}
                onClick={() => handleCrudModuleChange(module.id)}
                type="button"
              >
                <Icon size={18} />
                <span>{module.label}</span>
              </button>
            )})}
          </div>
        </div>

        <div className="crud-selector-block">
          <h3>¿Qué quieres hacer?</h3>
          <div className="crud-selector-grid compact">
            {crudActions.map((action) => {
              const ActionIcon = action.icon
              return (
              <button
                className={`crud-selector-btn ${activeCrudAction === action.id ? 'active' : ''}`}
                key={action.id}
                onClick={() => handleCrudActionChange(action.id)}
                type="button"
              >
                <ActionIcon size={16} />
                <span>{action.label}</span>
              </button>
            )})}
          </div>
        </div>
      </div>

      {crudNotice && (
        <div className={`crud-notice ${crudNotice.type}`} role="status" aria-live="polite">
          <span>{crudNotice.message}</span>
          <button type="button" onClick={() => setCrudNotice(null)} aria-label="Cerrar aviso">
            ×
          </button>
        </div>
      )}

      <CrudEditorPanel
        collectionLabel="Cartas Mensuales"
        collectionName="monthlyLetters"
        activeCrudModule={activeCrudModule}
        activeCrudAction={activeCrudAction}
        activeCrudFilter={activeCrudFilter}
        onCrudFilterClick={handleCrudFilterClick}
        crud={monthlyLettersCrud}
        fields={monthlyLettersFields}
        listFields={["title", "month", "tag"]}
        editorPanelId="local-monthly-editor"
        baseEditorPanelId="base-monthly-editor"
      />

      <CrudEditorPanel
        collectionLabel="Cartas Abrir Cuando"
        collectionName="openWhenLetters"
        activeCrudModule={activeCrudModule}
        activeCrudAction={activeCrudAction}
        activeCrudFilter={activeCrudFilter}
        onCrudFilterClick={handleCrudFilterClick}
        crud={openWhenLettersCrud}
        fields={openWhenLettersFields}
        listFields={["title", "mood", "tag"]}
        editorPanelId="local-openwhen-editor"
        baseEditorPanelId="base-openwhen-editor"
      />

      <CrudEditorPanel
        collectionLabel="100 razones"
        collectionName="reasons"
        activeCrudModule={activeCrudModule}
        activeCrudAction={activeCrudAction}
        activeCrudFilter={activeCrudFilter}
        onCrudFilterClick={handleCrudFilterClick}
        crud={reasonsCrud}
        fields={reasonsFields}
        listFields={['title', 'text']}
        editorPanelId="local-reasons-editor"
        baseEditorPanelId="base-reasons-editor"
      />

      <CrudEditorPanel
        collectionLabel="Fechas importantes"
        collectionName="importantDates"
        activeCrudModule={activeCrudModule}
        activeCrudAction={activeCrudAction}
        activeCrudFilter={activeCrudFilter}
        onCrudFilterClick={handleCrudFilterClick}
        crud={importantDatesCrud}
        fields={importantDatesFields}
        listFields={['date', 'title', 'description']}
        editorPanelId="local-dates-editor"
        baseEditorPanelId="base-dates-editor"
      />

<CrudEditorPanel
        collectionLabel="Wishlist / Sueños"
        collectionName="futureDreams"
        activeCrudModule={activeCrudModule}
        activeCrudAction={activeCrudAction}
        activeCrudFilter={activeCrudFilter}
        onCrudFilterClick={handleCrudFilterClick}
        crud={futureDreamsCrud}
        fields={futureDreamsFields}
        listFields={['title', 'category', 'description']}
        editorPanelId="local-dreams-editor"
        baseEditorPanelId="base-dreams-editor"
      />

      <CrudEditorPanel
        collectionLabel="Historia"
        collectionName="timeline"
        activeCrudModule={activeCrudModule}
        activeCrudAction={activeCrudAction}
        activeCrudFilter={activeCrudFilter}
        onCrudFilterClick={handleCrudFilterClick}
        crud={timelineCrud}
        fields={timelineFields}
        listFields={["chapter", "title", "date"]}
        editorPanelId="local-timeline-editor"
        baseEditorPanelId="base-timeline-editor"
      />
      <CrudEditorPanel
        collectionLabel="Galería"
        collectionName="blackHoleGallery"
        activeCrudModule={activeCrudModule}
        activeCrudAction={activeCrudAction}
        activeCrudFilter={activeCrudFilter}
        onCrudFilterClick={handleCrudFilterClick}
        crud={blackHoleCrud}
        fields={blackHoleFields}
        listFields={["title", "date", "tag"]}
        editorPanelId="local-blackhole-editor"
        baseEditorPanelId="base-blackhole-editor"
        localFormExtras={(
          <div className="editor-field">
            <label>Subir imagen desde archivo</label>
            <input type="file" accept="image/*" className="control-btn" style={{width:'100%'}}
              onChange={(e) => {
                const file = (e.target as HTMLInputElement).files?.[0]
                if (!file) return
                if (!file.type.startsWith('image/')) { alert('Selecciona un archivo de imagen válido.'); return }
                if (file.size > 2 * 1024 * 1024) { alert('La imagen supera 2 MB.'); return }
                const reader = new FileReader()
                reader.onload = () => { blackHoleCrud.setFormValue('image', String(reader.result || '')) }
                reader.readAsDataURL(file)
              }}
            />
          </div>
        )}
        baseFormExtras={(
          <div className="editor-field">
            <label>Subir imagen desde archivo</label>
            <input type="file" accept="image/*" className="control-btn" style={{width:'100%'}}
              onChange={(e) => {
                const file = (e.target as HTMLInputElement).files?.[0]
                if (!file) return
                if (!file.type.startsWith('image/')) { alert('Selecciona un archivo de imagen válido.'); return }
                if (file.size > 2 * 1024 * 1024) { alert('La imagen supera 2 MB.'); return }
                const reader = new FileReader()
                reader.onload = () => { blackHoleCrud.setBaseFormValue('image', String(reader.result || '')) }
                reader.readAsDataURL(file)
              }}
            />
          </div>
        )}
      />
      <CrudEditorPanel
        collectionLabel="Playlist"
        collectionName="playlist"
        activeCrudModule={activeCrudModule}
        activeCrudAction={activeCrudAction}
        activeCrudFilter={activeCrudFilter}
        onCrudFilterClick={handleCrudFilterClick}
        crud={playlistCrud}
        fields={playlistFields}
        listFields={['title', 'artist', 'description']}
        editorPanelId="local-playlist-editor"
        baseEditorPanelId="base-playlist-editor"
      />

<CrudEditorPanel
        collectionLabel="Promesas"
        collectionName="promises"
        activeCrudModule={activeCrudModule}
        activeCrudAction={activeCrudAction}
        activeCrudFilter={activeCrudFilter}
        onCrudFilterClick={handleCrudFilterClick}
        crud={promisesCrud}
        fields={promisesFields}
        listFields={['title', 'text']}
        editorPanelId="local-promises-editor"
        baseEditorPanelId="base-promises-editor"
      />

    </section>
  )
}

export default CentroUniversoSection
