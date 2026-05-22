import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Leaf, Zap } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import { auth } from '../utils/api'
import styles from './Auth.module.css'

export default function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)

  const handle = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    if (!form.email || !form.password) return toast.error('Fill in all fields.')
    setLoading(true)
    try {
      const res = await auth.login(form)
      login(res.data.user)
      toast.success(`Welcome back, ${res.data.user.name}!`)
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Login failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.glow1} />
      <div className={styles.glow2} />

      <motion.div
        className={styles.card}
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className={styles.logo}>
          <div className={styles.logoIcon}>
            <Leaf size={20} strokeWidth={2} />
          </div>
          <span>FoodLens</span>
        </div>

        <div className={styles.header}>
          <h1>Welcome back</h1>
          <p>Sign in to continue your food intelligence journey</p>
        </div>

        <form onSubmit={submit} className={styles.form}>
          <div className={styles.field}>
            <label>Email address</label>
            <input
              name="email" type="email" placeholder="you@email.com"
              value={form.email} onChange={handle} autoComplete="email"
            />
          </div>

          <div className={styles.field}>
            <label>Password</label>
            <div className={styles.pwWrap}>
              <input
                name="password" type={showPw ? 'text' : 'password'}
                placeholder="Your password"
                value={form.password} onChange={handle}
                autoComplete="current-password"
              />
              <button type="button" className={styles.pwToggle} onClick={() => setShowPw(v => !v)}>
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button className={styles.submitBtn} type="submit" disabled={loading}>
            {loading ? <span className="spin" style={{ display: 'inline-block', width: 18, height: 18, border: '2px solid #0a0a0f', borderTopColor: 'transparent', borderRadius: '50%' }} /> : (
              <><Zap size={16} /> Sign In</>
            )}
          </button>
        </form>

        <p className={styles.switchLink}>
          New to FoodLens?{' '}
          <Link to="/register">Create an account →</Link>
        </p>
      </motion.div>
    </div>
  )
}