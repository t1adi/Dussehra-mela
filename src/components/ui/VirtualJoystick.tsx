import React, { useRef, useState, useEffect } from 'react';
import { useGameStore } from '../../store/useGameStore';

export const VirtualJoystick: React.FC = () => {
  const {
    setJoystickInput,
    nearbyStall,
    setActiveModal,
    markStallVisited,
    settings,
    activeModal,
    isRidingFerrisWheel
  } = useGameStore();

  const joystickRef = useRef<HTMLDivElement>(null);
  const [knobPos, setKnobPos] = useState({ x: 0, y: 0 });
  const [isTouchActive, setIsTouchActive] = useState(false);
  const touchId = useRef<number | null>(null);

  const isHindi = settings.language === 'hi';

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (touchId.current !== null) return;
    const touch = e.changedTouches[0];
    touchId.current = touch.identifier;
    setIsTouchActive(true);
    handleTouchMove(e);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (touchId.current === null || !joystickRef.current) return;
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === touchId.current) {
        const rect = joystickRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        let deltaX = touch.clientX - centerX;
        let deltaY = touch.clientY - centerY;

        const maxDist = rect.width / 2;
        const dist = Math.hypot(deltaX, deltaY);

        if (dist > maxDist) {
          deltaX = (deltaX / dist) * maxDist;
          deltaY = (deltaY / dist) * maxDist;
        }

        setKnobPos({ x: deltaX, y: deltaY });
        // Normalize between -1 and 1
        setJoystickInput(deltaX / maxDist, deltaY / maxDist, true);
        break;
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === touchId.current) {
        touchId.current = null;
        setIsTouchActive(false);
        setKnobPos({ x: 0, y: 0 });
        setJoystickInput(0, 0, false);
        break;
      }
    }
  };

  // Hide virtual controls if an interactive modal or ride is open
  if (activeModal && activeModal !== 'ferris-wheel-ride') return null;

  return (
    <div className="fixed inset-x-0 bottom-6 z-30 pointer-events-none flex justify-between items-end px-6 sm:hidden">
      {/* Virtual Joystick Base */}
      <div
        ref={joystickRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
        className="relative w-28 h-28 rounded-full bg-black/40 backdrop-blur-md border-2 border-amber-500/30 flex items-center justify-center pointer-events-auto touch-none shadow-xl"
      >
        {/* Nipple knob */}
        <div
          style={{
            transform: `translate(${knobPos.x}px, ${knobPos.y}px)`
          }}
          className={`w-12 h-12 rounded-full border-2 transition-transform duration-75 shadow-md flex items-center justify-center ${
            isTouchActive
              ? 'bg-amber-500 border-yellow-300 scale-95 shadow-[0_0_12px_rgba(243,156,18,0.8)]'
              : 'bg-amber-600/70 border-amber-400'
          }`}
        >
          <div className="w-4 h-4 rounded-full bg-white/40" />
        </div>
      </div>

      {/* Action / Interact Button on Right */}
      {nearbyStall && !isRidingFerrisWheel && (
        <button
          onTouchStart={() => {
            markStallVisited(nearbyStall.id);
            setActiveModal(nearbyStall.id as any);
          }}
          className="w-18 h-18 rounded-full bg-gradient-to-r from-[#d35400] to-[#f39c12] border-2 border-yellow-300 shadow-2xl flex flex-col items-center justify-center pointer-events-auto active:scale-90 transition-transform text-white font-bold text-xs"
        >
          <span className="text-xl">{nearbyStall.icon}</span>
          <span className="text-[10px] uppercase font-mono mt-0.5">
            {isHindi ? 'प्रवेश' : 'Open'}
          </span>
        </button>
      )}
    </div>
  );
};
