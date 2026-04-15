import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyDnIhDyGv_s26Odvy0yfvqfe33kMz3MF1M",
  authDomain: "chore-calendar-5786.firebaseapp.com",
  projectId: "chore-calendar-5786",
  storageBucket: "chore-calendar-5786.firebasestorage.app",
  messagingSenderId: "57270537863",
  appId: "1:57270537863:web:2c47ea0c7aebe36f0ff222"
}

const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)