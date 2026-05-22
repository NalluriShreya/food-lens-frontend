import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FlaskConical, ScanBarcode, FileText, Package, TrendingDown,
  Sparkles, CheckCircle2, ShieldAlert, ShieldCheck,
  ChevronDown, ChevronUp, Zap, Heart, Info,
} from 'lucide-react'
import toast from 'react-hot-toast'
import ImageUploader from './ImageUploader'
import MultiImageUploader from './MultiImageUploader'
import { scans } from '../utils/api'
import { useAuth } from '../context/AuthContext'
import styles from './ForensicScan.module.css'

// ─── Upload sections (simplified) ────────────────────────────────────────────
const SINGLE_INPUTS = [
  {
    key: 'ingredient_image',
    label: 'Ingredient List',
    description: 'Photograph the full ingredients panel clearly.',
    why: 'Primary source for additive, allergen & claim detection',
    icon: FileText,
    required: true,
    color: 'var(--accent)',
  },
  {
    key: 'nutrition_image',
    label: 'Nutrition Table',
    description: 'Capture the complete nutritional information table.',
    why: 'Required for NutriScore, sugar-tsp and sodium calculations',
    icon: TrendingDown,
    required: true,
    color: 'var(--info)',
  },
  {
    key: 'barcode_image',
    label: 'Barcode / QR Code',
    description: 'Scan the barcode or QR code on the product.',
    why: 'Enables product database lookup and batch tracking',
    icon: ScanBarcode,
    required: false,
    color: 'var(--warning)',
  },
]

const MULTI_INPUTS = [
  {
    key: 'front_images',
    label: 'Front Packaging',
    description: 'Main product face — brand, claims, certifications.',
    why: 'AI extracts FSSAI marks, marketing claims & expiry from these',
    icon: Package,
    required: false,
    color: 'var(--purple)',
  },
  {
    key: 'back_images',
    label: 'Back Packaging',
    description: 'Full back panel — fine print, disclaimers, dates.',
    why: 'AI extracts manufacture/expiry dates, FSSAI, hidden info',
    icon: Package,
    required: false,
    color: 'var(--purple)',
  },
]

const RISK_CONFIG = {
  'Low':             { color: 'var(--success)', bg: 'var(--success-dim)', icon: '🟢' },
  'Medium':          { color: 'var(--warning)', bg: 'var(--warning-dim)', icon: '🟡' },
  'Critical Danger': { color: 'var(--danger)',  bg: 'var(--danger-dim)',  icon: '🔴' },
}

