import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

function Icon({name, size=18}){
  const common = {width:size,height:size,display:'inline-block',verticalAlign:'middle'}
  if(name==='bell') return (
    <svg style={common} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
  )
  if(name==='message') return (
    <svg style={common} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
  )
  if(name==='search') return (
    <svg style={common} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21 21l-4.35-4.35" stroke="#6b7280" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/><circle cx="11" cy="11" r="6" stroke="#6b7280" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
  )
  return null
}

export default function NavBar(){
  const user = sessionStorage.getItem('user') || 'User'
  const navigate = useNavigate()
  const [profile, setProfile] = useState(()=>{
    try{ const raw = localStorage.getItem('profile'); return raw ? JSON.parse(raw) : { avatar: '' } }catch{ return { avatar: '' } }
  })
  const [menuOpen, setMenuOpen] = useState(false)
  const [unread, setUnread] = useState(()=>{ try{ const n = JSON.parse(localStorage.getItem('notifications')||'0'); return n||0 }catch{return 0} })
  const [unreadMsgs, setUnreadMsgs] = useState(()=>{ try{ const n = JSON.parse(localStorage.getItem('unreadMessages')||'0'); return n||0 }catch{return 0} })

  useEffect(()=>{
    function onChange(){
      try{ const raw = localStorage.getItem('profile'); setProfile(raw ? JSON.parse(raw) : { avatar: '' }) }catch{}
      try{ const n = JSON.parse(localStorage.getItem('notifications')||'0'); setUnread(n||0) }catch{}
      try{ const m = JSON.parse(localStorage.getItem('unreadMessages')||'0'); setUnreadMsgs(m||0) }catch{}
    }
    window.addEventListener('profileChanged', onChange)
    window.addEventListener('appDataChanged', onChange)
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
    <nav className="navbar topbar">
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
        <div className="search-wrap"><Icon name="search" /><input className="search" placeholder="Search Talha Social" /></div>
      </div>

      <div className="nav-right">
        <div className="icon-btn" title="Notifications" onClick={clearNotifications}>
          <Icon name="bell" />
          {unread>0 && <span className="badge">{unread}</span>}
        </div>
  <Link to="/messages" className="icon-btn" title="Messages"><Icon name="message" />{unreadMsgs>0 && <span className="badge">{unreadMsgs}</span>}</Link>
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
