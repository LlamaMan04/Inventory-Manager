import { useState, useEffect } from 'react'
import { Page } from '../Building-Blocks/Page'
import { RecordModal } from '../Building-Blocks/RecordModal'
import { ConfirmModal } from '../Building-Blocks/ConfirmModal'

export function AccountsView({ data, api, run, setData }) {
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ role: 'USER' })
  const [deleting, setDeleting] = useState(null)

  const save = (e) => {
    e.preventDefault()
    run(
      () => editing.id ? api.updateUser(editing.id, form) : api.register(form),
      editing.id ? 'Account updated.' : 'Account created.'
    ).then(() => {
      setEditing(null)
      setForm({ role: 'USER' })
      api.users().then((response) => setData((current) => ({ ...current, users: response.data.users })))
    })
  }

  useEffect(() => {
    api.users()
      .then((response) => setData((current) => ({ ...current, users: response.data.users })))
      .catch(() => {})
  }, [api, setData])

  return (
    <Page
      eyebrow="Manage / administration"
      title="Accounts"
      action={<button className="primary inline" onClick={() => { setEditing({}); setForm({ role: 'USER' }) }}>
        Add account 
        <span>+</span>
      </button>}
    >
      <div className="record-grid">
        {data.users.map((account) => <article className="record" key={account.id}>
          <div>
            <b>{account.username}</b>
            <p className="role-label">{account.role}</p>
          </div>
          <div className="record-actions">
            <button onClick={() => { setEditing(account); setForm({ username: account.username, role: account.role }) }}>Edit</button>
            <button className="danger-text" onClick={() => setDeleting(account)}>Remove</button>
          </div>
        </article>)}
      </div>
      {editing && <RecordModal 
        title={editing.id ? 'Update access' : 'Create account'} 
        fields={['username', 'password', 'role']} 
        form={form} setForm={setForm} 
        setEditing={setEditing} save={save} passwordField 
      />}
      {deleting && <ConfirmModal
        title={`Remove ${deleting.username}?`}
        message="This action cannot be undone."
        onCancel={() => setDeleting(null)}
        onConfirm={() => run(() => api.removeUser(deleting.id), 'Account removed.').then((success) => {
          setDeleting(null)
        })}
      />}
    </Page>
  )
}