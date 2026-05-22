import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff, Leaf, User, Heart, ChevronRight, ChevronLeft, Check } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import { auth } from '../utils/api'
import styles from './Auth.module.css'
import regStyles from './Register.module.css'

const STEPS = [
  { id: 'account', title: 'Create account', subtitle: 'Your login credentials' },
  { id: 'personal', title: 'Personal details', subtitle: 'For personalised analysis' },
  { id: 'health', title: 'Health profile', subtitle: 'Helps flag risks accurately' },
]

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

export default function RegisterPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [step, setStep] = useState(0)
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: '', email: '', password: '',
    age: '', weight_kg: '', height_cm: '', gender: '',
    medical_conditions: [], allergies: [], dietary_preferences: [],
  })

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }))
  const toggleArr = (key, val) => {
    setForm(f => ({
      ...f,
      [key]: f[key].includes(val) ? f[key].filter(x => x !== val) : [...f[key], val]
    }))
  }

  const next = () => {
    if (step === 0) {
      if (!form.name || !form.email || !form.password) return toast.error('Fill all required fields.')
      if (form.password.length < 6) return toast.error('Password must be 6+ characters.')
    }
    setStep(s => Math.min(s + 1, STEPS.length - 1))
  }

  const submit = async () => {
    setLoading(true)
    try {
      const payload = {
        ...form,
        age: parseInt(form.age) || 25,
        weight_kg: parseFloat(form.weight_kg) || null,
        height_cm: parseFloat(form.height_cm) || null,
      }
      const res = await auth.register(payload)
      login(res.data.user)
      toast.success('Account created! Welcome to FoodLens.')
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Registration failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.glow1} />
      <div className={styles.glow2} />

      <motion.div
        className={`${styles.card} ${regStyles.regCard}`}
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className={styles.logo}>
          <div className={styles.logoIcon}><Leaf size={20} /></div>
          <span>FoodLens</span>
        </div>

        {/* Step indicator */}
        <div className={regStyles.steps}>
          {STEPS.map((s, i) => (
            <div key={s.id} className={`${regStyles.stepDot} ${i <= step ? regStyles.active : ''} ${i < step ? regStyles.done : ''}`}>
              {i < step ? <Check size={12} /> : i + 1}
            </div>
          ))}
        </div>

        <div className={styles.header}>
          <h1>{STEPS[step].title}</h1>
          <p>{STEPS[step].subtitle}</p>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
          >
            {/* Step 0: Account */}
            {step === 0 && (
              <div className={styles.form}>
                <div className={styles.field}>
                  <label>Full name <span style={{color:'var(--danger)'}}>*</span></label>
                  <input placeholder="Arjun Sharma" value={form.name} onChange={e => set('name', e.target.value)} />
                </div>
                <div className={styles.field}>
                  <label>Email address <span style={{color:'var(--danger)'}}>*</span></label>
                  <input type="email" placeholder="arjun@email.com" value={form.email} onChange={e => set('email', e.target.value)} />
                </div>
                <div className={styles.field}>
                  <label>Password <span style={{color:'var(--danger)'}}>*</span></label>
                  <div className={styles.pwWrap}>
                    <input type={showPw ? 'text' : 'password'} placeholder="Min 6 characters" value={form.password} onChange={e => set('password', e.target.value)} />
                    <button type="button" className={styles.pwToggle} onClick={() => setShowPw(v => !v)}>
                      {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Step 1: Personal */}
            {step === 1 && (
              <div className={styles.form}>
                <div className={regStyles.row2}>
                  <div className={styles.field}>
                    <label>Age</label>
                    <input type="number" placeholder="25" min={1} max={120} value={form.age} onChange={e => set('age', e.target.value)} />
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
                </div>
                <div className={regStyles.row2}>
                  <div className={styles.field}>
                    <label>Weight (kg)</label>
                    <input type="number" placeholder="70" value={form.weight_kg} onChange={e => set('weight_kg', e.target.value)} />
                  </div>
                  <div className={styles.field}>
                    <label>Height (cm)</label>
                    <input type="number" placeholder="170" value={form.height_cm} onChange={e => set('height_cm', e.target.value)} />
                  </div>
                </div>

                <div className={styles.field}>
                  <label>Dietary preferences <span className={regStyles.hint}>(select all that apply)</span></label>
                  <div className={regStyles.chips}>
                    {DIET_OPTIONS.map(d => (
                      <button key={d} type="button"
                        className={`${regStyles.chip} ${form.dietary_preferences.includes(d) ? regStyles.chipActive : ''}`}
                        onClick={() => toggleArr('dietary_preferences', d)}
                      >{d}</button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Health */}
            {step === 2 && (
              <div className={styles.form}>
                <div className={styles.field}>
                  <label>
                    <Heart size={14} style={{display:'inline',marginRight:6,verticalAlign:'middle',color:'var(--danger)'}}/>
                    Medical conditions
                    <span className={regStyles.hint}> — used to flag ingredient risks</span>
                  </label>
                  <div className={regStyles.chips}>
                    {MEDICAL_OPTIONS.map(m => (
                      <button key={m} type="button"
                        className={`${regStyles.chip} ${form.medical_conditions.includes(m) ? regStyles.chipActive : ''}`}
                        onClick={() => toggleArr('medical_conditions', m)}
                      >{m}</button>
                    ))}
                  </div>
                </div>

                <div className={styles.field}>
                  <label>Known allergies <span className={regStyles.hint}> — triggers allergen alerts</span></label>
                  <div className={regStyles.chips}>
                    {ALLERGY_OPTIONS.map(a => (
                      <button key={a} type="button"
                        className={`${regStyles.chip} ${form.allergies.includes(a) ? regStyles.chipDanger : ''}`}
                        onClick={() => toggleArr('allergies', a)}
                      >{a}</button>
                    ))}
                  </div>
                </div>

                <div className={regStyles.privacyNote}>
                  🔒 Your health data is stored securely and only used to personalise food safety analysis.
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className={regStyles.navRow}>
          {step > 0 ? (
            <button className={styles.btn + ' ' + regStyles.backBtn} onClick={() => setStep(s => s - 1)}>
              <ChevronLeft size={16} /> Back
            </button>
          ) : <div />}

          {step < STEPS.length - 1 ? (
            <button className={styles.submitBtn} style={{padding:'12px 24px'}} onClick={next}>
              Continue <ChevronRight size={16} />
            </button>
          ) : (
            <button className={styles.submitBtn} style={{padding:'12px 24px'}} onClick={submit} disabled={loading}>
              {loading ? <span className="spin" style={{width:18,height:18,border:'2px solid #0a0a0f',borderTopColor:'transparent',borderRadius:'50%',display:'inline-block'}} /> : (
                <><Check size={16} /> Create Account</>
              )}
            </button>
          )}
        </div>

        <p className={styles.switchLink}>
          Already have an account? <Link to="/login">Sign in →</Link>
        </p>
      </motion.div>
    </div>
  )
}