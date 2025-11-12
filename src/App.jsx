import React, { useEffect, useState } from 'react'
import Login from './Login'
import Welcome from './Welcome'
import NavBar from './NavBar'
import Feed from './Feed'
import Profile from './Profile'
import Connections from './Connections'

export default function App(){
  const [route, setRoute] = useState(window.location.hash || '#/')

  useEffect(()=>{
    function onHash(){ setRoute(window.location.hash || '#/') }
    window.addEventListener('hashchange', onHash)
    return ()=> window.removeEventListener('hashchange', onHash)
  },[])

  // If logged out, show Login
  const isLogged = !!sessionStorage.getItem('user')

  // simple hash-based routing
  function renderRoute(){
    if (!isLogged) return <Login />
    switch(route){
      case '#/welcome': return <Welcome />
      case '#/feed': return <Feed />
      case '#/profile': return <Profile />
      case '#/connections': return <Connections />
      default: return <Feed />
    }
  }

  return (
    <>
      {isLogged && <NavBar />}
      <div className="wrap">
        {renderRoute()}
      </div>
    </>
  )
}
