import React, { useState, useEffect } from 'react';
import { Sparkles, Compass, Volume2 } from 'lucide-react';
import { useGameStore } from '../../store/useGameStore';

export const LoadingScreen: React.FC = () => {
  const { isLoaded, setLoaded, startGame, settings } = useGameStore();
  const [progress, setProgress] = useState(0);
  const [loadingTextIndex, setLoadingTextIndex] = useState(0);

  const isHindi = settings.language === 'hi';

  const loadingPhrases = isHindi
    ? [
        'दीयों की रोशनी सजाई जा रही है...',
        'रंग-बिरंगी लड़ी और तोरण बांधे जा रहे हैं...',
        'गरमा-गरम जलेबी और चाट तैयार हो रही है...',
        'आकाश झूले की चरखी घूम रही है...',
        'रामलीला का पर्दा उठने को तैयार है...',
        'मेला तैयार है! आइए प्रवेश करें!'
      ]
    : [
        'Lighting glowing earthen diyas...',
        'Stringing colorful fairy lights and festive torans...',
        'Frying crisp hot jalebis and spiced chaat...',
        'Testing the grand spinning Ferris wheel...',
        'Preparing the sacred Ram Leela stage...',
        'The festival is ready! Welcome!'
      ];

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setLoaded(true);
          return 100;
        }
        const next = prev + Math.floor(Math.random() * 8) + 4;
        return next > 100 ? 100 : next;
      });
    }, 120);

    return () => clearInterval(timer);
  }, [setLoaded]);

  useEffect(() => {
    const textTimer = setInterval(() => {
      setLoadingTextIndex((idx) => (idx + 1) % loadingPhrases.length);
    }, 850);
    return () => clearInterval(textTimer);
  }, [loadingPhrases.length]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-between p-6 sm:p-12 bg-gradient-to-b from-[#0a0f16] via-[#111923] to-[#0a0f16] select-none text-[#fdebd0]">
      {/* Decorative Top Garland */}
      <div className="flex items-center space-x-3 text-amber-400 opacity-70">
        <span>🪔</span>
        <span className="text-xs uppercase tracking-widest font-semibold">
          {isHindi ? 'दशहरा एवं दीपावली महोत्सव' : 'Dussehra & Diwali Festival Fair'}
        </span>
        <span>🪔</span>
      </div>

      {/* Center Branding & Loading */}
      <div className="flex flex-col items-center text-center max-w-lg w-full">
        {/* Animated Glowing Diya */}
        <div className="relative mb-6">
          <div className="w-20 h-20 rounded-full bg-amber-500/10 border-2 border-amber-400/40 flex items-center justify-center glow-box-gold">
            <span className="text-4xl animate-diya">🪔</span>
          </div>
          <Sparkles className="w-6 h-6 text-yellow-300 absolute -top-1 -right-1 animate-spin-slow" />
        </div>

        {/* Project Titles */}
        <h1 className="text-3xl sm:text-5xl font-black font-festive tracking-tight mb-2 text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-orange-300 to-amber-100 glow-gold">
          {isHindi ? 'मेला चलोगे?' : 'Mela Chaloge?'}
        </h1>
        <p className="text-sm sm:text-base font-serif italic text-amber-200/90 mb-8 max-w-md">
          {isHindi
            ? 'एक शाम, बचपन के नाम · 3D भारतीय मेला अनुभव'
            : 'An interactive 3D Indian festival fair in your browser'}
        </p>

        {/* Progress Bar */}
        <div className="w-full max-w-xs mb-3">
          <div className="flex justify-between text-xs text-amber-200/80 mb-1.5 font-mono">
            <span>{loadingPhrases[loadingTextIndex]}</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full h-2.5 bg-black/60 rounded-full overflow-hidden border border-amber-600/40 p-0.5">
            <div
              style={{ width: `${progress}%` }}
              className="h-full bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-400 rounded-full transition-all duration-150 shadow-[0_0_12px_rgba(243,156,18,0.8)]"
            />
          </div>
        </div>

        {/* Start Exploring Button (Enabled once loaded) */}
        {progress >= 100 && (
          <button
            onClick={startGame}
            className="mt-6 px-8 py-3.5 rounded-full bg-gradient-to-r from-[#d35400] via-[#e67e22] to-[#f39c12] hover:brightness-110 active:scale-95 text-white font-bold text-base shadow-2xl transition-all border border-amber-300/60 animate-bounce flex items-center space-x-2"
          >
            <Compass className="w-5 h-5 text-white" />
            <span>{isHindi ? 'मेले में प्रवेश करें →' : 'Enter the Mela →'}</span>
          </button>
        )}
      </div>

      {/* Footer Info */}
      <div className="flex flex-col items-center space-y-1 text-center text-xs text-amber-200/60">
        <p>{isHindi ? 'कंप्यूटर पर WASD या तीर कुंजियों से चलें • मोबाइल पर टच जॉयस्टिक का उपयोग करें' : 'Use WASD or Arrow Keys to walk • Touch Joystick on Mobile'}</p>
        <p className="text-[11px] text-amber-200/40">3D WebGL Fairground • Audio Enabled</p>
      </div>
    </div>
  );
};
