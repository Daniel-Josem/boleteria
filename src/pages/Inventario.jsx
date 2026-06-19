import { useState, useEffect } from 'react'
import { suscribirLotes, crearLote } from '../firebase/boletas'
import Modal from '../components/Modal'
import styles from './Inventario.module.css'

export default function Inventario() {
  const [lotes, setLotes] = useState([])
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({ desde: '', hasta: '', descripcion: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => suscribirLotes(setLotes), [])

  const totalDisponibles = lotes.reduce((s, l) => s + (l.total - l.usadas), 0)
  const totalBoletas = lotes.reduce((s, l) => s + l.total, 0)

  const handleCrear = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.desde || !form.hasta) return setError('Ingresa el rango de consecutivos.')
    setLoading(true)
    try {
      await crearLote(form)
      setModal(false)
      setForm({ desde: '', hasta: '', descripcion: '' })
    } catch (err) {
      setError(err.message)
    }
    setLoading(false)
  }

  const previewTotal = form.desde && form.hasta && Number(form.hasta) > Number(form.desde)
    ? Number(form.hasta) - Number(form.desde) + 1 : null

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Inventario de Lotes</h1>
          <p className={styles.subtitle}>Registra tacos y cajas con sus rangos de consecutivos</p>
        </div>
        <button className={styles.addBtn} onClick={() => { setForm({ desde: '', hasta: '', descripcion: '' }); setError(''); setModal(true) }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Nuevo lote
        </button>
      </div>

      {/* Resumen */}
      <div className={styles.resumen}>
        <div className={styles.resumenItem}>
          <span className={styles.resumenVal} style={{ color: '#3b82f6' }}>{totalDisponibles.toLocaleString()}</span>
          <span className={styles.resumenLabel}>Disponibles</span>
        </div>
        <div className={styles.resumenDivider} />
        <div className={styles.resumenItem}>
          <span className={styles.resumenVal} style={{ color: '#ef4444' }}>{(totalBoletas - totalDisponibles).toLocaleString()}</span>
          <span className={styles.resumenLabel}>Usadas</span>
        </div>
        <div className={styles.resumenDivider} />
        <div className={styles.resumenItem}>
          <span className={styles.resumenVal}>{totalBoletas.toLocaleString()}</span>
          <span className={styles.resumenLabel}>Total registradas</span>
        </div>
        <div className={styles.resumenDivider} />
        <div className={styles.resumenItem}>
          <span className={styles.resumenVal}>{lotes.length}</span>
          <span className={styles.resumenLabel}>Lotes</span>
        </div>
      </div>

      {lotes.length === 0 ? (
        <div className={styles.empty}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.5">
            <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
          </svg>
          <p>No hay lotes registrados.</p>
          <button className={styles.addBtn} onClick={() => { setForm({ desde: '', hasta: '', descripcion: '' }); setModal(true) }}>
            Registrar primer lote
          </button>
        </div>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Descripción</th>
                <th>Rango consecutivos</th>
                <th>Total</th>
                <th>Usadas</th>
                <th>Disponibles</th>
                <th>Siguiente</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {lotes.map(l => {
                const disponibles = l.total - l.usadas
                const pct = Math.round((disponibles / l.total) * 100)
                const statusColor = l.agotado ? '#ef4444' : pct > 50 ? '#22c55e' : pct > 10 ? '#f59e0b' : '#ef4444'
                return (
                  <tr key={l.id}>
                    <td>
                      <div className={styles.descCell}>
                        {l.descripcion || <span className={styles.noDesc}>Sin descripción</span>}
                      </div>
                    </td>
                    <td>
                      <div className={styles.rangoCell}>
                        <span className={styles.rango}>{l.desde.toLocaleString()}</span>
                        <span className={styles.rangoSep}>—</span>
                        <span className={styles.rango}>{l.hasta.toLocaleString()}</span>
                      </div>
                    </td>
                    <td><span className={styles.num}>{l.total.toLocaleString()}</span></td>
                    <td><span className={styles.num} style={{ color: '#ef4444' }}>{l.usadas.toLocaleString()}</span></td>
                    <td><span className={styles.num} style={{ color: '#22c55e', fontWeight: 700 }}>{disponibles.toLocaleString()}</span></td>
                    <td>
                      {l.agotado
                        ? <span className={styles.agotadoTag}>Agotado</span>
                        : <span className={styles.siguienteNum}>{l.consecutivoActual?.toLocaleString()}</span>
                      }
                    </td>
                    <td>
                      <div className={styles.statusWrap}>
                        <div className={styles.miniBar}>
                          <div className={styles.miniBarFill} style={{ width: `${pct}%`, background: statusColor }} />
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 600, color: statusColor }}>{pct}%</span>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <Modal title="Registrar nuevo lote" onClose={() => setModal(false)}>
          <form onSubmit={handleCrear} className={styles.form}>
            <div className={styles.rangoFields}>
              <div className={styles.field}>
                <label>Consecutivo inicial *</label>
                <input
                  type="number" value={form.desde} min="1"
                  onChange={e => setForm(p => ({ ...p, desde: e.target.value }))}
                  placeholder="Ej: 821501" className={styles.input} autoFocus
                />
              </div>
              <div className={styles.rangeSep}>—</div>
              <div className={styles.field}>
                <label>Consecutivo final *</label>
                <input
                  type="number" value={form.hasta} min="1"
                  onChange={e => setForm(p => ({ ...p, hasta: e.target.value }))}
                  placeholder="Ej: 822000" className={styles.input}
                />
              </div>
            </div>

            {previewTotal && (
              <div className={styles.preview}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                <strong>{previewTotal.toLocaleString()} boletas</strong> en este lote
                {previewTotal === 500 && ' — Taco'}
                {previewTotal === 5000 && ' — Caja'}
              </div>
            )}

            <div className={styles.field}>
              <label>Descripción</label>
              <input
                value={form.descripcion}
                onChange={e => setForm(p => ({ ...p, descripcion: e.target.value }))}
                placeholder="Ej: Taco #12, Caja lote marzo..."
                className={styles.input}
              />
            </div>

            {error && <p className={styles.error}>{error}</p>}
            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? 'Registrando...' : 'Registrar lote'}
            </button>
          </form>
        </Modal>
      )}
    </div>
  )
}
