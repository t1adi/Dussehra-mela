import React, { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../store/useGameStore';

export const CameraControls: React.FC = () => {
  const { camera, gl } = useThree();
  const {
    playerPosition,
    isRidingFerrisWheel,
    finalePhase,
    activeModal,
    settings
  } = useGameStore();

  const isDragging = useRef(false);
  const previousMouse = useRef({ x: 0, y: 0 });
  const orbitAngle = useRef(Math.PI);
  const pitchAngle = useRef(0.28);
  const targetLookAt = useRef(new THREE.Vector3(0, 1.5, 24));
  const currentCameraPos = useRef(new THREE.Vector3(0, 3.5, 38));
  const wheelAngle = useRef(0);
  const introProgress = useRef(0); // 0 = opening entrance shot, 1 = normal gameplay follow

  // Mouse & Touch Orbit Listeners
  useEffect(() => {
    const dom = gl.domElement;

    const onPointerDown = (e: PointerEvent) => {
      if (activeModal && activeModal !== 'ferris-wheel-ride') return;
      isDragging.current = true;
      previousMouse.current = { x: e.clientX, y: e.clientY };
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isDragging.current) return;
      const deltaX = e.clientX - previousMouse.current.x;
      const deltaY = e.clientY - previousMouse.current.y;
      previousMouse.current = { x: e.clientX, y: e.clientY };

      const sensitivity = 0.005 * (settings.cameraSensitivity || 1);
      orbitAngle.current -= deltaX * sensitivity;
      pitchAngle.current = Math.max(0.06, Math.min(1.1, pitchAngle.current + deltaY * sensitivity));
    };

    const onPointerUp = () => {
      isDragging.current = false;
    };

    dom.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);

    return () => {
      dom.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };
  }, [activeModal, gl.domElement, settings.cameraSensitivity]);

  useFrame((_, delta) => {
    // 1. Ferris Wheel Ride Mode
    if (isRidingFerrisWheel) {
      wheelAngle.current += delta * 0.28;
      const wheelCenter = new THREE.Vector3(14, 14, -28);
      const wheelRadius = 10;
      const gondolaX = wheelCenter.x + Math.sin(wheelAngle.current) * wheelRadius;
      const gondolaY = wheelCenter.y + Math.cos(wheelAngle.current) * wheelRadius;
      const gondolaZ = wheelCenter.z;

      const targetCamPos = new THREE.Vector3(gondolaX, gondolaY + 0.85, gondolaZ + 1.8);
      camera.position.lerp(targetCamPos, delta * 3.5);

      const lookTarget = new THREE.Vector3(
        0 + Math.cos(orbitAngle.current) * 22,
        3.5 + Math.sin(pitchAngle.current) * 12,
        0 + Math.sin(orbitAngle.current) * 22
      );
      targetLookAt.current.lerp(lookTarget, delta * 3.5);
      camera.lookAt(targetLookAt.current);
      return;
    }

    // 2. Ravana Dahan Dramatic Finale Camera
    if (finalePhase === 'burn' || finalePhase === 'celebrate' || finalePhase === 'arrow') {
      const finaleCamPos = new THREE.Vector3(0, 4.8, -34);
      camera.position.lerp(finaleCamPos, delta * 2.5);
      const finaleTarget = new THREE.Vector3(0, 7.5, -52);
      targetLookAt.current.lerp(finaleTarget, delta * 2.5);
      camera.lookAt(targetLookAt.current);
      return;
    }

    // 3. Cinematic Opening Entrance Transition
    if (introProgress.current < 1) {
      introProgress.current = Math.min(1, introProgress.current + delta * 0.45);
      const entrancePos = new THREE.Vector3(0, 3.8, 38);
      const playerTarget = new THREE.Vector3(playerPosition[0], playerPosition[1] + 1.5, playerPosition[2]);

      const distance = 5.8;
      const targetNormalCamPos = new THREE.Vector3(
        playerTarget.x + Math.sin(orbitAngle.current) * distance * Math.cos(pitchAngle.current),
        Math.max(1.0, playerTarget.y + distance * Math.sin(pitchAngle.current)),
        playerTarget.z + Math.cos(orbitAngle.current) * distance * Math.cos(pitchAngle.current)
      );

      const blendedPos = new THREE.Vector3().lerpVectors(entrancePos, targetNormalCamPos, introProgress.current);
      camera.position.lerp(blendedPos, delta * 6);

      const entranceLook = new THREE.Vector3(0, 4.5, 10);
      const blendedLook = new THREE.Vector3().lerpVectors(entranceLook, playerTarget, introProgress.current);
      targetLookAt.current.lerp(blendedLook, delta * 6);
      camera.lookAt(targetLookAt.current);
      return;
    }

    // 4. Standard Smooth Third-Person Orbit Follow
    const playerTarget = new THREE.Vector3(
      playerPosition[0],
      playerPosition[1] + 1.45,
      playerPosition[2]
    );
    targetLookAt.current.lerp(playerTarget, delta * 12);

    const distance = 5.8;
    const horizontalDist = distance * Math.cos(pitchAngle.current);
    const verticalDist = distance * Math.sin(pitchAngle.current);

    const camX = playerTarget.x + Math.sin(orbitAngle.current) * horizontalDist;
    const camY = Math.max(0.8, playerTarget.y + verticalDist);
    const camZ = playerTarget.z + Math.cos(orbitAngle.current) * horizontalDist;

    currentCameraPos.current.set(camX, camY, camZ);
    camera.position.lerp(currentCameraPos.current, delta * 8.5);
    camera.lookAt(targetLookAt.current);
  });

  return null;
};
