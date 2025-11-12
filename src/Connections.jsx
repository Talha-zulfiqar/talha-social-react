import React from 'react'

const connections = ['Alex', 'Mina', 'Sara', 'Omar']

export default function Connections(){
  return (
    <section className="card">
      <h2>Connections</h2>
      <p className="muted">People you may know</p>
      <ul style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))',gap:10,marginTop:12}}>
        {connections.map((c,i)=> (
          <li key={i} style={{padding:10,border:'1px solid #eef6ff',borderRadius:8}}>
            <div style={{fontWeight:700}}>{c}</div>
            <button style={{marginTop:8,padding:'6px 8px',borderRadius:6,border:'none',background:'var(--blue)',color:'#fff',cursor:'pointer'}}>Connect</button>
          </li>
        ))}
      </ul>
    </section>
  )
}
