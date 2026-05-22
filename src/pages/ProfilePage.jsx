import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, User, Save, Heart, ShieldCheck } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import { auth } from '../utils/api'
import styles from './Profile.module.css'

const MEDICAL_OPTIONS = [
  'Diabetes (Type 1)', 'Diabetes (Type 2)', 'Hypertension', 'Heart Disease',
  'Celiac Disease', 'IBS / IBD', 'High Cholesterol', 'Kidney Disease',
  'Thyroid Condition', 'PCOS', 'Lactose Intolerance', 'None',
]
const ALLERGY_OPTIONS = [
  'Peanuts', 'Tree Nuts', 'Milk/Dairy', 'Eggs', 'Wheat/Gluten',
  'Soy', 'Fish', 'Shellfish', 'Sesame', 'Sulfites', 'None'
]
const DIET_OPTIONS = [
  'Vegetarian', 'Vegan', 'Jain', 'Halal', 'Kosher',
  'Keto', 'Low-Sodium', 'Low-Sugar', 'High-Protein', 'Gluten-Free',
]

export default function ProfilePage() {
  const { user, updateUser } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: user?.name || '',
    age: user?.age || '',
    gender: user?.gender || '',
    weight_kg: user?.weight_kg || '',
    height_cm: user?.height_cm || '',
    medical_conditions: user?.medical_conditions || [],
    allergies: user?.allergies || [],
    dietary_preferences: user?.dietary_preferences || [],
  })

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const toggleArr = (k, v) => setForm(f => ({
    ...f,
    [k]: f[k].includes(v) ? f[k].filter(x => x !== v) : [...f[k], v]
  }))

  const save = async () => {
    setLoading(true)
    try {
      const res = await auth.updateProfile(user._id, form)
      updateUser(res.data.user)
      toast.success('Profile updated!')
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Update failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.container}>
        <div className={styles.header}>
          <Link to="/dashboard" className={styles.back}>
            <ArrowLeft size={18} /> Dashboard
          </Link>
          <h1>Edit Profile</h1>
          <p>Update your health details for more accurate food analysis</p>
        </div>

        <motion.div
          className={styles.sections}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Personal */}
          <section className={styles.section}>
            <div className={styles.sectionHead}>
              <User size={18} />
              <h3>Personal information</h3>
            </div>
            <div className={styles.grid}>
              <div className={styles.field}>
                <label>Full name</label>
                <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="Your name" />
              </div>
              <div className={styles.field}>
                <label>Age</label>
                <input type="number" value={form.age} onChange={e => set('age', e.target.value)} placeholder="25" />
              </div>
              <div className={styles.field}>
                <label>Gender</label>
                <select value={form.gender} onChange={e => set('gender', e.target.value)}>
                  <option value="">Prefer not to say</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Non-binary">Non-binary</option>
                </select>
              </div>
              <div className={styles.field}>
                <label>Weight (kg)</label>
                <input type="number" value={form.weight_kg} onChange={e => set('weight_kg', e.target.value)} placeholder="70" />
              </div>
              <div className={styles.field}>
                <label>Height (cm)</label>
                <input type="number" value={form.height_cm} onChange={e => set('height_cm', e.target.value)} placeholder="170" />
              </div>
            </div>
          </section>

          {/* Health */}
          <section className={styles.section}>
            <div className={styles.sectionHead}>
              <Heart size={18} style={{ color: 'var(--danger)' }} />
              <h3>Medical conditions</h3>
            </div>
            <div className={styles.chips}>
              {MEDICAL_OPTIONS.map(m => (
                <button key={m} type="button"
                  className={`${styles.chip} ${form.medical_conditions.includes(m) ? styles.chipActive : ''}`}
                  onClick={() => toggleArr('medical_conditions', m)}
                >{m}</button>
              ))}
            </div>
          </section>

          <section className={styles.section}>
            <div className={styles.sectionHead}>
              <ShieldCheck size={18} style={{ color: 'var(--warning)' }} />
              <h3>Allergies</h3>
            </div>
            <div className={styles.chips}>
              {ALLERGY_OPTIONS.map(a => (
                <button key={a} type="button"
                  className={`${styles.chip} ${form.allergies.includes(a) ? styles.chipDanger : ''}`}
                  onClick={() => toggleArr('allergies', a)}
                >{a}</button>
              ))}
            </div>
          </section>

          <section className={styles.section}>
            <div className={styles.sectionHead}>
              <ShieldCheck size={18} style={{ color: 'var(--accent)' }} />
              <h3>Dietary preferences</h3>
            </div>
            <div className={styles.chips}>
              {DIET_OPTIONS.map(d => (
                <button key={d} type="button"
                  className={`${styles.chip} ${form.dietary_preferences.includes(d) ? styles.chipActive : ''}`}
                  onClick={() => toggleArr('dietary_preferences', d)}
                >{d}</button>
              ))}
            </div>
          </section>

          <button className={styles.saveBtn} onClick={save} disabled={loading}>
            {loading ? (
              <span className="spin" style={{width:18,height:18,border:'2px solid rgba(10,10,15,0.3)',borderTopColor:'#0a0a0f',borderRadius:'50%',display:'inline-block'}} />
            ) : <><Save size={16} /> Save changes</>}
          </button>
        </motion.div>
      </div>
    </div>
  )
}