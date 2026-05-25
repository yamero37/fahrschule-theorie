'use client'

import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment, ContactShadows, Html, RoundedBox } from '@react-three/drei'
import { Suspense } from 'react'

/* ── Wheel ── */
function Wheel({ position, r = 0.31 }: { position: [number, number, number]; r?: number }) {
  const h = r * 0.64
  return (
    <group position={position} rotation={[0, 0, Math.PI / 2]}>
      {/* Tire */}
      <mesh castShadow>
        <cylinderGeometry args={[r, r, h, 32]} />
        <meshStandardMaterial color="#111111" roughness={0.88} metalness={0.04} />
      </mesh>
      {/* Rim */}
      <mesh position={[0, h * 0.54, 0]} castShadow>
        <cylinderGeometry args={[r * 0.56, r * 0.56, h * 0.28, 16]} />
        <meshStandardMaterial color="#b0b0c4" metalness={0.95} roughness={0.06} />
      </mesh>
    </group>
  )
}

/* ── Tesla Model 3 (Limousine / sportlich) ── */
function TeslaModel3() {
  return (
    <group>
      {/* Hauptkarosserie */}
      <RoundedBox
        args={[3.95, 0.52, 1.62]} radius={0.07} smoothness={4}
        position={[0, 0.51, 0]} castShadow
      >
        <meshStandardMaterial color="#f0f0f0" metalness={0.35} roughness={0.14} />
      </RoundedBox>

      {/* Kabine / Dach */}
      <RoundedBox
        args={[1.92, 0.44, 1.50]} radius={0.13} smoothness={4}
        position={[0.08, 1.01, 0]} castShadow
      >
        <meshStandardMaterial color="#f0f0f0" metalness={0.35} roughness={0.14} />
      </RoundedBox>

      {/* Frontscheibe */}
      <mesh position={[0.88, 1.00, 0]} rotation={[0, 0, -0.27]} castShadow>
        <boxGeometry args={[0.05, 0.46, 1.43]} />
        <meshStandardMaterial color="#1a2744" transparent opacity={0.87} metalness={0.05} roughness={0.0} />
      </mesh>

      {/* Heckscheibe */}
      <mesh position={[-0.80, 0.99, 0]} rotation={[0, 0, 0.22]} castShadow>
        <boxGeometry args={[0.05, 0.42, 1.43]} />
        <meshStandardMaterial color="#1a2744" transparent opacity={0.87} metalness={0.05} roughness={0.0} />
      </mesh>

      {/* Räder */}
      <Wheel position={[ 1.30, 0.31,  0.87]} r={0.31} />
      <Wheel position={[ 1.30, 0.31, -0.87]} r={0.31} />
      <Wheel position={[-1.30, 0.31,  0.87]} r={0.31} />
      <Wheel position={[-1.30, 0.31, -0.87]} r={0.31} />

      {/* Label */}
      <Html center position={[0, -0.26, 0]}>
        <div style={{
          background: 'rgba(8,8,22,0.92)',
          color: '#fff',
          padding: '4px 14px',
          borderRadius: '20px',
          fontSize: '12px',
          fontWeight: 700,
          whiteSpace: 'nowrap',
          border: '1px solid rgba(96,165,250,0.45)',
          letterSpacing: '0.03em',
          userSelect: 'none',
        }}>
          ⚡ Tesla Model 3
        </div>
      </Html>
    </group>
  )
}

