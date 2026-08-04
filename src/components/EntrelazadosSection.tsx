import { useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Stars } from '@react-three/drei'
import * as THREE from 'three'
import SectionTitle from './SectionTitle'
import { Heart } from 'lucide-react'

// ─── Parámetros de animación para cada cubito ───

interface CubitoParams {
  basePosition: [number, number, number]
  color: string
  emissive: string
  size: number
  bobSpeed: number
  bobAmplitude: number
  bobPhase: number
  rotSpeedX: number
  rotSpeedY: number
  label: string
}

const PINK_CUBE: CubitoParams = {
  basePosition: [-2.2, 0, 0],
  color: '#ff84c8',
  emissive: '#ff5cab',
  size: 0.75,
  bobSpeed: 0.9,
  bobAmplitude: 0.55,
  bobPhase: 0,
  rotSpeedX: 0.006,
  rotSpeedY: 0.009,
  label: 'Ella',
}

const RED_CUBE: CubitoParams = {
  basePosition: [2.2, 0, 0],
  color: '#ff275f',
  emissive: '#d41a4a',
  size: 0.85,
  bobSpeed: 0.7,
  bobAmplitude: 0.5,
  bobPhase: Math.PI * 0.6,
  rotSpeedX: 0.005,
  rotSpeedY: 0.007,
  label: 'Él',
}

// ─── Cubito individual ───

function Cubito({ params }: { params: CubitoParams }) {
  const groupRef = useRef<THREE.Group>(null!)
  const glowRef = useRef<THREE.Mesh>(null!)
  const innerGlowRef = useRef<THREE.Mesh>(null!)

  useFrame(({ clock }) => {
    const t = clock.elapsedTime

    // Flotación suave (bobbing)
    const bobY = Math.sin(t * params.bobSpeed + params.bobPhase) * params.bobAmplitude
    // Deriva lateral sutil (respiración del espacio)
    const driftX = Math.cos(t * 0.35 + params.bobPhase) * 0.28

    groupRef.current.position.set(
      params.basePosition[0] + driftX,
      params.basePosition[1] + bobY,
      params.basePosition[2],
    )

    // Rotación lenta en múltiples ejes
    groupRef.current.rotation.x += params.rotSpeedX
    groupRef.current.rotation.y += params.rotSpeedY
    groupRef.current.rotation.z += 0.002

    // Pulso del aura exterior
    const pulse = 0.08 + Math.sin(t * 1.3 + params.bobPhase) * 0.04
    const glowMat = glowRef.current.material as THREE.MeshBasicMaterial
    glowMat.opacity = pulse
    glowRef.current.scale.setScalar(1 + Math.sin(t * 1.6) * 0.06)

    // Pulso del brillo interior
    const innerMat = innerGlowRef.current.material as THREE.MeshBasicMaterial
    innerMat.opacity = 0.18 + Math.sin(t * 1.8 + params.bobPhase) * 0.06
  })

  return (
    <group ref={groupRef}>
      {/* Aura exterior — halo grande y difuso */}
      <mesh ref={glowRef}>
        <boxGeometry args={[params.size * 2.2, params.size * 2.2, params.size * 2.2]} />
        <meshBasicMaterial
          color={params.color}
          transparent
          opacity={0.08}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Brillo interior — halo medio */}
      <mesh ref={innerGlowRef}>
        <boxGeometry args={[params.size * 1.5, params.size * 1.5, params.size * 1.5]} />
        <meshBasicMaterial
          color={params.color}
          transparent
          opacity={0.18}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Cubo principal */}
      <mesh castShadow>
        <boxGeometry args={[params.size, params.size, params.size]} />
        <meshStandardMaterial
          color={params.color}
          emissive={params.emissive}
          emissiveIntensity={0.55}
          roughness={0.28}
          metalness={0.18}
        />
      </mesh>
    </group>
  )
}

// ─── Conexión luminosa entre los cubitos ───

