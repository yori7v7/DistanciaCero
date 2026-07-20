import { useState, useEffect } from 'react'
import SectionTitle from './SectionTitle'
import LocalIdentitySelector from './LocalIdentitySelector'
import LocalContentMeta from './LocalContentMeta'
import CrudStatButton from './centro-universo/CrudStatButton'
import useCrudCollection from './centro-universo/useCrudCollection'
import CrudEditorPanel from './centro-universo/CrudEditorPanel'
import { ShieldAlert, Trash2, Power, Lock, Check, BookOpen, Edit2, Plus, AlertTriangle, Download, Upload } from 'lucide-react'
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
  addCollectionItem as addLocalItem,
  deleteCollectionItem as deleteLocalItem,
  deleteCollectionOverride as deleteLocalOverride,
  getCollectionHiddenIds as getHiddenItemIds,
  getCollectionItems as getLocalItems,
  getCollectionOverrides as getLocalOverrides,
  getLegacyMonthlyLetters,
  getLegacyOpenWhenLetters,
  getSimulationUnlocked,
  isMonthlyLetterOpened,
  isOpenWhenLetterOpened,
  hideCollectionItem as hideDefaultItem,
  restoreCollectionItem as restoreHiddenItem,
  saveCollectionHiddenIds as saveHiddenItemIds,
  saveCollectionItems as saveLocalItems,
  saveCollectionOverrides as saveLocalOverrides,
  saveLegacyMonthlyLetters,
  saveLegacyOpenWhenLetters,
  setCollectionOverride as setLocalOverride,
  setMonthlyLetterOpened,
  setOpenWhenLetterOpened,
  setSimulationUnlocked,
  updateCollectionItem as updateLocalItem
} from '../services/contentService'
import { buildCreateMetadata, buildUpdateMetadata } from '../services/contentMetadataService'

