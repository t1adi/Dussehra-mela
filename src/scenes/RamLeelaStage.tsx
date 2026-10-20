import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

export const RamLeelaStage: React.FC = () => {
  const ramaArmRef = useRef<THREE.Mesh>(null);
  const hanumanRef = useRef<THREE.Group>(null);
  const spotlightRef = useRef<THREE.SpotLight>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    // Subtle animated breathing & gesture of actors
    if (ramaArmRef.current) {
      ramaArmRef.current.rotation.x = -0.3 + Math.sin(t * 1.5) * 0.12;
    }
    if (hanumanRef.current) {
      hanumanRef.current.position.y = 1.0 + Math.sin(t * 2) * 0.03;
    }
  });

  return (
    <group position={[-14, 0, -32]} rotation={[0, Math.PI / 4, 0]}>
      {/* --- Stage Platform --- */}
      <mesh position={[0, 0.7, 0]}>
        <boxGeometry args={[10, 1.4, 7]} />
        <meshStandardMaterial color="#8e44ad" roughness={0.7} />
      </mesh>
      {/* Red Carpet Top */}
      <mesh position={[0, 1.42, 0]}>
        <boxGeometry args={[9.4, 0.04, 6.4]} />
        <meshStandardMaterial color="#c0392b" roughness={0.6} />
      </mesh>

      {/* --- Golden Stage Pillars --- */}
      {[-4.5, 4.5].map((x, idx) => (
        <group key={idx} position={[x, 1.4, 2.8]}>
          <mesh position={[0, 2.5, 0]}>
            <cylinderGeometry args={[0.25, 0.35, 5, 12]} />
            <meshStandardMaterial color="#f1c40f" metalness={0.8} roughness={0.2} />
          </mesh>
          <mesh position={[0, 5.2, 0]}>
            <sphereGeometry args={[0.4, 12, 12]} />
            <meshStandardMaterial color="#e67e22" metalness={0.7} />
          </mesh>
        </group>
      ))}

      {/* --- Stage Arch & Valance --- */}
      <mesh position={[0, 6.2, 2.8]}>
        <boxGeometry args={[10.2, 1.0, 0.4]} />
        <meshStandardMaterial color="#9b59b6" roughness={0.5} />
      </mesh>
      {/* Scalloped Velvet Curtain Droop */}
      <mesh position={[0, 5.4, 2.7]}>
        <boxGeometry args={[9.6, 0.7, 0.2]} />
        <meshStandardMaterial color="#c0392b" roughness={0.6} />
      </mesh>

      {/* Stage Title Sign */}
      <group position={[0, 6.25, 3.05]}>
        <Text
          fontSize={0.48}
          color="#fdebd0"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.03}
          outlineColor="#4a154b"
        >
          रामलीला रंगमंच · RAM LEELA
        </Text>
      </group>

      {/* --- Backdrop (Lanka/Ayodhya thematic mural) --- */}
      <mesh position={[0, 4, -3.2]}>
        <boxGeometry args={[9.4, 5.2, 0.2]} />
        <meshStandardMaterial color="#1f3a52" roughness={0.8} />
      </mesh>
      {/* Golden Temple Silhouettes painted on backdrop */}
      <mesh position={[0, 4.2, -3.05]}>
        <coneGeometry args={[2.2, 3.2, 6]} />
        <meshStandardMaterial color="#f39c12" metalness={0.4} />
      </mesh>

      {/* Stage Spotlights */}
      <spotLight
        ref={spotlightRef}
        position={[0, 8, 4]}
        target-position={[0, 2, 0]}
        color="#fffae6"
        intensity={80}
        angle={0.65}
        penumbra={0.6}
        distance={22}
      />
      {/* Golden footlights */}
      {[-3, -1.5, 0, 1.5, 3].map((x, idx) => (
        <group key={idx} position={[x, 1.55, 3.1]}>
          <mesh>
            <sphereGeometry args={[0.1, 8, 8]} />
            <meshBasicMaterial color="#ffc107" />
          </mesh>
          <pointLight color="#ffc107" intensity={15} distance={4} />
        </group>
      ))}

      {/* --- Stylized Stage Performers --- */}

      {/* 1. Lord Rama (Center) */}
      <group position={[-0.8, 1.4, 0]}>
        {/* Body (Sky Blue complexion / Pitambari Yellow Dhoti) */}
        <mesh position={[0, 1.1, 0]}>
          <cylinderGeometry args={[0.22, 0.25, 0.75, 12]} />
          <meshStandardMaterial color="#74b9ff" roughness={0.6} />
        </mesh>
        {/* Yellow Pitambari cloth */}
        <mesh position={[0, 0.45, 0]}>
          <cylinderGeometry args={[0.24, 0.28, 0.7, 12]} />
          <meshStandardMaterial color="#f1c40f" roughness={0.7} />
        </mesh>
        {/* Head */}
        <mesh position={[0, 1.65, 0]}>
          <sphereGeometry args={[0.2, 14, 14]} />
          <meshStandardMaterial color="#74b9ff" roughness={0.6} />
        </mesh>
        {/* Golden Mukut (Crown) */}
        <mesh position={[0, 1.95, 0]}>
          <coneGeometry args={[0.22, 0.45, 8]} />
          <meshStandardMaterial color="#f1c40f" metalness={0.9} roughness={0.2} />
        </mesh>
        {/* Kodanda Bow */}
        <mesh position={[0.4, 1.3, 0.15]} rotation={[0, 0, 0.1]}>
          <torusGeometry args={[0.6, 0.035, 6, 16, Math.PI]} />
          <meshStandardMaterial color="#d35400" metalness={0.4} />
        </mesh>
        {/* Right arm blessing gesture */}
        <mesh ref={ramaArmRef} position={[-0.32, 1.3, 0.15]}>
          <cylinderGeometry args={[0.06, 0.06, 0.5, 8]} />
          <meshStandardMaterial color="#74b9ff" />
        </mesh>
      </group>

      {/* 2. Lakshmana (Right of Rama) */}
      <group position={[1.2, 1.4, -0.4]}>
        <mesh position={[0, 1.05, 0]}>
          <cylinderGeometry args={[0.2, 0.24, 0.7, 12]} />
          <meshStandardMaterial color="#e0ac69" roughness={0.6} />
        </mesh>
        <mesh position={[0, 0.42, 0]}>
          <cylinderGeometry args={[0.22, 0.26, 0.65, 12]} />
          <meshStandardMaterial color="#e67e22" roughness={0.7} />
        </mesh>
        <mesh position={[0, 1.55, 0]}>
          <sphereGeometry args={[0.18, 12, 12]} />
          <meshStandardMaterial color="#e0ac69" />
        </mesh>
        <mesh position={[0, 1.82, 0]}>
          <coneGeometry args={[0.18, 0.35, 8]} />
          <meshStandardMaterial color="#f1c40f" metalness={0.9} roughness={0.2} />
        </mesh>
        {/* Quiver of Arrows on back */}
        <mesh position={[-0.15, 1.1, -0.22]} rotation={[0.2, 0, 0.3]}>
          <cylinderGeometry args={[0.1, 0.08, 0.75, 8]} />
          <meshStandardMaterial color="#7f8c8d" />
        </mesh>
      </group>

      {/* 3. Hanumanji (Kneeling with Gada) */}
      <group ref={hanumanRef} position={[-2.4, 1.0, 0.6]}>
        {/* Kneeling Body */}
        <mesh position={[0, 0.55, 0]}>
          <cylinderGeometry args={[0.24, 0.26, 0.6, 12]} />
          <meshStandardMaterial color="#e67e22" roughness={0.7} />
        </mesh>
        {/* Head */}
        <mesh position={[0, 1.0, 0]}>
          <sphereGeometry args={[0.19, 12, 12]} />
          <meshStandardMaterial color="#d35400" roughness={0.6} />
        </mesh>
        {/* Golden Crown */}
        <mesh position={[0, 1.25, 0]}>
          <coneGeometry args={[0.18, 0.32, 8]} />
          <meshStandardMaterial color="#f1c40f" metalness={0.8} />
        </mesh>
        {/* Mighty Golden Gada (Mace) standing on floor */}
        <group position={[0.35, 0.45, 0.2]}>
          <mesh position={[0, 0, 0]}>
            <cylinderGeometry args={[0.04, 0.04, 0.9, 8]} />
            <meshStandardMaterial color="#f39c12" metalness={0.8} />
          </mesh>
          <mesh position={[0, 0.45, 0]}>
            <sphereGeometry args={[0.18, 12, 12]} />
            <meshStandardMaterial color="#f1c40f" metalness={0.9} roughness={0.2} />
          </mesh>
        </group>
      </group>
    </group>
  );
};
