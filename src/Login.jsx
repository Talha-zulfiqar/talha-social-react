import React, { useState } from 'react'

export default function Login(){
  const [user, setUser] = useState('')
  const [pass, setPass] = useState('')
  const [error, setError] = useState('')
  const [show, setShow] = useState(false)

  const VALID_USER = 'talha'
  const VALID_PASS = '123'

  function submit(e){
    e.preventDefault();
    setError('')
    if (!user) return setError('Please enter username')
    if (!pass) return setError('Please enter password')

    if (user.toLowerCase() === VALID_USER && pass === VALID_PASS){
      sessionStorage.setItem('user', VALID_USER)
      window.location.hash = '#/welcome'
    } else {
      setError('Invalid username or password')
    }
  }

  return (
    <section className="card" role="region" aria-labelledby="login-heading">
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
        <button className="social fb">Continue with Facebook</button>
        <button className="social google">Continue with Google</button>
      </div>
    </section>
  )
}
