import { fetchPostsOnce, subscribePosts } from './firebase'

// loadPosts takes a setter (setPosts) and attempts to load remote posts first.
// If remote posts are available it calls setPosts(remote). It falls back to
// localStorage demo posts if Firestore is not available. Finally, if realtime
// updates are available it subscribes and returns the unsubscribe function.
export async function loadPosts(setPosts){
  if (typeof setPosts !== 'function') throw new Error('loadPosts requires setPosts callback')
  try{
    const remote = await fetchPostsOnce()
    if(remote && remote.length){
      setPosts(remote)
    }
  }catch(e){
    // ignore and fall back to localStorage
    console.debug('posts.loadPosts: fetchPostsOnce failed', e && e.message)
  }

  // fallback demo posts stored in localStorage
  try{
    const raw = localStorage.getItem('posts')
    const initial = raw? JSON.parse(raw) : [{id:1, author:'Alex', text:'Excited to share my latest project — built with React!', comments:[]},{id:2,author:'Mina',text:'Great article on frontend performance.',comments:[]}]
    const hasImage = initial.some(p => p.image)
    if(!hasImage){
      initial.unshift({ id: Date.now()-1000, author: 'Demo', text: 'Welcome — this is a demo image post.', image: '/assets/bg.svg', comments: [] })
      localStorage.setItem('posts', JSON.stringify(initial))
    }
    // Only set posts if remote didn't already provide any
    const current = Array.isArray(initial) ? initial : []
    setPosts(current)
  }catch(e){
    console.debug('posts.loadPosts: local fallback failed', e && e.message)
  }

  // attempt realtime subscription, return unsubscribe function if available
  try{
    const unsub = subscribePosts(p => { setPosts(p) })
    return unsub
  }catch(e){
    console.debug('posts.loadPosts: subscribePosts failed', e && e.message)
    return null
  }
}

// Only named exports to avoid interop ambiguity
