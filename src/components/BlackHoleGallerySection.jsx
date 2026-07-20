import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Html, OrbitControls, Stars } from '@react-three/drei'
import * as THREE from 'three'
import SectionTitle from './SectionTitle'
import { Aperture, Heart, Image as ImageIcon, MousePointer2, Orbit, Sparkles, X, ZoomIn } from 'lucide-react'
import { mergeCollectionWithLocal } from '../services/contentService'

function AccretionDiskLayer({
  inner = 1.15,
  outer = 5.4,
  rotation = [Math.PI / 2.14, 0.05, -0.12],
  opacity = 1,
  warm = 0.5,
  speed = 1,
  colorShift = 0,
}) {
  const materialRef = useRef(null)

  useFrame(({ clock }) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = clock.elapsedTime * speed
    }
  })

  return (
    <mesh rotation={rotation}>
      <ringGeometry args={[inner, outer, 320, 1]} />
      <shaderMaterial
        ref={materialRef}
        transparent
        depthWrite={false}
        side={THREE.DoubleSide}
        blending={THREE.AdditiveBlending}
        uniforms={{
          uTime: { value: 0 },
          uOpacity: { value: opacity },
          uWarm: { value: warm },
          uShift: { value: colorShift },
        }}
        vertexShader={`
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `}
        fragmentShader={`
          varying vec2 vUv;
          uniform float uTime;
          uniform float uOpacity;
          uniform float uWarm;
          uniform float uShift;

          float hash(vec2 p){
            return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
          }

          float noise(vec2 p){
            vec2 i = floor(p);
            vec2 f = fract(p);
            float a = hash(i);
            float b = hash(i + vec2(1.0, 0.0));
            float c = hash(i + vec2(0.0, 1.0));
            float d = hash(i + vec2(1.0, 1.0));
            vec2 u = f * f * (3.0 - 2.0 * f);
            return mix(a, b, u.x) +
                   (c - a) * u.y * (1.0 - u.x) +
                   (d - b) * u.x * u.y;
          }

          void main() {
            float r = vUv.x;
            float a = vUv.y * 6.28318;

            float innerFade = smoothstep(0.02, 0.16, r);
            float outerFade = 1.0 - smoothstep(0.72, 1.0, r);
            float radial = innerFade * outerFade;

            float swirl = sin(a * 9.0 + r * 24.0 - uTime * 1.35);
            float swirl2 = sin(a * 4.5 - r * 34.0 + uTime * 2.1);
            float streak = sin(a * 21.0 + uTime * 2.8 + r * 11.0) * 0.5 + 0.5;

            float grain = noise(vec2(a * 0.75 + uTime * 0.2, r * 16.0 - uTime * 0.28));
            float hotCore = pow(1.0 - r, 2.6);

            float turbulence = smoothstep(0.18, 0.95, swirl * 0.25 + swirl2 * 0.25 + grain * 0.5);
            float brightBands = smoothstep(0.46, 0.98, streak) * 0.38;

            vec3 magenta = vec3(1.0, 0.14 + uShift * 0.08, 0.46 + uShift * 0.16);
            vec3 rose = vec3(1.0, 0.28, 0.62);
            vec3 pink = vec3(1.0, 0.48, 0.82);
            vec3 blush = vec3(1.0, 0.74, 0.9);
            vec3 whiteHot = vec3(1.0, 0.96, 0.98);

            vec3 baseColor = mix(magenta, rose, turbulence);
            baseColor = mix(baseColor, pink, uWarm * 0.28 + hotCore * 0.18);
            baseColor = mix(baseColor, blush, hotCore * 0.42 + brightBands * 0.2);
            baseColor = mix(baseColor, whiteHot, hotCore * 0.78 + brightBands * 0.26);

            float alpha = radial * (0.22 + turbulence * 0.55 + hotCore * 0.78 + brightBands) * uOpacity;

            gl_FragColor = vec4(baseColor, alpha);
          }
        `}
      />
    </mesh>
  )
}

function LensingHalo() {
  const ring1 = useRef(null)
  const ring2 = useRef(null)

  useFrame(({ clock }) => {
    if (ring1.current) {
      ring1.current.rotation.z = clock.elapsedTime * 0.14
    }
    if (ring2.current) {
      ring2.current.rotation.z = -clock.elapsedTime * 0.1
    }
  })

  return (
    <>
      <mesh ref={ring1} rotation={[Math.PI / 2.3, 0.06, -0.15]} scale={[1.4, 0.62, 1]}>
        <torusGeometry args={[2.6, 0.14, 28, 260]} />
        <meshBasicMaterial color="#fff3eb" transparent opacity={0.16} blending={THREE.AdditiveBlending} />
      </mesh>

      <mesh ref={ring2} rotation={[Math.PI / 2.02, -0.18, 0.2]} scale={[1.62, 0.58, 1]}>
        <torusGeometry args={[3.2, 0.08, 24, 240]} />
        <meshBasicMaterial color="#ff8ecf" transparent opacity={0.12} blending={THREE.AdditiveBlending} />
      </mesh>
    </>
  )
}

