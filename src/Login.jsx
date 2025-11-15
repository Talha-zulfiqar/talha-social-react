import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { signInWithGooglePopup, signInWithEmail, signUpWithEmail, sendPasswordReset } from './firebase'

export default function Login(){
  const [user, setUser] = useState('')
  const [pass, setPass] = useState('')
  const [mode, setMode] = useState('login') // login | signup | reset
  const [error, setError] = useState('')
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
        const name = userObj.displayName || userObj.email || userObj.uid
        sessionStorage.setItem('user', name)
        try{ window.dispatchEvent(new Event('profileChanged')) }catch{}
        navigate('/feed')
      }else if(mode === 'signup'){
        const userObj = await signUpWithEmail(user, pass)
        const name = userObj.displayName || userObj.email || userObj.uid
        sessionStorage.setItem('user', name)
        try{ window.dispatchEvent(new Event('profileChanged')) }catch{}
        navigate('/feed')
      }else if(mode === 'reset'){
        await sendPasswordReset(user)
        setError('Password reset email sent. Check your inbox.')
      }
    }catch(err){
      console.error('Auth error', err)
      const code = err && err.code ? err.code : ''
      const msg = err && err.message ? err.message : ''
      setError(`${code} ${msg}`.trim() || 'Authentication error')
    }
  }

  async function onGoogleSignIn(){
    setError('')
    try{
      const userObj = await signInWithGooglePopup()
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
      setError(`${code} ${msg}`.trim() || 'Google sign-in failed. See console for details.')
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
