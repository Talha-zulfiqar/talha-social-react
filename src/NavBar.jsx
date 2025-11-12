import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

export default function NavBar(){
  const user = sessionStorage.getItem('user') || 'User'
  const navigate = useNavigate()
  const [profile, setProfile] = useState(()=>{
    try{ const raw = localStorage.getItem('profile'); return raw ? JSON.parse(raw) : { avatar: '' } }catch{ return { avatar: '' } }
  })
  const [menuOpen, setMenuOpen] = useState(false)
  const [unread, setUnread] = useState(()=>{ try{ const n = JSON.parse(localStorage.getItem('notifications')||'0'); return n||0 }catch{return 0} })

  useEffect(()=>{
    function onChange(){
      try{ const raw = localStorage.getItem('profile'); setProfile(raw ? JSON.parse(raw) : { avatar: '' }) }catch{}
      try{ const n = JSON.parse(localStorage.getItem('notifications')||'0'); setUnread(n||0) }catch{}
    }
    window.addEventListener('profileChanged', onChange)
    window.addEventListener('storage', onChange)
    return ()=>{
      window.removeEventListener('profileChanged', onChange)
      window.removeEventListener('storage', onChange)
    }
  },[])

  function logout(){
    sessionStorage.removeItem('user')
    navigate('/')
  }

  function clearNotifications(){
    localStorage.setItem('notifications','0')
    setUnread(0)
  }

  return (
    <nav className="navbar">
      <div className="nav-left">
        <button className="hamburger" onClick={()=>setMenuOpen(p=>!p)} aria-label="menu">☰</button>
        <Link to="/feed" className="brand">Talha Social</Link>
        <div className="nav-shortcuts">
          <Link to="/feed" className="nav-short">Home</Link>
          <Link to="/watch" className="nav-short">Watch</Link>
          <Link to="/marketplace" className="nav-short">Marketplace</Link>
          <Link to="/groups" className="nav-short">Groups</Link>
        </div>
      </div>

      <div className="nav-center">
        <input className="search" placeholder="Search" />
      </div>

      <div className="nav-right">
        <div className="icon-btn" title="Notifications" onClick={clearNotifications}>
          🔔
          {unread>0 && <span className="badge">{unread}</span>}
        </div>
        <Link to="/messages" className="icon-btn" title="Messages">💬</Link>
        {profile && profile.avatar ? (
          <Link to="/profile"><img src={profile.avatar} alt="avatar" className="nav-avatar" /></Link>
        ) : (
          <Link to="/profile" className="avatar nav-avatar-fallback">{user.slice(0,2).toUpperCase()}</Link>
        )}
        <button onClick={logout} className="btn-logout">Logout</button>
      </div>

      {menuOpen && (
        <div className="mobile-menu">
          <Link to="/feed">Feed</Link>
          <Link to="/profile">Profile</Link>
          <Link to="/connections">Connections</Link>
          <Link to="/messages">Messages</Link>
        </div>
      )}
    </nav>
  )
}
