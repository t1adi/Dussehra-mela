import React, { useRef, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, useAnimations } from '@react-three/drei';
import * as THREE from 'three';
import { useGameStore } from '../store/useGameStore';
import { STALLS } from '../data/melaContent';
import { audioManager } from '../services/audioManager';

// Collision obstacles across the mela
const OBSTACLES = [
  // Stalls along left and right
  { x: -10, z: 15, radius: 3.6 },
  { x: 10, z: 15, radius: 3.6 },
  { x: -10, z: 0, radius: 3.6 },
  { x: 10, z: 0, radius: 3.6 },
  { x: -10, z: -15, radius: 3.6 },
  { x: 14, z: -28, radius: 6.8 }, // Ferris wheel base
  { x: -14, z: -32, radius: 5.8 }, // Ram Leela stage
  { x: 0, z: -52, radius: 6.5 },   // Ravana effigy plinth
  // Entrance Gate Pillars
  { x: -9, z: 32, radius: 2.0 },
  { x: 9, z: 32, radius: 2.0 }
];

export const Player: React.FC = () => {
  const groupRef = useRef<THREE.Group>(null);
  const headBoneRef = useRef<THREE.Bone | null>(null);

  const {
    activeModal,
    isRidingFerrisWheel,
    setPlayerPosition,
    setNearbyStall,
    setActiveModal,
    markStallVisited,
    joystickInput
  } = useGameStore();

  // Load rigged humanoid GLB with skeletal animations
  const { scene, animations } = useGLTF('/assets/character.glb');
  const clone = useMemo(() => scene.clone(), [scene]);
  const { actions, mixer } = useAnimations(animations, groupRef);

  const currentAction = useRef<string>('idle');
  const pos = useRef(new THREE.Vector3(0, 0, 24));
  const currentVelocity = useRef(new THREE.Vector3(0, 0, 0));
  const targetVelocity = useRef(new THREE.Vector3(0, 0, 0));
  const rotationY = useRef(Math.PI);
  const keys = useRef<{ [key: string]: boolean }>({});

  // Customize character appearance with traditional festival colors
  useEffect(() => {
    clone.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        if (mesh.material) {
          // Clone material so we don't mutate global template
          const mat = (mesh.material as THREE.Material).clone() as THREE.MeshStandardMaterial;
          if (mesh.name.toLowerCase().includes('body') || mesh.name.toLowerCase().includes('shirt')) {
            mat.color = new THREE.Color('#d35400'); // Festive saffron kurta
            mat.roughness = 0.6;
          } else if (mesh.name.toLowerCase().includes('joint') || mesh.name.toLowerCase().includes('pant')) {
            mat.color = new THREE.Color('#2c3e50'); // Deep festive dhoti
            mat.roughness = 0.7;
          }
          mesh.material = mat;
        }
      }
      // Locate head bone to parent accessories
      if ((child as THREE.Bone).isBone && child.name.toLowerCase().includes('head')) {
        headBoneRef.current = child as THREE.Bone;
      }
    });
  }, [clone]);

  // Initial animation
  useEffect(() => {
    if (actions && actions['idle']) {
      actions['idle'].reset().fadeIn(0.3).play();
      currentAction.current = 'idle';
    }
  }, [actions]);

  // Key listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keys.current[e.code] = true;
      if ((e.code === 'KeyE' || e.code === 'Space' || e.code === 'Enter') && !activeModal && !isRidingFerrisWheel) {
        const nearby = useGameStore.getState().nearbyStall;
        if (nearby) {
          markStallVisited(nearby.id);
          setActiveModal(nearby.id as any);
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keys.current[e.code] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [activeModal, isRidingFerrisWheel, markStallVisited, setActiveModal]);

  useFrame((_, delta) => {
    if (!groupRef.current || isRidingFerrisWheel) return;

    // Movement input calculation
    let inputX = 0;
    let inputZ = 0;

    if (!activeModal) {
      if (keys.current['KeyW'] || keys.current['ArrowUp']) inputZ -= 1;
      if (keys.current['KeyS'] || keys.current['ArrowDown']) inputZ += 1;
      if (keys.current['KeyA'] || keys.current['ArrowLeft']) inputX -= 1;
      if (keys.current['KeyD'] || keys.current['ArrowRight']) inputX += 1;

      if (joystickInput.active) {
        inputX += joystickInput.x;
        inputZ += joystickInput.y;
      }
    }

    const inputMag = Math.hypot(inputX, inputZ);
    const isMoving = inputMag > 0.08;
    const isSprinting = keys.current['ShiftLeft'] || keys.current['ShiftRight'] || inputMag > 0.85;

    // Target speed: 4.6 m/s walk, 7.8 m/s sprint
    const targetSpeed = isMoving ? (isSprinting ? 7.8 : 4.6) : 0;

    if (isMoving) {
      const normX = inputX / inputMag;
      const normZ = inputZ / inputMag;
      targetVelocity.current.set(normX * targetSpeed, 0, normZ * targetSpeed);

      // Smooth turning towards movement vector
      const targetAngle = Math.atan2(normX, normZ);
      const angleDiff = Math.atan2(
        Math.sin(targetAngle - rotationY.current),
        Math.cos(targetAngle - rotationY.current)
      );
      rotationY.current += angleDiff * 14 * delta;
    } else {
      targetVelocity.current.set(0, 0, 0);
    }

    // Natural acceleration and braking (smooth damping)
    const accelRate = isMoving ? 12 : 16;
    currentVelocity.current.lerp(targetVelocity.current, Math.min(1, accelRate * delta));

    // Animation state transitions with smooth cross-fading
    let desiredAction = 'idle';
    const currentSpeed = currentVelocity.current.length();

    if (currentSpeed > 5.2) {
      desiredAction = 'run';
    } else if (currentSpeed > 0.3) {
      desiredAction = 'walk';
    }

    if (desiredAction !== currentAction.current && actions) {
      const prevActionObj = actions[currentAction.current];
      const nextActionObj = actions[desiredAction];

      if (nextActionObj) {
        nextActionObj.reset();
        // Adjust animation playback rate to match movement speed
        if (desiredAction === 'walk') {
          nextActionObj.timeScale = currentSpeed / 3.8;
        } else if (desiredAction === 'run') {
          nextActionObj.timeScale = currentSpeed / 6.5;
        }
        if (prevActionObj) {
          prevActionObj.crossFadeTo(nextActionObj, 0.22, true);
        }
        nextActionObj.play();
        currentAction.current = desiredAction;
      }
    } else if (actions && actions[currentAction.current]) {
      // Dynamic speed sync
      if (currentAction.current === 'walk') {
        actions['walk']!.timeScale = Math.max(0.6, currentSpeed / 3.8);
      } else if (currentAction.current === 'run') {
        actions['run']!.timeScale = Math.max(0.8, currentSpeed / 6.5);
      }
    }

    // Integrate position
    const nextX = pos.current.x + currentVelocity.current.x * delta;
    const nextZ = pos.current.z + currentVelocity.current.z * delta;

    // World boundary clamping
    const clampedX = Math.max(-23, Math.min(23, nextX));
    const clampedZ = Math.max(-62, Math.min(33, nextZ));

    // Collision avoidance with obstacles
    let collided = false;
    for (const obs of OBSTACLES) {
      const dist = Math.hypot(clampedX - obs.x, clampedZ - obs.z);
      if (dist < obs.radius) {
        collided = true;
        const pushAngle = Math.atan2(clampedZ - obs.z, clampedX - obs.x);
        pos.current.x = obs.x + Math.cos(pushAngle) * (obs.radius + 0.05);
        pos.current.z = obs.z + Math.sin(pushAngle) * (obs.radius + 0.05);
        break;
      }
    }

    if (!collided) {
      pos.current.x = clampedX;
      pos.current.z = clampedZ;
    }

    // Apply transformation
    groupRef.current.position.set(pos.current.x, 0, pos.current.z);
    groupRef.current.rotation.y = rotationY.current;

    // Report position to store for UI mini-map, compass, and spatial audio
    setPlayerPosition([pos.current.x, 0, pos.current.z], rotationY.current);
    audioManager.updateSpatialAmbience([pos.current.x, 0, pos.current.z]);

    // Proximity check with stalls
    let closestStall = null;
    let closestDist = 4.5;
    for (const stall of STALLS) {
      const d = Math.hypot(pos.current.x - stall.position[0], pos.current.z - stall.position[2]);
      if (d < closestDist) {
        closestDist = d;
        closestStall = stall;
      }
    }
    setNearbyStall(closestStall);
  });

  return (
    <group ref={groupRef} position={[0, 0, 24]}>
      {/* Ground Contact Shadow */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <circleGeometry args={[0.5, 20]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.35} />
      </mesh>

      {/* Rigged Skeletal Character Model (Scaled to normal humanoid proportions) */}
      <primitive object={clone} scale={[1.1, 1.1, 1.1]} position={[0, 0, 0]} />

      {/* Royal Indian Festival Pagri / Turban attached above head */}
      <group position={[0, 1.82, 0]}>
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.22, 0.2, 0.16, 16]} />
          <meshStandardMaterial color="#e67e22" roughness={0.6} />
        </mesh>
        {/* Golden Kalgi / Brooch */}
        <mesh position={[0, 0.04, 0.2]}>
          <sphereGeometry args={[0.04, 8, 8]} />
          <meshStandardMaterial color="#f1c40f" metalness={0.9} roughness={0.2} />
        </mesh>
        {/* Plume feather */}
        <mesh position={[0, 0.16, 0.18]} rotation={[0.2, 0, 0]}>
          <coneGeometry args={[0.035, 0.16, 6]} />
          <meshStandardMaterial color="#1abc9c" />
        </mesh>
      </group>
    </group>
  );
};
