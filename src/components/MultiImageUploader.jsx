import { useState, useRef, useCallback } from 'react'
import { Camera, Upload, X, Plus, Image as ImageIcon, CheckCircle2 } from 'lucide-react'
import styles from './MultiImageUploader.module.css'

export default function MultiImageUploader({
  label,
  description,
  why,
  icon: Icon,
  values = [],          // array of base64 strings
  onChange,             // (newArray) => void
  required = false,
  accentColor = 'var(--accent)',
  maxImages = 6,
}) {
  const [showCamera, setShowCamera] = useState(false)
  const [stream, setStream] = useState(null)
  const fileRef = useRef(null)
  const videoRef = useRef(null)
  const canvasRef = useRef(null)

  const startCamera = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }, audio: false,
      })
      setStream(s)
      setShowCamera(true)
      setTimeout(() => {
        if (videoRef.current) videoRef.current.srcObject = s
      }, 100)
    } catch {
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
    const dataUrl = c.toDataURL('image/jpeg', 0.88)
    onChange([...values, dataUrl])
    stopCamera()
  }

  const handleFile = (e) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    const remaining = maxImages - values.length
    const toLoad = files.slice(0, remaining)
    let loaded = []
    toLoad.forEach(file => {
      const reader = new FileReader()
      reader.onload = (ev) => {
        loaded.push(ev.target.result)
        if (loaded.length === toLoad.length) {
          onChange([...values, ...loaded])
        }
      }
      reader.readAsDataURL(file)
    })
    e.target.value = ''
  }

  const removeImage = (idx) => {
    onChange(values.filter((_, i) => i !== idx))
  }

  const canAddMore = values.length < maxImages

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
        <div className={`${styles.card} ${values.length > 0 ? styles.hasValues : ''}`}>
          {/* Header */}
          <div className={styles.header}>
            <div className={styles.iconRow}>
              {Icon && (
                <div className={styles.iconBox}>
                  <Icon size={18} />
                </div>
              )}
              <div className={styles.headerText}>
                <strong>
                  {label}
                  {required && <span className={styles.reqBadge}>Required</span>}
                </strong>
                <p>{description}</p>
                {why && <span className={styles.why}>↑ {why}</span>}
              </div>
            </div>
          </div>

          {/* Thumbnails grid */}
          {values.length > 0 && (
            <div className={styles.thumbGrid}>
              {values.map((src, idx) => (
                <div key={idx} className={styles.thumb}>
                  <img src={src} alt={`${label} ${idx + 1}`} className={styles.thumbImg} />
                  <button
                    className={styles.thumbRemove}
                    onClick={() => removeImage(idx)}
                    title="Remove"
                  >
                    <X size={12} />
                  </button>
                  <div className={styles.thumbBadge}>{idx + 1}</div>
                </div>
              ))}

              {/* Add more slot */}
              {canAddMore && (
                <div className={styles.addSlot}>
                  <button className={styles.addCameraBtn} onClick={startCamera} title="Take photo">
                    <Camera size={16} />
                  </button>
                  <button
                    className={styles.addUploadBtn}
                    onClick={() => fileRef.current?.click()}
                    title="Upload file"
                  >
                    <Plus size={14} />
                    <Upload size={14} />
                  </button>
                  <span className={styles.addHint}>{maxImages - values.length} more</span>
                </div>
              )}
            </div>
          )}

          {/* Empty state actions */}
          {values.length === 0 && (
            <div className={styles.emptyActions}>
              <button className={styles.cameraBtn} onClick={startCamera}>
                <Camera size={15} /> Camera
              </button>
              <button className={styles.uploadBtn} onClick={() => fileRef.current?.click()}>
                <Upload size={15} /> Upload
              </button>
            </div>
          )}

          {/* Count hint when images added */}
          {values.length > 0 && (
            <div className={styles.countRow}>
              <CheckCircle2 size={13} style={{ color: 'var(--success)' }} />
              <span>{values.length} image{values.length !== 1 ? 's' : ''} added</span>
              {values.length >= maxImages && (
                <span className={styles.maxReached}>Max reached</span>
              )}
            </div>
          )}
        </div>
      )}

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        multiple
        style={{ display: 'none' }}
        onChange={handleFile}
      />
    </div>
  )
}