import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export const FerrisWheel: React.FC = () => {
  const wheelGroupRef = useRef<THREE.Group>(null);
  const gondolasRef = useRef<THREE.Group[]>([]);
  const rotationAngle = useRef(0);

  const radius = 10;
  const numGondolas = 12;

  useFrame((_, delta) => {
    // Rotate wheel around X axis (or Z depending on orientation)
    // We align wheel along Z axis: wheel lies in the Y-Z plane or X-Y plane.
    // Facing the main walkway, wheel lies in X-Y plane at z = -28.
    rotationAngle.current += delta * 0.28;

    if (wheelGroupRef.current) {
      wheelGroupRef.current.rotation.z = rotationAngle.current;
    }

    // Keep all gondolas hanging upright (gravity keeps them level)
    gondolasRef.current.forEach((gondola) => {
      if (gondola) {
        gondola.rotation.z = -rotationAngle.current;
      }
    });
  });

  const gondolaColors = [
    '#e74c3c', '#f39c12', '#f1c40f', '#2ecc71',
    '#1abc9c', '#3498db', '#9b59b6', '#e84393',
    '#e67e22', '#16a085', '#2980b9', '#8e44ad'
  ];

  return (
    <group position={[14, 0, -28]}>
      {/* --- A-Frame Support Legs --- */}
      {/* Front A-frame */}
      <mesh position={[-3.2, 7, 1.2]} rotation={[0, 0, -0.22]}>
        <cylinderGeometry args={[0.2, 0.35, 15, 8]} />
        <meshStandardMaterial color="#34495e" metalness={0.6} roughness={0.4} />
      </mesh>
      <mesh position={[3.2, 7, 1.2]} rotation={[0, 0, 0.22]}>
        <cylinderGeometry args={[0.2, 0.35, 15, 8]} />
        <meshStandardMaterial color="#34495e" metalness={0.6} roughness={0.4} />
      </mesh>

      {/* Back A-frame */}
      <mesh position={[-3.2, 7, -1.2]} rotation={[0, 0, -0.22]}>
        <cylinderGeometry args={[0.2, 0.35, 15, 8]} />
        <meshStandardMaterial color="#34495e" metalness={0.6} roughness={0.4} />
      </mesh>
      <mesh position={[3.2, 7, -1.2]} rotation={[0, 0, 0.22]}>
        <cylinderGeometry args={[0.2, 0.35, 15, 8]} />
        <meshStandardMaterial color="#34495e" metalness={0.6} roughness={0.4} />
      </mesh>

      {/* Cross braces */}
      <mesh position={[0, 6, 1.2]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.15, 0.15, 4.5, 8]} />
        <meshStandardMaterial color="#2c3e50" />
      </mesh>
      <mesh position={[0, 6, -1.2]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.15, 0.15, 4.5, 8]} />
        <meshStandardMaterial color="#2c3e50" />
      </mesh>

      {/* Center Axle at y = 14 */}
      <mesh position={[0, 14, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.45, 0.45, 3.2, 16]} />
        <meshStandardMaterial color="#f39c12" metalness={0.8} roughness={0.3} />
      </mesh>

      {/* Decorative Hub Center Lamp */}
      <mesh position={[0, 14, 1.6]}>
        <sphereGeometry args={[0.8, 16, 16]} />
        <meshStandardMaterial color="#f1c40f" emissive="#f39c12" emissiveIntensity={0.8} />
      </mesh>
      <pointLight position={[0, 14, 2]} color="#ffaa33" intensity={60} distance={20} />

      {/* --- Rotating Wheel Assembly --- */}
      <group position={[0, 14, 0]} ref={wheelGroupRef}>
        {/* Front & Back Outer Rims */}
        {[-0.8, 0.8].map((zOffset, zIdx) => (
          <group key={zIdx} position={[0, 0, zOffset]}>
            {/* Outer Rim */}
            <mesh>
              <torusGeometry args={[radius, 0.14, 8, 36]} />
              <meshStandardMaterial color="#f39c12" metalness={0.5} roughness={0.3} />
            </mesh>
            {/* Inner Stabilizing Rim */}
            <mesh>
              <torusGeometry args={[radius * 0.55, 0.1, 8, 24]} />
              <meshStandardMaterial color="#e67e22" metalness={0.4} roughness={0.4} />
            </mesh>

            {/* Spokes */}
            {Array.from({ length: numGondolas }).map((_, idx) => {
              const angle = (idx / numGondolas) * Math.PI * 2;
              return (
                <group key={idx} rotation={[0, 0, angle]}>
                  <mesh position={[0, radius / 2, 0]}>
                    <cylinderGeometry args={[0.07, 0.07, radius, 6]} />
                    <meshStandardMaterial color="#bdc3c7" metalness={0.7} />
                  </mesh>
                  {/* Neon light bulb on spoke */}
                  <mesh position={[0, radius * 0.75, 0]}>
                    <sphereGeometry args={[0.15, 8, 8]} />
                    <meshBasicMaterial color={gondolaColors[idx % gondolaColors.length]} />
                  </mesh>
                </group>
              );
            })}
          </group>
        ))}

        {/* Gondolas / Passenger Cabins */}
        {Array.from({ length: numGondolas }).map((_, idx) => {
          const angle = (idx / numGondolas) * Math.PI * 2;
          const x = Math.sin(angle) * radius;
          const y = Math.cos(angle) * radius;
          const color = gondolaColors[idx];

          return (
            <group
              key={idx}
              position={[x, y, 0]}
              ref={(el) => {
                if (el) gondolasRef.current[idx] = el;
              }}
            >
              {/* Gondola Hanger Pivot Bar */}
              <mesh rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.08, 0.08, 1.8, 8]} />
                <meshStandardMaterial color="#7f8c8d" />
              </mesh>

              {/* Passenger Tub / Cabin Body */}
              <mesh position={[0, -1.1, 0]}>
                <boxGeometry args={[1.6, 1.1, 1.2]} />
                <meshStandardMaterial color={color} roughness={0.4} />
              </mesh>

              {/* Gondola Canopy Roof */}
              <mesh position={[0, -0.4, 0]} rotation={[0, Math.PI / 4, 0]}>
                <coneGeometry args={[1.1, 0.5, 4]} />
                <meshStandardMaterial color="#f1c40f" roughness={0.3} />
              </mesh>

              {/* Passenger Cabin Light */}
              <pointLight position={[0, -0.8, 0]} color={color} intensity={12} distance={4} />
            </group>
          );
        })}
      </group>

      {/* Boarding Platform & Steps */}
      <mesh position={[0, 0.6, 1.8]}>
        <boxGeometry args={[5, 1.2, 3]} />
        <meshStandardMaterial color="#7f8c8d" roughness={0.8} />
      </mesh>
      {/* Platform Safety Railing */}
      <mesh position={[0, 1.5, 3.2]}>
        <boxGeometry args={[4.8, 0.6, 0.1]} />
        <meshStandardMaterial color="#f39c12" />
      </mesh>
      {/* Boarding Sign */}
      <mesh position={[0, 2.4, 3.2]}>
        <boxGeometry args={[2.4, 0.6, 0.1]} />
        <meshStandardMaterial color="#2980b9" />
      </mesh>
    </group>
  );
};
