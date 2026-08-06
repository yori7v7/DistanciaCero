import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Html, OrbitControls, Stars } from '@react-three/drei'
import * as THREE from 'three'
import SectionTitle from './SectionTitle'
import { ArrowLeft, MousePointer2, Sparkles, ZoomIn } from 'lucide-react'

const ORBIT_CONFIGS = [
  { radius: 6.4, speed: 0.105, flatten: 0.78, incline: 0.18, phase: 0.25, ring: false, moon: false },
  { radius: 9.2, speed: 0.091, flatten: 0.8, incline: -0.22, phase: 1.45, ring: true, moon: false },
  { radius: 12.4, speed: 0.079, flatten: 0.76, incline: 0.28, phase: 2.65, ring: false, moon: true },
  { radius: 15.9, speed: 0.069, flatten: 0.82, incline: -0.3, phase: 3.88, ring: false, moon: false },
  { radius: 19.7, speed: 0.061, flatten: 0.8, incline: 0.34, phase: 5.05, ring: true, moon: false },
  { radius: 23.8, speed: 0.053, flatten: 0.84, incline: -0.26, phase: 0.95, ring: false, moon: true },
  { radius: 28.2, speed: 0.047, flatten: 0.86, incline: 0.2, phase: 2.08, ring: true, moon: false },
]

function CameraRig({ focus, controlsRef }) {
  const { camera } = useThree()
  const desired = useRef(new THREE.Vector3(0, 10, 38)).current
  const target = useRef(new THREE.Vector3(0, 0, 0)).current

  useFrame(() => {
    if (focus) {
      const focusPoint = new THREE.Vector3(focus.position[0], focus.position[1], focus.position[2])
      desired.set(
        focus.position[0] + focus.offset[0],
        focus.position[1] + focus.offset[1],
        focus.position[2] + focus.offset[2],
      )

      camera.position.lerp(desired, 0.052)
      target.lerp(focusPoint, 0.07)
    } else {
      desired.set(0, 10, 38)
      camera.position.lerp(desired, 0.08)
      target.lerp(new THREE.Vector3(0, 0, 0), 0.09)
    }

    if (controlsRef.current) {
      controlsRef.current.target.copy(target)
      controlsRef.current.update()
    }
  })

  return null
}

function OrbitRing({ radius, flatten = 0.8, incline = 0, opacity = 0.14 }) {
  return (
    <group rotation={[incline, 0, 0]}>
      <mesh rotation={[Math.PI / 2, 0, 0]} scale={[1, flatten, 1]}>
        <torusGeometry args={[radius, 0.014, 10, 300]} />
        <meshBasicMaterial color="#ff84c8" transparent opacity={opacity} />
      </mesh>
    </group>
  )
}

function PlanetAtmosphere({ size, color }) {
  return (
    <mesh>
      <sphereGeometry args={[size * 1.18, 40, 40]} />
      <meshBasicMaterial color={color} transparent opacity={0.13} blending={THREE.AdditiveBlending} />
    </mesh>
  )
}

function PlanetVisual({ planet, size, config, active }) {
  const spinRef = useRef(null)
  const moonRef = useRef(null)
  const shimmerRef = useRef(null)

  useFrame(({ clock }) => {
    if (spinRef.current) {
      spinRef.current.rotation.y += 0.01
      spinRef.current.rotation.x = Math.sin(clock.elapsedTime * 0.5) * 0.035
    }

    if (moonRef.current) {
      moonRef.current.rotation.y += 0.018
    }

    if (shimmerRef.current) {
      shimmerRef.current.rotation.y -= 0.006
    }
  })

  return (
    <group ref={spinRef}>
      <PlanetAtmosphere size={size} color={planet.colorB || planet.colorA} />

      <mesh castShadow receiveShadow>
        <sphereGeometry args={[size, 64, 64]} />
        <meshPhysicalMaterial
          color={planet.colorA}
          emissive={planet.colorB || planet.colorA}
          emissiveIntensity={active ? 0.42 : 0.18}
          roughness={0.4}
          metalness={0.14}
          clearcoat={0.72}
          clearcoatRoughness={0.2}
          sheen={0.4}
          sheenColor={new THREE.Color(planet.colorB || planet.colorA)}
        />
      </mesh>

      <mesh ref={shimmerRef}>
        <sphereGeometry args={[size * 1.012, 32, 32]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.055} />
      </mesh>

      <mesh position={[-size * 0.24, size * 0.2, size * 0.62]}>
        <sphereGeometry args={[size * 0.09, 16, 16]} />
        <meshBasicMaterial color="#fff6fb" transparent opacity={0.32} />
      </mesh>

      {config.ring && (
        <>
          <mesh rotation={[Math.PI / 2.45, 0.32, 0.08]}>
            <torusGeometry args={[size * 1.65, size * 0.065, 16, 220]} />
            <meshStandardMaterial
              color="#ffd8f1"
              emissive="#ff7ac8"
              emissiveIntensity={0.52}
              transparent
              opacity={0.78}
              roughness={0.28}
              metalness={0.2}
            />
          </mesh>

          <mesh rotation={[Math.PI / 2.45, 0.32, 0.08]}>
            <torusGeometry args={[size * 1.98, size * 0.018, 10, 220]} />
            <meshBasicMaterial color="#fff3fa" transparent opacity={0.28} />
          </mesh>
        </>
      )}

      {config.moon && (
        <group ref={moonRef}>
          <mesh position={[size * 2.15, 0.04, 0]}>
            <sphereGeometry args={[size * 0.18, 24, 24]} />
            <meshStandardMaterial
              color="#ffd8f1"
              emissive="#ff7ac8"
              emissiveIntensity={0.18}
              roughness={0.46}
            />
          </mesh>
        </group>
      )}
    </group>
  )
}

