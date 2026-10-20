import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface NPCData {
  id: number;
  basePos: [number, number, number];
  color: string;
  turbanColor?: string;
  hasSaree?: boolean;
  type: 'stroll' | 'cheer' | 'chat';
  speed: number;
}

const NPCS: NPCData[] = [
  // Pair near balloon stall
  { id: 1, basePos: [-6, 0, 14], color: '#e74c3c', turbanColor: '#f1c40f', type: 'chat', speed: 1.2 },
  { id: 2, basePos: [-5.2, 0, 14.5], color: '#3498db', hasSaree: true, type: 'chat', speed: 1.0 },

  // Stroller on central path
  { id: 3, basePos: [2, 0, 8], color: '#2ecc71', turbanColor: '#e67e22', type: 'stroll', speed: 1.5 },
  { id: 4, basePos: [-3, 0, -4], color: '#9b59b6', hasSaree: true, type: 'stroll', speed: 1.3 },

  // Group at chaat stall
  { id: 5, basePos: [-6.5, 0, 1], color: '#f39c12', turbanColor: '#c0392b', type: 'cheer', speed: 2.0 },
  { id: 6, basePos: [-5.5, 0, -1], color: '#1abc9c', hasSaree: true, type: 'chat', speed: 1.1 },

  // Audience at Ram Leela stage
  { id: 7, basePos: [-10, 0, -25], color: '#e67e22', turbanColor: '#f1c40f', type: 'cheer', speed: 2.2 },
  { id: 8, basePos: [-8.5, 0, -26], color: '#e84393', hasSaree: true, type: 'cheer', speed: 1.8 },
  { id: 9, basePos: [-11.5, 0, -27], color: '#34495e', turbanColor: '#16a085', type: 'cheer', speed: 2.0 },

  // People admiring the Giant Ferris Wheel
  { id: 10, basePos: [9, 0, -22], color: '#d35400', hasSaree: true, type: 'cheer', speed: 1.7 },
  { id: 11, basePos: [10.5, 0, -23], color: '#2980b9', turbanColor: '#e67e22', type: 'chat', speed: 1.2 },

  // Near Ravana arena
  { id: 12, basePos: [-4, 0, -44], color: '#c0392b', turbanColor: '#f39c12', type: 'cheer', speed: 2.4 },
  { id: 13, basePos: [4, 0, -44], color: '#8e44ad', hasSaree: true, type: 'cheer', speed: 2.1 }
];

export const NPCVisitors: React.FC = () => {
  const groupsRef = useRef<(THREE.Group | null)[]>([]);

  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();

    NPCS.forEach((npc, idx) => {
      const g = groupsRef.current[idx];
      if (!g) return;

      if (npc.type === 'stroll') {
        // Walk back and forth slightly along Z
        const offsetZ = Math.sin(time * npc.speed * 0.8) * 3;
        g.position.z = npc.basePos[2] + offsetZ;
        // Turn around smoothly
        g.rotation.y = offsetZ > 0 ? 0 : Math.PI;
        // Bobbing
        g.position.y = Math.abs(Math.sin(time * npc.speed * 4)) * 0.08;
      } else if (npc.type === 'cheer') {
        // Jumping / cheering waving hands
        g.position.y = Math.abs(Math.sin(time * npc.speed * 2.5)) * 0.12;
        g.rotation.z = Math.sin(time * npc.speed * 3) * 0.05;
      } else {
        // Chatting / shifting weight
        g.rotation.y = (Math.PI / 4) + Math.sin(time * npc.speed * 0.8) * 0.15;
      }
    });
  });

  return (
    <group>
      {NPCS.map((npc, idx) => (
        <group
          key={npc.id}
          ref={(el) => {
            groupsRef.current[idx] = el;
          }}
          position={npc.basePos}
        >
          {/* Shadow */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
            <circleGeometry args={[0.35, 12]} />
            <meshBasicMaterial color="#000000" transparent opacity={0.3} />
          </mesh>

          {/* Head */}
          <mesh position={[0, 1.4, 0]}>
            <sphereGeometry args={[0.18, 12, 12]} />
            <meshStandardMaterial color="#e0ac69" />
          </mesh>

          {/* Turban or Saree Pallu Head Covering */}
          {npc.turbanColor && (
            <mesh position={[0, 1.52, 0]}>
              <cylinderGeometry args={[0.22, 0.2, 0.14, 12]} />
              <meshStandardMaterial color={npc.turbanColor} />
            </mesh>
          )}

          {/* Torso / Kurta / Saree */}
          <mesh position={[0, 0.9, 0]}>
            <cylinderGeometry
              args={[npc.hasSaree ? 0.22 : 0.24, npc.hasSaree ? 0.32 : 0.26, 0.75, 10]}
            />
            <meshStandardMaterial color={npc.color} roughness={0.7} />
          </mesh>

          {/* Legs */}
          <mesh position={[-0.12, 0.38, 0]}>
            <cylinderGeometry args={[0.07, 0.06, 0.65, 6]} />
            <meshStandardMaterial color="#f8f9fa" />
          </mesh>
          <mesh position={[0.12, 0.38, 0]}>
            <cylinderGeometry args={[0.07, 0.06, 0.65, 6]} />
            <meshStandardMaterial color="#f8f9fa" />
          </mesh>
        </group>
      ))}
    </group>
  );
};