function CentroUniversoSection() {
  const [isSimUnlocked, setIsSimUnlocked] = useState(false)
  const [localMonthly, setLocalMonthly] = useState([])
  const [localOpenWhen, setLocalOpenWhen] = useState([])
  const [backupStatus, setBackupStatus] = useState(null)
  const [crudNotice, setCrudNotice] = useState(null)
  const [, setLetterProgressVersion] = useState(0)
  const [monthlyOverrides, setMonthlyOverrides] = useState({})
  const [hiddenMonthlyIds, setHiddenMonthlyIds] = useState([])
  const [baseMonthlyMonth, setBaseMonthlyMonth] = useState('')
  const [baseMonthlyTitle, setBaseMonthlyTitle] = useState('')
  const [baseMonthlyPreview, setBaseMonthlyPreview] = useState('')
  const [baseMonthlyContent, setBaseMonthlyContent] = useState('')
  const [baseMonthlyLocked, setBaseMonthlyLocked] = useState(false)
  const [editingBaseMonthlyId, setEditingBaseMonthlyId] = useState(null)
  const [openWhenOverrides, setOpenWhenOverrides] = useState({})
  const [hiddenOpenWhenIds, setHiddenOpenWhenIds] = useState([])
  const [baseOpenWhenMood, setBaseOpenWhenMood] = useState('')
  const [baseOpenWhenTitle, setBaseOpenWhenTitle] = useState('')
  const [baseOpenWhenPreview, setBaseOpenWhenPreview] = useState('')
  const [baseOpenWhenContent, setBaseOpenWhenContent] = useState('')
  const [baseOpenWhenLocked, setBaseOpenWhenLocked] = useState(false)
  const [editingBaseOpenWhenId, setEditingBaseOpenWhenId] = useState(null)
  const [localTimelinePages, setLocalTimelinePages] = useState([])
  const [timelineOverrides, setTimelineOverrides] = useState({})
  const [hiddenTimelineIds, setHiddenTimelineIds] = useState([])
  const [timelineChapter, setTimelineChapter] = useState('')
  const [timelineDate, setTimelineDate] = useState('')
  const [timelineTitle, setTimelineTitle] = useState('')
  const [timelineSubtitle, setTimelineSubtitle] = useState('')
  const [timelineDescription, setTimelineDescription] = useState('')
  const [timelineQuote, setTimelineQuote] = useState('')
  const [timelineDetails, setTimelineDetails] = useState('')
  const [timelineMood, setTimelineMood] = useState('')
  const [editingTimelineId, setEditingTimelineId] = useState(null)
  const [baseTimelineChapter, setBaseTimelineChapter] = useState('')
  const [baseTimelineDate, setBaseTimelineDate] = useState('')
  const [baseTimelineTitle, setBaseTimelineTitle] = useState('')
  const [baseTimelineSubtitle, setBaseTimelineSubtitle] = useState('')
  const [baseTimelineDescription, setBaseTimelineDescription] = useState('')
  const [baseTimelineQuote, setBaseTimelineQuote] = useState('')
  const [baseTimelineDetails, setBaseTimelineDetails] = useState('')
  const [baseTimelineMood, setBaseTimelineMood] = useState('')
  const [editingBaseTimelineId, setEditingBaseTimelineId] = useState(null)
  const [localBlackHoleGallery, setLocalBlackHoleGallery] = useState([])
  const [blackHoleGalleryOverrides, setBlackHoleGalleryOverrides] = useState({})
  const [hiddenBlackHoleGalleryIds, setHiddenBlackHoleGalleryIds] = useState([])
  const [blackHoleDate, setBlackHoleDate] = useState('')
  const [blackHoleTitle, setBlackHoleTitle] = useState('')
  const [blackHoleDescription, setBlackHoleDescription] = useState('')
  const [blackHoleImage, setBlackHoleImage] = useState('')
  const [blackHoleAlt, setBlackHoleAlt] = useState('')
  const [blackHoleTag, setBlackHoleTag] = useState('')
  const [blackHoleVideoUrl, setBlackHoleVideoUrl] = useState('')
  const [blackHoleImageStatus, setBlackHoleImageStatus] = useState('')
  const [editingBlackHoleId, setEditingBlackHoleId] = useState(null)
  const [baseBlackHoleDate, setBaseBlackHoleDate] = useState('')
  const [baseBlackHoleTitle, setBaseBlackHoleTitle] = useState('')
  const [baseBlackHoleDescription, setBaseBlackHoleDescription] = useState('')
  const [baseBlackHoleImage, setBaseBlackHoleImage] = useState('')
  const [baseBlackHoleAlt, setBaseBlackHoleAlt] = useState('')
  const [baseBlackHoleTag, setBaseBlackHoleTag] = useState('')
  const [baseBlackHoleVideoUrl, setBaseBlackHoleVideoUrl] = useState('')
  const [baseBlackHoleImageStatus, setBaseBlackHoleImageStatus] = useState('')
  const [editingBaseBlackHoleId, setEditingBaseBlackHoleId] = useState(null)
  // Form states
  const [title, setTitle] = useState('')
  const [preview, setPreview] = useState('')
  const [contentRaw, setContentRaw] = useState('')
  const [tag, setTag] = useState('')
  const [letterLocked, setLetterLocked] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [activeCrudModule, setActiveCrudModule] = useState('monthlyLetters')
  const [activeCrudAction, setActiveCrudAction] = useState('originals')
  const [activeCrudFilter, setActiveCrudFilter] = useState('all')
  const activeLetterType = activeCrudModule === 'openWhenLetters' ? 'openwhen' : 'monthly'

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

  const crudModules = [
    { id: 'monthlyLetters', label: 'Cartas mensuales' },
    { id: 'openWhenLetters', label: 'Abrir cuando' },
    { id: 'reasons', label: 'Razones' },
    { id: 'promises', label: 'Promesas' },
    { id: 'importantDates', label: 'Fechas importantes' },
    { id: 'futureDreams', label: 'Wishlist' },
    { id: 'timeline', label: 'Nuestra historia' },
    { id: 'blackHoleGallery', label: 'Agujero negro / Galería' },
    { id: 'playlist', label: 'Playlist' }
  ]
  const crudActions = [
    { id: 'originals', label: 'Ver / editar originales' },
    { id: 'local', label: 'Ver creados por ti' },
    { id: 'create', label: 'Crear nuevo' }
  ]
  useEffect(() => {
    setIsSimUnlocked(getSimulationUnlocked())

    setLocalMonthly(getLegacyMonthlyLetters())
    setLocalOpenWhen(getLegacyOpenWhenLetters())
    reasonsCrud.loadData()
    promisesCrud.loadData()
    setMonthlyOverrides(getLocalOverrides('monthlyLetters'))
    setHiddenMonthlyIds(getHiddenItemIds('monthlyLetters'))
    setOpenWhenOverrides(getLocalOverrides('openWhenLetters'))
    setHiddenOpenWhenIds(getHiddenItemIds('openWhenLetters'))
    importantDatesCrud.loadData()
    futureDreamsCrud.loadData()
    setLocalTimelinePages(getLocalItems('timeline'))
    setTimelineOverrides(getLocalOverrides('timeline'))
    setHiddenTimelineIds(getHiddenItemIds('timeline'))
    setLocalBlackHoleGallery(getLocalItems('blackHoleGallery'))
    setBlackHoleGalleryOverrides(getLocalOverrides('blackHoleGallery'))
    setHiddenBlackHoleGalleryIds(getHiddenItemIds('blackHoleGallery'))
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

  // Map open when cards to lock 'special day' card
  const mappedOpenWhen = openWhenData.map((card) => {
    if (card.mood === 'Abrir cuando sea un día especial') {
      return { ...card, locked: true }
    }
    return card
  })
  const visibleBaseOpenWhen = mappedOpenWhen.map((card) => {
    const override = openWhenOverrides[String(card.id)]
    return {
      ...card,
      ...(override || {}),
      id: card.id,
      isOverridden: Boolean(override),
      isHidden: hiddenOpenWhenIds.includes(String(card.id))
    }
  })
  const activeBaseOpenWhen = visibleBaseOpenWhen.filter((card) => !card.isHidden)
  const editedBaseOpenWhenCount = Object.keys(openWhenOverrides).length
  const hiddenBaseOpenWhenCount = hiddenOpenWhenIds.length

  const visibleBaseMonthly = monthlyLettersData.map((letter) => {
    const override = monthlyOverrides[String(letter.id)]
    return {
      ...letter,
      ...(override || {}),
      id: letter.id,
      isOverridden: Boolean(override),
      isHidden: hiddenMonthlyIds.includes(String(letter.id))
    }
  })
  const activeBaseMonthly = visibleBaseMonthly.filter((letter) => !letter.isHidden)
  const editedBaseMonthlyCount = Object.keys(monthlyOverrides).length
  const hiddenBaseMonthlyCount = hiddenMonthlyIds.length

  // Calculation for Monthly Letters stats (combining JSON + Local)
  const totalMonthly = activeBaseMonthly.length + localMonthly.length
  const openedMonthly = activeBaseMonthly.filter(
    (l) => isMonthlyLetterOpened(l.id)
  ).length + localMonthly.filter(
    (l) => isMonthlyLetterOpened(l.id)
  ).length
  const unlockedMonthly = activeBaseMonthly.filter((l) => !l.locked).length + localMonthly.filter((l) => !l.locked).length
  const lockedMonthly = activeBaseMonthly.length - activeBaseMonthly.filter((l) => !l.locked).length

  // Calculation for Open When Letters stats (combining JSON + Local)
  const totalOpenWhen = activeBaseOpenWhen.length + localOpenWhen.length
  const openedOpenWhen = activeBaseOpenWhen.filter(
    (c) => isOpenWhenLetterOpened(c.id)
  ).length + localOpenWhen.filter(
    (c) => isOpenWhenLetterOpened(c.id)
  ).length
  const unlockedOpenWhen = activeBaseOpenWhen.filter((c) => !c.locked).length + localOpenWhen.filter((c) => !c.locked).length
  const lockedOpenWhen = (totalOpenWhen - unlockedOpenWhen)
  const editedBaseTimelineCount = Object.keys(timelineOverrides).length
  const hiddenBaseTimelineCount = hiddenTimelineIds.length
  const visibleBaseTimelinePages = timelineData.map((page) => {
    const override = timelineOverrides[String(page.id)]
    return {
      ...page,
      ...(override || {}),
      id: page.id,
      details: Array.isArray(override?.details) ? override.details : Array.isArray(page.details) ? page.details : [],
      isOverridden: Boolean(override),
      isHidden: hiddenTimelineIds.includes(String(page.id))
    }
  })
  const editedBaseBlackHoleGalleryCount = Object.keys(blackHoleGalleryOverrides).length
  const hiddenBaseBlackHoleGalleryCount = hiddenBlackHoleGalleryIds.length
  const visibleBaseBlackHoleGallery = blackHoleGalleryData.map((item) => {
    const override = blackHoleGalleryOverrides[String(item.id)]
    return {
      ...item,
      ...(override || {}),
      id: item.id,
      isOverridden: Boolean(override),
      isHidden: hiddenBlackHoleGalleryIds.includes(String(item.id))
    }
  })
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

  const isPlainObject = (value) => {
    return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
  }

  const handleExportLocalLetters = () => {
    const exportData = {
      version: 2,
      exportedAt: new Date().toISOString(),
      source: 'Distancia Cero - Centro del Universo',
      content: {
        monthlyLetters: getLegacyMonthlyLetters(),
        openWhenLetters: getLegacyOpenWhenLetters(),
        reasons: getLocalItems('reasons'),
        promises: getLocalItems('promises'),
        importantDates: getLocalItems('importantDates'),
        futureDreams: getLocalItems('futureDreams'),
        timeline: getLocalItems('timeline'),
        blackHoleGallery: getLocalItems('blackHoleGallery'),
        playlist: getLocalItems('playlist')
      },
      overrides: {
        monthlyLetters: getLocalOverrides('monthlyLetters'),
        openWhenLetters: getLocalOverrides('openWhenLetters'),
        reasons: getLocalOverrides('reasons'),
        promises: getLocalOverrides('promises'),
        importantDates: getLocalOverrides('importantDates'),
        futureDreams: getLocalOverrides('futureDreams'),
        timeline: getLocalOverrides('timeline'),
        blackHoleGallery: getLocalOverrides('blackHoleGallery'),
        playlist: getLocalOverrides('playlist')
      },
      hidden: {
        monthlyLetters: getHiddenItemIds('monthlyLetters'),
        openWhenLetters: getHiddenItemIds('openWhenLetters'),
        reasons: getHiddenItemIds('reasons'),
        promises: getHiddenItemIds('promises'),
        importantDates: getHiddenItemIds('importantDates'),
        futureDreams: getHiddenItemIds('futureDreams'),
        timeline: getHiddenItemIds('timeline'),
        blackHoleGallery: getHiddenItemIds('blackHoleGallery'),
        playlist: getHiddenItemIds('playlist')
      }
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    })
    const downloadUrl = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = downloadUrl
    link.download = `distancia-cero-respaldo-local-${new Date().toISOString().slice(0, 10)}.json`
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(downloadUrl)
    setBackupStatus({ type: 'success', text: 'Respaldo v2 creado correctamente.' })
  }


  const handleImportLocalBackup = (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      try {
        const importedData = JSON.parse(reader.result)

        if (importedData?.version === 1) {
          if (!Array.isArray(importedData.monthlyLetters) || !Array.isArray(importedData.openWhenLetters)) {
            setBackupStatus({ type: 'error', text: 'El respaldo v1 no tiene cartas validas.' })
            return
          }

          const confirmed = window.confirm(
          'Esto reemplazará solo las cartas guardadas. No tocará, promesas, fechas, wishlist, diario, galería ni playlist. ¿Quieres continuar?'
          )

          if (!confirmed) {
            setBackupStatus({ type: 'error', text: 'Importación cancelada. No se cambiaron tus datos.' })
            return
          }

          saveLegacyMonthlyLetters(importedData.monthlyLetters)
          saveLegacyOpenWhenLetters(importedData.openWhenLetters)
          setLocalMonthly(importedData.monthlyLetters)
          setLocalOpenWhen(importedData.openWhenLetters)
          setEditingId(null)
          setTitle('')
          setPreview('')
          setContentRaw('')
          setTag('')
          setLetterLocked(false)
          dispatchLettersUpdate('monthlyLetters')
          dispatchLettersUpdate('openWhenLetters')
          setBackupStatus({ type: 'success', text: 'Respaldo v1 importado: solo cartas tuyas.' })
          return
        }

        const content = importedData?.content
        const overrides = importedData?.overrides
        const hidden = importedData?.hidden
        const hasPromisesBackup =
          Object.prototype.hasOwnProperty.call(content || {}, 'promises') ||
          Object.prototype.hasOwnProperty.call(overrides || {}, 'promises') ||
          Object.prototype.hasOwnProperty.call(hidden || {}, 'promises')
        const hasMonthlyBaseBackup =
          Object.prototype.hasOwnProperty.call(overrides || {}, 'monthlyLetters') ||
          Object.prototype.hasOwnProperty.call(hidden || {}, 'monthlyLetters')
        const hasOpenWhenBaseBackup =
          Object.prototype.hasOwnProperty.call(overrides || {}, 'openWhenLetters') ||
          Object.prototype.hasOwnProperty.call(hidden || {}, 'openWhenLetters')
        const hasImportantDatesBackup =
          Object.prototype.hasOwnProperty.call(content || {}, 'importantDates') ||
          Object.prototype.hasOwnProperty.call(overrides || {}, 'importantDates') ||
          Object.prototype.hasOwnProperty.call(hidden || {}, 'importantDates')
        const hasFutureDreamsBackup =
          Object.prototype.hasOwnProperty.call(content || {}, 'futureDreams') ||
          Object.prototype.hasOwnProperty.call(overrides || {}, 'futureDreams') ||
          Object.prototype.hasOwnProperty.call(hidden || {}, 'futureDreams')
        const hasTimelineBackup =
          Object.prototype.hasOwnProperty.call(content || {}, 'timeline') ||
          Object.prototype.hasOwnProperty.call(overrides || {}, 'timeline') ||
          Object.prototype.hasOwnProperty.call(hidden || {}, 'timeline')
        const hasBlackHoleGalleryBackup =
          Object.prototype.hasOwnProperty.call(content || {}, 'blackHoleGallery') ||
          Object.prototype.hasOwnProperty.call(overrides || {}, 'blackHoleGallery') ||
          Object.prototype.hasOwnProperty.call(hidden || {}, 'blackHoleGallery')
        const hasPlaylistBackup =
          Object.prototype.hasOwnProperty.call(content || {}, 'playlist') ||
          Object.prototype.hasOwnProperty.call(overrides || {}, 'playlist') ||
          Object.prototype.hasOwnProperty.call(hidden || {}, 'playlist')
        const isValidV2 =
          importedData?.version === 2 &&
          isPlainObject(content) &&
          Array.isArray(content.monthlyLetters) &&
          Array.isArray(content.openWhenLetters) &&
          Array.isArray(content.reasons) &&
          isPlainObject(overrides) &&
          isPlainObject(overrides.reasons) &&
          isPlainObject(hidden) &&
          (!hasMonthlyBaseBackup ||
            (isPlainObject(overrides.monthlyLetters) &&
              Array.isArray(hidden.monthlyLetters))) &&
          (!hasOpenWhenBaseBackup ||
            (isPlainObject(overrides.openWhenLetters) &&
              Array.isArray(hidden.openWhenLetters))) &&
          Array.isArray(hidden.reasons) &&
          (!hasImportantDatesBackup ||
            (Array.isArray(content.importantDates) &&
              isPlainObject(overrides.importantDates) &&
              Array.isArray(hidden.importantDates))) &&
          (!hasFutureDreamsBackup ||
            (Array.isArray(content.futureDreams) &&
              isPlainObject(overrides.futureDreams) &&
              Array.isArray(hidden.futureDreams))) &&
          (!hasTimelineBackup ||
            (Array.isArray(content.timeline) &&
              isPlainObject(overrides.timeline) &&
              Array.isArray(hidden.timeline))) &&
          (!hasBlackHoleGalleryBackup ||
            (Array.isArray(content.blackHoleGallery) &&
              isPlainObject(overrides.blackHoleGallery) &&
              Array.isArray(hidden.blackHoleGallery))) &&
          (!hasPlaylistBackup ||
            (Array.isArray(content.playlist) &&
              isPlainObject(overrides.playlist) &&
              Array.isArray(hidden.playlist))) &&
          (!hasPromisesBackup ||
            (Array.isArray(content.promises) &&
              isPlainObject(overrides.promises) &&
              Array.isArray(hidden.promises)))

        if (!isValidV2) {
          setBackupStatus({ type: 'error', text: 'El archivo no tiene un formato válido de respaldo v2.' })
          return
        }

        const confirmed = window.confirm(
          'Esto reemplazará el respaldo de cartas, Abrir cuando, razones, promesas, fechas, wishlist, diario, galería y playlist en este navegador. ¿Quieres continuar?'
        )

        if (!confirmed) {
          setBackupStatus({ type: 'error', text: 'Importación cancelada. No se cambiaron tus datos.' })
          return
        }

        saveLegacyMonthlyLetters(content.monthlyLetters)
        saveLegacyOpenWhenLetters(content.openWhenLetters)
        const savedReasons = saveLocalItems('reasons', content.reasons)
        const savedOverrides = saveLocalOverrides('reasons', overrides.reasons)
        const savedHiddenIds = saveHiddenItemIds('reasons', hidden.reasons)
        const savedMonthlyOverrides = hasMonthlyBaseBackup
          ? saveLocalOverrides('monthlyLetters', overrides.monthlyLetters)
          : getLocalOverrides('monthlyLetters')
        const savedHiddenMonthlyIds = hasMonthlyBaseBackup
          ? saveHiddenItemIds('monthlyLetters', hidden.monthlyLetters)
          : getHiddenItemIds('monthlyLetters')
        const savedOpenWhenOverrides = hasOpenWhenBaseBackup
          ? saveLocalOverrides('openWhenLetters', overrides.openWhenLetters)
          : getLocalOverrides('openWhenLetters')
        const savedHiddenOpenWhenIds = hasOpenWhenBaseBackup
          ? saveHiddenItemIds('openWhenLetters', hidden.openWhenLetters)
          : getHiddenItemIds('openWhenLetters')
        const savedImportantDates = hasImportantDatesBackup
          ? saveLocalItems('importantDates', content.importantDates)
          : getLocalItems('importantDates')
        const savedImportantDateOverrides = hasImportantDatesBackup
          ? saveLocalOverrides('importantDates', overrides.importantDates)
          : getLocalOverrides('importantDates')
        const savedHiddenImportantDateIds = hasImportantDatesBackup
          ? saveHiddenItemIds('importantDates', hidden.importantDates)
          : getHiddenItemIds('importantDates')
        const savedFutureDreams = hasFutureDreamsBackup
          ? saveLocalItems('futureDreams', content.futureDreams)
          : getLocalItems('futureDreams')
        const savedFutureDreamOverrides = hasFutureDreamsBackup
          ? saveLocalOverrides('futureDreams', overrides.futureDreams)
          : getLocalOverrides('futureDreams')
        const savedHiddenFutureDreamIds = hasFutureDreamsBackup
          ? saveHiddenItemIds('futureDreams', hidden.futureDreams)
          : getHiddenItemIds('futureDreams')
        const savedTimelinePages = hasTimelineBackup
          ? saveLocalItems('timeline', content.timeline)
          : getLocalItems('timeline')
        const savedTimelineOverrides = hasTimelineBackup
          ? saveLocalOverrides('timeline', overrides.timeline)
          : getLocalOverrides('timeline')
        const savedHiddenTimelineIds = hasTimelineBackup
          ? saveHiddenItemIds('timeline', hidden.timeline)
          : getHiddenItemIds('timeline')
        const savedBlackHoleGallery = hasBlackHoleGalleryBackup
          ? saveLocalItems('blackHoleGallery', content.blackHoleGallery)
          : getLocalItems('blackHoleGallery')
        const savedBlackHoleGalleryOverrides = hasBlackHoleGalleryBackup
          ? saveLocalOverrides('blackHoleGallery', overrides.blackHoleGallery)
          : getLocalOverrides('blackHoleGallery')
        const savedHiddenBlackHoleGalleryIds = hasBlackHoleGalleryBackup
          ? saveHiddenItemIds('blackHoleGallery', hidden.blackHoleGallery)
          : getHiddenItemIds('blackHoleGallery')
        const savedPlaylist = hasPlaylistBackup
          ? saveLocalItems('playlist', content.playlist)
          : getLocalItems('playlist')
        const savedPlaylistOverrides = hasPlaylistBackup
          ? saveLocalOverrides('playlist', overrides.playlist)
          : getLocalOverrides('playlist')
        const savedHiddenPlaylistIds = hasPlaylistBackup
          ? saveHiddenItemIds('playlist', hidden.playlist)
          : getHiddenItemIds('playlist')
        const savedPromises = hasPromisesBackup
          ? saveLocalItems('promises', content.promises)
          : getLocalItems('promises')
        const savedPromiseOverrides = hasPromisesBackup
          ? saveLocalOverrides('promises', overrides.promises)
          : getLocalOverrides('promises')
        const savedHiddenPromiseIds = hasPromisesBackup
          ? saveHiddenItemIds('promises', hidden.promises)
          : getHiddenItemIds('promises')

        setLocalMonthly(content.monthlyLetters)
        setLocalOpenWhen(content.openWhenLetters)
        reasonsCrud.setLocalItems(savedReasons)
        reasonsCrud.setOverrides(savedOverrides)
        reasonsCrud.setHiddenIds(savedHiddenIds)
        setMonthlyOverrides(savedMonthlyOverrides)
        setHiddenMonthlyIds(savedHiddenMonthlyIds)
        setOpenWhenOverrides(savedOpenWhenOverrides)
        setHiddenOpenWhenIds(savedHiddenOpenWhenIds)
        importantDatesCrud.setLocalItems(savedImportantDates)
        importantDatesCrud.setOverrides(savedImportantDateOverrides)
        importantDatesCrud.setHiddenIds(savedHiddenImportantDateIds)
        futureDreamsCrud.setLocalItems(savedFutureDreams)
        futureDreamsCrud.setOverrides(savedFutureDreamOverrides)
        futureDreamsCrud.setHiddenIds(savedHiddenFutureDreamIds)
        setLocalTimelinePages(savedTimelinePages)
        setTimelineOverrides(savedTimelineOverrides)
        setHiddenTimelineIds(savedHiddenTimelineIds)
        setLocalBlackHoleGallery(savedBlackHoleGallery)
        setBlackHoleGalleryOverrides(savedBlackHoleGalleryOverrides)
        setHiddenBlackHoleGalleryIds(savedHiddenBlackHoleGalleryIds)
        playlistCrud.setLocalItems(savedPlaylist)
        playlistCrud.setOverrides(savedPlaylistOverrides)
        playlistCrud.setHiddenIds(savedHiddenPlaylistIds)
        promisesCrud.setLocalItems(savedPromises)
        promisesCrud.setOverrides(savedPromiseOverrides)
        promisesCrud.setHiddenIds(savedHiddenPromiseIds)
        setEditingId(null)
        setTitle('')
        setPreview('')
        setContentRaw('')
        setTag('')
        setLetterLocked(false)
        reasonsCrud.resetForm()
        reasonsCrud.resetBaseForm()
        resetBaseMonthlyForm()
        resetBaseOpenWhenForm()
        importantDatesCrud.resetForm()
        importantDatesCrud.resetBaseForm()
        futureDreamsCrud.resetForm()
        futureDreamsCrud.resetBaseForm()
        resetTimelineForm()
        resetBaseTimelineForm()
        resetBlackHoleForm()
        resetBaseBlackHoleForm()
        playlistCrud.resetForm()
        playlistCrud.resetBaseForm()
        dispatchContentUpdate('all')
        dispatchContentUpdate('reasons')
        if (hasPromisesBackup) {
          dispatchContentUpdate('promises')
        }
        if (hasImportantDatesBackup) {
          dispatchContentUpdate('importantDates')
        }
        if (hasFutureDreamsBackup) {
          dispatchContentUpdate('futureDreams')
        }
        if (hasTimelineBackup) {
          dispatchContentUpdate('timeline')
        }
        if (hasBlackHoleGalleryBackup) {
          dispatchContentUpdate('blackHoleGallery')
        }
        if (hasPlaylistBackup) {
          dispatchContentUpdate('playlist')
        }
        dispatchLettersUpdate('monthlyLetters')
        dispatchLettersUpdate('openWhenLetters')
        setBackupStatus({ type: 'success', text: 'Respaldo v2 importado correctamente.' })
      } catch (error) {
        setBackupStatus({ type: 'error', text: 'No se pudo leer el JSON seleccionado.' })
      } finally {
        event.target.value = ''
      }
    }

    reader.onerror = () => {
      setBackupStatus({ type: 'error', text: 'No se pudo abrir el archivo seleccionado.' })
      event.target.value = ''
    }

    reader.readAsText(file)
  }

  const dispatchContentUpdate = (collection) => {
    window.dispatchEvent(
      new CustomEvent('distancia-cero-content-updated', {
        detail: { collection }
      })
    )
  }

  const dispatchLettersUpdate = (collection) => {
    dispatchContentUpdate(collection)
    dispatchContentUpdate('letters')
  }

  const showCrudNotice = (message, type = 'success') => {
    setCrudNotice({
      message,
      type,
      timestamp: Date.now()
    })
  }









  const resetBaseMonthlyForm = () => {
    setBaseMonthlyMonth('')
    setBaseMonthlyTitle('')
    setBaseMonthlyPreview('')
    setBaseMonthlyContent('')
    setBaseMonthlyLocked(false)
    setEditingBaseMonthlyId(null)
  }

  const resetBaseOpenWhenForm = () => {
    setBaseOpenWhenMood('')
    setBaseOpenWhenTitle('')
    setBaseOpenWhenPreview('')
    setBaseOpenWhenContent('')
    setBaseOpenWhenLocked(false)
    setEditingBaseOpenWhenId(null)
  }









  const detailsToText = (details) => {
    return Array.isArray(details) ? details.join('\n') : ''
  }

  const textToDetails = (detailsText) => {
    return detailsText
      .split('\n')
      .map((detail) => detail.trim())
      .filter((detail) => detail.length > 0)
  }

  const timelineMonthNames = [
    'enero',
    'febrero',
    'marzo',
    'abril',
    'mayo',
    'junio',
    'julio',
    'agosto',
    'septiembre',
    'octubre',
    'noviembre',
    'diciembre'
  ]

  const timelineMonthIndexes = {
    enero: 0,
    febrero: 1,
    marzo: 2,
    abril: 3,
    mayo: 4,
    junio: 5,
    julio: 6,
    agosto: 7,
    septiembre: 8,
    setiembre: 8,
    octubre: 9,
    noviembre: 10,
    diciembre: 11
  }

  const formatTimelineDateForDisplay = (dateValue) => {
    const match = String(dateValue || '').match(/^(\d{4})-(\d{2})-(\d{2})$/)
    if (!match) return String(dateValue || '').trim()

    const day = Number(match[3])
    const monthName = timelineMonthNames[Number(match[2]) - 1]
    return monthName ? `${day} de ${monthName} de ${match[1]}` : String(dateValue || '').trim()
  }

  const parseTimelineDateForInput = (dateValue) => {
    const rawValue = String(dateValue || '').trim()
    if (/^\d{4}-\d{2}-\d{2}$/.test(rawValue)) return rawValue

    const match = rawValue.toLowerCase().match(/(\d{1,2})\s+de\s+([a-záéíóúñ]+)(?:\s+de\s+(\d{4}))?/)
    if (!match) return ''

    const normalizedMonth = match[2].normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    const monthIndex = timelineMonthIndexes[normalizedMonth]
    if (monthIndex === undefined) return ''

    if (!match[3]) return ''

    const year = Number(match[3])
    const month = String(monthIndex + 1).padStart(2, '0')
    const day = String(Number(match[1])).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const normalizeTimelineDateForStorage = (dateValue) => {
    const rawValue = String(dateValue || '').trim()
    if (/^\d{4}-\d{2}-\d{2}$/.test(rawValue)) return rawValue
    return parseTimelineDateForInput(rawValue) || rawValue
  }

  const parseImportantDateForInput = (dateValue) => {
    const rawValue = String(dateValue || '').trim()
    if (/^\d{4}-\d{2}-\d{2}$/.test(rawValue)) return rawValue
    return parseTimelineDateForInput(rawValue)
  }

  const normalizeImportantDateForStorage = (dateValue) => {
    const rawValue = String(dateValue || '').trim()
    if (/^\d{4}-\d{2}-\d{2}$/.test(rawValue)) return rawValue
    return parseImportantDateForInput(rawValue)
  }

  const buildLegacyLetterCreateItem = (item) => ({
    ...item,
    ...buildCreateMetadata()
  })

  const buildLegacyLetterUpdateItem = (item, patch) => {
    const updateMetadata = buildUpdateMetadata()

    return {
      ...item,
      ...patch,
      createdBy: item.createdBy || updateMetadata.updatedBy,
      createdAt: item.createdAt || updateMetadata.updatedAt,
      updatedBy: updateMetadata.updatedBy,
      updatedAt: updateMetadata.updatedAt,
      source: item.source || updateMetadata.source,
      spaceId: item.spaceId || updateMetadata.spaceId
    }
  }

  const resetTimelineForm = () => {
    setTimelineChapter('')
    setTimelineDate('')
    setTimelineTitle('')
    setTimelineSubtitle('')
    setTimelineDescription('')
    setTimelineQuote('')
    setTimelineDetails('')
    setTimelineMood('')
    setEditingTimelineId(null)
  }

  const resetBaseTimelineForm = () => {
    setBaseTimelineChapter('')
    setBaseTimelineDate('')
    setBaseTimelineTitle('')
    setBaseTimelineSubtitle('')
    setBaseTimelineDescription('')
    setBaseTimelineQuote('')
    setBaseTimelineDetails('')
    setBaseTimelineMood('')
    setEditingBaseTimelineId(null)
  }

  const resetBlackHoleForm = () => {
    setBlackHoleDate('')
    setBlackHoleTitle('')
    setBlackHoleDescription('')
    setBlackHoleImage('')
    setBlackHoleAlt('')
    setBlackHoleTag('')
    setBlackHoleVideoUrl('')
    setBlackHoleImageStatus('')
    setEditingBlackHoleId(null)
  }

  const resetBaseBlackHoleForm = () => {
    setBaseBlackHoleDate('')
    setBaseBlackHoleTitle('')
    setBaseBlackHoleDescription('')
    setBaseBlackHoleImage('')
    setBaseBlackHoleAlt('')
    setBaseBlackHoleTag('')
    setBaseBlackHoleVideoUrl('')
    setBaseBlackHoleImageStatus('')
    setEditingBaseBlackHoleId(null)
  }





  const handleBlackHoleImageFile = (event, target = 'local') => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    if (!file.type.startsWith('image/')) {
      const message = 'Selecciona un archivo de imagen válido.'
      target === 'base' ? setBaseBlackHoleImageStatus(message) : setBlackHoleImageStatus(message)
      return
    }

    if (file.size > 2 * 1024 * 1024) {
      const message = 'La imagen supera 2 MB. Elige una imagen mas ligera.'
      target === 'base' ? setBaseBlackHoleImageStatus(message) : setBlackHoleImageStatus(message)
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : ''
      if (target === 'base') {
        setBaseBlackHoleImage(result)
        setBaseBlackHoleImageStatus('Imagen guardada como respaldo.')
      } else {
        setBlackHoleImage(result)
        setBlackHoleImageStatus('Imagen guardada como respaldo.')
      }
    }
    reader.onerror = () => {
      const message = 'No se pudo leer la imagen seleccionada.'
      target === 'base' ? setBaseBlackHoleImageStatus(message) : setBlackHoleImageStatus(message)
    }
    reader.readAsDataURL(file)
  }

  const clearBlackHoleImage = (target = 'local') => {
    if (target === 'base') {
      setBaseBlackHoleImage('')
      setBaseBlackHoleImageStatus('')
      const fileInput = document.getElementById('baseBlackHoleImageFile')
      if (fileInput) fileInput.value = ''
      return
    }

    setBlackHoleImage('')
    setBlackHoleImageStatus('')
    const fileInput = document.getElementById('blackHoleImageFile')
    if (fileInput) fileInput.value = ''
  }

































  const handleBaseMonthlyEdit = (letter) => {
    setEditingBaseMonthlyId(letter.id)
    setBaseMonthlyMonth(letter.month || '')
    setBaseMonthlyTitle(letter.title || '')
    setBaseMonthlyPreview(letter.preview || '')
    setBaseMonthlyContent(Array.isArray(letter.content) ? letter.content.join('\n') : '')
    setBaseMonthlyLocked(Boolean(letter.locked))
  }

  const handleBaseMonthlySubmit = (event) => {
    event.preventDefault()

    if (!editingBaseMonthlyId || !baseMonthlyMonth.trim() || !baseMonthlyTitle.trim() || !baseMonthlyPreview.trim()) {
      alert('Selecciona una carta mensual base y completa mes, titulo y preview.')
      return
    }

    const contentArray = baseMonthlyContent
      .split('\n')
      .map((paragraph) => paragraph.trim())
      .filter((paragraph) => paragraph.length > 0)

    if (contentArray.length === 0) {
      alert('Agrega al menos un parrafo para la carta.')
      return
    }

    const updatedOverrides = setLocalOverride('monthlyLetters', editingBaseMonthlyId, {
      month: baseMonthlyMonth.trim(),
      title: baseMonthlyTitle.trim(),
      preview: baseMonthlyPreview.trim(),
      content: contentArray,
      locked: baseMonthlyLocked,
      updatedAt: new Date().toISOString()
    })

    setMonthlyOverrides(updatedOverrides)
    resetBaseMonthlyForm()
    dispatchLettersUpdate('monthlyLetters')
    showCrudNotice('Se editó una carta mensual correctamente.')
  }

  const handleBaseMonthlyRestore = (letterId) => {
    const updatedOverrides = deleteLocalOverride('monthlyLetters', letterId)
    setMonthlyOverrides(updatedOverrides)

    if (String(editingBaseMonthlyId) === String(letterId)) {
      resetBaseMonthlyForm()
    }

    dispatchLettersUpdate('monthlyLetters')
    showCrudNotice('Se restauró una carta mensual correctamente.')
  }

  const handleBaseMonthlyHide = (letter) => {
    if (window.confirm('¿Seguro que quieres ocultar esta carta mensual base? Podrás restaurarla después.')) {
      const updatedHiddenIds = hideDefaultItem('monthlyLetters', letter.id)
      setHiddenMonthlyIds(updatedHiddenIds)

      if (String(editingBaseMonthlyId) === String(letter.id)) {
        resetBaseMonthlyForm()
      }

      dispatchLettersUpdate('monthlyLetters')
      showCrudNotice('Se ocultó una carta mensual correctamente.')
    }
  }

  const handleBaseMonthlyUnhide = (letterId) => {
    const updatedHiddenIds = restoreHiddenItem('monthlyLetters', letterId)
    setHiddenMonthlyIds(updatedHiddenIds)
    dispatchLettersUpdate('monthlyLetters')
    showCrudNotice('Se restauró una carta mensual correctamente.')
  }

  const handleBaseOpenWhenEdit = (card) => {
    setEditingBaseOpenWhenId(card.id)
    setBaseOpenWhenMood(card.mood || '')
    setBaseOpenWhenTitle(card.title || '')
    setBaseOpenWhenPreview(card.preview || '')
    setBaseOpenWhenContent(Array.isArray(card.content) ? card.content.join('\n') : '')
    setBaseOpenWhenLocked(Boolean(card.locked))
  }

  const handleBaseOpenWhenSubmit = (event) => {
    event.preventDefault()

    if (!editingBaseOpenWhenId || !baseOpenWhenMood.trim() || !baseOpenWhenTitle.trim() || !baseOpenWhenPreview.trim()) {
      alert('Selecciona una carta Abrir cuando base y completa motivo, titulo y preview.')
      return
    }

    const contentArray = baseOpenWhenContent
      .split('\n')
      .map((paragraph) => paragraph.trim())
      .filter((paragraph) => paragraph.length > 0)

    if (contentArray.length === 0) {
      alert('Agrega al menos un parrafo para la carta.')
      return
    }

    const updatedOverrides = setLocalOverride('openWhenLetters', editingBaseOpenWhenId, {
      mood: baseOpenWhenMood.trim(),
      title: baseOpenWhenTitle.trim(),
      preview: baseOpenWhenPreview.trim(),
      content: contentArray,
      locked: baseOpenWhenLocked,
      updatedAt: new Date().toISOString()
    })

    setOpenWhenOverrides(updatedOverrides)
    resetBaseOpenWhenForm()
    dispatchLettersUpdate('openWhenLetters')
    showCrudNotice('Se editó una carta Abrir cuando correctamente.')
  }

  const handleBaseOpenWhenRestore = (cardId) => {
    const updatedOverrides = deleteLocalOverride('openWhenLetters', cardId)
    setOpenWhenOverrides(updatedOverrides)

    if (String(editingBaseOpenWhenId) === String(cardId)) {
      resetBaseOpenWhenForm()
    }

    dispatchLettersUpdate('openWhenLetters')
    showCrudNotice('Se restauró una carta Abrir cuando correctamente.')
  }

  const handleBaseOpenWhenHide = (card) => {
    if (window.confirm('¿Seguro que quieres ocultar esta carta Abrir cuando base? Podrás restaurarla después.')) {
      const updatedHiddenIds = hideDefaultItem('openWhenLetters', card.id)
      setHiddenOpenWhenIds(updatedHiddenIds)

      if (String(editingBaseOpenWhenId) === String(card.id)) {
        resetBaseOpenWhenForm()
      }

      dispatchLettersUpdate('openWhenLetters')
      showCrudNotice('Se ocultó una carta Abrir cuando correctamente.')
    }
  }

  const handleBaseOpenWhenUnhide = (cardId) => {
    const updatedHiddenIds = restoreHiddenItem('openWhenLetters', cardId)
    setHiddenOpenWhenIds(updatedHiddenIds)
    dispatchLettersUpdate('openWhenLetters')
    showCrudNotice('Se restauró una carta Abrir cuando correctamente.')
  }

































  const buildTimelinePatch = ({
    chapter,
    date,
    title,
    subtitle,
    description,
    quote,
    details,
    mood
  }) => ({
    chapter: chapter.trim(),
    date: normalizeTimelineDateForStorage(date),
    title: title.trim(),
    subtitle: subtitle.trim(),
    description: description.trim(),
    quote: quote.trim(),
    details: textToDetails(details),
    mood: mood.trim(),
    updatedAt: new Date().toISOString()
  })

  const handleTimelineSubmit = (event) => {
    event.preventDefault()

    if (!timelineChapter.trim() || !timelineDate.trim() || !timelineTitle.trim() || !timelineDescription.trim()) {
      alert('Por favor, completa capitulo, fecha, titulo y descripcion.')
      return
    }

    const patch = buildTimelinePatch({
      chapter: timelineChapter,
      date: timelineDate,
      title: timelineTitle,
      subtitle: timelineSubtitle,
      description: timelineDescription,
      quote: timelineQuote,
      details: timelineDetails,
      mood: timelineMood
    })

    const updatedPages = editingTimelineId
      ? updateLocalItem('timeline', editingTimelineId, patch)
      : addLocalItem('timeline', {
          id: `local-timeline-${Date.now()}`,
          ...patch,
          createdAt: new Date().toISOString()
        })

    setLocalTimelinePages(updatedPages)
    resetTimelineForm()
    dispatchContentUpdate('timeline')
    showCrudNotice(editingTimelineId ? 'Se editó una página del diario correctamente.' : 'Se agregó una página del diario correctamente.')
  }

  const handleTimelineEdit = (page) => {
    if (!page.isLocal) return
    setActiveCrudAction('create')
    setEditingTimelineId(page.id)
    setTimelineChapter(page.chapter || '')
    setTimelineDate(parseTimelineDateForInput(page.date))
    setTimelineTitle(page.title || '')
    setTimelineSubtitle(page.subtitle || '')
    setTimelineDescription(page.description || '')
    setTimelineQuote(page.quote || '')
    setTimelineDetails(detailsToText(page.details))
    setTimelineMood(page.mood || '')
  }

  const handleTimelineDelete = (page) => {
    if (!page.isLocal) return

    if (window.confirm('¿Seguro que quieres eliminar esta página local del diario?')) {
      const updatedPages = deleteLocalItem('timeline', page.id)
      setLocalTimelinePages(updatedPages)

      if (editingTimelineId === page.id) {
        resetTimelineForm()
      }

      dispatchContentUpdate('timeline')
      showCrudNotice('Se eliminó una página del diario correctamente.')
    }
  }

  const handleBaseTimelineEdit = (page) => {
    setEditingBaseTimelineId(page.id)
    setBaseTimelineChapter(page.chapter || '')
    setBaseTimelineDate(parseTimelineDateForInput(page.date))
    setBaseTimelineTitle(page.title || '')
    setBaseTimelineSubtitle(page.subtitle || '')
    setBaseTimelineDescription(page.description || '')
    setBaseTimelineQuote(page.quote || '')
    setBaseTimelineDetails(detailsToText(page.details))
    setBaseTimelineMood(page.mood || '')
  }

  const handleBaseTimelineSubmit = (event) => {
    event.preventDefault()

    if (!editingBaseTimelineId || !baseTimelineChapter.trim() || !baseTimelineDate.trim() || !baseTimelineTitle.trim() || !baseTimelineDescription.trim()) {
      alert('Selecciona una página base y completa capitulo, fecha, titulo y descripcion.')
      return
    }

    const updatedOverrides = setLocalOverride('timeline', editingBaseTimelineId, buildTimelinePatch({
      chapter: baseTimelineChapter,
      date: baseTimelineDate,
      title: baseTimelineTitle,
      subtitle: baseTimelineSubtitle,
      description: baseTimelineDescription,
      quote: baseTimelineQuote,
      details: baseTimelineDetails,
      mood: baseTimelineMood
    }))

    setTimelineOverrides(updatedOverrides)
    resetBaseTimelineForm()
    dispatchContentUpdate('timeline')
    showCrudNotice('Se editó una página del diario correctamente.')
  }

  const handleBaseTimelineRestore = (pageId) => {
    const updatedOverrides = deleteLocalOverride('timeline', pageId)
    setTimelineOverrides(updatedOverrides)

    if (String(editingBaseTimelineId) === String(pageId)) {
      resetBaseTimelineForm()
    }

    dispatchContentUpdate('timeline')
    showCrudNotice('Se restauró una página del diario correctamente.')
  }

  const handleBaseTimelineHide = (page) => {
    if (window.confirm('¿Seguro que quieres ocultar esta página base del diario? Podrás restaurarla después.')) {
      const updatedHiddenIds = hideDefaultItem('timeline', page.id)
      setHiddenTimelineIds(updatedHiddenIds)

      if (String(editingBaseTimelineId) === String(page.id)) {
        resetBaseTimelineForm()
      }

      dispatchContentUpdate('timeline')
      showCrudNotice('Se ocultó una página del diario correctamente.')
    }
  }

  const handleBaseTimelineUnhide = (pageId) => {
    const updatedHiddenIds = restoreHiddenItem('timeline', pageId)
    setHiddenTimelineIds(updatedHiddenIds)
    dispatchContentUpdate('timeline')
    showCrudNotice('Se restauró una página del diario correctamente.')
  }

  const buildBlackHolePatch = ({
    date,
    title,
    description,
    image,
    alt,
    tag,
    videoUrl
  }) => ({
    date: date.trim(),
    title: title.trim(),
    description: description.trim(),
    image: image.trim(),
    alt: alt.trim(),
    tag: tag.trim(),
    videoUrl: videoUrl.trim(),
    updatedAt: new Date().toISOString()
  })

  const handleBlackHoleSubmit = (event) => {
    event.preventDefault()

    if (!blackHoleDate.trim() || !blackHoleTitle.trim() || !blackHoleDescription.trim()) {
      alert('Por favor, completa fecha, titulo y descripcion del recuerdo.')
      return
    }

    const patch = buildBlackHolePatch({
      date: blackHoleDate,
      title: blackHoleTitle,
      description: blackHoleDescription,
      image: blackHoleImage,
      alt: blackHoleAlt,
      tag: blackHoleTag,
      videoUrl: blackHoleVideoUrl
    })

    const updatedItems = editingBlackHoleId
      ? updateLocalItem('blackHoleGallery', editingBlackHoleId, patch)
      : addLocalItem('blackHoleGallery', {
          id: `local-blackhole-${Date.now()}`,
          ...patch,
          createdAt: new Date().toISOString()
        })

    setLocalBlackHoleGallery(updatedItems)
    resetBlackHoleForm()
    dispatchContentUpdate('blackHoleGallery')
    showCrudNotice(editingBlackHoleId ? 'Se editó un recuerdo correctamente.' : 'Se agregó un recuerdo correctamente.')
  }

  const handleBlackHoleEdit = (item) => {
    if (!item.isLocal) return
    setActiveCrudAction('create')
    setEditingBlackHoleId(item.id)
    setBlackHoleDate(item.date || '')
    setBlackHoleTitle(item.title || '')
    setBlackHoleDescription(item.description || item.caption || '')
    setBlackHoleImage(item.image || '')
    setBlackHoleAlt(item.alt || '')
    setBlackHoleTag(item.tag || '')
    setBlackHoleVideoUrl(item.videoUrl || '')
    setBlackHoleImageStatus('')
  }

  const handleBlackHoleDelete = (item) => {
    if (!item.isLocal) return

    if (window.confirm('¿Seguro que quieres eliminar este recuerdo tuyo?')) {
      const updatedItems = deleteLocalItem('blackHoleGallery', item.id)
      setLocalBlackHoleGallery(updatedItems)

      if (editingBlackHoleId === item.id) {
        resetBlackHoleForm()
      }

      dispatchContentUpdate('blackHoleGallery')
      showCrudNotice('Se eliminó un recuerdo correctamente.')
    }
  }

  const handleBaseBlackHoleEdit = (item) => {
    setEditingBaseBlackHoleId(item.id)
    setBaseBlackHoleDate(item.date || '')
    setBaseBlackHoleTitle(item.title || '')
    setBaseBlackHoleDescription(item.description || item.caption || '')
    setBaseBlackHoleImage(item.image || '')
    setBaseBlackHoleAlt(item.alt || '')
    setBaseBlackHoleTag(item.tag || '')
    setBaseBlackHoleVideoUrl(item.videoUrl || '')
    setBaseBlackHoleImageStatus('')
  }

  const handleBaseBlackHoleSubmit = (event) => {
    event.preventDefault()

    if (!editingBaseBlackHoleId || !baseBlackHoleDate.trim() || !baseBlackHoleTitle.trim() || !baseBlackHoleDescription.trim()) {
      alert('Selecciona un recuerdo base y completa fecha, titulo y descripcion.')
      return
    }

    const updatedOverrides = setLocalOverride('blackHoleGallery', editingBaseBlackHoleId, buildBlackHolePatch({
      date: baseBlackHoleDate,
      title: baseBlackHoleTitle,
      description: baseBlackHoleDescription,
      image: baseBlackHoleImage,
      alt: baseBlackHoleAlt,
      tag: baseBlackHoleTag,
      videoUrl: baseBlackHoleVideoUrl
    }))

    setBlackHoleGalleryOverrides(updatedOverrides)
    resetBaseBlackHoleForm()
    dispatchContentUpdate('blackHoleGallery')
    showCrudNotice('Se editó un recuerdo correctamente.')
  }

  const handleBaseBlackHoleRestore = (itemId) => {
    const updatedOverrides = deleteLocalOverride('blackHoleGallery', itemId)
    setBlackHoleGalleryOverrides(updatedOverrides)

    if (String(editingBaseBlackHoleId) === String(itemId)) {
      resetBaseBlackHoleForm()
    }

    dispatchContentUpdate('blackHoleGallery')
    showCrudNotice('Se restauró un recuerdo correctamente.')
  }

  const handleBaseBlackHoleHide = (item) => {
    if (window.confirm('¿Seguro que quieres ocultar este recuerdo base? Podrás restaurarlo después.')) {
      const updatedHiddenIds = hideDefaultItem('blackHoleGallery', item.id)
      setHiddenBlackHoleGalleryIds(updatedHiddenIds)

      if (String(editingBaseBlackHoleId) === String(item.id)) {
        resetBaseBlackHoleForm()
      }

      dispatchContentUpdate('blackHoleGallery')
      showCrudNotice('Se ocultó un recuerdo correctamente.')
    }
  }

  const handleBaseBlackHoleUnhide = (itemId) => {
    const updatedHiddenIds = restoreHiddenItem('blackHoleGallery', itemId)
    setHiddenBlackHoleGalleryIds(updatedHiddenIds)
    dispatchContentUpdate('blackHoleGallery')
    showCrudNotice('Se restauró un recuerdo correctamente.')
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
        setMonthlyLetterOpened(l.id, false)
      })
      mappedOpenWhen.forEach((c) => {
        setOpenWhenLetterOpened(c.id, false)
      })
      // Clear progress keys for Local letters
      localMonthly.forEach((l) => {
        setMonthlyLetterOpened(l.id, false)
      })
      localOpenWhen.forEach((c) => {
        setOpenWhenLetterOpened(c.id, false)
      })
      setSimulationUnlocked(false)
      window.location.reload()
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!title.trim() || !preview.trim() || !contentRaw.trim()) {
      alert('Por favor, completa todos los campos obligatorios.')
      return
    }

    const contentArray = contentRaw
      .split('\n')
      .map((p) => p.trim())
      .filter((p) => p.length > 0)

    const isMonthly = activeCrudModule === 'monthlyLetters'
    const currentList = isMonthly ? localMonthly : localOpenWhen
    const wasEditing = Boolean(editingId)

    let updatedList
    if (editingId) {
      // Edit mode
      updatedList = currentList.map((item) => {
        if (item.id === editingId) {
          return buildLegacyLetterUpdateItem(item, {
            title: title.trim(),
            preview: preview.trim(),
            content: contentArray,
            locked: letterLocked,
            month: isMonthly ? (tag.trim() || 'Carta') : undefined,
            mood: !isMonthly ? (tag.trim() || 'Abrir cuando...') : undefined
          })
        }
        return item
      })
      setEditingId(null)
    } else {
      // Create mode
      const localLetterTimestamp = Date.now()
      const localLetterId = `local-${localLetterTimestamp}`
      const newItem = buildLegacyLetterCreateItem({
        id: localLetterId,
        title: title.trim(),
        preview: preview.trim(),
        content: contentArray,
        locked: letterLocked,
        isLocal: true,
        month: isMonthly ? (tag.trim() || 'Carta') : undefined,
        mood: !isMonthly ? (tag.trim() || 'Abrir cuando...') : undefined,
        url: isMonthly ? `/local-letter/${localLetterTimestamp}` : `/local-open-when/${localLetterTimestamp}`
      })
      updatedList = [...currentList, newItem]
    }

    if (isMonthly) {
      saveLegacyMonthlyLetters(updatedList)
      setLocalMonthly(updatedList)
      dispatchLettersUpdate('monthlyLetters')
    } else {
      saveLegacyOpenWhenLetters(updatedList)
      setLocalOpenWhen(updatedList)
      dispatchLettersUpdate('openWhenLetters')
    }
    showCrudNotice(
      wasEditing
        ? (isMonthly ? 'Se editó una carta mensual correctamente.' : 'Se editó una carta Abrir cuando correctamente.')
        : (isMonthly ? 'Se agregó una carta mensual correctamente.' : 'Se agregó una carta Abrir cuando correctamente.')
    )

    // Reset Form
    setTitle('')
    setPreview('')
    setContentRaw('')
    setTag('')
    setLetterLocked(false)
  }

  const handleEdit = (item, type) => {
    setActiveCrudAction('create')
    setEditingId(item.id)
    setTitle(item.title)
    setPreview(item.preview)
    setContentRaw(item.content ? item.content.join('\n') : '')
    setTag(type === 'monthly' ? (item.month || '') : (item.mood || ''))
    setLetterLocked(Boolean(item.locked))

    const formElement = document.getElementById('local-editor-form')
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const handleDelete = (id, type) => {
    if (window.confirm('¿Seguro que quieres eliminar esta carta tuya?')) {
      const isMonthly = type === 'monthly'
      const currentList = isMonthly ? localMonthly : localOpenWhen
      const updatedList = currentList.filter((item) => item.id !== id)

      if (isMonthly) {
        saveLegacyMonthlyLetters(updatedList)
        setLocalMonthly(updatedList)
        dispatchLettersUpdate('monthlyLetters')
      } else {
        saveLegacyOpenWhenLetters(updatedList)
        setLocalOpenWhen(updatedList)
        dispatchLettersUpdate('openWhenLetters')
      }
      showCrudNotice(isMonthly ? 'Se eliminó una carta mensual correctamente.' : 'Se eliminó una carta Abrir cuando correctamente.')

      // If we were editing this item, reset form
      if (editingId === id) {
        setEditingId(null)
        setTitle('')
        setPreview('')
        setContentRaw('')
        setTag('')
        setLetterLocked(false)
      }
    }
  }

  const resetCrudEditingState = (nextModule = activeCrudModule) => {
    setEditingId(null)
    setTitle('')
    setPreview('')
    setContentRaw('')
    setTag('')
    setLetterLocked(false)
    reasonsCrud.resetForm()
    reasonsCrud.resetBaseForm()
    promisesCrud.resetForm()
    promisesCrud.resetBaseForm()
    resetBaseMonthlyForm()
    resetBaseOpenWhenForm()
    importantDatesCrud.resetForm()
    importantDatesCrud.resetBaseForm()
    futureDreamsCrud.resetForm()
    futureDreamsCrud.resetBaseForm()
    resetTimelineForm()
    resetBaseTimelineForm()
    resetBlackHoleForm()
    resetBaseBlackHoleForm()
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
    if (actionId === 'create') {
      setActiveCrudFilter('all')
    } else if (actionId === 'local') {
      setActiveCrudFilter('local')
    } else if (activeCrudFilter === 'local') {
      setActiveCrudFilter('all')
    }
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

      {isSimUnlocked && (
        <div className="simulation-active-banner">
          <ShieldAlert size={18} />
          <span>
            <strong>Modo de pruebas activo</strong>: Se simula que todas las cartas están desbloqueadas.
          </span>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="control-grid">
        <div className="control-card">
          <h3>Cartas Mensuales</h3>
          <div className="control-stats">
            <div className="stat-item">
              <span className="stat-label">Total (Base + Tuyas)</span>
              <span className="stat-value">{totalMonthly}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label flex-label">
                <BookOpen size={14} className="icon-available" /> Desbloqueadas
              </span>
              <span className="stat-value">{unlockedMonthly}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label flex-label">
                <Lock size={14} className="icon-locked" /> Bloqueadas
              </span>
              <span className="stat-value">{lockedMonthly}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label flex-label">
                <Check size={14} className="icon-opened" /> Abiertas / Leídas
              </span>
              <span className="stat-value text-pink">{openedMonthly}</span>
            </div>
          </div>
        </div>

        <div className="control-card">
          <h3>Cartas Abrir Cuando</h3>
          <div className="control-stats">
            <div className="stat-item">
              <span className="stat-label">Total (Base + Tuyas)</span>
              <span className="stat-value">{totalOpenWhen}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label flex-label">
                <BookOpen size={14} className="icon-available" /> Desbloqueadas
              </span>
              <span className="stat-value">{unlockedOpenWhen}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label flex-label">
                <Lock size={14} className="icon-locked" /> Bloqueadas
              </span>
              <span className="stat-value">{lockedOpenWhen}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label flex-label">
                <Check size={14} className="icon-opened" /> Abiertas / Leídas
              </span>
              <span className="stat-value text-pink">{openedOpenWhen}</span>
            </div>
          </div>
        </div>
      </div>

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

      {/* Local letters backup */}
      <div className="backup-card">
        <div className="backup-header">
          <h3>Respaldo del universo</h3>
          <p>Exporta o restaura cartas, Abrir cuando, razones, promesas, fechas, wishlist, diario, galería y playlist con sus ediciones y elementos ocultos.</p>
        </div>

        <div className="backup-actions">
          <button className="control-btn backup-export-btn" onClick={handleExportLocalLetters} type="button">
            <Download size={18} />
            Exportar respaldo
          </button>

          <label className="control-btn backup-import-label" htmlFor="localLettersImport">
            <Upload size={18} />
            Importar respaldo
          </label>
          <input
            id="localLettersImport"
            className="backup-file-input"
            type="file"
            accept=".json,application/json"
            onChange={handleImportLocalBackup}
          />
        </div>

        {backupStatus && (
          <p className={`backup-status ${backupStatus.type}`}>
            {backupStatus.text}
          </p>
        )}
      </div>

      <div className="crud-central-shell">
        <div className="crud-selector-block">
          <h3>¿Qué quieres editar?</h3>
          <div className="crud-selector-grid">
            {crudModules.map((module) => (
              <button
                className={`crud-selector-btn ${activeCrudModule === module.id ? 'active' : ''}`}
                key={module.id}
                onClick={() => handleCrudModuleChange(module.id)}
                type="button"
              >
                {module.label}
              </button>
            ))}
          </div>
        </div>

        <div className="crud-selector-block">
          <h3>¿Qué quieres hacer?</h3>
          <div className="crud-selector-grid compact">
            {crudActions.map((action) => (
              <button
                className={`crud-selector-btn ${activeCrudAction === action.id ? 'active' : ''}`}
                key={action.id}
                onClick={() => handleCrudActionChange(action.id)}
                type="button"
              >
                {action.label}
              </button>
            ))}
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

      {/* Base monthly letters editor */}
      <div className={`base-monthly-editor ${activeCrudModule === 'monthlyLetters' && activeCrudAction === 'originals' ? '' : 'crud-panel-hidden'}`} id="base-monthly-editor">
        <div className="base-reasons-panel">
          <div className="crud-subsection-title">Originales / editadas / ocultas</div>
          <div className="reasons-list-header">
            <h3>
              <BookOpen size={18} />
              Cartas mensuales originales
            </h3>
            <span>{monthlyLettersData.length} base</span>
          </div>

          <div className="reason-stats-grid">
            <CrudStatButton activeFilter={activeCrudFilter} onClick={handleCrudFilterClick} filter="base" value={getNormalBaseCount(visibleBaseMonthly)} label="Base" />
            <CrudStatButton activeFilter={activeCrudFilter} onClick={handleCrudFilterClick} filter="edited" value={editedBaseMonthlyCount} label="Editadas" />
            <CrudStatButton activeFilter={activeCrudFilter} onClick={handleCrudFilterClick} filter="hidden" value={hiddenBaseMonthlyCount} label="Ocultas" />
            <CrudStatButton activeFilter={activeCrudFilter} onClick={handleCrudFilterClick} filter="local" value={localMonthly.length} label="Tuyos" />
          </div>

          <div className="editor-warning">
            <AlertTriangle size={15} />
            <span>Estas ediciones son tuyas; el JSON original no se modifica.</span>
          </div>

          <div className="base-reasons-list">
            {filteredBaseMonthly.length === 0 ? (
              <p className="no-items">No hay elementos en este filtro.</p>
            ) : filteredBaseMonthly.map((letter) => (
              <div
                className={`base-reason-row ${letter.isOverridden ? 'is-overridden' : ''} ${letter.isHidden ? 'is-hidden' : ''}`}
                key={letter.id}
              >
                <div className="base-reason-copy">
                  <strong>{letter.month} · {letter.title}</strong>
                  <span>{letter.preview}</span>
                  <small>
                    {letter.isHidden ? 'Oculta' : letter.isOverridden ? 'Editada' : letter.locked ? 'Base bloqueada' : 'Base disponible'}
                  </small>
                </div>

                <div className="base-reason-actions">
                  <button type="button" className="ghost-button" onClick={() => handleBaseMonthlyEdit(letter)}>
                    Editar
                  </button>

                  {letter.isOverridden && (
                    <button type="button" className="ghost-button" onClick={() => handleBaseMonthlyRestore(letter.id)}>
                      Restaurar
                    </button>
                  )}

                  {letter.isHidden ? (
                    <button type="button" className="ghost-button" onClick={() => handleBaseMonthlyUnhide(letter.id)}>
                      Mostrar
                    </button>
                  ) : (
                    <button type="button" className="ghost-button danger-action" onClick={() => handleBaseMonthlyHide(letter)}>
                      Ocultar
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {hiddenBaseMonthlyCount > 0 && (
            <div className="hidden-reasons-box">
              <h4>Cartas mensuales ocultas</h4>
              {visibleBaseMonthly.filter((letter) => letter.isHidden).map((letter) => (
                <button type="button" className="ghost-button" key={letter.id} onClick={() => handleBaseMonthlyUnhide(letter.id)}>
                  Mostrar {letter.month}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="base-reasons-panel">
          <div className="crud-subsection-title">Editar original</div>
          <h3>
            <Edit2 size={18} />
            Override de carta mensual
          </h3>

          <form className="editor-form" onSubmit={handleBaseMonthlySubmit}>
            <div className="editor-field">
              <label htmlFor="baseMonthlyMonth">Mes / etiqueta *</label>
              <input
                id="baseMonthlyMonth"
                type="text"
                value={baseMonthlyMonth}
                onChange={(event) => setBaseMonthlyMonth(event.target.value)}
                disabled={!editingBaseMonthlyId}
                required
              />
            </div>

            <div className="editor-field">
              <label htmlFor="baseMonthlyTitle">Titulo override *</label>
              <input
                id="baseMonthlyTitle"
                type="text"
                value={baseMonthlyTitle}
                onChange={(event) => setBaseMonthlyTitle(event.target.value)}
                disabled={!editingBaseMonthlyId}
                required
              />
            </div>

            <div className="editor-field">
              <label htmlFor="baseMonthlyPreview">Preview override *</label>
              <input
                id="baseMonthlyPreview"
                type="text"
                value={baseMonthlyPreview}
                onChange={(event) => setBaseMonthlyPreview(event.target.value)}
                disabled={!editingBaseMonthlyId}
                required
              />
            </div>

            <div className="editor-field">
              <label htmlFor="baseMonthlyLocked">Estado de carta *</label>
              <select
                id="baseMonthlyLocked"
                value={baseMonthlyLocked ? 'locked' : 'unlocked'}
                onChange={(event) => setBaseMonthlyLocked(event.target.value === 'locked')}
                disabled={!editingBaseMonthlyId}
                required
              >
                <option value="unlocked">Desbloqueada</option>
                <option value="locked">Bloqueada</option>
              </select>
            </div>

            <div className="editor-field">
              <label htmlFor="baseMonthlyContent">Contenido override (un parrafo por linea) *</label>
              <textarea
                id="baseMonthlyContent"
                rows="6"
                value={baseMonthlyContent}
                onChange={(event) => setBaseMonthlyContent(event.target.value)}
                disabled={!editingBaseMonthlyId}
                required
              ></textarea>
            </div>

            <div className="form-actions">
              {editingBaseMonthlyId && (
                <button type="button" className="ghost-button cancel-btn" onClick={resetBaseMonthlyForm}>
                  Cancelar
                </button>
              )}
              <button type="submit" className="control-btn submit-btn" disabled={!editingBaseMonthlyId}>
                Guardar override
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Base open when letters editor */}
      <div className={`base-openwhen-editor ${activeCrudModule === 'openWhenLetters' && activeCrudAction === 'originals' ? '' : 'crud-panel-hidden'}`} id="base-openwhen-editor">
        <div className="base-reasons-panel">
          <div className="crud-subsection-title">Originales / editadas / ocultas</div>
          <div className="reasons-list-header">
            <h3>
              <BookOpen size={18} />
              Cartas Abrir cuando originales
            </h3>
            <span>{openWhenData.length} base</span>
          </div>

          <div className="reason-stats-grid">
            <CrudStatButton activeFilter={activeCrudFilter} onClick={handleCrudFilterClick} filter="base" value={getNormalBaseCount(visibleBaseOpenWhen)} label="Base" />
            <CrudStatButton activeFilter={activeCrudFilter} onClick={handleCrudFilterClick} filter="edited" value={editedBaseOpenWhenCount} label="Editadas" />
            <CrudStatButton activeFilter={activeCrudFilter} onClick={handleCrudFilterClick} filter="hidden" value={hiddenBaseOpenWhenCount} label="Ocultas" />
            <CrudStatButton activeFilter={activeCrudFilter} onClick={handleCrudFilterClick} filter="local" value={localOpenWhen.length} label="Tuyos" />
          </div>

          <div className="editor-warning">
            <AlertTriangle size={15} />
            <span>Estas ediciones son tuyas; el JSON original no se modifica.</span>
          </div>

          <div className="base-reasons-list">
            {filteredBaseOpenWhen.length === 0 ? (
              <p className="no-items">No hay elementos en este filtro.</p>
            ) : filteredBaseOpenWhen.map((card) => (
              <div
                className={`base-reason-row ${card.isOverridden ? 'is-overridden' : ''} ${card.isHidden ? 'is-hidden' : ''}`}
                key={card.id}
              >
                <div className="base-reason-copy">
                  <strong>{card.mood}</strong>
                  <span>{card.title} · {card.preview}</span>
                  <small>
                    {card.isHidden ? 'Oculta' : card.isOverridden ? 'Editada' : card.locked ? 'Base bloqueada' : 'Base disponible'}
                  </small>
                </div>

                <div className="base-reason-actions">
                  <button type="button" className="ghost-button" onClick={() => handleBaseOpenWhenEdit(card)}>
                    Editar
                  </button>

                  {card.isOverridden && (
                    <button type="button" className="ghost-button" onClick={() => handleBaseOpenWhenRestore(card.id)}>
                      Restaurar
                    </button>
                  )}

                  {card.isHidden ? (
                    <button type="button" className="ghost-button" onClick={() => handleBaseOpenWhenUnhide(card.id)}>
                      Mostrar
                    </button>
                  ) : (
                    <button type="button" className="ghost-button danger-action" onClick={() => handleBaseOpenWhenHide(card)}>
                      Ocultar
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {hiddenBaseOpenWhenCount > 0 && (
            <div className="hidden-reasons-box">
              <h4>Cartas Abrir cuando ocultas</h4>
              {visibleBaseOpenWhen.filter((card) => card.isHidden).map((card) => (
                <button type="button" className="ghost-button" key={card.id} onClick={() => handleBaseOpenWhenUnhide(card.id)}>
                  Mostrar {card.mood}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="base-reasons-panel">
          <div className="crud-subsection-title">Editar original</div>
          <h3>
            <Edit2 size={18} />
            Override de carta Abrir cuando
          </h3>

          <form className="editor-form" onSubmit={handleBaseOpenWhenSubmit}>
            <div className="editor-field">
              <label htmlFor="baseOpenWhenMood">Motivo / emocion *</label>
              <input
                id="baseOpenWhenMood"
                type="text"
                value={baseOpenWhenMood}
                onChange={(event) => setBaseOpenWhenMood(event.target.value)}
                disabled={!editingBaseOpenWhenId}
                required
              />
            </div>

            <div className="editor-field">
              <label htmlFor="baseOpenWhenTitle">Titulo override *</label>
              <input
                id="baseOpenWhenTitle"
                type="text"
                value={baseOpenWhenTitle}
                onChange={(event) => setBaseOpenWhenTitle(event.target.value)}
                disabled={!editingBaseOpenWhenId}
                required
              />
            </div>

            <div className="editor-field">
              <label htmlFor="baseOpenWhenPreview">Preview override *</label>
              <input
                id="baseOpenWhenPreview"
                type="text"
                value={baseOpenWhenPreview}
                onChange={(event) => setBaseOpenWhenPreview(event.target.value)}
                disabled={!editingBaseOpenWhenId}
                required
              />
            </div>

            <div className="editor-field">
              <label htmlFor="baseOpenWhenLocked">Estado de carta *</label>
              <select
                id="baseOpenWhenLocked"
                value={baseOpenWhenLocked ? 'locked' : 'unlocked'}
                onChange={(event) => setBaseOpenWhenLocked(event.target.value === 'locked')}
                disabled={!editingBaseOpenWhenId}
                required
              >
                <option value="unlocked">Desbloqueada</option>
                <option value="locked">Bloqueada</option>
              </select>
            </div>

            <div className="editor-field">
              <label htmlFor="baseOpenWhenContent">Contenido override (un parrafo por linea) *</label>
              <textarea
                id="baseOpenWhenContent"
                rows="6"
                value={baseOpenWhenContent}
                onChange={(event) => setBaseOpenWhenContent(event.target.value)}
                disabled={!editingBaseOpenWhenId}
                required
              ></textarea>
            </div>

            <div className="form-actions">
              {editingBaseOpenWhenId && (
                <button type="button" className="ghost-button cancel-btn" onClick={resetBaseOpenWhenForm}>
                  Cancelar
                </button>
              )}
              <button type="submit" className="control-btn submit-btn" disabled={!editingBaseOpenWhenId}>
                Guardar override
              </button>
            </div>
          </form>
        </div>
      </div>

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

<div className={`base-timeline-editor ${activeCrudModule === 'timeline' && activeCrudAction === 'originals' ? '' : 'crud-panel-hidden'}`} id="base-timeline-editor">
        <div className="base-reasons-panel">
          <div className="crud-subsection-title">Originales / editadas / ocultas</div>
          <div className="reasons-list-header">
            <h3>Diario original</h3>
            <span>{timelineData.length} base</span>
          </div>

          <div className="reason-stats-grid">
            <CrudStatButton activeFilter={activeCrudFilter} onClick={handleCrudFilterClick} filter="base" value={getNormalBaseCount(visibleBaseTimelinePages)} label="Base" />
            <CrudStatButton activeFilter={activeCrudFilter} onClick={handleCrudFilterClick} filter="edited" value={editedBaseTimelineCount} label="Editadas" />
            <CrudStatButton activeFilter={activeCrudFilter} onClick={handleCrudFilterClick} filter="hidden" value={hiddenBaseTimelineCount} label="Ocultas" />
            <CrudStatButton activeFilter={activeCrudFilter} onClick={handleCrudFilterClick} filter="local" value={localTimelinePages.length} label="Tuyos" />
          </div>

          <div className="base-reasons-list">
            {filteredBaseTimelinePages.length === 0 ? (
              <p className="no-items">No hay elementos en este filtro.</p>
            ) : filteredBaseTimelinePages.map((page) => (
              <div
                className={`base-reason-row ${page.isOverridden ? 'is-overridden' : ''} ${page.isHidden ? 'is-hidden' : ''}`}
                key={page.id}
              >
                <div className="base-reason-copy">
                  <strong>{page.chapter} · {formatTimelineDateForDisplay(page.date)} · {page.title}</strong>
                  <span>{page.description}</span>
                  <small>{page.isHidden ? 'Oculta' : page.isOverridden ? 'Editada' : 'Original'}</small>
                </div>

                <div className="base-reason-actions">
                  <button type="button" className="ghost-button" onClick={() => handleBaseTimelineEdit(page)}>
                    Editar
                  </button>

                  {page.isOverridden && (
                    <button type="button" className="ghost-button" onClick={() => handleBaseTimelineRestore(page.id)}>
                      Restaurar
                    </button>
                  )}

                  {page.isHidden ? (
                    <button type="button" className="ghost-button" onClick={() => handleBaseTimelineUnhide(page.id)}>
                      Mostrar
                    </button>
                  ) : (
                    <button type="button" className="ghost-button danger-action" onClick={() => handleBaseTimelineHide(page)}>
                      Ocultar
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {hiddenBaseTimelineCount > 0 && (
            <div className="hidden-reasons-box">
              <h4>Paginas ocultas</h4>
              {visibleBaseTimelinePages.filter((page) => page.isHidden).map((page) => (
                <button type="button" className="ghost-button" key={page.id} onClick={() => handleBaseTimelineUnhide(page.id)}>
                  Mostrar {page.title}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="base-reasons-panel">
          <div className="crud-subsection-title">Editar original</div>
          <h3>
            <Edit2 size={18} />
            Override del diario
          </h3>

          <form className="editor-form" onSubmit={handleBaseTimelineSubmit}>
            <div className="editor-field">
              <label htmlFor="baseTimelineChapter">Capitulo *</label>
              <input
                id="baseTimelineChapter"
                type="text"
                value={baseTimelineChapter}
                onChange={(event) => setBaseTimelineChapter(event.target.value)}
                disabled={!editingBaseTimelineId}
                required
              />
            </div>

            <div className="editor-field">
              <label htmlFor="baseTimelineDate">Fecha *</label>
              <input
                id="baseTimelineDate"
                type="date"
                value={baseTimelineDate}
                onChange={(event) => setBaseTimelineDate(event.target.value)}
                disabled={!editingBaseTimelineId}
                required
              />
            </div>

            <div className="editor-field">
              <label htmlFor="baseTimelineTitle">Titulo *</label>
              <input
                id="baseTimelineTitle"
                type="text"
                value={baseTimelineTitle}
                onChange={(event) => setBaseTimelineTitle(event.target.value)}
                disabled={!editingBaseTimelineId}
                required
              />
            </div>

            <div className="editor-field">
              <label htmlFor="baseTimelineSubtitle">Subtitulo</label>
              <input
                id="baseTimelineSubtitle"
                type="text"
                value={baseTimelineSubtitle}
                onChange={(event) => setBaseTimelineSubtitle(event.target.value)}
                disabled={!editingBaseTimelineId}
              />
            </div>

            <div className="editor-field">
              <label htmlFor="baseTimelineDescription">Descripcion *</label>
              <textarea
                id="baseTimelineDescription"
                rows="4"
                value={baseTimelineDescription}
                onChange={(event) => setBaseTimelineDescription(event.target.value)}
                disabled={!editingBaseTimelineId}
                required
              ></textarea>
            </div>

            <div className="editor-field">
              <label htmlFor="baseTimelineQuote">Frase</label>
              <textarea
                id="baseTimelineQuote"
                rows="3"
                value={baseTimelineQuote}
                onChange={(event) => setBaseTimelineQuote(event.target.value)}
                disabled={!editingBaseTimelineId}
              ></textarea>
            </div>

            <div className="editor-field">
              <label htmlFor="baseTimelineDetails">Detalles</label>
              <textarea
                id="baseTimelineDetails"
                rows="4"
                value={baseTimelineDetails}
                onChange={(event) => setBaseTimelineDetails(event.target.value)}
                disabled={!editingBaseTimelineId}
              ></textarea>
            </div>

            <div className="editor-field">
              <label htmlFor="baseTimelineMood">Mood</label>
              <input
                id="baseTimelineMood"
                type="text"
                value={baseTimelineMood}
                onChange={(event) => setBaseTimelineMood(event.target.value)}
                disabled={!editingBaseTimelineId}
              />
            </div>

            <div className="form-actions">
              {editingBaseTimelineId && (
                <button type="button" className="ghost-button cancel-btn" onClick={resetBaseTimelineForm}>
                  Cancelar
                </button>
              )}
              <button type="submit" className="control-btn submit-btn" disabled={!editingBaseTimelineId}>
                Guardar override
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className={`local-timeline-editor ${activeCrudModule === 'timeline' && ['local', 'create'].includes(activeCrudAction) ? `crud-show-${activeCrudAction}` : 'crud-panel-hidden'}`} id="local-timeline-editor">
        <div className="reasons-editor-card">
          <div className="crud-subsection-title">Crear nueva</div>
          <h3>
            <Plus size={18} />
            Editor del diario
          </h3>

          <div className="editor-warning">
            <AlertTriangle size={15} />
            <span>Estas páginas son tuyas; el JSON original no se modifica.</span>
          </div>

          <form className="editor-form" onSubmit={handleTimelineSubmit}>
            <div className="editor-field">
              <label htmlFor="timelineChapter">Capitulo *</label>
              <input
                id="timelineChapter"
                type="text"
                placeholder="Ej. Capitulo VI"
                value={timelineChapter}
                onChange={(event) => setTimelineChapter(event.target.value)}
                required
              />
            </div>

            <div className="editor-field">
              <label htmlFor="timelineDate">Fecha *</label>
              <input
                id="timelineDate"
                type="date"
                value={timelineDate}
                onChange={(event) => setTimelineDate(event.target.value)}
                required
              />
            </div>

            <div className="editor-field">
              <label htmlFor="timelineTitle">Titulo *</label>
              <input
                id="timelineTitle"
                type="text"
                placeholder="Ej. Una página nueva"
                value={timelineTitle}
                onChange={(event) => setTimelineTitle(event.target.value)}
                required
              />
            </div>

            <div className="editor-field">
              <label htmlFor="timelineSubtitle">Subtitulo</label>
              <input
                id="timelineSubtitle"
                type="text"
                placeholder="Ej. Algo que quiero recordar contigo."
                value={timelineSubtitle}
                onChange={(event) => setTimelineSubtitle(event.target.value)}
              />
            </div>

            <div className="editor-field">
              <label htmlFor="timelineDescription">Descripcion *</label>
              <textarea
                id="timelineDescription"
                rows="4"
                placeholder="Ej. Este dia se queda guardado como una página bonita de nuestra historia."
                value={timelineDescription}
                onChange={(event) => setTimelineDescription(event.target.value)}
                required
              ></textarea>
            </div>

            <div className="editor-field">
              <label htmlFor="timelineQuote">Frase</label>
              <textarea
                id="timelineQuote"
                rows="3"
                placeholder="Ej. Hay recuerdos que brillan aunque pase el tiempo."
                value={timelineQuote}
                onChange={(event) => setTimelineQuote(event.target.value)}
              ></textarea>
            </div>

            <div className="editor-field">
              <label htmlFor="timelineDetails">Detalles</label>
              <textarea
                id="timelineDetails"
                rows="4"
                placeholder="Una linea por detalle"
                value={timelineDetails}
                onChange={(event) => setTimelineDetails(event.target.value)}
              ></textarea>
            </div>

            <div className="editor-field">
              <label htmlFor="timelineMood">Mood</label>
              <input
                id="timelineMood"
                type="text"
                placeholder="Ej. Recuerdo"
                value={timelineMood}
                onChange={(event) => setTimelineMood(event.target.value)}
              />
            </div>

            <div className="form-actions">
              {editingTimelineId && (
                <button type="button" className="ghost-button cancel-btn" onClick={resetTimelineForm}>
                  Cancelar
                </button>
              )}
              <button type="submit" className="control-btn submit-btn">
                {editingTimelineId ? 'Actualizar página local' : 'Guardar página local'}
              </button>
            </div>
          </form>
        </div>

        <div className="reasons-list-card">
          <div className="crud-subsection-title">Creadas por ti</div>
          <div className="reasons-list-header">
            <h3>Diario</h3>
            <span>{localTimelinePages.length} tuyas</span>
          </div>

          {localTimelinePages.length === 0 ? (
            <p className="no-items">No hay páginas tuyas creadas.</p>
          ) : (
            <div className="reason-items-list">
              {localTimelinePages.map((page) => (
                <div className="reason-item-row" key={page.id}>
                  <div className="item-info">
                    <strong>{page.chapter} · {formatTimelineDateForDisplay(page.date)} · {page.title}</strong>
                    <span>{page.description}</span>
                    <LocalContentMeta item={page} />
                  </div>

                  <div className="item-actions">
                    <button
                      type="button"
                      className="action-icon-btn edit"
                      onClick={() => handleTimelineEdit(page)}
                      title="Editar página local"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      type="button"
                      className="action-icon-btn delete"
                      onClick={() => handleTimelineDelete(page)}
                      title="Eliminar página local"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className={`base-blackhole-editor ${activeCrudModule === 'blackHoleGallery' && activeCrudAction === 'originals' ? '' : 'crud-panel-hidden'}`} id="base-blackhole-editor">
        <div className="base-reasons-panel">
          <div className="crud-subsection-title">Originales / editadas / ocultas</div>
          <div className="reasons-list-header">
            <h3>Agujero negro original</h3>
            <span>{blackHoleGalleryData.length} base</span>
          </div>

          <div className="reason-stats-grid">
            <CrudStatButton activeFilter={activeCrudFilter} onClick={handleCrudFilterClick} filter="base" value={getNormalBaseCount(visibleBaseBlackHoleGallery)} label="Base" />
            <CrudStatButton activeFilter={activeCrudFilter} onClick={handleCrudFilterClick} filter="edited" value={editedBaseBlackHoleGalleryCount} label="Editadas" />
            <CrudStatButton activeFilter={activeCrudFilter} onClick={handleCrudFilterClick} filter="hidden" value={hiddenBaseBlackHoleGalleryCount} label="Ocultas" />
            <CrudStatButton activeFilter={activeCrudFilter} onClick={handleCrudFilterClick} filter="local" value={localBlackHoleGallery.length} label="Tuyos" />
          </div>

          <div className="base-reasons-list">
            {filteredBaseBlackHoleGallery.length === 0 ? (
              <p className="no-items">No hay elementos en este filtro.</p>
            ) : filteredBaseBlackHoleGallery.map((item) => (
              <div
                className={`base-reason-row ${item.isOverridden ? 'is-overridden' : ''} ${item.isHidden ? 'is-hidden' : ''}`}
                key={item.id}
              >
                <div className="base-reason-copy">
                  <strong>{item.date} · {item.title}</strong>
                  <span>{item.description}</span>
                  <small>{item.isHidden ? 'Oculto' : item.isOverridden ? 'Editado' : 'Original'}</small>
                </div>

                <div className="base-reason-actions">
                  <button type="button" className="ghost-button" onClick={() => handleBaseBlackHoleEdit(item)}>
                    Editar
                  </button>

                  {item.isOverridden && (
                    <button type="button" className="ghost-button" onClick={() => handleBaseBlackHoleRestore(item.id)}>
                      Restaurar
                    </button>
                  )}

                  {item.isHidden ? (
                    <button type="button" className="ghost-button" onClick={() => handleBaseBlackHoleUnhide(item.id)}>
                      Mostrar
                    </button>
                  ) : (
                    <button type="button" className="ghost-button danger-action" onClick={() => handleBaseBlackHoleHide(item)}>
                      Ocultar
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {hiddenBaseBlackHoleGalleryCount > 0 && (
            <div className="hidden-reasons-box">
              <h4>Recuerdos ocultos</h4>
              {visibleBaseBlackHoleGallery.filter((item) => item.isHidden).map((item) => (
                <button type="button" className="ghost-button" key={item.id} onClick={() => handleBaseBlackHoleUnhide(item.id)}>
                  Mostrar {item.title}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="base-reasons-panel">
          <div className="crud-subsection-title">Editar original</div>
          <h3>
            <Edit2 size={18} />
            Override del agujero negro
          </h3>

          <form className="editor-form" onSubmit={handleBaseBlackHoleSubmit}>
            <div className="editor-field">
              <label htmlFor="baseBlackHoleDate">Fecha / etiqueta *</label>
              <input
                id="baseBlackHoleDate"
                type="text"
                value={baseBlackHoleDate}
                onChange={(event) => setBaseBlackHoleDate(event.target.value)}
                disabled={!editingBaseBlackHoleId}
                required
              />
            </div>

            <div className="editor-field">
              <label htmlFor="baseBlackHoleTitle">Titulo *</label>
              <input
                id="baseBlackHoleTitle"
                type="text"
                value={baseBlackHoleTitle}
                onChange={(event) => setBaseBlackHoleTitle(event.target.value)}
                disabled={!editingBaseBlackHoleId}
                required
              />
            </div>

            <div className="editor-field">
              <label htmlFor="baseBlackHoleDescription">Descripcion *</label>
              <textarea
                id="baseBlackHoleDescription"
                rows="4"
                value={baseBlackHoleDescription}
                onChange={(event) => setBaseBlackHoleDescription(event.target.value)}
                disabled={!editingBaseBlackHoleId}
                required
              ></textarea>
            </div>

            <div className="editor-field">
              <label htmlFor="baseBlackHoleImage">Imagen / URL</label>
              <input
                id="baseBlackHoleImage"
                type="text"
                value={baseBlackHoleImage}
                onChange={(event) => setBaseBlackHoleImage(event.target.value)}
                disabled={!editingBaseBlackHoleId}
              />
            </div>

            <div className="editor-field">
              <label htmlFor="baseBlackHoleImageFile">Cargar foto</label>
              <input
                id="baseBlackHoleImageFile"
                type="file"
                accept="image/*"
                onChange={(event) => handleBlackHoleImageFile(event, 'base')}
                disabled={!editingBaseBlackHoleId}
              />
              {baseBlackHoleImageStatus && <small className="editor-file-hint">{baseBlackHoleImageStatus}</small>}
            </div>

            {baseBlackHoleImage && (
              <div className="editor-image-preview">
                <button
                  type="button"
                  className="editor-image-remove"
                  onClick={() => clearBlackHoleImage('base')}
                  aria-label="Quitar imagen"
                  title="Quitar imagen"
                >
                  ×
                </button>
                <img src={baseBlackHoleImage} alt={baseBlackHoleAlt || baseBlackHoleTitle || 'Preview'} />
              </div>
            )}

            <div className="editor-field">
              <label htmlFor="baseBlackHoleAlt">Texto alt</label>
              <input
                id="baseBlackHoleAlt"
                type="text"
                value={baseBlackHoleAlt}
                onChange={(event) => setBaseBlackHoleAlt(event.target.value)}
                disabled={!editingBaseBlackHoleId}
              />
            </div>

            <div className="editor-field">
              <label htmlFor="baseBlackHoleTag">Etiqueta</label>
              <input
                id="baseBlackHoleTag"
                type="text"
                value={baseBlackHoleTag}
                onChange={(event) => setBaseBlackHoleTag(event.target.value)}
                disabled={!editingBaseBlackHoleId}
              />
            </div>

            <div className="editor-field">
              <label htmlFor="baseBlackHoleVideoUrl">URL de video opcional</label>
              <input
                id="baseBlackHoleVideoUrl"
                type="text"
                value={baseBlackHoleVideoUrl}
                onChange={(event) => setBaseBlackHoleVideoUrl(event.target.value)}
                disabled={!editingBaseBlackHoleId}
              />
            </div>

            <div className="form-actions">
              {editingBaseBlackHoleId && (
                <button type="button" className="ghost-button cancel-btn" onClick={resetBaseBlackHoleForm}>
                  Cancelar
                </button>
              )}
              <button type="submit" className="control-btn submit-btn" disabled={!editingBaseBlackHoleId}>
                Guardar override
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className={`local-blackhole-editor ${activeCrudModule === 'blackHoleGallery' && ['local', 'create'].includes(activeCrudAction) ? `crud-show-${activeCrudAction}` : 'crud-panel-hidden'}`} id="local-blackhole-editor">
        <div className="reasons-editor-card">
          <div className="crud-subsection-title">Crear nueva</div>
          <h3>
            <Plus size={18} />
            Editor del agujero negro
          </h3>

          <div className="editor-warning">
            <AlertTriangle size={15} />
            <span>Estos recuerdos son tuyos; el JSON original no se modifica.</span>
          </div>

          <form className="editor-form" onSubmit={handleBlackHoleSubmit}>
            <div className="editor-field">
              <label htmlFor="blackHoleDate">Fecha / etiqueta *</label>
              <input
                id="blackHoleDate"
                type="text"
                placeholder="Ej. Un recuerdo bonito"
                value={blackHoleDate}
                onChange={(event) => setBlackHoleDate(event.target.value)}
                required
              />
            </div>

            <div className="editor-field">
              <label htmlFor="blackHoleTitle">Titulo *</label>
              <input
                id="blackHoleTitle"
                type="text"
                placeholder="Ej. Una foto que quiero guardar"
                value={blackHoleTitle}
                onChange={(event) => setBlackHoleTitle(event.target.value)}
                required
              />
            </div>

            <div className="editor-field">
              <label htmlFor="blackHoleDescription">Descripcion *</label>
              <textarea
                id="blackHoleDescription"
                rows="4"
                placeholder="Ej. Este recuerdo se queda orbitando aqui porque significa mucho."
                value={blackHoleDescription}
                onChange={(event) => setBlackHoleDescription(event.target.value)}
                required
              ></textarea>
            </div>

            <div className="editor-field">
              <label htmlFor="blackHoleImage">Imagen / URL</label>
              <input
                id="blackHoleImage"
                type="text"
                placeholder="/DistanciaCero/images/blackhole-gallery/foto.jpg"
                value={blackHoleImage}
                onChange={(event) => setBlackHoleImage(event.target.value)}
              />
            </div>

            <div className="editor-field">
              <label htmlFor="blackHoleImageFile">Cargar foto</label>
              <input
                id="blackHoleImageFile"
                type="file"
                accept="image/*"
                onChange={(event) => handleBlackHoleImageFile(event, 'local')}
              />
              {blackHoleImageStatus && <small className="editor-file-hint">{blackHoleImageStatus}</small>}
            </div>

            {blackHoleImage && (
              <div className="editor-image-preview">
                <button
                  type="button"
                  className="editor-image-remove"
                  onClick={() => clearBlackHoleImage('local')}
                  aria-label="Quitar imagen"
                  title="Quitar imagen"
                >
                  ×
                </button>
                <img src={blackHoleImage} alt={blackHoleAlt || blackHoleTitle || 'Preview'} />
              </div>
            )}

            <div className="editor-field">
              <label htmlFor="blackHoleAlt">Texto alt</label>
              <input
                id="blackHoleAlt"
                type="text"
                placeholder="Ej. Recuerdo bonito"
                value={blackHoleAlt}
                onChange={(event) => setBlackHoleAlt(event.target.value)}
              />
            </div>

            <div className="editor-field">
              <label htmlFor="blackHoleTag">Etiqueta</label>
              <input
                id="blackHoleTag"
                type="text"
                placeholder="Ej. Mi lugar favorito"
                value={blackHoleTag}
                onChange={(event) => setBlackHoleTag(event.target.value)}
              />
            </div>

            <div className="editor-field">
              <label htmlFor="blackHoleVideoUrl">URL de video opcional</label>
              <input
                id="blackHoleVideoUrl"
                type="text"
                placeholder="Opcional, no se reproduce todavia"
                value={blackHoleVideoUrl}
                onChange={(event) => setBlackHoleVideoUrl(event.target.value)}
              />
            </div>

            <div className="form-actions">
              {editingBlackHoleId && (
                <button type="button" className="ghost-button cancel-btn" onClick={resetBlackHoleForm}>
                  Cancelar
                </button>
              )}
              <button type="submit" className="control-btn submit-btn">
                {editingBlackHoleId ? 'Actualizar recuerdo tuyo' : 'Guardar recuerdo tuyo'}
              </button>
            </div>
          </form>
        </div>

        <div className="reasons-list-card">
          <div className="crud-subsection-title">Creadas por ti</div>
          <div className="reasons-list-header">
            <h3>Recuerdos creados por ti</h3>
            <span>{localBlackHoleGallery.length} tuyas</span>
          </div>

          {localBlackHoleGallery.length === 0 ? (
            <p className="no-items">No hay recuerdos tuyos creados.</p>
          ) : (
            <div className="reason-items-list">
              {localBlackHoleGallery.map((item) => (
                <div className="reason-item-row" key={item.id}>
                  <div className="item-info">
                    <strong>{item.date} · {item.title}</strong>
                    <span>{item.description}</span>
                    <LocalContentMeta item={item} />
                  </div>

                  <div className="item-actions">
                    <button
                      type="button"
                      className="action-icon-btn edit"
                      onClick={() => handleBlackHoleEdit(item)}
                      title="Editar recuerdo tuyo"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      type="button"
                      className="action-icon-btn delete"
                      onClick={() => handleBlackHoleDelete(item)}
                      title="Eliminar recuerdo tuyo"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

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

<div className={`local-editor-container ${['monthlyLetters', 'openWhenLetters'].includes(activeCrudModule) && ['local', 'create'].includes(activeCrudAction) ? `crud-show-${activeCrudAction} crud-module-${activeCrudModule}` : 'crud-panel-hidden'}`} id="local-editor-form">
        <div className="editor-card">
          <div className="crud-subsection-title">Crear nueva</div>
          <h3>
            <Plus size={18} />
            {editingId ? 'Editar Carta' : 'Crear Carta'}
          </h3>
          <div className="editor-warning">
            <AlertTriangle size={15} />
            <span>
              <strong>Aviso de pruebas</strong>: Estas cartas se sincronizan con la nube.
            </span>
          </div>

          <form onSubmit={handleSubmit} className="editor-form">
            <div className="editor-row">
              <div className="editor-field">
                <label htmlFor="tag">
                  {activeLetterType === 'monthly' ? 'Mes / Etiqueta *' : 'Motivo / Emoción *'}
                </label>
                <input
                  type="text"
                  id="tag"
                  placeholder={
                    activeLetterType === 'monthly'
                      ? 'Ej. Mes 4 o Carta especial'
                      : 'Ej. Abrir cuando me extrañes'
                  }
                  value={tag}
                  onChange={(e) => setTag(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="editor-field">
              <label htmlFor="title">Título de la Carta *</label>
              <input
                type="text"
                id="title"
                placeholder="Ej. Un escrito desde mi corazón"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="editor-field">
              <label htmlFor="letterLocked">Estado de carta *</label>
              <select
                id="letterLocked"
                value={letterLocked ? 'locked' : 'unlocked'}
                onChange={(e) => setLetterLocked(e.target.value === 'locked')}
                required
              >
                <option value="unlocked">Desbloqueada</option>
                <option value="locked">Bloqueada</option>
              </select>
            </div>

            <div className="editor-field">
              <label htmlFor="preview">Vista previa / Preview *</label>
              <input
                type="text"
                id="preview"
                placeholder="Ej. Un breve mensaje antes de abrir..."
                value={preview}
                onChange={(e) => setPreview(e.target.value)}
                required
              />
            </div>

            <div className="editor-field">
              <label htmlFor="contentRaw">Contenido de la carta (un párrafo por línea) *</label>
              <textarea
                id="contentRaw"
                rows="6"
                placeholder="Escribe el texto de tu carta aquí.&#10;Presiona Enter para crear un nuevo párrafo."
                value={contentRaw}
                onChange={(e) => setContentRaw(e.target.value)}
                required
              ></textarea>
            </div>

            <div className="form-actions">
              {editingId && (
                <button
                  type="button"
                  className="ghost-button cancel-btn"
                  onClick={() => {
                    setEditingId(null)
                    setTitle('')
                    setPreview('')
                    setContentRaw('')
                    setTag('')
                    setLetterLocked(false)
                  }}
                >
                  Cancelar
                </button>
              )}
              <button type="submit" className="control-btn submit-btn">
                {editingId ? 'Actualizar Carta' : 'Guardar Carta'}
              </button>
            </div>
          </form>
        </div>

        {/* Local Letters Listings */}
        <div className="local-list-card">
          <div className="crud-subsection-title">Creadas por ti</div>
          <h3>Cartas creadas por ti</h3>
          
          <div className="local-lists-split">
            {/* Monthly Local List */}
            <div className="list-column monthly-local-column">
              <h4>Mensuales ({localMonthly.length})</h4>
              {localMonthly.length === 0 ? (
                <p className="no-items">No hay cartas mensuales tuyas.</p>
              ) : (
                <div className="items-list">
                  {localMonthly.map((item) => (
                    <div className="item-row" key={item.id}>
                      <div className="item-info">
                        <strong>{item.title}</strong>
                        <span>{item.month}</span>
                        <LocalContentMeta item={item} />
                      </div>
                      <div className="item-actions">
                        <button
                          type="button"
                          className="action-icon-btn edit"
                          onClick={() => handleEdit(item, 'monthly')}
                          title="Editar"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          type="button"
                          className="action-icon-btn delete"
                          onClick={() => handleDelete(item.id, 'monthly')}
                          title="Eliminar"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Open When Local List */}
            <div className="list-column openwhen-local-column">
              <h4>Abrir cuando ({localOpenWhen.length})</h4>
              {localOpenWhen.length === 0 ? (
                <p className="no-items">No hay cartas abrir cuando tuyas.</p>
              ) : (
                <div className="items-list">
                  {localOpenWhen.map((item) => (
                    <div className="item-row" key={item.id}>
                      <div className="item-info">
                        <strong>{item.title}</strong>
                        <span>{item.mood}</span>
                        <LocalContentMeta item={item} />
                      </div>
                      <div className="item-actions">
                        <button
                          type="button"
                          className="action-icon-btn edit"
                          onClick={() => handleEdit(item, 'openwhen')}
                          title="Editar"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          type="button"
                          className="action-icon-btn delete"
                          onClick={() => handleDelete(item.id, 'openwhen')}
                          title="Eliminar"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default CentroUniversoSection
