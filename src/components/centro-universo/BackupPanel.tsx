import { useState, useRef } from 'react'
import { Download, Upload, AlertTriangle } from 'lucide-react'
import {
  getLegacyMonthlyLetters,
  getLegacyOpenWhenLetters,
  getCollectionItems,
  getCollectionOverrides,
  getCollectionHiddenIds,
  saveLegacyMonthlyLetters,
  saveLegacyOpenWhenLetters,
  saveCollectionItems,
  saveCollectionOverrides,
  saveCollectionHiddenIds,
  notifyContentUpdated
} from '../../services/contentService'

interface BackupStatus {
  type: 'success' | 'error'
  text: string
}

const COLLECTIONS = [
  'reasons', 'promises', 'importantDates', 'futureDreams',
  'timeline', 'blackHoleGallery', 'playlist'
] as const

import { isPlainObject } from '../../utils/helpers'

export default function BackupPanel() {
  const [backupStatus, setBackupStatus] = useState<BackupStatus | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleExport = () => {
    const exportData = {
      version: 2,
      exportedAt: new Date().toISOString(),
      source: 'Distancia Cero - Centro del Universo',
      content: {
        monthlyLetters: getLegacyMonthlyLetters(),
        openWhenLetters: getLegacyOpenWhenLetters(),
        reasons: getCollectionItems('reasons'),
        promises: getCollectionItems('promises'),
        importantDates: getCollectionItems('importantDates'),
        futureDreams: getCollectionItems('futureDreams'),
        timeline: getCollectionItems('timeline'),
        blackHoleGallery: getCollectionItems('blackHoleGallery'),
        playlist: getCollectionItems('playlist')
      },
      overrides: {
        monthlyLetters: getCollectionOverrides('monthlyLetters'),
        openWhenLetters: getCollectionOverrides('openWhenLetters'),
        reasons: getCollectionOverrides('reasons'),
        promises: getCollectionOverrides('promises'),
        importantDates: getCollectionOverrides('importantDates'),
        futureDreams: getCollectionOverrides('futureDreams'),
        timeline: getCollectionOverrides('timeline'),
        blackHoleGallery: getCollectionOverrides('blackHoleGallery'),
        playlist: getCollectionOverrides('playlist')
      },
      hidden: {
        monthlyLetters: getCollectionHiddenIds('monthlyLetters'),
        openWhenLetters: getCollectionHiddenIds('openWhenLetters'),
        reasons: getCollectionHiddenIds('reasons'),
        promises: getCollectionHiddenIds('promises'),
        importantDates: getCollectionHiddenIds('importantDates'),
        futureDreams: getCollectionHiddenIds('futureDreams'),
        timeline: getCollectionHiddenIds('timeline'),
        blackHoleGallery: getCollectionHiddenIds('blackHoleGallery'),
        playlist: getCollectionHiddenIds('playlist')
      }
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
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

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      try {
        const importedData = JSON.parse(reader.result as string)
        const content = importedData?.content
        const overrides = importedData?.overrides
        const hidden = importedData?.hidden

        // Importación de respaldo v1 (legacy)
        if (importedData?.version === 1) {
          if (!Array.isArray(importedData.monthlyLetters) || !Array.isArray(importedData.openWhenLetters)) {
            setBackupStatus({ type: 'error', text: 'El respaldo v1 no tiene cartas válidas.' })
            return
          }

          if (!window.confirm('Esto reemplazará solo las cartas guardadas. No tocará promesas, fechas, wishlist, diario, galería ni playlist. ¿Quieres continuar?')) {
            setBackupStatus({ type: 'error', text: 'Importación cancelada. No se cambiaron tus datos.' })
            return
          }

          saveLegacyMonthlyLetters(importedData.monthlyLetters)
          saveLegacyOpenWhenLetters(importedData.openWhenLetters)
          notifyContentUpdated('monthlyLetters')
          notifyContentUpdated('openWhenLetters')
          setBackupStatus({ type: 'success', text: 'Respaldo v1 importado: solo cartas tuyas.' })
          return
        }

        // Validación de respaldo v2
        const isValidV2 =
          importedData?.version === 2 &&
          isPlainObject(content) &&
          Array.isArray(content?.monthlyLetters) &&
          Array.isArray(content?.openWhenLetters)

        if (!isValidV2) {
          setBackupStatus({ type: 'error', text: 'Formato de respaldo inválido o dañado.' })
          return
        }

        if (!window.confirm('Esto restaurará TODO el contenido local (cartas, razones, promesas, fechas, sueños, diario, galería, playlist, overrides y elementos ocultos). ¿Estás seguro?')) {
          setBackupStatus({ type: 'error', text: 'Importación cancelada.' })
          return
        }

        // Restaurar contenido
        if (Array.isArray(content.monthlyLetters)) saveLegacyMonthlyLetters(content.monthlyLetters)
        if (Array.isArray(content.openWhenLetters)) saveLegacyOpenWhenLetters(content.openWhenLetters)
        // Restaurar overrides y hidden de letters (no incluidos en COLLECTIONS)
        if (isPlainObject(overrides?.monthlyLetters)) saveCollectionOverrides('monthlyLetters', overrides.monthlyLetters as any)
        if (Array.isArray(hidden?.monthlyLetters)) saveCollectionHiddenIds('monthlyLetters', hidden.monthlyLetters)
        if (isPlainObject(overrides?.openWhenLetters)) saveCollectionOverrides('openWhenLetters', overrides.openWhenLetters as any)
        if (Array.isArray(hidden?.openWhenLetters)) saveCollectionHiddenIds('openWhenLetters', hidden.openWhenLetters)

        for (const col of COLLECTIONS) {
          if (Array.isArray(content?.[col])) saveCollectionItems(col, content[col])
          if (isPlainObject(overrides?.[col])) saveCollectionOverrides(col, overrides[col] as any)
          if (Array.isArray(hidden?.[col])) saveCollectionHiddenIds(col, hidden[col])
        }

        notifyContentUpdated('all')
        setBackupStatus({ type: 'success', text: 'Respaldo restaurado. Recarga la página para ver los cambios.' })
      } catch {
        setBackupStatus({ type: 'error', text: 'El archivo no es un JSON válido.' })
      } finally {
        if (fileInputRef.current) fileInputRef.current.value = ''
      }
    }
    reader.onerror = () => {
      setBackupStatus({ type: 'error', text: 'No se pudo abrir el archivo seleccionado.' })
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
    reader.readAsText(file)
  }

  return (
    <div className="backup-card">
      <h3><Download size={18} /> Respaldo Local</h3>
      <p>Guarda todo el contenido en un archivo JSON que puedes respaldar donde quieras.</p>

      <div className="backup-actions">
        <button type="button" className="control-btn" onClick={handleExport}>
          <Download size={16} /> Exportar respaldo local v2
        </button>
        <label className="control-btn">
          <Upload size={16} /> Importar respaldo
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            style={{ display: 'none' }}
            onChange={handleImport}
          />
        </label>
      </div>

      {backupStatus && (
        <div className={`backup-status ${backupStatus.type === 'error' ? 'error' : 'success'}`}>
          <AlertTriangle size={14} />
          <span>{backupStatus.text}</span>
        </div>
      )}
    </div>
  )
}
