import React from 'react'
import { Link, useNavigate } from 'react-router-dom'

export default function NavBar(){
  const user = sessionStorage.getItem('user') || 'User'
  const navigate = useNavigate()

  function logout(){
    sessionStorage.removeItem('user')
    navigate('/')
  }

  return (
    <nav className="navbar">
      <div className="nav-left">
        <Link to="/feed" className="brand">Talha Social</Link>
        <Link to="/feed" className="nav-link">Feed</Link>
        <Link to="/profile" className="nav-link">Profile</Link>
        <Link to="/connections" className="nav-link">Connections</Link>
      </div>

      <div className="nav-right">
        <span className="muted">{user}</span>
        <Link to="/welcome" className="nav-link">Home</Link>
        <button onClick={logout} className="btn-logout">Logout</button>
      </div>
    </nav>
  )
}