function BlackHoleDustField() {
  const pointsRef = useRef(null)

  const particlePositions = useMemo(() => {
    const count = 2200
    const positions = new Float32Array(count * 3)

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2
      const radius = 1.5 + Math.random() * 9.8
      const spiral = angle + radius * 0.46
      const y = (Math.random() - 0.5) * 2.2 * (1 - Math.min(radius / 12, 0.84))

      positions[i * 3] = Math.cos(spiral) * radius
      positions[i * 3 + 1] = y
      positions[i * 3 + 2] = Math.sin(spiral) * radius * 0.72
    }

    return positions
  }, [])

  useFrame(({ clock }) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = clock.elapsedTime * 0.05
      pointsRef.current.rotation.z = Math.sin(clock.elapsedTime * 0.25) * 0.05
    }
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particlePositions.length / 3}
          array={particlePositions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.04}
        color="#ffd6ff"
        transparent
        opacity={0.82}
        depthWrite={false}
      />
    </points>
  )
}

function BlackHoleCore3D() {
  const coreRef = useRef(null)
  const glowRef = useRef(null)

  useFrame(({ clock }) => {
    if (coreRef.current) {
      coreRef.current.rotation.y += 0.0035
    }

    if (glowRef.current) {
      const pulse = 1.02 + Math.sin(clock.elapsedTime * 1.2) * 0.03
      glowRef.current.scale.setScalar(pulse)
    }
  })

  return (
    <group>
      <BlackHoleDustField />

      <AccretionDiskLayer
        inner={1.15}
        outer={5.9}
        rotation={[Math.PI / 2.1, 0.06, -0.12]}
        opacity={1}
        warm={0.9}
        speed={1}
        colorShift={0.1}
      />

      <AccretionDiskLayer
        inner={1.05}
        outer={4.6}
        rotation={[Math.PI / 2.3, -0.12, 0.24]}
        opacity={0.78}
        warm={0.48}
        speed={1.5}
        colorShift={0}
      />

      <AccretionDiskLayer
        inner={1.42}
        outer={7.2}
        rotation={[Math.PI / 1.98, 0.22, -0.32]}
        opacity={0.38}
        warm={0.64}
        speed={0.7}
        colorShift={0.18}
      />

      <LensingHalo />

      <mesh ref={coreRef}>
        <sphereGeometry args={[1.08, 84, 84]} />
        <meshStandardMaterial color="#000000" roughness={0.1} metalness={0.16} />
      </mesh>

      <mesh ref={glowRef}>
        <sphereGeometry args={[1.42, 84, 84]} />
        <meshBasicMaterial
          color="#ff147c"
          transparent
          opacity={0.11}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      <pointLight position={[0, 0.2, 1.2]} intensity={7.4} color="#fff0fb" />
      <pointLight position={[-2.8, 0.25, -1.8]} intensity={3.6} color="#ff6fcf" />
      <pointLight position={[2.8, -0.15, -1.2]} intensity={2.4} color="#ff78c8" />

      <Html center distanceFactor={8.2} position={[0, 0, 0]}>
        <div className="blackhole-3d-core-label">
          <span>NOSOTROS</span>
          <strong>&</strong>
          <span>NOSOTROS</span>
        </div>
      </Html>
    </group>
  )
}

function MemoryOrbit3D({ item, index, total, hasEntered, onPick, onBlocked }) {
  const groupRef = useRef(null)

  const config = useMemo(() => {
    return {
      radius: 5.2 + (index % 6) * 0.72,
      y: ((index % 6) - 2.5) * 0.34,
      speed: 0.12 + (index % 4) * 0.018,
      offset: (index / Math.max(total, 1)) * Math.PI * 2,
    }
  }, [index, total])

  useFrame(({ clock, camera }) => {
    if (!groupRef.current) return

    const t = clock.elapsedTime * config.speed + config.offset
    const x = Math.cos(t) * config.radius
    const z = Math.sin(t) * config.radius * 0.72
    const y = config.y + Math.sin(t * 1.45) * 0.12

    groupRef.current.position.set(x, y, z)
    groupRef.current.lookAt(camera.position)
  })

  const clickMemory = (event) => {
    event.stopPropagation()

    if (!hasEntered) {
      onBlocked()
      return
    }

    onPick(item)
  }

  return (
    <group ref={groupRef}>
      <Html center transform distanceFactor={8.4}>
        <button
          className={`memory-3d-card ${!hasEntered ? 'memory-3d-card-locked' : ''}`}
          type="button"
          onClick={clickMemory}
          title={hasEntered ? item.title : 'Primero entra al agujero negro'}
        >
          {item.image ? (
            <img
              src={item.image}
              alt={item.alt || item.title}
              draggable="false"
              onError={(event) => {
                event.currentTarget.style.display = 'none'
              }}
            />
          ) : (
            <Sparkles size={24} />
          )}
        </button>
      </Html>
    </group>
  )
}

