import React, { useEffect, useState } from 'react'
import { fetchPostsOnce, createPost, uploadDataUrl, subscribePosts } from './firebase'

function Avatar({name, src, size=40}){
  if (src) return <img src={src} alt={name} style={{width:size,height:size,borderRadius:'50%'}} />
  const initials = name.split(' ').map(s=>s[0]).join('').slice(0,2).toUpperCase()
  return <div className="avatar" style={{width:size,height:size,fontSize:size/2}}>{initials}</div>
}

export default function Feed(){
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [text, setText] = useState('')
  const [image, setImage] = useState(null)
  const [lightbox, setLightbox] = useState(null)

  useEffect(()=>{
    let mounted = true
    async function load(){
      try{
        const remote = await fetchPostsOnce()
        if(mounted && remote && remote.length){
          setPosts(remote)
          return
        }
      }catch(e){
        // no firestore available or error
      }

      const raw = localStorage.getItem('posts')
      const initial = raw? JSON.parse(raw) : [{id:1, author:'Alex', text:'Excited to share my latest project — built with React!', comments:[]},{id:2,author:'Mina',text:'Great article on frontend performance.',comments:[]}]
      // ensure at least one image post exists so dashboard shows images for demo
      const hasImage = initial.some(p => p.image)
      if(!hasImage){
        initial.unshift({ id: Date.now()-1000, author: 'Demo', text: 'Welcome — this is a demo image post.', image: '/assets/bg.svg', comments: [] })
        localStorage.setItem('posts', JSON.stringify(initial))
      }
      if(mounted) setPosts(initial)
      // try subscribing to remote posts if available
      try{
        const unsub = subscribePosts(p => { setPosts(p) })
        return ()=>{ mounted=false; unsub && unsub() }
      }catch(e){ mounted=false }
    }
    const maybe = load()
    (async ()=>{ try{ await maybe }catch{} finally{ if(mounted) setLoading(false) } })()
    return ()=>{ mounted=false }
  },[])

  function save(items){
    localStorage.setItem('posts', JSON.stringify(items))
    setPosts(items)
  }

  function addPost(e){
    e.preventDefault()
    if (!text.trim()) return
    const user = sessionStorage.getItem('user') || 'You'
    let authorAvatar = null
    try{ const pr = JSON.parse(localStorage.getItem('profile')||'{}'); authorAvatar = pr && pr.avatar ? pr.avatar : null }catch{}

    ;(async ()=>{
      try{
        let imageUrl = null
        if(image){
          if(image.startsWith('data:')){
            imageUrl = await uploadDataUrl(image, 'posts')
          }else{
            imageUrl = image
          }
        }
        await createPost({ author: user, text: text.trim(), image: imageUrl, avatar: authorAvatar })
        // refresh remote posts
        try{ const remote = await fetchPostsOnce(); setPosts(remote) }catch{}
      }catch(err){
        // fallback to localStorage
        const next = [{id:Date.now(), author:user, avatar: authorAvatar, text:text.trim(), image: image || null, comments:[]}, ...posts]
        save(next)
      }
      setText('')
      setImage(null)
    })()
  }

  function addComment(postId, comment){
    const next = posts.map(p => p.id===postId ? {...p, comments:[...p.comments, {id:Date.now(), author:sessionStorage.getItem('user')||'You', text:comment}]} : p)
    save(next)
  }

  return (
    <>
    <div className="layout">
      <aside className="left-column">
        <div className="sidebar-card">
          <h3 style={{marginTop:0}}>Profile</h3>
          <div style={{display:'flex',gap:12,alignItems:'center'}}>
            {(() => { try{ const pr = JSON.parse(localStorage.getItem('profile')||'{}'); return pr && pr.avatar ? <img src={pr.avatar} alt="you" style={{width:56,height:56,borderRadius:12}} /> : <div className="avatar-large">{(sessionStorage.getItem('user')||'You').slice(0,2).toUpperCase()}</div> }catch{ return <div className="avatar-large">{(sessionStorage.getItem('user')||'You').slice(0,2).toUpperCase()}</div> } })()}
            <div>
              <div style={{fontWeight:700}}>{sessionStorage.getItem('user')||'You'}</div>
              <div className="muted">View and edit profile</div>
            </div>
          </div>
        </div>
        <div style={{height:12}} />
        <div className="sidebar-card">
          <h4 style={{marginTop:0}}>Shortcuts</h4>
          <ul style={{listStyle:'none',padding:0,margin:0}}>
            <li className="social fb">Groups</li>
            <li className="social">Pages</li>
            <li className="social">Events</li>
          </ul>
        </div>
      </aside>

      <main className="center-column">
        <section className="card">
          <h2>Feed</h2>

          <form onSubmit={addPost} style={{marginTop:12}}>
            <textarea value={text} onChange={e=>setText(e.target.value)} placeholder="What's on your mind?" style={{width:'100%',padding:10,borderRadius:8}} />
            <div style={{display:'flex',gap:8,marginTop:8,alignItems:'center'}}>
              <label style={{display:'inline-flex',alignItems:'center',gap:8}} className="btn-logout">
                <input type="file" accept="image/*" style={{display:'none'}} onChange={async (e)=>{
                  const f = e.target.files && e.target.files[0]
                  if(!f) return
                  const r = new FileReader()
                  r.onload = ()=> setImage(r.result)
                  r.readAsDataURL(f)
                }} />
                Upload image
              </label>
              <button className="primary" type="submit">Post</button>
            </div>
            {image && <div style={{marginTop:8}}><img src={image} alt="preview" className="post-image" /></div>}
          </form>

          <div style={{display:'grid',gap:12,marginTop:18}}>
            {loading ? (
              <>
              {/* show 3 skeleton items while loading */}
              {[1,2,3].map(i=> (
                <article key={'sk'+i} className="post-card">
                  <div style={{display:'flex',gap:12,alignItems:'center'}}>
                    <div className="skeleton skeleton-avatar" />
                    <div style={{flex:1}}>
                      <div className="skeleton skeleton-line" style={{width:'40%'}} />
                      <div className="skeleton skeleton-line" style={{width:'30%',height:12}} />
                    </div>
                  </div>
                  <div style={{marginTop:10}}>
                    <div className="skeleton skeleton-line" style={{width:'100%',height:16}} />
                    <div className="skeleton skeleton-line" style={{width:'90%',height:16}} />
                  </div>
                </article>
              ))}
              </>
            ) : (
            posts.map(p => (
              <article key={p.id} className="post-card">
                <div style={{display:'flex',gap:12,alignItems:'center'}}>
                  <Avatar name={p.author} src={p.avatar} />
                  <div>
                    <div style={{fontWeight:700}}>{p.author}</div>
                    <div className="muted" style={{fontSize:12}}>{new Date(Number(p.id)).toLocaleString()}</div>
                  </div>
                </div>
                <div style={{marginTop:10}}>{p.text}</div>
                {p.image && <img src={p.image} alt="post" className="post-image" onClick={()=>setLightbox(p.image)} style={{cursor:'zoom-in'}} />}

                <div style={{marginTop:10}}>
                  <Comments comments={p.comments||[]} onAdd={(c)=>addComment(p.id,c)} />
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>

      <aside className="right-column">
        <div className="sidebar-card">
          <h4 style={{marginTop:0}}>Contacts</h4>
          <div className="socials">
            <div className="social">Alex</div>
            <div className="social">Mina</div>
            <div className="social">Sara</div>
          </div>
        </div>
      </aside>
    </div>
    {lightbox && (
      <div className="lightbox" onClick={()=>setLightbox(null)}>
        <div className="lightbox-inner">
          <img src={lightbox} alt="full" />
        </div>
      </div>
    )}
    </>
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
