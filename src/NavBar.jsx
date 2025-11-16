import React, { useEffect, useState } from 'react'
import useTheme from './hooks/useTheme'
import Logo from './components/Logo'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { signOut as firebaseSignOut } from './firebase'

function Icon({name, size=18, className=''}){
  // Use width/height attributes and currentColor so icons inherit text color
  if(name==='bell') return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
  )
  if(name==='message') return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
  )
  if(name==='search') return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/><circle cx="11" cy="11" r="6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
  )
  return null
}

export default function NavBar(){
  const [user, setUser] = useState(() => sessionStorage.getItem('user') || 'User')
  const navigate = useNavigate()
  const [profile, setProfile] = useState(()=>{
    try{ const raw = localStorage.getItem('profile'); return raw ? JSON.parse(raw) : { avatar: '' } }catch{ return { avatar: '' } }
  })
  const [menuOpen, setMenuOpen] = useState(false)
  const [unread, setUnread] = useState(()=>{ try{ const n = JSON.parse(localStorage.getItem('notifications')||'0'); return n||0 }catch{return 0} })
  const [unreadMsgs, setUnreadMsgs] = useState(()=>{ try{ const u = JSON.parse(localStorage.getItem('unreadByConv')||'{}'); return Object.values(u).reduce((s,v)=>s+v,0)||0 }catch{return 0} })

  useEffect(()=>{
    function onChange(){
      try{ setUser(sessionStorage.getItem('user') || 'User') }catch{}
      try{ const raw = localStorage.getItem('profile'); setProfile(raw ? JSON.parse(raw) : { avatar: '' }) }catch{}
      try{ const n = JSON.parse(localStorage.getItem('notifications')||'0'); setUnread(n||0) }catch{}
      try{ const u = JSON.parse(localStorage.getItem('unreadByConv')||'{}'); setUnreadMsgs(Object.values(u).reduce((s,v)=>s+v,0)||0) }catch{}
    }
    window.addEventListener('profileChanged', onChange)
    window.addEventListener('appDataChanged', onChange)
    window.addEventListener('storage', onChange)
    return ()=>{
      window.removeEventListener('profileChanged', onChange)
      window.removeEventListener('appDataChanged', onChange)
      window.removeEventListener('storage', onChange)
    }
  },[])

  function logout(){
    try{ firebaseSignOut() }catch{}
    sessionStorage.removeItem('user')
    try{ window.dispatchEvent(new Event('profileChanged')) }catch{}
    navigate('/')
  }

  const [theme, setTheme] = useTheme()
  const location = useLocation()

  function clearNotifications(){
    localStorage.setItem('notifications','0')
    setUnread(0)
  }

  return (
    <nav className="topbar fixed left-0 right-0 top-0 h-16 z-60">
      <div className="topbar-inner max-w-[1200px] mx-auto h-full flex items-center justify-between px-4">

        {/* Left: hamburger + logo */}
        <div className="nav-left flex items-center gap-3">
          <button className="hamburger p-2" onClick={()=>setMenuOpen(p=>!p)} aria-label="menu">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
          <div className="logo-container">
            <Logo />
          </div>
        </div>

        {/* Center: nav tabs (hidden on very small screens) */}
        <div className="nav-center flex-1 flex justify-center">
          <div className="nav-tabs hidden sm:flex items-center gap-4">
            <Link to="/feed" className={`nav-tab ${location.pathname.startsWith('/feed') ? 'active' : ''}`}>Home</Link>
            <Link to="/watch" className={`nav-tab ${location.pathname.startsWith('/watch') ? 'active' : ''}`}>Watch</Link>
            <Link to="/marketplace" className={`nav-tab ${location.pathname.startsWith('/marketplace') ? 'active' : ''}`}>Marketplace</Link>
            <Link to="/groups" className={`nav-tab ${location.pathname.startsWith('/groups') ? 'active' : ''}`}>Groups</Link>
          </div>
        </div>

        {/* Right: actions */}
        <div className="nav-right flex items-center gap-3">
          <div className="search-wrap hidden md:flex items-center">
            <Icon name="search" className="text-current mr-2" />
            <input className="search" placeholder="Search" />
          </div>

          <button title="Toggle theme" onClick={()=>setTheme(theme==='dark'?'light':'dark')} className="btn-ghost" aria-label="Toggle theme">
            {theme==='dark' ? '☀️' : '🌙'}
          </button>
          <button className="nav-action icon-btn" title="Notifications" onClick={clearNotifications}>
            <Icon name="bell" />
            {unread>0 && <span className="badge">{unread}</span>}
          </button>
          <Link to="/messages" className="nav-action icon-btn" title="Messages"><Icon name="message" />{unreadMsgs>0 && <span className="badge">{unreadMsgs}</span>}</Link>
          {profile && profile.avatar ? (
            <Link to="/profile" className="nav-action"><img src={profile.avatar} alt="avatar" className="nav-avatar" /></Link>
          ) : (
            <Link to="/profile" className="nav-action avatar nav-avatar-fallback">{user.slice(0,2).toUpperCase()}</Link>
          )}
          <button onClick={logout} className="nav-action btn-logout">Logout</button>
        </div>

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
