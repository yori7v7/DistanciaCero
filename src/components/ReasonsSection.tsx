import { useEffect, useRef, useState } from 'react'
import SectionTitle from './SectionTitle'
import { Heart, MousePointer2, X, ZoomIn } from 'lucide-react'
import { mergeCollectionWithLocal } from '../services/contentService'

const BALL_SIZE = 62
const RADIUS = BALL_SIZE / 2
const MAX_SPEED = 1.14
const JITTER = 0.007
const MIN_Z = -100
const MAX_Z = 160
const PADDING = 42

function clampSpeed(value, limit) {
  if (value > limit) return limit
  if (value < -limit) return -limit
  return value
}

function shuffleArray(array) {
  const copy = [...array]

  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const temp = copy[i]
    copy[i] = copy[j]
    copy[j] = temp
  }

  return copy
}

function ReasonsSection({ reasons = [] }) {
  const [allReasons, setAllReasons] = useState(() => mergeCollectionWithLocal(reasons, 'reasons'))
  const [selectedReason, setSelectedReason] = useState(null)
  const selectedReasonRef = useRef(null)
  const containerRef = useRef(null)
  const sectionRef = useRef(null)
  const itemRefs = useRef([])
  const animationRef = useRef(null)
  const objectsRef = useRef([])
  const hasInitializedRef = useRef(false)

  useEffect(() => {
    setAllReasons(mergeCollectionWithLocal(reasons, 'reasons'))
  }, [reasons])

  useEffect(() => {
    const handleContentUpdate = (event) => {
      if (event.detail?.collection !== 'reasons') return
      setAllReasons(mergeCollectionWithLocal(reasons, 'reasons'))
      hasInitializedRef.current = false
    }

    window.addEventListener('distancia-cero-content-updated', handleContentUpdate)

    return () => {
      window.removeEventListener('distancia-cero-content-updated', handleContentUpdate)
    }
  }, [reasons])

  useEffect(() => {
    selectedReasonRef.current = selectedReason
  }, [selectedReason])

  useEffect(() => {
    const container = containerRef.current
    const section = sectionRef.current

    if (!container || !section || !allReasons?.length) return

    const getBounds = () => {
      const rect = container.getBoundingClientRect()
      const width = Math.max(rect.width || container.clientWidth, 720)
      const height = Math.max(rect.height || container.clientHeight, 1120)

      return {
        width,
        height,
        minX: PADDING,
        minY: PADDING,
        maxX: width - BALL_SIZE - PADDING,
        maxY: height - BALL_SIZE - PADDING,
      }
    }

    const applyObjectStyle = (obj) => {
      if (!obj.el) return

      const depth = (obj.z - MIN_Z) / (MAX_Z - MIN_Z)
      const scale = 0.72 + depth * 0.52
      const brightness = 0.82 + depth * 0.32
      const opacity = 0.72 + depth * 0.28

      obj.el.style.transform = `translate3d(${obj.x}px, ${obj.y}px, ${obj.z}px) rotate(${obj.angle}deg) scale(${scale})`
      obj.el.style.zIndex = String(20 + Math.round(depth * 220))
      obj.el.style.filter = `brightness(${brightness}) saturate(${0.98 + depth * 0.22})`
      obj.el.style.opacity = String(opacity)
    }

    const createObjects = () => {
      const bounds = getBounds()
      const usableWidth = Math.max(1, bounds.maxX - bounds.minX)
      const usableHeight = Math.max(1, bounds.maxY - bounds.minY)

      const cols = Math.max(6, Math.ceil(Math.sqrt(allReasons.length * (usableWidth / usableHeight))))
      const rows = Math.max(6, Math.ceil(allReasons.length / cols))

      const cells = []

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          cells.push({ row, col })
        }
      }

      const shuffledCells = shuffleArray(cells)

      const objects = allReasons.map((reason, index) => {
        const cell = shuffledCells[index] || {
          col: index % cols,
          row: Math.floor(index / cols)
        }

        const cellW = usableWidth / cols
        const cellH = usableHeight / rows

        const jitterX = (Math.random() - 0.5) * Math.max(10, cellW * 0.42)
        const jitterY = (Math.random() - 0.5) * Math.max(10, cellH * 0.42)

        const x = Math.max(
          bounds.minX,
          Math.min(bounds.maxX, bounds.minX + cell.col * cellW + cellW / 2 - BALL_SIZE / 2 + jitterX)
        )

        const y = Math.max(
          bounds.minY,
          Math.min(bounds.maxY, bounds.minY + cell.row * cellH + cellH / 2 - BALL_SIZE / 2 + jitterY)
        )

        return {
          id: reason.id,
          x,
          y,
          z: MIN_Z + Math.random() * (MAX_Z - MIN_Z),
          vx: (Math.random() * 0.66 + 0.22) * (Math.random() > 0.5 ? 1 : -1),
          vy: (Math.random() * 0.66 + 0.22) * (Math.random() > 0.5 ? 1 : -1),
          vz: (Math.random() * 0.28 + 0.1) * (Math.random() > 0.5 ? 1 : -1),
          angle: Math.random() * 360,
          rotationSpeed: (Math.random() * 0.22 + 0.06) * (Math.random() > 0.5 ? 1 : -1),
          el: itemRefs.current[index],
        }
      })

      objectsRef.current = objects
      objects.forEach(applyObjectStyle)
      hasInitializedRef.current = true
    }

    const resolveCollisions = (objects) => {
      for (let i = 0; i < objects.length; i++) {
        for (let j = i + 1; j < objects.length; j++) {
          const a = objects[i]
          const b = objects[j]

          const ax = a.x + RADIUS
          const ay = a.y + RADIUS
          const bx = b.x + RADIUS
          const by = b.y + RADIUS

          const dx = bx - ax
          const dy = by - ay
          const dist = Math.sqrt(dx * dx + dy * dy)
          const minDist = BALL_SIZE - 8

          if (dist > 0 && dist < minDist) {
            const nx = dx / dist
            const ny = dy / dist
            const overlap = minDist - dist

            a.x -= nx * (overlap / 2)
            a.y -= ny * (overlap / 2)
            b.x += nx * (overlap / 2)
            b.y += ny * (overlap / 2)

            const tempVx = a.vx
            const tempVy = a.vy
            const tempVz = a.vz

            a.vx = b.vx + (Math.random() - 0.5) * 0.05
            a.vy = b.vy + (Math.random() - 0.5) * 0.05
            a.vz = b.vz

            b.vx = tempVx + (Math.random() - 0.5) * 0.05
            b.vy = tempVy + (Math.random() - 0.5) * 0.05
            b.vz = tempVz
          }
        }
      }
    }

    const animate = () => {
      if (selectedReasonRef.current) {
        animationRef.current = requestAnimationFrame(animate)
        return
      }

      const isHidden = section.classList.contains('scene-hidden') || section.offsetParent === null

      if (isHidden) {
        animationRef.current = requestAnimationFrame(animate)
        return
      }

      if (!hasInitializedRef.current) {
        createObjects()
      }

      const bounds = getBounds()
      const objects = objectsRef.current

      objects.forEach((obj) => {
        obj.vx += (Math.random() - 0.5) * JITTER
        obj.vy += (Math.random() - 0.5) * JITTER

        obj.vx = clampSpeed(obj.vx, MAX_SPEED)
        obj.vy = clampSpeed(obj.vy, MAX_SPEED)

        obj.x += obj.vx
        obj.y += obj.vy
        obj.z += obj.vz
        obj.angle += obj.rotationSpeed

        if (obj.x <= bounds.minX) {
          obj.x = bounds.minX
          obj.vx = Math.abs(obj.vx)
        }

        if (obj.x >= bounds.maxX) {
          obj.x = bounds.maxX
          obj.vx = -Math.abs(obj.vx)
        }

        if (obj.y <= bounds.minY) {
          obj.y = bounds.minY
          obj.vy = Math.abs(obj.vy)
        }

        if (obj.y >= bounds.maxY) {
          obj.y = bounds.maxY
          obj.vy = -Math.abs(obj.vy)
        }

        if (obj.z <= MIN_Z) {
          obj.z = MIN_Z
          obj.vz = Math.abs(obj.vz)
        }

        if (obj.z >= MAX_Z) {
          obj.z = MAX_Z
          obj.vz = -Math.abs(obj.vz)
        }
      })

      resolveCollisions(objects)
      objects.forEach(applyObjectStyle)

      animationRef.current = requestAnimationFrame(animate)
    }

    const resetWhenVisible = () => {
      if (section.classList.contains('scene-hidden') || section.offsetParent === null) return

      hasInitializedRef.current = false

      setTimeout(() => {
        if (!section.classList.contains('scene-hidden')) {
          createObjects()
        }
      }, 80)
    }

    const handleSceneChange = (event) => {
      if (event.detail?.sceneId === 'razones' || event.detail?.appSceneId === 'razones') {
        resetWhenVisible()
      }
    }

    const handleResize = () => {
      resetWhenVisible()
    }

    window.addEventListener('distancia-cero-scene-change', handleSceneChange)
    window.addEventListener('resize', handleResize)

    animationRef.current = requestAnimationFrame(animate)

    setTimeout(() => {
      if (!section.classList.contains('scene-hidden')) {
        createObjects()
      }
    }, 120)

    return () => {
      cancelAnimationFrame(animationRef.current)
      window.removeEventListener('distancia-cero-scene-change', handleSceneChange)
      window.removeEventListener('resize', handleResize)
    }
  }, [allReasons])

  const openReason = (event, reason) => {
    event.preventDefault()
    event.stopPropagation()
    setSelectedReason(reason)
  }

  return (
    <section className="section reasons-section" id="razones" ref={sectionRef}>
      <SectionTitle
        eyebrow="100 razones"
        title="Aquí dejé flotando 100 razones por las que te amo"
        text="Las dejé libres, rebotando y chocando entre sí, porque ni mis razones para amarte saben quedarse quietas."
      />

      <div className="reasons-3d-chaos-shell fade-up">
        <div className="true-3d-hud reasons-chaos-hud">
          <span>
            <ZoomIn size={16} />
            Profundidad 3D
          </span>
          <span>
            <MousePointer2 size={16} />
            Toca una razón
          </span>
          <span>
            <Heart size={16} />
            Se mueven solitas
          </span>
        </div>

        <div className="reasons-3d-chaos-box" ref={containerRef}>
          {allReasons.map((reason, index) => (
            <button
              className="reason-heart chaotic-heart hyper-chaotic-heart reason-depth-heart"
              key={reason.id}
              ref={(el) => {
                itemRefs.current[index] = el
              }}
              onPointerDown={(event) => openReason(event, reason)}
              title={reason.title}
              type="button"
            >
              <Heart size={18} />
              <span>{reason.displayLabel || reason.id}</span>
            </button>
          ))}
        </div>
      </div>

      {selectedReason && (
        <div className="reason-modal-backdrop" onPointerDown={() => setSelectedReason(null)}>
          <article
            className="reason-modal reason-modal-true-3d"
            role="dialog"
            aria-modal="true"
            aria-labelledby="reason-modal-title"
            onPointerDown={(event) => event.stopPropagation()}
          >
            <button className="reason-close" type="button" onPointerDown={() => setSelectedReason(null)} aria-label="Cerrar">
              <X size={18} />
            </button>

            <div className="reason-modal-heart">
              <Heart size={34} />
            </div>

            <span>{selectedReason.title}</span>
            <h3 id="reason-modal-title">{selectedReason.text}</h3>

            <button className="main-button" type="button" onPointerDown={() => setSelectedReason(null)}>
              Cerrar
            </button>
          </article>
        </div>
      )}
    </section>
  )
}

export default ReasonsSection
