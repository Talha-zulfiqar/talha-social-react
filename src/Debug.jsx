import React from 'react'
import { auth, db, storage } from './firebase'

export default function Debug(){
  const cfg = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY ? 'present' : 'missing',
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '(none)',
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '(none)',
    appId: import.meta.env.VITE_FIREBASE_APP_ID ? 'present' : 'missing'
  }

  return (
    <section className="card">
      <h2>Firebase Debug</h2>
      <div style={{display:'grid',gap:8}}>
        <div><strong>authDomain:</strong> {cfg.authDomain}</div>
        <div><strong>projectId:</strong> {cfg.projectId}</div>
        <div><strong>apiKey set:</strong> {cfg.apiKey}</div>
        <div><strong>appId set:</strong> {cfg.appId}</div>
        <div><strong>Auth initialized:</strong> {auth? 'yes':'no'}</div>
        <div><strong>Firestore initialized:</strong> {db? 'yes':'no'}</div>
        <div><strong>Storage initialized:</strong> {storage? 'yes':'no'}</div>
        <div style={{marginTop:12,fontSize:13,color:'#555'}}>If values are missing or init shows 'no', ensure your <code>.env.local</code> is present and restart the dev server.</div>
      </div>
    </section>
  )
}
