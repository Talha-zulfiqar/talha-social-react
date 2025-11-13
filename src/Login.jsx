import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { signInWithGooglePopup } from './firebase'

export default function Login(){
  const [user, setUser] = useState('')
  const [pass, setPass] = useState('')
  const [error, setError] = useState('')
  const [show, setShow] = useState(false)
  const navigate = useNavigate()

  const VALID_USER = 'talha'
  const VALID_PASS = '123'

  function submit(e){
    e.preventDefault();
    setError('')
    if (!user) return setError('Please enter username')
    if (!pass) return setError('Please enter password')

    if (user.toLowerCase() === VALID_USER && pass === VALID_PASS){
      sessionStorage.setItem('user', VALID_USER)
      navigate('/feed')
    } else {
      setError('Invalid username or password')
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
      setError('Google sign-in failed. See console for details.')
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
          <span className="label">Email or username</span>
          <input value={user} onChange={e=>setUser(e.target.value)} name="user" type="text" autoComplete="username" required />
        </label>

        <label className="field">
          <span className="label">Password</span>
          <div className="pw-row">
            <input value={pass} onChange={e=>setPass(e.target.value)} name="password" type={show? 'text':'password'} autoComplete="current-password" required />
            <button type="button" className="pw-toggle" onClick={()=>setShow(s=>!s)}>{show? 'Hide':'Show'}</button>
          </div>
        </label>

        <div className="controls-row">
          <label className="remember"><input type="checkbox" /> Remember me</label>
          <a className="forgot" href="#">Forgot password?</a>
        </div>

        {error && <div style={{color:'#b00020', marginBottom:10}}>{error}</div>}

        <button className="primary" id="loginBtn" type="submit">Log in</button>
        </form>

        <div className="separator"><span>or</span></div>
        <div className="socials">
          <button className="social fb" type="button">Continue with Facebook</button>
          <button className="social google" type="button" onClick={onGoogleSignIn}>Continue with Google</button>
        </div>
      </div>
    </section>
  )
}
