import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { signInWithGooglePopup, signInWithEmail, signUpWithEmail, sendPasswordReset } from './firebase'

export default function Login(){
  const [user, setUser] = useState('')
  const [pass, setPass] = useState('')
  const [mode, setMode] = useState('login') // login | signup | reset
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [show, setShow] = useState(false)
  const navigate = useNavigate()

  async function submit(e){
    e.preventDefault();
    setError('')
    if (!user) return setError('Please enter email')
    if (mode !== 'reset' && !pass) return setError('Please enter password')

    try{
      if(mode === 'login'){
        const userObj = await signInWithEmail(user, pass)
        if(!userObj) throw new Error('Authentication failed: no user returned')
        const name = userObj.displayName || userObj.email || userObj.uid
        sessionStorage.setItem('user', name)
        try{ window.dispatchEvent(new Event('profileChanged')) }catch{}
        navigate('/feed')
      }else if(mode === 'signup'){
        const userObj = await signUpWithEmail(user, pass)
        if(!userObj) throw new Error('Signup failed: no user returned')
        const name = userObj.displayName || userObj.email || userObj.uid
        sessionStorage.setItem('user', name)
        try{ window.dispatchEvent(new Event('profileChanged')) }catch{}
        navigate('/feed')
      }else if(mode === 'reset'){
        // clear any previous messages
        setError('')
        setInfo('')
        await sendPasswordReset(user)
        // show an informative message and next steps
        setInfo('Password reset email sent. Check your inbox (and spam). If you do not receive it, verify the email exists in Firebase Console → Authentication → Users and that localhost is an authorized domain.')
      }
    }catch(err){
      console.error('Auth error', err)
      const code = err && err.code ? err.code : ''
      const msg = err && err.message ? err.message : ''
      // Surface a clear message for common cases (user not found, invalid email)
      if(code === 'auth/user-not-found'){
        setError('No account found for that email. Create an account first or check for typos.')
      }else{
        setError(`${code} ${msg}`.trim() || 'Authentication error')
      }
    }
  }

  async function onGoogleSignIn(){
    setError('')
    try{
      const userObj = await signInWithGooglePopup()
      if(!userObj) throw new Error('Google sign-in failed: no user returned')
      const name = userObj.displayName || userObj.email || 'User'
      sessionStorage.setItem('user', name)
      const profileObj = { avatar: userObj.photoURL || '', title:'', location:'', about:'' }
      try{ localStorage.setItem('profile', JSON.stringify(profileObj)) }catch{}
      try{ window.dispatchEvent(new Event('profileChanged')) }catch{}
      navigate('/feed')
    }catch(err){
      console.error('Google sign-in failed', err)
      // show a more helpful error to the user (error.code and message if available)
      const code = err && err.code ? err.code : ''
      const msg = err && err.message ? err.message : ''
      // If this is an unauthorized-domain error, show actionable steps
      if(code === 'auth/unauthorized-domain'){
        const origin = (typeof window !== 'undefined' && window.location && window.location.origin) ? window.location.origin : '<your app origin>'
        setError(`auth/unauthorized-domain — Your app origin (${origin}) is not authorized in Firebase Authentication. Add it under Firebase Console → Authentication → Authorized domains (add 'localhost' or '127.0.0.1' for local dev).`) 
      }else{
        setError(`${code} ${msg}`.trim() || 'Google sign-in failed. See console for details.')
      }
    }
  }

  return (
    <section className="card login-card" role="region" aria-labelledby="login-heading">
      <div className="login-hero" aria-hidden="true">
        <div style={{width:160, height:160, display:'flex',alignItems:'center',justifyContent:'center',background:'rgba(255,255,255,0.06)',borderRadius:80,marginBottom:12}}>
          {/* handshake SVG */}
          <svg width="96" height="96" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M2 12l7-7 3 3 6-6 4 4-7 7" stroke="rgba(255,255,255,0.95)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M17 7l4 4" stroke="rgba(255,255,255,0.95)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M7 13l3 3" stroke="rgba(255,255,255,0.95)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <div className="hero-text">
          <h2>Connect with people</h2>
          <p>Share updates, follow friends and discover communities.</p>
        </div>
      </div>
      <div className="login-form">
        <h1 id="login-heading">Welcome back</h1>
        <p className="subtitle">Sign in to continue to SocialApp</p>
        <form onSubmit={submit} id="loginForm" noValidate>
          <label className="field">
            <span className="label">Email</span>
            <input value={user} onChange={e=>setUser(e.target.value)} name="user" type="email" autoComplete="email" required />
          </label>

          {mode !== 'reset' && (
            <label className="field">
              <span className="label">Password</span>
              <div className="pw-row">
                <input value={pass} onChange={e=>setPass(e.target.value)} name="password" type={show? 'text':'password'} autoComplete={mode==='signup'? 'new-password':'current-password'} required />
                <button type="button" className="pw-toggle" onClick={()=>setShow(s=>!s)}>{show? 'Hide':'Show'}</button>
              </div>
            </label>
          )}

          <div className="controls-row">
            {mode !== 'reset' && <label className="remember"><input type="checkbox" /> Remember me</label>}
            <button type="button" className="forgot" onClick={()=>setMode(mode==='reset'?'login':'reset')}>{mode==='reset' ? 'Back to login' : 'Forgot password?'}</button>
          </div>

          {error && <div style={{color:'#b00020', marginBottom:10}}>{error}</div>}
          {info && <div style={{color:'#0b6f2e', marginBottom:10}}>{info}</div>}

          <button className="primary" id="loginBtn" type="submit">{mode==='signup' ? 'Create account' : mode==='reset' ? 'Send reset email' : 'Log in'}</button>
        </form>
        <div style={{marginTop:8}}>
          {mode === 'login' ? (
            <div>Don't have an account? <button className="btn-link" onClick={()=>setMode('signup')}>Create one</button></div>
          ) : mode === 'signup' ? (
            <div>Already have an account? <button className="btn-link" onClick={()=>setMode('login')}>Sign in</button></div>
          ) : null}
        </div>

        <div className="separator"><span>or</span></div>
        <div className="socials">
          <button className="social fb" type="button">Continue with Facebook</button>
          <button className="social google" type="button" onClick={onGoogleSignIn}>Continue with Google</button>
        </div>
      </div>
    </section>
  )
}
