import axios from 'axios'

// Use backend URL from env, fallback to relative path for dev
const baseURL = import.meta.env.VITE_BACKEND_URL 
  ? `${import.meta.env.VITE_BACKEND_URL}/api` 
  : '/api'

const API = axios.create({ 
  baseURL,
  timeout: 30000,           // optional: prevent long hangs
})

export const auth = {
  register: (data) => API.post('/auth/register', data),
  login: (data) => API.post('/auth/login', data),
  getProfile: (id) => API.get(`/auth/profile/${id}`),
  updateProfile: (id, data) => API.put(`/auth/profile/${id}`, data),
}

export const scans = {
  freshness: (data) => API.post('/analyze/freshness', data),
  forensic: (data) => API.post('/analyze/forensic', data),
  history: (userId) => API.get(`/scans/${userId}`),
}

export default API