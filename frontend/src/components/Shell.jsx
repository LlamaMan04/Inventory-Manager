import { useEffect, useState } from 'react'
import { Link, Routes, Route, useNavigate } from 'react-router'
import { Overview } from './Pages/Overview'
import { StockView } from './Pages/StockView'
import { MoveStock } from './Pages/MoveStock'
import { Manage } from './Pages/Manage'
import { AccountsView } from './Pages/AccountsView'
import { UpdatePassword } from './Pages/UpdatePassword'
import { Nav } from './Building-Blocks/Nav'
import { LoadingScreen } from './Pages/LoadingScreen'

export function Shell({ user, api, data, setData, refresh, error, setError, logout, directHome, setDirectHome }) {
  // State for notices and errors
  const [notice, setNotice] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    if (directHome) {
      navigate('/', { replace: true })
    }
  }, [])

  useEffect(() => {
    if (!menuOpen) return

    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setMenuOpen(false)
    }

    document.addEventListener('keydown', closeOnEscape)
    return () => document.removeEventListener('keydown', closeOnEscape)
  }, [menuOpen])

  // Helper function to run an action and refresh data, handling errors and notices
  const run = async (action, message) => { 
    try { 
      await action(); 
      await refresh(); 
      setError(''); 
      setNotice(message); 
      setTimeout(() => setNotice(''), 3000) 
      return true
    } catch (err) { 
      setError(err.message) 
      return false
    } 
  }

  if (!user) {
    return (
      <LoadingScreen />
    )
  }

  return (
    <div className="app-container">
      <header className="top-nav">
        <button
          className="menu-toggle"
          type="button"
          aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={menuOpen}
          aria-controls="primary-navigation"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span />
          <span />
          <span />
        </button>
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
        {menuOpen && <button className="sidebar-backdrop" type="button" aria-label="Close navigation menu" onClick={() => setMenuOpen(false)} />}
        <aside id="primary-navigation" className={`sidebar ${menuOpen ? 'is-open' : ''}`} onClick={() => setMenuOpen(false)}>
          <p className="side-label">Operations</p>
          <Nav to="/" text="Overview" />
          <Nav to="/stock" text="Stock ledger" />
          <Nav to="/move" text="Move stock" />
          <p className="side-label">Manage</p>
          <Nav to="/catalog" text="Items" />
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
            <Route path="/stock" element={<StockView data={data} />} />
            <Route path="/move" element={<MoveStock data={data} api={api} run={run} />} />
            <Route path="/catalog" element={
              <Manage 
                title="Items" 
                eyebrow="Manage / Items" 
                rows={data.items} 
                fields={['name', 'description', 'barcode']} 
                create={api.createItem} 
                update={api.updateItem} 
                remove={api.removeItem} 
                run={run} 
              />} 
            />
            <Route path="/locations" element={
              <Manage 
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
              <AccountsView data={data} api={api} run={run} setData={setData} />} />
            }
            <Route path="/password" element={<UpdatePassword api={api} run={run} />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}
