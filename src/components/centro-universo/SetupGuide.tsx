import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { ArrowLeft, ArrowRight, Save, Sparkles } from 'lucide-react'
import { useSiteSettings } from '../../hooks/useSiteConfig'
import { saveSiteSettings } from '../../services/siteSettingsService'
import { validateSiteSettings } from '../../utils/siteSettings'
import { getSettingsFormValues, settingsFields, settingsFromForm } from './siteSettingsForm'
import type { SettingsFormValues } from './siteSettingsForm'

interface Draft {
  source: string
  initial: SettingsFormValues
  values: SettingsFormValues
}
const steps = ['Nombres', 'Fechas', 'Revisar']

export default function SetupGuide() {
  const settings = useSiteSettings()
  const source = JSON.stringify(settings)
  const [draft, setDraft] = useState<Draft | null>(null)
  const [step, setStep] = useState(0)
  const [notice, setNotice] = useState<{ error: boolean; text: string } | null>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const startRef = useRef<HTMLButtonElement>(null)
  const wasActiveRef = useRef(false)
  const conflict = draft !== null && draft.source !== source
  const active = draft !== null

  useEffect(() => {
    if (active) headingRef.current?.focus()
    else if (wasActiveRef.current) startRef.current?.focus()
    wasActiveRef.current = active
  }, [active, step, draft?.source])

  const start = () => {
    const values = getSettingsFormValues(settings)
    setDraft({ source, initial: values, values })
    setStep(0)
    setNotice(null)
  }
  const change = (key: keyof SettingsFormValues, value: string) => {
    setDraft(previous => previous && { ...previous, values: { ...previous.values, [key]: value } })
    setNotice(null)
  }
  const submit = (event: FormEvent) => {
    event.preventDefault()
    if (!draft || conflict) return
    try {
      const values = settingsFromForm(draft.values)
      validateSiteSettings(step === 0 ? { couple: values.couple, hero: values.hero } : step === 1 ? { dates: values.dates } : values)
      if (step < 2) {
        setStep(step + 1)
        setNotice(null)
        return
      }
      saveSiteSettings(values)
      setDraft(null)
      setNotice({ error: false, text: 'Configuración guardada. Tu universo ya está actualizado.' })
    } catch (error) {
      setNotice({ error: true, text: error instanceof Error ? error.message : 'No se pudo guardar la configuración.' })
    }
  }
  const cancel = () => {
    if (draft && JSON.stringify(draft.values) !== JSON.stringify(draft.initial) &&
      !window.confirm('¿Descartar los cambios de esta guía? Tus ajustes guardados y creaciones se conservarán.')) return
    setDraft(null)
    setNotice(null)
  }

  return <section className="backup-card" aria-labelledby="setup-guide-title">
    <h3 id="setup-guide-title"><Sparkles size={18} aria-hidden="true" /> Configura tu universo</h3>
    <p>Una guía de tres pasos para elegir nombres y fechas. Todo se guarda en este navegador al confirmar el último paso; tus creaciones se conservan.</p>
    <p>Los valores de la plantilla son un punto de partida. Revisa las fechas antes de confirmar.</p>
    {!draft && <button ref={startRef} className="control-btn" type="button" onClick={start}>
      {Object.keys(settings).length === 0 ? 'Empezar guía' : 'Revisar con la guía'}
    </button>}
    {notice && <p className={`crud-notice ${notice.error ? 'error' : 'success'}`} role={notice.error ? 'alert' : 'status'}>{notice.text}</p>}
    {draft && <form className="editor-form" aria-label="Configuración guiada" noValidate onSubmit={submit}>
      <p>Paso {step + 1} de 3</p>
      <h4 ref={headingRef} tabIndex={-1}>{steps[step]}</h4>
      {conflict && <div className="crud-notice error" role="alert">
        Hay nuevos ajustes guardados. Tu borrador se conserva; carga los ajustes actuales antes de continuar.
        <button className="ghost-button" type="button" onClick={start}>Cargar ajustes actuales</button>
      </div>}
      {step < 2 ? <div className="grid gap-4 sm:grid-cols-2">
        {settingsFields.filter(field => step === 0 ? !field.type : field.type === 'date').map(field => <div className="editor-field" key={field.key}>
          <label htmlFor={`setup-guide-${field.key}`}>{field.label}</label>
          <input id={`setup-guide-${field.key}`} type={field.type ?? 'text'} required={field.required}
            maxLength={field.type ? undefined : 80} value={draft.values[field.key]}
            onChange={event => change(field.key, event.target.value)}
            aria-describedby={field.key === 'titleName' ? 'setup-guide-title-help' : undefined} />
          {field.key === 'titleName' && <small id="setup-guide-title-help">Si lo dejas vacío, se usa el nombre de tu pareja.</small>}
        </div>)}
      </div> : <>
        <p>Revisa los datos antes de guardarlos. Puedes volver para cambiarlos.</p>
        <dl className="grid gap-4 sm:grid-cols-2">
          {settingsFields.map(field => <div className="min-w-0 break-words" key={field.key}>
            <dt className="text-muted">{field.label}</dt>
            <dd>{draft.values[field.key].trim() || (field.key === 'titleName' ? draft.values.herName.trim() : '') || 'Sin nombre'}</dd>
          </div>)}
        </dl>
      </>}
      <div className="backup-actions">
        {step > 0 && <button className="control-btn" type="button" onClick={() => { setStep(step - 1); setNotice(null) }}><ArrowLeft size={16} aria-hidden="true" /> Anterior</button>}
        <button className="control-btn" type="submit" disabled={conflict}>
          {step === 2 ? <Save size={16} aria-hidden="true" /> : <ArrowRight size={16} aria-hidden="true" />}
          {step === 2 ? 'Guardar configuración' : 'Siguiente'}
        </button>
        <button className="ghost-button" type="button" onClick={cancel}>Cancelar guía</button>
      </div>
    </form>}
  </section>
}
