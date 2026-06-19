import { Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import Inventario from './pages/Inventario'
import UsarBoletas from './pages/UsarBoletas'
import Historial from './pages/Historial'
import styles from './App.module.css'

export default function App() {
  return (
    <div className={styles.layout}>
      <Sidebar />
      <main className={styles.main}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/inventario" element={<Inventario />} />
          <Route path="/usar" element={<UsarBoletas />} />
          <Route path="/historial" element={<Historial />} />
        </Routes>
      </main>
    </div>
  )
}
