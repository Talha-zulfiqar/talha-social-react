import React, { useEffect, useState } from 'react'

export default function Profile(){
  const user = sessionStorage.getItem('user') || 'Talha'
  const [profile, setProfile] = useState({title:'Frontend Developer', location:'Lahore, Pakistan', about:'Building web experiences and learning React.', avatar:''})
  const [editing, setEditing] = useState(false)

  useEffect(()=>{
    try{ const raw = localStorage.getItem('profile'); if(raw) setProfile(JSON.parse(raw)) }catch{}
  },[])

  function save(){
    localStorage.setItem('profile', JSON.stringify(profile))
    setEditing(false)
  }

  function onFile(e){
    const f = e.target.files && e.target.files[0]
    if (!f) return
    const reader = new FileReader()
    reader.onload = () => {
      setProfile(p => ({...p, avatar: reader.result}))
    }
    reader.readAsDataURL(f)
  }

  return (
    <section className="card profile-card">
      <div style={{display:'flex',gap:16,alignItems:'center'}}>
        {profile.avatar ? <img src={profile.avatar} alt="avatar" style={{width:84,height:84,borderRadius:12}}/> : <div className="avatar-large">{user.slice(0,2).toUpperCase()}</div>}
        <div>
          <h2>{user}</h2>
          <div className="subtitle">{profile.title} • {profile.location}</div>
        </div>
      </div>

      {!editing ? (
        <>
          <p style={{marginTop:12}}>{profile.about}</p>
          <button className="primary" onClick={()=>setEditing(true)} style={{width:'auto',padding:'8px 12px'}}>Edit profile</button>
        </>
      ) : (
        <form onSubmit={(e)=>{e.preventDefault(); save()}} style={{marginTop:12}}>
          <label className="field"><span className="label">Title</span><input value={profile.title} onChange={e=>setProfile({...profile,title:e.target.value})} /></label>
          <label className="field"><span className="label">Location</span><input value={profile.location} onChange={e=>setProfile({...profile,location:e.target.value})} /></label>
          <label className="field"><span className="label">About</span><textarea value={profile.about} onChange={e=>setProfile({...profile,about:e.target.value})} /></label>
          <label className="field"><span className="label">Avatar</span><input type="file" accept="image/*" onChange={onFile} /></label>
          <div style={{display:'flex',gap:8}}>
            <button type="submit" className="primary">Save</button>
            <button type="button" onClick={()=>setEditing(false)} className="btn-logout">Cancel</button>
          </div>
        </form>
      )}

      <h3 style={{marginTop:16}}>Experience</h3>
      <ul>
        <li>Frontend Developer — Example Co (2023–present)</li>
        <li>Intern — Startup (2022)</li>
      </ul>
    </section>
  )
}
