import { useState, useEffect } from 'react'
import SectionTitle from './SectionTitle'
import { ShieldAlert, Trash2, Power, Lock, Check, BookOpen, Edit2, Plus, AlertTriangle, Download, Upload } from 'lucide-react'
import monthlyLettersData from '../data/monthlyLetters.json'
import openWhenData from '../data/openWhen.json'
import reasonsData from '../data/reasons.json'
import promisesData from '../data/promises.json'
import importantDatesData from '../data/importantDates.json'
import futureDreamsData from '../data/futureDreams.json'
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

  const crudModules = [
    { id: 'monthlyLetters', label: 'Cartas mensuales' },
    { id: 'openWhenLetters', label: 'Abrir cuando' },
    { id: 'reasons', label: 'Razones' },
    { id: 'promises', label: 'Promesas' },
    { id: 'importantDates', label: 'Fechas importantes' },
    { id: 'futureDreams', label: 'Wishlist' }
  ]
  const crudActions = [
    { id: 'originals', label: 'Ver / editar originales' },
    { id: 'local', label: 'Ver creados por ti' },
    { id: 'create', label: 'Crear nuevo' }
  ]

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
        futureDreams: getLocalItems('futureDreams')
      },
      overrides: {
        monthlyLetters: getLocalOverrides('monthlyLetters'),
        openWhenLetters: getLocalOverrides('openWhenLetters'),
        reasons: getLocalOverrides('reasons'),
        promises: getLocalOverrides('promises'),
        importantDates: getLocalOverrides('importantDates'),
        futureDreams: getLocalOverrides('futureDreams')
      },
      hidden: {
        monthlyLetters: getHiddenItemIds('monthlyLetters'),
        openWhenLetters: getHiddenItemIds('openWhenLetters'),
        reasons: getHiddenItemIds('reasons'),
        promises: getHiddenItemIds('promises'),
        importantDates: getHiddenItemIds('importantDates'),
        futureDreams: getHiddenItemIds('futureDreams')
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
  }

  const handleCrudModuleChange = (moduleId) => {
    resetCrudEditingState(moduleId)
    setActiveCrudModule(moduleId)
  }

  const handleCrudActionChange = (actionId) => {
    resetCrudEditingState()
    setActiveCrudAction(actionId)
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
            <div>
              <strong>{monthlyLettersData.length}</strong>
              <span>Base</span>
            </div>
            <div>
              <strong>{editedBaseMonthlyCount}</strong>
              <span>Editadas</span>
            </div>
            <div>
              <strong>{hiddenBaseMonthlyCount}</strong>
              <span>Ocultas</span>
            </div>
            <div>
              <strong>{localMonthly.length}</strong>
              <span>Locales</span>
            </div>
          </div>

          <div className="editor-warning">
            <AlertTriangle size={15} />
            <span>Estas ediciones son overrides locales; el JSON original no se modifica.</span>
          </div>

          <div className="base-reasons-list">
            {visibleBaseMonthly.map((letter) => (
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
            <div>
              <strong>{openWhenData.length}</strong>
              <span>Base</span>
            </div>
            <div>
              <strong>{editedBaseOpenWhenCount}</strong>
              <span>Editadas</span>
            </div>
            <div>
              <strong>{hiddenBaseOpenWhenCount}</strong>
              <span>Ocultas</span>
            </div>
            <div>
              <strong>{localOpenWhen.length}</strong>
              <span>Locales</span>
            </div>
          </div>

          <div className="editor-warning">
            <AlertTriangle size={15} />
            <span>Estas ediciones son overrides locales; el JSON original no se modifica.</span>
          </div>

          <div className="base-reasons-list">
            {visibleBaseOpenWhen.map((card) => (
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
            <div>
              <strong>{reasonsData.length}</strong>
              <span>Base totales</span>
            </div>
            <div>
              <strong>{editedBaseReasonsCount}</strong>
              <span>Editadas</span>
            </div>
            <div>
              <strong>{hiddenBaseReasonsCount}</strong>
              <span>Ocultas</span>
            </div>
            <div>
              <strong>{localReasons.length}</strong>
              <span>Locales</span>
            </div>
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
            {filteredBaseReasons.map((reason) => (
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
            <div>
              <strong>{importantDatesData.length}</strong>
              <span>Base</span>
            </div>
            <div>
              <strong>{editedBaseImportantDatesCount}</strong>
              <span>Editadas</span>
            </div>
            <div>
              <strong>{hiddenBaseImportantDatesCount}</strong>
              <span>Ocultas</span>
            </div>
            <div>
              <strong>{localImportantDates.length}</strong>
              <span>Locales</span>
            </div>
          </div>

          <div className="base-reasons-list">
            {visibleBaseImportantDates.map((dateItem) => (
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
            <div>
              <strong>{futureDreamsData.length}</strong>
              <span>Base</span>
            </div>
            <div>
              <strong>{editedBaseFutureDreamsCount}</strong>
              <span>Editadas</span>
            </div>
            <div>
              <strong>{hiddenBaseFutureDreamsCount}</strong>
              <span>Ocultas</span>
            </div>
            <div>
              <strong>{localFutureDreams.length}</strong>
              <span>Locales</span>
            </div>
          </div>

          <div className="base-reasons-list">
            {visibleBaseFutureDreams.map((dream) => (
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
            <div>
              <strong>{promisesData.length}</strong>
              <span>Base totales</span>
            </div>
            <div>
              <strong>{editedBasePromisesCount}</strong>
              <span>Editadas</span>
            </div>
            <div>
              <strong>{hiddenBasePromisesCount}</strong>
              <span>Ocultas</span>
            </div>
            <div>
              <strong>{localPromises.length}</strong>
              <span>Locales</span>
            </div>
          </div>

          <div className="base-reasons-list">
            {visibleBasePromises.map((promise) => (
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
