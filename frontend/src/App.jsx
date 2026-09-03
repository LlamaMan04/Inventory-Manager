import { useEffect, useMemo, useState } from 'react'
import { BrowserRouter, Link, Route, Routes, useLocation } from 'react-router'
import { createApi, normalizeApiUrl } from './api'

const initialUrl = localStorage.getItem('inventory_api_url') || 'http://localhost:5001'
const blank = { items: [], locations: [], stocks: [], users: [] }

export default function App() {
  const [apiUrl, setApiUrl] = useState(initialUrl)
  const [token, setToken] = useState(localStorage.getItem('inventory_token'))
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('inventory_user') || 'null'))
  const [data, setData] = useState(blank)
  const [error, setError] = useState('')

  const api = useMemo(() => createApi(apiUrl, token), [apiUrl, token])

  // Refresh data from API
  const refresh = async () => {
    const [items, locations, stocks] = await Promise.all([api.items(), api.locations(), api.stocks()])
    setData((current) => ({ 
      ...current, 
      items: items.data, 
      locations: locations.data, 
      stocks: stocks.data 
    }))
  }

  // Fetch initial data when the token changes
  useEffect(() => {
    if (!token) return;

    Promise.all([api.items(), api.locations(), api.stocks()])
      .then(([items, locations, stocks]) => 
        setData((current) => ({ 
          ...current, 
          items: items.data, 
          locations: locations.data, 
          stocks: stocks.data 
        })))
      .catch((err) => setError(err.message));
  }, [api, token]);

  // Handle login
  const login = async (url, username, password) => {
    const connectedUrl = normalizeApiUrl(url)
    const response = await createApi(connectedUrl).login(username, password)

    localStorage.setItem('inventory_api_url', connectedUrl); 
    localStorage.setItem('inventory_token', response.token); 
    localStorage.setItem('inventory_user', JSON.stringify(response.data))

    setApiUrl(connectedUrl); 
    setToken(response.token); 
    setUser(response.data); 
    setError('')
  }

  // Handle logout
  const logout = async () => { 
    try { 
      await api.logout() 
    } catch (err) { 
      setError(err.message) 
    } 
    
    localStorage.removeItem('inventory_token'); 
    localStorage.removeItem('inventory_user'); 
    setToken(null); 
    setUser(null); 
    setData(blank);
  }

  // Render the login screen in not authenticated
  if (!token) return (
    <ConnectScreen onLogin={login} error={error} setError={setError} />
  )

  // Render the main application shell when authenticated
  return (
    <BrowserRouter>
      <Shell user={user} api={api} data={data} setData={setData} refresh={refresh} error={error} setError={setError} logout={logout} />
    </BrowserRouter>
  )
}

