import React, { useState } from 'react';
import { X, Drama, ChevronRight, Volume2, Sparkles } from 'lucide-react';
import { useGameStore } from '../../store/useGameStore';
import { RAM_LEELA_SCENES } from '../../data/melaContent';
import { audioManager } from '../../services/audioManager';

export const RamLeelaModal: React.FC = () => {
  const { setActiveModal, completeQuest, settings } = useGameStore();
  const [currentAct, setCurrentAct] = useState(0);

  const isHindi = settings.language === 'hi';
  const scene = RAM_LEELA_SCENES[currentAct];

  const handleNextAct = () => {
    audioManager.playBell();
    if (currentAct < RAM_LEELA_SCENES.length - 1) {
      setCurrentAct((a) => a + 1);
    } else {
      audioManager.playCheer();
      completeQuest('leela-quest');
      setActiveModal(null);
    }
  };

  const playConchSound = () => {
    audioManager.playConch();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md select-none animate-fadeIn">
      <div className="relative w-full max-w-xl bg-gradient-to-b from-[#29111c] to-[#12080d] rounded-2xl border-2 border-[#c0392b] shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-gradient-to-r from-[#962d22] to-[#c0392b] text-white">
          <div className="flex items-center space-x-2.5">
            <Drama className="w-6 h-6 text-amber-300" />
            <div>
              <h2 className="text-lg font-bold font-serif">
                {isHindi ? 'रामलीला रंगमंच' : 'Ram Leela Rangmanch'}
              </h2>
              <p className="text-xs text-amber-200">
                {isHindi ? `दृश्य ${currentAct + 1} / ${RAM_LEELA_SCENES.length}` : `Scene ${currentAct + 1} of ${RAM_LEELA_SCENES.length}`}
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveModal(null)}
            className="p-1.5 rounded-full bg-black/30 hover:bg-black/50 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stage Content */}
        <div className="p-6 flex flex-col items-center text-center">
          {/* Act Indicator */}
          <div className="flex items-center space-x-2 mb-4">
            {RAM_LEELA_SCENES.map((_, idx) => (
              <div
                key={idx}
                className={`w-3 h-3 rounded-full transition-all ${
                  idx === currentAct
                    ? 'bg-amber-400 scale-125 shadow-[0_0_10px_rgba(245,176,65,0.8)]'
                    : 'bg-gray-600'
                }`}
              />
            ))}
          </div>

          <span className="text-xs uppercase tracking-widest text-amber-400 font-bold mb-1">
            {scene.speakerRole}
          </span>
          <h3 className="text-xl font-bold font-serif text-amber-100 mb-2">
            {isHindi ? scene.hindiTitle : scene.title}
          </h3>

          <div className="w-full bg-[#1c0a13] border border-amber-900/40 rounded-xl p-5 mb-6 relative">
            <div className="text-amber-400 font-semibold text-sm mb-2">
              {scene.speaker}
            </div>
            <p className="text-sm sm:text-base text-gray-200 italic leading-relaxed">
              "{isHindi ? scene.hindiDialogue : scene.dialogue}"
            </p>
          </div>

          <div className="flex items-center space-x-3 w-full">
            <button
              onClick={playConchSound}
              className="px-4 py-2.5 rounded-xl bg-amber-900/50 hover:bg-amber-800/60 border border-amber-600/40 text-amber-200 text-xs font-semibold flex items-center space-x-1.5 transition-all"
            >
              <Volume2 className="w-4 h-4 text-amber-400" />
              <span>{isHindi ? 'शंख ध्वनि' : 'Sound Conch'}</span>
            </button>

            <button
              onClick={handleNextAct}
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#c0392b] to-[#e67e22] hover:brightness-110 active:scale-95 text-white font-bold text-sm shadow-lg flex items-center justify-center space-x-2 transition-all"
            >
              <span>
                {currentAct < RAM_LEELA_SCENES.length - 1
                  ? isHindi
                    ? 'अगला दृश्य'
                    : 'Next Scene'
                  : isHindi
                  ? 'समाप्त करें (प्रसाद ग्रहण करें)'
                  : 'Complete & Applaud'}
              </span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
