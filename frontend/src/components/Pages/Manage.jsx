import { useState } from 'react'
import { Page } from './Page'
import { RecordModal } from '../RecordModal'
import { Empty } from './Empty'

export function Manage({ title, eyebrow, rows, fields, create, update, remove, run }) {
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({})

  const save = (e) => {
    e.preventDefault()
    run(
      () => editing.id ? update(editing.id, form) : create(form),
      editing.id ? 'Record updated.' : 'Record created.'
    ).then(() => {
      setEditing(null)
      setForm({})
    })
  }

  return (
    <Page
      eyebrow={eyebrow}
      title={title}
      action={<button className="primary inline" onClick={() => { setEditing({}); setForm({}) }}>
        Add record 
        <span>+</span>
      </button>}
    >
      <div className="record-grid">
        {rows.map((row) => <article className="record" key={row.id}>
          <div>
            <b>{row.name}</b>
            <p>{row.description || 'No description'}</p>
            {row.barcode && <small>{row.barcode}</small>}
          </div>
          <div className="record-actions">
            <button onClick={() => { setEditing(row); setForm(Object.fromEntries(fields.map((field) => [field, row[field] || '']))) }}>
              Edit
            </button>
            <button className="danger-text" onClick={() => run(() => remove(row.id), 'Record removed.')}>Remove</button>
          </div>
        </article>)}
        {!rows.length && <Empty text="Nothing here yet." />}
      </div>
      {editing && <RecordModal 
        title={editing.id ? 'Update details' : 'Add to the list'} 
        fields={fields} form={form} setForm={setForm} 
        setEditing={setEditing} save={save} 
      />}
    </Page>
  )
}