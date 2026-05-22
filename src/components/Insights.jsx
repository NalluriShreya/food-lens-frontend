import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { BarChart3, Leaf, FlaskConical, Clock, TrendingUp, FileDown, AlertCircle } from 'lucide-react'
import { scans } from '../utils/api'
import styles from './Insights.module.css'

export default function Insights({ userId }) {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) return
    scans.history(userId)
      .then(r => setHistory(r.data.scans || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [userId])

  const freshCount = history.filter(s => s.type === 'freshness').length
  const forensicCount = history.filter(s => s.type === 'forensic').length

  const avgScore = history
    .filter(s => s.type === 'forensic' && s.result?.nutrition_profile?.foodlens_score)
    .reduce((acc, s, i, arr) => acc + s.result.nutrition_profile.foodlens_score / arr.length, 0)

  return (
    <div className={styles.wrap}>
      <div className={styles.intro}>
        <div className={styles.introIcon}><BarChart3 size={22} /></div>
        <div>
          <h2>Scan Insights</h2>
          <p>Your food intelligence history and health trends</p>
        </div>
      </div>

      {/* Stat cards */}
      <div className={styles.statGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: 'var(--accent-dim)', color: 'var(--accent)' }}>
            <Leaf size={18} />
          </div>
          <div>
            <strong>{freshCount}</strong>
            <span>Freshness Scans</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: 'var(--info-dim)', color: 'var(--info)' }}>
            <FlaskConical size={18} />
          </div>
          <div>
            <strong>{forensicCount}</strong>
            <span>Forensic Scans</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: 'var(--purple-dim)', color: 'var(--purple)' }}>
            <TrendingUp size={18} />
          </div>
          <div>
            <strong>{forensicCount > 0 ? avgScore.toFixed(0) : '—'}</strong>
            <span>Avg FoodLens Score</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: 'var(--warning-dim)', color: 'var(--warning)' }}>
            <AlertCircle size={18} />
          </div>
          <div>
            <strong>
              {history.filter(s => s.type === 'forensic' && !s.result?.personalized_safety?.is_safe_for_profile).length}
            </strong>
            <span>Risk Alerts</span>
          </div>
        </div>
      </div>

      {/* History */}
      <div className={styles.historySection}>
        <h4>Scan history</h4>
        {loading ? (
          <div className={styles.skeleton} />
        ) : history.length === 0 ? (
          <div className={styles.empty}>
            <Clock size={32} style={{ color: 'var(--text3)', marginBottom: 12 }} />
            <p>No scans yet. Start scanning to see your food history here.</p>
          </div>
        ) : (
          <div className={styles.list}>
            {history.map((scan, i) => (
              <motion.div
                key={scan._id}
                className={styles.historyItem}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <div className={styles.histIcon} style={{
                  background: scan.type === 'freshness' ? 'var(--accent-dim)' : 'var(--info-dim)',
                  color: scan.type === 'freshness' ? 'var(--accent)' : 'var(--info)',
                }}>
                  {scan.type === 'freshness' ? <Leaf size={16} /> : <FlaskConical size={16} />}
                </div>
                <div className={styles.histMeta}>
                  <strong>
                    {scan.type === 'freshness'
                      ? scan.result?.item_name || 'Produce'
                      : scan.result?.identified_product || 'Product'}
                  </strong>
                  <span>
                    {scan.type === 'freshness'
                      ? `${scan.result?.status} · ${(scan.result?.confidence_score * 100)?.toFixed(0)}% confidence`
                      : `Score: ${scan.result?.nutrition_profile?.foodlens_score}/100`}
                  </span>
                </div>
                <div className={styles.histDate}>
                  {new Date(scan.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                </div>
                <div className={styles.histBadge}>
                  {scan.type === 'freshness' ? (
                    <span className={`badge ${
                      scan.result?.status === 'Ripe' ? 'badge-green' :
                      scan.result?.status === 'Spoiled' ? 'badge-red' : 'badge-yellow'
                    }`}>{scan.result?.status}</span>
                  ) : (
                    <span className={`badge ${
                      scan.result?.personalized_safety?.is_safe_for_profile ? 'badge-green' : 'badge-red'
                    }`}>
                      {scan.result?.personalized_safety?.is_safe_for_profile ? 'Safe' : 'Risk'}
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <div className={styles.exportRow}>
        <button className="btn-ghost" onClick={() => alert('Export feature coming soon.')}>
          <FileDown size={15} style={{ marginRight: 6 }} /> Export CSV
        </button>
        <button className="btn-ghost" onClick={() => alert('PDF report coming soon.')}>
          <FileDown size={15} style={{ marginRight: 6 }} /> Export PDF
        </button>
      </div>
    </div>
  )
}