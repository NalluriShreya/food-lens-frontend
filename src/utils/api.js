import axios from 'axios'

const API = axios.create({ baseURL: '/api' })

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