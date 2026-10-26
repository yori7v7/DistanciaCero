import { useState } from 'react'
import type { FormEvent } from 'react'
import { RotateCcw, Save, Settings } from 'lucide-react'
import { useSiteSettings } from '../../hooks/useSiteConfig'
import { resetSiteSettings, saveSiteSettings } from '../../services/siteSettingsService'
import { getSettingsFormValues, settingsFields, settingsFromForm } from './siteSettingsForm'
import type { SettingsFormValues } from './siteSettingsForm'

export default function GeneralSettingsPanel() {
  const settings = useSiteSettings()
  const source = JSON.stringify(settings)
  const defaults = getSettingsFormValues(settings)
  const [editing, setEditing] = useState<{ source: string; values: SettingsFormValues } | null>(null)
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const values = editing?.values ?? defaults
  const dirty = editing !== null
  const conflict = dirty && editing.source !== source

  const change = (key: keyof SettingsFormValues, value: string) => {
    const next = { ...values, [key]: value }
    setEditing(JSON.stringify(next) === JSON.stringify(defaults) ? null : { source: editing?.source ?? source, values: next })
    setNotice(null)
  }
  const reportError = (error: unknown) => setNotice({ type: 'error', text: error instanceof Error ? error.message : 'No se pudieron guardar los ajustes.' })
  const save = (event: FormEvent) => {
    event.preventDefault()
    if (conflict) return
    try {
      saveSiteSettings(settingsFromForm(values))
      setEditing(null)
      setNotice({ type: 'success', text: 'Ajustes guardados. La experiencia ya está actualizada.' })
    } catch (error) { reportError(error) }
  }
  const reset = () => {
    if (!window.confirm('¿Restaurar los nombres y fechas de la plantilla? También se descartará este borrador. Tus cartas y demás creaciones se conservarán.')) return
    try {
      resetSiteSettings()
      setEditing(null)
      setNotice({ type: 'success', text: 'Se restauraron los ajustes de la plantilla.' })
    } catch (error) { reportError(error) }
  }

  return (
    <details className="backup-card">
      <summary className="control-btn"><Settings size={18} aria-hidden="true" /><span id="general-settings-title">Ajustes generales</span></summary>
      <p id="general-settings-help">Personaliza los nombres y fechas de este navegador. Se incluyen en tu respaldo local.</p>
      {conflict && <div className="crud-notice error" role="alert">
        Hay nuevos ajustes guardados. Tu borrador se conserva; carga los ajustes actuales antes de guardar.
        <button className="ghost-button" type="button" onClick={() => { setEditing(null); setNotice(null) }}>Descartar borrador y cargar ajustes</button>
      </div>}
      {notice && <p className={`backup-status ${notice.type}`} role={notice.type === 'error' ? 'alert' : 'status'}>{notice.text}</p>}
      <form className="editor-form" aria-labelledby="general-settings-title" aria-describedby="general-settings-help" onSubmit={save}>
        <div className="grid gap-4 sm:grid-cols-2">
          {settingsFields.map(field => <div className="editor-field" key={field.key}>
            <label htmlFor={`site-setting-${field.key}`}>{field.label}</label>
            <input id={`site-setting-${field.key}`} type={field.type ?? 'text'} required={field.required}
              maxLength={field.type ? undefined : 80} value={values[field.key]} onChange={event => change(field.key, event.target.value)}
              aria-describedby={field.key === 'titleName' ? 'site-title-help' : undefined} />
            {field.key === 'titleName' && <small id="site-title-help">Si lo dejas vacío, se usa el nombre de tu pareja.</small>}
          </div>)}
        </div>
        {dirty && <p role="status">Tienes cambios sin guardar.</p>}
        <div className="backup-actions">
          <button className="control-btn" type="submit" disabled={!dirty || conflict}><Save size={16} aria-hidden="true" /> Guardar ajustes</button>
          <button className="control-btn" type="button" disabled={!dirty && Object.keys(settings).length === 0} onClick={reset}><RotateCcw size={16} aria-hidden="true" /> Restaurar plantilla</button>
        </div>
      </form>
    </details>
  )
}
