import { useState, useEffect } from 'react'
import SectionTitle from './SectionTitle'
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
  addLocalItem,
  deleteLocalItem,
  deleteLocalOverride,
  getHiddenItemIds,
  getLocalItems,
  getLocalOverrides,
  hideDefaultItem,
  restoreHiddenItem,
  saveHiddenItemIds,
  saveLocalItems,
  saveLocalOverrides,
  setLocalOverride,
  updateLocalItem
} from '../utils/localContentStore'

function CentroUniversoSection() {
  const [isSimUnlocked, setIsSimUnlocked] = useState(false)
  const [localMonthly, setLocalMonthly] = useState([])
  const [localOpenWhen, setLocalOpenWhen] = useState([])
  const [backupStatus, setBackupStatus] = useState(null)
  const [localReasons, setLocalReasons] = useState([])
  const [reasonTitle, setReasonTitle] = useState('')
  const [reasonText, setReasonText] = useState('')
  const [editingReasonId, setEditingReasonId] = useState(null)
  const [reasonOverrides, setReasonOverrides] = useState({})
  const [hiddenReasonIds, setHiddenReasonIds] = useState([])
  const [baseReasonQuery, setBaseReasonQuery] = useState('')
  const [baseReasonTitle, setBaseReasonTitle] = useState('')
  const [baseReasonText, setBaseReasonText] = useState('')
  const [editingBaseReasonId, setEditingBaseReasonId] = useState(null)
  const [localPromises, setLocalPromises] = useState([])
  const [promiseOverrides, setPromiseOverrides] = useState({})
  const [hiddenPromiseIds, setHiddenPromiseIds] = useState([])
  const [promiseTitle, setPromiseTitle] = useState('')
  const [promiseText, setPromiseText] = useState('')
  const [promiseTag, setPromiseTag] = useState('')
  const [editingPromiseId, setEditingPromiseId] = useState(null)
  const [basePromiseTitle, setBasePromiseTitle] = useState('')
  const [basePromiseText, setBasePromiseText] = useState('')
  const [basePromiseTag, setBasePromiseTag] = useState('')
  const [editingBasePromiseId, setEditingBasePromiseId] = useState(null)
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
  const [localImportantDates, setLocalImportantDates] = useState([])
  const [importantDateOverrides, setImportantDateOverrides] = useState({})
  const [hiddenImportantDateIds, setHiddenImportantDateIds] = useState([])
  const [importantDateDate, setImportantDateDate] = useState('')
  const [importantDateTitle, setImportantDateTitle] = useState('')
  const [importantDateDescription, setImportantDateDescription] = useState('')
  const [importantDateTag, setImportantDateTag] = useState('')
  const [editingImportantDateId, setEditingImportantDateId] = useState(null)
  const [baseImportantDateDate, setBaseImportantDateDate] = useState('')
  const [baseImportantDateTitle, setBaseImportantDateTitle] = useState('')
  const [baseImportantDateDescription, setBaseImportantDateDescription] = useState('')
  const [baseImportantDateTag, setBaseImportantDateTag] = useState('')
  const [editingBaseImportantDateId, setEditingBaseImportantDateId] = useState(null)
  const [localFutureDreams, setLocalFutureDreams] = useState([])
  const [futureDreamOverrides, setFutureDreamOverrides] = useState({})
  const [hiddenFutureDreamIds, setHiddenFutureDreamIds] = useState([])
  const [futureDreamCategory, setFutureDreamCategory] = useState('')
  const [futureDreamTitle, setFutureDreamTitle] = useState('')
  const [futureDreamDescription, setFutureDreamDescription] = useState('')
  const [editingFutureDreamId, setEditingFutureDreamId] = useState(null)
  const [baseFutureDreamCategory, setBaseFutureDreamCategory] = useState('')
  const [baseFutureDreamTitle, setBaseFutureDreamTitle] = useState('')
  const [baseFutureDreamDescription, setBaseFutureDreamDescription] = useState('')
  const [editingBaseFutureDreamId, setEditingBaseFutureDreamId] = useState(null)
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
  const [localPlaylist, setLocalPlaylist] = useState([])
  const [playlistOverrides, setPlaylistOverrides] = useState({})
  const [hiddenPlaylistIds, setHiddenPlaylistIds] = useState([])
  const [playlistTitle, setPlaylistTitle] = useState('')
  const [playlistArtist, setPlaylistArtist] = useState('')
  const [playlistDescription, setPlaylistDescription] = useState('')
  const [playlistSourceType, setPlaylistSourceType] = useState('local')
  const [playlistSrc, setPlaylistSrc] = useState('')
  const [playlistLink, setPlaylistLink] = useState('')
  const [playlistTag, setPlaylistTag] = useState('')
  const [editingPlaylistId, setEditingPlaylistId] = useState(null)
  const [basePlaylistTitle, setBasePlaylistTitle] = useState('')
  const [basePlaylistArtist, setBasePlaylistArtist] = useState('')
  const [basePlaylistDescription, setBasePlaylistDescription] = useState('')
  const [basePlaylistSourceType, setBasePlaylistSourceType] = useState('local')
  const [basePlaylistSrc, setBasePlaylistSrc] = useState('')
  const [basePlaylistLink, setBasePlaylistLink] = useState('')
  const [basePlaylistTag, setBasePlaylistTag] = useState('')
  const [editingBasePlaylistId, setEditingBasePlaylistId] = useState(null)

  // Form states
  const [letterType, setLetterType] = useState('monthly') // 'monthly' | 'openwhen'
  const [title, setTitle] = useState('')
  const [preview, setPreview] = useState('')
  const [contentRaw, setContentRaw] = useState('')
  const [tag, setTag] = useState('')
  const [letterLocked, setLetterLocked] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [activeCrudModule, setActiveCrudModule] = useState('monthlyLetters')
  const [activeCrudAction, setActiveCrudAction] = useState('originals')
  const [activeCrudFilter, setActiveCrudFilter] = useState('all')

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
  const CrudStatButton = ({ filter, value, label }) => (
    <button
      type="button"
      className={`crud-stat-button ${activeCrudFilter === filter ? 'is-active' : ''}`}
      onClick={() => handleCrudFilterClick(filter)}
    >
      <strong>{value}</strong>
      <span>{label}</span>
    </button>
  )

  useEffect(() => {
    setIsSimUnlocked(localStorage.getItem('distancia-cero-sim-unlocked') === '1')
    
    const m = localStorage.getItem('distancia-cero-local-monthly-letters')
    const ow = localStorage.getItem('distancia-cero-local-open-when')
    setLocalMonthly(m ? JSON.parse(m) : [])
    setLocalOpenWhen(ow ? JSON.parse(ow) : [])
    setLocalReasons(getLocalItems('reasons'))
    setReasonOverrides(getLocalOverrides('reasons'))
    setHiddenReasonIds(getHiddenItemIds('reasons'))
    setLocalPromises(getLocalItems('promises'))
    setPromiseOverrides(getLocalOverrides('promises'))
    setHiddenPromiseIds(getHiddenItemIds('promises'))
    setMonthlyOverrides(getLocalOverrides('monthlyLetters'))
    setHiddenMonthlyIds(getHiddenItemIds('monthlyLetters'))
    setOpenWhenOverrides(getLocalOverrides('openWhenLetters'))
    setHiddenOpenWhenIds(getHiddenItemIds('openWhenLetters'))
    setLocalImportantDates(getLocalItems('importantDates'))
    setImportantDateOverrides(getLocalOverrides('importantDates'))
    setHiddenImportantDateIds(getHiddenItemIds('importantDates'))
    setLocalFutureDreams(getLocalItems('futureDreams'))
    setFutureDreamOverrides(getLocalOverrides('futureDreams'))
    setHiddenFutureDreamIds(getHiddenItemIds('futureDreams'))
    setLocalTimelinePages(getLocalItems('timeline'))
    setTimelineOverrides(getLocalOverrides('timeline'))
    setHiddenTimelineIds(getHiddenItemIds('timeline'))
    setLocalBlackHoleGallery(getLocalItems('blackHoleGallery'))
    setBlackHoleGalleryOverrides(getLocalOverrides('blackHoleGallery'))
    setHiddenBlackHoleGalleryIds(getHiddenItemIds('blackHoleGallery'))
    setLocalPlaylist(getLocalItems('playlist'))
    setPlaylistOverrides(getLocalOverrides('playlist'))
    setHiddenPlaylistIds(getHiddenItemIds('playlist'))
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
    (l) => localStorage.getItem(`distancia-cero-monthly-letter-${l.id}`) === 'opened'
  ).length + localMonthly.filter(
    (l) => localStorage.getItem(`distancia-cero-monthly-letter-${l.id}`) === 'opened'
  ).length
  const unlockedMonthly = activeBaseMonthly.filter((l) => !l.locked).length + localMonthly.filter((l) => !l.locked).length
  const lockedMonthly = activeBaseMonthly.length - activeBaseMonthly.filter((l) => !l.locked).length

  // Calculation for Open When Letters stats (combining JSON + Local)
  const totalOpenWhen = activeBaseOpenWhen.length + localOpenWhen.length
  const openedOpenWhen = activeBaseOpenWhen.filter(
    (c) => localStorage.getItem(`distancia-cero-open-when-${c.id}`) === 'opened'
  ).length + localOpenWhen.filter(
    (c) => localStorage.getItem(`distancia-cero-open-when-${c.id}`) === 'opened'
  ).length
  const unlockedOpenWhen = activeBaseOpenWhen.filter((c) => !c.locked).length + localOpenWhen.filter((c) => !c.locked).length
  const lockedOpenWhen = (totalOpenWhen - unlockedOpenWhen)
  const editedBaseReasonsCount = Object.keys(reasonOverrides).length
  const hiddenBaseReasonsCount = hiddenReasonIds.length
  const visibleBaseReasons = reasonsData.map((reason) => {
    const override = reasonOverrides[String(reason.id)]
    return {
      ...reason,
      ...(override || {}),
      id: reason.id,
      isOverridden: Boolean(override),
      isHidden: hiddenReasonIds.includes(String(reason.id))
    }
  })
  const filteredBaseReasons = visibleBaseReasons.filter((reason) => {
    const query = baseReasonQuery.trim().toLowerCase()
    if (!query) return true

    return (
      String(reason.id).includes(query) ||
      (reason.title || '').toLowerCase().includes(query) ||
      (reason.text || '').toLowerCase().includes(query)
    )
  })
  const editedBasePromisesCount = Object.keys(promiseOverrides).length
  const hiddenBasePromisesCount = hiddenPromiseIds.length
  const visibleBasePromises = promisesData.map((promise) => {
    const override = promiseOverrides[String(promise.id)]
    return {
      ...promise,
      ...(override || {}),
      id: promise.id,
      text: override?.text || override?.description || promise.text || promise.description || '',
      tag: override?.tag || override?.footer || promise.tag || promise.footer || 'Promesa',
      isOverridden: Boolean(override),
      isHidden: hiddenPromiseIds.includes(String(promise.id))
    }
  })
  const editedBaseImportantDatesCount = Object.keys(importantDateOverrides).length
  const hiddenBaseImportantDatesCount = hiddenImportantDateIds.length
  const visibleBaseImportantDates = importantDatesData.map((dateItem) => {
    const override = importantDateOverrides[String(dateItem.id)]
    return {
      ...dateItem,
      ...(override || {}),
      id: dateItem.id,
      isOverridden: Boolean(override),
      isHidden: hiddenImportantDateIds.includes(String(dateItem.id))
    }
  })
  const editedBaseFutureDreamsCount = Object.keys(futureDreamOverrides).length
  const hiddenBaseFutureDreamsCount = hiddenFutureDreamIds.length
  const visibleBaseFutureDreams = futureDreamsData.map((dream) => {
    const override = futureDreamOverrides[String(dream.id)]
    return {
      ...dream,
      ...(override || {}),
      id: dream.id,
      description: override?.description || override?.text || dream.description || dream.text || '',
      category: override?.category || override?.tag || dream.category || dream.tag || 'Por vivir',
      isOverridden: Boolean(override),
      isHidden: hiddenFutureDreamIds.includes(String(dream.id))
    }
  })
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
  const editedBasePlaylistCount = Object.keys(playlistOverrides).length
  const hiddenBasePlaylistCount = hiddenPlaylistIds.length
  const visibleBasePlaylist = playlistData.map((item) => {
    const override = playlistOverrides[String(item.id)]
    return {
      ...item,
      ...(override || {}),
      id: item.id,
      isOverridden: Boolean(override),
      isHidden: hiddenPlaylistIds.includes(String(item.id))
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
  const filteredVisibleBaseReasons = filterBaseItemsByCrudFilter(filteredBaseReasons)
  const filteredBasePromises = filterBaseItemsByCrudFilter(visibleBasePromises)
  const filteredBaseImportantDates = filterBaseItemsByCrudFilter(visibleBaseImportantDates)
  const filteredBaseFutureDreams = filterBaseItemsByCrudFilter(visibleBaseFutureDreams)
  const filteredBaseTimelinePages = filterBaseItemsByCrudFilter(visibleBaseTimelinePages)
  const filteredBaseBlackHoleGallery = filterBaseItemsByCrudFilter(visibleBaseBlackHoleGallery)
  const filteredBasePlaylist = filterBaseItemsByCrudFilter(visibleBasePlaylist)

  const toggleSimulation = () => {
    if (isSimUnlocked) {
      localStorage.removeItem('distancia-cero-sim-unlocked')
    } else {
      localStorage.setItem('distancia-cero-sim-unlocked', '1')
    }
    window.location.reload()
  }

  const readLocalLetters = (storageKey) => {
    try {
      const rawValue = localStorage.getItem(storageKey)
      const parsedValue = rawValue ? JSON.parse(rawValue) : []
      return Array.isArray(parsedValue) ? parsedValue : []
    } catch (error) {
      return []
    }
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
        monthlyLetters: readLocalLetters('distancia-cero-local-monthly-letters'),
        openWhenLetters: readLocalLetters('distancia-cero-local-open-when'),
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
    setBackupStatus({ type: 'success', text: 'Respaldo local v2 creado correctamente.' })
  }

  const handleImportLocalLetters = (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      try {
        const importedData = JSON.parse(reader.result)
        const isValidBackup =
          importedData &&
          Object.prototype.hasOwnProperty.call(importedData, 'version') &&
          Array.isArray(importedData.monthlyLetters) &&
          Array.isArray(importedData.openWhenLetters)

        if (!isValidBackup) {
          setBackupStatus({ type: 'error', text: 'El archivo no tiene un formato valido de respaldo.' })
          return
        }

        const confirmed = window.confirm(
          'Esto reemplazara las cartas locales guardadas en este navegador. ¿Quieres continuar?'
        )

        if (!confirmed) {
          setBackupStatus({ type: 'error', text: 'Importacion cancelada. No se cambiaron las cartas locales.' })
          return
        }

        localStorage.setItem(
          'distancia-cero-local-monthly-letters',
          JSON.stringify(importedData.monthlyLetters)
        )
        localStorage.setItem(
          'distancia-cero-local-open-when',
          JSON.stringify(importedData.openWhenLetters)
        )
        setLocalMonthly(importedData.monthlyLetters)
        setLocalOpenWhen(importedData.openWhenLetters)
        setEditingId(null)
        setTitle('')
        setPreview('')
        setContentRaw('')
        setTag('')
        setLetterLocked(false)
        setBackupStatus({ type: 'success', text: 'Cartas locales importadas correctamente.' })
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
            'Esto reemplazara solo las cartas locales guardadas en este navegador. No tocara razones. ¿Quieres continuar?'
          )

          if (!confirmed) {
            setBackupStatus({ type: 'error', text: 'Importacion cancelada. No se cambiaron datos locales.' })
            return
          }

          localStorage.setItem(
            'distancia-cero-local-monthly-letters',
            JSON.stringify(importedData.monthlyLetters)
          )
          localStorage.setItem(
            'distancia-cero-local-open-when',
            JSON.stringify(importedData.openWhenLetters)
          )
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
          setBackupStatus({ type: 'success', text: 'Respaldo v1 importado: solo cartas locales.' })
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
          setBackupStatus({ type: 'error', text: 'El archivo no tiene un formato valido de respaldo v2.' })
          return
        }

        const confirmed = window.confirm(
          'Esto reemplazara cartas locales, razones locales, overrides y razones ocultas de este navegador. ¿Quieres continuar?'
        )

        if (!confirmed) {
          setBackupStatus({ type: 'error', text: 'Importacion cancelada. No se cambiaron datos locales.' })
          return
        }

        localStorage.setItem(
          'distancia-cero-local-monthly-letters',
          JSON.stringify(content.monthlyLetters)
        )
        localStorage.setItem(
          'distancia-cero-local-open-when',
          JSON.stringify(content.openWhenLetters)
        )
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
        setLocalReasons(savedReasons)
        setReasonOverrides(savedOverrides)
        setHiddenReasonIds(savedHiddenIds)
        setMonthlyOverrides(savedMonthlyOverrides)
        setHiddenMonthlyIds(savedHiddenMonthlyIds)
        setOpenWhenOverrides(savedOpenWhenOverrides)
        setHiddenOpenWhenIds(savedHiddenOpenWhenIds)
        setLocalImportantDates(savedImportantDates)
        setImportantDateOverrides(savedImportantDateOverrides)
        setHiddenImportantDateIds(savedHiddenImportantDateIds)
        setLocalFutureDreams(savedFutureDreams)
        setFutureDreamOverrides(savedFutureDreamOverrides)
        setHiddenFutureDreamIds(savedHiddenFutureDreamIds)
        setLocalTimelinePages(savedTimelinePages)
        setTimelineOverrides(savedTimelineOverrides)
        setHiddenTimelineIds(savedHiddenTimelineIds)
        setLocalBlackHoleGallery(savedBlackHoleGallery)
        setBlackHoleGalleryOverrides(savedBlackHoleGalleryOverrides)
        setHiddenBlackHoleGalleryIds(savedHiddenBlackHoleGalleryIds)
        setLocalPlaylist(savedPlaylist)
        setPlaylistOverrides(savedPlaylistOverrides)
        setHiddenPlaylistIds(savedHiddenPlaylistIds)
        setLocalPromises(savedPromises)
        setPromiseOverrides(savedPromiseOverrides)
        setHiddenPromiseIds(savedHiddenPromiseIds)
        setEditingId(null)
        setTitle('')
        setPreview('')
        setContentRaw('')
        setTag('')
        setLetterLocked(false)
        resetReasonForm()
        resetBaseReasonForm()
        resetBaseMonthlyForm()
        resetBaseOpenWhenForm()
        resetImportantDateForm()
        resetBaseImportantDateForm()
        resetFutureDreamForm()
        resetBaseFutureDreamForm()
        resetTimelineForm()
        resetBaseTimelineForm()
        resetBlackHoleForm()
        resetBaseBlackHoleForm()
        resetPlaylistForm()
        resetBasePlaylistForm()
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

  const resetReasonForm = () => {
    setReasonTitle('')
    setReasonText('')
    setEditingReasonId(null)
  }

  const resetBaseReasonForm = () => {
    setBaseReasonTitle('')
    setBaseReasonText('')
    setEditingBaseReasonId(null)
  }

  const resetPromiseForm = () => {
    setPromiseTitle('')
    setPromiseText('')
    setPromiseTag('')
    setEditingPromiseId(null)
  }

  const resetBasePromiseForm = () => {
    setBasePromiseTitle('')
    setBasePromiseText('')
    setBasePromiseTag('')
    setEditingBasePromiseId(null)
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

  const resetImportantDateForm = () => {
    setImportantDateDate('')
    setImportantDateTitle('')
    setImportantDateDescription('')
    setImportantDateTag('')
    setEditingImportantDateId(null)
  }

  const resetBaseImportantDateForm = () => {
    setBaseImportantDateDate('')
    setBaseImportantDateTitle('')
    setBaseImportantDateDescription('')
    setBaseImportantDateTag('')
    setEditingBaseImportantDateId(null)
  }

  const resetFutureDreamForm = () => {
    setFutureDreamCategory('')
    setFutureDreamTitle('')
    setFutureDreamDescription('')
    setEditingFutureDreamId(null)
  }

  const resetBaseFutureDreamForm = () => {
    setBaseFutureDreamCategory('')
    setBaseFutureDreamTitle('')
    setBaseFutureDreamDescription('')
    setEditingBaseFutureDreamId(null)
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
    return monthName ? `${day} de ${monthName}` : String(dateValue || '').trim()
  }

  const parseTimelineDateForInput = (dateValue) => {
    const rawValue = String(dateValue || '').trim()
    if (/^\d{4}-\d{2}-\d{2}$/.test(rawValue)) return rawValue

    const match = rawValue.toLowerCase().match(/(\d{1,2})\s+de\s+([a-záéíóúñ]+)(?:\s+de\s+(\d{4}))?/)
    if (!match) return ''

    const normalizedMonth = match[2].normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    const monthIndex = timelineMonthIndexes[normalizedMonth]
    if (monthIndex === undefined) return ''

    const year = Number(match[3]) || 2026
    const month = String(monthIndex + 1).padStart(2, '0')
    const day = String(Number(match[1])).padStart(2, '0')
    return `${year}-${month}-${day}`
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

  const resetPlaylistForm = () => {
    setPlaylistTitle('')
    setPlaylistArtist('')
    setPlaylistDescription('')
    setPlaylistSourceType('local')
    setPlaylistSrc('')
    setPlaylistLink('')
    setPlaylistTag('')
    setEditingPlaylistId(null)
  }

  const resetBasePlaylistForm = () => {
    setBasePlaylistTitle('')
    setBasePlaylistArtist('')
    setBasePlaylistDescription('')
    setBasePlaylistSourceType('local')
    setBasePlaylistSrc('')
    setBasePlaylistLink('')
    setBasePlaylistTag('')
    setEditingBasePlaylistId(null)
  }

  const handleBlackHoleImageFile = (event, target = 'local') => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    if (!file.type.startsWith('image/')) {
      const message = 'Selecciona un archivo de imagen valido.'
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
        setBaseBlackHoleImageStatus('Imagen cargada como respaldo local.')
      } else {
        setBlackHoleImage(result)
        setBlackHoleImageStatus('Imagen cargada como respaldo local.')
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

  const handleReasonSubmit = (event) => {
    event.preventDefault()

    if (!reasonTitle.trim() || !reasonText.trim()) {
      alert('Por favor, completa el titulo y el texto de la razon.')
      return
    }

    const now = new Date().toISOString()
    let updatedReasons

    if (editingReasonId) {
      updatedReasons = updateLocalItem('reasons', editingReasonId, {
        title: reasonTitle.trim(),
        text: reasonText.trim(),
        updatedAt: now
      })
    } else {
      updatedReasons = addLocalItem('reasons', {
        id: `local-reason-${Date.now()}`,
        title: reasonTitle.trim(),
        text: reasonText.trim(),
        createdAt: now
      })
    }

    setLocalReasons(updatedReasons)
    resetReasonForm()
    dispatchContentUpdate('reasons')
  }

  const handleReasonEdit = (reason) => {
    if (!reason.isLocal) return
    setActiveCrudAction('create')
    setEditingReasonId(reason.id)
    setReasonTitle(reason.title || '')
    setReasonText(reason.text || '')

    const formElement = document.getElementById('local-reasons-editor')
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const handleReasonDelete = (reason) => {
    if (!reason.isLocal) return

    if (window.confirm('¿Seguro que quieres eliminar esta razon local?')) {
      const updatedReasons = deleteLocalItem('reasons', reason.id)
      setLocalReasons(updatedReasons)

      if (editingReasonId === reason.id) {
        resetReasonForm()
      }

      dispatchContentUpdate('reasons')
    }
  }

  const handleBaseReasonEdit = (reason) => {
    setEditingBaseReasonId(reason.id)
    setBaseReasonTitle(reason.title || '')
    setBaseReasonText(reason.text || '')

    const formElement = document.getElementById('base-reasons-editor')
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const handleBaseReasonSubmit = (event) => {
    event.preventDefault()

    if (!editingBaseReasonId || !baseReasonTitle.trim() || !baseReasonText.trim()) {
      alert('Selecciona una razon original y completa titulo y texto.')
      return
    }

    const updatedOverrides = setLocalOverride('reasons', editingBaseReasonId, {
      title: baseReasonTitle.trim(),
      text: baseReasonText.trim(),
      updatedAt: new Date().toISOString()
    })

    setReasonOverrides(updatedOverrides)
    resetBaseReasonForm()
    dispatchContentUpdate('reasons')
  }

  const handleBaseReasonRestore = (reasonId) => {
    const updatedOverrides = deleteLocalOverride('reasons', reasonId)
    setReasonOverrides(updatedOverrides)

    if (String(editingBaseReasonId) === String(reasonId)) {
      resetBaseReasonForm()
    }

    dispatchContentUpdate('reasons')
  }

  const handleBaseReasonHide = (reason) => {
    if (
      window.confirm(
        '¿Seguro que quieres ocultar esta razon original? No se modificara el JSON y podras restaurarla despues.'
      )
    ) {
      const updatedHiddenIds = hideDefaultItem('reasons', reason.id)
      setHiddenReasonIds(updatedHiddenIds)

      if (String(editingBaseReasonId) === String(reason.id)) {
        resetBaseReasonForm()
      }

      dispatchContentUpdate('reasons')
    }
  }

  const handleBaseReasonUnhide = (reasonId) => {
    const updatedHiddenIds = restoreHiddenItem('reasons', reasonId)
    setHiddenReasonIds(updatedHiddenIds)
    dispatchContentUpdate('reasons')
  }

  const handlePromiseSubmit = (event) => {
    event.preventDefault()

    if (!promiseTitle.trim() || !promiseText.trim()) {
      alert('Por favor, completa titulo y texto de la promesa.')
      return
    }

    const patch = {
      title: promiseTitle.trim(),
      text: promiseText.trim(),
      description: promiseText.trim(),
      tag: promiseTag.trim() || 'Promesa',
      footer: promiseTag.trim() || 'Promesa',
      updatedAt: new Date().toISOString()
    }

    const updatedPromises = editingPromiseId
      ? updateLocalItem('promises', editingPromiseId, patch)
      : addLocalItem('promises', {
          id: `local-promise-${Date.now()}`,
          ...patch,
          createdAt: new Date().toISOString()
        })

    setLocalPromises(updatedPromises)
    resetPromiseForm()
    dispatchContentUpdate('promises')
  }

  const handlePromiseEdit = (promise) => {
    if (!promise.isLocal) return
    setActiveCrudAction('create')
    setEditingPromiseId(promise.id)
    setPromiseTitle(promise.title || '')
    setPromiseText(promise.text || promise.description || '')
    setPromiseTag(promise.tag || promise.footer || '')
  }

  const handlePromiseDelete = (promise) => {
    if (!promise.isLocal) return

    if (window.confirm('¿Seguro que quieres eliminar esta promesa local?')) {
      const updatedPromises = deleteLocalItem('promises', promise.id)
      setLocalPromises(updatedPromises)

      if (editingPromiseId === promise.id) {
        resetPromiseForm()
      }

      dispatchContentUpdate('promises')
    }
  }

  const handleBasePromiseEdit = (promise) => {
    setEditingBasePromiseId(promise.id)
    setBasePromiseTitle(promise.title || '')
    setBasePromiseText(promise.text || promise.description || '')
    setBasePromiseTag(promise.tag || promise.footer || '')
  }

  const handleBasePromiseSubmit = (event) => {
    event.preventDefault()

    if (!editingBasePromiseId || !basePromiseTitle.trim() || !basePromiseText.trim()) {
      alert('Selecciona una promesa base y completa titulo y texto.')
      return
    }

    const updatedOverrides = setLocalOverride('promises', editingBasePromiseId, {
      title: basePromiseTitle.trim(),
      text: basePromiseText.trim(),
      description: basePromiseText.trim(),
      tag: basePromiseTag.trim() || 'Promesa',
      footer: basePromiseTag.trim() || 'Promesa',
      updatedAt: new Date().toISOString()
    })

    setPromiseOverrides(updatedOverrides)
    resetBasePromiseForm()
    dispatchContentUpdate('promises')
  }

  const handleBasePromiseRestore = (promiseId) => {
    const updatedOverrides = deleteLocalOverride('promises', promiseId)
    setPromiseOverrides(updatedOverrides)

    if (String(editingBasePromiseId) === String(promiseId)) {
      resetBasePromiseForm()
    }

    dispatchContentUpdate('promises')
  }

  const handleBasePromiseHide = (promise) => {
    if (window.confirm('¿Seguro que quieres ocultar esta promesa base? Podras restaurarla despues.')) {
      const updatedHiddenIds = hideDefaultItem('promises', promise.id)
      setHiddenPromiseIds(updatedHiddenIds)

      if (String(editingBasePromiseId) === String(promise.id)) {
        resetBasePromiseForm()
      }

      dispatchContentUpdate('promises')
    }
  }

  const handleBasePromiseUnhide = (promiseId) => {
    const updatedHiddenIds = restoreHiddenItem('promises', promiseId)
    setHiddenPromiseIds(updatedHiddenIds)
    dispatchContentUpdate('promises')
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
  }

  const handleBaseMonthlyRestore = (letterId) => {
    const updatedOverrides = deleteLocalOverride('monthlyLetters', letterId)
    setMonthlyOverrides(updatedOverrides)

    if (String(editingBaseMonthlyId) === String(letterId)) {
      resetBaseMonthlyForm()
    }

    dispatchLettersUpdate('monthlyLetters')
  }

  const handleBaseMonthlyHide = (letter) => {
    if (window.confirm('¿Seguro que quieres ocultar esta carta mensual base? Podras restaurarla despues.')) {
      const updatedHiddenIds = hideDefaultItem('monthlyLetters', letter.id)
      setHiddenMonthlyIds(updatedHiddenIds)

      if (String(editingBaseMonthlyId) === String(letter.id)) {
        resetBaseMonthlyForm()
      }

      dispatchLettersUpdate('monthlyLetters')
    }
  }

  const handleBaseMonthlyUnhide = (letterId) => {
    const updatedHiddenIds = restoreHiddenItem('monthlyLetters', letterId)
    setHiddenMonthlyIds(updatedHiddenIds)
    dispatchLettersUpdate('monthlyLetters')
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
  }

  const handleBaseOpenWhenRestore = (cardId) => {
    const updatedOverrides = deleteLocalOverride('openWhenLetters', cardId)
    setOpenWhenOverrides(updatedOverrides)

    if (String(editingBaseOpenWhenId) === String(cardId)) {
      resetBaseOpenWhenForm()
    }

    dispatchLettersUpdate('openWhenLetters')
  }

  const handleBaseOpenWhenHide = (card) => {
    if (window.confirm('¿Seguro que quieres ocultar esta carta Abrir cuando base? Podras restaurarla despues.')) {
      const updatedHiddenIds = hideDefaultItem('openWhenLetters', card.id)
      setHiddenOpenWhenIds(updatedHiddenIds)

      if (String(editingBaseOpenWhenId) === String(card.id)) {
        resetBaseOpenWhenForm()
      }

      dispatchLettersUpdate('openWhenLetters')
    }
  }

  const handleBaseOpenWhenUnhide = (cardId) => {
    const updatedHiddenIds = restoreHiddenItem('openWhenLetters', cardId)
    setHiddenOpenWhenIds(updatedHiddenIds)
    dispatchLettersUpdate('openWhenLetters')
  }

  const handleImportantDateSubmit = (event) => {
    event.preventDefault()

    if (!importantDateDate.trim() || !importantDateTitle.trim() || !importantDateDescription.trim()) {
      alert('Por favor, completa fecha, titulo y descripcion.')
      return
    }

    const patch = {
      date: importantDateDate.trim(),
      title: importantDateTitle.trim(),
      description: importantDateDescription.trim(),
      tag: importantDateTag.trim() || 'Fecha importante',
      updatedAt: new Date().toISOString()
    }

    const updatedDates = editingImportantDateId
      ? updateLocalItem('importantDates', editingImportantDateId, patch)
      : addLocalItem('importantDates', {
          id: `local-date-${Date.now()}`,
          ...patch,
          createdAt: new Date().toISOString()
        })

    setLocalImportantDates(updatedDates)
    resetImportantDateForm()
    dispatchContentUpdate('importantDates')
  }

  const handleImportantDateEdit = (dateItem) => {
    if (!dateItem.isLocal) return
    setActiveCrudAction('create')
    setEditingImportantDateId(dateItem.id)
    setImportantDateDate(dateItem.date || '')
    setImportantDateTitle(dateItem.title || '')
    setImportantDateDescription(dateItem.description || '')
    setImportantDateTag(dateItem.tag || '')
  }

  const handleImportantDateDelete = (dateItem) => {
    if (!dateItem.isLocal) return

    if (window.confirm('¿Seguro que quieres eliminar esta fecha local?')) {
      const updatedDates = deleteLocalItem('importantDates', dateItem.id)
      setLocalImportantDates(updatedDates)

      if (editingImportantDateId === dateItem.id) {
        resetImportantDateForm()
      }

      dispatchContentUpdate('importantDates')
    }
  }

  const handleBaseImportantDateEdit = (dateItem) => {
    setEditingBaseImportantDateId(dateItem.id)
    setBaseImportantDateDate(dateItem.date || '')
    setBaseImportantDateTitle(dateItem.title || '')
    setBaseImportantDateDescription(dateItem.description || '')
    setBaseImportantDateTag(dateItem.tag || '')
  }

  const handleBaseImportantDateSubmit = (event) => {
    event.preventDefault()

    if (!editingBaseImportantDateId || !baseImportantDateDate.trim() || !baseImportantDateTitle.trim() || !baseImportantDateDescription.trim()) {
      alert('Selecciona una fecha base y completa fecha, titulo y descripcion.')
      return
    }

    const updatedOverrides = setLocalOverride('importantDates', editingBaseImportantDateId, {
      date: baseImportantDateDate.trim(),
      title: baseImportantDateTitle.trim(),
      description: baseImportantDateDescription.trim(),
      tag: baseImportantDateTag.trim() || 'Fecha importante',
      updatedAt: new Date().toISOString()
    })

    setImportantDateOverrides(updatedOverrides)
    resetBaseImportantDateForm()
    dispatchContentUpdate('importantDates')
  }

  const handleBaseImportantDateRestore = (dateId) => {
    const updatedOverrides = deleteLocalOverride('importantDates', dateId)
    setImportantDateOverrides(updatedOverrides)

    if (String(editingBaseImportantDateId) === String(dateId)) {
      resetBaseImportantDateForm()
    }

    dispatchContentUpdate('importantDates')
  }

  const handleBaseImportantDateHide = (dateItem) => {
    if (window.confirm('¿Seguro que quieres ocultar esta fecha base? Podras restaurarla despues.')) {
      const updatedHiddenIds = hideDefaultItem('importantDates', dateItem.id)
      setHiddenImportantDateIds(updatedHiddenIds)

      if (String(editingBaseImportantDateId) === String(dateItem.id)) {
        resetBaseImportantDateForm()
      }

      dispatchContentUpdate('importantDates')
    }
  }

  const handleBaseImportantDateUnhide = (dateId) => {
    const updatedHiddenIds = restoreHiddenItem('importantDates', dateId)
    setHiddenImportantDateIds(updatedHiddenIds)
    dispatchContentUpdate('importantDates')
  }

  const handleFutureDreamSubmit = (event) => {
    event.preventDefault()

    if (!futureDreamCategory.trim() || !futureDreamTitle.trim() || !futureDreamDescription.trim()) {
      alert('Por favor, completa categoria, titulo y descripcion.')
      return
    }

    const patch = {
      category: futureDreamCategory.trim(),
      title: futureDreamTitle.trim(),
      description: futureDreamDescription.trim(),
      updatedAt: new Date().toISOString()
    }

    const updatedDreams = editingFutureDreamId
      ? updateLocalItem('futureDreams', editingFutureDreamId, patch)
      : addLocalItem('futureDreams', {
          id: `local-dream-${Date.now()}`,
          ...patch,
          createdAt: new Date().toISOString()
        })

    setLocalFutureDreams(updatedDreams)
    resetFutureDreamForm()
    dispatchContentUpdate('futureDreams')
  }

  const handleFutureDreamEdit = (dream) => {
    if (!dream.isLocal) return
    setActiveCrudAction('create')
    setEditingFutureDreamId(dream.id)
    setFutureDreamCategory(dream.category || dream.tag || '')
    setFutureDreamTitle(dream.title || '')
    setFutureDreamDescription(dream.description || dream.text || '')
  }

  const handleFutureDreamDelete = (dream) => {
    if (!dream.isLocal) return

    if (window.confirm('¿Seguro que quieres eliminar este plan local?')) {
      const updatedDreams = deleteLocalItem('futureDreams', dream.id)
      setLocalFutureDreams(updatedDreams)

      if (editingFutureDreamId === dream.id) {
        resetFutureDreamForm()
      }

      dispatchContentUpdate('futureDreams')
    }
  }

  const handleBaseFutureDreamEdit = (dream) => {
    setEditingBaseFutureDreamId(dream.id)
    setBaseFutureDreamCategory(dream.category || dream.tag || '')
    setBaseFutureDreamTitle(dream.title || '')
    setBaseFutureDreamDescription(dream.description || dream.text || '')
  }

  const handleBaseFutureDreamSubmit = (event) => {
    event.preventDefault()

    if (!editingBaseFutureDreamId || !baseFutureDreamCategory.trim() || !baseFutureDreamTitle.trim() || !baseFutureDreamDescription.trim()) {
      alert('Selecciona un plan base y completa categoria, titulo y descripcion.')
      return
    }

    const updatedOverrides = setLocalOverride('futureDreams', editingBaseFutureDreamId, {
      category: baseFutureDreamCategory.trim(),
      title: baseFutureDreamTitle.trim(),
      description: baseFutureDreamDescription.trim(),
      updatedAt: new Date().toISOString()
    })

    setFutureDreamOverrides(updatedOverrides)
    resetBaseFutureDreamForm()
    dispatchContentUpdate('futureDreams')
  }

  const handleBaseFutureDreamRestore = (dreamId) => {
    const updatedOverrides = deleteLocalOverride('futureDreams', dreamId)
    setFutureDreamOverrides(updatedOverrides)

    if (String(editingBaseFutureDreamId) === String(dreamId)) {
      resetBaseFutureDreamForm()
    }

    dispatchContentUpdate('futureDreams')
  }

  const handleBaseFutureDreamHide = (dream) => {
    if (window.confirm('¿Seguro que quieres ocultar este plan base? Podras restaurarlo despues.')) {
      const updatedHiddenIds = hideDefaultItem('futureDreams', dream.id)
      setHiddenFutureDreamIds(updatedHiddenIds)

      if (String(editingBaseFutureDreamId) === String(dream.id)) {
        resetBaseFutureDreamForm()
      }

      dispatchContentUpdate('futureDreams')
    }
  }

  const handleBaseFutureDreamUnhide = (dreamId) => {
    const updatedHiddenIds = restoreHiddenItem('futureDreams', dreamId)
    setHiddenFutureDreamIds(updatedHiddenIds)
    dispatchContentUpdate('futureDreams')
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
    date: formatTimelineDateForDisplay(date),
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

    if (window.confirm('Â¿Seguro que quieres eliminar esta pagina local del diario?')) {
      const updatedPages = deleteLocalItem('timeline', page.id)
      setLocalTimelinePages(updatedPages)

      if (editingTimelineId === page.id) {
        resetTimelineForm()
      }

      dispatchContentUpdate('timeline')
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
      alert('Selecciona una pagina base y completa capitulo, fecha, titulo y descripcion.')
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
  }

  const handleBaseTimelineRestore = (pageId) => {
    const updatedOverrides = deleteLocalOverride('timeline', pageId)
    setTimelineOverrides(updatedOverrides)

    if (String(editingBaseTimelineId) === String(pageId)) {
      resetBaseTimelineForm()
    }

    dispatchContentUpdate('timeline')
  }

  const handleBaseTimelineHide = (page) => {
    if (window.confirm('Â¿Seguro que quieres ocultar esta pagina base del diario? Podras restaurarla despues.')) {
      const updatedHiddenIds = hideDefaultItem('timeline', page.id)
      setHiddenTimelineIds(updatedHiddenIds)

      if (String(editingBaseTimelineId) === String(page.id)) {
        resetBaseTimelineForm()
      }

      dispatchContentUpdate('timeline')
    }
  }

  const handleBaseTimelineUnhide = (pageId) => {
    const updatedHiddenIds = restoreHiddenItem('timeline', pageId)
    setHiddenTimelineIds(updatedHiddenIds)
    dispatchContentUpdate('timeline')
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

    if (window.confirm('Â¿Seguro que quieres eliminar este recuerdo local?')) {
      const updatedItems = deleteLocalItem('blackHoleGallery', item.id)
      setLocalBlackHoleGallery(updatedItems)

      if (editingBlackHoleId === item.id) {
        resetBlackHoleForm()
      }

      dispatchContentUpdate('blackHoleGallery')
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
  }

  const handleBaseBlackHoleRestore = (itemId) => {
    const updatedOverrides = deleteLocalOverride('blackHoleGallery', itemId)
    setBlackHoleGalleryOverrides(updatedOverrides)

    if (String(editingBaseBlackHoleId) === String(itemId)) {
      resetBaseBlackHoleForm()
    }

    dispatchContentUpdate('blackHoleGallery')
  }

  const handleBaseBlackHoleHide = (item) => {
    if (window.confirm('Â¿Seguro que quieres ocultar este recuerdo base? Podras restaurarlo despues.')) {
      const updatedHiddenIds = hideDefaultItem('blackHoleGallery', item.id)
      setHiddenBlackHoleGalleryIds(updatedHiddenIds)

      if (String(editingBaseBlackHoleId) === String(item.id)) {
        resetBaseBlackHoleForm()
      }

      dispatchContentUpdate('blackHoleGallery')
    }
  }

  const handleBaseBlackHoleUnhide = (itemId) => {
    const updatedHiddenIds = restoreHiddenItem('blackHoleGallery', itemId)
    setHiddenBlackHoleGalleryIds(updatedHiddenIds)
    dispatchContentUpdate('blackHoleGallery')
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

  const handlePlaylistSubmit = (event) => {
    event.preventDefault()

    if (!isPlaylistFormValid({
      title: playlistTitle,
      description: playlistDescription,
      sourceType: playlistSourceType,
      src: playlistSrc,
      link: playlistLink
    })) {
      alert('Completa titulo, descripcion y la ruta/enlace segun el tipo de cancion.')
      return
    }

    const patch = buildPlaylistPatch({
      title: playlistTitle,
      artist: playlistArtist,
      description: playlistDescription,
      sourceType: playlistSourceType,
      src: playlistSrc,
      link: playlistLink,
      tag: playlistTag
    })

    const updatedItems = editingPlaylistId
      ? updateLocalItem('playlist', editingPlaylistId, patch)
      : addLocalItem('playlist', {
          id: `local-playlist-${Date.now()}`,
          ...patch,
          createdAt: new Date().toISOString()
        })

    setLocalPlaylist(updatedItems)
    resetPlaylistForm()
    dispatchContentUpdate('playlist')
  }

  const handlePlaylistEdit = (item) => {
    if (!item.isLocal) return
    setActiveCrudAction('create')
    setEditingPlaylistId(item.id)
    setPlaylistTitle(item.title || '')
    setPlaylistArtist(item.artist || '')
    setPlaylistDescription(item.description || '')
    setPlaylistSourceType(item.sourceType === 'external' ? 'external' : 'local')
    setPlaylistSrc(item.src || '')
    setPlaylistLink(item.link || '')
    setPlaylistTag(item.tag || '')
  }

  const handlePlaylistDelete = (item) => {
    if (!item.isLocal) return

    if (window.confirm('Â¿Seguro que quieres eliminar esta cancion local?')) {
      const updatedItems = deleteLocalItem('playlist', item.id)
      setLocalPlaylist(updatedItems)

      if (editingPlaylistId === item.id) {
        resetPlaylistForm()
      }

      dispatchContentUpdate('playlist')
    }
  }

  const handleBasePlaylistEdit = (item) => {
    setEditingBasePlaylistId(item.id)
    setBasePlaylistTitle(item.title || '')
    setBasePlaylistArtist(item.artist || '')
    setBasePlaylistDescription(item.description || '')
    setBasePlaylistSourceType(item.sourceType === 'external' ? 'external' : 'local')
    setBasePlaylistSrc(item.src || '')
    setBasePlaylistLink(item.link || '')
    setBasePlaylistTag(item.tag || '')
  }

  const handleBasePlaylistSubmit = (event) => {
    event.preventDefault()

    if (!editingBasePlaylistId || !isPlaylistFormValid({
      title: basePlaylistTitle,
      description: basePlaylistDescription,
      sourceType: basePlaylistSourceType,
      src: basePlaylistSrc,
      link: basePlaylistLink
    })) {
      alert('Selecciona una cancion base y completa titulo, descripcion y ruta/enlace segun el tipo.')
      return
    }

    const updatedOverrides = setLocalOverride('playlist', editingBasePlaylistId, buildPlaylistPatch({
      title: basePlaylistTitle,
      artist: basePlaylistArtist,
      description: basePlaylistDescription,
      sourceType: basePlaylistSourceType,
      src: basePlaylistSrc,
      link: basePlaylistLink,
      tag: basePlaylistTag
    }))

    setPlaylistOverrides(updatedOverrides)
    resetBasePlaylistForm()
    dispatchContentUpdate('playlist')
  }

  const handleBasePlaylistRestore = (itemId) => {
    const updatedOverrides = deleteLocalOverride('playlist', itemId)
    setPlaylistOverrides(updatedOverrides)

    if (String(editingBasePlaylistId) === String(itemId)) {
      resetBasePlaylistForm()
    }

    dispatchContentUpdate('playlist')
  }

  const handleBasePlaylistHide = (item) => {
    if (window.confirm('Â¿Seguro que quieres ocultar esta cancion base? Podras restaurarla despues.')) {
      const updatedHiddenIds = hideDefaultItem('playlist', item.id)
      setHiddenPlaylistIds(updatedHiddenIds)

      if (String(editingBasePlaylistId) === String(item.id)) {
        resetBasePlaylistForm()
      }

      dispatchContentUpdate('playlist')
    }
  }

  const handleBasePlaylistUnhide = (itemId) => {
    const updatedHiddenIds = restoreHiddenItem('playlist', itemId)
    setHiddenPlaylistIds(updatedHiddenIds)
    dispatchContentUpdate('playlist')
  }

  const handleReset = () => {
    if (
      window.confirm(
        '¿Seguro que quieres borrar el progreso de lectura de las cartas? Esto no afectará las cartas creadas localmente ni la música.'
      )
    ) {
      // Clear progress keys for JSON letters
      monthlyLettersData.forEach((l) => {
        localStorage.removeItem(`distancia-cero-monthly-letter-${l.id}`)
      })
      mappedOpenWhen.forEach((c) => {
        localStorage.removeItem(`distancia-cero-open-when-${c.id}`)
      })
      // Clear progress keys for Local letters
      localMonthly.forEach((l) => {
        localStorage.removeItem(`distancia-cero-monthly-letter-${l.id}`)
      })
      localOpenWhen.forEach((c) => {
        localStorage.removeItem(`distancia-cero-open-when-${c.id}`)
      })
      localStorage.removeItem('distancia-cero-sim-unlocked')
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

    const isMonthly = letterType === 'monthly'
    const storageKey = isMonthly
      ? 'distancia-cero-local-monthly-letters'
      : 'distancia-cero-local-open-when'
    const currentList = isMonthly ? localMonthly : localOpenWhen

    let updatedList
    if (editingId) {
      // Edit mode
      updatedList = currentList.map((item) => {
        if (item.id === editingId) {
          return {
            ...item,
            title: title.trim(),
            preview: preview.trim(),
            content: contentArray,
            locked: letterLocked,
            month: isMonthly ? (tag.trim() || 'Carta local') : undefined,
            mood: !isMonthly ? (tag.trim() || 'Abrir cuando...') : undefined,
          }
        }
        return item
      })
      setEditingId(null)
    } else {
      // Create mode
      const newItem = {
        id: `local-${Date.now()}`,
        title: title.trim(),
        preview: preview.trim(),
        content: contentArray,
        locked: letterLocked,
        isLocal: true,
        month: isMonthly ? (tag.trim() || 'Carta local') : undefined,
        mood: !isMonthly ? (tag.trim() || 'Abrir cuando...') : undefined,
        url: isMonthly ? `/local-letter/${Date.now()}` : `/local-open-when/${Date.now()}`
      }
      updatedList = [...currentList, newItem]
    }

    localStorage.setItem(storageKey, JSON.stringify(updatedList))
    if (isMonthly) {
      setLocalMonthly(updatedList)
      dispatchLettersUpdate('monthlyLetters')
    } else {
      setLocalOpenWhen(updatedList)
      dispatchLettersUpdate('openWhenLetters')
    }

    // Reset Form
    setTitle('')
    setPreview('')
    setContentRaw('')
    setTag('')
    setLetterLocked(false)
    alert('Carta local guardada con éxito. Compruébala en su respectiva sección.')
  }

  const handleEdit = (item, type) => {
    setActiveCrudAction('create')
    setLetterType(type)
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
    if (window.confirm('¿Seguro que quieres eliminar esta carta local?')) {
      const isMonthly = type === 'monthly'
      const storageKey = isMonthly
        ? 'distancia-cero-local-monthly-letters'
        : 'distancia-cero-local-open-when'
      const currentList = isMonthly ? localMonthly : localOpenWhen
      const updatedList = currentList.filter((item) => item.id !== id)

      localStorage.setItem(storageKey, JSON.stringify(updatedList))
      if (isMonthly) {
        setLocalMonthly(updatedList)
        dispatchLettersUpdate('monthlyLetters')
      } else {
        setLocalOpenWhen(updatedList)
        dispatchLettersUpdate('openWhenLetters')
      }

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
    setLetterType(nextModule === 'openWhenLetters' ? 'openwhen' : 'monthly')
    resetReasonForm()
    resetBaseReasonForm()
    resetPromiseForm()
    resetBasePromiseForm()
    resetBaseMonthlyForm()
    resetBaseOpenWhenForm()
    resetImportantDateForm()
    resetBaseImportantDateForm()
    resetFutureDreamForm()
    resetBaseFutureDreamForm()
    resetTimelineForm()
    resetBaseTimelineForm()
    resetBlackHoleForm()
    resetBaseBlackHoleForm()
    resetPlaylistForm()
    resetBasePlaylistForm()
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
        text="Rinconcito de administración local y depuración para Diego & Ale."
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
              <span className="stat-label">Total (Base + Local)</span>
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
              <span className="stat-label">Total (Base + Local)</span>
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

      {/* Local letters backup */}
      <div className="backup-card">
        <div className="backup-header">
          <h3>Respaldo local del universo</h3>
          <p>Exporta o restaura cartas locales, ediciones de cartas mensuales, razones, promesas y elementos ocultos.</p>
        </div>

        <div className="backup-actions">
          <button className="control-btn backup-export-btn" onClick={handleExportLocalLetters} type="button">
            <Download size={18} />
            Exportar respaldo local
          </button>

          <label className="control-btn backup-import-label" htmlFor="localLettersImport">
            <Upload size={18} />
            Importar respaldo local
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
            <CrudStatButton filter="base" value={getNormalBaseCount(visibleBaseMonthly)} label="Base" />
            <CrudStatButton filter="edited" value={editedBaseMonthlyCount} label="Editadas" />
            <CrudStatButton filter="hidden" value={hiddenBaseMonthlyCount} label="Ocultas" />
            <CrudStatButton filter="local" value={localMonthly.length} label="Locales" />
          </div>

          <div className="editor-warning">
            <AlertTriangle size={15} />
            <span>Estas ediciones son overrides locales; el JSON original no se modifica.</span>
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
                    {letter.isHidden ? 'Oculta localmente' : letter.isOverridden ? 'Editada localmente' : letter.locked ? 'Base bloqueada' : 'Base disponible'}
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
            <CrudStatButton filter="base" value={getNormalBaseCount(visibleBaseOpenWhen)} label="Base" />
            <CrudStatButton filter="edited" value={editedBaseOpenWhenCount} label="Editadas" />
            <CrudStatButton filter="hidden" value={hiddenBaseOpenWhenCount} label="Ocultas" />
            <CrudStatButton filter="local" value={localOpenWhen.length} label="Locales" />
          </div>

          <div className="editor-warning">
            <AlertTriangle size={15} />
            <span>Estas ediciones son overrides locales; el JSON original no se modifica.</span>
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
                    {card.isHidden ? 'Oculta localmente' : card.isOverridden ? 'Editada localmente' : card.locked ? 'Base bloqueada' : 'Base disponible'}
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

      {/* Local reasons CRUD editor */}
      <div className={`local-reasons-editor ${activeCrudModule === 'reasons' && ['local', 'create'].includes(activeCrudAction) ? `crud-show-${activeCrudAction}` : 'crud-panel-hidden'}`} id="local-reasons-editor">
        <div className="reasons-editor-card">
          <div className="crud-subsection-title">Crear nueva</div>
          <h3>
            <Plus size={18} />
            Editor local de 100 razones
          </h3>

          <div className="editor-warning">
            <AlertTriangle size={15} />
            <span>
              <strong>Aviso de pruebas</strong>: Estas razones son locales y de prueba; las razones originales no se modifican.
            </span>
          </div>

          <form className="editor-form" onSubmit={handleReasonSubmit}>
            <div className="editor-field">
              <label htmlFor="reasonTitle">Titulo de la razon *</label>
              <input
                id="reasonTitle"
                type="text"
                placeholder="Ej. Razon 101"
                value={reasonTitle}
                onChange={(event) => setReasonTitle(event.target.value)}
                required
              />
            </div>

            <div className="editor-field">
              <label htmlFor="reasonText">Texto de la razon *</label>
              <textarea
                id="reasonText"
                rows="4"
                placeholder="Escribe una nueva razon local para que flote en la seccion."
                value={reasonText}
                onChange={(event) => setReasonText(event.target.value)}
                required
              ></textarea>
            </div>

            <div className="form-actions">
              {editingReasonId && (
                <button type="button" className="ghost-button cancel-btn" onClick={resetReasonForm}>
                  Cancelar
                </button>
              )}

              <button type="submit" className="control-btn submit-btn">
                {editingReasonId ? 'Actualizar razon local' : 'Guardar razon local'}
              </button>
            </div>
          </form>
        </div>

        <div className="reasons-list-card">
          <div className="crud-subsection-title">Creadas por ti</div>
          <div className="reasons-list-header">
            <h3>Razones locales actuales</h3>
            <span>{localReasons.length} locales</span>
          </div>

          {localReasons.length === 0 ? (
            <p className="no-items">No hay razones locales creadas.</p>
          ) : (
            <div className="reason-items-list">
              {localReasons.map((reason) => (
                <div className="reason-item-row" key={reason.id}>
                  <div className="item-info">
                    <strong>{reason.title}</strong>
                    <span>{reason.text}</span>
                  </div>

                  <div className="item-actions">
                    <button
                      type="button"
                      className="action-icon-btn edit"
                      onClick={() => handleReasonEdit(reason)}
                      title="Editar razon local"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      type="button"
                      className="action-icon-btn delete"
                      onClick={() => handleReasonDelete(reason)}
                      title="Eliminar razon local"
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

      <div className={`base-reasons-editor ${activeCrudModule === 'reasons' && activeCrudAction === 'originals' ? '' : 'crud-panel-hidden'}`} id="base-reasons-editor">
        <div className="base-reasons-panel">
          <div className="crud-subsection-title">Originales / editadas / ocultas</div>
          <div className="reasons-list-header">
            <h3>Razones originales</h3>
            <span>{reasonsData.length} base</span>
          </div>

          <div className="reason-stats-grid">
            <CrudStatButton filter="base" value={getNormalBaseCount(visibleBaseReasons)} label="Base" />
            <CrudStatButton filter="edited" value={editedBaseReasonsCount} label="Editadas" />
            <CrudStatButton filter="hidden" value={hiddenBaseReasonsCount} label="Ocultas" />
            <CrudStatButton filter="local" value={localReasons.length} label="Locales" />
          </div>

          <div className="editor-field">
            <label htmlFor="baseReasonSearch">Buscar razon original</label>
            <input
              id="baseReasonSearch"
              type="text"
              placeholder="Busca por numero, titulo o texto"
              value={baseReasonQuery}
              onChange={(event) => setBaseReasonQuery(event.target.value)}
            />
          </div>

          <div className="base-reasons-list">
            {filteredVisibleBaseReasons.length === 0 ? (
              <p className="no-items">No hay elementos en este filtro.</p>
            ) : filteredVisibleBaseReasons.map((reason) => (
              <div
                className={`base-reason-row ${reason.isOverridden ? 'is-overridden' : ''} ${reason.isHidden ? 'is-hidden' : ''}`}
                key={reason.id}
              >
                <div className="base-reason-copy">
                  <strong>
                    #{reason.id} {reason.title}
                  </strong>
                  <span>{reason.text}</span>
                  <small>
                    {reason.isHidden ? 'Oculta localmente' : reason.isOverridden ? 'Editada localmente' : 'Original'}
                  </small>
                </div>

                <div className="base-reason-actions">
                  <button type="button" className="ghost-button" onClick={() => handleBaseReasonEdit(reason)}>
                    <Edit2 size={14} />
                    Editar
                  </button>

                  {reason.isOverridden && (
                    <button type="button" className="ghost-button" onClick={() => handleBaseReasonRestore(reason.id)}>
                      Restaurar
                    </button>
                  )}

                  {reason.isHidden ? (
                    <button type="button" className="ghost-button" onClick={() => handleBaseReasonUnhide(reason.id)}>
                      Mostrar
                    </button>
                  ) : (
                    <button type="button" className="ghost-button danger-action" onClick={() => handleBaseReasonHide(reason)}>
                      Ocultar
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="base-reasons-panel">
          <div className="crud-subsection-title">Editar original</div>
          <h3>
            <Edit2 size={18} />
            {editingBaseReasonId ? `Editando razon #${editingBaseReasonId}` : 'Editar razon original'}
          </h3>

          <div className="editor-warning">
            <AlertTriangle size={15} />
            <span>
              <strong>Override local</strong>: Esto no modifica reasons.json; solo guarda una version local en este navegador.
            </span>
          </div>

          <form className="editor-form" onSubmit={handleBaseReasonSubmit}>
            <div className="editor-field">
              <label htmlFor="baseReasonTitle">Titulo override *</label>
              <input
                id="baseReasonTitle"
                type="text"
                value={baseReasonTitle}
                onChange={(event) => setBaseReasonTitle(event.target.value)}
                disabled={!editingBaseReasonId}
                required
              />
            </div>

            <div className="editor-field">
              <label htmlFor="baseReasonText">Texto override *</label>
              <textarea
                id="baseReasonText"
                rows="5"
                value={baseReasonText}
                onChange={(event) => setBaseReasonText(event.target.value)}
                disabled={!editingBaseReasonId}
                required
              ></textarea>
            </div>

            <div className="form-actions">
              {editingBaseReasonId && (
                <button type="button" className="ghost-button cancel-btn" onClick={resetBaseReasonForm}>
                  Cancelar
                </button>
              )}

              <button type="submit" className="control-btn submit-btn" disabled={!editingBaseReasonId}>
                Guardar override
              </button>
            </div>
          </form>

          {hiddenBaseReasonsCount > 0 && (
            <div className="hidden-reasons-box">
              <h4>Razones ocultas</h4>
              {visibleBaseReasons.filter((reason) => reason.isHidden).map((reason) => (
                <button type="button" className="ghost-button" key={reason.id} onClick={() => handleBaseReasonUnhide(reason.id)}>
                  Mostrar #{reason.id}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className={`base-dates-editor ${activeCrudModule === 'importantDates' && activeCrudAction === 'originals' ? '' : 'crud-panel-hidden'}`} id="base-dates-editor">
        <div className="base-reasons-panel">
          <div className="crud-subsection-title">Originales / editadas / ocultas</div>
          <div className="reasons-list-header">
            <h3>Fechas importantes originales</h3>
            <span>{importantDatesData.length} base</span>
          </div>

          <div className="reason-stats-grid">
            <CrudStatButton filter="base" value={getNormalBaseCount(visibleBaseImportantDates)} label="Base" />
            <CrudStatButton filter="edited" value={editedBaseImportantDatesCount} label="Editadas" />
            <CrudStatButton filter="hidden" value={hiddenBaseImportantDatesCount} label="Ocultas" />
            <CrudStatButton filter="local" value={localImportantDates.length} label="Locales" />
          </div>

          <div className="base-reasons-list">
            {filteredBaseImportantDates.length === 0 ? (
              <p className="no-items">No hay elementos en este filtro.</p>
            ) : filteredBaseImportantDates.map((dateItem) => (
              <div
                className={`base-reason-row ${dateItem.isOverridden ? 'is-overridden' : ''} ${dateItem.isHidden ? 'is-hidden' : ''}`}
                key={dateItem.id}
              >
                <div className="base-reason-copy">
                  <strong>{dateItem.date} · {dateItem.title}</strong>
                  <span>{dateItem.description}</span>
                  <small>{dateItem.isHidden ? 'Oculta localmente' : dateItem.isOverridden ? 'Editada localmente' : dateItem.tag}</small>
                </div>

                <div className="base-reason-actions">
                  <button type="button" className="ghost-button" onClick={() => handleBaseImportantDateEdit(dateItem)}>
                    Editar
                  </button>

                  {dateItem.isOverridden && (
                    <button type="button" className="ghost-button" onClick={() => handleBaseImportantDateRestore(dateItem.id)}>
                      Restaurar
                    </button>
                  )}

                  {dateItem.isHidden ? (
                    <button type="button" className="ghost-button" onClick={() => handleBaseImportantDateUnhide(dateItem.id)}>
                      Mostrar
                    </button>
                  ) : (
                    <button type="button" className="ghost-button danger-action" onClick={() => handleBaseImportantDateHide(dateItem)}>
                      Ocultar
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {hiddenBaseImportantDatesCount > 0 && (
            <div className="hidden-reasons-box">
              <h4>Fechas ocultas</h4>
              {visibleBaseImportantDates.filter((dateItem) => dateItem.isHidden).map((dateItem) => (
                <button type="button" className="ghost-button" key={dateItem.id} onClick={() => handleBaseImportantDateUnhide(dateItem.id)}>
                  Mostrar {dateItem.date}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="base-reasons-panel">
          <div className="crud-subsection-title">Editar original</div>
          <h3>
            <Edit2 size={18} />
            Override de fecha importante
          </h3>

          <form className="editor-form" onSubmit={handleBaseImportantDateSubmit}>
            <div className="editor-field">
              <label htmlFor="baseImportantDateDate">Fecha *</label>
              <input
                id="baseImportantDateDate"
                type="text"
                value={baseImportantDateDate}
                onChange={(event) => setBaseImportantDateDate(event.target.value)}
                disabled={!editingBaseImportantDateId}
                required
              />
            </div>

            <div className="editor-field">
              <label htmlFor="baseImportantDateTitle">Titulo override *</label>
              <input
                id="baseImportantDateTitle"
                type="text"
                value={baseImportantDateTitle}
                onChange={(event) => setBaseImportantDateTitle(event.target.value)}
                disabled={!editingBaseImportantDateId}
                required
              />
            </div>

            <div className="editor-field">
              <label htmlFor="baseImportantDateDescription">Descripcion override *</label>
              <textarea
                id="baseImportantDateDescription"
                rows="5"
                value={baseImportantDateDescription}
                onChange={(event) => setBaseImportantDateDescription(event.target.value)}
                disabled={!editingBaseImportantDateId}
                required
              ></textarea>
            </div>

            <div className="editor-field">
              <label htmlFor="baseImportantDateTag">Etiqueta override</label>
              <input
                id="baseImportantDateTag"
                type="text"
                value={baseImportantDateTag}
                onChange={(event) => setBaseImportantDateTag(event.target.value)}
                disabled={!editingBaseImportantDateId}
              />
            </div>

            <div className="form-actions">
              {editingBaseImportantDateId && (
                <button type="button" className="ghost-button cancel-btn" onClick={resetBaseImportantDateForm}>
                  Cancelar
                </button>
              )}
              <button type="submit" className="control-btn submit-btn" disabled={!editingBaseImportantDateId}>
                Guardar override
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className={`local-dates-editor ${activeCrudModule === 'importantDates' && ['local', 'create'].includes(activeCrudAction) ? `crud-show-${activeCrudAction}` : 'crud-panel-hidden'}`} id="local-dates-editor">
        <div className="reasons-editor-card">
          <div className="crud-subsection-title">Crear nueva</div>
          <h3>
            <Plus size={18} />
            Editor local de fechas importantes
          </h3>

          <div className="editor-warning">
            <AlertTriangle size={15} />
            <span>Estas fechas son locales; el JSON original no se modifica.</span>
          </div>

          <form className="editor-form" onSubmit={handleImportantDateSubmit}>
            <div className="editor-field">
              <label htmlFor="importantDateDate">Fecha *</label>
              <input
                id="importantDateDate"
                type="text"
                placeholder="Ej. 17 May"
                value={importantDateDate}
                onChange={(event) => setImportantDateDate(event.target.value)}
                required
              />
            </div>

            <div className="editor-field">
              <label htmlFor="importantDateTitle">Titulo *</label>
              <input
                id="importantDateTitle"
                type="text"
                placeholder="Ej. Nuestro aniversario"
                value={importantDateTitle}
                onChange={(event) => setImportantDateTitle(event.target.value)}
                required
              />
            </div>

            <div className="editor-field">
              <label htmlFor="importantDateDescription">Descripcion *</label>
              <textarea
                id="importantDateDescription"
                rows="4"
                placeholder="Ej. El día en que empezó oficialmente esta historia bonita."
                value={importantDateDescription}
                onChange={(event) => setImportantDateDescription(event.target.value)}
                required
              ></textarea>
            </div>

            <div className="editor-field">
              <label htmlFor="importantDateTag">Etiqueta</label>
              <input
                id="importantDateTag"
                type="text"
                placeholder="Ej. Nuestra fecha"
                value={importantDateTag}
                onChange={(event) => setImportantDateTag(event.target.value)}
              />
            </div>

            <div className="form-actions">
              {editingImportantDateId && (
                <button type="button" className="ghost-button cancel-btn" onClick={resetImportantDateForm}>
                  Cancelar
                </button>
              )}
              <button type="submit" className="control-btn submit-btn">
                {editingImportantDateId ? 'Actualizar fecha local' : 'Guardar fecha local'}
              </button>
            </div>
          </form>
        </div>

        <div className="reasons-list-card">
          <div className="crud-subsection-title">Creadas por ti</div>
          <div className="reasons-list-header">
            <h3>Fechas locales</h3>
            <span>{localImportantDates.length} locales</span>
          </div>

          {localImportantDates.length === 0 ? (
            <p className="no-items">No hay fechas locales creadas.</p>
          ) : (
            <div className="reason-items-list">
              {localImportantDates.map((dateItem) => (
                <div className="reason-item-row" key={dateItem.id}>
                  <div className="item-info">
                    <strong>{dateItem.date} · {dateItem.title}</strong>
                    <span>{dateItem.description}</span>
                  </div>

                  <div className="item-actions">
                    <button
                      type="button"
                      className="action-icon-btn edit"
                      onClick={() => handleImportantDateEdit(dateItem)}
                      title="Editar fecha local"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      type="button"
                      className="action-icon-btn delete"
                      onClick={() => handleImportantDateDelete(dateItem)}
                      title="Eliminar fecha local"
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

      <div className={`base-dreams-editor ${activeCrudModule === 'futureDreams' && activeCrudAction === 'originals' ? '' : 'crud-panel-hidden'}`} id="base-dreams-editor">
        <div className="base-reasons-panel">
          <div className="crud-subsection-title">Originales / editadas / ocultas</div>
          <div className="reasons-list-header">
            <h3>Wishlist original</h3>
            <span>{futureDreamsData.length} base</span>
          </div>

          <div className="reason-stats-grid">
            <CrudStatButton filter="base" value={getNormalBaseCount(visibleBaseFutureDreams)} label="Base" />
            <CrudStatButton filter="edited" value={editedBaseFutureDreamsCount} label="Editadas" />
            <CrudStatButton filter="hidden" value={hiddenBaseFutureDreamsCount} label="Ocultas" />
            <CrudStatButton filter="local" value={localFutureDreams.length} label="Locales" />
          </div>

          <div className="base-reasons-list">
            {filteredBaseFutureDreams.length === 0 ? (
              <p className="no-items">No hay elementos en este filtro.</p>
            ) : filteredBaseFutureDreams.map((dream) => (
              <div
                className={`base-reason-row ${dream.isOverridden ? 'is-overridden' : ''} ${dream.isHidden ? 'is-hidden' : ''}`}
                key={dream.id}
              >
                <div className="base-reason-copy">
                  <strong>{dream.category} · {dream.title}</strong>
                  <span>{dream.description}</span>
                  <small>{dream.isHidden ? 'Oculto localmente' : dream.isOverridden ? 'Editado localmente' : 'Original'}</small>
                </div>

                <div className="base-reason-actions">
                  <button type="button" className="ghost-button" onClick={() => handleBaseFutureDreamEdit(dream)}>
                    Editar
                  </button>

                  {dream.isOverridden && (
                    <button type="button" className="ghost-button" onClick={() => handleBaseFutureDreamRestore(dream.id)}>
                      Restaurar
                    </button>
                  )}

                  {dream.isHidden ? (
                    <button type="button" className="ghost-button" onClick={() => handleBaseFutureDreamUnhide(dream.id)}>
                      Mostrar
                    </button>
                  ) : (
                    <button type="button" className="ghost-button danger-action" onClick={() => handleBaseFutureDreamHide(dream)}>
                      Ocultar
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {hiddenBaseFutureDreamsCount > 0 && (
            <div className="hidden-reasons-box">
              <h4>Planes ocultos</h4>
              {visibleBaseFutureDreams.filter((dream) => dream.isHidden).map((dream) => (
                <button type="button" className="ghost-button" key={dream.id} onClick={() => handleBaseFutureDreamUnhide(dream.id)}>
                  Mostrar {dream.title}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="base-reasons-panel">
          <div className="crud-subsection-title">Editar original</div>
          <h3>
            <Edit2 size={18} />
            Override de Wishlist
          </h3>

          <form className="editor-form" onSubmit={handleBaseFutureDreamSubmit}>
            <div className="editor-field">
              <label htmlFor="baseFutureDreamCategory">Categoria *</label>
              <input
                id="baseFutureDreamCategory"
                type="text"
                value={baseFutureDreamCategory}
                onChange={(event) => setBaseFutureDreamCategory(event.target.value)}
                disabled={!editingBaseFutureDreamId}
                required
              />
            </div>

            <div className="editor-field">
              <label htmlFor="baseFutureDreamTitle">Titulo override *</label>
              <input
                id="baseFutureDreamTitle"
                type="text"
                value={baseFutureDreamTitle}
                onChange={(event) => setBaseFutureDreamTitle(event.target.value)}
                disabled={!editingBaseFutureDreamId}
                required
              />
            </div>

            <div className="editor-field">
              <label htmlFor="baseFutureDreamDescription">Descripcion override *</label>
              <textarea
                id="baseFutureDreamDescription"
                rows="5"
                value={baseFutureDreamDescription}
                onChange={(event) => setBaseFutureDreamDescription(event.target.value)}
                disabled={!editingBaseFutureDreamId}
                required
              ></textarea>
            </div>

            <div className="form-actions">
              {editingBaseFutureDreamId && (
                <button type="button" className="ghost-button cancel-btn" onClick={resetBaseFutureDreamForm}>
                  Cancelar
                </button>
              )}
              <button type="submit" className="control-btn submit-btn" disabled={!editingBaseFutureDreamId}>
                Guardar override
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className={`local-dreams-editor ${activeCrudModule === 'futureDreams' && ['local', 'create'].includes(activeCrudAction) ? `crud-show-${activeCrudAction}` : 'crud-panel-hidden'}`} id="local-dreams-editor">
        <div className="reasons-editor-card">
          <div className="crud-subsection-title">Crear nueva</div>
          <h3>
            <Plus size={18} />
            Editor local de Wishlist
          </h3>

          <div className="editor-warning">
            <AlertTriangle size={15} />
            <span>Estos planes son locales; el JSON original no se modifica.</span>
          </div>

          <form className="editor-form" onSubmit={handleFutureDreamSubmit}>
            <div className="editor-field">
              <label htmlFor="futureDreamCategory">Categoria *</label>
              <input
                id="futureDreamCategory"
                type="text"
                placeholder="Ej. Cita"
                value={futureDreamCategory}
                onChange={(event) => setFutureDreamCategory(event.target.value)}
                required
              />
            </div>

            <div className="editor-field">
              <label htmlFor="futureDreamTitle">Titulo *</label>
              <input
                id="futureDreamTitle"
                type="text"
                placeholder="Ej. Comer milanesas juntos"
                value={futureDreamTitle}
                onChange={(event) => setFutureDreamTitle(event.target.value)}
                required
              />
            </div>

            <div className="editor-field">
              <label htmlFor="futureDreamDescription">Descripcion *</label>
              <textarea
                id="futureDreamDescription"
                rows="4"
                placeholder="Ej. Un plan pequeñito pero perfecto para guardar como recuerdo."
                value={futureDreamDescription}
                onChange={(event) => setFutureDreamDescription(event.target.value)}
                required
              ></textarea>
            </div>

            <div className="form-actions">
              {editingFutureDreamId && (
                <button type="button" className="ghost-button cancel-btn" onClick={resetFutureDreamForm}>
                  Cancelar
                </button>
              )}
              <button type="submit" className="control-btn submit-btn">
                {editingFutureDreamId ? 'Actualizar plan local' : 'Guardar plan local'}
              </button>
            </div>
          </form>
        </div>

        <div className="reasons-list-card">
          <div className="crud-subsection-title">Creadas por ti</div>
          <div className="reasons-list-header">
            <h3>Wishlist local</h3>
            <span>{localFutureDreams.length} locales</span>
          </div>

          {localFutureDreams.length === 0 ? (
            <p className="no-items">No hay planes locales creados.</p>
          ) : (
            <div className="reason-items-list">
              {localFutureDreams.map((dream) => (
                <div className="reason-item-row" key={dream.id}>
                  <div className="item-info">
                    <strong>{dream.category} · {dream.title}</strong>
                    <span>{dream.description}</span>
                  </div>

                  <div className="item-actions">
                    <button
                      type="button"
                      className="action-icon-btn edit"
                      onClick={() => handleFutureDreamEdit(dream)}
                      title="Editar plan local"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      type="button"
                      className="action-icon-btn delete"
                      onClick={() => handleFutureDreamDelete(dream)}
                      title="Eliminar plan local"
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

      <div className={`base-timeline-editor ${activeCrudModule === 'timeline' && activeCrudAction === 'originals' ? '' : 'crud-panel-hidden'}`} id="base-timeline-editor">
        <div className="base-reasons-panel">
          <div className="crud-subsection-title">Originales / editadas / ocultas</div>
          <div className="reasons-list-header">
            <h3>Diario original</h3>
            <span>{timelineData.length} base</span>
          </div>

          <div className="reason-stats-grid">
            <CrudStatButton filter="base" value={getNormalBaseCount(visibleBaseTimelinePages)} label="Base" />
            <CrudStatButton filter="edited" value={editedBaseTimelineCount} label="Editadas" />
            <CrudStatButton filter="hidden" value={hiddenBaseTimelineCount} label="Ocultas" />
            <CrudStatButton filter="local" value={localTimelinePages.length} label="Locales" />
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
                  <strong>{page.chapter} · {page.date} · {page.title}</strong>
                  <span>{page.description}</span>
                  <small>{page.isHidden ? 'Oculta localmente' : page.isOverridden ? 'Editada localmente' : 'Original'}</small>
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
            Editor local del diario
          </h3>

          <div className="editor-warning">
            <AlertTriangle size={15} />
            <span>Estas paginas son locales; el JSON original no se modifica.</span>
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
                placeholder="Ej. Una pagina nueva"
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
                placeholder="Ej. Este dia se queda guardado como una pagina bonita de nuestra historia."
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
                {editingTimelineId ? 'Actualizar pagina local' : 'Guardar pagina local'}
              </button>
            </div>
          </form>
        </div>

        <div className="reasons-list-card">
          <div className="crud-subsection-title">Creadas por ti</div>
          <div className="reasons-list-header">
            <h3>Diario local</h3>
            <span>{localTimelinePages.length} locales</span>
          </div>

          {localTimelinePages.length === 0 ? (
            <p className="no-items">No hay paginas locales creadas.</p>
          ) : (
            <div className="reason-items-list">
              {localTimelinePages.map((page) => (
                <div className="reason-item-row" key={page.id}>
                  <div className="item-info">
                    <strong>{page.chapter} · {page.date} · {page.title}</strong>
                    <span>{page.description}</span>
                  </div>

                  <div className="item-actions">
                    <button
                      type="button"
                      className="action-icon-btn edit"
                      onClick={() => handleTimelineEdit(page)}
                      title="Editar pagina local"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      type="button"
                      className="action-icon-btn delete"
                      onClick={() => handleTimelineDelete(page)}
                      title="Eliminar pagina local"
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
            <CrudStatButton filter="base" value={getNormalBaseCount(visibleBaseBlackHoleGallery)} label="Base" />
            <CrudStatButton filter="edited" value={editedBaseBlackHoleGalleryCount} label="Editadas" />
            <CrudStatButton filter="hidden" value={hiddenBaseBlackHoleGalleryCount} label="Ocultas" />
            <CrudStatButton filter="local" value={localBlackHoleGallery.length} label="Locales" />
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
                  <small>{item.isHidden ? 'Oculto localmente' : item.isOverridden ? 'Editado localmente' : 'Original'}</small>
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
            Editor local del agujero negro
          </h3>

          <div className="editor-warning">
            <AlertTriangle size={15} />
            <span>Estos recuerdos son locales; el JSON original no se modifica.</span>
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
                placeholder="Ej. Recuerdo bonito de Ale y Yori"
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
                {editingBlackHoleId ? 'Actualizar recuerdo local' : 'Guardar recuerdo local'}
              </button>
            </div>
          </form>
        </div>

        <div className="reasons-list-card">
          <div className="crud-subsection-title">Creadas por ti</div>
          <div className="reasons-list-header">
            <h3>Recuerdos locales</h3>
            <span>{localBlackHoleGallery.length} locales</span>
          </div>

          {localBlackHoleGallery.length === 0 ? (
            <p className="no-items">No hay recuerdos locales creados.</p>
          ) : (
            <div className="reason-items-list">
              {localBlackHoleGallery.map((item) => (
                <div className="reason-item-row" key={item.id}>
                  <div className="item-info">
                    <strong>{item.date} · {item.title}</strong>
                    <span>{item.description}</span>
                  </div>

                  <div className="item-actions">
                    <button
                      type="button"
                      className="action-icon-btn edit"
                      onClick={() => handleBlackHoleEdit(item)}
                      title="Editar recuerdo local"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      type="button"
                      className="action-icon-btn delete"
                      onClick={() => handleBlackHoleDelete(item)}
                      title="Eliminar recuerdo local"
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

      <div className={`base-playlist-editor ${activeCrudModule === 'playlist' && activeCrudAction === 'originals' ? '' : 'crud-panel-hidden'}`} id="base-playlist-editor">
        <div className="base-reasons-panel">
          <div className="crud-subsection-title">Originales / editadas / ocultas</div>
          <div className="reasons-list-header">
            <h3>Playlist original</h3>
            <span>{playlistData.length} base</span>
          </div>

          <div className="reason-stats-grid">
            <CrudStatButton filter="base" value={getNormalBaseCount(visibleBasePlaylist)} label="Base" />
            <CrudStatButton filter="edited" value={editedBasePlaylistCount} label="Editadas" />
            <CrudStatButton filter="hidden" value={hiddenBasePlaylistCount} label="Ocultas" />
            <CrudStatButton filter="local" value={localPlaylist.length} label="Locales" />
          </div>

          <div className="base-reasons-list">
            {filteredBasePlaylist.length === 0 ? (
              <p className="no-items">No hay elementos en este filtro.</p>
            ) : filteredBasePlaylist.map((item) => (
              <div
                className={`base-reason-row ${item.isOverridden ? 'is-overridden' : ''} ${item.isHidden ? 'is-hidden' : ''}`}
                key={item.id}
              >
                <div className="base-reason-copy">
                  <strong>{item.title} · {item.artist || 'Sin artista'}</strong>
                  <span>{item.description}</span>
                  <small>{item.isHidden ? 'Oculta localmente' : item.isOverridden ? 'Editada localmente' : item.sourceType === 'local' ? 'Archivo local' : 'Enlace externo'}</small>
                </div>

                <div className="base-reason-actions">
                  <button type="button" className="ghost-button" onClick={() => handleBasePlaylistEdit(item)}>
                    Editar
                  </button>

                  {item.isOverridden && (
                    <button type="button" className="ghost-button" onClick={() => handleBasePlaylistRestore(item.id)}>
                      Restaurar
                    </button>
                  )}

                  {item.isHidden ? (
                    <button type="button" className="ghost-button" onClick={() => handleBasePlaylistUnhide(item.id)}>
                      Mostrar
                    </button>
                  ) : (
                    <button type="button" className="ghost-button danger-action" onClick={() => handleBasePlaylistHide(item)}>
                      Ocultar
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {hiddenBasePlaylistCount > 0 && (
            <div className="hidden-reasons-box">
              <h4>Canciones ocultas</h4>
              {visibleBasePlaylist.filter((item) => item.isHidden).map((item) => (
                <button type="button" className="ghost-button" key={item.id} onClick={() => handleBasePlaylistUnhide(item.id)}>
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
            Override de Playlist
          </h3>

          <form className="editor-form" onSubmit={handleBasePlaylistSubmit}>
            <div className="editor-field">
              <label htmlFor="basePlaylistTitle">Titulo *</label>
              <input
                id="basePlaylistTitle"
                type="text"
                value={basePlaylistTitle}
                onChange={(event) => setBasePlaylistTitle(event.target.value)}
                disabled={!editingBasePlaylistId}
                required
              />
            </div>

            <div className="editor-field">
              <label htmlFor="basePlaylistArtist">Artista</label>
              <input
                id="basePlaylistArtist"
                type="text"
                value={basePlaylistArtist}
                onChange={(event) => setBasePlaylistArtist(event.target.value)}
                disabled={!editingBasePlaylistId}
              />
            </div>

            <div className="editor-field">
              <label htmlFor="basePlaylistDescription">Descripcion *</label>
              <textarea
                id="basePlaylistDescription"
                rows="4"
                value={basePlaylistDescription}
                onChange={(event) => setBasePlaylistDescription(event.target.value)}
                disabled={!editingBasePlaylistId}
                required
              ></textarea>
            </div>

            <div className="editor-field">
              <label htmlFor="basePlaylistSourceType">Tipo *</label>
              <select
                id="basePlaylistSourceType"
                value={basePlaylistSourceType}
                onChange={(event) => setBasePlaylistSourceType(event.target.value)}
                disabled={!editingBasePlaylistId}
              >
                <option value="local">Local</option>
                <option value="external">External</option>
              </select>
            </div>

            <div className="editor-field">
              <label htmlFor="basePlaylistSrc">Ruta local</label>
              <input
                id="basePlaylistSrc"
                type="text"
                value={basePlaylistSrc}
                onChange={(event) => setBasePlaylistSrc(event.target.value)}
                disabled={!editingBasePlaylistId}
              />
            </div>

            <div className="editor-field">
              <label htmlFor="basePlaylistLink">Link externo</label>
              <input
                id="basePlaylistLink"
                type="text"
                value={basePlaylistLink}
                onChange={(event) => setBasePlaylistLink(event.target.value)}
                disabled={!editingBasePlaylistId}
              />
            </div>

            <div className="editor-field">
              <label htmlFor="basePlaylistTag">Etiqueta</label>
              <input
                id="basePlaylistTag"
                type="text"
                value={basePlaylistTag}
                onChange={(event) => setBasePlaylistTag(event.target.value)}
                disabled={!editingBasePlaylistId}
              />
            </div>

            <div className="form-actions">
              {editingBasePlaylistId && (
                <button type="button" className="ghost-button cancel-btn" onClick={resetBasePlaylistForm}>
                  Cancelar
                </button>
              )}
              <button type="submit" className="control-btn submit-btn" disabled={!editingBasePlaylistId}>
                Guardar override
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className={`local-playlist-editor ${activeCrudModule === 'playlist' && ['local', 'create'].includes(activeCrudAction) ? `crud-show-${activeCrudAction}` : 'crud-panel-hidden'}`} id="local-playlist-editor">
        <div className="reasons-editor-card">
          <div className="crud-subsection-title">Crear nueva</div>
          <h3>
            <Plus size={18} />
            Editor local de Playlist
          </h3>

          <div className="editor-warning">
            <AlertTriangle size={15} />
            <span>Estas canciones son locales; el JSON original no se modifica.</span>
          </div>

          <form className="editor-form" onSubmit={handlePlaylistSubmit}>
            <div className="editor-field">
              <label htmlFor="playlistTitle">Titulo *</label>
              <input
                id="playlistTitle"
                type="text"
                placeholder="Ej. Cancion para Ale"
                value={playlistTitle}
                onChange={(event) => setPlaylistTitle(event.target.value)}
                required
              />
            </div>

            <div className="editor-field">
              <label htmlFor="playlistArtist">Artista</label>
              <input
                id="playlistArtist"
                type="text"
                placeholder="Ej. Ale & Yori"
                value={playlistArtist}
                onChange={(event) => setPlaylistArtist(event.target.value)}
              />
            </div>

            <div className="editor-field">
              <label htmlFor="playlistDescription">Descripcion *</label>
              <textarea
                id="playlistDescription"
                rows="4"
                placeholder="Ej. Una cancion para guardar en nuestro universo."
                value={playlistDescription}
                onChange={(event) => setPlaylistDescription(event.target.value)}
                required
              ></textarea>
            </div>

            <div className="editor-field">
              <label htmlFor="playlistSourceType">Tipo *</label>
              <select
                id="playlistSourceType"
                value={playlistSourceType}
                onChange={(event) => setPlaylistSourceType(event.target.value)}
              >
                <option value="local">Local</option>
                <option value="external">External</option>
              </select>
            </div>

            <div className="editor-field">
              <label htmlFor="playlistSrc">Ruta local</label>
              <input
                id="playlistSrc"
                type="text"
                placeholder="/audio/cancion.mp3"
                value={playlistSrc}
                onChange={(event) => setPlaylistSrc(event.target.value)}
              />
            </div>

            <div className="editor-field">
              <label htmlFor="playlistLink">Link externo</label>
              <input
                id="playlistLink"
                type="text"
                placeholder="https://open.spotify.com/..."
                value={playlistLink}
                onChange={(event) => setPlaylistLink(event.target.value)}
              />
            </div>

            <div className="editor-field">
              <label htmlFor="playlistTag">Etiqueta</label>
              <input
                id="playlistTag"
                type="text"
                placeholder="Ej. Spotify"
                value={playlistTag}
                onChange={(event) => setPlaylistTag(event.target.value)}
              />
            </div>

            <div className="form-actions">
              {editingPlaylistId && (
                <button type="button" className="ghost-button cancel-btn" onClick={resetPlaylistForm}>
                  Cancelar
                </button>
              )}
              <button type="submit" className="control-btn submit-btn">
                {editingPlaylistId ? 'Actualizar cancion local' : 'Guardar cancion local'}
              </button>
            </div>
          </form>
        </div>

        <div className="reasons-list-card">
          <div className="crud-subsection-title">Creadas por ti</div>
          <div className="reasons-list-header">
            <h3>Playlist local</h3>
            <span>{localPlaylist.length} locales</span>
          </div>

          {localPlaylist.length === 0 ? (
            <p className="no-items">No hay canciones locales creadas.</p>
          ) : (
            <div className="reason-items-list">
              {localPlaylist.map((item) => (
                <div className="reason-item-row" key={item.id}>
                  <div className="item-info">
                    <strong>{item.title} · {item.artist || 'Sin artista'}</strong>
                    <span>{item.description}</span>
                  </div>

                  <div className="item-actions">
                    <button
                      type="button"
                      className="action-icon-btn edit"
                      onClick={() => handlePlaylistEdit(item)}
                      title="Editar cancion local"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      type="button"
                      className="action-icon-btn delete"
                      onClick={() => handlePlaylistDelete(item)}
                      title="Eliminar cancion local"
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

      <div className={`local-promises-editor ${activeCrudModule === 'promises' && ['local', 'create'].includes(activeCrudAction) ? `crud-show-${activeCrudAction}` : 'crud-panel-hidden'}`} id="local-promises-editor">
        <div className="reasons-editor-card">
          <div className="crud-subsection-title">Crear nueva</div>
          <h3>
            <Plus size={18} />
            Editor local de promesas
          </h3>

          <div className="editor-warning">
            <AlertTriangle size={15} />
            <span>
              <strong>Aviso de pruebas</strong>: Las promesas locales y overrides solo viven en este navegador.
            </span>
          </div>

          <form className="editor-form" onSubmit={handlePromiseSubmit}>
            <div className="editor-field">
              <label htmlFor="promiseTitle">Titulo de la promesa *</label>
              <input
                id="promiseTitle"
                type="text"
                placeholder="Ej. Prometo cuidar este espacio"
                value={promiseTitle}
                onChange={(event) => setPromiseTitle(event.target.value)}
                required
              />
            </div>

            <div className="editor-field">
              <label htmlFor="promiseText">Texto de la promesa *</label>
              <textarea
                id="promiseText"
                rows="4"
                placeholder="Ej. Porque incluso en los días difíciles quiero elegirnos con paciencia."
                value={promiseText}
                onChange={(event) => setPromiseText(event.target.value)}
                required
              ></textarea>
            </div>

            <div className="editor-field">
              <label htmlFor="promiseTag">Etiqueta</label>
              <input
                id="promiseTag"
                type="text"
                placeholder="Ej. Promesa de Yori"
                value={promiseTag}
                onChange={(event) => setPromiseTag(event.target.value)}
              />
            </div>

            <div className="form-actions">
              {editingPromiseId && (
                <button type="button" className="ghost-button cancel-btn" onClick={resetPromiseForm}>
                  Cancelar
                </button>
              )}
              <button type="submit" className="control-btn submit-btn">
                {editingPromiseId ? 'Actualizar promesa local' : 'Guardar promesa local'}
              </button>
            </div>
          </form>
        </div>

        <div className="reasons-list-card">
          <div className="crud-subsection-title">Creadas por ti</div>
          <div className="reasons-list-header">
            <h3>Promesas locales</h3>
            <span>{localPromises.length} locales</span>
          </div>

          {localPromises.length === 0 ? (
            <p className="no-items">No hay promesas locales creadas.</p>
          ) : (
            <div className="reason-items-list">
              {localPromises.map((promise) => (
                <div className="reason-item-row" key={promise.id}>
                  <div className="item-info">
                    <strong>{promise.title}</strong>
                    <span>{promise.text || promise.description}</span>
                  </div>

                  <div className="item-actions">
                    <button
                      type="button"
                      className="action-icon-btn edit"
                      onClick={() => handlePromiseEdit(promise)}
                      title="Editar promesa local"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      type="button"
                      className="action-icon-btn delete"
                      onClick={() => handlePromiseDelete(promise)}
                      title="Eliminar promesa local"
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

      <div className={`base-promises-editor ${activeCrudModule === 'promises' && activeCrudAction === 'originals' ? '' : 'crud-panel-hidden'}`}>
        <div className="base-reasons-panel">
          <div className="crud-subsection-title">Originales / editadas / ocultas</div>
          <div className="reasons-list-header">
            <h3>Promesas base</h3>
            <span>{promisesData.length} base</span>
          </div>

          <div className="reason-stats-grid">
            <CrudStatButton filter="base" value={getNormalBaseCount(visibleBasePromises)} label="Base" />
            <CrudStatButton filter="edited" value={editedBasePromisesCount} label="Editadas" />
            <CrudStatButton filter="hidden" value={hiddenBasePromisesCount} label="Ocultas" />
            <CrudStatButton filter="local" value={localPromises.length} label="Locales" />
          </div>

          <div className="base-reasons-list">
            {filteredBasePromises.length === 0 ? (
              <p className="no-items">No hay elementos en este filtro.</p>
            ) : filteredBasePromises.map((promise) => (
              <div
                className={`base-reason-row ${promise.isOverridden ? 'is-overridden' : ''} ${promise.isHidden ? 'is-hidden' : ''}`}
                key={promise.id}
              >
                <div className="base-reason-copy">
                  <strong>{promise.title}</strong>
                  <span>{promise.text}</span>
                  <small>{promise.isHidden ? 'Oculta localmente' : promise.isOverridden ? 'Editada localmente' : promise.tag}</small>
                </div>

                <div className="base-reason-actions">
                  <button type="button" className="ghost-button" onClick={() => handleBasePromiseEdit(promise)}>
                    <Edit2 size={14} />
                    Editar
                  </button>

                  {promise.isOverridden && (
                    <button type="button" className="ghost-button" onClick={() => handleBasePromiseRestore(promise.id)}>
                      Restaurar
                    </button>
                  )}

                  {promise.isHidden ? (
                    <button type="button" className="ghost-button" onClick={() => handleBasePromiseUnhide(promise.id)}>
                      Mostrar
                    </button>
                  ) : (
                    <button type="button" className="ghost-button danger-action" onClick={() => handleBasePromiseHide(promise)}>
                      Ocultar
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="base-reasons-panel">
          <div className="crud-subsection-title">Editar original</div>
          <h3>
            <Edit2 size={18} />
            {editingBasePromiseId ? `Editando promesa #${editingBasePromiseId}` : 'Editar promesa base'}
          </h3>

          <form className="editor-form" onSubmit={handleBasePromiseSubmit}>
            <div className="editor-field">
              <label htmlFor="basePromiseTitle">Titulo override *</label>
              <input
                id="basePromiseTitle"
                type="text"
                value={basePromiseTitle}
                onChange={(event) => setBasePromiseTitle(event.target.value)}
                disabled={!editingBasePromiseId}
                required
              />
            </div>

            <div className="editor-field">
              <label htmlFor="basePromiseText">Texto override *</label>
              <textarea
                id="basePromiseText"
                rows="5"
                value={basePromiseText}
                onChange={(event) => setBasePromiseText(event.target.value)}
                disabled={!editingBasePromiseId}
                required
              ></textarea>
            </div>

            <div className="editor-field">
              <label htmlFor="basePromiseTag">Etiqueta override</label>
              <input
                id="basePromiseTag"
                type="text"
                value={basePromiseTag}
                onChange={(event) => setBasePromiseTag(event.target.value)}
                disabled={!editingBasePromiseId}
              />
            </div>

            <div className="form-actions">
              {editingBasePromiseId && (
                <button type="button" className="ghost-button cancel-btn" onClick={resetBasePromiseForm}>
                  Cancelar
                </button>
              )}
              <button type="submit" className="control-btn submit-btn" disabled={!editingBasePromiseId}>
                Guardar override
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Local letters CRUD editor */}
      <div className={`local-editor-container ${['monthlyLetters', 'openWhenLetters'].includes(activeCrudModule) && ['local', 'create'].includes(activeCrudAction) ? `crud-show-${activeCrudAction} crud-module-${activeCrudModule}` : 'crud-panel-hidden'}`} id="local-editor-form">
        <div className="editor-card">
          <div className="crud-subsection-title">Crear nueva</div>
          <h3>
            <Plus size={18} />
            {editingId ? 'Editar Carta Local' : 'Crear Carta Local'}
          </h3>
          <div className="editor-warning">
            <AlertTriangle size={15} />
            <span>
              <strong>Aviso de pruebas</strong>: Estas cartas se guardan solo localmente en tu navegador.
            </span>
          </div>

          <form onSubmit={handleSubmit} className="editor-form">
            <div className="editor-row">
              <div className="editor-field">
                <label htmlFor="letterType">Tipo de Carta *</label>
                <select
                  id="letterType"
                  value={letterType}
                  onChange={(e) => setLetterType(e.target.value)}
                  disabled={!!editingId || ['monthlyLetters', 'openWhenLetters'].includes(activeCrudModule)}
                >
                  <option value="monthly">Carta Mensual</option>
                  <option value="openwhen">Carta Abrir cuando...</option>
                </select>
              </div>

              <div className="editor-field">
                <label htmlFor="tag">
                  {letterType === 'monthly' ? 'Mes / Etiqueta *' : 'Motivo / Emoción *'}
                </label>
                <input
                  type="text"
                  id="tag"
                  placeholder={
                    letterType === 'monthly'
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
          <h3>Cartas locales creadas</h3>
          
          <div className="local-lists-split">
            {/* Monthly Local List */}
            <div className="list-column monthly-local-column">
              <h4>Mensuales ({localMonthly.length})</h4>
              {localMonthly.length === 0 ? (
                <p className="no-items">No hay cartas mensuales locales.</p>
              ) : (
                <div className="items-list">
                  {localMonthly.map((item) => (
                    <div className="item-row" key={item.id}>
                      <div className="item-info">
                        <strong>{item.title}</strong>
                        <span>{item.month}</span>
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
                <p className="no-items">No hay cartas abrir cuando locales.</p>
              ) : (
                <div className="items-list">
                  {localOpenWhen.map((item) => (
                    <div className="item-row" key={item.id}>
                      <div className="item-info">
                        <strong>{item.title}</strong>
                        <span>{item.mood}</span>
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
