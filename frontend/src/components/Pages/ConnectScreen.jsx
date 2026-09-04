import { useState } from 'react'
import { normalizeApiUrl } from '../../api'

export function ConnectScreen({ onLogin, error, setError, url }) {
  const [step, setStep] = useState('url'); 
  const [form, setForm] = useState({ url, username: '', password: '' }); 
  const [busy, setBusy] = useState(false)

  const change = (key) => (event) => setForm({ ...form, [key]: event.target.value })
  
  const submit = async (event) => { 
    event.preventDefault(); 
    setError(''); 
    if (step === 'url') { 
      try { 
        setForm({ ...form, url: normalizeApiUrl(form.url) }); 
        setStep('credentials') 
      } catch (err) { 
        setError(err.message) 
      } 
      return 
    } 
    
    setBusy(true); 
    
    try { 
      await onLogin(form.url, form.username, form.password) 
    } catch (err) { 
      setBusy(false); 
      setError(err.message) 
    } 
  }
  
  return (
    <main className="connect-screen">
      <div className="connect-panel">
        <p className="eyebrow">NORTHSTAR / INVENTORY</p>
        <h1>Keep every unit<br /><em>in motion.</em></h1>
        <p className="lede">
          Connect to your inventory service to see stock, 
          move it between locations, 
          and keep your team in sync.
        </p>
        <form onSubmit={submit} className="stack-form">
          {step === 'url' ?  
            <label>
              Backend API URL
              <input value={form.url} onChange={change('url')} placeholder="http://localhost:5001" required />
            </label> 
          : <>
            <label>
              Username
              <input value={form.username} onChange={change('username')} autoComplete="username" required />
            </label>
            <label>
              Password
              <input type="password" value={form.password} onChange={change('password')} autoComplete="current-password" required />
            </label>
          </>}
          {error && <p className="error">{error}</p>}
          <button className="primary" disabled={busy}>
            {busy ? 'Connecting...' : step === 'url' ? 'Continue to sign in' : 'Connect & sign in'}
          </button>
            {step === 'credentials' && <button type="button" className="link-button back-button" onClick={() => setStep('url')}>
            Change API address
          </button>}
        </form>
      </div>
      <div className="connect-art">
        <span>LIVE INVENTORY</span>
        <strong>01</strong>
        <p>One source of truth<br />for the whole floor.</p>
      </div>
    </main>
  )
}