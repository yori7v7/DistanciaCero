import { Plus, Edit2, Trash2, AlertTriangle } from 'lucide-react'
import LocalContentMeta from '../LocalContentMeta'
import CrudStatButton from './CrudStatButton'

/**
 * Generic CRUD editor panel for one collection.
 * Renders both the "base/originals" override editor and the "local" create/edit list.
 */
export default function CrudEditorPanel({
  collectionLabel,
  collectionName,
  activeCrudModule,
  activeCrudAction,
  activeCrudFilter,
  onCrudFilterClick,
  crud,
  fields,
  listFields,
  renderItemInfo,
  onEdit,
  onBaseEdit,
  editorPanelId,
  baseEditorPanelId
}) {
  const isActive = activeCrudModule === collectionName
  const showLocal = isActive && activeCrudAction === 'local'
  const showBase = isActive && activeCrudAction === 'originals'

  const filterBaseItems = (items) => {
    if (activeCrudFilter === 'all') return items
    if (activeCrudFilter === 'overridden') return items.filter(i => i.isOverridden)
    if (activeCrudFilter === 'hidden') return items.filter(i => i.isHidden)
    if (activeCrudFilter === 'visible') return items.filter(i => !i.isHidden)
    return items
  }

  const filteredBaseItems = filterBaseItems(crud.visibleBaseItems)

  return (
    <>
      {/* ===== LOCAL EDITOR ===== */}
      <div
        className={`local-editor-panel ${showLocal ? `crud-show-${activeCrudAction}` : 'crud-panel-hidden'}`}
        id={editorPanelId || `local-${collectionName}-editor`}
      >
        <div className="reasons-editor-card">
          <div className="crud-subsection-title">{crud.editingId ? 'Editar' : 'Crear nueva'}</div>
          <h3><Plus size={18} /> Editor de {collectionLabel}</h3>
          <div className="editor-warning">
            <AlertTriangle size={15} />
            <span><strong>Aviso</strong>: Estos elementos son tuyos; los originales no se modifican.</span>
          </div>

          <form className="editor-form" onSubmit={(e) => { crud.handleSubmit(e); onEdit?.(null) }}>
            {fields.map((field) => (
              <div className="editor-field" key={field.name}>
                <label htmlFor={`${collectionName}-${field.name}`}>{field.label}{field.required ? ' *' : ''}</label>
                {field.type === 'textarea' ? (
                  <textarea
                    id={`${collectionName}-${field.name}`}
                    rows={field.rows || 4}
                    placeholder={field.placeholder || ''}
                    value={crud.getFormValue(field.name)}
                    onChange={(e) => crud.setFormValue(field.name, e.target.value)}
                    required={field.required}
                  />
                ) : field.type === 'select' ? (
                  <select
                    id={`${collectionName}-${field.name}`}
                    value={crud.getFormValue(field.name)}
                    onChange={(e) => crud.setFormValue(field.name, e.target.value)}
                  >
                    {(field.options || []).map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    id={`${collectionName}-${field.name}`}
                    type={field.type || 'text'}
                    placeholder={field.placeholder || ''}
                    value={crud.getFormValue(field.name)}
                    onChange={(e) => crud.setFormValue(field.name, e.target.value)}
                    required={field.required}
                  />
                )}
              </div>
            ))}

            <div className="form-actions">
              {crud.editingId && (
                <button type="button" className="ghost-button cancel-btn" onClick={crud.resetForm}>
                  Cancelar
                </button>
              )}
              <button type="submit" className="control-btn submit-btn">
                {crud.editingId ? 'Actualizar' : 'Guardar'}
              </button>
            </div>
          </form>
        </div>

        <div className="reasons-list-card">
          <div className="crud-subsection-title">Creados por ti</div>
          <div className="reasons-list-header">
            <h3>{collectionLabel} creados por ti</h3>
            <span>{crud.localCount} tuyos</span>
          </div>

          {crud.localItems.length === 0 ? (
            <p className="no-items">No hay elementos tuyos creados.</p>
          ) : (
            <div className="reason-items-list">
              {crud.localItems.map((item) => (
                <div className="reason-item-row" key={item.id}>
                  <div className="item-info">
                    {listFields ? listFields.map((f, i) => {
                      if (i === 0) return <strong key={f}>{item[f]}</strong>
                      return <span key={f}>{item[f]}</span>
                    }) : (
                      <>
                        <strong>{item.title || item.displayLabel || item.id}</strong>
                        <span>{item.text || item.description || ''}</span>
                      </>
                    )}
                    <LocalContentMeta item={item} />
                  </div>
                  <div className="item-actions">
                    <button type="button" className="action-icon-btn edit"
                      onClick={() => { crud.handleEdit(item); onEdit?.(item) }}
                      title="Editar">
                      <Edit2 size={14} />
                    </button>
                    <button type="button" className="action-icon-btn delete"
                      onClick={() => crud.handleDelete(item)}
                      title="Eliminar">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ===== BASE/ORIGINALS EDITOR ===== */}
      <div
        className={`base-editor-panel ${showBase ? '' : 'crud-panel-hidden'}`}
        id={baseEditorPanelId || `base-${collectionName}-editor`}
      >
        <div className="reasons-editor-card">
          <div className="crud-subsection-title">Editar originales</div>
          <h3><Edit2 size={18} /> Editor de {collectionLabel} originales</h3>

          <div className="crud-stats-bar">
            <CrudStatButton filter="all" value={crud.totalCount} label="Total" activeFilter={activeCrudFilter} onClick={onCrudFilterClick} />
            <CrudStatButton filter="overridden" value={crud.editedBaseCount} label="Editados" activeFilter={activeCrudFilter} onClick={onCrudFilterClick} />
            <CrudStatButton filter="hidden" value={crud.hiddenBaseCount} label="Ocultos" activeFilter={activeCrudFilter} onClick={onCrudFilterClick} />
            <CrudStatButton filter="visible" value={crud.totalCount - crud.hiddenBaseCount} label="Visibles" activeFilter={activeCrudFilter} onClick={onCrudFilterClick} />
          </div>

          <form className="editor-form" onSubmit={(e) => { crud.handleBaseSubmit(e) }}>
            {fields.map((field) => (
              <div className="editor-field" key={`base-${field.name}`}>
                <label htmlFor={`base-${collectionName}-${field.name}`}>{field.label}{field.required ? ' *' : ''}</label>
                {field.type === 'textarea' ? (
                  <textarea
                    id={`base-${collectionName}-${field.name}`}
                    rows={field.rows || 4}
                    placeholder={field.placeholder || ''}
                    value={crud.getBaseFormValue(field.name)}
                    onChange={(e) => crud.setBaseFormValue(field.name, e.target.value)}
                    required={field.required}
                  />
                ) : (
                  <input
                    id={`base-${collectionName}-${field.name}`}
                    type={field.type || 'text'}
                    placeholder={field.placeholder || ''}
                    value={crud.getBaseFormValue(field.name)}
                    onChange={(e) => crud.setBaseFormValue(field.name, e.target.value)}
                    required={field.required}
                  />
                )}
              </div>
            ))}
            <div className="form-actions">
              <button type="submit" className="control-btn submit-btn" disabled={!crud.editingBaseId}>
                Guardar override
              </button>
              {crud.editingBaseId && (
                <button type="button" className="ghost-button cancel-btn" onClick={crud.resetBaseForm}>
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="reasons-list-card">
          <div className="reasons-list-header">
            <h3>{collectionLabel} originales</h3>
            <span>{crud.totalCount} items</span>
          </div>

          {filteredBaseItems.length === 0 ? (
            <p className="no-items">No hay elementos originales para mostrar con este filtro.</p>
          ) : (
            <div className="reason-items-list">
              {filteredBaseItems.map((item) => (
                <div className={`reason-item-row ${item.isOverridden ? 'overridden' : ''} ${item.isHidden ? 'hidden-item' : ''}`} key={item.id}>
                  <div className="item-info">
                    {listFields ? listFields.map((f, i) => {
                      if (i === 0) return <strong key={f}>{item[f]}</strong>
                      return <span key={f}>{item[f]}</span>
                    }) : (
                      <>
                        <strong>{item.title || item.displayLabel || item.id}</strong>
                        <span>{item.text || item.description || ''}</span>
                      </>
                    )}
                    {item.isOverridden && <small className="text-pink">(editado)</small>}
                    {item.isHidden && <small className="text-muted">(oculto)</small>}
                  </div>
                  <div className="item-actions">
                    <button type="button" className="action-icon-btn edit"
                      onClick={() => crud.handleBaseEdit(item)} title="Editar original">
                      <Edit2 size={14} />
                    </button>
                    {item.isOverridden && (
                      <button type="button" className="action-icon-btn restore"
                        onClick={() => crud.handleBaseRestore(item.id)} title="Restaurar">
                        <Edit2 size={14} />
                      </button>
                    )}
                    <button type="button" className="action-icon-btn delete"
                      onClick={() => item.isHidden ? crud.handleBaseUnhide(item.id) : crud.handleBaseHide(item)}
                      title={item.isHidden ? 'Mostrar' : 'Ocultar'}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