function BlackHoleScene({ items, hasEntered, onPick, onBlocked }) {
  return (
    <>
      <color attach="background" args={['#010003']} />
      <fog attach="fog" args={['#010003', 20, 42]} />

      <ambientLight intensity={0.5} />
      <pointLight position={[0, 2.4, 0]} intensity={10} color="#ff4fd8" />
      <pointLight position={[6, 6, 9]} intensity={3.2} color="#ffffff" />
      <pointLight position={[-6, -3, -6]} intensity={2.6} color="#ff78c8" />

      <Stars radius={92} depth={48} count={1600} factor={4.2} saturation={0} fade speed={0.28} />

      <BlackHoleCore3D />

      {items.slice(0, 12).map((item, index) => (
        <MemoryOrbit3D
          key={item.id}
          item={item}
          index={index}
          total={items.length}
          hasEntered={hasEntered}
          onPick={onPick}
          onBlocked={onBlocked}
        />
      ))}

      <OrbitControls
        enableZoom
        enablePan={false}
        minDistance={4}
        maxDistance={18}
        rotateSpeed={0.52}
        zoomSpeed={0.7}
        dampingFactor={0.08}
        enableDamping
      />
    </>
  )
}

function BlackHoleGallerySection({ items = [] }) {
  const [localVersion, setLocalVersion] = useState(0)
  const visibleItems = useMemo(() => {
    return mergeCollectionWithLocal(Array.isArray(items) ? items : [], 'blackHoleGallery').filter(Boolean)
  }, [items, localVersion])
  const [isOpen, setIsOpen] = useState(false)
  const [isEntering, setIsEntering] = useState(false)
  const [hasEntered, setHasEntered] = useState(false)
  const [needsGate, setNeedsGate] = useState(true)
  const [activeItem, setActiveItem] = useState(visibleItems[0] || null)
  const portalRef = useRef(null)

  const warpLines = useMemo(() => Array.from({ length: 32 }, (_, index) => index), [])

  useEffect(() => {
    const activeStillExists = activeItem && visibleItems.some((item) => String(item.id) === String(activeItem.id))
    if (activeItem && !activeStillExists) {
      setActiveItem(visibleItems[0] || null)
      return
    }

    if (!activeItem && visibleItems.length > 0) {
      setActiveItem(visibleItems[0])
    }
  }, [activeItem, visibleItems])

  useEffect(() => {
    const handleContentUpdate = (event) => {
      const collection = event.detail?.collection
      if (collection === 'blackHoleGallery' || collection === 'all') {
        setLocalVersion((version) => version + 1)
      }
    }

    window.addEventListener('distancia-cero-content-updated', handleContentUpdate)
    return () => window.removeEventListener('distancia-cero-content-updated', handleContentUpdate)
  }, [])

  useEffect(() => {
    if (!isEntering) return

    const timer = setTimeout(() => {
      setIsEntering(false)
      setHasEntered(true)
      setIsOpen(true)
      setActiveItem((current) => current || visibleItems[0] || null)
    }, 2850)

    return () => clearTimeout(timer)
  }, [isEntering, visibleItems])

  useEffect(() => {
    if (!isOpen || isEntering) return

    const timer = setTimeout(() => {
      portalRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
    }, 220)

    return () => clearTimeout(timer)
  }, [isOpen, isEntering])

  const enterBlackHole = () => {
    if (isEntering) return
    setNeedsGate(false)
    setActiveItem(visibleItems[0] || null)
    setIsEntering(true)
  }

  const blockedMemory = () => {
    setNeedsGate(true)

    setTimeout(() => {
      setNeedsGate(false)
    }, 1150)
  }

  const pickMemory = (item) => {
    setIsOpen(true)
    setActiveItem(item)
  }

  return (
    <section
      className={`section blackhole-section ${isEntering ? 'blackhole-entering' : ''} ${needsGate ? 'blackhole-needs-gate' : ''} ${hasEntered ? 'blackhole-entered' : ''}`}
      id="galeria-agujero-negro"
    >
      <SectionTitle
        eyebrow="Galería"
        title="Aquí guardo todo lo que quiero volver a vivir"
        text="Quise que se sintiera menos como una simple galería y más como algo inmenso, vivo y raro, como si nuestros recuerdos de verdad se hubieran quedado atrapados en su propia gravedad."
      />

      <div className="blackhole-3d-shell fade-up">
        <div className="blackhole-copy blackhole-3d-copy">
          <span className="blackhole-kicker">
            <Orbit size={16} />
            Momentos que no quiero soltar
          </span>

          <h3>Si algo me hace pensar en ti, termina orbitando aquí.</h3>

          <p>
            Este lugar lo imaginé como un agujero negro hecho de nosotros: de lo que hemos vivido, de lo que me haces sentir y de todo eso que quisiera repetir contigo mil veces.
          </p>

          <p className="blackhole-copy-soft">
            Quiero que nuestras fotos se sientan suspendidas alrededor de algo imposible, bonito, intenso y totalmente nuestro.
          </p>

          {needsGate && (
            <p className="blackhole-gate-message">
              Primero entra conmigo al agujero negro. Después sí te enseño lo que vive ahí dentro.
            </p>
          )}

          <div className="blackhole-actions">
            <button className="main-button blackhole-enter-button" type="button" onClick={enterBlackHole}>
              <Aperture size={18} />
              Entrar al agujero negro
            </button>

            <span className="blackhole-count">
              <Heart size={16} />
              {visibleItems.length} recuerdos orbitando por ti
            </span>
          </div>
        </div>

        <div className="blackhole-3d-stage">
          <div className="true-3d-hud blackhole-3d-hud">
            <span>
              <ZoomIn size={16} />
              Zoom
            </span>
            <span>
              <MousePointer2 size={16} />
              Girar
            </span>
          </div>

          {!hasEntered && (
            <div className="blackhole-locked-label">
              Cruza primero el horizonte de sucesos
            </div>
          )}

          <Canvas className="true-3d-canvas" camera={{ position: [0, 3.4, 10], fov: 45 }}>
            <Suspense fallback={null}>
              <BlackHoleScene
                items={visibleItems}
                hasEntered={hasEntered}
                onPick={pickMemory}
                onBlocked={blockedMemory}
              />
            </Suspense>
          </Canvas>
        </div>
      </div>

      {isEntering && (
        <div className="blackhole-transition">
          <div className="blackhole-warp-lines">
            {warpLines.map((line) => (
              <span key={line} style={{ '--line-index': line }} />
            ))}
          </div>

          <div className="blackhole-transition-ring blackhole-transition-ring-1"></div>
          <div className="blackhole-transition-ring blackhole-transition-ring-2"></div>
          <div className="blackhole-transition-ring blackhole-transition-ring-3"></div>
          <div className="blackhole-transition-ring blackhole-transition-ring-4"></div>
          <div className="blackhole-transition-core"></div>

          <div className="blackhole-transition-text">
            <span>Entrando al agujero negro</span>
            <h3>Ven conmigo...</h3>
            <p>Quiero enseñarte todo lo que guardo de nosotros aquí adentro.</p>
          </div>
        </div>
      )}

      {isOpen && (
        <div ref={portalRef} className="blackhole-portal fade-up">
          <div className="portal-header">
            <div>
              <span>Dentro del horizonte de sucesos</span>
              <h3>Estos pedacitos de nosotros se quedaron viviendo en mí.</h3>
            </div>

            <button className="portal-close" type="button" onClick={() => setIsOpen(false)} aria-label="Cerrar galería">
              <X size={18} />
            </button>
          </div>

          <div className="portal-layout">
            <div className="portal-preview">
              {activeItem?.image ? (
                <img src={activeItem.image} alt={activeItem.alt || activeItem.title} draggable="false" />
              ) : (
                <div className="portal-placeholder">
                  <ImageIcon size={42} />
                  <span>Aquí quiero seguir guardando más de ti</span>
                </div>
              )}
            </div>

            <div className="portal-info">
              <span>{activeItem?.date || 'Un recuerdo nuestro'}</span>
              <h3>{activeItem?.title || 'Tú y yo, en algún rincón del universo'}</h3>
              <p>
                {activeItem?.description ||
                  activeItem?.caption ||
                  'Aunque este espacio todavía no tenga foto, igual ya existe dentro de mí. Solo está esperando el siguiente momento bonito contigo.'}
              </p>
              {activeItem?.tag && <strong>{activeItem.tag}</strong>}
            </div>
          </div>

          <div className="blackhole-gallery-grid">
            {visibleItems.map((item) => (
              <button
                className={`blackhole-photo-card ${activeItem?.id === item.id ? 'blackhole-photo-card-active' : ''}`}
                key={item.id}
                type="button"
                onClick={() => setActiveItem(item)}
              >
                <div className="blackhole-photo-thumb">
                  {item.image ? (
                    <img src={item.image} alt={item.alt || item.title} draggable="false" />
                  ) : (
                    <ImageIcon size={24} />
                  )}
                </div>

                <div className="blackhole-photo-text">
                  <span>{item.date || item.type || 'Recuerdo'}</span>
                  <h4>{item.title}</h4>
                  <p>{item.description || item.caption}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}

export default BlackHoleGallerySection