export default function ForensicScan({ userId, userProfile }) {
  const { user, updateUser } = useAuth()
  // Single-image state
  const [images, setImages]     = useState({})
  // Multi-image state
  const [multiImages, setMulti] = useState({ front_images: [], back_images: [] })

  const [loading, setLoading] = useState(false)
  const [result,  setResult]  = useState(null)
  const [expanded, setExpanded] = useState({})

  const setImg   = (key, val)  => setImages(prev => ({ ...prev, [key]: val }))
  const setMultiArr = (key, arr) => setMulti(prev => ({ ...prev, [key]: arr }))

  // Progress: count filled single-images + any multi-group that has ≥1 image
  const singleFilled = Object.values(images).filter(Boolean).length
  const multiFilled  = Object.values(multiImages).filter(arr => arr.length > 0).length
  const totalSections = SINGLE_INPUTS.length + MULTI_INPUTS.length
  const filledCount   = singleFilled + multiFilled

  const hasRequired = images.ingredient_image || images.nutrition_image

  const analyze = async () => {
    if (!hasRequired) {
      return toast.error('Please upload at least the Ingredient List or Nutrition Table.')
    }
    setLoading(true)
    setResult(null)
    try {
      // Send single images + first image of each multi-group for backend compat
      // Backend receives: ingredient_image, nutrition_image, barcode_image,
      //   front_image (first of front_images), back_image (first of back_images),
      //   plus all additional packaging images as front_images_extra / back_images_extra
      const payload = {
        user_id: userId,
        // single images
        ...images,
        // primary packaging images (keep original keys for backend compat)
        front_image: multiImages.front_images[0] || null,
        back_image:  multiImages.back_images[0]  || null,
        // additional packaging images
        front_images_extra: multiImages.front_images.slice(1),
        back_images_extra:  multiImages.back_images.slice(1),
        // combined packaging images for AI extraction pass
        all_packaging_images: [
          ...multiImages.front_images,
          ...multiImages.back_images,
        ],
        user_age:                  userProfile?.age                  || 25,
        user_allergies:            userProfile?.allergies            || [],
        user_medical_conditions:   userProfile?.medical_conditions   || [],
        user_dietary_preferences:  userProfile?.dietary_preferences  || [],
      }
      const res = await scans.forensic(payload)
      setResult(res.data)
      // Keep local user in sync with the scan_count the backend just incremented
      if (user) updateUser({ ...user, scan_count: (user.scan_count || 0) + 1 })
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Forensic analysis failed.')
    } finally {
      setLoading(false)
    }
  }

  const toggle = (key) => setExpanded(e => ({ ...e, [key]: !e[key] }))

  return (
    <div className={styles.wrap}>
      {/* Header */}
      <div className={styles.intro}>
        <div className={styles.introIcon}><FlaskConical size={22} /></div>
        <div>
          <h2>Forensic Food Scan</h2>
          <p>Upload packaging photos — AI extracts dates, FSSAI, claims &amp; more automatically</p>
        </div>
      </div>

      {/* Progress */}
      <div className={styles.progressBar}>
        <div className={styles.progressInfo}>
          <span>{filledCount} of {totalSections} sections filled</span>
          <span className={styles.progressNote}>More images = higher accuracy</span>
        </div>
        <div className={styles.barTrack}>
          <motion.div
            className={styles.barFill}
            animate={{ width: `${(filledCount / totalSections) * 100}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
      </div>

      {/* ── Single-image uploaders ────────────────────────────────── */}
      <div className={styles.sectionLabel}>
        <span>Core Images</span>
        <span className={styles.sectionSub}>Required for analysis</span>
      </div>
      <div className={styles.inputGrid}>
        {SINGLE_INPUTS.map(inp => (
          <ImageUploader
            key={inp.key}
            label={inp.label}
            description={inp.description}
            why={inp.why}
            icon={inp.icon}
            value={images[inp.key] || null}
            onChange={v => setImg(inp.key, v)}
            required={inp.required}
            accentColor={inp.color}
          />
        ))}
      </div>

      {/* ── Multi-image uploaders ─────────────────────────────────── */}
      <div className={styles.sectionLabel}>
        <span>Packaging Photos</span>
        <span className={styles.sectionSub}>Capture multiple angles — AI extracts dates, FSSAI &amp; claims</span>
      </div>
      <div className={styles.inputGrid2}>
        {MULTI_INPUTS.map(inp => (
          <MultiImageUploader
            key={inp.key}
            label={inp.label}
            description={inp.description}
            why={inp.why}
            icon={inp.icon}
            values={multiImages[inp.key]}
            onChange={arr => setMultiArr(inp.key, arr)}
            required={inp.required}
            accentColor={inp.color}
            maxImages={6}
          />
        ))}
      </div>

      {/* Analyze button */}
      <button
        className={`${styles.analyzeBtn} ${loading ? styles.loading : ''}`}
        onClick={analyze}
        disabled={loading || !hasRequired}
      >
        {loading ? (
          <>
            <span className="spin" style={{ width:18, height:18, border:'2px solid rgba(10,10,15,0.3)', borderTopColor:'#0a0a0f', borderRadius:'50%', display:'inline-block' }} />
            Running forensic analysis...
          </>
        ) : (
          <><Zap size={17} /> Execute Forensic Scan</>
        )}
      </button>

      {/* ── Results ──────────────────────────────────────────────── */}
      <AnimatePresence>
        {result && (
          <motion.div
            className={styles.results}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Product header */}
            <div className={styles.productHeader}>
              <div>
                <span className={styles.category}>{result.product_category}</span>
                <h3>{result.identified_product}</h3>
                <p className={styles.aiVerdict}>"{result.ai_verdict}"</p>
              </div>
              <div
                className={styles.lensScore}
                style={{
                  color: result.nutrition_profile.foodlens_score >= 60
                    ? 'var(--success)'
                    : result.nutrition_profile.foodlens_score >= 40
                      ? 'var(--warning)'
                      : 'var(--danger)',
                }}
              >
                <span className={styles.scoreNum}>{result.nutrition_profile.foodlens_score}</span>
                <span className={styles.scoreLabel}>/ 100</span>
              </div>
            </div>

            {/* Personal safety banner */}
            <div
              className={styles.safetyBanner}
              style={{
                background:   result.personalized_safety.is_safe_for_profile ? 'var(--success-dim)' : 'var(--danger-dim)',
                borderColor: result.personalized_safety.is_safe_for_profile ? 'rgba(85,239,196,0.25)' : 'rgba(255,107,107,0.25)',
              }}
            >
              {result.personalized_safety.is_safe_for_profile
                ? <ShieldCheck size={20} style={{ color: 'var(--success)', flexShrink: 0 }} />
                : <ShieldAlert  size={20} style={{ color: 'var(--danger)',  flexShrink: 0 }} />}
              <div>
                <strong style={{ color: result.personalized_safety.is_safe_for_profile ? 'var(--success)' : 'var(--danger)' }}>
                  {result.personalized_safety.is_safe_for_profile ? 'Safe for your profile' : 'Risk detected for your profile'}
                </strong>
                {!result.personalized_safety.is_safe_for_profile && (
                  <ul className={styles.warnList}>
                    {[...result.personalized_safety.medical_clash_warnings, ...result.personalized_safety.allergen_warnings].map((w, i) => (
                      <li key={i}>🚨 {w}</li>
                    ))}
                  </ul>
                )}
                {result.personalized_safety.healthier_substitute && (
                  <p className={styles.substitute}>
                    💚 Healthier alternative: <em>{result.personalized_safety.healthier_substitute}</em>
                  </p>
                )}
              </div>
            </div>

            {/* Nutrition scorecard */}
            <div className={styles.block}>
              <h4 className={styles.blockTitle}>Nutrition scorecard</h4>
              <div className={styles.scoreGrid}>
                {[
                  { label: 'NutriScore',  value: result.nutrition_profile.nutri_score,        highlight: true },
                  { label: 'NOVA Class',  value: `Cat ${result.nutrition_profile.nova_class}`, warn: result.nutrition_profile.nova_class >= 4 },
                  { label: 'Sugar (tsp)', value: result.nutrition_profile.sugar_tsp,           warn: result.nutrition_profile.sugar_tsp > 6 },
                  { label: 'Sodium (mg)', value: result.nutrition_profile.sodium_mg,           warn: result.nutrition_profile.sodium_mg > 800 },
                  { label: 'Sat. Fat (g)',value: result.nutrition_profile.saturated_fat_g },
                  { label: 'Fibre (g)',   value: result.nutrition_profile.fiber_g },
                  { label: 'Protein (g)', value: result.nutrition_profile.protein_g },
                  { label: 'Calories',    value: `${result.nutrition_profile.calories_per_serving} kcal` },
                ].map(item => (
                  <div key={item.label} className={`${styles.scoreCard} ${item.warn ? styles.warnCard : ''}`}>
                    <span>{item.label}</span>
                    <strong style={{ color: item.warn ? 'var(--danger)' : item.highlight ? 'var(--accent)' : 'var(--text)' }}>
                      {item.value}
                    </strong>
                  </div>
                ))}
              </div>
              <div className={styles.gutIndex}>
                <Heart size={14} />
                Gut health: <strong>{result.nutrition_profile.gut_health_index}</strong>
              </div>
            </div>

            {/* Authentication — now AI-extracted from packaging */}
            <div className={styles.block}>
              <h4 className={styles.blockTitle}>
                Authentication
                <span className={styles.aiExtractedBadge}>
                  <Sparkles size={10} /> AI extracted from packaging
                </span>
              </h4>
              <div className={styles.authGrid}>
                {[
                  { label: 'Barcode',          value: result.authentication.barcode },
                  { label: 'FSSAI License',    value: result.authentication.fssai_license },
                  { label: 'Expiry Date',      value: result.authentication.expiry_date },
                  { label: 'Manufacture Date', value: result.authentication.manufacture_date },
                  { label: 'Origin',           value: result.authentication.origin_country },
                ].map(a => (
                  <div key={a.label} className={styles.authRow}>
                    <span>{a.label}</span>
                    <code>{a.value}</code>
                  </div>
                ))}
              </div>
            </div>

            {/* Hazardous additives */}
            <div className={styles.block}>
              <h4 className={styles.blockTitle}>
                Additive analysis
                {result.hazardous_additives.length > 0 && (
                  <span className="badge badge-red" style={{ marginLeft: 8, fontSize: 11 }}>
                    {result.hazardous_additives.length} flagged
                  </span>
                )}
              </h4>
              {result.hazardous_additives.length === 0 ? (
                <div className={styles.clearMsg}>
                  <CheckCircle2 size={16} style={{ color: 'var(--success)' }} />
                  No hazardous additives detected
                </div>
              ) : (
                <div className={styles.additiveList}>
                  {result.hazardous_additives.map((add, i) => {
                    const cfg = RISK_CONFIG[add.risk_rating] || RISK_CONFIG['Low']
                    return (
                      <div key={i} className={styles.additive} style={{ background: cfg.bg, borderColor: cfg.color + '33' }}>
                        <div className={styles.addHeader} onClick={() => toggle(`add-${i}`)}>
                          <div>
                            <span className={styles.addCode}>{cfg.icon} {add.chemical_code}</span>
                            <span className={styles.addRisk} style={{ color: cfg.color }}>{add.risk_rating}</span>
                          </div>
                          {expanded[`add-${i}`] ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </div>
                        {expanded[`add-${i}`] && (
                          <div className={styles.addDetail}>
                            <p className={styles.addReasoning}>{add.clinical_reasoning}</p>
                            <span className={styles.addRegulatory}>{add.regulatory_status}</span>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Claims verification */}
            <div className={styles.block}>
              <h4 className={styles.blockTitle}>
                Label claim audit
                <span className={styles.aiExtractedBadge}>
                  <Sparkles size={10} /> AI extracted from packaging
                </span>
              </h4>
              <div className={styles.claimsList}>
                {result.claims_compliance.map((claim, i) => (
                  <div key={i} className={styles.claim}>
                    <div className={styles.claimHeader}>
                      <span className={styles.claimText}>"{claim.marketing_claim}"</span>
                      <span className={claim.is_valid ? styles.claimValid : styles.claimInvalid}>
                        {claim.is_valid ? '✓ Verified' : '✗ Deceptive'}
                      </span>
                    </div>
                    <p className={styles.claimVerdict}>{claim.audit_verdict}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}