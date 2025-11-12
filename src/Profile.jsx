import React from 'react'

export default function Profile(){
  const user = sessionStorage.getItem('user') || 'Talha'
  const profile = {
    title: 'Frontend Developer',
    location: 'Lahore, Pakistan',
    about: 'Building web experiences and learning React.'
  }

  return (
    <section className="card">
      <h2>{user}</h2>
      <div className="subtitle">{profile.title} • {profile.location}</div>
      <p style={{marginTop:12}}>{profile.about}</p>

      <h3 style={{marginTop:16}}>Experience</h3>
      <ul>
        <li>Frontend Developer — Example Co (2023–present)</li>
        <li>Intern — Startup (2022)</li>
      </ul>
    </section>
  )
}
