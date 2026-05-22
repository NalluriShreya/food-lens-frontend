import { useState, useRef, useCallback } from 'react'
import { Camera, Upload, X, CheckCircle, Image } from 'lucide-react'
import styles from './ImageUploader.module.css'

export default function ImageUploader({
  label,
  description,
  why,
  icon: Icon,
  value,
  onChange,
  required = false,
  accentColor = 'var(--accent)',
}) {
  const [showCamera, setShowCamera] = useState(false)
  const [stream, setStream] = useState(null)
  const fileRef = useRef(null)
  const videoRef = useRef(null)
  const canvasRef = useRef(null)

  const startCamera = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }, audio: false
      })
      setStream(s)
      setShowCamera(true)
      setTimeout(() => {
        if (videoRef.current) videoRef.current.srcObject = s
      }, 100)
    } catch {
      // fallback to file
      fileRef.current?.click()
    }
  }

  const stopCamera = useCallback(() => {
    stream?.getTracks().forEach(t => t.stop())
    setStream(null)
    setShowCamera(false)
  }, [stream])

  const capture = () => {
    const v = videoRef.current
    const c = canvasRef.current
    if (!v || !c) return
    c.width = v.videoWidth
    c.height = v.videoHeight
    c.getContext('2d').drawImage(v, 0, 0)
    onChange(c.toDataURL('image/jpeg', 0.88))
    stopCamera()
  }

  const handleFile = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => onChange(ev.target.result)
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  const clear = (e) => {
    e.stopPropagation()
    onChange(null)
  }

  return (
    <div className={styles.wrap} style={{ '--accent-local': accentColor }}>
      {showCamera ? (
        <div className={styles.cameraWrap}>
          <video ref={videoRef} autoPlay playsInline className={styles.video} />
          <canvas ref={canvasRef} style={{ display: 'none' }} />
          <div className={styles.cameraOverlay}>
            <div className={styles.viewfinder} />
            <div className={styles.cameraActions}>
              <button className={styles.cancelBtn} onClick={stopCamera}><X size={18} /></button>
              <button className={styles.captureBtn} onClick={capture}>
                <div className={styles.captureInner} />
              </button>
              <div style={{ width: 44 }} />
            </div>
          </div>
        </div>
      ) : (
        <div className={`${styles.card} ${value ? styles.hasValue : ''}`}>
          {value ? (
            <div className={styles.previewWrap}>
              <img src={value} alt={label} className={styles.preview} />
              <div className={styles.previewOverlay}>
                <CheckCircle size={20} className={styles.checkIcon} />
                <button className={styles.clearBtn} onClick={clear}><X size={16} /></button>
              </div>
            </div>
          ) : (
            <div className={styles.inner}>
              <div className={styles.iconRow}>
                {Icon && <div className={styles.iconBox}><Icon size={20} /></div>}
                {required && <span className={styles.reqBadge}>Required</span>}
              </div>
              <div className={styles.text}>
                <strong>{label}</strong>
                <p>{description}</p>
                {why && <span className={styles.why}>↑ {why}</span>}
              </div>
              <div className={styles.actions}>
                <button className={styles.cameraBtn} onClick={startCamera}>
                  <Camera size={15} /> Camera
                </button>
                <button className={styles.uploadBtn} onClick={() => fileRef.current?.click()}>
                  <Upload size={15} /> Upload
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />
    </div>
  )
}