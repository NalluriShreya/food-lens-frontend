import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Leaf, Camera, Upload, Sparkles, Clock, Thermometer, AlertTriangle, CheckCircle2, Info } from 'lucide-react'
import toast from 'react-hot-toast'
import ImageUploader from '../components/ImageUploader'
import { scans } from '../utils/api'
import { useAuth } from '../context/AuthContext'
import styles from './FreshnessScan.module.css'

const STATUS_CONFIG = {
  'Raw':       { color: 'var(--info)',    bg: 'var(--info-dim)',    icon: '🌱', tip: 'Not yet ready to eat for most varieties.' },
  'Ripe':      { color: 'var(--success)', bg: 'var(--success-dim)', icon: '✅', tip: 'Peak flavour and nutrition. Eat soon.' },
  'Over-ripe': { color: 'var(--warning)', bg: 'var(--warning-dim)', icon: '⚠️', tip: 'Still edible. Best for smoothies or cooking.' },
  'Spoiled':   { color: 'var(--danger)',  bg: 'var(--danger-dim)',  icon: '🚫', tip: 'Do not consume. Discard safely.' },
}

export default function FreshnessScan({ userId }) {
  const { user, updateUser } = useAuth()
  const [image, setImage] = useState(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  const analyze = async () => {
    if (!image) return toast.error('Please capture or upload a produce image first.')
    setLoading(true)
    setResult(null)
    try {
      const res = await scans.freshness({ user_id: userId, image_base64: image })
      setResult(res.data)
      // Keep local user in sync with the scan_count the backend just incremented
      if (user) updateUser({ ...user, scan_count: (user.scan_count || 0) + 1 })
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Analysis failed. Try again.')
    } finally {
      setLoading(false)
    }
  }

  const status = result ? STATUS_CONFIG[result.status] || STATUS_CONFIG['Ripe'] : null

  return (
    <div className={styles.wrap}>
      <div className={styles.intro}>
        <div className={styles.introIcon}><Leaf size={22} /></div>
        <div>
          <h2>Freshness Detector</h2>
          <p>AI-powered ripeness and spoilage analysis for fruits & vegetables</p>
        </div>
      </div>

      <div className={styles.uploaderSection}>
        <ImageUploader
          label="Capture your produce"
          description="Take a clear, well-lit photo of the fruit or vegetable. Whole item or close-up of affected areas."
          why="Sharp images improve identification accuracy by 40%"
          icon={Leaf}
          value={image}
          onChange={setImage}
          required
        />
      </div>

      <button
        className={`${styles.analyzeBtn} ${loading ? styles.loading : ''}`}
        onClick={analyze}
        disabled={loading || !image}
      >
        {loading ? (
          <>
            <span className="spin" style={{width:18,height:18,border:'2px solid rgba(10,10,15,0.3)',borderTopColor:'#0a0a0f',borderRadius:'50%',display:'inline-block'}} />
            Analysing freshness...
          </>
        ) : (
          <><Sparkles size={17} /> Analyse Freshness</>
        )}
      </button>

      <AnimatePresence>
        {result && (
          <motion.div
            className={styles.results}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            {/* Header */}
            <div className={styles.resultHeader}>
              <div>
                <span className={styles.statusEmoji}>{status.icon}</span>
                <h3>{result.item_name}</h3>
                <span className={styles.statusBadge} style={{ color: status.color, background: status.bg }}>
                  {result.status}
                </span>
              </div>
              <div className={styles.confidence}>
                <div className={styles.confBar}>
                  <div className={styles.confFill} style={{ width: `${result.confidence_score * 100}%`, background: status.color }} />
                </div>
                <span style={{ color: status.color }}>{(result.confidence_score * 100).toFixed(0)}% confidence</span>
              </div>
            </div>

            <div className={styles.statusTip} style={{ background: status.bg, borderColor: status.color + '33' }}>
              <Info size={14} style={{ color: status.color, flexShrink: 0 }} />
              <span style={{ color: status.color }}>{status.tip}</span>
            </div>

            {/* Cards grid */}
            <div className={styles.grid}>
              <div className={styles.infoCard}>
                <Clock size={16} className={styles.cardIcon} />
                <label>Estimated shelf life</label>
                <strong>{result.estimated_shelf_life}</strong>
              </div>
            </div>

            {/* Visual indicators */}
            <div className={styles.section}>
              <h4>Observed markers</h4>
              <ul className={styles.indicatorList}>
                {result.visual_indicators.map((v, i) => (
                  <li key={i}>
                    <span className={styles.dot} />
                    {v}
                  </li>
                ))}
              </ul>
            </div>

            {/* Storage tips */}
            {result.storage_tips?.length > 0 && (
              <div className={styles.section}>
                <h4>Storage tips</h4>
                <ul className={styles.tipsList}>
                  {result.storage_tips.map((t, i) => (
                    <li key={i}>
                      <CheckCircle2 size={13} style={{ color: 'var(--success)', flexShrink: 0 }} />
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Nutritional highlights */}
            {result.nutritional_highlights?.length > 0 && (
              <div className={styles.section}>
                <h4>Nutrition at this stage</h4>
                <div className={styles.nutChips}>
                  {result.nutritional_highlights.map((n, i) => (
                    <span key={i} className={styles.nutChip}>{n}</span>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}