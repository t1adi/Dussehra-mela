import React, { useState } from 'react';
import { MapPin, Navigation, Eye, EyeOff } from 'lucide-react';
import { useGameStore } from '../../store/useGameStore';
import { STALLS } from '../../data/melaContent';

export const MiniMap: React.FC = () => {
  const { playerPosition, playerRotation, settings } = useGameStore();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const isHindi = settings.language === 'hi';

  // Map coordinate conversion
  // World bounds: X from -25 to +25, Z from -65 to +35
  // Map dimensions: 140px x 140px
  const mapX = (x: number) => ((x + 25) / 50) * 100;
  const mapZ = (z: number) => ((35 - z) / 100) * 100;

  const playerMapX = mapX(playerPosition[0]);
  const playerMapY = mapZ(playerPosition[2]);
  const playerRotDeg = (playerRotation * 180) / Math.PI;

  return (
    <div className="fixed bottom-4 left-4 z-30 pointer-events-auto">
      {isCollapsed ? (
        <button
          onClick={() => setIsCollapsed(false)}
          className="p-2.5 rounded-full bg-black/70 backdrop-blur-md border border-amber-500/40 text-amber-300 hover:text-white shadow-lg transition-all"
          title={isHindi ? 'नक्शा खोलें' : 'Open Mini-map'}
        >
          <Navigation className="w-5 h-5" />
        </button>
      ) : (
        <div className="relative w-36 h-40 sm:w-44 sm:h-48 bg-black/75 backdrop-blur-md border-2 border-amber-600/50 rounded-2xl p-2 shadow-2xl flex flex-col justify-between overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between text-[11px] text-amber-200 border-b border-amber-900/40 pb-1 mb-1">
            <span className="font-bold font-serif">{isHindi ? 'मेला नक्शा' : 'Mela Radar'}</span>
            <button
              onClick={() => setIsCollapsed(true)}
              className="text-gray-400 hover:text-white text-xs"
            >
              ✕
            </button>
          </div>

          {/* Radar Screen */}
          <div className="relative flex-1 bg-[#0b1016]/90 rounded-lg overflow-hidden border border-amber-950">
            {/* Grid Lines */}
            <div className="absolute inset-0 grid grid-cols-4 grid-rows-4 opacity-10 border border-amber-400" />

            {/* Central Pathway line */}
            <div className="absolute left-[45%] right-[45%] top-[10%] bottom-[5%] bg-amber-500/15 rounded" />

            {/* Entrance Gate Indicator at bottom */}
            <div
              style={{ left: `${mapX(0)}%`, top: `${mapZ(32)}%` }}
              className="absolute -translate-x-1/2 -translate-y-1/2 w-8 h-1 bg-amber-400/60 rounded"
              title="Pravesh Dwar (Gate)"
            />

            {/* Stall Icons */}
            {STALLS.map((stall) => (
              <div
                key={stall.id}
                style={{
                  left: `${mapX(stall.position[0])}%`,
                  top: `${mapZ(stall.position[2])}%`
                }}
                className="absolute -translate-x-1/2 -translate-y-1/2 text-[10px] drop-shadow"
                title={isHindi ? stall.hindiName : stall.name}
              >
                {stall.icon}
              </div>
            ))}

            {/* Player Blip with Direction Arrow */}
            <div
              style={{
                left: `${playerMapX}%`,
                top: `${playerMapY}%`,
                transform: `translate(-50%, -50%) rotate(${playerRotDeg}deg)`
              }}
              className="absolute z-10 transition-all duration-75"
            >
              <div className="w-0 h-0 border-x-4 border-x-transparent border-b-8 border-b-amber-400 drop-shadow-[0_0_6px_rgba(245,176,65,1)]" />
            </div>
          </div>

          {/* Legend */}
          <div className="text-[9px] text-amber-300/70 text-center pt-1 font-mono">
            {isHindi ? 'आप (तीर) • स्टॉल' : 'You (Arrow) • Stalls'}
          </div>
        </div>
      )}
    </div>
  );
};
