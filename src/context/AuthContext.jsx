import { createContext, useContext, useState, useEffect } from 'react'
import { auth } from '../utils/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const saved = localStorage.getItem('foodlens_user')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setUser(parsed)
        // Re-fetch fresh profile in the background so scan_count etc. are current
        if (parsed?._id) {
          auth.getProfile(parsed._id)
            .then(res => {
              setUser(res.data)
              localStorage.setItem('foodlens_user', JSON.stringify(res.data))
            })
            .catch(() => {}) // silently ignore — stale cache is still usable
        }
      } catch {}
    }
    setLoading(false)
  }, [])

  const login = (userData) => {
    setUser(userData)
    localStorage.setItem('foodlens_user', JSON.stringify(userData))
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('foodlens_user')
  }

  const updateUser = (updated) => {
    setUser(updated)
    localStorage.setItem('foodlens_user', JSON.stringify(updated))
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)