/* ── VW T-Roc 2025 (SUV / höher) ── */
function VWTRoc() {
  return (
    <group>
      {/* Hauptkarosserie – breiter & höher */}
      <RoundedBox
        args={[4.18, 0.63, 1.86]} radius={0.09} smoothness={4}
        position={[0, 0.63, 0]} castShadow
      >
        <meshStandardMaterial color="#f0f0f0" metalness={0.35} roughness={0.14} />
      </RoundedBox>

      {/* Kabine – aufrechter */}
      <RoundedBox
        args={[2.18, 0.65, 1.76]} radius={0.12} smoothness={4}
        position={[0.05, 1.27, 0]} castShadow
      >
        <meshStandardMaterial color="#f0f0f0" metalness={0.35} roughness={0.14} />
      </RoundedBox>

      {/* Frontscheibe */}
      <mesh position={[0.98, 1.25, 0]} rotation={[0, 0, -0.18]} castShadow>
        <boxGeometry args={[0.05, 0.58, 1.66]} />
        <meshStandardMaterial color="#1a2744" transparent opacity={0.87} metalness={0.05} roughness={0.0} />
      </mesh>

      {/* Heckscheibe */}
      <mesh position={[-0.90, 1.24, 0]} rotation={[0, 0, 0.16]} castShadow>
        <boxGeometry args={[0.05, 0.55, 1.66]} />
        <meshStandardMaterial color="#1a2744" transparent opacity={0.87} metalness={0.05} roughness={0.0} />
      </mesh>

      {/* Räder – größer (SUV) */}
      <Wheel position={[ 1.42, 0.36,  0.97]} r={0.36} />
      <Wheel position={[ 1.42, 0.36, -0.97]} r={0.36} />
      <Wheel position={[-1.42, 0.36,  0.97]} r={0.36} />
      <Wheel position={[-1.42, 0.36, -0.97]} r={0.36} />

      {/* Label */}
      <Html center position={[0, -0.30, 0]}>
        <div style={{
          background: 'rgba(8,8,22,0.92)',
          color: '#fff',
          padding: '4px 14px',
          borderRadius: '20px',
          fontSize: '12px',
          fontWeight: 700,
          whiteSpace: 'nowrap',
          border: '1px solid rgba(34,197,94,0.45)',
          letterSpacing: '0.03em',
          userSelect: 'none',
        }}>
          🚙 VW T-Roc 2025
        </div>
      </Html>
    </group>
  )
}

/* ── Export ── */
export default function CarViewer() {
  return (
    <div style={{
      width: '100%',
      height: '520px',
      borderRadius: '1.25rem',
      overflow: 'hidden',
      background: 'linear-gradient(160deg, #05050e 0%, #0b0b1d 100%)',
      position: 'relative',
    }}>
      <Canvas
        camera={{ position: [0, 4, 11], fov: 42 }}
        shadows
        gl={{ antialias: true }}
      >
        <Suspense fallback={null}>
          {/* Beleuchtung */}
          <ambientLight intensity={0.5} />
          <directionalLight
            position={[8, 12, 6]}
            intensity={1.6}
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
          />
          <directionalLight position={[-6, 7, -5]} intensity={0.55} color="#88aaff" />
          <pointLight position={[0, 8, 0]} intensity={0.5} />

          {/* Umgebungslicht */}
          <Environment preset="city" />

          {/* Fahrzeuge nebeneinander */}
          <group position={[-2.9, 0, 0]}>
            <TeslaModel3 />
          </group>
          <group position={[2.9, 0, 0]}>
            <VWTRoc />
          </group>

          {/* Boden */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <planeGeometry args={[60, 60]} />
            <meshStandardMaterial color="#07070f" roughness={0.82} metalness={0.14} />
          </mesh>

          {/* Bodenschatten */}
          <ContactShadows
            position={[0, 0.004, 0]}
            opacity={0.6}
            scale={20}
            blur={2.8}
            far={5}
          />

          {/* Kamerasteuerung */}
          <OrbitControls
            enableZoom
            enablePan={false}
            minPolarAngle={Math.PI / 10}
            maxPolarAngle={Math.PI / 2.2}
            minDistance={5}
            maxDistance={20}
            autoRotate
            autoRotateSpeed={0.7}
          />
        </Suspense>
      </Canvas>

      {/* Hinweis */}
      <div style={{
        position: 'absolute',
        bottom: '12px',
        right: '16px',
        fontSize: '0.62rem',
        color: 'rgba(255,255,255,0.28)',
        pointerEvents: 'none',
        userSelect: 'none',
      }}>
        🖱 Drehen · Scrollen zum Zoomen
      </div>
    </div>
  )
}
