import React from 'react'

const samplePosts = [
  { id:1, author:'Alex', text:'Excited to share my latest project — built with React!'},
  { id:2, author:'Mina', text:'Great article on frontend performance.'},
  { id:3, author:'Talha', text:'Hello everyone — building a demo social app.'}
]

export default function Feed(){
  return (
    <section className="card">
      <h2>Feed</h2>
      <div style={{display:'grid',gap:12,marginTop:12}}>
        {samplePosts.map(p => (
          <article key={p.id} style={{padding:12,border:'1px solid #eef6ff',borderRadius:8}}>
            <div style={{fontWeight:700,marginBottom:6}}>{p.author}</div>
            <div>{p.text}</div>
          </article>
        ))}
      </div>
    </section>
  )
}
