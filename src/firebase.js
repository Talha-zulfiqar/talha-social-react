// Firebase wrapper using ESM CDN imports so the project doesn't require npm install
// This file exports helpers for Auth (Google), Firestore (posts, profiles, messages) and Storage (images)

import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js'
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js'
import { getFirestore, collection, getDocs, onSnapshot, addDoc, doc, setDoc, serverTimestamp, query, orderBy, where } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js'
import { getStorage, ref, uploadString, getDownloadURL } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-storage.js'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
}

let app = null
let auth = null
let db = null
let storage = null

try{
  app = initializeApp(firebaseConfig)
  auth = getAuth(app)
  db = getFirestore(app)
  storage = getStorage(app)
}catch(e){
  // initialization may fail if env not set — consumers should handle errors
  console.warn('Firebase init failed', e)
}

const googleProvider = () => new GoogleAuthProvider()

export async function signInWithGooglePopup(){
  if(!auth) throw new Error('Firebase auth not initialized')
  const provider = googleProvider()
  const result = await signInWithPopup(auth, provider)
  return result.user
}

// Posts
export async function fetchPostsOnce(){
  if(!db) throw new Error('Firestore not initialized')
  const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export function subscribePosts(onUpdate){
  if(!db) throw new Error('Firestore not initialized')
  const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'))
  return onSnapshot(q, snapshot => {
    const posts = snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
    onUpdate(posts)
  })
}

export async function createPost({ author, text, image, avatar }){
  if(!db) throw new Error('Firestore not initialized')
  const payload = { author, text, image: image||null, avatar: avatar||null, createdAt: serverTimestamp(), comments: [] }
  const refDoc = await addDoc(collection(db, 'posts'), payload)
  return refDoc.id
}

// Storage
export async function uploadDataUrl(dataUrl, path='images'){
  if(!storage) throw new Error('Firebase storage not initialized')
  const key = `${path}/${Date.now()}.png`
  const r = ref(storage, key)
  await uploadString(r, dataUrl, 'data_url')
  const url = await getDownloadURL(r)
  return url
}

// Profiles
export async function getProfile(uidOrName){
  if(!db) throw new Error('Firestore not initialized')
  try{
    const d = await getDocs(query(collection(db, 'profiles'), where('name','==', uidOrName)))
    if(d.empty) return null
    const doc0 = d.docs[0]
    return { id: doc0.id, ...doc0.data() }
  }catch(e){
    return null
  }
}

export async function setProfile(profile){
  if(!db) throw new Error('Firestore not initialized')
  // use name as doc id for simplicity
  const id = profile.name || profile.id || (profile.email ? profile.email.split('@')[0] : 'user')
  await setDoc(doc(db, 'profiles', id), { ...profile, updatedAt: serverTimestamp() })
}

// Conversations & messages
export async function sendMessage(convId, message){
  if(!db) throw new Error('Firestore not initialized')
  const refDoc = await addDoc(collection(db, 'conversations', convId, 'messages'), { ...message, createdAt: serverTimestamp() })
  return refDoc.id
}

export async function fetchConversationMessages(convId){
  if(!db) throw new Error('Firestore not initialized')
  const snap = await getDocs(query(collection(db, 'conversations', convId, 'messages'), orderBy('createdAt', 'asc')))
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export { auth, db, storage }

export default { signInWithGooglePopup, fetchPostsOnce, subscribePosts, createPost, uploadDataUrl, setProfile, getProfile, sendMessage, fetchConversationMessages }
