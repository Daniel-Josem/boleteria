import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyCGfOMTXdgGooaU_xE2BfP8ZM6hWHECux0",
  authDomain: "boleteria-90a99.firebaseapp.com",
  projectId: "boleteria-90a99",
  storageBucket: "boleteria-90a99.firebasestorage.app",
  messagingSenderId: "1055397886085",
  appId: "1:1055397886085:web:915fe1cb90b4b0adf091ec",
  measurementId: "G-E0ZY3BXZ8H"
}

const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)
