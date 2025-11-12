import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './Login'
import Welcome from './Welcome'
import NavBar from './NavBar'
import Feed from './Feed'
import Profile from './Profile'
import Connections from './Connections'

function RequireAuth({ children }){
  const user = sessionStorage.getItem('user')
  if (!user) return <Navigate to="/" replace />
  return children
}

export default function App(){
  const isLogged = !!sessionStorage.getItem('user')

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
          <Route path="*" element={<Navigate to={isLogged?'/feed':'/'} replace />} />
        </Routes>
      </div>
    </>
  )
}
