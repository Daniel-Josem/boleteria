import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { suscribirLotes, usarDeLote } from '../firebase/boletas'
import styles from './UsarBoletas.module.css'

const FORM_INICIAL = { loteId: '', cantidad: '', descripcion: '', nombre: '' }

export default function UsarBoletas() {
  const [lotes, setLotes] = useState([])
  const [form, setForm] = useState(FORM_INICIAL)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => suscribirLotes(setLotes), [])

  const lotesActivos = lotes.filter(l => !l.agotado)
  const loteSeleccionado = lotes.find(l => l.id === form.loteId)
  const disponiblesEnLote = loteSeleccionado ? loteSeleccionado.total - loteSeleccionado.usadas : 0
  const desdePreview = loteSeleccionado?.consecutivoActual
  const hastaPreview = form.cantidad && loteSeleccionado
    ? loteSeleccionado.consecutivoActual + Number(form.cantidad) - 1 : null
  const valida = hastaPreview && hastaPreview <= loteSeleccionado?.hasta

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.loteId) return setError('Selecciona un lote.')
    if (!form.cantidad || Number(form.cantidad) < 1) return setError('Indica una cantidad válida.')
    if (!form.nombre.trim()) return setError('Ingresa el nombre de quien usa las boletas.')
    if (!form.descripcion.trim()) return setError('Describe el proceso o evento.')

    setLoading(true)
    try {
      await usarDeLote(form.loteId, form.cantidad, form.descripcion, form.nombre)
      setForm(FORM_INICIAL)
      navigate('/historial')
    } catch (err) {
      setError(err.message || 'Error al registrar.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Usar Boletas</h1>
        <p className={styles.subtitle}>Descuenta boletas del inventario y registra los consecutivos utilizados</p>
      </div>

      <div className={styles.layout}>
        <div className={styles.formCard}>
          <form onSubmit={handleSubmit} className={styles.form}>

            <div className={styles.field}>
              <label className={styles.label}>Lote a usar *</label>
              {lotesActivos.length === 0 ? (
                <div className={styles.noLotes}>No hay lotes con stock disponible. Registra uno en Inventario.</div>
              ) : (
                <div className={styles.lotesList}>
                  {lotesActivos.map(l => {
                    const disp = l.total - l.usadas
                    const selected = form.loteId === l.id
                    const cantNum = selected ? Number(form.cantidad) : 0
                    const previewDesde = l.consecutivoActual
                    const previewHasta = cantNum > 0 ? l.consecutivoActual + cantNum - 1 : null
                    const previewValida = previewHasta && previewHasta <= l.hasta

                    return (
                      <button
                        key={l.id} type="button"
                        className={`${styles.loteOption} ${selected ? styles.loteSelected : ''}`}
                        onClick={() => setForm(p => ({ ...p, loteId: l.id, cantidad: '' }))}
                      >
                        <div className={styles.loteOptionTop}>
                          <span className={styles.loteRango}>{l.desde.toLocaleString()} — {l.hasta.toLocaleString()}</span>
                          <span className={styles.loteDisp}>{disp.toLocaleString()} disponibles</span>
                        </div>
                        {l.descripcion && <div className={styles.loteDesc}>{l.descripcion}</div>}

                        {selected && cantNum > 0 ? (
                          <>
                            <div className={`${styles.lotePreviewRango} ${!previewValida ? styles.lotePreviewError : ''}`}>
                              {previewValida ? (
                                <>
                                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                                  Se usarán: <strong>{previewDesde.toLocaleString()}</strong> al <strong>{previewHasta.toLocaleString()}</strong>
                                  <span className={styles.lotePreviewCant}>({cantNum.toLocaleString()} boletas)</span>
                                </>
                              ) : (
                                <>
                                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                                  Excede el stock disponible ({disp.toLocaleString()})
                                </>
                              )}
                            </div>
                            {previewValida && (
                              <div className={styles.loteQuedan}>
                                Quedarán <strong>{(disp - cantNum).toLocaleString()}</strong> · Próximo: <strong>{(previewHasta + 1).toLocaleString()}</strong>
                              </div>
                            )}
                          </>
                        ) : (
                          <div className={styles.loteSiguiente}>
                            Siguiente: <strong>{l.consecutivoActual?.toLocaleString()}</strong>
                          </div>
                        )}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Nombre de quien usa *</label>
              <input
                type="text"
                value={form.nombre}
                onChange={e => setForm(p => ({ ...p, nombre: e.target.value }))}
                placeholder="Ej: Juan Pérez"
                className={styles.input}
                disabled={!form.loteId}
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Proceso / Evento *</label>
              <textarea
                value={form.descripcion}
                onChange={e => setForm(p => ({ ...p, descripcion: e.target.value }))}
                placeholder="Ej: Evento apertura — 19 jun 2026"
                className={styles.textarea}
                rows={3}
                disabled={!form.loteId}
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Cantidad a usar *</label>
              <input
                type="number"
                value={form.cantidad}
                onChange={e => setForm(p => ({ ...p, cantidad: e.target.value }))}
                placeholder="Ej: 500"
                className={styles.input}
                min="1"
                max={disponiblesEnLote}
                disabled={!form.loteId}
              />
            </div>

            {error && <p className={styles.error}>{error}</p>}

            <button type="submit" className={styles.submitBtn} disabled={loading || !form.loteId}>
              {loading
                ? <><span className={styles.spinner} /> Registrando...</>
                : <>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 014-4h14"/>
                      <polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 01-4 4H3"/>
                    </svg>
                    Registrar uso
                  </>
              }
            </button>
          </form>
        </div>

        <div className={styles.side}>
          <div className={styles.sideCard}>
            <h3 className={styles.sideTitle}>Resumen de lotes</h3>
            {lotes.length === 0 ? (
              <p className={styles.sideMuted}>No hay lotes registrados.</p>
            ) : (
              <div className={styles.sideList}>
                {lotes.map(l => {
                  const disp = l.total - l.usadas
                  const pct = Math.round((disp / l.total) * 100)
                  const color = l.agotado ? '#ef4444' : pct > 50 ? '#22c55e' : pct > 10 ? '#f59e0b' : '#ef4444'
                  return (
                    <div key={l.id} className={styles.sideItem}>
                      <div className={styles.sideItemTop}>
                        <span className={styles.sideRango}>{l.desde.toLocaleString()} — {l.hasta.toLocaleString()}</span>
                        <span className={styles.sideDisp} style={{ color }}>{l.agotado ? 'Agotado' : `${disp.toLocaleString()}`}</span>
                      </div>
                      {l.descripcion && <div className={styles.sideDesc}>{l.descripcion}</div>}
                      <div className={styles.sideBar}>
                        <div className={styles.sideBarFill} style={{ width: `${pct}%`, background: color }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
