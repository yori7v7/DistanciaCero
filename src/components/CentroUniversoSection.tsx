import { useState, useEffect } from 'react'
import SectionTitle from './SectionTitle'
import LocalIdentitySelector from './LocalIdentitySelector'
import LocalContentMeta from './LocalContentMeta'
import CrudStatButton from './centro-universo/CrudStatButton'
import useCrudCollection from './centro-universo/useCrudCollection'
import CrudEditorPanel from './centro-universo/CrudEditorPanel'
import SimulationBanner from './centro-universo/SimulationBanner'
import LetterStatsPanel from './centro-universo/LetterStatsPanel'
import BackupPanel from './centro-universo/BackupPanel'
import { Trash2, Power, Edit2, Plus, AlertTriangle, Heart, Star, Calendar, Sparkles, Camera, Music, Mail, BookOpen } from 'lucide-react'
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
import {
  isPlainObject,
  detailsToText,
  textToDetails,
  formatTimelineDateForDisplay,
  parseTimelineDateForInput,
  normalizeTimelineDateForStorage,
  parseImportantDateForInput,
  normalizeImportantDateForStorage
} from '../utils/helpers'

function CentroUniversoSection() {
  const [isSimUnlocked, setIsSimUnlocked] = useState(false)
  const [localMonthly, setLocalMonthly] = useState([])
  const [localOpenWhen, setLocalOpenWhen] = useState([])
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
                rows={6}
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
                rows={6}
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
                rows={6}
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
