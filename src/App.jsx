import React, { useEffect, useState } from 'react'
import Login from './Login'
import Welcome from './Welcome'

export default function App(){
  const [route, setRoute] = useState(window.location.hash || '#/')

  useEffect(()=>{
    function onHash(){ setRoute(window.location.hash || '#/') }
    window.addEventListener('hashchange', onHash)
    return ()=> window.removeEventListener('hashchange', onHash)
  },[])

  // simple routing by hash
  if (route === '#/welcome') return <Welcome />
  return <Login />
}
