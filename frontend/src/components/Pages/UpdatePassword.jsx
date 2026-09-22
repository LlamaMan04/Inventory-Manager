import { useState } from 'react'
import { Page } from '../Building-Blocks/Page'

export function UpdatePassword({ api, run }) {
  const [form, setForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' })
  
  const submit = async (e) => {
    e.preventDefault()
    if (form.newPassword !== form.confirmPassword) {
      await run(() => Promise.reject(new Error('New passwords do not match.')), '')
      return
    }

    const success = await run(() => api.updatePassword(form), 'Password updated.')
    if (success) setForm({ oldPassword: '', newPassword: '', confirmPassword: '' })
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
        <label>
          Confirm new password
          <input 
            type="password" 
            minLength="6" 
            value={form.confirmPassword} 
            onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} 
            required 
          />
        </label>
        <button className="primary" type="submit">Update password <span>→</span></button>
      </form>
    </Page>
  )
}