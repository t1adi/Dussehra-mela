import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { StallInfo } from '../types';
import { useGameStore } from '../store/useGameStore';

interface StallMeshProps {
  stall: StallInfo;
}

// Global cached texture for atlas
let cachedAtlas: THREE.Texture | null = null;

function getAtlasTexture() {
  if (!cachedAtlas && typeof window !== 'undefined') {
    cachedAtlas = new THREE.TextureLoader().load('/assets/mela-stall-atlas.webp');
    cachedAtlas.colorSpace = THREE.SRGBColorSpace;
  }
  return cachedAtlas;
}

export const StallMesh: React.FC<StallMeshProps> = ({ stall }) => {
  const { nearbyStall, settings } = useGameStore();
  const isNearby = nearbyStall?.id === stall.id;

  const pinwheelRef = useRef<THREE.Group>(null);
  const vendorArmRef = useRef<THREE.Mesh>(null);
  const indicatorRef = useRef<THREE.Group>(null);

  // Determine atlas quadrant index
  // 0: Chaat / Snacks, 1: Jalebi / Sweets, 2: Toys / Games, 3: Momos / Fast Food
  const atlasIndex = useMemo(() => {
    if (stall.id === 'food-stall') return 0;
    if (stall.id === 'toy-stall') return 2;
    if (stall.id === 'balloon-pop' || stall.id === 'ring-toss') return 2;
    if (stall.id === 'souvenir-stall') return 1;
    return 3;
  }, [stall.id]);

  // Create textured materials for backdrop and counter
  const { backMat, counterMat } = useMemo(() => {
    const atlas = getAtlasTexture();
    if (!atlas) {
      const fallback = new THREE.MeshStandardMaterial({ color: stall.color, roughness: 0.8 });
      return { backMat: fallback, counterMat: fallback };
    }

    const col = atlasIndex % 2;
    const row = atlasIndex < 2 ? 1 : 0;

    // Backdrop texture slice
    const backTex = atlas.clone();
    backTex.colorSpace = THREE.SRGBColorSpace;
    backTex.wrapS = backTex.wrapT = THREE.ClampToEdgeWrapping;
    backTex.repeat.set(0.495, 0.345);
    backTex.offset.set(col * 0.5 + 0.002, (row === 1 ? 0.5 : 0) + 0.152);

    // Front counter texture slice
    const counterTex = atlas.clone();
    counterTex.colorSpace = THREE.SRGBColorSpace;
    counterTex.wrapS = counterTex.wrapT = THREE.ClampToEdgeWrapping;
    counterTex.repeat.set(0.495, 0.145);
    counterTex.offset.set(col * 0.5 + 0.002, (row === 1 ? 0.5 : 0) + 0.002);

    const bMat = new THREE.MeshStandardMaterial({
      map: backTex,
      emissiveMap: backTex,
      emissive: new THREE.Color(0xfff1d0),
      emissiveIntensity: 0.52,
      roughness: 0.8,
      side: THREE.DoubleSide
    });

    const cMat = new THREE.MeshStandardMaterial({
      map: counterTex,
      emissiveMap: counterTex,
      emissive: new THREE.Color(0xfff1d0),
      emissiveIntensity: 0.52,
      roughness: 0.8,
      side: THREE.DoubleSide
    });

    return { backMat: bMat, counterMat: cMat };
  }, [atlasIndex, stall.color]);

  // Generate 2D Canvas Signboard Texture
  const signTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 128;
    const ctx = canvas.getContext('2d')!;

    // Rich Indian festival banner background
    ctx.fillStyle = '#5b1d24';
    ctx.fillRect(0, 0, 512, 128);

    // Ornate Golden Border
    ctx.strokeStyle = '#f39c12';
    ctx.lineWidth = 6;
    ctx.strokeRect(6, 6, 500, 116);
    ctx.strokeStyle = '#f1c40f';
    ctx.lineWidth = 2;
    ctx.strokeRect(12, 12, 488, 104);

    // Text
    ctx.fillStyle = '#fdebd0';
    ctx.font = 'bold 36px "Playfair Display", Georgia, serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const displayName = settings.language === 'hi' ? stall.hindiName : stall.name;
    ctx.fillText(displayName, 256, 64, 480);

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, [stall.name, stall.hindiName, settings.language]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (pinwheelRef.current) {
      pinwheelRef.current.rotation.z = t * 4.5;
    }
    if (vendorArmRef.current) {
      vendorArmRef.current.rotation.x = Math.sin(t * 2.5) * 0.25;
    }
    if (indicatorRef.current) {
      indicatorRef.current.position.y = 4.4 + Math.sin(t * 3.5) * 0.15;
    }
  });

  return (
    <group position={stall.position} rotation={[0, stall.rotationY || 0, 0]}>
      {/* --- Solid Wooden Structure Base --- */}
      <mesh position={[0, 0.45, 0]}>
        <boxGeometry args={[5.0, 0.9, 3.0]} />
        <meshStandardMaterial color="#573b30" roughness={0.9} />
      </mesh>

      {/* --- Front Counter Top Shelf --- */}
      <mesh position={[0, 1.05, 1.25]}>
        <boxGeometry args={[5.2, 0.1, 0.8]} />
        <meshStandardMaterial color="#8c5035" roughness={0.6} />
      </mesh>

      {/* --- Textured Front Counter Facade --- */}
      <mesh position={[0, 0.52, 1.51]}>
        <planeGeometry args={[4.96, 1.05]} />
        <primitive object={counterMat} attach="material" />
      </mesh>

      {/* --- Textured Backdrop Wall --- */}
      <mesh position={[0, 2.35, -1.21]}>
        <planeGeometry args={[4.95, 2.7]} />
        <primitive object={backMat} attach="material" />
      </mesh>

      {/* --- 4 Corner Bamboo Support Posts --- */}
      {[
        [-2.38, -1.3],
        [2.38, -1.3],
        [-2.38, 1.3],
        [2.38, 1.3]
      ].map(([px, pz], idx) => (
        <mesh key={idx} position={[px, 2.15, pz]}>
          <cylinderGeometry args={[0.075, 0.085, 4.3, 8]} />
          <meshStandardMaterial color="#8c5035" roughness={0.8} />
        </mesh>
      ))}

      {/* --- Striped Shamiyana Fabric Canopy Awning --- */}
      <group position={[0, 3.9, 0]}>
        {/* Sloped Roof Tent */}
        <mesh position={[0, 0.45, 0]} rotation={[0, Math.PI / 4, 0]}>
          <coneGeometry args={[3.6, 1.2, 4]} />
          <meshStandardMaterial color={stall.color} roughness={0.7} />
        </mesh>
        {/* Scalloped Fabric Valance Fringe */}
        {Array.from({ length: 8 }).map((_, idx) => {
          const x = -2.2 + idx * 0.62;
          return (
            <mesh key={idx} position={[x, -0.2, 1.55]} rotation={[0, 0, Math.PI]}>
              <coneGeometry args={[0.3, 0.35, 3]} />
              <meshStandardMaterial color={idx % 2 === 0 ? '#f1c40f' : stall.color} />
            </mesh>
          );
        })}
      </group>

      {/* --- Warm Practical Lantern Light beneath Canopy --- */}
      <group position={[0, 3.2, 0.4]}>
        <mesh>
          <sphereGeometry args={[0.16, 12, 12]} />
          <meshBasicMaterial color="#ffea75" />
        </mesh>
        <pointLight color="#ffaa33" intensity={32} distance={8} />
      </group>

      {/* --- Inside Stall Vendor NPC --- */}
      <group position={[0.4, 0.9, -0.2]}>
        {/* Body */}
        <mesh position={[0, 0.45, 0]}>
          <cylinderGeometry args={[0.22, 0.25, 0.65, 10]} />
          <meshStandardMaterial color="#d35400" roughness={0.7} />
        </mesh>
        {/* Head */}
        <mesh position={[0, 0.95, 0]}>
          <sphereGeometry args={[0.16, 12, 12]} />
          <meshStandardMaterial color="#e0ac69" />
        </mesh>
        {/* Turban */}
        <mesh position={[0, 1.05, 0]}>
          <cylinderGeometry args={[0.2, 0.18, 0.14, 12]} />
          <meshStandardMaterial color="#f39c12" />
        </mesh>
        {/* Right Arm waving */}
        <mesh ref={vendorArmRef} position={[0.28, 0.55, 0.15]}>
          <cylinderGeometry args={[0.06, 0.06, 0.45, 8]} />
          <meshStandardMaterial color="#d35400" />
        </mesh>
      </group>

      {/* --- Thematic Props on Counter --- */}
      {stall.id === 'food-stall' && (
        <group position={[0, 1.15, 1.1]}>
          <mesh position={[-1.2, 0.12, 0]}>
            <cylinderGeometry args={[0.42, 0.25, 0.22, 16]} />
            <meshStandardMaterial color="#2c3e50" metalness={0.8} />
          </mesh>
          <mesh position={[-1.2, 0.2, 0]}>
            <cylinderGeometry args={[0.39, 0.39, 0.02, 16]} />
            <meshStandardMaterial color="#e67e22" emissive="#d35400" emissiveIntensity={0.5} />
          </mesh>
          <mesh position={[0.2, 0.1, 0]}>
            <cylinderGeometry args={[0.28, 0.18, 0.16, 12]} />
            <meshStandardMaterial color="#e74c3c" />
          </mesh>
          <mesh position={[1.2, 0.18, 0]}>
            <cylinderGeometry args={[0.18, 0.22, 0.35, 12]} />
            <meshStandardMaterial color="#f39c12" metalness={0.9} roughness={0.2} />
          </mesh>
        </group>
      )}

      {stall.id === 'toy-stall' && (
        <group position={[0, 1.15, 1.1]}>
          <group ref={pinwheelRef} position={[-1.2, 0.55, 0.2]}>
            <mesh>
              <boxGeometry args={[0.45, 0.09, 0.02]} />
              <meshStandardMaterial color="#e74c3c" />
            </mesh>
            <mesh rotation={[0, 0, Math.PI / 2]}>
              <boxGeometry args={[0.45, 0.09, 0.02]} />
              <meshStandardMaterial color="#3498db" />
            </mesh>
          </group>
          {[-0.3, 0.3, 0.9].map((lx, idx) => (
            <mesh key={idx} position={[lx, 0.12, 0]} rotation={[Math.PI, 0, 0]}>
              <coneGeometry args={[0.11, 0.22, 8]} />
              <meshStandardMaterial color={['#f39c12', '#2ecc71', '#9b59b6'][idx]} />
            </mesh>
          ))}
        </group>
      )}

      {stall.id === 'ring-toss' && (
        <group position={[0, 1.15, 0.8]}>
          {[-1.2, -0.4, 0.4, 1.2].map((bx, i) =>
            [-0.2, 0.2].map((bz, j) => (
              <mesh key={`${i}-${j}`} position={[bx, 0.18, bz]}>
                <cylinderGeometry args={[0.06, 0.08, 0.36, 8]} />
                <meshStandardMaterial
                  color={(i + j) % 2 === 0 ? '#f1c40f' : '#27ae60'}
                  metalness={0.7}
                  roughness={0.2}
                />
              </mesh>
            ))
          )}
        </group>
      )}

      {stall.id === 'balloon-pop' && (
        <group position={[0, 2.0, -1.0]}>
          {[-1.5, -0.75, 0, 0.75, 1.5].map((bx, i) =>
            [0.2, 0.6, 1.0].map((by, j) => (
              <mesh key={`${i}-${j}`} position={[bx, by, 0.1]}>
                <sphereGeometry args={[0.15, 10, 10]} />
                <meshStandardMaterial
                  color={['#e74c3c', '#3498db', '#2ecc71', '#f1c40f', '#9b59b6'][(i + j) % 5]}
                  roughness={0.3}
                />
              </mesh>
            ))
          )}
        </group>
      )}

      {/* --- Signboard Floating Above Stall --- */}
      <mesh position={[0, 4.35, 0]}>
        <planeGeometry args={[4.4, 1.1]} />
        <meshBasicMaterial map={signTexture} side={THREE.DoubleSide} />
      </mesh>

      {/* --- Proximity Interaction Prompt Icon --- */}
      {isNearby && (
        <group ref={indicatorRef} position={[0, 4.6, 0]}>
          <mesh>
            <sphereGeometry args={[0.26, 12, 12]} />
            <meshBasicMaterial color="#f5b041" />
          </mesh>
          <pointLight color="#f5b041" intensity={35} distance={6} />
        </group>
      )}
    </group>
  );
};
