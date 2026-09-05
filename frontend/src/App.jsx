import { useEffect, useMemo, useState } from 'react'
import { BrowserRouter } from 'react-router'
import { createApi } from './api'

import { Shell } from './components/Shell'
import { ConnectScreen } from './components/Pages/ConnectScreen'

const initialUrl = localStorage.getItem('inventory_api_url') || 'http://localhost:5001'
const blank = { items: [], locations: [], stocks: [], users: [] }

export default function App() {
  const [apiUrl, setApiUrl] = useState(initialUrl)
  const [token, setToken] = useState(localStorage.getItem('inventory_token'))
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('inventory_user') || 'null'))
  const [data, setData] = useState(blank)
  const [error, setError] = useState('')

  const api = useMemo(() => createApi(apiUrl, token, setToken), [apiUrl, token])

  // Helper function to refresh data from API
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
  }, [api]);

  // Check if there is a valid refresh token on mount and attempt to refresh the JWT
  useEffect(() => {
    const checkAuth = async () => { 
      if (!token) {
        try {
          const response = await api.refresh();
          setToken(response.token);
          console.log(token);
        } catch (err) {
          setToken(null); 
        }
      }
    };

    checkAuth();
  }, []);

  // Catch when the user is null and attempt to refresh user data using the JWT
  useEffect(() => {
    const checkUser = async () => { 
      if (!user && token) {
        try {
          const response = await api.getMyUser();
          setUser(response.data);
        } catch (err) {
          console.error('Failed to fetch user data:', err);
          setToken(null);
        }
      }
    };

    checkUser();
  }, [token]);

  // Handle login
  const login = async (url, username, password) => {
    const connectedUrl = url
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
    <ConnectScreen onLogin={login} error={error} setError={setError} url={initialUrl} />
  )

  // Render the main application shell when authenticated
  return (
    <BrowserRouter>
      <Shell 
        user={user} api={api} data={data} 
        setData={setData} refresh={refresh} error={error} 
        setError={setError} logout={logout} 
      />
    </BrowserRouter>
  )
}