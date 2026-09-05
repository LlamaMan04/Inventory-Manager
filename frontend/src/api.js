import axios from 'axios';

export function normalizeApiUrl(value) {
  const trimmed = value.trim().replace(/\/+$/, '')
  if (!trimmed) throw new Error('Enter the backend API URL.')
  return /^https?:\/\//i.test(trimmed) ? trimmed : `http://${trimmed}`
}



export function createApi(baseUrl, token, setToken) {
  let currentToken = token;

  // Create an Axios instance with the base URL and token
  const axiosInstance = axios.create({
    baseURL: baseUrl,
    headers: {
      'Content-Type': 'application/json',
    }
  });

  if (currentToken) {
    axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${currentToken}`;
  }

  // Interceptor to inject the token into requests if it's available
  axiosInstance.interceptors.request.use(
    (config) => {
      if (currentToken) {
        config.headers.Authorization = `Bearer ${currentToken}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Interceptor to catch 401 errors and attempt to refresh the token
  axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      if (originalRequest.url.includes('/auth/refresh')) 
        return // If the refresh request itself fails, we don't want to loop infinitely

      if (error.response 
          && error.response.status === 401 
          && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
          const refreshResponse = await request('/auth/refresh', { method: 'POST', withCredentials: true });
          const newToken = refreshResponse.token;
          currentToken = newToken;

          // Update the token in localStorage
          localStorage.setItem('inventory_token', newToken);

          // Update the Authorization header with the new token and resend the original request
          setToken(newToken); // Update the token state in the App component
          return axiosInstance(originalRequest);
        } catch (refreshError) {
          // If refresh fails, clear the token and redirect to login
          localStorage.removeItem('inventory_token');
          localStorage.removeItem('inventory_user');
          setToken(null); // Clear the token state, forcing a re-render and reauthentication
          return Promise.reject(refreshError);
        }
      }
      return Promise.reject(error);
    }
  );

  // Helper function to make requests using Axios
  const request = async (path, options = {}) => {
    try {
      const response = await axiosInstance({
        url: path,
        ...options,
      });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Request failed.';
      throw new Error(message);
    }
  };

  return {
    login: (username, password) => request('/auth', { method: 'POST', data: JSON.stringify({ username, password }), withCredentials: true }),
    logout: () => request('/auth/logout', { method: 'POST', withCredentials: true }),
    refresh: () => request('/auth/refresh', { method: 'POST', withCredentials: true }),
    users: (options) => request('/auth/users', { method: 'GET', params: options }),
    getMyUser: () => request('/auth/users/me', { method: 'GET' }),
    register: (data) => request('/auth/register', { method: 'POST', data: JSON.stringify(data) }),
    updateUser: (id, data) => request(`/auth/${id}`, { method: 'PATCH', data: JSON.stringify(data) }),
    removeUser: (id) => request(`/auth/remove/${id}`, { method: 'DELETE' }),
    updatePassword: (data) => request('/auth/update-password', { method: 'POST', data: JSON.stringify(data) }),
    items: () => request('/item'),
    createItem: (data) => request('/item', { method: 'POST', data: JSON.stringify(data) }),
    updateItem: (id, data) => request(`/item/${id}`, { method: 'PATCH', data: JSON.stringify(data) }),
    removeItem: (id) => request(`/item/${id}`, { method: 'DELETE' }),
    locations: () => request('/location'),
    createLocation: (data) => request('/location', { method: 'POST', data: JSON.stringify(data) }),
    updateLocation: (id, data) => request(`/location/${id}`, { method: 'PATCH', data: JSON.stringify(data) }),
    removeLocation: (id) => request(`/location/${id}`, { method: 'DELETE' }),
    stocks: () => request('/stock'),
    createStock: (data) => request('/stock', { method: 'POST', data: JSON.stringify(data) }),
    updateStock: (id, data) => request(`/stock/${id}`, { method: 'PATCH', data: JSON.stringify(data) }),
  }
}