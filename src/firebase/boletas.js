import {
  collection, addDoc, updateDoc, doc,
  onSnapshot, query, orderBy, serverTimestamp, getDoc, getDocs
} from 'firebase/firestore'
import { db } from './config'

const LOTES = 'lotes'
const MOVS = 'movimientos'

export function suscribirLotes(callback) {
  const q = query(collection(db, LOTES), orderBy('creadoEn', 'desc'))
  return onSnapshot(q, snap => callback(snap.docs.map(d => ({ id: d.id, ...d.data() }))))
}

export function suscribirMovimientos(callback) {
  const q = query(collection(db, MOVS), orderBy('fecha', 'desc'))
  return onSnapshot(q, snap => callback(snap.docs.map(d => ({ id: d.id, ...d.data() }))))
}

export async function crearLote({ desde, hasta, descripcion }) {
  const d = Number(desde)
  const h = Number(hasta)
  if (d >= h) throw new Error('El número inicial debe ser menor al final.')

  const snap = await getDocs(collection(db, LOTES))
  const lotes = snap.docs.map(doc => doc.data())
  const conflicto = lotes.find(l => d <= l.hasta && h >= l.desde)
  if (conflicto) {
    throw new Error(`El rango se cruza con el lote existente ${conflicto.desde.toLocaleString()} — ${conflicto.hasta.toLocaleString()}.`)
  }

  const total = h - d + 1
  await addDoc(collection(db, LOTES), {
    desde: d, hasta: h, total,
    usadas: 0,
    consecutivoActual: d,
    descripcion,
    agotado: false,
    creadoEn: serverTimestamp(),
  })
}

export async function usarDeLote(loteId, cantidad, descripcion, nombreUsuario) {
  const ref = doc(db, LOTES, loteId)
  const snap = await getDoc(ref)
  const lote = snap.data()
  const disponibles = lote.total - lote.usadas
  if (Number(cantidad) > disponibles) throw new Error(`Solo hay ${disponibles} disponibles en este lote.`)

  const desdeUsado = lote.consecutivoActual
  const hastaUsado = lote.consecutivoActual + Number(cantidad) - 1
  const nuevasUsadas = lote.usadas + Number(cantidad)

  await updateDoc(ref, {
    usadas: nuevasUsadas,
    consecutivoActual: hastaUsado + 1,
    agotado: nuevasUsadas >= lote.total,
  })

  await addDoc(collection(db, MOVS), {
    loteId,
    loteDesde: lote.desde,
    loteHasta: lote.hasta,
    desdeUsado,
    hastaUsado,
    cantidad: Number(cantidad),
    descripcion,
    nombreUsuario: nombreUsuario || 'Sin nombre',
    fecha: serverTimestamp(),
  })
}
