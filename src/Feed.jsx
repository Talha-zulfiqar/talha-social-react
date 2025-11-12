import React, { useEffect, useState } from 'react'

function Avatar({name, src, size=40}){
  if (src) return <img src={src} alt={name} style={{width:size,height:size,borderRadius:'50%'}} />
  const initials = name.split(' ').map(s=>s[0]).join('').slice(0,2).toUpperCase()
  return <div className="avatar" style={{width:size,height:size,fontSize:size/2}}>{initials}</div>
}

export default function Feed(){
  const [posts, setPosts] = useState([])
  const [text, setText] = useState('')

  useEffect(()=>{
    const raw = localStorage.getItem('posts')
    setPosts(raw? JSON.parse(raw) : [{id:1, author:'Alex', text:'Excited to share my latest project — built with React!', comments:[]},{id:2,author:'Mina',text:'Great article on frontend performance.',comments:[]}])
  },[])

  function save(items){
    localStorage.setItem('posts', JSON.stringify(items))
    setPosts(items)
  }

  function addPost(e){
    e.preventDefault()
    if (!text.trim()) return
    const user = sessionStorage.getItem('user') || 'You'
    const next = [{id:Date.now(), author:user, text:text.trim(), comments:[]}, ...posts]
    save(next)
    setText('')
  }

  function addComment(postId, comment){
    const next = posts.map(p => p.id===postId ? {...p, comments:[...p.comments, {id:Date.now(), author:sessionStorage.getItem('user')||'You', text:comment}]} : p)
    save(next)
  }

  return (
    <section className="card">
      <h2>Feed</h2>

      <form onSubmit={addPost} style={{marginTop:12}}>
        <textarea value={text} onChange={e=>setText(e.target.value)} placeholder="What's on your mind?" style={{width:'100%',padding:10,borderRadius:8}} />
        <div style={{display:'flex',gap:8,marginTop:8}}>
          <button className="primary" type="submit">Post</button>
        </div>
      </form>

      <div style={{display:'grid',gap:12,marginTop:18}}>
        {posts.map(p => (
          <article key={p.id} className="post-card">
            <div style={{display:'flex',gap:12,alignItems:'center'}}>
              <Avatar name={p.author} src={p.avatar} />
              <div>
                <div style={{fontWeight:700}}>{p.author}</div>
                <div className="muted" style={{fontSize:12}}>{new Date(Number(p.id)).toLocaleString()}</div>
              </div>
            </div>
            <div style={{marginTop:10}}>{p.text}</div>

            <div style={{marginTop:10}}>
              <Comments comments={p.comments||[]} onAdd={(c)=>addComment(p.id,c)} />
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

function Comments({comments, onAdd}){
  const [val, setVal] = useState('')
  return (
    <div>
      {comments.map(c=> (
        <div key={c.id} style={{padding:'8px 0',borderTop:'1px solid #f0f7ff'}}>
          <div style={{fontWeight:700,fontSize:13}}>{c.author}</div>
          <div style={{fontSize:14}}>{c.text}</div>
        </div>
      ))}
      <form onSubmit={(e)=>{e.preventDefault(); if(val.trim()){onAdd(val.trim()); setVal('')}}} style={{marginTop:8}}>
        <input value={val} onChange={e=>setVal(e.target.value)} placeholder="Write a comment" style={{width:'100%',padding:8,borderRadius:6}} />
      </form>
    </div>
  )
}