function Planet3D({ planet, index, activeId, onSelect }) {
  const orbitRef = useRef(null)
  const config = ORBIT_CONFIGS[index] || {
    radius: 7 + index * 3.2,
    speed: 0.06,
    flatten: 0.82,
    incline: 0,
    phase: index,
    ring: false,
    moon: false,
  }

  const size = Math.max(0.42, Math.min(0.78, planet.size / 88))

  useFrame(({ clock }) => {
    const t = clock.elapsedTime * config.speed + config.phase
    const flatZ = Math.sin(t) * config.radius * config.flatten

    const x = Math.cos(t) * config.radius
    const y = flatZ * Math.sin(config.incline)
    const z = flatZ * Math.cos(config.incline)

    if (orbitRef.current && activeId !== planet.id) {
      orbitRef.current.position.set(x, y, z)
    }
  })

  const pickPlanet = (event) => {
    event.stopPropagation()

    const world = new THREE.Vector3()
    orbitRef.current?.getWorldPosition(world)

    onSelect(planet, [world.x, world.y, world.z], [0, 1.4, 5.2])
  }

  return (
    <>
      <OrbitRing
        radius={config.radius}
        flatten={config.flatten}
        incline={config.incline}
        opacity={activeId === planet.id ? 0.32 : 0.12}
      />

      <group ref={orbitRef}>
        <group onClick={pickPlanet}>
          <PlanetVisual planet={planet} size={size} config={config} active={activeId === planet.id} />
        </group>

        <Html center distanceFactor={9.2} position={[0, -size - 0.42, 0]}>
          <button
            className={`planet-3d-label ${activeId === planet.id ? 'planet-3d-label-active' : ''}`}
            type="button"
            onClick={pickPlanet}
          >
            {planet.name}
          </button>
        </Html>
      </group>
    </>
  )
}

function CenterStar({ center, activeId, onSelect }) {
  const starRef = useRef(null)
  const haloRef = useRef(null)

  useFrame(({ clock }) => {
    const t = clock.elapsedTime

    if (starRef.current) {
      starRef.current.scale.setScalar(1 + Math.sin(t * 1.25) * 0.018)
    }

    if (haloRef.current) {
      haloRef.current.scale.setScalar(1.06 + Math.sin(t * 1.1) * 0.03)
    }
  })

  const pickCenter = (event) => {
    event.stopPropagation()

    onSelect(
      {
        ...center,
        id: 'center-core',
        isCenter: true,
        colorA: '#ff84c8',
        colorB: '#ff275f',
        hasRing: false,
        features: center.features || [],
      },
      [0, 0, 0],
      [0, 2.4, 9.2],
    )
  }

  return (
    <group>
      <mesh ref={starRef} onClick={pickCenter} castShadow receiveShadow>
        <sphereGeometry args={[1.5, 72, 72]} />
        <meshPhysicalMaterial
          color="#ff5cab"
          emissive="#ff275f"
          emissiveIntensity={0.92}
          roughness={0.24}
          metalness={0.12}
          clearcoat={0.74}
          clearcoatRoughness={0.16}
        />
      </mesh>

      <mesh ref={haloRef}>
        <sphereGeometry args={[2.2, 48, 48]} />
        <meshBasicMaterial color="#ff84c8" transparent opacity={0.1} blending={THREE.AdditiveBlending} />
      </mesh>

      {/* Plain text label below the sun — no button, no sphere, just text */}
      <Html center distanceFactor={11} position={[0, -2.2, 0]} style={{ pointerEvents: 'none' }}>
        <div className="core-3d-label">
          <Sparkles size={14} />
          <strong>Nosotros</strong>
          <span>El centro</span>
        </div>
      </Html>
    </group>
  )
}

