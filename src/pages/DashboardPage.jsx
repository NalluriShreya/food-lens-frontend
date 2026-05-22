import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Leaf, FlaskConical, BarChart3, User, LogOut, Zap } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import FreshnessScan from '../components/FreshnessScan'
import ForensicScan from '../components/ForensicScan'
import Insights from '../components/Insights'
import styles from './Dashboard.module.css'

const TABS = [
  { id: 'freshness', label: 'Freshness', icon: Leaf, color: 'var(--accent)' },
  { id: 'forensic',  label: 'Forensics', icon: FlaskConical, color: 'var(--info)' },
  { id: 'insights',  label: 'Insights',  icon: BarChart3, color: 'var(--purple)' },
]

export default function DashboardPage() {
  const { user, logout } = useAuth()
  const [tab, setTab] = useState('freshness')

  return (
    <div className={styles.layout}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.sideTop}>
          <div className={styles.brand}>
            <div className={styles.brandIcon}><Zap size={18} /></div>
            <span>FoodLens</span>
          </div>

          <nav className={styles.nav}>
            {TABS.map(t => (
              <button
                key={t.id}
                className={`${styles.navBtn} ${tab === t.id ? styles.navActive : ''}`}
                style={{ '--tab-color': t.color }}
                onClick={() => setTab(t.id)}
              >
                <t.icon size={18} />
                <span>{t.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className={styles.sideBottom}>
          <Link to="/profile" className={styles.profileBtn}>
            <div className={styles.avatar}>
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className={styles.profileInfo}>
              <strong>{user?.name}</strong>
              <span>{user?.scan_count || 0} scans</span>
            </div>
          </Link>
          <button className={styles.logoutBtn} onClick={logout} title="Sign out">
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className={styles.main}>
        {/* Mobile header */}
        <div className={styles.mobileHeader}>
          <div className={styles.brand} style={{ gap: 8 }}>
            <div className={styles.brandIcon}><Zap size={16} /></div>
            <span style={{ fontSize: 18 }}>FoodLens</span>
          </div>
          <div className={styles.mobileTabs}>
            {TABS.map(t => (
              <button
                key={t.id}
                className={`${styles.mobileTab} ${tab === t.id ? styles.mobileTabActive : ''}`}
                style={{ '--tab-color': t.color }}
                onClick={() => setTab(t.id)}
              >
                <t.icon size={18} />
              </button>
            ))}
          </div>
          <Link to="/profile">
            <div className={styles.avatar} style={{ width: 32, height: 32, fontSize: 14 }}>
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
          </Link>
        </div>

        <div className={styles.contentWrap}>
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
            >
              {tab === 'freshness' && <FreshnessScan userId={user?._id} />}
              {tab === 'forensic' && <ForensicScan userId={user?._id} userProfile={user} />}
              {tab === 'insights' && <Insights userId={user?._id} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  )
}