function ConnectScreen({ onLogin, error, setError }) {
  const [step, setStep] = useState('url'); 
  const [form, setForm] = useState({ url: initialUrl, username: '', password: '' }); 
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

function Shell({ user, api, data, setData, refresh, error, setError, logout }) {
  // State for notices and errors
  const [notice, setNotice] = useState('')
  
  // Helper function to run an action and refresh data, handling errors and notices
  const run = async (action, message) => { 
    try { 
      await action(); 
      await refresh(); 
      setError(''); 
      setNotice(message); 
      setTimeout(() => setNotice(''), 3000) 
    } catch (err) { 
      setError(err.message) 
    } 
  }

  return (
    <div className="app-container">
      <header className="top-nav">
        <Link to="/" className="brand">
          <span>NS</span>
          <div>
            <b>Northstar</b>
            <small>Inventory control</small>
          </div>
        </Link>
        <div className="header-actions">
          <span className="connection"><i /> Connected</span>
          <span className="user-chip">{user.username} <small>{user.role}</small></span>
          <button className="link-button" onClick={logout}>Sign out</button>
        </div>
      </header>
      <div className="main-layout">
        <aside className="sidebar">
          <p className="side-label">Operations</p>
          <Nav to="/" text="Overview" />
          <Nav to="/stock" text="Stock ledger" />
          <Nav to="/move" text="Move stock" />
          <p className="side-label">Manage</p>
          <Nav to="/catalog" text="Catalog" />
          <Nav to="/locations" text="Locations" />
          {user.role === 'ADMIN' && <Nav to="/accounts" text="Accounts" />}
          <div className="side-footer">
            <span>Signed in as</span><b>{user.username}</b>
            <Link to="/password">Change password</Link>
          </div>
        </aside>
        <main className="content-area">
          {notice && <div className="notice">{notice}</div>}
          {error && <div className="error-banner">{error}
            <button onClick={() => setError('')}>Dismiss</button>
          </div>
          }<Routes>
            <Route path="/" element={<Overview data={data} />} />
            <Route path="/stock" element={<Stock data={data} />} />
            <Route path="/move" element={<Move data={data} api={api} run={run} />} />
            <Route path="/catalog" element={
              <Crud 
                title="Catalog" 
                eyebrow="Manage / catalog" 
                rows={data.items} 
                fields={['name', 'description', 'barcode']} 
                create={api.createItem} 
                update={api.updateItem} 
                remove={api.removeItem} 
                run={run} 
              />} 
            />
            <Route path="/locations" element={
              <Crud 
                title="Locations" 
                eyebrow="Manage / locations" 
                rows={data.locations} 
                fields={['name', 'description']} 
                create={api.createLocation} 
                update={api.updateLocation} 
                remove={api.removeLocation} 
                run={run} 
              />} 
            />
            {user.role === 'ADMIN' && <Route path="/accounts" element={
              <Accounts data={data} api={api} run={run} setData={setData} />} />
            }
            <Route path="/password" element={<Password api={api} run={run} />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}

function Nav({ to, text }) { 
  const location = useLocation(); 
  return ( 
    <Link 
      className={`nav-link ${location.pathname === to ? 'active' : ''}`} 
      to={to}>
        <span>{text}</span>
        <b>→</b>
    </Link>
  ); 
}

function Page({ eyebrow, title, action, children }) { 
  return ( 
    <div className="page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h1>{title}</h1>
        </div>
        {action}
      </div>
      {children}
    </div> 
  );
}

function Overview({ data }) { 
  const units = data.stocks.reduce((sum, stock) => sum + stock.quantity, 0); 
  return ( 
    <Page eyebrow="Operations / Overview" title="Good morning.">
      <div className="metric-grid">
        <Metric label="Units on hand" value={units.toLocaleString()} detail={`${data.stocks.length} stock positions`} />
        <Metric label="Catalog items" value={data.items.length} detail="Active item records" />
        <Metric label="Locations" value={data.locations.length} detail="Storage destinations" />
      </div>
      <section className="feature-band">
        <div>
          <p className="eyebrow">Today’s focus</p>
          <h2>Inventory, without<br /><em>the guesswork.</em></h2>
          <p>Inspect every position, or move stock when the floor changes.</p>
        </div>
        <Link className="primary inline" to="/move">Move stock <span>→</span></Link>
      </section>
    </Page> 
  );
}

function Metric({ label, value, detail }) { 
  return (
    <div className="metric">
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{detail}</small>
    </div> 
  );
}

function Stock({ data }) { 
  return ( 
    <Page eyebrow="Operations / stock ledger" title="Stock ledger" action=
      {<Link className="primary inline" to="/move">Move stock <span>→</span></Link>}
    >
      <p className="section-copy">Every item, grouped by its current location.</p>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th>Barcode</th>
              <th>Location</th>
              <th className="numeric">Quantity</th>
            </tr>
          </thead>
          <tbody>
            {data.stocks.map((stock) => 
              <tr key={stock.id}>
                <td>
                  <b>{stock.item?.name || `Item #${stock.itemId}`}</b>
                  <small>{stock.item?.description || 'No description'}</small>
                </td>
                <td>{stock.item?.barcode || '—'}</td>
                <td>{stock.location?.name}</td>
                <td className="numeric quantity">{stock.quantity}</td>
              </tr>
            )}
          </tbody>
        </table>
        {!data.stocks.length && <Empty text="No stock positions yet." />}
      </div>
    </Page> 
  );
}

function Move({ data, api, run }) { 
  const [type, setType] = useState('receive'); 
  const [form, setForm] = useState({ itemId: '', from: '', to: '', quantity: '' }); 
  
  const change = (key) => (e) => setForm({ ...form, [key]: e.target.value }); 
  
  const submit = (e) => { 
    e.preventDefault(); 
    const amount = Number(form.quantity); 
    const source = data.stocks.find((s) => s.itemId === Number(form.itemId) && s.locationId === Number(form.from)); 
    const destination = data.stocks.find((s) => s.itemId === Number(form.itemId) && s.locationId === Number(form.to)); 
    if (type !== 'receive' && (!source || source.quantity < amount)) 
      return run(() => Promise.reject(new Error('Not enough stock at the source location.')), ''); 
    
    return run(async () => { 
      if (type !== 'receive') 
        await api.updateStock(source.id, { quantity: source.quantity - amount, locationId: source.locationId }); 
      if (type !== 'ship') { 
        if (destination) 
          await api.updateStock(destination.id, { 
            quantity: destination.quantity + amount, 
            locationId: destination.locationId 
          }
        ); 
        else 
          await api.createStock({ 
            itemId: Number(form.itemId), 
            quantity: amount, 
            locationId: Number(form.to) 
          }) 
      } 
    }, 'Stock movement recorded.').then(() => setForm({ ...form, quantity: '' })) 
  }; 
  
  return ( 
    <Page eyebrow="Operations / movement" title="Move stock">
      <div className="form-layout">
        <form className="panel stack-form" onSubmit={submit}>
          <div className="segmented">
            {['receive', 'ship', 'transfer'].map((option) => 
              <button 
                type="button" 
                className={type === option ? 'selected' : ''} 
                onClick={() => setType(option)} 
                key={option}
              >
                {option}
              </button>
            )}
          </div>
          <label>
            Item
            <select value={form.itemId} onChange={change('itemId')} required>
              <option value="">Select an item</option>
              {data.items.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
            </select>
          </label>
          {type !== 'receive' && <label>
            From location
            <select value={form.from} onChange={change('from')} required>
              <option value="">Select source</option>
              {data.locations.map((location) => <option key={location.id} value={location.id}>{location.name}</option>)}
            </select>
          </label>}
          {type !== 'ship' && <label>
            To location
            <select value={form.to} onChange={change('to')} required>
              <option value="">Select destination</option>
              {data.locations.map((location) => <option key={location.id} value={location.id}>{location.name}</option>)}
            </select>
          </label>}
          <label>
            Quantity
            <input type="number" min="1" step="1" value={form.quantity} onChange={change('quantity')} required />
          </label>
          <button className="primary" type="submit">
            Record {type} 
            <span>→</span>
          </button>
        </form>
        <div className="form-aside">
          <p className="eyebrow">How it works</p>
          <h2>Make the floor<br /><em>match reality.</em></h2>
          <p>Existing positions combine automatically when stock arrives at a destination.</p>
        </div>
      </div>
    </Page> 
  );
}

function Crud({ title, eyebrow, rows, fields, create, update, remove, run }) {
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
      action={<button className="primary inline" onClick={() => { setEditing({}); setForm({}) }}>Add record <span>+</span></button>}
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

function Accounts({ data, api, run, setData }) {
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ role: 'USER' })

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
            <button className="danger-text" onClick={() => run(() => api.removeUser(account.id), 'Account removed.')}>Remove</button>
          </div>
        </article>)}
      </div>
      {editing && <RecordModal 
        title={editing.id ? 'Update access' : 'Create account'} 
        fields={['username', 'password', 'role']} 
        form={form} setForm={setForm} 
        setEditing={setEditing} save={save} passwordField 
      />}
    </Page>
  )
}

function RecordModal({ title, fields, form, setForm, setEditing, save, passwordField }) {
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

function Password({ api, run }) {
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

function Empty({ text }) {
  return <div className="empty">{text}</div>
}
