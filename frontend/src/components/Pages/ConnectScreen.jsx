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
        <div className="connect-brand">
          <span>NS</span>
          <div>
            <b>Northstar</b>
            <small>Inventory control</small>
          </div>
        </div>
        <p className="eyebrow">Connect your workspace</p>
        <h1><em>Northstar</em> Inventory Manager</h1>
        <p className="lede">
          Your inventory, in one place. Sign in to inspect stock and keep your team in sync.
        </p>
        <div className="connect-steps" aria-label="Connection progress">
          <span className={step === 'url' ? 'active' : ''} aria-current={step === 'url' ? 'step' : undefined}>01 API address</span>
          <i aria-hidden="true">·</i>
          <span className={step === 'credentials' ? 'active' : ''} aria-current={step === 'credentials' ? 'step' : undefined}>02 Sign in</span>
        </div>
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
    </main>
  )
}
