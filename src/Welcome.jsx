import React, { useEffect, useState } from 'react'

export default function Welcome(){
  const [user, setUser] = useState('')
  const [text, setText] = useState('')
  const [list, setList] = useState([])

  useEffect(()=>{
    const u = sessionStorage.getItem('user')
    if (!u) return window.location.hash = '#/'
    setUser(u)
    load()
  },[])

  function load(){
    try{
      const raw = localStorage.getItem('feedbacks') || '[]'
      setList(JSON.parse(raw))
    }catch{ setList([]) }
  }

  function submit(e){
    e.preventDefault();
    if (!text.trim()) return
    const items = JSON.parse(localStorage.getItem('feedbacks') || '[]')
    items.push({ user, text: text.trim(), time: Date.now() })
    localStorage.setItem('feedbacks', JSON.stringify(items))
    setText('')
    load()
    alert('Thanks for your feedback!')
  }

  function logout(){
    sessionStorage.removeItem('user')
    window.location.hash = '#/'
  }

  return (
    <section className="card">
      <h1>Welcome to Talha Web</h1>
      <p className="subtitle">Hello, {user}! Welcome back.</p>

      <div className="controls-row" style={{marginTop:6, marginBottom:18}}>
        <button onClick={logout} className="primary" style={{width:'auto', padding:'8px 12px', background:'#fff', color:'var(--blue)', border:'1px solid #cfe7ff'}}>Log out</button>
      </div>

      <h3>Give feedback</h3>
      <form id="feedbackForm" onSubmit={submit}>
        <label className="field">
          <span className="label">Your feedback</span>
          <textarea value={text} onChange={e=>setText(e.target.value)} id="feedbackText" rows={4} />
        </label>
        <button className="primary" type="submit">Send feedback</button>
      </form>

      <div id="feedbackList" style={{marginTop:14}}>
        {list.length === 0 && <p className="muted">No feedback yet.</p>}
        {list.slice().reverse().map((f, i) => (
          <div key={i} style={{border:'1px solid #eef6ff', padding:10, borderRadius:8, marginBottom:8}}>
            <div style={{fontSize:13, color:'#234', marginBottom:6}}><strong>{f.user}</strong> — <span className="muted">{new Date(f.time).toLocaleString()}</span></div>
            <div>{f.text}</div>
          </div>
        ))}
      </div>
    </section>
  )
}