function UniverseScene({ universe, activeWorld, cameraFocus, onSelect }) {
  const controlsRef = useRef(null)
  const planets = useMemo(() => universe.planets || [], [universe])
  const center = universe.center || {}

  return (
    <>
      <color attach="background" args={['#040008']} />
      <fog attach="fog" args={['#040008', 38, 72]} />

      <ambientLight intensity={0.84} />
      <pointLight position={[0, 0, 0]} intensity={13} color="#ff84c8" />
      <pointLight position={[10, 12, 16]} intensity={3.4} color="#ffffff" />
      <pointLight position={[-14, -7, -12]} intensity={2.1} color="#7c4cff" />

      <Stars radius={135} depth={70} count={2200} factor={4.8} saturation={0} fade speed={0.18} />

      <CenterStar center={center} activeId={activeWorld?.id} onSelect={onSelect} />

      {planets.map((planet, index) => (
        <Planet3D
          key={planet.id}
          planet={planet}
          index={index}
          activeId={activeWorld?.id}
          onSelect={onSelect}
        />
      ))}

      <CameraRig focus={cameraFocus} controlsRef={controlsRef} />

      <OrbitControls
        ref={controlsRef}
        enableZoom
        enablePan={false}
        minDistance={9}
        maxDistance={48}
        rotateSpeed={0.55}
        zoomSpeed={0.72}
        dampingFactor={0.08}
        enableDamping
      />
    </>
  )
}

function UniverseSection({ universe }) {
  const [activeWorld, setActiveWorld] = useState(null)
  const [cameraFocus, setCameraFocus] = useState(null)
  const [showDetails, setShowDetails] = useState(false)
  const detailsRef = useRef(null)
  const systemRef = useRef(null)
  const timerRef = useRef(null)

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  const selectPlanet = (planet, position, offset) => {
    if (timerRef.current) clearTimeout(timerRef.current)

    setShowDetails(false)
    setActiveWorld(planet)
    setCameraFocus({ position, offset })

    timerRef.current = setTimeout(() => {
      setShowDetails(true)
      setTimeout(() => {
        detailsRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        })
      }, 140)
    }, 950)
  }

  const closePlanet = () => {
    if (timerRef.current) clearTimeout(timerRef.current)

    setShowDetails(false)
    setActiveWorld(null)
    setCameraFocus(null)

    setTimeout(() => {
      systemRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      })
    }, 140)
  }

  return (
    <section className="section" id="universo">
      <SectionTitle
        eyebrow="Universo"
        title="Este es el sistema solar que imaginé para nosotros"
        text="Quise que cada planeta se sintiera más vivo, más bonito y más nuestro, como si realmente existiera allá afuera."
      />

      <div className="true-3d-card universe-3d-shell fade-up" ref={systemRef}>
        <div className="true-3d-hud">
          <span>
            <ZoomIn size={16} />
            Zoom con la ruedita
          </span>
          <span>
            <MousePointer2 size={16} />
            Arrastra para girar
          </span>
          <span>
            <Sparkles size={16} />
            Toca un planeta
          </span>
        </div>

        <Canvas className="true-3d-canvas" shadows camera={{ position: [0, 10, 38], fov: 42 }}>
          <Suspense fallback={null}>
            <UniverseScene
              universe={universe}
              activeWorld={activeWorld}
              cameraFocus={cameraFocus}
              onSelect={selectPlanet}
            />
          </Suspense>
        </Canvas>
      </div>

      {activeWorld && showDetails && (
        <article className="universe-selected-card fade-up" ref={detailsRef}>
          <div className="universe-selected-orb" style={{ '--planet-a': activeWorld.colorA, '--planet-b': activeWorld.colorB } as React.CSSProperties}>
            <span></span>
          </div>

          <div className="universe-selected-content">
            <span>{activeWorld.type}</span>
            <h3>{activeWorld.name}</h3>
            <p>{activeWorld.description}</p>

            <ul>
              {(activeWorld.features || []).map((feature, index) => (
                <li key={index}>{feature}</li>
              ))}
            </ul>

            <button className="main-button planet-back-button" type="button" onClick={closePlanet}>
              <ArrowLeft size={18} />
              {activeWorld.isCenter ? 'Cerrar centro' : 'Cerrar planeta'}
            </button>
          </div>
        </article>
      )}
    </section>
  )
}

export default UniverseSection
