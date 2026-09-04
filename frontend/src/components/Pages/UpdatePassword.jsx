import { useState } from 'react'
import { Page } from './Page'

export function UpdatePassword({ api, run }) {
  const [form, setForm] = useState({ oldPassword: '', newPassword: '' })
  
  const submit = (e) => {
    e.preventDefault()
    run(() => api.updatePassword(form), 'Password updated.')
      .then(() => setForm({ oldPassword: '', newPassword: '' }))
  }

  return (
    <Page eyebrow="Account / security" title="Change password">
      <form className="panel narrow-form stack-form" onSubmit={submit}>
        <p>Choose a new password for your account.</p>
        <label>
          Current password
          <input 
            type="password" 
            value={form.oldPassword} 
            onChange={(e) => setForm({ ...form, oldPassword: e.target.value })} 
            required 
          />
        </label>
        <label>
          New password
          <input 
            type="password" 
            minLength="6" 
            value={form.newPassword} 
            onChange={(e) => setForm({ ...form, newPassword: e.target.value })} 
            required 
          />
        </label>
        <button className="primary" type="submit">Update password <span>→</span></button>
      </form>
    </Page>
  )
}