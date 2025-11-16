import React, { useEffect, useState } from 'react'
import { createPost, uploadDataUrl, fetchPostsOnce, addCommentToPost, toggleLikeOnPost } from './firebase'
import { loadPosts } from './posts'

function Avatar({name, src, size=40}){
  const s = {width:size,height:size,borderRadius:'50%'}
  if (src) return <img src={src} alt={name} style={s} />
  const initials = (name||'U').split(' ').map(s=>s[0]||'').join('').slice(0,2).toUpperCase()
  return <div className="avatar" style={{width:size,height:size,fontSize:Math.max(12, size/2)}}>{initials}</div>
}

export default function Feed(){
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [text, setText] = useState('')
  const [image, setImage] = useState(null)
  const [lightbox, setLightbox] = useState(null)
  // delegate post loading to shared helper to avoid name collisions and
  // centralize remote/local/subscription logic

  useEffect(()=>{
    let mounted = true
    let unsub = null
  const maybe = loadPosts(setPosts);
  (async ()=>{ try{ const res = await maybe; if(mounted && typeof res === 'function'){ unsub = res } }catch(e){} finally{ if(mounted) setLoading(false) } })()
    return ()=>{ mounted=false; if(typeof unsub === 'function') unsub() }
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

  async function addComment(postId, comment){
    const author = sessionStorage.getItem('user')||'You'
    // generate a stable client-side id for the comment so merges/dedupe work reliably
    let id = null
    try{
      if(typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') id = crypto.randomUUID()
      else id = 'c-' + Date.now() + '-' + Math.floor(Math.random()*1000000)
    }catch(e){ id = 'c-' + Date.now() + '-' + Math.floor(Math.random()*1000000) }

    const localComment = {id, author, text:comment}
    const next = posts.map(p => p.id===postId ? {...p, comments:[...(p.comments||[]), localComment]} : p)
    save(next)
    // try to persist to Firestore; include the client id for dedupe
    try{
      await addCommentToPost(postId, { id, author, text: comment })
    }catch(e){ /* ignore - offline fallback handled by localStorage */ }
  }

  async function toggleLike(postId){
    const me = sessionStorage.getItem('user') || 'You'
    const next = posts.map(p => {
      if(p.id!==postId) return p
      const likedBy = Array.isArray(p.likedBy) ? [...p.likedBy] : []
      const idx = likedBy.indexOf(me)
      if(idx === -1){ likedBy.push(me) } else { likedBy.splice(idx,1) }
      return { ...p, likedBy }
    })
    save(next)
    try{
      await toggleLikeOnPost(postId, me)
    }catch(e){ /* ignore, keep local state */ }
  }

  return (
    <>
    <div className="layout wrap">
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
              // show 3 skeleton items while loading
              <>
                {[1,2,3].map(i => (
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
                    <div className="post-actions" style={{display:'flex',gap:8,alignItems:'center'}}>
                      <button className="action-btn" onClick={()=>toggleLike(p.id)} aria-pressed={Array.isArray(p.likedBy) && p.likedBy.includes(sessionStorage.getItem('user')||'You')}>
                        👍
                      </button>
                      <div style={{fontSize:13}}>{(p.likedBy || []).length} like{(p.likedBy || []).length===1?'':'s'}</div>
                    </div>
                    <Comments comments={p.comments||[]} onAdd={(c)=>addComment(p.id,c)} />
                  </div>
                </article>
              ))
            )}
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
