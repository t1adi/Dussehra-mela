import React from 'react';
import { Sparkles } from 'lucide-react';
import { useGameStore } from '../../store/useGameStore';

export const InteractionPrompt: React.FC = () => {
  const { nearbyStall, setActiveModal, markStallVisited, settings } = useGameStore();

  if (!nearbyStall) return null;

  const isHindi = settings.language === 'hi';

  const handleClick = () => {
    markStallVisited(nearbyStall.id);
    setActiveModal(nearbyStall.id as any);
  };

  return (
    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-30 pointer-events-auto animate-bounce">
      <button
        onClick={handleClick}
        className="flex items-center space-x-2.5 px-6 py-3 rounded-full bg-gradient-to-r from-[#d35400] via-[#e67e22] to-[#f39c12] hover:brightness-110 active:scale-95 text-white font-bold text-sm shadow-2xl transition-all border-2 border-amber-300/80 glow-box-gold cursor-pointer"
      >
        <span className="text-xl">{nearbyStall.icon}</span>
        <div className="flex flex-col text-left">
          <span className="text-xs font-serif text-amber-200">
            {isHindi ? nearbyStall.hindiName : nearbyStall.name}
          </span>
          <span className="text-sm font-black tracking-wide text-white flex items-center space-x-1">
            <span>{isHindi ? nearbyStall.hindiActionLabel : nearbyStall.actionLabel}</span>
            <span className="hidden sm:inline-block bg-black/40 px-1.5 py-0.5 rounded text-[10px] text-amber-300 font-mono ml-1">
              [E]
            </span>
          </span>
        </div>
        <Sparkles className="w-4 h-4 text-yellow-300 animate-spin-slow" />
      </button>
    </div>
  );
};
