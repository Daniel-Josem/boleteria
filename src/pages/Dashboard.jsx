import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { suscribirLotes, suscribirMovimientos } from '../firebase/boletas'
import styles from './Dashboard.module.css'

export default function Dashboard() {
  const [lotes, setLotes] = useState([])
  const [movimientos, setMovimientos] = useState([])

  useEffect(() => {
    const u1 = suscribirLotes(setLotes)
    const u2 = suscribirMovimientos(setMovimientos)
    return () => { u1(); u2() }
  }, [])

  const totalDisponibles = lotes.reduce((s, l) => s + (l.total - l.usadas), 0)
  const totalUsadas = lotes.reduce((s, l) => s + l.usadas, 0)
  const totalBoletas = lotes.reduce((s, l) => s + l.total, 0)
  const pct = totalBoletas > 0 ? Math.round((totalDisponibles / totalBoletas) * 100) : 0
  const statusColor = pct > 50 ? '#22c55e' : pct > 20 ? '#f59e0b' : '#ef4444'
  const ultimosMovs = movimientos.slice(0, 6)

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Dashboard</h1>
          <p className={styles.subtitle}>Control de consecutivos de boletas</p>
        </div>
        <div className={styles.headerActions}>
          <Link to="/inventario" className={styles.recargarBtn}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Nuevo lote
          </Link>
          <Link to="/usar" className={styles.usarBtn}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 014-4h14"/>
              <polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 01-4 4H3"/>
            </svg>
            Usar Boletas
          </Link>
        </div>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: '#eff6ff', color: '#3b82f6' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/></svg>
          </div>
          <div>
            <div className={styles.statVal} style={{ color: '#3b82f6' }}>{totalDisponibles.toLocaleString()}</div>
            <div className={styles.statLabel}>Disponibles</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: '#fef2f2', color: '#ef4444' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 014-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 01-4 4H3"/></svg>
          </div>
          <div>
            <div className={styles.statVal} style={{ color: '#ef4444' }}>{totalUsadas.toLocaleString()}</div>
            <div className={styles.statLabel}>Usadas</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: '#f0fdf4', color: '#22c55e' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg>
          </div>
          <div>
            <div className={styles.statVal} style={{ color: '#22c55e' }}>{lotes.filter(l => !l.agotado).length}</div>
            <div className={styles.statLabel}>Lotes activos</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: '#fffbeb', color: '#f59e0b' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          </div>
          <div>
            <div className={styles.statVal} style={{ color: '#f59e0b' }}>{movimientos.length}</div>
            <div className={styles.statLabel}>Movimientos</div>
          </div>
        </div>
      </div>

      <div className={styles.grid2}>
        {/* Lotes */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Lotes registrados</h2>
            <Link to="/inventario" className={styles.cardLink}>Ver todo →</Link>
          </div>
          {lotes.length === 0 ? (
            <div className={styles.emptyCard}>
              <p>No hay lotes registrados.</p>
              <Link to="/inventario" className={styles.emptyBtn}>Registrar lote</Link>
            </div>
          ) : (
            <div className={styles.lotesList}>
              {lotes.slice(0, 5).map(l => {
                const disp = l.total - l.usadas
                const pctL = Math.round((disp / l.total) * 100)
                const c = l.agotado ? '#ef4444' : pctL > 50 ? '#22c55e' : pctL > 10 ? '#f59e0b' : '#ef4444'
                return (
                  <div key={l.id} className={styles.loteRow}>
                    <div className={styles.loteInfo}>
                      <div className={styles.loteRango}>{l.desde.toLocaleString()} — {l.hasta.toLocaleString()}</div>
                      <div className={styles.loteDesc}>{l.descripcion || `${l.total.toLocaleString()} boletas`}</div>
                    </div>
                    <div className={styles.loteRight}>
                      <div className={styles.loteBarWrap}>
                        <div className={styles.loteBar}><div className={styles.loteBarFill} style={{ width: `${pctL}%`, background: c }} /></div>
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 700, color: c, minWidth: 32, textAlign: 'right' }}>{l.agotado ? '0%' : `${pctL}%`}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Últimos movimientos */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Últimos usos</h2>
            <Link to="/historial" className={styles.cardLink}>Ver todo →</Link>
          </div>
          {ultimosMovs.length === 0 ? (
            <div className={styles.emptyCard}><p>No hay movimientos aún.</p></div>
          ) : (
            <div className={styles.movsList}>
              {ultimosMovs.map(m => (
                <div key={m.id} className={styles.movRow}>
                  <div className={styles.movConsecutivos}>
                    <span className={styles.movNum}>{m.desdeUsado?.toLocaleString()}</span>
                    <span className={styles.movSep}>—</span>
                    <span className={styles.movNum}>{m.hastaUsado?.toLocaleString()}</span>
                  </div>
                  <div className={styles.movInfo}>
                    <div className={styles.movDesc}>{m.descripcion || 'Uso de boletas'}</div>
                    <div className={styles.movFecha}>{m.fecha ? (m.fecha?.toDate ? m.fecha.toDate() : new Date(m.fecha)).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—'}</div>
                  </div>
                  <div className={styles.movCantidad}>−{m.cantidad.toLocaleString()}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
