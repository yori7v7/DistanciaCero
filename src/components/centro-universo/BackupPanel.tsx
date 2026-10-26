import { useState, useRef } from 'react'
import { Download, Upload, AlertTriangle } from 'lucide-react'
import { exportContentBackup, restoreContentBackup, validateContentBackup } from '../../services/contentService'

interface BackupStatus {
  type: 'success' | 'error'
  text: string
}

export default function BackupPanel() {
  const [backupStatus, setBackupStatus] = useState<BackupStatus | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [isImporting, setIsImporting] = useState(false)

  const reportError = (error: unknown) => {
    setBackupStatus({ type: 'error', text: error instanceof Error ? error.message : 'No se pudo completar el respaldo.' })
  }

  const handleExport = () => {
    let downloadUrl: string | undefined
    try {
      const blob = new Blob([JSON.stringify(exportContentBackup(), null, 2)], { type: 'application/json' })
      downloadUrl = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = `distancia-cero-respaldo-local-${new Date().toISOString().slice(0, 10)}.json`
      document.body.appendChild(link)
      try { link.click() } finally { link.remove() }
      setBackupStatus({ type: 'success', text: 'Respaldo v2 creado correctamente.' })
    } catch (error) {
      reportError(error)
    } finally {
      if (downloadUrl) URL.revokeObjectURL(downloadUrl)
    }
  }

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    setIsImporting(true)
    setBackupStatus(null)
    const finish = () => {
      setIsImporting(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
    const reader = new FileReader()
    reader.onload = () => {
      try {
        let importedData: unknown
        try { importedData = JSON.parse(reader.result as string) } catch {
          throw new Error('El archivo no es un JSON válido. No se cambiaron tus datos.')
        }
        validateContentBackup(importedData)
        if (!window.confirm('Se reemplazarán las colecciones y ajustes incluidos en este respaldo. Los apartados ausentes se conservarán; los vacíos borrarán su contenido local. ¿Quieres continuar?')) {
          setBackupStatus({ type: 'error', text: 'Importación cancelada. No se cambiaron tus datos.' })
          return
        }
        restoreContentBackup(importedData)
        setBackupStatus({ type: 'success', text: 'Respaldo restaurado. Los cambios ya están disponibles.' })
      } catch (error) {
        reportError(error)
      } finally {
        finish()
      }
    }
    reader.onerror = () => {
      reportError(new Error('No se pudo abrir el archivo seleccionado.'))
      finish()
    }
    reader.onabort = () => {
      reportError(new Error('Lectura cancelada. No se cambiaron tus datos.'))
      finish()
    }
    try { reader.readAsText(file) } catch (error) {
      reportError(error)
      finish()
    }
  }

  return (
    <div className="backup-card">
      <h3><Download size={18} /> Respaldo Local</h3>
      <p>Guarda tus creaciones, las ediciones de originales, los elementos ocultos y los ajustes generales en un archivo JSON.</p>

      <p>No incluye progreso de lectura, volumen, selección de escenas ni archivos de audio o video. Las imágenes pegadas como base64 sí se guardan; los enlaces conservan su dirección. Los respaldos antiguos sin ajustes generales conservan los ajustes actuales.</p>

      <div className="backup-actions">
        <button type="button" className="control-btn" onClick={handleExport} disabled={isImporting}>
          <Download size={16} /> Exportar respaldo
        </button>
        <button type="button" className="control-btn" disabled={isImporting} onClick={() => fileInputRef.current?.click()}>
          <Upload size={16} /> {isImporting ? 'Importando…' : 'Importar respaldo'}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          aria-label="Importar respaldo"
          disabled={isImporting}
          accept=".json,application/json"
          style={{ display: 'none' }}
          onChange={handleImport}
        />
      </div>

      {backupStatus && (
        <div role={backupStatus.type === 'error' ? 'alert' : 'status'} className={`backup-status ${backupStatus.type === 'error' ? 'error' : 'success'}`}>
          <AlertTriangle size={14} />
          <span>{backupStatus.text}</span>
        </div>
      )}
    </div>
  )
}
