import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../store/useGameStore';

export const RavanaEffigy: React.FC = () => {
  const { finalePhase } = useGameStore();

  const effigyGroupRef = useRef<THREE.Group>(null);
  const arrowRef = useRef<THREE.Group>(null);
  const fireParticlesRef = useRef<THREE.Points>(null);
  const fireworksRef = useRef<THREE.Points>(null);

  const arrowProgress = useRef(0);
  const burnProgress = useRef(0);

  // Generate particle systems for burning & fireworks
  const { firePositions, fireColors } = useMemo(() => {
    const count = 180;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      // Cylindrical distribution around effigy
      const theta = Math.random() * Math.PI * 2;
      const radius = 1.2 + Math.random() * 2.8;
      positions[i * 3] = Math.cos(theta) * radius;
      positions[i * 3 + 1] = 2 + Math.random() * 11;
      positions[i * 3 + 2] = Math.sin(theta) * radius;

      // Orange, red, gold fire colors
      const r = 1.0;
      const g = 0.3 + Math.random() * 0.6;
      const b = 0.05;
      colors[i * 3] = r;
      colors[i * 3 + 1] = g;
      colors[i * 3 + 2] = b;
    }
    return { firePositions: positions, fireColors: colors };
  }, []);

  // Fireworks particles
  const { fireworksPositions, fireworksColors } = useMemo(() => {
    const count = 350;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    const palette = [
      [1.0, 0.8, 0.2], // Gold
      [1.0, 0.2, 0.4], // Crimson
      [0.2, 0.9, 0.5], // Emerald
      [0.3, 0.6, 1.0], // Azure
      [0.9, 0.3, 1.0]  // Violet
    ];

    for (let i = 0; i < count; i++) {
      const pColor = palette[Math.floor(Math.random() * palette.length)];
      // Sphere burst in sky
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = Math.cbrt(Math.random()) * 16;
      const sinPhi = Math.sin(phi);

      positions[i * 3] = r * sinPhi * Math.cos(theta);
      positions[i * 3 + 1] = 20 + r * sinPhi * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);

      colors[i * 3] = pColor[0];
      colors[i * 3 + 1] = pColor[1];
      colors[i * 3 + 2] = pColor[2];
    }
    return { fireworksPositions: positions, fireworksColors: colors };
  }, []);

  useFrame((_, delta) => {
    // 1. Fiery Arrow Animation
    if (finalePhase === 'arrow') {
      arrowProgress.current = Math.min(1, arrowProgress.current + delta * 0.45);
      if (arrowRef.current) {
        // Start from Rama's position [0, 4, -25] to Ravana's navel [0, 6, -52]
        const startPos = new THREE.Vector3(0, 4, -25);
        const endPos = new THREE.Vector3(0, 6.2, -52);
        arrowRef.current.position.lerpVectors(startPos, endPos, arrowProgress.current);
        arrowRef.current.visible = true;
      }
    } else {
      if (arrowRef.current) arrowRef.current.visible = false;
    }

    // 2. Burning Effigy Vibration & Fire Embers
    if (finalePhase === 'burn' || finalePhase === 'celebrate') {
      burnProgress.current += delta;
      if (effigyGroupRef.current) {
        // Shaking & trembling as crackers burst
        effigyGroupRef.current.rotation.y = (Math.random() - 0.5) * 0.05;
        effigyGroupRef.current.position.x = (Math.random() - 0.5) * 0.1;
      }

      // Animate fire particles rising
      if (fireParticlesRef.current) {
        const positions = fireParticlesRef.current.geometry.attributes.position.array as Float32Array;
        for (let i = 0; i < positions.length / 3; i++) {
          positions[i * 3 + 1] += delta * 6;
          if (positions[i * 3 + 1] > 16) {
            positions[i * 3 + 1] = 2 + Math.random() * 2;
          }
        }
        fireParticlesRef.current.geometry.attributes.position.needsUpdate = true;
      }

      // Animate fireworks pulsing
      if (fireworksRef.current && finalePhase === 'celebrate') {
        fireworksRef.current.rotation.y += delta * 0.5;
      }
    } else {
      if (effigyGroupRef.current) {
        effigyGroupRef.current.rotation.y = 0;
        effigyGroupRef.current.position.x = 0;
      }
    }
  });

  const effigyColor = finalePhase === 'burn' || finalePhase === 'celebrate' ? '#3d1c02' : '#8e44ad';
  const robeColor = finalePhase === 'burn' || finalePhase === 'celebrate' ? '#4a1e04' : '#c0392b';

  return (
    <group position={[0, 0, -52]}>
      {/* Sacred Finale Stone Platform */}
      <mesh position={[0, 0.4, 0]}>
        <cylinderGeometry args={[7.5, 8.2, 0.8, 24]} />
        <meshStandardMaterial color="#2c3e50" roughness={0.9} />
      </mesh>
      {/* Golden Floral Rangoli ring on platform */}
      <mesh position={[0, 0.82, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[6.2, 7.2, 32]} />
        <meshStandardMaterial color="#f39c12" roughness={0.5} />
      </mesh>

      {/* Burning Fire Particle Points */}
      {(finalePhase === 'burn' || finalePhase === 'celebrate') && (
        <points ref={fireParticlesRef}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={firePositions.length / 3}
              array={firePositions}
              itemSize={3}
            />
            <bufferAttribute
              attach="attributes-color"
              count={fireColors.length / 3}
              array={fireColors}
              itemSize={3}
            />
          </bufferGeometry>
          <pointsMaterial size={0.45} vertexColors transparent opacity={0.9} />
        </points>
      )}

      {/* Sky Fireworks Points */}
      {finalePhase === 'celebrate' && (
        <points ref={fireworksRef}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={fireworksPositions.length / 3}
              array={fireworksPositions}
              itemSize={3}
            />
            <bufferAttribute
              attach="attributes-color"
              count={fireworksColors.length / 3}
              array={fireworksColors}
              itemSize={3}
            />
          </bufferGeometry>
          <pointsMaterial size={0.65} vertexColors transparent opacity={0.95} />
        </points>
      )}

      {/* Blazing Effigy Fire Light */}
      {(finalePhase === 'burn' || finalePhase === 'celebrate') && (
        <>
          <pointLight position={[0, 6, 0]} color="#ff7700" intensity={180} distance={35} />
          <pointLight position={[0, 14, 0]} color="#ffdd44" intensity={120} distance={40} />
        </>
      )}

      {/* --- Ravana Effigy (Dashanana) --- */}
      <group ref={effigyGroupRef}>
        {/* Legs / Pedestal columns */}
        <mesh position={[-1.2, 2.4, 0]}>
          <cylinderGeometry args={[0.55, 0.65, 3.4, 12]} />
          <meshStandardMaterial color={robeColor} />
        </mesh>
        <mesh position={[1.2, 2.4, 0]}>
          <cylinderGeometry args={[0.55, 0.65, 3.4, 12]} />
          <meshStandardMaterial color={robeColor} />
        </mesh>

        {/* Lower Royal Robe Skirt */}
        <mesh position={[0, 4.4, 0]} rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[2.5, 3.2, 12]} />
          <meshStandardMaterial color={robeColor} roughness={0.6} />
        </mesh>
        {/* Golden Embroidered Border */}
        <mesh position={[0, 3.1, 0]}>
          <cylinderGeometry args={[2.4, 2.4, 0.35, 16]} />
          <meshStandardMaterial color="#f1c40f" metalness={0.8} roughness={0.2} />
        </mesh>

        {/* Torso & Golden Armor Plate */}
        <mesh position={[0, 6.8, 0]}>
          <boxGeometry args={[3.2, 3.6, 1.8]} />
          <meshStandardMaterial color={effigyColor} roughness={0.5} />
        </mesh>
        {/* Golden Chest Plate / Kavacha */}
        <mesh position={[0, 7.0, 0.95]}>
          <boxGeometry args={[2.4, 2.4, 0.2]} />
          <meshStandardMaterial color="#f39c12" metalness={0.8} roughness={0.3} />
        </mesh>
        {/* Navel Target (Amrit Kund) */}
        <mesh position={[0, 5.6, 0.98]}>
          <sphereGeometry args={[0.3, 12, 12]} />
          <meshStandardMaterial color="#e74c3c" emissive="#ff3333" emissiveIntensity={0.6} />
        </mesh>

        {/* Mighty Sword (Chandrahas) in Right Hand */}
        <group position={[2.6, 6.8, 0.8]} rotation={[0.4, 0, -0.4]}>
          <mesh position={[0, 2.2, 0]}>
            <boxGeometry args={[0.22, 4.5, 0.08]} />
            <meshStandardMaterial color="#bdc3c7" metalness={0.9} roughness={0.2} />
          </mesh>
          {/* Golden Sword Hilt */}
          <mesh position={[0, 0, 0]}>
            <cylinderGeometry args={[0.15, 0.15, 0.8, 8]} />
            <meshStandardMaterial color="#f1c40f" metalness={0.8} />
          </mesh>
        </group>

        {/* Golden Sun Shield in Left Hand */}
        <group position={[-2.4, 6.8, 1.0]} rotation={[0, 0.4, 0]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[1.5, 1.5, 0.15, 16]} />
            <meshStandardMaterial color="#f39c12" metalness={0.8} roughness={0.2} />
          </mesh>
          <mesh position={[0, 0, 0.1]}>
            <sphereGeometry args={[0.45, 12, 12]} />
            <meshStandardMaterial color="#c0392b" />
          </mesh>
        </group>

        {/* --- The Ten Heads (Dashanana) --- */}
        {/* Main Central Fierce Head (Head #5) */}
        <group position={[0, 9.6, 0]}>
          <mesh>
            <boxGeometry args={[1.2, 1.3, 1.1]} />
            <meshStandardMaterial color="#16a085" roughness={0.6} />
          </mesh>
          {/* Fierce Grand Mustache */}
          <mesh position={[0, -0.22, 0.62]} rotation={[0, 0, 0]}>
            <boxGeometry args={[1.4, 0.22, 0.15]} />
            <meshStandardMaterial color="#111111" />
          </mesh>
          {/* Glowing Red Demon Eyes */}
          <mesh position={[-0.28, 0.15, 0.58]}>
            <sphereGeometry args={[0.1, 8, 8]} />
            <meshBasicMaterial color="#ff2222" />
          </mesh>
          <mesh position={[0.28, 0.15, 0.58]}>
            <sphereGeometry args={[0.1, 8, 8]} />
            <meshBasicMaterial color="#ff2222" />
          </mesh>
          {/* Giant Royal Golden Crown (Mukut) */}
          <mesh position={[0, 1.3, 0]}>
            <coneGeometry args={[1.1, 1.6, 8]} />
            <meshStandardMaterial color="#f1c40f" metalness={0.9} roughness={0.2} />
          </mesh>
        </group>

        {/* Side Heads (4 on Left, 5 on Right) */}
        {[-4, -3, -2, -1, 1, 2, 3, 4, 5].map((offset, idx) => {
          const x = offset * 0.95;
          const y = 9.4 - Math.abs(offset) * 0.18;
          return (
            <group key={idx} position={[x, y, -0.15 * Math.abs(offset)]}>
              <mesh>
                <boxGeometry args={[0.75, 0.85, 0.7]} />
                <meshStandardMaterial color={idx % 2 === 0 ? '#1abc9c' : '#27ae60'} />
              </mesh>
              {/* Mustache */}
              <mesh position={[0, -0.15, 0.38]}>
                <boxGeometry args={[0.8, 0.12, 0.08]} />
                <meshStandardMaterial color="#111111" />
              </mesh>
              {/* Crown */}
              <mesh position={[0, 0.8, 0]}>
                <coneGeometry args={[0.6, 0.9, 6]} />
                <meshStandardMaterial color="#f39c12" metalness={0.8} />
              </mesh>
            </group>
          );
        })}
      </group>

      {/* --- Lord Rama's Blazing Fiery Arrow (Agni Baan) --- */}
      <group ref={arrowRef} visible={false}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.08, 0.08, 3.5, 8]} />
          <meshStandardMaterial color="#f1c40f" metalness={0.8} />
        </mesh>
        {/* Blazing Arrowhead */}
        <mesh position={[0, 0, -1.8]} rotation={[-Math.PI / 2, 0, 0]}>
          <coneGeometry args={[0.3, 0.8, 8]} />
          <meshBasicMaterial color="#ff4400" />
        </mesh>
        <pointLight color="#ff8800" intensity={80} distance={15} />
      </group>
    </group>
  );
};
