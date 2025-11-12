import React from 'react'

export default function NavBar(){
  const user = sessionStorage.getItem('user') || 'User'

  return (
    <nav style={{position:'sticky',top:0,background:'rgba(255,255,255,0.9)',display:'flex',alignItems:'center',justifyContent:'space-between',padding:'10px 20px',boxShadow:'0 1px 6px rgba(0,0,0,0.06)'}}>
      <div style={{display:'flex',alignItems:'center',gap:12}}>
        <a href="#/feed" style={{fontWeight:700,color:'var(--blue)',textDecoration:'none'}}>Talha Social</a>
        <a href="#/feed" style={{color:'#345',textDecoration:'none'}}>Feed</a>
        <a href="#/profile" style={{color:'#345',textDecoration:'none'}}>Profile</a>
        <a href="#/connections" style={{color:'#345',textDecoration:'none'}}>Connections</a>
      </div>

      <div style={{display:'flex',alignItems:'center',gap:10}}>
        <span className="muted">{user}</span>
        <a href="#/welcome" style={{color:'var(--blue)',textDecoration:'none'}}>Home</a>
        <button onClick={()=>{ sessionStorage.removeItem('user'); window.location.hash='#/' }} style={{padding:'6px 10px',borderRadius:8,border:'1px solid #e6f1ff',background:'#fff',cursor:'pointer'}}>Logout</button>
      </div>
    </nav>
  )
}
