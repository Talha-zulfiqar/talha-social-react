import React, { useEffect, useState, useCallback } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './Login'
import Welcome from './Welcome'
import NavBar from './NavBar'
import Feed from './Feed'
import Profile from './Profile'
import Connections from './Connections'
import Messages from './Messages'
import Debug from './Debug'
import Friends from './Friends'
import Watch from './Watch'
import Marketplace from './Marketplace'
import Groups from './Groups'
import Events from './Events'
import Pages from './Pages'
import { onAuthStateChanged } from './firebase'

export default function App(){
  // centralize auth state so RequireAuth uses the same source of truth
  const [isLogged, setIsLogged] = useState(() => !!sessionStorage.getItem('user'))

  const checkAuth = useCallback(() => {
    // defensive: sessionStorage may be cleared in other tabs
    try{
      return !!sessionStorage.getItem('user')
    }catch{
      return false
    }
  }, [])

  useEffect(() => {
    // subscribe to Firebase auth changes when available to keep UI in sync
    let unsubAuth = null
    try{
      unsubAuth = onAuthStateChanged(user => {
        // if Firebase reports a user, ensure sessionStorage reflects it
        if(user){
          try{ const name = user.displayName || user.email || user.uid; sessionStorage.setItem('user', name) }catch{}
        }else{
          try{ sessionStorage.removeItem('user') }catch{}
        }
        setIsLogged(checkAuth())
      })
    }catch(e){ /* ignore if firebase not initialized */ }

    function onAuthChange(){ setIsLogged(checkAuth()) }
    // listen for custom events and storage so changes propagate across tabs
    window.addEventListener('profileChanged', onAuthChange)
    window.addEventListener('appDataChanged', onAuthChange)
    window.addEventListener('storage', onAuthChange)

    // also re-check when the window gains focus (helps when user completes login in another tab)
    window.addEventListener('focus', onAuthChange)

    // initial reconciliation in case a login happened before React mounted
    setIsLogged(checkAuth())

    return () => {
      window.removeEventListener('profileChanged', onAuthChange)
      window.removeEventListener('appDataChanged', onAuthChange)
      window.removeEventListener('storage', onAuthChange)
      window.removeEventListener('focus', onAuthChange)
      if(typeof unsubAuth === 'function') unsubAuth()
    }
  }, [checkAuth])

  // RequireAuth now reads from the centralized isLogged state to avoid races
  function RequireAuth({ children }){
    if (!isLogged) return <Navigate to="/" replace />
    return children
  }

  return (
    <>
      {isLogged && <NavBar />}
      <div className="wrap">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/welcome" element={<RequireAuth><Welcome/></RequireAuth>} />
          <Route path="/feed" element={<RequireAuth><Feed/></RequireAuth>} />
          <Route path="/profile" element={<RequireAuth><Profile/></RequireAuth>} />
          <Route path="/connections" element={<RequireAuth><Connections/></RequireAuth>} />
          <Route path="/friends" element={<RequireAuth><Friends/></RequireAuth>} />
          <Route path="/watch" element={<RequireAuth><Watch/></RequireAuth>} />
          <Route path="/marketplace" element={<RequireAuth><Marketplace/></RequireAuth>} />
          <Route path="/groups" element={<RequireAuth><Groups/></RequireAuth>} />
          <Route path="/events" element={<RequireAuth><Events/></RequireAuth>} />
          <Route path="/pages" element={<RequireAuth><Pages/></RequireAuth>} />
          <Route path="/messages" element={<RequireAuth><Messages/></RequireAuth>} />
          <Route path="/debug" element={<Debug/>} />
          <Route path="*" element={<Navigate to={isLogged?'/feed':'/'} replace />} />
        </Routes>
      </div>
    </>
  )
}
