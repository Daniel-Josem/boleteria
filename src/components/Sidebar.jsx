import { NavLink } from 'react-router-dom'
import styles from './Sidebar.module.css'

const nav = [
  {
    to: '/',
    label: 'Dashboard',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
  },
  {
    to: '/inventario',
    label: 'Inventario',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>,
  },
  {
    to: '/usar',
    label: 'Usar Boletas',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 014-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 01-4 4H3"/></svg>,
  },
  {
    to: '/historial',
    label: 'Historial',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  },
]

export default function Sidebar() {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>
        <img src="/eventu-icono.png" alt="Eventu" className={styles.logoImg} />
        <div>
          <div className={styles.logoTitle}>Eventu</div>
          <div className={styles.logoSub}>Control de Boletería</div>
        </div>
      </div>
      <nav className={styles.nav}>
        <p className={styles.navLabel}>Menú</p>
        {nav.map(({ to, label, icon }) => (
          <NavLink key={to} to={to} end={to === '/'}
            className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}>
            <span className={styles.icon}>{icon}</span>
            {label}
          </NavLink>
        ))}
      </nav>
      <div className={styles.footer}><div className={styles.version}>v1.0.0</div></div>
    </aside>
  )
}
