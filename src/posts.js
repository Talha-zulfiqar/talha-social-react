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
      // merge local optimistic changes (localStorage) with remote posts
        try{
          const rawLocal = localStorage.getItem('posts')
          const local = rawLocal ? JSON.parse(rawLocal) : []
          const localMap = new Map((local||[]).map(p => [String(p.id), p]))
          // merge remote posts with local entries when ids match
          const mergedRemote = remote.map(r => {
            const key = String(r.id)
            const l = localMap.get(key)
            if(!l) return r
            const mergedComments = Array.isArray(r.comments) ? Array.from(new Map([...(r.comments||[]).map(c=>[c.id||JSON.stringify(c),c]), ...(l.comments||[]).map(c=>[c.id||JSON.stringify(c),c])]).values()) : (l.comments||[])
            const rLiked = Array.isArray(r.likedBy) ? r.likedBy : []
            const lLiked = Array.isArray(l.likedBy) ? l.likedBy : []
            const likedSet = Array.from(new Set([...(rLiked||[]), ...(lLiked||[])]))
            return { ...r, comments: mergedComments, likedBy: likedSet }
          })
          // include any local-only posts (not present in remote) at the top
          const remoteIds = new Set(remote.map(r => String(r.id)))
          const localOnly = (local||[]).filter(p => !remoteIds.has(String(p.id)))
          const final = [...localOnly, ...mergedRemote]

          // diagnostics: log summary to help debug disappearing optimistic changes
          try{
            const debug = !!(typeof window !== 'undefined' && window.localStorage && window.localStorage.getItem('DEBUG_POSTS_MERGE'))
            if(debug){
              console.debug('[posts.loadPosts] remoteCount=', remote.length, 'localCount=', (local||[]).length, 'localOnlyIds=', localOnly.map(p=>p.id))
              const mergedInfo = mergedRemote.map(p=>({ id: p.id, comments: (p.comments||[]).length, likedBy: (p.likedBy||[]).length }))
              console.debug('[posts.loadPosts] mergedRemote summary=', mergedInfo)
            }
          }catch(_e){}

          setPosts(final)
        }catch(e){
          // if merging fails, fall back to remote as before
          setPosts(remote)
        }
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
    const unsub = subscribePosts(async remotePosts => {
      try{
        // try to merge remote snapshot with any local optimistic changes
        const rawLocal = localStorage.getItem('posts')
        const local = rawLocal ? JSON.parse(rawLocal) : []
        const localMap = new Map((local||[]).map(p => [String(p.id), p]))
        const mergedRemote = remotePosts.map(r => {
          const key = String(r.id)
          const l = localMap.get(key)
          if(!l) return r
          const mergedComments = Array.isArray(r.comments) ? Array.from(new Map([...(r.comments||[]).map(c=>[c.id||JSON.stringify(c),c]), ...(l.comments||[]).map(c=>[c.id||JSON.stringify(c),c])]).values()) : (l.comments||[])
          const rLiked = Array.isArray(r.likedBy) ? r.likedBy : []
          const lLiked = Array.isArray(l.likedBy) ? l.likedBy : []
          const likedSet = Array.from(new Set([...(rLiked||[]), ...(lLiked||[])]))
          return { ...r, comments: mergedComments, likedBy: likedSet }
        })
        const remoteIds = new Set(remotePosts.map(r => String(r.id)))
        const localOnly = (local||[]).filter(p => !remoteIds.has(String(p.id)))
        // diagnostics: log summary for onSnapshot merges when enabled
        try{
          const debug = !!(typeof window !== 'undefined' && window.localStorage && window.localStorage.getItem('DEBUG_POSTS_MERGE'))
          if(debug){
            console.debug('[posts.subscribe] remoteCount=', remotePosts.length, 'localCount=', (local||[]).length, 'localOnlyIds=', localOnly.map(p=>p.id))
            const mergedInfo = mergedRemote.map(p=>({ id: p.id, comments: (p.comments||[]).length, likedBy: (p.likedBy||[]).length }))
            console.debug('[posts.subscribe] mergedRemote summary=', mergedInfo)
          }
        }catch(_e){}
        setPosts([...localOnly, ...mergedRemote])
      }catch(err){
        // fallback to raw remote posts
        setPosts(remotePosts)
      }
    })
    return unsub
  }catch(e){
    console.debug('posts.loadPosts: subscribePosts failed', e && e.message)
    return null
  }
}

// Only named exports to avoid interop ambiguity