function ConnectionLine() {
  const lineRef = useRef<THREE.Line>(null!)

  // Crear la geometría y material una vez con useMemo
  const geometry = useMemo(() => {
    const points = [
      new THREE.Vector3(-2.2, 0, 0),
      new THREE.Vector3(-1.1, 0.15, 0),
      new THREE.Vector3(0, -0.05, 0),
      new THREE.Vector3(1.1, 0.15, 0),
      new THREE.Vector3(2.2, 0, 0),
    ]
    const curve = new THREE.CatmullRomCurve3(points)
    return new THREE.BufferGeometry().setFromPoints(curve.getPoints(60))
  }, [])

  const material = useMemo(() => {
    return new THREE.LineBasicMaterial({
      color: '#ff84c8',
      transparent: true,
      opacity: 0.25,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
  }, [])

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    const pulse = 0.25 + Math.sin(t * 1.1) * 0.12
    material.opacity = pulse
  })

  return <primitive object={new THREE.Line(geometry, material)} ref={lineRef} />
}

// ─── Partículas flotantes decorativas ───

function FloatingParticles() {
  const particlesRef = useRef<THREE.Points>(null!)
  const count = 60
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      const r = 4 + Math.random() * 7
      arr[i * 3] = r * Math.sin(phi) * Math.cos(theta)
      arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
      arr[i * 3 + 2] = r * Math.cos(phi) - 1
    }
    return arr
  }, [])

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    particlesRef.current.rotation.y += 0.0008
    particlesRef.current.rotation.x = Math.sin(t * 0.2) * 0.001
    const mat = particlesRef.current.material as THREE.PointsMaterial
    mat.opacity = 0.35 + Math.sin(t * 0.7) * 0.1
  })

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#ff84c8"
        size={0.04}
        transparent
        opacity={0.35}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  )
}

// ─── Escena 3D completa ───

function EntrelazadosScene() {
  return (
    <>
      {/* Fondo espacio profundo */}
      <color attach="background" args={['#040008']} />
      <fog attach="fog" args={['#040008', 10, 30]} />

      {/* Iluminación */}
      <ambientLight intensity={0.6} />
      <pointLight position={[-2.2, 0, 3]} intensity={8} color="#ff84c8" distance={8} />
      <pointLight position={[2.2, 0, 3]} intensity={8} color="#ff275f" distance={8} />
      <pointLight position={[0, 2, -2]} intensity={2} color="#ffffff" distance={10} />

      {/* Estrellas de fondo */}
      <Stars radius={30} depth={20} count={800} factor={3} saturation={0} fade speed={0.1} />

      {/* Partículas decorativas */}
      <FloatingParticles />

      {/* Línea de conexión */}
      <ConnectionLine />

      {/* Cubitos */}
      <Cubito params={PINK_CUBE} />
      <Cubito params={RED_CUBE} />
    </>
  )
}

// ─── Componente principal (wrapper con título y canvas) ───

function EntrelazadosSection() {
  return (
    <section className="section" id="entrelazados">
      <SectionTitle
        eyebrow="Entrelazados"
        title="Dos almas danzando en el cosmos"
        text="Como partículas entrelazadas, sin importar la distancia, siempre conectados. Una simulación viva de nosotros."
      />

      <div className="entrelazados-3d-shell fade-up">
        {/* HUD informativo */}
        <div className="entrelazados-hud">
          <span className="entrelazados-hud-dot entrelazados-hud-dot--pink" />
          <span>Ella</span>
          <Heart size={12} className="text-pink" />
          <span>Él</span>
          <span className="entrelazados-hud-dot entrelazados-hud-dot--red" />
        </div>

        <Canvas
          className="entrelazados-canvas"
          camera={{ position: [0, 1.2, 9], fov: 45 }}
          gl={{ antialias: true, alpha: false }}
          dpr={[1, 2]}
        >
          <EntrelazadosScene />
        </Canvas>
      </div>
    </section>
  )
}

export default EntrelazadosSection
