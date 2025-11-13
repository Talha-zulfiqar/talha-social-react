import React, { useEffect, useState, useRef } from 'react'

// Simple client-side messaging UI stored in localStorage
const CONTACTS = ["Alex","Mina","Sara","Omar"]

function formatTime(ts){
  return new Date(ts).toLocaleTimeString()
}

export default function Messages(){
  const [conversations, setConversations] = useState({})
  const [selected, setSelected] = useState(CONTACTS[0])
  const [text, setText] = useState('')
  const listRef = useRef(null)
  const [profile, setProfile] = useState(()=>{ try{ return JSON.parse(localStorage.getItem('profile')||'{}') }catch{return {}} })
  const [profile, setProfile] = useState(()=>{ try{ return JSON.parse(localStorage.getItem('profile')||'{}') }catch{return {}} })

  useEffect(()=>{
    const raw = localStorage.getItem('conversations')
    setConversations(raw? JSON.parse(raw) : {})
    // clear unread messages when opening Messages
    try{ localStorage.setItem('unreadMessages','0'); window.dispatchEvent(new Event('appDataChanged')) }catch{}
  },[])

  useEffect(()=>{
    // scroll to bottom when selected changes
    if(listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight
  },[selected, conversations])

  useEffect(()=>{
    function onProfileChange(){
      try{ setProfile(JSON.parse(localStorage.getItem('profile')||'{}')) }catch{}
    }
    window.addEventListener('profileChanged', onProfileChange)
    window.addEventListener('appDataChanged', onProfileChange)
    window.addEventListener('storage', onProfileChange)
    return ()=>{
      window.removeEventListener('profileChanged', onProfileChange)
      window.removeEventListener('appDataChanged', onProfileChange)
      window.removeEventListener('storage', onProfileChange)
    }
  },[])

  useEffect(()=>{
    function onProfileChange(){
      try{ setProfile(JSON.parse(localStorage.getItem('profile')||'{}')) }catch{}
    }
    window.addEventListener('profileChanged', onProfileChange)
    window.addEventListener('storage', onProfileChange)
    return ()=>{
      window.removeEventListener('profileChanged', onProfileChange)
      window.removeEventListener('storage', onProfileChange)
    }
  },[])

  function save(next){
    localStorage.setItem('conversations', JSON.stringify(next))
    setConversations(next)
  }

  function send(){
    if(!text.trim()) return
    const user = sessionStorage.getItem('user') || 'You'
    const conv = conversations[selected] || []
    const msg = { id: Date.now(), author: user, text: text.trim(), time: Date.now() }
    const next = { ...conversations, [selected]: [...conv, msg] }
    save(next)
    setText('')
    try{ localStorage.setItem('unreadMessages','0'); window.dispatchEvent(new Event('appDataChanged')) }catch{}
  }

  function avatarFor(name){
    if(name === (sessionStorage.getItem('user')||'You')) return profile && profile.avatar ? profile.avatar : null
    return null
  }

  return (
    <section className="card">
      <h2>Messages</h2>
      <div style={{display:'flex',gap:12,marginTop:12}}>
        <aside style={{width:200}}>
          <div style={{fontWeight:700,marginBottom:8}}>Contacts</div>
          <ul style={{listStyle:'none',padding:0,margin:0}}>
            {CONTACTS.map(c=> (
              <li key={c} style={{marginBottom:8}}>
                <button className={c===selected? 'primary' : 'btn-logout'} style={{width:'100%'}} onClick={()=>setSelected(c)}>{c}</button>
              </li>
            ))}
          </ul>
        </aside>

        <div style={{flex:1,display:'flex',flexDirection:'column'}}>
          <div style={{fontWeight:700}}>{selected}</div>
          <div ref={listRef} className="message-list" style={{flex:1,overflow:'auto',marginTop:8,padding:8,border:'1px solid #eef6ff',borderRadius:8}}>
            {(conversations[selected]||[]).map(m=> (
              <div key={m.id} style={{display:'flex',gap:8,marginBottom:8,alignItems:'flex-start'}}>
                {avatarFor(m.author) ? (
                  <img src={avatarFor(m.author)} alt="avatar" style={{width:36,height:36,borderRadius:18}} />
                ) : (
                  <div className="avatar" style={{width:36,height:36,fontSize:14,display:'inline-flex',alignItems:'center',justifyContent:'center'}}>{m.author.slice(0,2).toUpperCase()}</div>
                )}
                <div style={{flex:1}}>
                  <div className="msg-author">{m.author} <span className="muted" style={{fontSize:11}}>• {formatTime(m.time)}</span></div>
                  <div className={"msg-text"} style={{marginTop:4}}>{m.text}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{marginTop:8,display:'flex',gap:8}}>
            <input value={text} onChange={e=>setText(e.target.value)} placeholder={`Message ${selected}...`} style={{flex:1,padding:8,borderRadius:6}} />
            <button className="primary" onClick={send}>Send</button>
          </div>
        </div>
      </div>
    </section>
  )
}
