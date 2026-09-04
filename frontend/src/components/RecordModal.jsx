

export function RecordModal({ title, fields, form, setForm, setEditing, save, passwordField }) {
  return (
    <div className="modal-backdrop">
      <form className="modal stack-form" onSubmit={save}>
        <button type="button" className="modal-close" onClick={() => setEditing(null)}>X</button>
        <p className="eyebrow">Account / record</p>
        <h2>{title}</h2>
        {fields.map((field) => <label key={field}>
          {field.toUpperCase()}
          {field === 'role' ? 
            <select value={form[field] || 'USER'} onChange={(e) => setForm({ ...form, [field]: e.target.value })}>
              <option>USER</option>
              <option>ADMIN</option>
            </select>
             : 
            <input 
              type={field === 'password' ? 'password' : 'text'} 
              value={form[field] || ''} 
              onChange={(e) => setForm({ ...form, [field]: e.target.value })} 
              required={field === 'name' || field === 'username' || (field === 'password' && !passwordField)} 
            />
          }
        </label>)}
        <button className="primary" type="submit">Save changes</button>
      </form>
    </div>
  )
}