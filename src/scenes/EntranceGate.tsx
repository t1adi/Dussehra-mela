import React, { useMemo } from 'react';
import * as THREE from 'three';

export const EntranceGate: React.FC = () => {
  // Generate garland beads procedurally
  const garlandPositions = useMemo(() => {
    const list: [number, number, number][] = [];
    for (let x = -8; x <= 8; x += 0.45) {
      const y = 6.8 - Math.sin(((x + 8) / 16) * Math.PI) * 1.5;
      list.push([x, y, 0.65]);
      list.push([x, y - 0.35, -0.65]);
    }
    return list;
  }, []);

  // Main Gate Signboard Texture
  const mainSignTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 192;
    const ctx = canvas.getContext('2d')!;

    // Royal Crimson festival background
    ctx.fillStyle = '#5b1d24';
    ctx.fillRect(0, 0, 1024, 192);

    // Golden Borders
    ctx.strokeStyle = '#f39c12';
    ctx.lineWidth = 10;
    ctx.strokeRect(8, 8, 1008, 176);
    ctx.strokeStyle = '#f1c40f';
    ctx.lineWidth = 4;
    ctx.strokeRect(18, 18, 988, 156);

    // Title
    ctx.fillStyle = '#fdebd0';
    ctx.font = 'bold 64px "Playfair Display", Georgia, serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('मेरा DUSSEHRA MELA', 512, 96, 960);

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, []);

  // Subtitle Gate Signboard Texture
  const subSignTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 128;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = '#42141a';
    ctx.fillRect(0, 0, 1024, 128);

    ctx.strokeStyle = '#f39c12';
    ctx.lineWidth = 6;
    ctx.strokeRect(6, 6, 1012, 116);

    ctx.fillStyle = '#f5b041';
    ctx.font = 'italic bold 44px "Playfair Display", Georgia, serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Mela chaloge mere sath? ♥', 512, 64, 960);

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, []);

  return (
    <group position={[0, 0, 32]}>
      {/* --- Left Pillar (x = -9) --- */}
      <group position={[-9, 0, 0]}>
        <mesh position={[0, 1, 0]}>
          <boxGeometry args={[2.6, 2, 2.6]} />
          <meshStandardMaterial color="#8e2b21" roughness={0.7} />
        </mesh>
        <mesh position={[0, 5.2, 0]}>
          <boxGeometry args={[1.9, 6.4, 1.9]} />
          <meshStandardMaterial color="#c0392b" roughness={0.6} />
        </mesh>
        <mesh position={[0, 8.6, 0]}>
          <boxGeometry args={[2.8, 0.6, 2.8]} />
          <meshStandardMaterial color="#d35400" metalness={0.3} roughness={0.4} />
        </mesh>
        <mesh position={[0, 9.7, 0]}>
          <coneGeometry args={[1.6, 1.8, 8]} />
          <meshStandardMaterial color="#e67e22" roughness={0.5} />
        </mesh>
        <mesh position={[0, 10.8, 0]}>
          <sphereGeometry args={[0.35, 12, 12]} />
          <meshStandardMaterial color="#f1c40f" metalness={0.9} roughness={0.2} />
        </mesh>
        {[2.2, 4.2, 6.2, 8.2].map((y, idx) => (
          <group key={idx} position={[0, y, 1.1]}>
            <mesh>
              <cylinderGeometry args={[0.25, 0.15, 0.15, 8]} />
              <meshStandardMaterial color="#d35400" />
            </mesh>
            <pointLight color="#ffaa33" intensity={18} distance={6} />
          </group>
        ))}
      </group>

      {/* --- Right Pillar (x = +9) --- */}
      <group position={[9, 0, 0]}>
        <mesh position={[0, 1, 0]}>
          <boxGeometry args={[2.6, 2, 2.6]} />
          <meshStandardMaterial color="#8e2b21" roughness={0.7} />
        </mesh>
        <mesh position={[0, 5.2, 0]}>
          <boxGeometry args={[1.9, 6.4, 1.9]} />
          <meshStandardMaterial color="#c0392b" roughness={0.6} />
        </mesh>
        <mesh position={[0, 8.6, 0]}>
          <boxGeometry args={[2.8, 0.6, 2.8]} />
          <meshStandardMaterial color="#d35400" metalness={0.3} roughness={0.4} />
        </mesh>
        <mesh position={[0, 9.7, 0]}>
          <coneGeometry args={[1.6, 1.8, 8]} />
          <meshStandardMaterial color="#e67e22" roughness={0.5} />
        </mesh>
        <mesh position={[0, 10.8, 0]}>
          <sphereGeometry args={[0.35, 12, 12]} />
          <meshStandardMaterial color="#f1c40f" metalness={0.9} roughness={0.2} />
        </mesh>
        {[2.2, 4.2, 6.2, 8.2].map((y, idx) => (
          <group key={idx} position={[0, y, 1.1]}>
            <mesh>
              <cylinderGeometry args={[0.25, 0.15, 0.15, 8]} />
              <meshStandardMaterial color="#ffaa33" />
            </mesh>
            <pointLight color="#ffaa33" intensity={18} distance={6} />
          </group>
        ))}
      </group>

      {/* --- Arch Beam connecting the two pillars --- */}
      <mesh position={[0, 8.4, 0]}>
        <boxGeometry args={[16.5, 2.4, 1.3]} />
        <meshStandardMaterial color="#5b1d24" roughness={0.6} />
      </mesh>
      <mesh position={[0, 9.7, 0]}>
        <boxGeometry args={[17.2, 0.4, 1.5]} />
        <meshStandardMaterial color="#f1c40f" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* --- Double Sided Crisp Canvas Signboards --- */}
      {/* Front */}
      <mesh position={[0, 8.7, 0.68]}>
        <planeGeometry args={[14.2, 1.7]} />
        <meshBasicMaterial map={mainSignTexture} />
      </mesh>
      <mesh position={[0, 7.3, 0.68]}>
        <planeGeometry args={[11.5, 0.95]} />
        <meshBasicMaterial map={subSignTexture} />
      </mesh>

      {/* Back */}
      <mesh position={[0, 8.7, -0.68]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[14.2, 1.7]} />
        <meshBasicMaterial map={mainSignTexture} />
      </mesh>
      <mesh position={[0, 7.3, -0.68]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[11.5, 0.95]} />
        <meshBasicMaterial map={subSignTexture} />
      </mesh>

      {/* Hanging Marigold Garlands (Genda Phool) */}
      {garlandPositions.map((pos, idx) => (
        <mesh key={idx} position={pos}>
          <sphereGeometry args={[0.15, 8, 8]} />
          <meshStandardMaterial
            color={idx % 2 === 0 ? '#f39c12' : '#e67e22'}
            roughness={0.9}
          />
        </mesh>
      ))}

      {/* Golden Fairy Light bulbs along Arch Top */}
      {Array.from({ length: 26 }).map((_, idx) => {
        const x = -8.0 + idx * 0.64;
        return (
          <group key={idx} position={[x, 9.95, 0]}>
            <mesh>
              <sphereGeometry args={[0.08, 8, 8]} />
              <meshBasicMaterial color="#ffea75" />
            </mesh>
            {idx % 4 === 0 && (
              <pointLight color="#ffda79" intensity={22} distance={7} />
            )}
          </group>
        );
      })}

      {/* Hanging Paper Kandils (Lanterns) from Gate */}
      {[-5.2, -2.2, 2.2, 5.2].map((x, idx) => (
        <group key={idx} position={[x, 6.2, 0]}>
          <mesh position={[0, 0.4, 0]}>
            <cylinderGeometry args={[0.02, 0.02, 0.8, 6]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
          <mesh rotation={[0.4, 0.4, 0]}>
            <octahedronGeometry args={[0.45]} />
            <meshStandardMaterial
              color={['#e74c3c', '#9b59b6', '#1abc9c', '#f39c12'][idx]}
              roughness={0.4}
              emissive={['#e74c3c', '#9b59b6', '#1abc9c', '#f39c12'][idx]}
              emissiveIntensity={0.65}
            />
          </mesh>
          <pointLight
            color={['#e74c3c', '#9b59b6', '#1abc9c', '#f39c12'][idx]}
            intensity={28}
            distance={8}
          />
        </group>
      ))}

      {/* Gate Central Gateway Ambient Light */}
      <pointLight position={[0, 5.5, 0]} color="#ffaa33" intensity={40} distance={15} />
    </group>
  );
};
