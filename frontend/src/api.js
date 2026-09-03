export function normalizeApiUrl(value) {
  const trimmed = value.trim().replace(/\/+$/, '')
  if (!trimmed) throw new Error('Enter the backend API URL.')
  return /^https?:\/\//i.test(trimmed) ? trimmed : `http://${trimmed}`
}

export function createApi(baseUrl, token) {
  const request = async (path, options = {}) => {
    const response = await fetch(`${baseUrl}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    })
    const body = await response.json().catch(() => ({}))
    if (!response.ok) throw new Error(body.message || body.errors?.form?._errors?.[0] || 'Request failed.')
    return body
  }

  return {
    login: (username, password) => request('/auth', { method: 'POST', body: JSON.stringify({ username, password }) }),
    logout: () => request('/auth/logout', { method: 'POST' }),
    users: () => request('/auth/users'),
    register: (data) => request('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
    updateUser: (id, data) => request(`/auth/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    removeUser: (id) => request(`/auth/remove/${id}`, { method: 'DELETE' }),
    updatePassword: (data) => request('/auth/update-password', { method: 'POST', body: JSON.stringify(data) }),
    items: () => request('/item'),
    createItem: (data) => request('/item', { method: 'POST', body: JSON.stringify(data) }),
    updateItem: (id, data) => request(`/item/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    removeItem: (id) => request(`/item/${id}`, { method: 'DELETE' }),
    locations: () => request('/location'),
    createLocation: (data) => request('/location', { method: 'POST', body: JSON.stringify(data) }),
    updateLocation: (id, data) => request(`/location/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    removeLocation: (id) => request(`/location/${id}`, { method: 'DELETE' }),
    stocks: () => request('/stock'),
    createStock: (data) => request('/stock', { method: 'POST', body: JSON.stringify(data) }),
    updateStock: (id, data) => request(`/stock/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  }
}