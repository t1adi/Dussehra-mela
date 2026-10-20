import React, { useMemo } from 'react';
import * as THREE from 'three';
import { EntranceGate } from './EntranceGate';
import { StallMesh } from './StallMesh';
import { FerrisWheel } from './FerrisWheel';
import { RamLeelaStage } from './RamLeelaStage';
import { RavanaEffigy } from './RavanaEffigy';
import { NPCVisitors } from './NPCVisitors';
import { StringLights } from './StringLights';
import { Player } from '../game/Player';
import { CameraControls } from '../game/CameraControls';
import { STALLS } from '../data/melaContent';
import { useGameStore } from '../store/useGameStore';

export const MelaWorld: React.FC = () => {
  const { settings } = useGameStore();

  // Procedural Dusty Earth Ground Canvas Texture (Authentic Fairground Soil)
  const groundTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = '#6b5643';
    ctx.fillRect(0, 0, 256, 256);

    let seed = 183;
    for (let i = 0; i < 7000; i++) {
      seed = (seed * 16807) % 2147483647;
      const x = seed % 256;
      seed = (seed * 16807) % 2147483647;
      const y = seed % 256;
      ctx.fillStyle = i % 2 === 0 ? '#79634d' : '#594a3b';
      ctx.fillRect(x, y, (i % 4) + 1, 1);
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(28, 38);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, []);

  // Night Starfield
  const { starPositions, starColors } = useMemo(() => {
    const count = 500;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = 95 + Math.random() * 25;

      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = Math.abs(r * Math.sin(phi) * Math.sin(theta)) + 12;
      positions[i * 3 + 2] = r * Math.cos(phi);

      colors[i * 3] = 0.95 + Math.random() * 0.05;
      colors[i * 3 + 1] = 0.88 + Math.random() * 0.12;
      colors[i * 3 + 2] = 0.75 + Math.random() * 0.25;
    }

    return { starPositions: positions, starColors: colors };
  }, []);

  return (
    <>
      {/* --- Environment Atmosphere & Night Lighting --- */}
      <color attach="background" args={['#101b2b']} />
      <fog attach="fog" args={['#182333', 30, 110]} />

      {/* Hemispherical Twilight Dome Light (Cool Blue Sky + Warm Amber Ground Bounce) */}
      <hemisphereLight args={['#bdc5db', '#a67a49', 2.2]} />

      {/* Directional Festival Moonlight */}
      <directionalLight
        position={[-25, 55, 15]}
        intensity={1.3}
        color="#c6c8df"
        castShadow={settings.graphicsQuality === 'high'}
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-35}
        shadow-camera-right={35}
        shadow-camera-top={35}
        shadow-camera-bottom={-35}
      />

      {/* Ambient Ground Festival Glow */}
      <ambientLight intensity={settings.graphicsQuality === 'low' ? 0.7 : 0.45} color="#e0ac69" />

      {/* --- Night Sky Starfield & Glowing Crescent Moon --- */}
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={starPositions.length / 3}
            array={starPositions}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-color"
            count={starColors.length / 3}
            array={starColors}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial size={1.3} vertexColors transparent opacity={0.88} sizeAttenuation={false} />
      </points>

      {/* Crescent Moon with Celestial Point Light */}
      <group position={[-35, 60, -65]}>
        <mesh>
          <sphereGeometry args={[4.5, 24, 24]} />
          <meshBasicMaterial color="#fff4cc" />
        </mesh>
        <pointLight color="#fff8dd" intensity={40} distance={140} />
      </group>

      {/* --- Dusty Fairground Ground Plane --- */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, -15]} receiveShadow>
        <planeGeometry args={[125, 145]} />
        <meshStandardMaterial map={groundTexture} roughness={1.0} color="#b6a38b" />
      </mesh>

      {/* Central Festive Promenade Pathway */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.012, -13]} receiveShadow>
        <planeGeometry args={[15, 100]} />
        <meshStandardMaterial color="#9d846c" roughness={0.9} transparent opacity={0.4} />
      </mesh>

      {/* Street Light Poles along the Central Avenue */}
      {[26, 13, 0, -13, -26, -39].map((z, idx) => (
        <React.Fragment key={idx}>
          {[-9, 9].map((x) => (
            <group key={x} position={[x, 0, z]}>
              <mesh position={[0, 3.9, 0]}>
                <cylinderGeometry args={[0.09, 0.09, 7.8, 8]} />
                <meshStandardMaterial color="#714832" roughness={0.8} />
              </mesh>
              {/* Golden Pole Cap */}
              <mesh position={[0, 7.8, 0]}>
                <boxGeometry args={[0.3, 0.15, 0.3]} />
                <meshStandardMaterial color="#352c23" />
              </mesh>
              {/* Warm Street Lamp */}
              <pointLight position={[0, 7.4, 0]} color="#ffaa33" intensity={25} distance={10} />
            </group>
          ))}
        </React.Fragment>
      ))}

      {/* --- Landmarks & Stalls --- */}
      <EntranceGate />

      {STALLS.filter(s => !['ferris-wheel', 'ram-leela', 'finale'].includes(s.id)).map((stall) => (
        <StallMesh key={stall.id} stall={stall} />
      ))}

      <FerrisWheel />
      <RamLeelaStage />
      <RavanaEffigy />
      <NPCVisitors />
      <StringLights />

      {/* --- 3D Character Avatar & Controller --- */}
      <Player />

      {/* --- Camera Controller --- */}
      <CameraControls />
    </>
  );
};
