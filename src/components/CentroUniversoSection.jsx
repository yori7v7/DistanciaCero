import { useState, useEffect } from 'react'
import SectionTitle from './SectionTitle'
import { ShieldAlert, Trash2, Power, Lock, Check, BookOpen, Edit2, Plus, AlertTriangle, Download, Upload } from 'lucide-react'
import monthlyLettersData from '../data/monthlyLetters.json'
import openWhenData from '../data/openWhen.json'
import reasonsData from '../data/reasons.json'
import {
  addLocalItem,
  deleteLocalItem,
  deleteLocalOverride,
  getHiddenItemIds,
  getLocalItems,
  getLocalOverrides,
  hideDefaultItem,
  restoreHiddenItem,
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

  // Form states
  const [letterType, setLetterType] = useState('monthly') // 'monthly' | 'openwhen'
  const [title, setTitle] = useState('')
  const [preview, setPreview] = useState('')
  const [contentRaw, setContentRaw] = useState('')
  const [tag, setTag] = useState('')
  const [editingId, setEditingId] = useState(null)

  useEffect(() => {
    setIsSimUnlocked(localStorage.getItem('distancia-cero-sim-unlocked') === '1')
    
    const m = localStorage.getItem('distancia-cero-local-monthly-letters')
    const ow = localStorage.getItem('distancia-cero-local-open-when')
    setLocalMonthly(m ? JSON.parse(m) : [])
    setLocalOpenWhen(ow ? JSON.parse(ow) : [])
    setLocalReasons(getLocalItems('reasons'))
    setReasonOverrides(getLocalOverrides('reasons'))
    setHiddenReasonIds(getHiddenItemIds('reasons'))
  }, [])

  // Map open when cards to lock 'special day' card
  const mappedOpenWhen = openWhenData.map((card) => {
    if (card.mood === 'Abrir cuando sea un día especial') {
      return { ...card, locked: true }
    }
    return card
  })

  // Calculation for Monthly Letters stats (combining JSON + Local)
  const totalMonthly = monthlyLettersData.length + localMonthly.length
  const openedMonthly = monthlyLettersData.filter(
    (l) => localStorage.getItem(`distancia-cero-monthly-letter-${l.id}`) === 'opened'
  ).length + localMonthly.filter(
    (l) => localStorage.getItem(`distancia-cero-monthly-letter-${l.id}`) === 'opened'
  ).length
  const unlockedMonthly = monthlyLettersData.filter((l) => !l.locked).length + localMonthly.length
  const lockedMonthly = (monthlyLettersData.length - monthlyLettersData.filter((l) => !l.locked).length)

  // Calculation for Open When Letters stats (combining JSON + Local)
  const totalOpenWhen = mappedOpenWhen.length + localOpenWhen.length
  const openedOpenWhen = mappedOpenWhen.filter(
    (c) => localStorage.getItem(`distancia-cero-open-when-${c.id}`) === 'opened'
  ).length + localOpenWhen.filter(
    (c) => localStorage.getItem(`distancia-cero-open-when-${c.id}`) === 'opened'
  ).length
  const unlockedOpenWhen = mappedOpenWhen.filter((c) => !c.locked).length + localOpenWhen.length
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

  const handleExportLocalLetters = () => {
    const exportData = {
      version: 1,
      exportedAt: new Date().toISOString(),
      source: 'Distancia Cero - Centro del Universo',
      monthlyLetters: readLocalLetters('distancia-cero-local-monthly-letters'),
      openWhenLetters: readLocalLetters('distancia-cero-local-open-when')
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    })
    const downloadUrl = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = downloadUrl
    link.download = `distancia-cero-cartas-locales-${new Date().toISOString().slice(0, 10)}.json`
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(downloadUrl)
    setBackupStatus({ type: 'success', text: 'Respaldo JSON creado correctamente.' })
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

  const dispatchContentUpdate = (collection) => {
    window.dispatchEvent(
      new CustomEvent('distancia-cero-content-updated', {
        detail: { collection }
      })
    )
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

    if (window.confirm('Â¿Seguro que quieres eliminar esta razon local?')) {
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
        'Â¿Seguro que quieres ocultar esta razon original? No se modificara el JSON y podras restaurarla despues.'
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
        locked: false,
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
    } else {
      setLocalOpenWhen(updatedList)
    }

    // Reset Form
    setTitle('')
    setPreview('')
    setContentRaw('')
    setTag('')
    alert('Carta local guardada con éxito. Compruébala en su respectiva sección.')
  }

  const handleEdit = (item, type) => {
    setLetterType(type)
    setEditingId(item.id)
    setTitle(item.title)
    setPreview(item.preview)
    setContentRaw(item.content ? item.content.join('\n') : '')
    setTag(type === 'monthly' ? (item.month || '') : (item.mood || ''))

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
      } else {
        setLocalOpenWhen(updatedList)
      }

      // If we were editing this item, reset form
      if (editingId === id) {
        setEditingId(null)
        setTitle('')
        setPreview('')
        setContentRaw('')
        setTag('')
      }
    }
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
          <h3>Respaldo de cartas locales</h3>
          <p>Exporta o restaura las cartas guardadas solo en este navegador.</p>
        </div>

        <div className="backup-actions">
          <button className="control-btn backup-export-btn" onClick={handleExportLocalLetters} type="button">
            <Download size={18} />
            Exportar cartas locales
          </button>

          <label className="control-btn backup-import-label" htmlFor="localLettersImport">
            <Upload size={18} />
            Importar cartas locales
          </label>
          <input
            id="localLettersImport"
            className="backup-file-input"
            type="file"
            accept=".json,application/json"
            onChange={handleImportLocalLetters}
          />
        </div>

        {backupStatus && (
          <p className={`backup-status ${backupStatus.type}`}>
            {backupStatus.text}
          </p>
        )}
      </div>

      {/* Local reasons CRUD editor */}
      <div className="local-reasons-editor" id="local-reasons-editor">
        <div className="reasons-editor-card">
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

      <div className="base-reasons-editor" id="base-reasons-editor">
        <div className="base-reasons-panel">
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

      {/* Local letters CRUD editor */}
      <div className="local-editor-container" id="local-editor-form">
        <div className="editor-card">
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
                  disabled={!!editingId}
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
          <h3>Cartas locales creadas</h3>
          
          <div className="local-lists-split">
            {/* Monthly Local List */}
            <div className="list-column">
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
            <div className="list-column">
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
