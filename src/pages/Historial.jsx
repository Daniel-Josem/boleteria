import { useState, useEffect } from 'react'
import { suscribirMovimientos } from '../firebase/boletas'
import styles from './Historial.module.css'

export default function Historial() {
  const [movimientos, setMovimientos] = useState([])
  const [busqueda, setBusqueda] = useState('')

  useEffect(() => suscribirMovimientos(setMovimientos), [])

  const filtrados = movimientos.filter(m =>
    !busqueda ||
    m.descripcion?.toLowerCase().includes(busqueda.toLowerCase()) ||
    m.nombreUsuario?.toLowerCase().includes(busqueda.toLowerCase()) ||
    String(m.desdeUsado).includes(busqueda) ||
    String(m.hastaUsado).includes(busqueda)
  )

  const totalUsadas = movimientos.reduce((s, m) => s + m.cantidad, 0)

  const formatFecha = (ts) => {
    if (!ts) return '—'
    const d = ts?.toDate ? ts.toDate() : new Date(ts)
    return d.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Historial</h1>
          <p className={styles.subtitle}>Registro completo de boletas utilizadas con sus consecutivos</p>
        </div>
        <div className={styles.totalChip}>
          <strong>{totalUsadas.toLocaleString()}</strong> boletas usadas en total
        </div>
      </div>

      <div className={styles.toolbar}>
        <div className={styles.search}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            placeholder="Buscar por proceso, evento o número de boleta..."
            className={styles.searchInput}
          />
        </div>
      </div>

      {filtrados.length === 0 ? (
        <div className={styles.empty}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.5">
            <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
          </svg>
          <p>{movimientos.length === 0 ? 'No hay movimientos aún.' : 'Sin resultados para esta búsqueda.'}</p>
        </div>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Responsable</th>
                <th>Proceso / Evento</th>
                <th>Consecutivos usados</th>
                <th>Cantidad</th>
                <th>Lote origen</th>
                <th>Fecha</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map(m => (
                <tr key={m.id}>
                  <td>
                    <div className={styles.nombreCell}>
                      <div className={styles.avatar}>{(m.nombreUsuario || '?')[0].toUpperCase()}</div>
                      {m.nombreUsuario || 'Sin nombre'}
                    </div>
                  </td>
                  <td>
                    <div className={styles.descCell}>{m.descripcion || '—'}</div>
                  </td>
                  <td>
                    <div className={styles.consecutivosCell}>
                      <span className={styles.consNum}>{m.desdeUsado?.toLocaleString()}</span>
                      <span className={styles.consSep}>—</span>
                      <span className={styles.consNum}>{m.hastaUsado?.toLocaleString()}</span>
                    </div>
                  </td>
                  <td>
                    <span className={styles.cantidadBadge}>{m.cantidad.toLocaleString()}</span>
                  </td>
                  <td>
                    <div className={styles.loteCell}>
                      {m.loteDesde?.toLocaleString()} — {m.loteHasta?.toLocaleString()}
                    </div>
                  </td>
                  <td className={styles.fechaCell}>{formatFecha(m.fecha)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
