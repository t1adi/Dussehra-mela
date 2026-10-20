import React, { useState, useEffect } from 'react';
import { Camera, LogOut, Compass, Sparkles } from 'lucide-react';
import { useGameStore } from '../../store/useGameStore';
import { audioManager } from '../../services/audioManager';

export const FerrisWheelRideOverlay: React.FC = () => {
  const { stopFerrisRide, settings } = useGameStore();
  const [altitude, setAltitude] = useState(14);
  const [showPhotoFlash, setShowPhotoFlash] = useState(false);

  const isHindi = settings.language === 'hi';

  // Oscillate altitude representation as wheel revolves
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now() * 0.001;
      const h = Math.round(14 + Math.sin(now * 0.4) * 9.5);
      setAltitude(h);
    }, 200);
    return () => clearInterval(interval);
  }, []);

  const takePhoto = () => {
    audioManager.playClick();
    setShowPhotoFlash(true);
    setTimeout(() => {
      setShowPhotoFlash(false);
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-40 pointer-events-none flex flex-col justify-between p-4 sm:p-6 animate-fadeIn">
      {/* Photo Flash Effect */}
      {showPhotoFlash && (
        <div className="fixed inset-0 bg-white z-50 pointer-events-none animate-ping" />
      )}

      {/* Top Status */}
      <div className="flex items-center justify-between w-full max-w-lg mx-auto bg-black/60 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-sky-500/40 shadow-xl pointer-events-auto">
        <div className="flex items-center space-x-2.5 text-sky-300">
          <Compass className="w-5 h-5 text-sky-400 animate-spin-slow" />
          <div>
            <h3 className="text-sm font-bold font-serif text-white">
              {isHindi ? 'आकाश झूला (विशाल चरखी)' : 'Aakash Jhula (Giant Wheel)'}
            </h3>
            <p className="text-[11px] text-sky-200">
              {isHindi ? `ऊंचाई: जमीन से ${altitude} मीटर ऊपर` : `Altitude: ${altitude} meters above the mela`}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={takePhoto}
            className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-sky-600/60 hover:bg-sky-500 text-white text-xs font-semibold shadow transition-all active:scale-95"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>{isHindi ? 'फोटो लें' : 'Snapshot'}</span>
          </button>
        </div>
      </div>

      {/* Center Guidance Hint */}
      <div className="self-center bg-black/50 backdrop-blur-sm border border-white/20 text-white px-4 py-2 rounded-full text-xs flex items-center space-x-2 animate-pulse">
        <Sparkles className="w-4 h-4 text-yellow-300" />
        <span>
          {isHindi
            ? '३६०° अद्भुत नज़ारे के लिए स्क्रीन को ड्रैग करें'
            : 'Drag mouse or swipe screen for 360° panoramic night view'}
        </span>
      </div>

      {/* Bottom Controls */}
      <div className="flex justify-center w-full pointer-events-auto pb-4">
        <button
          onClick={stopFerrisRide}
          className="flex items-center space-x-2 px-6 py-3 rounded-full bg-gradient-to-r from-red-600 to-rose-700 hover:brightness-110 active:scale-95 text-white font-bold text-sm shadow-2xl transition-all border border-red-400/50"
        >
          <LogOut className="w-4 h-4" />
          <span>{isHindi ? 'झूले से उतरें' : 'Exit Giant Wheel'}</span>
        </button>
      </div>
    </div>
  );
};
