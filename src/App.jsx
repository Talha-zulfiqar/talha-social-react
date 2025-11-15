import React from 'react'
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
